"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUploader } from "@/components/file-uploader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Users, Bell, Tag, Info, X, Plus } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { researchAreas } from "@/lib/research-areas"
import { v4 as uuidv4 } from 'uuid'
import { useAuth } from "@/components/auth-provider"

interface SettingsDialogProps {
  lab: any
  onLabUpdated?: (lab: any) => void
}

// Category to badge class mapping (from app/explore/page.tsx and globals.css)
const scienceCategoryBadgeClass: Record<string, string> = {
  neuroscience: "badge-neuroscience",
  ai: "badge-ai",
  biology: "badge-biology",
  chemistry: "badge-chemistry",
  physics: "badge-physics",
  medicine: "badge-medicine",
  psychology: "badge-psychology",
  engineering: "badge-engineering",
  mathematics: "badge-mathematics",
  environmental: "badge-environmental",
  astronomy: "badge-astronomy",
  geology: "badge-geology",
  "brain-mapping": "badge-neuroscience",
  "cognitive-science": "badge-psychology",
  "quantum-mechanics": "badge-physics",
  "particle-physics": "badge-physics",
  genomics: "badge-biology",
  bioinformatics: "badge-biology",
  ethics: "badge-psychology",
  "computer-science": "badge-ai",
  "climate-science": "badge-environmental",
  "data-analysis": "badge-mathematics",
  "molecular-biology": "badge-biology",
  biochemistry: "badge-chemistry",
  astrophysics: "badge-astronomy",
  cosmology: "badge-astronomy",
  "clinical-research": "badge-medicine",
  biotechnology: "badge-biology",
  "medical-imaging": "badge-medicine",
  meteorology: "badge-environmental",
  "machine-learning": "badge-ai",
  optimization: "badge-mathematics",
  "data-processing": "badge-mathematics",
  "data-visualization": "badge-mathematics",
  methodology: "badge-default",
  computing: "badge-ai",
  evaluation: "badge-default",
  innovation: "badge-default",
  "research-funding": "badge-default",
  governance: "badge-default",
  mitigation: "badge-environmental",
  "diversity-studies": "badge-default",
  "public-perception": "badge-psychology",
  "citizen-science": "badge-default",
  "bias-studies": "badge-ai",
}

