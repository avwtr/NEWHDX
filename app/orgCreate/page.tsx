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
import { X, Check } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"

const researchAreas = [
  { value: "molecular-biology", label: "Molecular Biology" },
  { value: "cell-biology", label: "Cell Biology" },
  { value: "genetics", label: "Genetics" },
  { value: "genomics", label: "Genomics" },
  { value: "proteomics", label: "Proteomics" },
  { value: "bioinformatics", label: "Bioinformatics" },
  { value: "microbiology", label: "Microbiology" },
  { value: "virology", label: "Virology" },
  { value: "immunology", label: "Immunology" },
  { value: "neuroscience", label: "Neuroscience" },
  { value: "developmental-biology", label: "Developmental Biology" },
  { value: "evolutionary-biology", label: "Evolutionary Biology" },
  { value: "ecology", label: "Ecology" },
  { value: "marine-biology", label: "Marine Biology" },
  { value: "botany", label: "Botany" },
  { value: "zoology", label: "Zoology" },
  { value: "organic-chemistry", label: "Organic Chemistry" },
  { value: "inorganic-chemistry", label: "Inorganic Chemistry" },
  { value: "physical-chemistry", label: "Physical Chemistry" },
  { value: "analytical-chemistry", label: "Analytical Chemistry" },
  { value: "biochemistry", label: "Biochemistry" },
  { value: "medicinal-chemistry", label: "Medicinal Chemistry" },
  { value: "polymer-chemistry", label: "Polymer Chemistry" },
  { value: "materials-chemistry", label: "Materials Chemistry" },
  { value: "computational-chemistry", label: "Computational Chemistry" },
  { value: "environmental-chemistry", label: "Environmental Chemistry" },
  { value: "quantum-physics", label: "Quantum Physics" },
  { value: "particle-physics", label: "Particle Physics" },
  { value: "nuclear-physics", label: "Nuclear Physics" },
  { value: "astrophysics", label: "Astrophysics" },
  { value: "cosmology", label: "Cosmology" },
  { value: "condensed-matter-physics", label: "Condensed Matter Physics" },
  { value: "optics", label: "Optics" },
  { value: "thermodynamics", label: "Thermodynamics" },
  { value: "fluid-dynamics", label: "Fluid Dynamics" },
  { value: "plasma-physics", label: "Plasma Physics" },
  { value: "biophysics", label: "Biophysics" },
  { value: "geology", label: "Geology" },
  { value: "geophysics", label: "Geophysics" },
  { value: "geochemistry", label: "Geochemistry" },
  { value: "meteorology", label: "Meteorology" },
  { value: "climatology", label: "Climatology" },
  { value: "oceanography", label: "Oceanography" },
  { value: "hydrology", label: "Hydrology" },
  { value: "seismology", label: "Seismology" },
  { value: "volcanology", label: "Volcanology" },
  { value: "paleontology", label: "Paleontology" },
  { value: "anatomy", label: "Anatomy" },
  { value: "physiology", label: "Physiology" },
  { value: "pathology", label: "Pathology" },
  { value: "pharmacology", label: "Pharmacology" },
  { value: "toxicology", label: "Toxicology" },
  { value: "epidemiology", label: "Epidemiology" },
  { value: "public-health", label: "Public Health" },
  { value: "cardiology", label: "Cardiology" },
  { value: "neurology", label: "Neurology" },
  { value: "oncology", label: "Oncology" },
  { value: "pediatrics", label: "Pediatrics" },
  { value: "geriatrics", label: "Geriatrics" },
  { value: "psychiatry", label: "Psychiatry" },
  { value: "biomedical-engineering", label: "Biomedical Engineering" },
  { value: "chemical-engineering", label: "Chemical Engineering" },
  { value: "civil-engineering", label: "Civil Engineering" },
  { value: "electrical-engineering", label: "Electrical Engineering" },
  { value: "mechanical-engineering", label: "Mechanical Engineering" },
  { value: "computer-science", label: "Computer Science" },
  { value: "artificial-intelligence", label: "Artificial Intelligence" },
  { value: "machine-learning", label: "Machine Learning" },
  { value: "robotics", label: "Robotics" },
  { value: "nanotechnology", label: "Nanotechnology" },
  { value: "materials-science", label: "Materials Science" },
  { value: "biotechnology", label: "Biotechnology" },
  { value: "systems-biology", label: "Systems Biology" },
  { value: "synthetic-biology", label: "Synthetic Biology" },
  { value: "computational-biology", label: "Computational Biology" },
  { value: "quantum-computing", label: "Quantum Computing" },
  { value: "renewable-energy", label: "Renewable Energy" },
  { value: "sustainable-development", label: "Sustainable Development" },
  { value: "climate-science", label: "Climate Science" },
  { value: "data-science", label: "Data Science" },
  { value: "cognitive-science", label: "Cognitive Science" },
  { value: "astrobiology", label: "Astrobiology" },
].sort((a, b) => a.label.localeCompare(b.label))

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
      setSearchResults((data || []).filter((u: any) => !selectedUsers.some(su => su.id === u.user_id)))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      alert("You must be logged in to create an organization.")
      return
    }
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
        categories: selectedTags,
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
      {
        org_id: orgId,
        user_id: user.id,
        created_at: new Date().toISOString(),
      },
      ...selectedUsers
        .filter(u => u.id !== user.id && typeof u.id === 'string' && u.id.length === 36 && u.id.includes('-'))
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
    router.push(`/orgs/${slug}`)
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
          <Label>Science Categories (Select up to 3)</Label>
          <div className="flex flex-wrap gap-1 mb-1">
            {selectedTags.map((tag) => {
              const area = researchAreas.find((a) => a.value === tag)
              return (
                <Badge key={tag} className="flex items-center gap-1 px-3 py-1.5">
                  {area?.label || tag}
                  <X size={14} className="cursor-pointer" onClick={() => setSelectedTags(selectedTags.filter((t) => t !== tag))} />
                </Badge>
              )
            })}
          </div>
          <div className="relative">
            <Input
              ref={categoryInputRef}
              placeholder="Search science categories..."
              value={categorySearch}
              onFocus={() => setCategoryDropdownOpen(true)}
              onChange={e => {
                setCategorySearch(e.target.value)
                setCategoryDropdownOpen(true)
              }}
              autoComplete="off"
              className="h-9 text-sm px-3"
            />
            {categoryDropdownOpen && (categorySearch.length > 0 || researchAreas.filter(area => !selectedTags.includes(area.value)).length > 0) && (
              <div
                ref={categoryDropdownRef}
                className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto"
                tabIndex={-1}
              >
                {researchAreas
                  .filter(area =>
                    !selectedTags.includes(area.value) &&
                    (!categorySearch || area.label.toLowerCase().includes(categorySearch.toLowerCase()))
                  )
                  .slice(0, 20)
                  .map(area => (
                    <div
                      key={area.value}
                      className="flex items-center gap-2 p-2 hover:bg-accent cursor-pointer"
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => {
                        if (selectedTags.length < 3) {
                          setSelectedTags([...selectedTags, area.value])
                          setCategoryDropdownOpen(false)
                          setCategorySearch("")
                        }
                      }}
                    >
                      <Check className="h-4 w-4 text-muted-foreground" />
                      <span>{area.label}</span>
                    </div>
                  ))}
                {researchAreas.filter(area => !selectedTags.includes(area.value) && (!categorySearch || area.label.toLowerCase().includes(categorySearch.toLowerCase()))).length === 0 && (
                  <div className="p-2 text-center text-muted-foreground">No categories found</div>
                )}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Select up to 3 categories</p>
        </div>

        <div className="space-y-2">
          <Label>Organization Members</Label>

          {selectedUsers.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Selected Members:</h4>
              <div className="space-y-2">
                {selectedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                        {user.initials}
                      </div>
                      <span>{user.name}</span>
                      <Badge variant="outline" className="ml-2">
                        {user.role}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveUser(user.id)} className="h-8 w-8 p-0">
                      <X size={16} />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="relative">
            <Input
              placeholder="Search for users to add..."
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              className="mb-2 h-9 text-sm px-3"
            />
            {searchLoading && searchQuery.length >= 2 && (
              <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg p-2 text-center text-muted-foreground">
                Searching...
              </div>
            )}
            {searchQuery && searchResults.length > 0 && (
              <div className="border rounded-md divide-y bg-background absolute z-10 w-full mt-1 shadow-lg max-h-48 overflow-auto">
                {searchResults.map((user) => (
                  <div key={user.user_id} className="flex items-center justify-between p-2">
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
                      className="h-9 px-3 text-sm"
                    >
                      {addLoading === user.user_id ? "Adding..." : <>Add</>}
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {searchQuery && !searchLoading && searchResults.length === 0 && searchQuery.length >= 2 && (
              <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg p-2 text-center text-muted-foreground">
                No users found
              </div>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-9 px-3 text-sm"
          disabled={!name || !description || selectedTags.length === 0 || selectedUsers.length === 0}
        >
          Create Organization
        </Button>
      </form>
    </div>
  )
}
