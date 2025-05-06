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

interface SettingsDialogProps {
  lab: any
  onLabUpdated?: (lab: any) => void
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

  // Sample notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    newContributions: true,
    fileUploads: true,
    mentions: true,
    experimentUpdates: true,
    publicationCitations: true,
  })

  const handleTagRemove = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove))
  }

  const handleTagAdd = (newTag: string) => {
    if (!selectedTags.includes(newTag)) {
      setSelectedTags([...selectedTags, newTag])
    }
  }

  const toggleNotification = (key: keyof typeof notificationSettings) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: !notificationSettings[key],
    })
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

  // Fetch current admins
  useEffect(() => {
    async function fetchAdmins() {
      setAdminsLoading(true)
      setAdminError(null)
      try {
        const { data: adminRows, error } = await supabase
          .from("labAdmins")
          .select("user")
          .eq("lab_id", lab.labId)
        if (error) throw error
        if (!adminRows || adminRows.length === 0) {
          setAdmins([])
          setAdminsLoading(false)
          return
        }
        // Get user info from profiles
        const userIds = adminRows.map((row: any) => row.user)
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("user_id, username")
          .in("user_id", userIds)
        if (profileError) throw profileError
        setAdmins(profiles || [])
      } catch (err: any) {
        setAdminError(err.message || String(err))
      } finally {
        setAdminsLoading(false)
      }
    }
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
      setSearchResults(data || [])
    } catch (err) {
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  // Add admin
  const handleAddAdmin = async (user: any) => {
    setAddLoading(user.user_id)
    try {
      const { error } = await supabase
        .from("labAdmins")
        .insert([{ lab_id: lab.labId, user: user.user_id }])
      if (error) throw error
      setAdmins((prev) => [...prev, user])
      setSearchResults((prev) => prev.filter((u) => u.user_id !== user.user_id))
      toast({ title: "Admin added", description: `${user.username} is now an admin.` })
    } catch (err: any) {
      toast({ title: "Error adding admin", description: err.message || String(err), variant: "destructive" })
    } finally {
      setAddLoading(null)
    }
  }

  // Remove admin
  const handleRemoveAdmin = async (user: any) => {
    setRemoveLoading(user.user_id)
    try {
      const { error } = await supabase
        .from("labAdmins")
        .delete()
        .eq("lab_id", lab.labId)
        .eq("user", user.user_id)
      if (error) throw error
      setAdmins((prev) => prev.filter((a) => a.user_id !== user.user_id))
      toast({ title: "Admin removed", description: `${user.username} is no longer an admin.` })
    } catch (err: any) {
      toast({ title: "Error removing admin", description: err.message || String(err), variant: "destructive" })
    } finally {
      setRemoveLoading(null)
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
          <TabsList className="grid grid-cols-4 w-full mb-6">
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
            <TabsTrigger value="notifications" className="text-xs">
              <Bell className="h-4 w-4 mr-2" />
              NOTIFICATIONS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="lab-name">Lab Name</Label>
              <Input
                id="lab-name"
                value={labName}
                onChange={(e) => setLabName(e.target.value)}
                placeholder="Enter lab name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your lab's focus and research areas"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Lab Logo</Label>
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
              <Label>Lab Administrators</Label>
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
                        {/* Optionally add avatar if available in profiles */}
                        <AvatarFallback>{admin.username?.charAt(0) || "A"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{admin.username}</p>
                        <p className="text-sm text-muted-foreground">{admin.user_id}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleRemoveAdmin(admin)}
                      disabled={removeLoading === admin.user_id || admins.length === 1}
                    >
                      {removeLoading === admin.user_id ? "Removing..." : "Remove"}
                    </Button>
                  </div>
                ))
              )}

              <div className="pt-4">
                <Label>Add Administrator</Label>
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
              <Label>Category Tags</Label>
              <div className="flex flex-wrap gap-2 p-3 border border-secondary rounded-md min-h-[100px]">
                {selectedTags.map((tag) => (
                  <Badge key={tag} className="flex items-center gap-1 px-3 py-1">
                    {tag.toUpperCase()}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 rounded-full hover:bg-background/20 ml-1"
                      onClick={() => handleTagRemove(tag)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-tag">Add Tag</Label>
              <div className="flex gap-2">
                <Select onValueChange={handleTagAdd}>
                  <SelectTrigger id="add-tag" className="flex-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="neuroscience">NEUROSCIENCE</SelectItem>
                    <SelectItem value="ai">ARTIFICIAL INTELLIGENCE</SelectItem>
                    <SelectItem value="biology">BIOLOGY</SelectItem>
                    <SelectItem value="chemistry">CHEMISTRY</SelectItem>
                    <SelectItem value="physics">PHYSICS</SelectItem>
                    <SelectItem value="medicine">MEDICINE</SelectItem>
                    <SelectItem value="psychology">PSYCHOLOGY</SelectItem>
                    <SelectItem value="brain-mapping">BRAIN MAPPING</SelectItem>
                    <SelectItem value="cognitive-science">COGNITIVE SCIENCE</SelectItem>
                    <SelectItem value="machine-learning">MACHINE LEARNING</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="bg-accent text-primary-foreground hover:bg-accent/90">ADD</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Contributions</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when new contributions are submitted
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.newContributions}
                  onCheckedChange={() => toggleNotification("newContributions")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>File Uploads</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when files are uploaded to the lab
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.fileUploads}
                  onCheckedChange={() => toggleNotification("fileUploads")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mentions</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when you are mentioned in comments
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.mentions}
                  onCheckedChange={() => toggleNotification("mentions")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Experiment Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about experiment progress and updates
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.experimentUpdates}
                  onCheckedChange={() => toggleNotification("experimentUpdates")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Publication Citations</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when your publications are cited
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.publicationCitations}
                  onCheckedChange={() => toggleNotification("publicationCitations")}
                />
              </div>
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
