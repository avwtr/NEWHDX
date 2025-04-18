"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FileIcon, ChevronRight, Search, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PublicationEditor } from "@/components/publication-editor"

// Sample user data
const currentUser = {
  id: 1,
  name: "vawter",
  username: "@vawter",
  avatar: "/placeholder.svg?height=40&width=40",
  initials: "VA",
}

// Sample categories
const scienceCategories = [
  { value: "astrophysics", label: "ASTROPHYSICS", color: "bg-purple-500" },
  { value: "neuroscience", label: "NEUROSCIENCE", color: "bg-science-neuroscience" },
  { value: "ai", label: "ARTIFICIAL INTELLIGENCE", color: "bg-science-ai" },
  { value: "biology", label: "BIOLOGY", color: "bg-science-biology" },
  { value: "chemistry", label: "CHEMISTRY", color: "bg-science-chemistry" },
  { value: "physics", label: "PHYSICS", color: "bg-science-physics" },
  { value: "medicine", label: "MEDICINE", color: "bg-science-medicine" },
  { value: "psychology", label: "PSYCHOLOGY", color: "bg-science-psychology" },
]

// Sample lab members for author selection
const labMembers = [
  { id: 1, name: "vawter", username: "@vawter", avatar: "/placeholder.svg?height=40&width=40", initials: "VA" },
  {
    id: 2,
    name: "Dr. Sarah Johnson",
    username: "@sjohnson",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "SJ",
  },
  { id: 3, name: "Alex Kim", username: "@akim", avatar: "/placeholder.svg?height=40&width=40", initials: "AK" },
  { id: 4, name: "Maria Lopez", username: "@mlopez", avatar: "/placeholder.svg?height=40&width=40", initials: "ML" },
]

// Sample lab materials
const labMaterials = [
  {
    id: 1,
    name: "OBSERVATIONAL DATA SET",
    type: "file",
    fileType: "fits",
    size: "5.1MB",
    author: "vawter",
    date: "2 days ago",
  },
  {
    id: 2,
    name: "SIMULATION RESULTS",
    type: "file",
    fileType: "csv",
    size: "2.3MB",
    author: "Dr. Sarah Johnson",
    date: "1 week ago",
  },
  {
    id: 3,
    name: "ANALYSIS SCRIPT",
    type: "file",
    fileType: "py",
    size: "45KB",
    author: "Alex Kim",
    date: "3 days ago",
  },
  {
    id: 4,
    name: "GALAXY SPECTRA",
    type: "file",
    fileType: "fits",
    size: "8.7MB",
    author: "Maria Lopez",
    date: "5 days ago",
  },
  {
    id: 5,
    name: "RESEARCH NOTES",
    type: "file",
    fileType: "docx",
    size: "320KB",
    author: "vawter",
    date: "1 day ago",
  },
  {
    id: 6,
    name: "STATISTICAL ANALYSIS",
    type: "file",
    fileType: "r",
    size: "78KB",
    author: "Dr. Sarah Johnson",
    date: "4 days ago",
  },
  {
    id: 7,
    name: "EXPERIMENT PHOTOS",
    type: "file",
    fileType: "jpg",
    size: "3.2MB",
    author: "Maria Lopez",
    date: "1 week ago",
  },
  {
    id: 8,
    name: "DATA VISUALIZATION",
    type: "file",
    fileType: "ipynb",
    size: "1.1MB",
    author: "Alex Kim",
    date: "2 days ago",
  },
]

// Publication types
const publicationTypes = [
  { value: "journal", label: "Journal Article" },
  { value: "conference", label: "Conference Paper" },
  { value: "preprint", label: "Preprint" },
  { value: "book", label: "Book Chapter" },
  { value: "thesis", label: "Thesis" },
]

