"use client"

import { useState } from "react"
import { Activity, ArrowUpRight, Beaker, FileText, Flag, Microscope, Plus, Users } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
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
      return <Beaker className="h-4 w-4" />
    case "publication":
      return <FileText className="h-4 w-4" />
    case "funding":
      return <ArrowUpRight className="h-4 w-4" />
    case "collaboration":
      return <Users className="h-4 w-4" />
    case "milestone":
      return <Flag className="h-4 w-4" />
    case "discovery":
      return <Microscope className="h-4 w-4" />
    default:
      return <Activity className="h-4 w-4" />
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

export function LabActivityTimeline() {
  const [timeline, setTimeline] = useState(timelineData)
  const [isCustomEventDialogOpen, setIsCustomEventDialogOpen] = useState(false)

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
    <Card className="w-full h-full">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Timeline</CardTitle>
          <Button size="sm" onClick={() => setIsCustomEventDialogOpen(true)} className="flex items-center gap-1">
            <Plus className="h-3.5 w-3.5" />
            LOG CUSTOM EVENT
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px] px-4 pb-4">
          <div className="space-y-4">
            {timeline.map((event, index) => (
              <div key={event.id} className="relative pl-6 pb-4">
                {/* Timeline connector */}
                {index < timeline.length - 1 && <div className="absolute left-2.5 top-3 bottom-0 w-px bg-border" />}

                {/* Event dot */}
                <div
                  className={`absolute left-0 top-1 flex h-5 w-5 items-center justify-center rounded-full ${getEventColor(event.type)}`}
                >
                  {getEventIcon(event.type)}
                </div>

                {/* Event content */}
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    <Badge variant="outline" className="text-xs h-5 px-1.5">
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground">{event.description}</p>

                  <div className="flex items-center justify-between mt-1">
                    <div className="text-xs text-muted-foreground">{format(event.date, "MMM d, yyyy • h:mm a")}</div>

                    <div className="flex items-center">
                      <Avatar className="h-5 w-5 mr-1">
                        <AvatarImage src={event.user.avatar} alt={event.user.name} />
                        <AvatarFallback className="text-[10px]">{event.user.initials}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{event.user.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
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
