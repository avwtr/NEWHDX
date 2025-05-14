"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import type { UserProfile } from "@/lib/types"

const scienceCategories = [
  "Biology",
  "Chemistry",
  "Physics",
  "Astronomy",
  "Earth Science",
  "Environmental Science",
  "Computer Science",
  "Mathematics",
  "Medicine",
  "Neuroscience",
  "Genetics",
  "Ecology",
]

const mockUsers: UserProfile[] = [
  { id: "1", name: "Jane Cooper", role: "admin", initials: "JC", avatar: "/images/scientists/scientist1.png" },
  { id: "2", name: "Robert Fox", role: "user", initials: "RF", avatar: "/images/scientists/scientist2.png" },
  { id: "3", name: "Esther Howard", role: "user", initials: "EH", avatar: "/images/scientists/scientist3.png" },
  { id: "4", name: "Leslie Alexander", role: "user", initials: "LA", avatar: "/images/scientists/scientist4.png" },
  { id: "5", name: "Darlene Robertson", role: "guest", initials: "DR", avatar: "/images/scientists/scientist5.png" },
  { id: "6", name: "Cameron Williamson", role: "user", initials: "CW" },
  { id: "7", name: "Brooklyn Simmons", role: "user", initials: "BS" },
  { id: "8", name: "Kristin Watson", role: "guest", initials: "KW" },
]

export default function CreateOrganization() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [profileImage, setProfileImage] = useState<string>("/interconnected-network.png")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>([])

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
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setProfileImage(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const filteredUsers = searchQuery
    ? mockUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !selectedUsers.some((selected) => selected.id === user.id),
      )
    : []

  const handleAddUser = (user: UserProfile) => {
    setSelectedUsers([...selectedUsers, user])
    setSearchQuery("")
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((user) => user.id !== userId))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // In a real app, you would send this data to your backend
    const orgData = {
      name,
      description,
      profileImage,
      tags: selectedTags,
      members: selectedUsers,
    }

    console.log("Organization created:", orgData)

    // Redirect to the org profile page with dummy data
    router.push("/orgProfile?name=" + encodeURIComponent(name))
  }

  return (
    <div className="container max-w-2xl py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Create Organization</h1>
        <p className="text-muted-foreground">Create a new scientific organization to collaborate with researchers</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
          />
        </div>

        <div className="space-y-2">
          <Label>Science Categories (Select up to 3)</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedTags.map((tag) => (
              <Badge key={tag} className="flex items-center gap-1 px-3 py-1.5">
                {tag}
                <X size={14} className="cursor-pointer" onClick={() => handleTagSelect(tag)} />
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-background">
            {scienceCategories.map((category) => (
              <Badge
                key={category}
                variant={selectedTags.includes(category) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleTagSelect(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
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
                        {user.avatar ? (
                          <Image
                            src={user.avatar || "/placeholder.svg"}
                            alt={user.name}
                            fill
                            className="rounded-full object-cover"
                          />
                        ) : (
                          user.initials
                        )}
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
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {searchQuery && filteredUsers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 p-2 hover:bg-accent cursor-pointer"
                    onClick={() => handleAddUser(user)}
                  >
                    <div className="relative w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                      {user.avatar ? (
                        <Image
                          src={user.avatar || "/placeholder.svg"}
                          alt={user.name}
                          fill
                          className="rounded-full object-cover"
                        />
                      ) : (
                        user.initials
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchQuery && filteredUsers.length === 0 && (
              <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg p-2 text-center text-muted-foreground">
                No users found
              </div>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={!name || !description || selectedTags.length === 0 || selectedUsers.length === 0}
        >
          Create Organization
        </Button>
      </form>
    </div>
  )
}
