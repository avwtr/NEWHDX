"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  ArrowLeft,
  Beaker,
  Calendar,
  Clock,
  FileIcon,
  CheckCircle,
  ChevronDown,
  Plus,
  MessageSquare,
  Loader2,
  Users,
  Timer,
  BarChart3,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

// Sample experiment data
const experimentData = {
  id: "neural-network-opt",
  name: "Neural Network Optimization",
  description:
    "Optimizing neural network architecture for faster training and improved accuracy in cognitive task prediction.",
  objective:
    "Develop a more efficient neural network architecture that reduces training time by 30% while maintaining or improving accuracy.",
  status: "LIVE",
  startDate: "2024-01-15T09:00:00Z",
  categories: ["ai", "machine-learning", "neural-networks"],
  contributors: [
    { id: "1", name: "Dr. Sarah Johnson", initials: "SJ", avatar: "/placeholder.svg?height=32&width=32" },
    { id: "2", name: "Alex Kim", initials: "AK", avatar: "/placeholder.svg?height=32&width=32" },
    { id: "3", name: "Maria Lopez", initials: "ML", avatar: "/placeholder.svg?height=32&width=32" },
  ],
  files: [
    {
      id: "f1",
      name: "NEURAL_NETWORK_V2.PY",
      type: "py",
      size: "45 KB",
      addedBy: "Dr. Sarah Johnson",
      date: "1 week ago",
    },
    { id: "f2", name: "TRAINING_DATA.CSV", type: "csv", size: "1.2 MB", addedBy: "Alex Kim", date: "5 days ago" },
    {
      id: "f3",
      name: "OPTIMIZATION_RESULTS.JSON",
      type: "json",
      size: "128 KB",
      addedBy: "Maria Lopez",
      date: "2 days ago",
    },
  ],
  events: [
    { id: "e1", type: "creation", description: "Experiment created", user: "Dr. Sarah Johnson", date: "Jan 15, 2024" },
    {
      id: "e2",
      type: "file_upload",
      description: "Initial neural network code uploaded",
      user: "Dr. Sarah Johnson",
      date: "Jan 16, 2024",
    },
    {
      id: "e3",
      type: "comment",
      description: "Identified optimization opportunity in gradient calculation",
      user: "Alex Kim",
      date: "Jan 20, 2024",
    },
    { id: "e4", type: "file_upload", description: "Training dataset uploaded", user: "Alex Kim", date: "Jan 22, 2024" },
    {
      id: "e5",
      type: "milestone",
      description: "First optimization iteration complete - 15% speed improvement",
      user: "Maria Lopez",
      date: "Jan 28, 2024",
    },
    {
      id: "e6",
      type: "file_upload",
      description: "Results from first optimization iteration",
      user: "Maria Lopez",
      date: "Jan 29, 2024",
    },
    {
      id: "e7",
      type: "comment",
      description: "Proposed second optimization approach focusing on memory usage",
      user: "Dr. Sarah Johnson",
      date: "Feb 3, 2024",
    },
    {
      id: "e8",
      type: "milestone",
      description: "Second optimization iteration complete - additional 18% speed improvement",
      user: "Alex Kim",
      date: "Feb 10, 2024",
    },
  ],
}

// Success outcome options
const outcomeOptions = [
  { id: "as-intended", label: "As Intended", description: "The experiment achieved its stated objectives" },
  {
    id: "novel-discovery",
    label: "Novel Discovery",
    description: "The experiment led to unexpected but valuable findings",
  },
  { id: "partial-success", label: "Partial Success", description: "Some objectives were met, but not all" },
  {
    id: "inconclusive",
    label: "Inconclusive",
    description: "Results were unclear or insufficient to draw conclusions",
  },
  {
    id: "no-useful-info",
    label: "No Useful Information",
    description: "The experiment did not yield actionable insights",
  },
  { id: "technical-failure", label: "Technical Failure", description: "Technical issues prevented proper execution" },
]

