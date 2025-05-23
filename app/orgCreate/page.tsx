"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X, Check, Search } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { researchAreas } from "@/lib/research-areas"

// Utility to slugify org names
function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

type OrgMember = {
  id: string // always a UUID
  name: string
  role: "user"
  initials: string
}

export default function CreateOrganization() {
  const router = useRouter()
  const { user } = useAuth();
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [profileImage, setProfileImage] = useState<string>("/interconnected-network.png")
  const [newProfilePicFile, setNewProfilePicFile] = useState<File | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<OrgMember[]>([])
  const [categorySearch, setCategorySearch] = useState("")
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const categoryInputRef = useRef<HTMLInputElement>(null)
  const categoryDropdownRef = useRef<HTMLDivElement>(null)
  const [addLoading, setAddLoading] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [categoriesError, setCategoriesError] = useState("")

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node) &&
        categoryInputRef.current &&
        !categoryInputRef.current.contains(event.target as Node)
      ) {
        setCategoryDropdownOpen(false)
      }
    }
    if (categoryDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [categoryDropdownOpen])

  useEffect(() => {
    const isNavigating = sessionStorage.getItem("isNavigatingToCreateOrg") === "true";
    let timer: NodeJS.Timeout | null = null;
    if (isNavigating) {
      timer = setTimeout(() => {}, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    sessionStorage.removeItem("isNavigatingToCreateOrg");
    sessionStorage.removeItem("isNavigatingToCreateGrant");
    sessionStorage.removeItem("isNavigatingToLanding");
    sessionStorage.removeItem("isNavigatingToProfile");
    sessionStorage.removeItem("isNavigatingToCreateLab");
  }, []);

  const handleTagSelect = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else if (selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewProfilePicFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setProfileImage(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

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
      setSearchResults((data || []).filter((u: any) => 
        u.user_id !== user?.id && !selectedUsers.some(su => su.id === u.user_id)
      ))
    } catch (err) {
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  const handleAddUser = (user: any) => {
    setAddLoading(user.user_id)
    setSelectedUsers(prev => [
      ...prev,
      {
        id: user.user_id, // always use user_id as id
        name: user.username,
        role: "user",
        initials: user.username ? user.username.slice(0, 2).toUpperCase() : "U",
      },
    ])
    setAddLoading(null)
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((user) => user.id !== userId))
  }

  // Handle category selection
  const handleCategoryClick = (value: string) => {
    setSelectedCategories((prev) => {
      const newCategories = prev.includes(value) 
        ? prev.filter((category) => category !== value)
        : prev.length < 3 
          ? [...prev, value]
          : prev

      // Clear error if at least one category is selected
      if (categoriesError && newCategories.length > 0) {
        setCategoriesError("")
      }

      return newCategories
    })
  }

  // Handle removing a category
  const handleRemoveCategory = (e: React.MouseEvent, value: string) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedCategories((prev) => prev.filter((category) => category !== value))
  }

  // Filter areas based on search term
  const filteredAreas = researchAreas.filter((area) =>
    area.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      alert("You must be logged in to create an organization.")
      return
    }
    try {
      // Generate slug and ensure uniqueness
      let baseSlug = slugify(name)
      let slug = baseSlug
      let i = 1
      while (true) {
        const { data: existing, error } = await supabase
          .from("organizations")
          .select("id")
          .eq("slug", slug)
          .maybeSingle()
        if (!existing) break
        slug = `${baseSlug}-${i++}`
      }
      // Upload profile image if a new file was selected
      let profilePicUrl = profileImage
      if (newProfilePicFile) {
        const fileExt = newProfilePicFile.name.split('.').pop()
        const uniqueSuffix = Date.now()
        const fileName = `${slug}-${uniqueSuffix}.${fileExt}`
        const uploadResponse = await supabase.storage.from("org-profile-pics").upload(fileName, newProfilePicFile)
        if (uploadResponse.error) {
          alert("Error uploading profile image: " + uploadResponse.error.message)
          // fallback to default image
        } else {
          const { data: publicUrlData } = supabase.storage.from("org-profile-pics").getPublicUrl(fileName)
          if (publicUrlData?.publicUrl) {
            profilePicUrl = publicUrlData.publicUrl
          }
        }
      }
      // Generate a UUID for the organization
      const orgId = crypto.randomUUID()
      // Insert organization with created_by and explicit org_id
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .insert({
          org_id: orgId,
          org_name: name,
          description,
          profilePic: profilePicUrl,
          categories: selectedCategories,
          slug,
          created_at: new Date().toISOString(),
          created_by: user.id,
        })
        .select('org_id')
        .single()
      if (orgError || !org) {
        alert("Failed to create organization: " + (orgError?.message || "Unknown error"))
        return
      }
      // Insert org members (creator + selected users) with the same org_id
      const memberRows = [
        // Always add the creator first
        {
          org_id: orgId,
          user_id: user.id,
          created_at: new Date().toISOString(),
        },
        // Then add any other selected users
        ...selectedUsers
          .filter(u => u.id !== user.id) // Filter out creator if they somehow got added
          .map(u => ({
            org_id: orgId,
            user_id: u.id,
            created_at: new Date().toISOString(),
          })),
      ];
      if (memberRows.length > 0) {
        const { error: memberError } = await supabase
          .from("orgMembers")
          .insert(memberRows)
        if (memberError) {
          alert("Failed to add members: " + memberError.message)
          // Continue anyway
        }
      }
      // Redirect to pretty org profile URL
      sessionStorage.removeItem("isNavigatingToCreateOrg");
      sessionStorage.removeItem("isNavigatingToCreateGrant");
      sessionStorage.removeItem("isNavigatingToLanding");
      sessionStorage.removeItem("isNavigatingToProfile");
      sessionStorage.removeItem("isNavigatingToCreateLab");
      router.push(`/orgs/${slug}`)
    } catch (error) {
      throw error
    }
  }

  return (
    <div className="container max-w-2xl py-6 pb-16">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Create Organization</h1>
        <p className="text-muted-foreground">Create a new scientific organization to collaborate with researchers</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-32 h-32 mb-4">
            <Image
              src={profileImage || "/placeholder.svg"}
              alt="Organization profile"
              fill
              className="rounded-full object-cover border-2 border-border"
            />
          </div>
          <Label
            htmlFor="profile-image"
            className="cursor-pointer px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
          >
            Upload Profile Image
          </Label>
          <Input id="profile-image" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="org-name">Organization Name</Label>
          <Input
            id="org-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Quantum Research Institute"
            required
            className="h-9 text-sm px-3"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="org-description">Description</Label>
          <Textarea
            id="org-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your organization's mission and research focus..."
            rows={4}
            required
            className="min-h-[70px] text-sm px-3"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Science Categories</Label>
            {categoriesError && <span className="text-xs text-destructive">{categoriesError}</span>}
          </div>
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
            >
              {selectedCategories.length > 0
                ? `${selectedCategories.length} selected`
                : "Select science categories..."}
            </Button>

            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
                <div className="flex items-center border-b p-2">
                  <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                  <Input
                    placeholder="Search science categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto p-1">
                  {filteredAreas.length === 0 ? (
                    <div className="py-2 px-3 text-sm text-muted-foreground">No categories found</div>
                  ) : (
                    filteredAreas.map((area) => {
                      const isSelected = selectedCategories.includes(area.value)
                      return (
                        <div
                          key={area.value}
                          className={`flex items-center px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                            isSelected ? "bg-accent/50" : ""
                          }`}
                          onClick={() => handleCategoryClick(area.value)}
                        >
                          <div className="mr-2 h-4 w-4 flex items-center justify-center border rounded">
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                          {area.label}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedCategories.map((category) => {
                const area = researchAreas.find((a) => a.value === category)
                return (
                  <Badge key={category} variant="secondary" className="flex items-center gap-1">
                    {area?.label}
                    <button
                      type="button"
                      className="h-4 w-4 p-0 hover:bg-transparent rounded-full flex items-center justify-center"
                      onClick={(e) => handleRemoveCategory(e, category)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {area?.label}</span>
                    </button>
                  </Badge>
                )
              })}
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-1">
            Select up to 3 science categories ({selectedCategories.length}/3 selected)
          </p>
        </div>

        <div className="space-y-2">
          <Label>Organization Members</Label>

          <div className="relative mb-2">
            <Input
              placeholder="Search for users to add..."
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              className="mb-2 h-9 text-sm px-3"
            />
            {/* Search Results Dropdown */}
            {searchQuery && (searchLoading || searchResults.length > 0) && (
              <div className="absolute z-20 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-auto">
                <div className="p-2 text-xs text-muted-foreground font-semibold border-b">Search Results</div>
                {searchLoading && (
                  <div className="p-2 text-center text-muted-foreground">Searching...</div>
                )}
                {!searchLoading && searchResults.length > 0 && searchResults.map((user) => (
                  <div key={user.user_id} className="flex items-center justify-between p-2 hover:bg-accent transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                        {user.username ? user.username.slice(0, 2).toUpperCase() : "U"}
                      </div>
                      <span>{user.username}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddUser(user)}
                      disabled={addLoading === user.user_id || selectedUsers.some((u) => u.id === user.user_id)}
                      className={`h-9 px-3 text-sm ${selectedUsers.some((u) => u.id === user.user_id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {addLoading === user.user_id ? "Adding..." : selectedUsers.some((u) => u.id === user.user_id) ? "Added" : <>Add</>}
                    </Button>
                  </div>
                ))}
                {!searchLoading && searchResults.length === 0 && searchQuery.length >= 2 && (
                  <div className="p-2 text-center text-muted-foreground">No users found</div>
                )}
              </div>
            )}
          </div>

          {/* Selected Members Section */}
          {selectedUsers.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Selected Members:</h4>
              <div className="space-y-2">
                {selectedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-2 border rounded-md bg-secondary/30">
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                        {user.initials}
                      </div>
                      <span>{user.name}</span>
                      <Badge variant="outline" className="ml-2">
                        {user.role}
                      </Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveUser(user.id)} 
                      className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
                      title="Remove member"
                    >
                      <X size={16} />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-9 px-3 text-sm"
          disabled={!name || !description || selectedCategories.length === 0 || selectedUsers.length === 0}
        >
          Create Organization
        </Button>
      </form>
    </div>
  )
}
