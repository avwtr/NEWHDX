"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FlaskConical, Search, Calendar, Clock, Filter, ArrowUpDown, ArrowLeft } from "lucide-react"
import { format, parseISO } from "date-fns"
import { useRouter } from "next/navigation"
import Link from "next/link"

// Sample experiments data
const experimentsData = [
  {
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
  },
  {
    id: "fmri-data-analysis",
    name: "fMRI Data Analysis",
    description: "Analyzing fMRI data to identify brain activity patterns during cognitive tasks.",
    objective:
      "Identify specific brain regions activated during complex problem-solving tasks and map the connectivity patterns.",
    status: "LIVE",
    startDate: "2024-02-01T10:15:00Z",
    categories: ["neuroscience", "brain-mapping", "cognitive-science"],
    contributors: [
      { id: "1", name: "Dr. Sarah Johnson", initials: "SJ", avatar: "/placeholder.svg?height=32&width=32" },
      { id: "4", name: "Robert Chen", initials: "RC", avatar: "/placeholder.svg?height=32&width=32" },
    ],
  },
  {
    id: "cognitive-enhancement",
    name: "Cognitive Enhancement Study",
    description: "Investigating the effects of neurofeedback training on cognitive performance.",
    objective: "Determine if neurofeedback training can improve working memory and attention in healthy adults.",
    status: "CONCLUDED",
    startDate: "2023-09-10T08:30:00Z",
    endDate: "2024-01-05T17:00:00Z",
    categories: ["neuroscience", "cognitive-science", "neurofeedback"],
    contributors: [
      { id: "1", name: "Dr. Sarah Johnson", initials: "SJ", avatar: "/placeholder.svg?height=32&width=32" },
      { id: "5", name: "Emily Wilson", initials: "EW", avatar: "/placeholder.svg?height=32&width=32" },
    ],
    results:
      "Participants showed a 15% improvement in working memory tasks and a 12% improvement in sustained attention following 8 weeks of neurofeedback training.",
  },
  {
    id: "brain-computer-interface",
    name: "Brain-Computer Interface Development",
    description: "Developing a non-invasive BCI for assistive technology applications.",
    objective:
      "Create a reliable BCI system that can interpret EEG signals for basic device control with >90% accuracy.",
    status: "LIVE",
    startDate: "2023-11-15T11:00:00Z",
    categories: ["neuroscience", "brain-computer-interface", "assistive-technology"],
    contributors: [
      { id: "1", name: "Dr. Sarah Johnson", initials: "SJ", avatar: "/placeholder.svg?height=32&width=32" },
      { id: "2", name: "Alex Kim", initials: "AK", avatar: "/placeholder.svg?height=32&width=32" },
      { id: "6", name: "David Lee", initials: "DL", avatar: "/placeholder.svg?height=32&width=32" },
    ],
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
  neurofeedback: { label: "NEUROFEEDBACK", color: "badge-neuroscience" },
  "brain-computer-interface": { label: "BRAIN-COMPUTER INTERFACE", color: "badge-neuroscience" },
  "assistive-technology": { label: "ASSISTIVE TECHNOLOGY", color: "badge-medicine" },
}

export default function ExperimentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOption, setSortOption] = useState("recent")
  const router = useRouter()

  // Filter experiments based on search query and status
  const filteredExperiments = experimentsData.filter((experiment) => {
    const matchesSearch =
      experiment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      experiment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      experiment.categories.some((cat) => cat.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "live" && experiment.status === "LIVE") ||
      (statusFilter === "concluded" && experiment.status === "CONCLUDED")

    return matchesSearch && matchesStatus
  })

  // Sort experiments based on selected option
  const sortedExperiments = [...filteredExperiments].sort((a, b) => {
    if (sortOption === "recent") {
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    } else if (sortOption === "alphabetical") {
      return a.name.localeCompare(b.name)
    } else if (sortOption === "contributors") {
      return b.contributors.length - a.contributors.length
    }
    return 0
  })

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center text-sm hover:underline mr-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Lab
            </Link>
            <FlaskConical className="h-6 w-6 text-accent" />
            <h1 className="text-2xl font-bold">Experiments</h1>
          </div>

          <Button className="bg-accent text-primary-foreground hover:bg-accent/90">
            <FlaskConical className="h-4 w-4 mr-2" />
            Create New Experiment
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search experiments..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <div className="w-[180px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    <span>
                      {statusFilter === "all" ? "All Status" : statusFilter === "live" ? "Live Only" : "Concluded Only"}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="live">Live Only</SelectItem>
                  <SelectItem value="concluded">Concluded Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-[180px]">
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <span>
                      {sortOption === "recent"
                        ? "Most Recent"
                        : sortOption === "alphabetical"
                          ? "Alphabetical"
                          : "Most Contributors"}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                  <SelectItem value="contributors">Most Contributors</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Experiments List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedExperiments.map((experiment) => (
            <Card key={experiment.id} className="overflow-hidden">
              <CardHeader className="pb-2 flex flex-row items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg text-accent">{experiment.name}</CardTitle>
                    <Badge className={experiment.status === "LIVE" ? "bg-green-600" : "bg-blue-600"}>
                      {experiment.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {experiment.categories.slice(0, 3).map((category) => (
                      <Badge
                        key={category}
                        className={
                          scienceCategories[category as keyof typeof scienceCategories]?.color || "badge-default"
                        }
                      >
                        {scienceCategories[category as keyof typeof scienceCategories]?.label || category.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-sm mb-4">{experiment.description}</p>

                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground uppercase">Timeline</div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-1 text-accent" />
                      <span>Started: {format(parseISO(experiment.startDate), "MMM d, yyyy")}</span>
                    </div>
                    {experiment.endDate && (
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-1 text-accent" />
                        <span>Ended: {format(parseISO(experiment.endDate), "MMM d, yyyy")}</span>
                      </div>
                    )}
                    {!experiment.endDate && (
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-1 text-accent" />
                        <span>Ongoing</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground uppercase">Contributors</div>
                    <div className="flex -space-x-2 mt-1">
                      {experiment.contributors.map((contributor) => (
                        <Avatar key={contributor.id} className="h-8 w-8 border-2 border-background">
                          <AvatarImage src={contributor.avatar} alt={contributor.name} />
                          <AvatarFallback>{contributor.initials}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-accent text-primary-foreground hover:bg-accent/90" asChild>
                  <Link href="/experiments/view">
                    <FlaskConical className="h-4 w-4 mr-2" />
                    View Experiment
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}

          {sortedExperiments.length === 0 && (
            <div className="col-span-1 lg:col-span-2 flex flex-col items-center justify-center py-12 text-center">
              <FlaskConical className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No experiments found</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Start a new experiment to begin your research"}
              </p>
              <Button className="bg-accent text-primary-foreground hover:bg-accent/90">
                <FlaskConical className="h-4 w-4 mr-2" />
                Create New Experiment
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