// Animated counter component
function AnimatedCounter({ value, label, icon }: { value: number; label: string; icon: React.ReactNode }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (count < value) {
      const timeout = setTimeout(() => {
        setCount((prev) => Math.min(prev + 1, value))
      }, 50)
      return () => clearTimeout(timeout)
    }
  }, [count, value])

  return (
    <Card className="bg-accent/10 border-accent/20">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-accent/20 p-3">{icon}</div>
          <div>
            <div className="text-3xl font-bold text-accent">{count}</div>
            <div className="text-sm text-muted-foreground">{label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ConcludeExperimentPage() {
  const [isEventsExpanded, setIsEventsExpanded] = useState(false)
  const [isFilesExpanded, setIsFilesExpanded] = useState(false)
  const [isContributorsExpanded, setIsContributorsExpanded] = useState(false)
  const [conclusionDescription, setConclusionDescription] = useState("")
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showMetrics, setShowMetrics] = useState(false)

  // Calculate running time
  const runningTime = formatDistanceToNow(new Date(experimentData.startDate), { addSuffix: false })

  // Show metrics with a slight delay for animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMetrics(true)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const handleConcludeExperiment = () => {
    if (!selectedOutcome || !conclusionDescription.trim()) {
      alert("Please select an outcome and provide a conclusion description")
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSuccess(true)

      // Redirect after showing success animation
      setTimeout(() => {
        window.location.href = "/experiments"
      }, 2000)
    }, 2000)
  }

  // Helper function to get file icon based on type
  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "csv":
      case "xlsx":
        return <FileIcon className="h-4 w-4 text-blue-500" />
      case "py":
      case "js":
        return <FileIcon className="h-4 w-4 text-green-500" />
      case "json":
        return <FileIcon className="h-4 w-4 text-yellow-500" />
      default:
        return <FileIcon className="h-4 w-4 text-accent" />
    }
  }

  // Helper function to get event icon based on type
  const getEventIcon = (type: string) => {
    switch (type) {
      case "creation":
        return <Beaker className="h-4 w-4 text-accent" />
      case "file_upload":
        return <FileIcon className="h-4 w-4 text-accent" />
      case "comment":
        return <MessageSquare className="h-4 w-4 text-accent" />
      case "milestone":
        return <CheckCircle className="h-4 w-4 text-accent" />
      default:
        return <MessageSquare className="h-4 w-4 text-accent" />
    }
  }

  if (isSuccess) {
    return (
      <div className="container mx-auto py-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-accent mx-auto animate-pulse" />
          <h1 className="text-2xl font-bold">Experiment Concluded Successfully</h1>
          <p className="text-muted-foreground">
            The experiment has been marked as concluded and all data has been saved.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href="/experiments/view" className="flex items-center text-sm hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Experiment
        </Link>
      </div>

      <div className="flex flex-col space-y-8">
        {/* Experiment Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-accent/20 p-2 rounded-lg">
                <Beaker className="h-6 w-6 text-accent" />
              </div>
              <h1 className="text-2xl font-bold">Conclude Experiment: {experimentData.name}</h1>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {experimentData.categories.map((category) => (
                <Badge key={category} className="bg-accent text-primary-foreground">
                  {category.toUpperCase()}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Started: {new Date(experimentData.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>Running: {runningTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Experiment Summary Banner */}
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-6 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-500">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-semibold">Experiment Summary</h2>
          </div>

          <p className="text-muted-foreground mb-6">
            This experiment has concluded. Review the summary below and provide your final assessment.
          </p>

          {/* Animated Metrics */}
          <div
            className={`grid grid-cols-1 md:grid-cols-4 gap-4 transition-all duration-1000 ${showMetrics ? "opacity-100 transform-none" : "opacity-0 translate-y-4"}`}
          >
            <AnimatedCounter
              value={experimentData.events.length}
              label="Total Events"
              icon={<MessageSquare className="h-5 w-5 text-accent" />}
            />
            <AnimatedCounter
              value={experimentData.files.length}
              label="Materials Used"
              icon={<FileIcon className="h-5 w-5 text-accent" />}
            />
            <AnimatedCounter
              value={experimentData.contributors.length}
              label="Contributors"
              icon={<Users className="h-5 w-5 text-accent" />}
            />
            <AnimatedCounter value={27} label="Days Active" icon={<Timer className="h-5 w-5 text-accent" />} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Experiment Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Experiment Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">OBJECTIVE</h3>
                    <p className="text-sm">{experimentData.objective}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">DESCRIPTION</h3>
                    <p className="text-sm">{experimentData.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conclusion Details */}
            <Card>
              <CardHeader>
                <CardTitle>Conclusion Details</CardTitle>
                <CardDescription>Provide a summary of the experiment's outcomes and your assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="conclusion-description" className="text-sm font-medium">
                      Conclusion Description
                    </Label>
                    <Textarea
                      id="conclusion-description"
                      placeholder="Describe the outcomes, findings, and conclusions of this experiment..."
                      className="min-h-[150px]"
                      value={conclusionDescription}
                      onChange={(e) => setConclusionDescription(e.target.value)}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Outcome Assessment</Label>
                    <RadioGroup value={selectedOutcome || ""} onValueChange={setSelectedOutcome}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {outcomeOptions.map((option) => (
                          <div key={option.id} className="flex items-start space-x-2">
                            <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                            <div className="grid gap-1 leading-none">
                              <Label htmlFor={option.id} className="font-medium">
                                {option.label}
                              </Label>
                              <p className="text-xs text-muted-foreground">{option.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Compact Summaries */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Events Timeline</CardTitle>
                  <Badge variant="outline">{experimentData.events.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <Collapsible open={isEventsExpanded} onOpenChange={setIsEventsExpanded}>
                  <div className="space-y-2 text-sm">
                    {experimentData.events.slice(0, isEventsExpanded ? undefined : 3).map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-2 p-1.5 rounded-md hover:bg-secondary/50 text-xs"
                      >
                        {getEventIcon(event.type)}
                        <div>
                          <p className="font-medium">{event.description}</p>
                          <p className="text-muted-foreground text-xs">
                            {event.user} • {event.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {experimentData.events.length > 3 && (
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full mt-2 h-7 text-xs">
                        {isEventsExpanded ? "Show Less" : `Show All (${experimentData.events.length})`}
                        <ChevronDown
                          className={`h-3 w-3 ml-1 transition-transform ${isEventsExpanded ? "rotate-180" : ""}`}
                        />
                      </Button>
                    </CollapsibleTrigger>
                  )}
                </Collapsible>

                <Button variant="outline" size="sm" className="w-full mt-3 h-7 text-xs border-accent text-accent">
                  <Plus className="h-3 w-3 mr-1" />
                  Add Final Event
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Materials Used</CardTitle>
                  <Badge variant="outline">{experimentData.files.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <Collapsible open={isFilesExpanded} onOpenChange={setIsFilesExpanded}>
                  <div className="space-y-2 text-sm">
                    {experimentData.files.slice(0, isFilesExpanded ? undefined : 3).map((file) => (
                      <div
                        key={file.id}
                        className="flex items-start gap-2 p-1.5 rounded-md hover:bg-secondary/50 text-xs"
                      >
                        {getFileIcon(file.type)}
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {file.size} • {file.addedBy}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {experimentData.files.length > 3 && (
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full mt-2 h-7 text-xs">
                        {isFilesExpanded ? "Show Less" : `Show All (${experimentData.files.length})`}
                        <ChevronDown
                          className={`h-3 w-3 ml-1 transition-transform ${isFilesExpanded ? "rotate-180" : ""}`}
                        />
                      </Button>
                    </CollapsibleTrigger>
                  )}
                </Collapsible>

                <Button variant="outline" size="sm" className="w-full mt-3 h-7 text-xs border-accent text-accent">
                  <Plus className="h-3 w-3 mr-1" />
                  Add Final Material
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Contributors</CardTitle>
                  <Badge variant="outline">{experimentData.contributors.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <Collapsible open={isContributorsExpanded} onOpenChange={setIsContributorsExpanded}>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {experimentData.contributors
                        .slice(0, isContributorsExpanded ? undefined : 3)
                        .map((contributor) => (
                          <div
                            key={contributor.id}
                            className="flex items-center gap-1.5 bg-secondary/50 rounded-full px-2 py-1 text-xs"
                          >
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={contributor.avatar} alt={contributor.name} />
                              <AvatarFallback className="text-[10px]">{contributor.initials}</AvatarFallback>
                            </Avatar>
                            <span>{contributor.name}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {experimentData.contributors.length > 3 && (
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full mt-2 h-7 text-xs">
                        {isContributorsExpanded ? "Show Less" : `Show All (${experimentData.contributors.length})`}
                        <ChevronDown
                          className={`h-3 w-3 ml-1 transition-transform ${isContributorsExpanded ? "rotate-180" : ""}`}
                        />
                      </Button>
                    </CollapsibleTrigger>
                  )}
                </Collapsible>

                <Button variant="outline" size="sm" className="w-full mt-3 h-7 text-xs border-accent text-accent">
                  <Plus className="h-3 w-3 mr-1" />
                  Add Contributor
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button
            onClick={handleConcludeExperiment}
            className="bg-accent text-primary-foreground hover:bg-accent/90"
            disabled={isSubmitting || !selectedOutcome || !conclusionDescription.trim()}
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Concluding Experiment...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Conclude Experiment
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
