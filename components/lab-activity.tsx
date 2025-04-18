"use client"

import { useState } from "react"
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Beaker,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  Filter,
  Flag,
  Microscope,
  Plus,
  Search,
  Users,
} from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogCustomEventDialog } from "@/components/log-custom-event-dialog"

// Sample data for the timeline
const timelineData = [
  {
    id: 1,
    title: "New experiment started",
    description: "Initiated experiment on quantum entanglement",
    date: new Date(2023, 5, 15, 9, 30),
    type: "experiment",
    user: {
      name: "Dr. Jane Smith",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "JS",
    },
  },
  {
    id: 2,
    title: "Research paper published",
    description: "Published findings in Nature journal",
    date: new Date(2023, 5, 10, 14, 0),
    type: "publication",
    user: {
      name: "Dr. John Doe",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "JD",
    },
  },
  {
    id: 3,
    title: "Grant funding received",
    description: "Received $500,000 grant from National Science Foundation",
    date: new Date(2023, 5, 5, 11, 15),
    type: "funding",
    user: {
      name: "Dr. Jane Smith",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "JS",
    },
  },
  {
    id: 4,
    title: "New team member joined",
    description: "Dr. Alex Johnson joined the research team",
    date: new Date(2023, 4, 28, 10, 0),
    type: "collaboration",
    user: {
      name: "Lab Admin",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "LA",
    },
  },
  {
    id: 5,
    title: "Milestone achieved",
    description: "Successfully demonstrated quantum teleportation",
    date: new Date(2023, 4, 20, 16, 45),
    type: "milestone",
    user: {
      name: "Dr. John Doe",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "JD",
    },
  },
]

// Function to get the appropriate icon for each event type
function getEventIcon(type: string) {
  switch (type) {
    case "experiment":
      return <Beaker className="h-5 w-5" />
    case "publication":
      return <FileText className="h-5 w-5" />
    case "funding":
      return <ArrowUpRight className="h-5 w-5" />
    case "collaboration":
      return <Users className="h-5 w-5" />
    case "milestone":
      return <Flag className="h-5 w-5" />
    case "discovery":
      return <Microscope className="h-5 w-5" />
    default:
      return <Activity className="h-5 w-5" />
  }
}

// Function to get the appropriate color for each event type
function getEventColor(type: string) {
  switch (type) {
    case "experiment":
      return "bg-blue-100 text-blue-800"
    case "publication":
      return "bg-purple-100 text-purple-800"
    case "funding":
      return "bg-green-100 text-green-800"
    case "collaboration":
      return "bg-yellow-100 text-yellow-800"
    case "milestone":
      return "bg-red-100 text-red-800"
    case "discovery":
      return "bg-indigo-100 text-indigo-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function LabActivity() {
  const [searchQuery, setSearchQuery] = useState("")
  const [timeline, setTimeline] = useState(timelineData)
  const [isCustomEventDialogOpen, setIsCustomEventDialogOpen] = useState(false)

  // Filter timeline based on search query
  const filteredTimeline = timeline.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle adding a custom event
  const handleAddCustomEvent = (event: {
    title: string
    description: string
    date: Date
    type: string
  }) => {
    const newEvent = {
      id: timeline.length + 1,
      title: event.title,
      description: event.description,
      date: event.date,
      type: event.type,
      user: {
        name: "Current User", // In a real app, this would be the current user
        avatar: "/placeholder.svg?height=40&width=40",
        initials: "CU",
      },
    }

    // Add the new event and sort by date (newest first)
    const updatedTimeline = [...timeline, newEvent].sort((a, b) => b.date.getTime() - a.date.getTime())

    setTimeline(updatedTimeline)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Lab Activity
            </CardTitle>
            <CardDescription>Track all activities and events in your lab</CardDescription>
          </div>
          <Button onClick={() => setIsCustomEventDialogOpen(true)} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Log Custom Event
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search activities..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="timeline">
          <TabsList className="mb-4">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-4">
            {filteredTimeline.length > 0 ? (
              filteredTimeline.map((event, index) => (
                <div key={event.id} className="relative pl-8 pb-10">
                  {/* Timeline connector */}
                  {index < filteredTimeline.length - 1 && (
                    <div className="absolute left-3.5 top-3 bottom-0 w-px bg-border" />
                  )}

                  {/* Event dot */}
                  <div
                    className={`absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full ${getEventColor(event.type)}`}
                  >
                    {getEventIcon(event.type)}
                  </div>

                  {/* Event content - with updated styling */}
                  <div className="flex flex-col space-y-2 max-w-full overflow-hidden">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold">{event.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground break-words whitespace-normal pr-4 max-w-full">
                      {event.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 mt-1">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {format(event.date, "PPpp")}
                      </div>

                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-1">
                          <AvatarImage src={event.user.avatar || "/placeholder.svg"} alt={event.user.name} />
                          <AvatarFallback>{event.user.initials}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs">{event.user.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg">No activities found</h3>
                <p className="text-muted-foreground mt-1">
                  {searchQuery ? "Try adjusting your search query" : "Start by logging your first lab activity"}
                </p>
                {!searchQuery && (
                  <Button className="mt-4" onClick={() => setIsCustomEventDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Log Custom Event
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="calendar">
            <div className="flex items-center justify-center h-64 border rounded-md">
              <div className="text-center">
                <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium">Calendar View</h3>
                <p className="text-sm text-muted-foreground mt-1">Calendar view is coming soon</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <div className="flex items-center justify-center h-64 border rounded-md">
              <div className="text-center">
                <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium">Activity Statistics</h3>
                <p className="text-sm text-muted-foreground mt-1">Activity statistics are coming soon</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Custom Event Dialog */}
      <LogCustomEventDialog
        open={isCustomEventDialogOpen}
        onOpenChange={setIsCustomEventDialogOpen}
        onSubmit={handleAddCustomEvent}
      />
    </Card>
  )
}
