"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ArrowLeft,
  Beaker,
  Calendar,
  Clock,
  FileIcon,
  CheckCircle,
  Upload,
  FileText,
  Trash2,
  UserPlus,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { FileList } from "@/components/file-list"
import { Timeline } from "@/components/timeline"
import { CustomEventDialog } from "@/components/custom-event-dialog"
import { supabase } from "@/lib/supabase"

// Add science categories mapping
const scienceCategories = {
  "biochemistry": {
    color: "bg-blue-600",
    label: "BIOCHEMISTRY"
  },
  "molecular-biology": {
    color: "bg-green-600",
    label: "MOLECULAR BIOLOGY"
  },
  "genetics": {
    color: "bg-purple-600",
    label: "GENETICS"
  },
  "cell-biology": {
    color: "bg-red-600",
    label: "CELL BIOLOGY"
  },
  "neuroscience": {
    color: "bg-indigo-600",
    label: "NEUROSCIENCE"
  },
  "immunology": {
    color: "bg-pink-600",
    label: "IMMUNOLOGY"
  },
  "microbiology": {
    color: "bg-yellow-600",
    label: "MICROBIOLOGY"
  },
  "biophysics": {
    color: "bg-cyan-600",
    label: "BIOPHYSICS"
  },
  "bioinformatics": {
    color: "bg-orange-600",
    label: "BIOINFORMATICS"
  },
  "pharmacology": {
    color: "bg-teal-600",
    label: "PHARMACOLOGY"
  }
} as const

// Add sample data for timeline and contributions
const timelineEvents = [
  {
    id: "1",
    date: "2024-03-15",
    event: "Experiment Started",
    description: "Initial setup and calibration completed"
  },
  {
    id: "2",
    date: "2024-03-16",
    event: "Data Collection",
    description: "First round of measurements recorded"
  },
  {
    id: "3",
    date: "2024-03-17",
    event: "Analysis",
    description: "Preliminary results analyzed"
  }
]

const contributions = [
  {
    id: "1",
    title: "Additional Data Analysis",
    description: "Provided supplementary statistical analysis of the results",
    date: "2024-03-18",
    status: "pending",
    contributor: {
      name: "Dr. Jane Smith",
      avatar: "/placeholder.svg",
      initials: "JS"
    }
  }
]

const labMaterials = [
  {
    id: "1",
    name: "Protocol Document",
    size: "2.4 MB",
    date: "2024-03-15"
  },
  {
    id: "2",
    name: "Calibration Data",
    size: "1.8 MB",
    date: "2024-03-14"
  }
]

