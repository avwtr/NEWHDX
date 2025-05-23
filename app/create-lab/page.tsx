"use client"

import { Label as UILable } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Check } from "lucide-react"
import { researchAreas } from "@/lib/research-areas"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { v4 as uuidv4 } from 'uuid'
import { useRouter } from "next/navigation"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Beaker, Sparkles, ArrowRight, Search, Plus, Copy, Mail, MessageSquare, Share2, Users, Lightbulb, FileText, DollarSign } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"
import { LoadingAnimation } from "@/components/loading-animation"

// Lab template data - SIMPLIFIED to only two options
const labTemplates = [
  {
    id: "blank",
    name: "Blank Template",
    description: "Start from scratch with a completely blank lab",
    icon: Beaker,
    color: "bg-secondary",
    members: 1,
    materials: 0,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "ai-assist",
    name: "AI Assist Template",
    description: "Let AI generate your lab based on your research description",
    icon: Sparkles,
    color: "bg-science-ai",
    members: 1,
    materials: 0,
    image: "/placeholder.svg?height=200&width=300",
    disabled: true,
    comingSoon: true,
  },
]

// Example research topics for AI template
const exampleTopics = [
  "Genomics Research",
  "Climate Data Analysis",
  "Neural Networks",
  "Quantum Computing",
  "Vaccine Development",
  "Sustainable Materials",
]

// Sample collaborators for invitation step
const sampleCollaborators = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    email: "sjohnson@research.edu",
    role: "Principal Investigator",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "SJ",
  },
  {
    id: 2,
    name: "Alex Kim",
    email: "akim@research.edu",
    role: "Data Scientist",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "AK",
  },
  {
    id: 3,
    name: "Maria Lopez",
    email: "mlopez@research.edu",
    role: "Research Assistant",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "ML",
  },
  {
    id: 4,
    name: "Robert Chen",
    email: "rchen@research.edu",
    role: "Postdoctoral Researcher",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "RC",
  },
]

