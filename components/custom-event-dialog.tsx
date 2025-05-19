"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CustomEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  experimentId: string
  onAddEvent: (event: any) => void
}

const eventTypes = [
  { value: "data_collection", label: "Data Collection" },
  { value: "sample_preparation", label: "Sample Preparation" },
  { value: "equipment_calibration", label: "Equipment Calibration" },
  { value: "analysis", label: "Analysis" },
  { value: "team_meeting", label: "Team Meeting" },
  { value: "milestone", label: "Milestone" },
  { value: "observation", label: "Observation" },
  { value: "issue", label: "Issue Encountered" },
  { value: "resolution", label: "Issue Resolution" },
  { value: "custom", label: "Custom Event" },
]

export function CustomEventDialog({ open, onOpenChange, experimentId, onAddEvent }: CustomEventDialogProps) {
  const [eventType, setEventType] = useState("")
  const [customEventName, setCustomEventName] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if ((!eventType && !customEventName) || !description) return

    setIsSubmitting(true)

    try {
      // Determine event name based on selection
      const eventName =
        eventType === "custom"
          ? customEventName
          : eventType
            ? eventTypes.find((t) => t.value === eventType)?.label || customEventName
            : customEventName

      // Create new event object
      const newEvent = {
        event: eventName,
        description,
        type: eventType || "custom",
        date: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
      }

      // Call the callback to add the event
      onAddEvent(newEvent)

      // Reset form and close dialog
      setEventType("")
      setCustomEventName("")
      setDescription("")
      onOpenChange(false)
    } catch (error) {
      console.error("Error adding custom event:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Custom Event</DialogTitle>
          <DialogDescription>Add a new event to the experiment timeline.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="eventType">Event Type</Label>
            <Select value={eventType} onValueChange={setEventType} required>
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {eventType === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="customEventName">Custom Event Name</Label>
              <Input
                id="customEventName"
                value={customEventName}
                onChange={(e) => setCustomEventName(e.target.value)}
                placeholder="e.g., Sample Collection"
                required={eventType === "custom"}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about this event..."
              rows={3}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || (eventType === "custom" && !customEventName) || (!eventType && !customEventName) || !description}
            >
              {isSubmitting ? "Adding..." : "Add Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
