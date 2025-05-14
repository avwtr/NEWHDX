"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Beaker, Sparkles, FlaskRoundIcon as Flask, DollarSign, Upload, Globe, Activity } from "lucide-react"
import { LabPreview } from "@/components/lab-preview"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"

// Custom color
const CUSTOM_GREEN = "#A0FFDD"

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

export function CreateLab() {
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
  const { user } = useAuth()

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
    setTimeout(async () => {
      setIsCreating(false)
      // Insert lab with org_id if selected
      // (Replace this with your actual API call)
      const labPayload = {
        ...labDetails,
      }
      // Example: await supabase.from("labs").insert(labPayload)
      // Redirect to the new lab page
      window.location.href = "/"
    }, 2000)
  }

  // Get selected template data
  const getSelectedTemplate = () => {
    return labTemplates.find((t) => t.id === selectedTemplate)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6"></div>

      <div className="space-y-6 sm:space-y-8">
        {/* Intro Text */}
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-0">
          <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4" style={{ color: CUSTOM_GREEN }}>
            AN OPEN-SOURCE HOME FOR YOUR RESEARCH
          </h3>
          <p className="text-sm sm:text-base text-gray-300">
            However radical your interests may be: freely create your own lab, manage lab materials, receive funding,
            invite outside contributors, launch experiments and start advancing science.
          </p>
        </div>

        {/* Lab Preview */}
        <div className="mt-6 sm:mt-8 overflow-x-hidden">
          <LabPreview />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-8 sm:mt-12 px-4 sm:px-0">
          <FeatureCard
            icon={<Globe className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: CUSTOM_GREEN }} />}
            title="PUBLIC, OPEN-SOURCE HUB"
            description="Create a public, open-source hub for your research that anyone can access, contribute to, and build upon."
          />

          <FeatureCard
            icon={<Upload className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: CUSTOM_GREEN }} />}
            title="UPLOAD & MANAGE CONTENT"
            description="Upload, create, and manage data, documents, protocols, code, and models all in one place."
          />

          <FeatureCard
            icon={<DollarSign className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: CUSTOM_GREEN }} />}
            title="COLLECT FUNDING"
            description="Receive donations and offer lab memberships to fund your research and sustain your work."
          />

          <FeatureCard
            icon={<Flask className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: CUSTOM_GREEN }} />}
            title="LAUNCH EXPERIMENTS"
            description="Create trackable experiments with file and event tracking to document your research process."
          />

          <FeatureCard
            icon={<Activity className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: CUSTOM_GREEN }} />}
            title="TRACK LAB ACTIVITY"
            description="All lab activity is tracked and visualized so you can better understand your end-to-end scientific process."
          />
        </div>

        {/* Lab Details Fields */}
        <div className="space-y-4">
          <div className="mb-4">
            <label htmlFor="lab-description" className="block text-sm font-bold mb-2">
              Description
            </label>
            <textarea
              id="lab-description"
              name="description"
              value={labDetails.description}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2 bg-background text-foreground"
              rows={4}
              placeholder="Describe your lab's mission and research focus..."
            />
          </div>
        </div>
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