export function SettingsDialog({ lab, onLabUpdated }: SettingsDialogProps) {
  const [labName, setLabName] = useState(lab.labName || "")
  const [description, setDescription] = useState(lab.description || "")
  const [profilePic, setProfilePic] = useState(lab.profilePic || "")
  const [newProfilePicFile, setNewProfilePicFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedTags, setSelectedTags] = useState(["neuroscience", "brain-mapping", "cognitive-science"])

  // Admins state
  const [admins, setAdmins] = useState<any[]>([])
  const [adminsLoading, setAdminsLoading] = useState(true)
  const [adminError, setAdminError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [addLoading, setAddLoading] = useState<string | null>(null)
  const [removeLoading, setRemoveLoading] = useState<string | null>(null)

  // Tags (categories) state
  const [labCategories, setLabCategories] = useState<string[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)
  const [addCategoryLoading, setAddCategoryLoading] = useState(false)
  const [removeCategoryLoading, setRemoveCategoryLoading] = useState<string | null>(null)

  const { user } = useAuth();

  const handleTagRemove = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove))
  }

  const handleTagAdd = (newTag: string) => {
    if (!selectedTags.includes(newTag)) {
      setSelectedTags([...selectedTags, newTag])
    }
  }

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewProfilePicFile(file)
      setProfilePic(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    let profilePicUrl = profilePic
    try {
      // If a new profile pic is selected, upload it
      if (newProfilePicFile) {
        const fileExt = newProfilePicFile.name.split('.').pop()
        const uniqueSuffix = Date.now()
        const fileName = `${lab.labId}-${uniqueSuffix}.${fileExt}`
        console.log("Uploading profile pic (unique):", fileName, newProfilePicFile.size, newProfilePicFile.type)
        const uploadResponse = await supabase.storage.from("lab-profile-pics").upload(fileName, newProfilePicFile)
        console.log("Upload response (unique):", uploadResponse)
        if (uploadResponse.error) {
          toast({ title: "Error uploading profile pic", description: uploadResponse.error.message || String(uploadResponse.error), variant: "destructive" })
          setIsSaving(false)
          return
        }
        const { data: publicUrlData } = supabase.storage.from("lab-profile-pics").getPublicUrl(fileName)
        console.log("Public URL data:", publicUrlData)
        if (!publicUrlData?.publicUrl) {
          toast({ title: "Error getting public URL", description: "No public URL returned", variant: "destructive" })
          setIsSaving(false)
          return
        }
        profilePicUrl = publicUrlData.publicUrl
      }
      // Update the labs table
      const { error } = await supabase
        .from("labs")
        .update({ labName, description, profilePic: profilePicUrl })
        .eq("labId", lab.labId)
      if (error) throw error
      toast({ title: "Lab updated", description: "Lab details saved successfully." })
      if (onLabUpdated) onLabUpdated({ ...lab, labName, description, profilePic: profilePicUrl })
    } catch (err: any) {
      toast({ title: "Error updating lab", description: err.message || String(err), variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  // Replace fetchAdmins with logic that fetches founders from labMembers (role 'founder'), admins from both labMembers (role 'admin') and labAdmins, deduplicates, fetches profiles, and sets role labels.
  const fetchAdmins = async () => {
    setAdminsLoading(true)
    setAdminError(null)
    try {
      // 1. Fetch founders and admins from labMembers
      const { data: memberRows, error: memberError } = await supabase
        .from("labMembers")
        .select("user, role, created_at")
        .eq("lab_id", lab.labId)
        .in("role", ["founder", "admin"])
      if (memberError) throw memberError
      const founderIds = memberRows?.filter((m: any) => m.role === "founder").map((m: any) => m.user) || []
      const adminIdsFromMembers = memberRows?.filter((m: any) => m.role === "admin").map((m: any) => m.user) || []
      // 2. Fetch admins from labAdmins
      const { data: adminsData, error: adminsError } = await supabase
        .from("labAdmins")
        .select("user")
        .eq("lab_id", lab.labId)
      if (adminsError) throw adminsError
      const adminIdsFromAdmins = adminsData?.map((a: any) => a.user) || []
      // 3. Combine and deduplicate
      const allAdminIds = Array.from(new Set([...adminIdsFromMembers, ...adminIdsFromAdmins]))
      const allIds = Array.from(new Set([...founderIds, ...allAdminIds]))
      // 4. Fetch profiles for all
      let profiles: any[] = []
      if (allIds.length > 0) {
        const { data: profileRows, error: profileError } = await supabase
          .from("profiles")
          .select("user_id, username")
          .in("user_id", allIds)
        if (profileError) throw profileError
        profiles = profileRows || []
      }
      // 5. Build combined admin list with role and created_at
      const combinedAdmins = allIds.map((userId) => {
        const profile = profiles.find((p: any) => p.user_id === userId)
        const memberRow = memberRows?.find((m: any) => m.user === userId)
        return {
          user_id: userId,
          username: profile?.username || userId,
          role: founderIds.includes(userId) ? "founder" : "admin",
          created_at: memberRow?.created_at || null,
        }
      })
      setAdmins(combinedAdmins)
    } catch (err: any) {
      setAdminError(err.message || String(err))
    } finally {
      setAdminsLoading(false)
    }
  }

  // Fetch current admins on mount/labId change
  useEffect(() => {
    if (lab.labId) fetchAdmins()
  }, [lab.labId])

  // Search for users
  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (!query || query.length < 2) {
      setSearchResults([])
      return
    }
    setSearchLoading(true)
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, username")
        .ilike("username", `%${query}%`)
        .limit(10)
      if (error) throw error
      // Filter out users who are already admins or founders
      const adminIds = admins.map((a: any) => a.user_id)
      setSearchResults((data || []).filter((u: any) => !adminIds.includes(u.user_id)))
    } catch (err) {
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  // Add admin (refactored)
  const handleAddAdmin = async (userToAdd: any) => {
    setAddLoading(userToAdd.user_id)
    try {
      // Log activity
      await supabase.from("activity").insert({
        activity_id: uuidv4(),
        created_at: new Date().toISOString(),
        activity_name: `Admin Added: ${userToAdd.username}`,
        activity_type: "adminadded",
        performed_by: user?.id || null,
        lab_from: lab.labId
      })
      // Manual upsert for labMembers
      // 1. Check if user is already a member
      const { data: existingMember, error: fetchMemberError } = await supabase
        .from("labMembers")
        .select("id, role")
        .eq("lab_id", lab.labId)
        .eq("user", userToAdd.user_id)
      if (fetchMemberError) {
        console.error("[AddAdmin] labMembers fetch error:", fetchMemberError)
        throw fetchMemberError
      }
      if (existingMember && existingMember.length > 0) {
        // If already founder, do not update
        if (existingMember[0].role !== "founder") {
          const { error: updateMemberError } = await supabase
            .from("labMembers")
            .update({ role: "admin" })
            .eq("id", existingMember[0].id)
          if (updateMemberError) {
            console.error("[AddAdmin] labMembers update error:", updateMemberError)
            throw updateMemberError
          }
        }
      } else {
        // Insert new admin member
        const { error: insertMemberError } = await supabase
          .from("labMembers")
          .insert({
            lab_id: lab.labId,
            user: userToAdd.user_id,
            role: "admin",
            created_at: new Date().toISOString()
          })
        if (insertMemberError) {
          console.error("[AddAdmin] labMembers insert error:", insertMemberError)
          throw insertMemberError
        }
      }
      await fetchAdmins()
      setSearchResults((prev) => prev.filter((u) => u.user_id !== userToAdd.user_id))
      toast({ title: "Admin added", description: `${userToAdd.username} is now an admin.` })
    } catch (err: any) {
      toast({ title: "Error adding admin", description: err.message || String(err), variant: "destructive" })
    } finally {
      setAddLoading(null)
    }
  }

  // Remove admin (refactored)
  const handleRemoveAdmin = async (user: any) => {
    setRemoveLoading(user.user_id)
    try {
      const { error, data } = await supabase
        .from("labMembers")
        .delete()
        .eq("lab_id", lab.labId)
        .eq("user", user.user_id)
      if (error) {
        console.error("[RemoveAdmin] Supabase error:", error)
        throw error
      }
      await fetchAdmins()
      toast({ title: "Admin removed", description: `${user.username} is no longer an admin.` })
    } catch (err: any) {
      toast({ title: "Error removing admin", description: err.message || String(err), variant: "destructive" })
    } finally {
      setRemoveLoading(null)
    }
  }

  // Fetch current lab categories from Supabase
  const fetchLabCategories = async () => {
    setCategoriesLoading(true)
    setCategoriesError(null)
    try {
      const { data, error } = await supabase
        .from("labCategories")
        .select("category")
        .eq("lab_id", lab.labId)
      if (error) throw error
      setLabCategories((data || []).map((row: any) => row.category))
    } catch (err: any) {
      setCategoriesError(err.message || String(err))
    } finally {
      setCategoriesLoading(false)
    }
  }

  useEffect(() => {
    if (lab.labId) fetchLabCategories()
  }, [lab.labId])

  // Add a category
  const handleAddCategory = async (newCategory: string) => {
    if (!newCategory || labCategories.includes(newCategory)) return
    setAddCategoryLoading(true)
    try {
      const { error } = await supabase
        .from("labCategories")
        .insert([{ lab_id: lab.labId, category: newCategory }])
      if (error) throw error
      setLabCategories((prev) => [...prev, newCategory])
    } catch (err: any) {
      toast({ title: "Error adding category", description: err.message || String(err), variant: "destructive" })
    } finally {
      setAddCategoryLoading(false)
    }
  }

  // Remove a category (only if more than one remains)
  const handleRemoveCategory = async (categoryToRemove: string) => {
    if (labCategories.length <= 1) return
    setRemoveCategoryLoading(categoryToRemove)
    try {
      const { error } = await supabase
        .from("labCategories")
        .delete()
        .eq("lab_id", lab.labId)
        .eq("category", categoryToRemove)
      if (error) throw error
      setLabCategories((prev) => prev.filter((cat) => cat !== categoryToRemove))
    } catch (err: any) {
      toast({ title: "Error removing category", description: err.message || String(err), variant: "destructive" })
    } finally {
      setRemoveCategoryLoading(null)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>LAB SETTINGS</CardTitle>
        <CardDescription>Manage your lab settings, profile, and preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="flex justify-center w-full mb-6 gap-4">
            <TabsTrigger value="profile" className="text-xs">
              <Info className="h-4 w-4 mr-2" />
              PROFILE
            </TabsTrigger>
            <TabsTrigger value="admins" className="text-xs">
              <Users className="h-4 w-4 mr-2" />
              ADMINS
            </TabsTrigger>
            <TabsTrigger value="tags" className="text-xs">
              <Tag className="h-4 w-4 mr-2" />
              TAGS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="lab-name" className="font-fell italic">Lab Name</Label>
              <Input
                id="lab-name"
                value={labName}
                onChange={(e) => setLabName(e.target.value)}
                placeholder="Enter lab name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-fell italic">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your lab's focus and research areas"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-fell italic">Lab Logo</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profilePic || "/placeholder.svg?height=80&width=80"} alt="Lab logo" />
                  <AvatarFallback>{lab.labName ? lab.labName[0] : "L"}</AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleProfilePicChange}
                />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isSaving}>
                  Change Logo
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Recommended size: 400x400px. Max file size: 2MB.</p>
            </div>
          </TabsContent>

          <TabsContent value="admins" className="space-y-6">
            <div className="space-y-4">
              <Label className="font-fell italic">Lab Administrators</Label>
              {adminsLoading ? (
                <div>Loading admins...</div>
              ) : adminError ? (
                <div className="text-destructive">{adminError}</div>
              ) : admins.length === 0 ? (
                <div>No admins found for this lab.</div>
              ) : (
                admins.map((admin) => (
                  <div
                    key={admin.user_id}
                    className="flex items-center justify-between p-3 border border-secondary rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{admin.username?.charAt(0) || "A"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{admin.username}</p>
                        <p className="text-sm text-muted-foreground">
                          {admin.role.toUpperCase()}
                          {admin.created_at && (
                            <> • {new Date(admin.created_at).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`text-destructive hover:text-destructive${admin.role === "founder" ? " opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => handleRemoveAdmin(admin)}
                      disabled={removeLoading === admin.user_id || admins.length === 1 || admin.role === "founder"}
                    >
                      {removeLoading === admin.user_id ? "Removing..." : "Remove"}
                    </Button>
                  </div>
                ))
              )}

              <div className="pt-4">
                <Label className="font-fell italic">Add Administrator</Label>
                <Input
                  placeholder="Search for users..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="mb-2"
                />
                {searchLoading && <div>Searching...</div>}
                {searchResults.length > 0 && (
                  <div className="border rounded-md divide-y bg-background">
                    {searchResults.map((user) => (
                      <div key={user.user_id} className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{user.username?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                          <span>{user.username}</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddAdmin(user)}
                          disabled={addLoading === user.user_id || admins.some((a) => a.user_id === user.user_id)}
                        >
                          {addLoading === user.user_id ? "Adding..." : <><Plus className="h-4 w-4 mr-1" /> Add</>}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tags" className="space-y-6">
            <div className="space-y-2">
              <Label className="font-fell italic">Category Tags</Label>
              <div className="flex flex-wrap gap-2 p-3 border border-secondary rounded-md min-h-[100px]">
                {categoriesLoading ? (
                  <span>Loading...</span>
                ) : categoriesError ? (
                  <span className="text-destructive">{categoriesError}</span>
                ) : labCategories.length === 0 ? (
                  <span>No categories found.</span>
                ) : (
                  labCategories.map((cat) => {
                    const area = researchAreas.find((a) => a.value === cat)
                    const badgeClass = scienceCategoryBadgeClass[cat] || "badge-default"
                    return (
                      <Badge key={cat} className={badgeClass + " flex items-center gap-1 px-3 py-1"}>
                        {area?.label || cat}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 rounded-full hover:bg-background/20 ml-1"
                          onClick={() => handleRemoveCategory(cat)}
                          disabled={labCategories.length === 1 || removeCategoryLoading === cat}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </Badge>
                    )
                  })
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-tag" className="font-fell italic">Add Category</Label>
              <div className="flex gap-2">
                <Select onValueChange={handleAddCategory}>
                  <SelectTrigger id="add-tag" className="flex-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {researchAreas.filter((area) => !labCategories.includes(area.value)).map((area) => (
                      <SelectItem key={area.value} value={area.value}>{area.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button className="bg-accent text-primary-foreground hover:bg-accent/90" disabled>ADD</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">At least one category is required.</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button className="bg-accent text-primary-foreground hover:bg-accent/90" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  )
}