export default function CreateLabPage() {
  // State for multi-step wizard
  const [step, setStep] = useState<"template" | "ai-description" | "details" | "invite">("template")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [aiDescription, setAiDescription] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [labDetails, setLabDetails] = useState({
    name: "",
    description: "",
  })
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoriesError, setCategoriesError] = useState("")
  const [detailsError, setDetailsError] = useState("")
  const [invitedCollaborators, setInvitedCollaborators] = useState<number[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; email: string; avatar?: string }>>([])
  const [selectedFounders, setSelectedFounders] = useState<Array<{ id: string; username: string; avatar_url?: string }>>([])
  const [isSearching, setIsSearching] = useState(false)
  const [profilePic, setProfilePic] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const router = useRouter()
  const [orgSearch, setOrgSearch] = useState("")
  const [orgOptions, setOrgOptions] = useState<{ org_id: string; org_name: string; profilePic?: string }[]>([])
  const [orgSearchLoading, setOrgSearchLoading] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<{ org_id: string; org_name: string; profilePic?: string } | null>(null)
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false)
  const [founderSearch, setFounderSearch] = useState("")
  const [founderResults, setFounderResults] = useState<any[]>([])
  const [founderSearchLoading, setFounderSearchLoading] = useState(false)
  const [isLabCreating, setIsLabCreating] = useState(false)
  const [typewriterText, setTypewriterText] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (orgSearch.length < 1) {
      setOrgOptions([])
      return
    }
    setOrgSearchLoading(true)
    supabase
      .from("organizations")
      .select("org_id, org_name, profilePic")
      .ilike("org_name", `%${orgSearch}%`)
      .limit(10)
      .then(({ data, error }) => {
        if (!error && data) setOrgOptions(data)
        setOrgSearchLoading(false)
      })
  }, [orgSearch])

  // Real user search for founders
  useEffect(() => {
    if (!founderSearch || founderSearch.length < 2) {
      setFounderResults([])
      return
    }
    setFounderSearchLoading(true)
    console.log('Searching for founders with query:', founderSearch)
    supabase
      .from("profiles")
      .select("user_id, username")
      .ilike("username", `%${founderSearch}%`)
      .limit(10)
      .then(({ data, error }) => {
        console.log('Founder search results:', { data, error })
        if (!error && data) {
          const filteredData = data.filter((u: any) => !selectedFounders.some(f => f.id === u.user_id) && u.user_id !== user?.id)
          console.log('Filtered founder results:', filteredData)
          setFounderResults(filteredData)
        } else {
          console.error('Error in founder search:', error)
          setFounderResults([])
        }
        setFounderSearchLoading(false)
      })
  }, [founderSearch, selectedFounders, user])

  // Handle template selection
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId)

    // Reset AI description if switching templates
    if (templateId !== "ai-assist") {
      setAiDescription("")
    }
  }

  // Handle AI description input
  const handleAiDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAiDescription(e.target.value)
  }

  // Handle selecting an example topic
  const handleSelectExampleTopic = (topic: string) => {
    setAiDescription(
      `I'm researching ${topic.toLowerCase()} and need a lab to organize my experiments, data, and findings.`,
    )
  }

  // Handle generating lab with AI
  const handleGenerateWithAI = () => {
    setIsGenerating(true)

    // Simulate AI generation with progress updates
    let progress = 0
    const interval = setInterval(() => {
      progress += 5
      setGenerationProgress(progress)

      if (progress >= 100) {
        clearInterval(interval)
        setIsGenerating(false)

        // Pre-fill lab details based on AI description
        setLabDetails({
          name: aiDescription.split(" ").slice(0, 3).join(" ") + " Lab",
          description: aiDescription,
        })

        // Move to details step
        setStep("details")
      }
    }, 100)
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setLabDetails({
      ...labDetails,
      [name]: value,
    })
  }

  // Handle category selection
  const handleCategoryClick = (value: string) => {
    setSelectedCategories((prev) => {
      const newCategories = prev.includes(value) 
        ? prev.filter((category) => category !== value)
        : prev.length < 10 
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

  // Toggle collaborator invitation
  const toggleCollaborator = (id: number) => {
    if (invitedCollaborators.includes(id)) {
      setInvitedCollaborators(invitedCollaborators.filter((cId) => cId !== id))
    } else {
      setInvitedCollaborators([...invitedCollaborators, id])
    }
  }

  // Handle next step
  const handleNextStep = () => {
    if (step === "template" && selectedTemplate) {
      if (selectedTemplate === "ai-assist") {
        setStep("ai-description")
      } else {
        setStep("details")
      }
    } else if (step === "ai-description") {
      handleGenerateWithAI()
    } else if (step === "details") {
      let hasError = false
      setDetailsError("")
      setCategoriesError("")
      if (!labDetails.name.trim()) {
        setDetailsError("Lab name is required.")
        hasError = true
      } else if (!labDetails.description.trim()) {
        setDetailsError("Lab description is required.")
        hasError = true
      }
      if (selectedCategories.length === 0) {
        setCategoriesError("At least one science category is required.")
        hasError = true
      }
      if (hasError) return
      setStep("invite")
    } else if (step === "invite") {
      handleCreateLab()
    }
  }

  // Handle previous step
  const handlePreviousStep = () => {
    if (step === "ai-description") {
      setStep("template")
    } else if (step === "details") {
      if (selectedTemplate === "ai-assist") {
        setStep("ai-description")
      } else {
        setStep("template")
      }
    } else if (step === "invite") {
      setStep("details")
    }
  }

  // Handle lab creation
  const handleCreateLab = async () => {
    if (!user?.id) {
      console.error('No authenticated user found')
      return
    }
    setIsLabCreating(true)
    setTypewriterText("")
    let message = "Creating your lab..."
    let i = 0
    const typeInterval = setInterval(() => {
      setTypewriterText(message.slice(0, i + 1))
      i++
      if (i === message.length) clearInterval(typeInterval)
    }, 60)

    try {
      // 1. Generate a UUID for the lab
      const labId = uuidv4()

      // 2. Upload profile picture if present
      let profilePicUrl = null
      if (profilePic) {
        // Convert base64 to Blob
        const res = await fetch(profilePic)
        const blob = await res.blob()
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('lab-profile-pics')
          .upload(`${labId}.png`, blob, { upsert: true })

        if (uploadError) {
          console.error('Error uploading profile pic:', uploadError)
        } else {
          const { data: publicUrlData } = supabase
            .storage
            .from('lab-profile-pics')
            .getPublicUrl(`${labId}.png`)
          profilePicUrl = publicUrlData.publicUrl
        }
      }

      // 3. Insert lab with profilePic
      const labData = { 
        labId,
        labName: labDetails.name,
        description: labDetails.description,
        createdBy: user.id,
        funding_setup: false,
        membership_option: false,
        one_time_donation_option: false,
        created_at: new Date().toISOString(),
        profilePic: profilePicUrl,
        org_id: selectedOrg ? selectedOrg.org_id : null,
      }
      
      console.log('Attempting to create lab with data:', labData)

      const { data, error: labError } = await supabase
        .from('labs')
        .insert([labData])
        .select()

      console.log('Supabase response:', { data, error: labError })

      if (labError) {
        console.error('Error creating lab:', {
          error: labError,
          message: labError.message,
          details: labError.details,
          hint: labError.hint,
          code: labError.code,
          data: labData
        })
        return
      }

      if (!data) {
        console.error('No lab data returned after creation')
        return
      }

      const lab = data

      // 4. Use labId for all related inserts
      // Log activity
      const { error: activityError } = await supabase
        .from('activity')
        .insert([{
          activity_id: uuidv4(),
          created_at: new Date().toISOString(),
          activity_name: 'Lab Created',
          activity_type: 'labcreation',
          performed_by: user.id,
          lab_from: labId
        }])

      if (activityError) {
        console.error('Error logging activity:', activityError)
      }

      // Add categories
      if (selectedCategories.length > 0) {
        const { error: categoryError } = await supabase
          .from('labCategories')
          .insert(
            selectedCategories.map(category => ({
              created_at: new Date().toISOString(),
              lab_id: labId,
              category: category
            }))
          )

        if (categoryError) {
          console.error('Error adding categories:', categoryError)
        }
      }

      // Add lab admin (creator)
      const { data: adminData, error: adminError } = await supabase
        .from('labAdmins')
        .insert({
          lab_id: labId,
          user: user.id
        })
        .select()

      if (adminError) {
        console.error('Error adding lab admin:', {
          error: adminError,
          errorMessage: adminError.message,
          errorDetails: adminError.details
        })
        return
      }

      // Add lab member (creator)
      const { data: memberData, error: memberError } = await supabase
        .from('labMembers')
        .insert({
          lab_id: labId,
          user: user.id,
          role: 'founder'
        })
        .select()

      if (memberError) {
        console.error('Error adding lab member:', {
          error: memberError,
          errorMessage: memberError.message,
          errorDetails: memberError.details
        })
        return
      }

      // Add selected founders as admins and members
      if (selectedFounders.length > 0) {
        const founderPromises = selectedFounders.map(async (founder) => {
          // Add as admin
          await supabase
            .from('labAdmins')
            .insert([{
              lab_id: labId,
              user: founder.id
            }])

          // Add as member with founder role
          await supabase
            .from('labMembers')
            .insert([{
              lab_id: labId,
              user: founder.id,
              role: 'founder'
            }])
        })

        await Promise.all(founderPromises)
      }

      // ADD THIS REDIRECT:
      setTimeout(() => {
        router.push(`/lab/${labId}`)
      }, 1800)

    } catch (error) {
      setIsLabCreating(false)
      console.error('Error in lab creation process:', error)
    }
  }

  // Get selected template data
  const getSelectedTemplate = () => {
    return labTemplates.find((t) => t.id === selectedTemplate)
  }

  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    
    setIsSearching(true)
    // In a real app, this would call your API to search for users
    // For now, we'll simulate a search with some sample data
    setTimeout(() => {
      setSearchResults([
        { id: "1", name: "Dr. Sarah Johnson", email: "sjohnson@research.edu", avatar: "/placeholder.svg" },
        { id: "2", name: "Alex Kim", email: "akim@research.edu", avatar: "/placeholder.svg" },
        { id: "3", name: "Maria Lopez", email: "mlopez@research.edu", avatar: "/placeholder.svg" },
      ])
      setIsSearching(false)
    }, 500)
  }

  // Handle profile picture change
  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (ev) => {
        setProfilePic(ev.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Open file picker
  const handleProfilePicClick = () => {
    fileInputRef.current?.click()
  }

  // Re-add handleRemoveFounder for removing founders
  const handleRemoveFounder = (id: string) => {
    setSelectedFounders(selectedFounders.filter(f => f.id !== id))
  }

  // Render template selection step
  const renderTemplateStep = () => {
    return (
      <>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-wide mb-2">Choose a Lab Template</h1>
          <p className="text-muted-foreground">Select a template to get started with your new lab</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
          {labTemplates.map((template) => (
            <div
              key={template.id}
              className={`relative cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
                template.disabled 
                  ? "opacity-50 cursor-not-allowed" 
                  : selectedTemplate === template.id 
                  ? "ring-2 ring-accent" 
                  : ""
              }`}
              onClick={() => !template.disabled && handleSelectTemplate(template.id)}
            >
              <Card className="overflow-hidden h-full">
                <div className="relative h-40 overflow-hidden">
                  <div className={`absolute inset-0 ${template.color} opacity-20`}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <template.icon className="h-20 w-20 text-accent opacity-40" />
                  </div>
                  {template.comingSoon && (
                    <div className="absolute top-2 right-2 bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">
                      COMING SOON
                    </div>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="mt-1">{template.description}</CardDescription>
                    </div>
                    {!template.disabled && selectedTemplate === template.id && (
                      <div className="bg-accent rounded-full p-1">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  {template.id === "blank" ? (
                    <div className="text-sm text-muted-foreground">
                      <p>• Start with an empty lab</p>
                      <p>• Manually set up all components</p>
                      <p>• Complete control over structure</p>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      <p>• AI generates lab structure</p>
                      <p>• Based on your research description</p>
                      <p>• Customizable after generation</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </>
    )
  }

  // Render AI description step
  const renderAiDescriptionStep = () => {
    return (
      <>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-wide mb-2">Describe Your Research</h1>
          <p className="text-muted-foreground">Tell us about your research to generate a customized lab</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-accent" />
                AI Lab Generator
              </CardTitle>
              <CardDescription>
                Describe your research goals, methodologies, and the type of data you'll be working with
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={aiDescription}
                onChange={handleAiDescriptionChange}
                placeholder="Example: I'm researching the effects of climate change on coral reef ecosystems using satellite imagery and field samples. I need to organize environmental data, image analysis, and statistical models."
                className="min-h-[150px] resize-y"
              />

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Be specific about your research goals and data types</span>
                <span className={aiDescription.length < 50 ? "text-destructive" : ""}>
                  {aiDescription.length}/500 characters (min 50)
                </span>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Example topics:</p>
                <div className="flex flex-wrap gap-2">
                  {exampleTopics.map((topic, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-secondary"
                      onClick={() => handleSelectExampleTopic(topic)}
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              {isGenerating && (
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span>Generating your lab...</span>
                    <span>{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground animate-pulse">
                    Analyzing research description and creating optimal lab structure...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 bg-secondary/30 rounded-md p-4">
            <h3 className="text-sm font-medium mb-2">What will the AI generate?</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-accent mt-0.5" />
                <span>Folder structure tailored to your research area</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-accent mt-0.5" />
                <span>Initial documentation templates</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-accent mt-0.5" />
                <span>Suggested data organization</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-accent mt-0.5" />
                <span>Relevant tags and categorization</span>
              </li>
            </ul>
          </div>
        </div>
      </>
    )
  }

  // Render lab details step
  const renderDetailsStep = () => {
    // Filter research areas based on search term
    const filteredAreas = searchTerm
      ? researchAreas.filter((area) => area.label.toLowerCase().includes(searchTerm.toLowerCase()))
      : researchAreas

    return (
      <>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-wide mb-2">Lab Details</h1>
          <p className="text-muted-foreground">Provide information about your lab</p>
          {detailsError && <p className="text-destructive text-sm mt-2">{detailsError}</p>}
        </div>

        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="flex flex-col items-center space-y-4">
            <div
              className="w-32 h-32 rounded-full border-2 border-secondary flex items-center justify-center bg-secondary/10 cursor-pointer relative group"
              onClick={handleProfilePicClick}
              tabIndex={0}
              role="button"
              aria-label="Upload lab profile picture"
            >
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleProfilePicChange}
                className="hidden"
              />
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="Lab profile"
                  className="object-cover w-full h-full rounded-full"
                />
              ) : (
                <Plus className="h-10 w-10 text-muted-foreground group-hover:text-accent transition-colors" />
              )}
              <div className="absolute inset-0 rounded-full bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs text-muted-foreground">Upload a lab profile picture (400x400px)</p>
          </div>

          <div className="space-y-2">
            <UILable htmlFor="lab-name">Lab Name</UILable>
            <Input
              id="lab-name"
              name="name"
              value={labDetails.name}
              onChange={handleInputChange}
              placeholder="Enter a name for your lab"
            />
          </div>

          <div className="space-y-2">
            <UILable htmlFor="lab-description">Description</UILable>
            <Textarea
              id="lab-description"
              name="description"
              value={labDetails.description}
              onChange={handleInputChange}
              placeholder="Describe your lab's focus and research areas"
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <UILable htmlFor="org-search">Associate with Organization (optional)</UILable>
            <div className="relative">
              <Input
                id="org-search"
                placeholder="Search organizations by name..."
                value={selectedOrg ? selectedOrg.org_name : orgSearch}
                onChange={e => {
                  setSelectedOrg(null)
                  setOrgSearch(e.target.value)
                  setOrgDropdownOpen(true)
                }}
                onFocus={() => setOrgDropdownOpen(true)}
                autoComplete="off"
              />
              {orgDropdownOpen && (orgSearch.length > 0 || orgOptions.length > 0) && (
                <div className="absolute z-20 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-auto">
                  {orgSearchLoading && (
                    <div className="p-2 text-center text-muted-foreground">Searching...</div>
                  )}
                  {!orgSearchLoading && orgOptions.length === 0 && orgSearch.length > 0 && (
                    <div className="p-2 text-center text-muted-foreground">No organizations found</div>
                  )}
                  {!orgSearchLoading && orgOptions.map(org => (
                    <div
                      key={org.org_id}
                      className="p-2 hover:bg-accent cursor-pointer flex items-center gap-2"
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => {
                        setSelectedOrg(org)
                        setOrgSearch(org.org_name)
                        setOrgDropdownOpen(false)
                      }}
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={org.profilePic || "/placeholder.svg"} alt={org.org_name} />
                        <AvatarFallback>{org.org_name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="truncate">{org.org_name}</span>
                    </div>
                  ))}
                  {selectedOrg && (
                    <div className="p-2 text-xs text-muted-foreground border-t flex items-center gap-2">
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={selectedOrg.profilePic || "/placeholder.svg"} alt={selectedOrg.org_name} />
                        <AvatarFallback>{selectedOrg.org_name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span>Selected: {selectedOrg.org_name}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            {selectedOrg && (
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={selectedOrg.profilePic || "/placeholder.svg"} alt={selectedOrg.org_name} />
                  <AvatarFallback>{selectedOrg.org_name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">Selected: {selectedOrg.org_name}</span>
                <Button size="sm" variant="ghost" onClick={() => { setSelectedOrg(null); setOrgSearch(""); }}>
                  Remove
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <UILable>Additional Founders</UILable>
              <span className="text-sm text-muted-foreground">
                {selectedFounders.length}/3 selected
              </span>
            </div>
            {selectedFounders.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedFounders.map((founder) => (
                  <Badge
                    key={founder.id}
                    variant="secondary"
                    className="flex items-center gap-2 py-1 px-2"
                  >
                    <Avatar className="h-4 w-4">
                      <AvatarFallback>{founder.username?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <span>{founder.username}</span>
                    <button
                      onClick={() => handleRemoveFounder(founder.id)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for users..."
                  value={founderSearch}
                  onChange={e => setFounderSearch(e.target.value)}
                  className="pl-8"
                  autoComplete="off"
                />
              </div>
              {(founderSearch.length >= 2 || founderResults.length > 0) && (
                <div className="absolute mt-2 w-full bg-background border rounded-md shadow-lg z-10 max-h-48 overflow-auto">
                  {founderSearchLoading && (
                    <div className="p-2 text-center text-muted-foreground">Searching...</div>
                  )}
                  {!founderSearchLoading && founderResults.length === 0 && founderSearch.length >= 2 && (
                    <div className="p-2 text-center text-muted-foreground">No users found. Try a different username.</div>
                  )}
                  {!founderSearchLoading && founderResults.map((user) => (
                    <button
                      key={user.user_id}
                      onClick={() => {
                        if (selectedFounders.length < 3) {
                          setSelectedFounders([...selectedFounders, { id: user.user_id, username: user.username }])
                          setFounderSearch("")
                          setFounderResults([])
                        }
                      }}
                      disabled={selectedFounders.some(f => f.id === user.user_id) || selectedFounders.length >= 3}
                      className="w-full p-2 hover:bg-accent flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>{user.username?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <div className="font-medium">{user.username}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <UILable>Science Categories</UILable>
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
              Select up to 10 science categories ({selectedCategories.length}/10 selected)
            </p>
          </div>
        </div>
      </>
    )
  }

  // Render invite step
  const renderInviteStep = () => {
    const inviteMessage = `Join my new lab: ${labDetails.name || "My Research Lab"} on HDX!`
    const inviteLink = "https://hdx.science/labs/join?token=abc123xyz456"
    const fullInviteMessage = `${inviteMessage}\n\nClick here to join: ${inviteLink}`
    const template = getSelectedTemplate()

    const handleCopy = () => {
      navigator.clipboard.writeText(fullInviteMessage)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }

    return (
      <>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-wide mb-2">Lab Preview & Invite</h1>
          <p className="text-muted-foreground">Review your lab and share it with collaborators</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-8">
          {/* Lab Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Lab Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-16 h-16">
                    <Image
                      src={profilePic || "/placeholder.svg"}
                      alt="Lab profile"
                      fill
                      className="rounded-full object-cover border-2 border-border"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium">{labDetails.name}</h3>
                  <p className="text-muted-foreground">{labDetails.description}</p>
                </div>
              </div>

              {/* Categories */}
              {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedCategories.map((category) => {
                    const area = researchAreas.find((a) => a.value === category)
                    return (
                      <Badge key={category} variant="secondary">
                        {area?.label}
                      </Badge>
                    )
                  })}
                </div>
              )}

              {/* Founders */}
              {selectedFounders.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Founders:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedFounders.map((founder) => (
                      <Badge key={founder.id} variant="secondary" className="flex items-center gap-2">
                        <Avatar className="h-4 w-4">
                          <AvatarFallback>{founder.username?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <span>{founder.username}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Organization */}
              {selectedOrg && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Organization:</h4>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={selectedOrg.profilePic || "/placeholder.svg"} alt={selectedOrg.org_name} />
                      <AvatarFallback>{selectedOrg.org_name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span>{selectedOrg.org_name}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end mt-8">
          <Button
            onClick={handleCreateLab}
            className="bg-accent text-primary-foreground hover:bg-accent/90"
            disabled={isLabCreating}
          >
            {isLabCreating ? "Creating..." : "Create Lab"}
          </Button>
        </div>
      </>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/" className="flex items-center text-sm hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Home
        </Link>
      </div>

      {step === "template" && renderTemplateStep()}
      {step === "ai-description" && renderAiDescriptionStep()}
      {step === "details" && renderDetailsStep()}
      {step === "invite" && renderInviteStep()}

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={handlePreviousStep}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        {step !== "invite" && (
          <Button
            onClick={handleNextStep}
            disabled={
              (step === "template" && !selectedTemplate) ||
              (step === "ai-description" && aiDescription.length < 50 && !isGenerating)
            }
            className="bg-accent text-primary-foreground hover:bg-accent/90"
          >
            {step === "ai-description" ? (
              isGenerating ? (
                "Generating..."
              ) : (
                "Generate Lab"
              )
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        )}
      </div>

      {isLabCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background transition-all duration-700">
          <span className="text-3xl md:text-5xl font-mono animate-pulse">{typewriterText}<span className="animate-blink">|</span></span>
          <style jsx>{`
            @keyframes blink {
              0%, 100% { opacity: 1; }
              50% { opacity: 0; }
            }
            .animate-blink {
              animation: blink 1s step-end infinite;
            }
          `}</style>
        </div>
      )}
    </div>
  )
}

// Feature Card Component
function FeatureCard({
  icon,
  title,
  description,
  className = "",
}: {
  icon: React.ReactNode
  title: string
  description: string
  className?: string
}) {
  return (
    <div
      className={`p-4 sm:p-6 rounded-lg border border-gray-800 bg-gray-900/50 hover:bg-gray-900 transition-colors ${className}`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="mt-1">{icon}</div>
        <div>
          <h4 className="text-sm sm:text-base font-bold mb-1 sm:mb-2">{title}</h4>
          <p className="text-xs sm:text-sm text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  )
}

function Label({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {children}
    </label>
  )
}
