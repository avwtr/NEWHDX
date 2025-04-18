"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Beaker,
  Calendar,
  Clock,
  FileIcon,
  CheckCircle,
  Download,
  Send,
  Upload,
  Edit,
  Users,
  BarChart3,
  FileText,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Timeline } from "@/components/timeline"
import { FileList } from "@/components/file-list"
import { ContributionDialog } from "@/components/contribution-dialog"
import { ExperimentDataContribution } from "@/components/experiment-data-contribution"

// Sample experiment data - in a real app, this would come from an API
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
  dataTypes: ["tabular", "anecdotal", "survey", "file", "measurement"],
  contributionsCount: 87,
  contributionStats: {
    tabular: 42,
    anecdotal: 15,
    survey: 22,
    file: 8,
  },
}

// Sample timeline events
const timelineEvents = [
  {
    id: "event-1",
    date: "Jan 15, 2024",
    event: "EXPERIMENT STARTED",
    description: "Initial setup and calibration of neural network architecture.",
  },
  {
    id: "event-2",
    date: "Jan 20, 2024",
    event: "FIRST TRAINING RUN",
    description: "Completed first training run with baseline architecture.",
  },
  {
    id: "event-3",
    date: "Feb 5, 2024",
    event: "ARCHITECTURE MODIFICATION",
    description: "Implemented new layer structure based on initial results.",
  },
]

// Science categories with their corresponding colors
const scienceCategories = {
  neuroscience: { label: "NEUROSCIENCE", color: "badge-neuroscience" },
  "brain-mapping": { label: "BRAIN MAPPING", color: "badge-neuroscience" },
  "cognitive-science": { label: "COGNITIVE SCIENCE", color: "badge-psychology" },
  ai: { label: "AI", color: "badge-ai" },
  "machine-learning": { label: "MACHINE LEARNING", color: "badge-ai" },
  "neural-networks": { label: "NEURAL NETWORKS", color: "badge-ai" },
}

