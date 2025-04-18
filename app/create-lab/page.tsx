"use client"

import { Label as UILable } from "@/components/ui/label"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUploader } from "@/components/file-uploader"
import { ArrowLeft, Check, Beaker, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

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
  const [step, setStep] = useState<"template" | "ai-description" | "details" | "invite" | "finalize">("template")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [aiDescription, setAiDescription] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [labDetails, setLabDetails] = useState({
    name: "",
    description: "",
    researchField: "",
    institution: "",
    tags: "",
  })
  const [invitedCollaborators, setInvitedCollaborators] = useState<number[]>([])
  const [isCreating, setIsCreating] = useState(false)

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
          researchField: aiDescription.toLowerCase().includes("genomics")
            ? "biology"
            : aiDescription.toLowerCase().includes("neural")
              ? "neuroscience"
              : aiDescription.toLowerCase().includes("climate")
                ? "environmental"
                : aiDescription.toLowerCase().includes("quantum")
                  ? "physics"
                  : "other",
          institution: "",
          tags: aiDescription
            .split(" ")
            .filter((word) => word.length > 5)
            .slice(0, 5)
            .join(", "),
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

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setLabDetails({
      ...labDetails,
      [name]: value,
    })
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
      setStep("invite")
    } else if (step === "invite") {
      setStep("finalize")
    } else if (step === "finalize") {
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
    } else if (step === "finalize") {
      setStep("invite")
    }
  }

  // Handle lab creation
  const handleCreateLab = () => {
    setIsCreating(true)
    // Simulate API call
    setTimeout(() => {
      setIsCreating(false)
      // Redirect to the new lab page
      window.location.href = "/"
    }, 2000)
  }

  // Get selected template data
  const getSelectedTemplate = () => {
    return labTemplates.find((t) => t.id === selectedTemplate)
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
              className={`relative cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${selectedTemplate === template.id ? "ring-2 ring-accent" : ""}`}
              onClick={() => handleSelectTemplate(template.id)}
            >
              <Card className="overflow-hidden h-full">
                <div className="relative h-40 overflow-hidden">
                  <div className={`absolute inset-0 ${template.color} opacity-20`}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <template.icon className="h-20 w-20 text-accent opacity-40" />
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="mt-1">{template.description}</CardDescription>
                    </div>
                    {selectedTemplate === template.id && (
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
    return (
      <>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-wide mb-2">Lab Details</h1>
          <p className="text-muted-foreground">Provide information about your lab</p>
        </div>

        <div className="space-y-6 max-w-2xl mx-auto">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <UILable htmlFor="research-field">Research Field</UILable>
              <Select
                value={labDetails.researchField}
                onValueChange={(value) => handleSelectChange("researchField", value)}
              >
                <SelectTrigger id="research-field">
                  <SelectValue placeholder="Select primary field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neuroscience">Neuroscience</SelectItem>
                  <SelectItem value="ai">Artificial Intelligence</SelectItem>
                  <SelectItem value="biology">Biology</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="medicine">Medicine</SelectItem>
                  <SelectItem value="environmental">Environmental Science</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <UILable htmlFor="institution">Institution</UILable>
              <Input
                id="institution"
                name="institution"
                value={labDetails.institution}
                onChange={handleInputChange}
                placeholder="University or organization"
              />
            </div>
          </div>

          <div className="space-y-2">
            <UILable htmlFor="lab-tags">Tags</UILable>
            <Input
              id="lab-tags"
              name="tags"
              value={labDetails.tags}
              onChange={handleInputChange}
              placeholder="Enter tags separated by commas (e.g., brain mapping, cognitive science)"
            />
            <p className="text-xs text-muted-foreground">Tags help others discover your lab</p>
          </div>

          <div className="space-y-2">
            <UILable>Lab Logo</UILable>
            <FileUploader onChange={() => {}} />
            <p className="text-xs text-muted-foreground">Recommended size: 400x400px. Max file size: 2MB.</p>
          </div>
        </div>
      </>
    )
  }

  // Render invite collaborators step
  const renderInviteStep = () => {
    return (
      <>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-wide mb-2">Invite Collaborators</h1>
          <p className="text-muted-foreground">Add team members to your lab</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Input placeholder="Search by name or email..." className="flex-1" />
              <Button variant="outline" className="border-accent text-accent hover:bg-secondary">
                Search
              </Button>
            </div>

            <div className="space-y-3">
              {sampleCollaborators.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className={`flex items-center justify-between p-3 border rounded-md transition-colors ${invitedCollaborators.includes(collaborator.id) ? "border-accent bg-secondary/30" : "border-secondary"}`}
                  onClick={() => toggleCollaborator(collaborator.id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                      <AvatarFallback>{collaborator.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{collaborator.name}</p>
                      <p className="text-sm text-muted-foreground">{collaborator.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-secondary text-foreground">{collaborator.role}</Badge>
                    {invitedCollaborators.includes(collaborator.id) ? (
                      <div className="bg-accent rounded-full p-1">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" className="border-accent text-accent hover:bg-secondary">
                        Invite
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-secondary rounded-md p-4">
            <h3 className="text-sm font-medium mb-2">Invite by Email</h3>
            <div className="flex gap-2">
              <Input placeholder="Enter email address" className="flex-1" />
              <Select defaultValue="member">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-accent text-primary-foreground hover:bg-accent/90">Send</Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Render finalize step
  const renderFinalizeStep = () => {
    const template = getSelectedTemplate()

    return (
      <>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-wide mb-2">Ready to Create Your Lab</h1>
          <p className="text-muted-foreground">Review your lab details before creating</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Lab Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className={`p-4 rounded-md ${template?.color || "bg-secondary"}`}>
                  {template && <template.icon className="h-10 w-10 text-primary-foreground" />}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium">{labDetails.name}</h3>
                  <p className="text-muted-foreground">{labDetails.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-secondary">
                <div>
                  <h4 className="text-sm font-medium mb-1">Research Field</h4>
                  <p className="text-sm">{labDetails.researchField || "Not specified"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Institution</h4>
                  <p className="text-sm">{labDetails.institution || "Not specified"}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-secondary">
                <h4 className="text-sm font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {labDetails.tags ? (
                    labDetails.tags.split(",").map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag.trim()}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No tags specified</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              {invitedCollaborators.length > 0 ? (
                <div className="space-y-3">
                  {sampleCollaborators
                    .filter((c) => invitedCollaborators.includes(c.id))
                    .map((collaborator) => (
                      <div key={collaborator.id} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                          <AvatarFallback>{collaborator.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{collaborator.name}</p>
                          <p className="text-xs text-muted-foreground">{collaborator.role}</p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No team members invited yet</p>
              )}
            </CardContent>
          </Card>

          <div className="bg-secondary/30 rounded-md p-4 mb-6">
            <h3 className="text-sm font-medium mb-2">What happens next?</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-accent mt-0.5" />
                <span>Your lab will be created with the template and settings you've chosen</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-accent mt-0.5" />
                <span>Invited collaborators will receive email invitations</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-accent mt-0.5" />
                <span>You'll be redirected to your new lab where you can start adding content</span>
              </li>
            </ul>
          </div>
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
      {step === "finalize" && renderFinalizeStep()}

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={handlePreviousStep}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Button
          onClick={handleNextStep}
          disabled={
            (step === "template" && !selectedTemplate) ||
            (step === "ai-description" && aiDescription.length < 50 && !isGenerating)
          }
          className="bg-accent text-primary-foreground hover:bg-accent/90"
        >
          {step === "finalize" ? (
            isCreating ? (
              "Creating..."
            ) : (
              "Create Lab"
            )
          ) : step === "ai-description" ? (
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
      </div>
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