export default function CreatePublicationPage() {
  const router = useRouter()
  const [step, setStep] = useState<"metadata" | "editor">("metadata")
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [authors, setAuthors] = useState<number[]>([currentUser.id])
  const [authorSearch, setAuthorSearch] = useState("")
  const [attachedMaterials, setAttachedMaterials] = useState<number[]>([])

  // Filter authors based on search
  const filteredAuthors = labMembers.filter(
    (member) =>
      !authors.includes(member.id) &&
      (member.name.toLowerCase().includes(authorSearch.toLowerCase()) ||
        member.username.toLowerCase().includes(authorSearch.toLowerCase())),
  )

  // Add author to the publication
  const addAuthor = (authorId: number) => {
    setAuthors([...authors, authorId])
    setAuthorSearch("")
  }

  // Remove author from the publication
  const removeAuthor = (authorId: number) => {
    setAuthors(authors.filter((id) => id !== authorId))
  }

  // Toggle attachment of a lab material
  const toggleAttachment = (materialId: number) => {
    if (attachedMaterials.includes(materialId)) {
      setAttachedMaterials(attachedMaterials.filter((id) => id !== materialId))
    } else {
      setAttachedMaterials([...attachedMaterials, materialId])
    }
  }

  // Proceed to the editor step
  const proceedToEditor = () => {
    if (!title.trim()) {
      alert("Please enter a title for your publication")
      return
    }
    if (!category) {
      alert("Please select a science category")
      return
    }
    setStep("editor")
  }

  // Get author by ID
  const getAuthorById = (id: number) => {
    return labMembers.find((member) => member.id === id)
  }

  // Get material by ID
  const getMaterialById = (id: number) => {
    return labMaterials.find((material) => material.id === id)
  }

  // Get category by value
  const getCategoryByValue = (value: string) => {
    return scienceCategories.find((cat) => cat.value === value)
  }

  return (
    <div className="min-h-screen bg-[#070D2C] text-white">
      {step === "metadata" ? (
        <div className="max-w-md mx-auto pt-16 px-4">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-secondary/30 p-3 rounded-full mb-4">
              <FileIcon className="h-8 w-8 text-accent" />
            </div>
            <h1 className="text-2xl font-mono uppercase tracking-wide">Create New Publication</h1>
          </div>

          <div className="space-y-8 bg-[#0F1642] rounded-xl p-8">
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-sm font-mono uppercase mr-2">Created by:</span>
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-accent">{currentUser.username}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-mono uppercase">
                Title:
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="FEEL FREE TO BE PROVOCATIVE"
                className="bg-[#070D2C] border-0 h-12 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-mono uppercase">Science Category:</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-[#070D2C] border-0 h-12">
                  <SelectValue placeholder="SELECT A CATEGORY" />
                </SelectTrigger>
                <SelectContent className="bg-[#0F1642] border-accent">
                  {scienceCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-mono uppercase">Authors:</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  value={authorSearch}
                  onChange={(e) => setAuthorSearch(e.target.value)}
                  placeholder="SEARCH FOR AND ADD AUTHORS"
                  className="bg-[#070D2C] border-0 h-12 pl-10 text-white placeholder:text-gray-500"
                />
              </div>

              {authorSearch && filteredAuthors.length > 0 && (
                <div className="bg-[#070D2C] rounded-md mt-1 p-2 absolute z-10 w-[calc(100%-4rem)]">
                  {filteredAuthors.map((author) => (
                    <div
                      key={author.id}
                      className="flex items-center p-2 hover:bg-secondary/30 rounded-md cursor-pointer"
                      onClick={() => addAuthor(author.id)}
                    >
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={author.avatar} alt={author.name} />
                        <AvatarFallback>{author.initials}</AvatarFallback>
                      </Avatar>
                      <span>{author.name}</span>
                      <span className="text-accent ml-2">{author.username}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-2">
                {authors.map((authorId) => {
                  const author = getAuthorById(authorId)
                  if (!author) return null
                  return (
                    <div key={authorId} className="flex items-center bg-secondary/30 rounded-full px-3 py-1">
                      <Avatar className="h-5 w-5 mr-2">
                        <AvatarImage src={author.avatar} alt={author.name} />
                        <AvatarFallback>{author.initials}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{author.name}</span>
                      {authorId !== currentUser.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 ml-1 text-gray-400 hover:text-white hover:bg-transparent"
                          onClick={() => removeAuthor(authorId)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="pt-4 flex justify-center">
              <Button
                onClick={proceedToEditor}
                className="bg-accent/80 hover:bg-accent text-primary-foreground rounded-full px-8"
              >
                NEXT <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <PublicationEditor
          title={title}
          category={getCategoryByValue(category)}
          authors={authors.map((id) => getAuthorById(id)).filter(Boolean)}
          attachedMaterials={attachedMaterials.map((id) => getMaterialById(id)).filter(Boolean)}
          labMaterials={labMaterials}
          onAttachMaterial={toggleAttachment}
          onBack={() => setStep("metadata")}
        />
      )}
    </div>
  )
}