export default function ExperimentViewPage() {
  const params = useParams()
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id
  const [experiment, setExperiment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // State for UI
  const [activeTab, setActiveTab] = useState("overview")
  const [runningTime, setRunningTime] = useState("")
  const [experimentFiles, setExperimentFiles] = useState<any[]>([])
  const [customEventDialogOpen, setCustomEventDialogOpen] = useState(false)
  const [addContributorDialogOpen, setAddContributorDialogOpen] = useState(false)
  const [concludeDialogOpen, setConcludeDialogOpen] = useState(false)
  const [addFromLabDialogOpen, setAddFromLabDialogOpen] = useState(false)
  const [selectedLabFiles, setSelectedLabFiles] = useState<string[]>([])
  const [concludeReason, setConcludeReason] = useState("")
  const [isSubmittingConclusion, setIsSubmittingConclusion] = useState(false)
  const [contributorSearch, setContributorSearch] = useState("")
  const [showContributionDetails, setShowContributionDetails] = useState<string | null>(null)

  // Refs
  const statusIndicatorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    supabase
      .from("experiments")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching experiment:", error)
          return
        }
        setExperiment(data)
        setLoading(false)
      })
  }, [id])

  useEffect(() => {
    if (experiment) {
      setExperimentFiles(experiment.files || [])
    }
  }, [experiment])

  useEffect(() => {
    if (experiment?.created_at) {
      const startDate = new Date(experiment.created_at)
      
      // Validate the date
      if (isNaN(startDate.getTime())) {
        console.error("Invalid date:", experiment.created_at)
        setRunningTime("Invalid date")
        return
      }

      const updateRunningTime = () => {
        try {
          setRunningTime(formatDistanceToNow(startDate, { addSuffix: false }))
        } catch (error) {
          console.error("Error formatting date:", error)
          setRunningTime("Error calculating time")
        }
      }

      updateRunningTime()
      const interval = setInterval(updateRunningTime, 1000)

      return () => clearInterval(interval)
    }
  }, [experiment])

  useEffect(() => {
    if (experiment && statusIndicatorRef.current) {
      const interval = setInterval(() => {
        if (statusIndicatorRef.current) {
          statusIndicatorRef.current.classList.toggle("opacity-50")
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [experiment])

  const handleAddCustomEvent = (event: any) => {
    console.log("Adding custom event:", event)
    // In a real app, this would update the database
    setCustomEventDialogOpen(false)
  }

  const handleAddContributor = () => {
    // In a real app, this would add the contributor
    setAddContributorDialogOpen(false)
  }

  const handleConcludeExperiment = () => {
    if (!concludeReason.trim()) return

    setIsSubmittingConclusion(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmittingConclusion(false)
      setConcludeDialogOpen(false)

      // In a real app, this would update the experiment status and redirect to a conclusion page
      window.location.href = "/experiments/conclude"
    }, 1500)
  }

  const handleAddFromLab = () => {
    // In a real app, this would add the selected files to the experiment
    console.log("Adding files from lab:", selectedLabFiles)
    setAddFromLabDialogOpen(false)
    setSelectedLabFiles([])
  }

  const toggleLabFileSelection = (fileId: string) => {
    if (selectedLabFiles.includes(fileId)) {
      setSelectedLabFiles(selectedLabFiles.filter((id) => id !== fileId))
    } else {
      setSelectedLabFiles([...selectedLabFiles, fileId])
    }
  }

  const toggleContributionDetails = (id: string) => {
    if (showContributionDetails === id) {
      setShowContributionDetails(null)
    } else {
      setShowContributionDetails(id)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!experiment) return <div>Experiment not found.</div>

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
              <div className="relative">
                <Beaker className="h-6 w-6 text-accent" />
                <div
                  ref={statusIndicatorRef}
                  className={`absolute -top-1 -right-1 h-3 w-3 rounded-full ${
                    experiment.status === "LIVE" ? "bg-green-500" : "bg-red-500"
                  } transition-opacity duration-500`}
                ></div>
              </div>
              <h1 className="text-2xl font-bold">{experiment.name}</h1>
              <Badge className={`${experiment.status === "LIVE" ? "bg-green-600" : "bg-red-600"} text-white`}>
                {experiment.status}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {experiment.categories?.map((category: string) => (
                <Badge
                  key={category}
                  className={scienceCategories[category as keyof typeof scienceCategories]?.color || "bg-gray-600"}
                >
                  {scienceCategories[category as keyof typeof scienceCategories]?.label || category.toUpperCase()}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Started: {new Date(experiment.start_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>Running: {runningTime}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-accent text-accent hover:bg-secondary"
              onClick={() => setConcludeDialogOpen(true)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Conclude Experiment
            </Button>
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
              value="files"
              className="data-[state=active]:bg-accent data-[state=active]:text-primary-foreground"
            >
              FILES
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="data-[state=active]:bg-accent data-[state=active]:text-primary-foreground"
            >
              TIMELINE
            </TabsTrigger>
            <TabsTrigger
              value="contributors"
              className="data-[state=active]:bg-accent data-[state=active]:text-primary-foreground"
            >
              CONTRIBUTORS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Objective</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{experiment.objective}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{experiment.description}</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle>Contributors</CardTitle>
                  <Button variant="outline" size="sm" className="h-8" onClick={() => setActiveTab("contributors")}>
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {experiment.contributors?.slice(0, 3).map((contributor: any) => (
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
                    {experiment.contributors?.length > 3 && (
                      <Button
                        variant="ghost"
                        className="w-full text-accent"
                        onClick={() => setActiveTab("contributors")}
                      >
                        View {experiment.contributors.length - 3} more contributors
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle>Recent Activity</CardTitle>
                  <Button variant="outline" size="sm" className="h-8" onClick={() => setActiveTab("timeline")}>
                    View Timeline
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {timelineEvents.slice(0, 3).map((event) => (
                      <div key={event.id} className="border-l-2 border-accent pl-4 py-1">
                        <p className="text-sm text-muted-foreground">{event.date}</p>
                        <p className="font-medium">{event.event}</p>
                        <p className="text-sm">{event.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>External Contributions</CardTitle>
                <Badge variant="outline">{contributions.length}</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contributions.length > 0 ? (
                    contributions.map((contribution) => (
                      <div key={contribution.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={contribution.contributor.avatar || "/placeholder.svg"}
                                alt={contribution.contributor.name}
                              />
                              <AvatarFallback>{contribution.contributor.initials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{contribution.title}</p>
                              <p className="text-sm text-muted-foreground">
                                By {contribution.contributor.name} • {contribution.date}
                              </p>
                            </div>
                          </div>
                          <Badge className={contribution.status === "pending" ? "bg-amber-500" : "bg-green-500"}>
                            {contribution.status.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-auto flex items-center gap-1 text-accent"
                            onClick={() => toggleContributionDetails(contribution.id)}
                          >
                            {showContributionDetails === contribution.id ? (
                              <>
                                <ChevronUp className="h-4 w-4" />
                                Hide Details
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4" />
                                Show Details
                              </>
                            )}
                          </Button>

                          {showContributionDetails === contribution.id && (
                            <div className="mt-2 text-sm">
                              <p>{contribution.description}</p>

                              {contribution.status === "pending" && (
                                <div className="flex gap-2 mt-3">
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-500 border-red-500 hover:bg-red-500/10"
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <h3 className="text-lg font-medium mb-1">No Contributions Yet</h3>
                      <p className="text-sm text-muted-foreground">
                        External contributions to your experiment will appear here.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Experiment Files</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setAddFromLabDialogOpen(true)}>
                    <FileText className="h-4 w-4 mr-2" />
                    Add from Lab Materials
                  </Button>
                  <Button className="bg-accent text-primary-foreground hover:bg-accent/90">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New Files
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <FileList
                  files={experimentFiles.map((file) => ({
                    ...file,
                    addedBy: file.uploadedBy,
                  }))}
                  experimentId={experiment.id}
                />
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
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                  onClick={() => setCustomEventDialogOpen(true)}
                >
                  ADD CUSTOM EVENT
                </Button>
              </CardHeader>
              <CardContent>
                <Timeline events={timelineEvents} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contributors" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Experiment Contributors</CardTitle>
                <Button
                  className="bg-accent text-primary-foreground hover:bg-accent/90"
                  onClick={() => setAddContributorDialogOpen(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Contributor
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {experiment.contributors?.map((contributor: any) => (
                      <div key={contributor.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={contributor.avatar || "/placeholder.svg"} alt={contributor.name} />
                          <AvatarFallback>{contributor.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{contributor.name}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              Experiment Admin
                            </Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="ml-auto">
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Custom Event Dialog */}
      <CustomEventDialog
        open={customEventDialogOpen}
        onOpenChange={setCustomEventDialogOpen}
        experimentId={experiment.id}
        onAddEvent={handleAddCustomEvent}
      />

      {/* Add Contributor Dialog */}
      <Dialog open={addContributorDialogOpen} onOpenChange={setAddContributorDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Contributor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="contributor-search">Search Users</Label>
              <Input
                id="contributor-search"
                placeholder="Search by name or email"
                value={contributorSearch}
                onChange={(e) => setContributorSearch(e.target.value)}
              />
            </div>

            <div className="border rounded-md">
              <div className="p-4 border-b">
                <p className="font-medium">Search Results</p>
              </div>
              <div className="p-2">
                {contributorSearch ? (
                  <div className="flex items-center gap-3 p-2 hover:bg-secondary rounded-md cursor-pointer">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/javascript-code.png" alt="John Smith" />
                      <AvatarFallback>JS</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">John Smith</p>
                      <p className="text-sm text-muted-foreground">john.smith@example.com</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground p-2">Search for users to add as contributors</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddContributorDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddContributor}>Add Contributor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Conclude Experiment Dialog */}
      <Dialog open={concludeDialogOpen} onOpenChange={setConcludeDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Conclude Experiment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center p-3 bg-amber-500/10 border border-amber-500/30 rounded-md">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
              <p className="text-sm">
                Concluding this experiment will mark it as complete and generate a summary report. This action cannot be
                undone.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="conclude-reason">Conclusion Summary</Label>
              <Textarea
                id="conclude-reason"
                placeholder="Summarize the results and outcomes of this experiment..."
                value={concludeReason}
                onChange={(e) => setConcludeReason(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConcludeDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConcludeExperiment}
              disabled={!concludeReason.trim() || isSubmittingConclusion}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmittingConclusion ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Concluding...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Conclude Experiment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add from Lab Materials Dialog */}
      <Dialog open={addFromLabDialogOpen} onOpenChange={setAddFromLabDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Add from Lab Materials</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input placeholder="Search lab materials..." />

            <ScrollArea className="h-[300px] border rounded-md">
              <div className="divide-y">
                {labMaterials.map((file) => (
                  <div
                    key={file.id}
                    className={`flex items-center justify-between p-3 hover:bg-secondary/50 cursor-pointer ${
                      selectedLabFiles.includes(file.id) ? "bg-accent/10" : ""
                    }`}
                    onClick={() => toggleLabFileSelection(file.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                        <FileIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">{file.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {file.size} • Uploaded {file.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-sm border flex items-center justify-center ${
                          selectedLabFiles.includes(file.id) ? "bg-accent border-accent text-white" : "border-input"
                        }`}
                      >
                        {selectedLabFiles.includes(file.id) && <CheckCircle className="h-3 w-3" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{selectedLabFiles.length} file(s) selected</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLabFiles([])}
                disabled={selectedLabFiles.length === 0}
              >
                Clear Selection
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddFromLabDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFromLab} disabled={selectedLabFiles.length === 0}>
              Add Selected Files
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
