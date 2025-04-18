"use client"

import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

interface TimelineEvent {
  id: string
  date: string
  event: string
  description: string
}

interface TimelineProps {
  events: TimelineEvent[]
  onAddEvent?: (event: { event: string; description: string }) => void
}

export function Timeline({ events, onAddEvent }: TimelineProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [eventName, setEventName] = useState("")
  const [eventDescription, setEventDescription] = useState("")

  function handleAddEvent() {
    if (!eventName || !eventDescription) return

    if (onAddEvent) {
      onAddEvent({
        event: eventName,
        description: eventDescription,
      })
    }

    // Reset form and close modal
    setEventName("")
    setEventDescription("")
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-4">
      {/* Add Event Button */}
      {onAddEvent && (
        <div className="flex justify-end mb-4">
          <Button variant="outline" onClick={() => setIsModalOpen(true)}>
            Add Custom Event
          </Button>
        </div>
      )}

      {/* Timeline Events */}
      <div className="space-y-8">
        {events.map((event, index) => (
          <div key={event.id} className="relative pl-8">
            {/* Line connecting events */}
            {index < events.length - 1 && <div className="absolute left-3 top-3 bottom-0 w-px bg-border" />}

            {/* Event dot */}
            <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>

            {/* Event content */}
            <div className="space-y-1.5">
              <div className="flex items-center text-sm text-muted-foreground">
                <CalendarIcon className="mr-1 h-3 w-3" />
                <span>{event.date}</span>
              </div>
              <h3 className="font-medium">{event.event}</h3>
              <p className="text-sm text-muted-foreground">{event.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Event Dialog - using shadcn/ui Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
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
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEvent}>Add Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