export default function ExperimentViewPage() {
  // State for UI
  const [activeTab, setActiveTab] = useState("overview")
  const [runningTime, setRunningTime] = useState("")
  const [contributionDialogOpen, setContributionDialogOpen] = useState(false)
  const [experimentFiles, setExperimentFiles] = useState<any[]>([])
  const [fileViewDialogOpen, setFileViewDialogOpen] = useState(false)
  const [currentViewFile, setCurrentViewFile] = useState<any>(null)
  const [customEventDialogOpen, setCustomEventDialogOpen] = useState(false)
  const [eventName, setEventName] = useState("")
  const [eventDescription, setEventDescription] = useState("")
  const [uploadFilesDialogOpen, setUploadFilesDialogOpen] = useState(false)
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [uploadFileMetadata, setUploadFileMetadata] = useState<Record<string, { name: string; description: string }>>(
    {},
  )

  // Simple role state (in a real app, this would come from authentication)
  const [isAdmin, setIsAdmin] = useState(false)

  // Add a useEffect to simulate role checking
  useEffect(() => {
    // Simulate checking user role - in a real app, this would come from authentication
    const checkUserRole = () => {
      // For demo purposes, we'll just set a role
      setIsAdmin(true) // Set to true to show admin features, false to hide them
    }

    checkUserRole()
  }, [])

  // Initialize experiment files from the static data
  useEffect(() => {
    setExperimentFiles(experimentData.files || [])
  }, [])

  // Update running time every second
  useEffect(() => {
    const startDate = new Date(experimentData.startDate)

    const updateRunningTime = () => {
      setRunningTime(formatDistanceToNow(startDate, { addSuffix: false }))
    }

    updateRunningTime()
    const interval = setInterval(updateRunningTime, 1000)

    return () => clearInterval(interval)
  }, [])

  // Helper function to get file icon based on type
  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "csv":
      case "xlsx":
        return <FileIcon className="h-5 w-5 text-blue-500" />
      case "py":
      case "js":
        return <FileIcon className="h-5 w-5 text-green-500" />
      case "json":
        return <FileIcon className="h-5 w-5 text-yellow-500" />
      case "pdf":
      case "md":
        return <FileIcon className="h-5 w-5 text-red-500" />
      default:
        return <FileIcon className="h-5 w-5 text-accent" />
    }
  }

  const handleViewFile = (file: any) => {
    setCurrentViewFile(file)
    setFileViewDialogOpen(true)
  }

  const handleAddCustomEvent = () => {
    if (!eventName || !eventDescription) return

    // Create a new event
    const newEvent = {
      id: `event-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      event: eventName,
      description: eventDescription,
    }

    // Add to timeline (in a real app, this would update the database)
    console.log("Adding custom event:", newEvent)

    // Reset form and close dialog
    setEventName("")
    setEventDescription("")
    setCustomEventDialogOpen(false)

    // Show success message
    alert("Custom event added successfully!")
  }

  const handleDataContribution = (data: any) => {
    console.log("Received data contribution:", data)
    // In a real app, this would be sent to an API
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href="/experiments" className="flex items-center text-sm hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Experiments
        </Link>
      </div>

      <div className="flex flex-col space-y-6">
        {/* Experiment Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Beaker className="h-6 w-6 text-accent" />
              <h1 className="text-2xl font-bold">{experimentData.name}</h1>
              <Badge className="bg-green-600 text-white">{experimentData.status}</Badge>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {experimentData.categories.map((category: string) => (
                <Badge
                  key={category}
                  className={scienceCategories[category as keyof typeof scienceCategories]?.color || "badge-default"}
                >
                  {scienceCategories[category as keyof typeof scienceCategories]?.label || category.toUpperCase()}
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

          <div className="flex gap-2">
            {!isAdmin && (
              <Button
                variant="default"
                className="bg-accent text-primary-foreground hover:bg-accent/90"
                onClick={() => setContributionDialogOpen(true)}
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Contribution
              </Button>
            )}

            {isAdmin && (
              <Button variant="outline" className="border-accent text-accent hover:bg-secondary" asChild>
                <Link href="/experiments/conclude">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Conclude Experiment
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Experiment Content */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full bg-secondary">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-accent data-[state=active]:text-primary-foreground"
            >
              OVERVIEW
            </TabsTrigger>
            <TabsTrigger
              value="contribute"
              className="data-[state=active]:bg-accent data-[state=active]:text-primary-foreground"
            >
              CONTRIBUTE DATA
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="data-[state=active]:bg-accent data-[state=active]:text-primary-foreground"
            >
              TIMELINE
            </TabsTrigger>
            <TabsTrigger
              value="files"
              className="data-[state=active]:bg-accent data-[state=active]:text-primary-foreground"
            >
              FILES
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Objective</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{experimentData.objective}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{experimentData.description}</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contributors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {experimentData.contributors.map((contributor: any) => (
                      <div key={contributor.id} className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={contributor.avatar || "/placeholder.svg"} alt={contributor.name} />
                          <AvatarFallback>{contributor.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{contributor.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Contributions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-accent mr-2" />
                      <span className="text-2xl font-bold">{experimentData.contributionsCount}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Total contributions</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Tabular data</span>
                        <span className="font-medium">{experimentData.contributionStats.tabular}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent"
                          style={{
                            width: `${(experimentData.contributionStats.tabular / experimentData.contributionsCount) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Anecdotal</span>
                        <span className="font-medium">{experimentData.contributionStats.anecdotal}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent"
                          style={{
                            width: `${(experimentData.contributionStats.anecdotal / experimentData.contributionsCount) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Survey responses</span>
                        <span className="font-medium">{experimentData.contributionStats.survey}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent"
                          style={{
                            width: `${(experimentData.contributionStats.survey / experimentData.contributionsCount) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>File uploads</span>
                        <span className="font-medium">{experimentData.contributionStats.file}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent"
                          style={{
                            width: `${(experimentData.contributionStats.file / experimentData.contributionsCount) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button
                      className="w-full bg-accent text-primary-foreground hover:bg-accent/90"
                      onClick={() => setActiveTab("contribute")}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Contribute Your Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contribute" className="space-y-6">
            <ExperimentDataContribution
              experimentId={experimentData.id}
              experimentName={experimentData.name}
              dataTypes={experimentData.dataTypes}
              onSubmit={handleDataContribution}
            />

            <Card>
              <CardHeader>
                <CardTitle>Why Contribute?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center text-center p-4 bg-secondary/30 rounded-lg">
                    <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center mb-3">
                      <Users className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="font-medium mb-2">Join the Community</h3>
                    <p className="text-sm text-muted-foreground">
                      Be part of a global network of researchers and enthusiasts advancing science together.
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center p-4 bg-secondary/30 rounded-lg">
                    <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center mb-3">
                      <BarChart3 className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="font-medium mb-2">See How You Compare</h3>
                    <p className="text-sm text-muted-foreground">
                      Get instant feedback on how your data compares to other contributions.
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center p-4 bg-secondary/30 rounded-lg">
                    <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center mb-3">
                      <FileText className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="font-medium mb-2">Advance Research</h3>
                    <p className="text-sm text-muted-foreground">
                      Your contributions directly help researchers make new discoveries and breakthroughs.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <Card className="bg-[#0c1138] text-white border-none">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>EXPERIMENT TIMELINE</CardTitle>
                  <p className="text-white/70 text-sm mt-1">History of events and milestones</p>
                </div>
                {isAdmin && (
                  <Button
                    variant="outline"
                    className="border-white text-white hover:bg-white/10"
                    onClick={() => setCustomEventDialogOpen(true)}
                  >
                    ADD CUSTOM EVENT
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <Timeline events={timelineEvents} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Experiment Files</CardTitle>
                {isAdmin && (
                  <Button
                    className="bg-accent text-primary-foreground hover:bg-accent/90"
                    onClick={() => setUploadFilesDialogOpen(true)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <FileList files={experimentFiles} experimentId={experimentData.id} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Contribution Dialog */}
      <ContributionDialog
        open={contributionDialogOpen}
        onOpenChange={setContributionDialogOpen}
        experimentId={experimentData.id}
        experimentName={experimentData.name}
      />

      {/* File View Dialog */}
      <Dialog
        open={fileViewDialogOpen}
        onOpenChange={(open) => {
          setFileViewDialogOpen(open)
          if (!open) setCurrentViewFile(null)
        }}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          {currentViewFile && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getFileIcon(currentViewFile.type)}
                  {currentViewFile.name}
                </DialogTitle>
              </DialogHeader>

              <div className="py-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div>Size: {currentViewFile.size}</div>
                  <div>Added by: {currentViewFile.addedBy || currentViewFile.author}</div>
                  <div>Date: {currentViewFile.date}</div>
                </div>

                <div className="border rounded-md p-4 bg-secondary/20 font-mono text-sm overflow-x-auto">
                  {/* This would be the actual file content in a real app */}
                  <p className="text-muted-foreground">File preview would appear here.</p>
                  <p className="text-muted-foreground">
                    For {currentViewFile.type} files, appropriate rendering would be shown.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setFileViewDialogOpen(false)}>
                  Close
                </Button>
                {isAdmin && (
                  <Button className="bg-accent text-primary-foreground hover:bg-accent/90">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit File
                  </Button>
                )}
                <Button className="bg-accent text-primary-foreground hover:bg-accent/90">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Custom Event Dialog */}
      <Dialog open={customEventDialogOpen} onOpenChange={setCustomEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="event-name">Event Name</Label>
              <Input
                id="event-name"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Enter event name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-description">Description</Label>
              <Textarea
                id="event-description"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="Describe the event"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomEventDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCustomEvent}>Add Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
