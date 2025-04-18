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
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"

interface LogEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const eventCategories = [
  { value: "experiment", label: "Experiment" },
  { value: "meeting", label: "Meeting" },
  { value: "publication", label: "Publication" },
  { value: "funding", label: "Funding" },
  { value: "collaboration", label: "Collaboration" },
  { value: "discovery", label: "Discovery" },
  { value: "milestone", label: "Milestone" },
  { value: "other", label: "Other" },
]

export function LogEventDialog({ open, onOpenChange }: LogEventDialogProps) {
  const [eventTitle, setEventTitle] = useState("")
  const [eventCategory, setEventCategory] = useState("")
  const [eventDescription, setEventDescription] = useState("")
  const [eventDate, setEventDate] = useState<Date | undefined>(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!eventTitle || !eventCategory || !eventDescription || !eventDate) {
      return
    }

    setIsSubmitting(true)

    try {
      // In a real application, this would send data to a server
      // For now, we'll just simulate a successful submission
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Create event object
      const newEvent = {
        title: eventTitle,
        category: eventCategory,
        description: eventDescription,
        date: format(eventDate, "yyyy-MM-dd"),
        timestamp: new Date().toISOString(),
      }

      console.log("Logged event:", newEvent)

      // Show success message
      toast({
        title: "Event Logged",
        description: "Your event has been successfully recorded.",
      })

      // Reset form and close dialog
      resetForm()
      onOpenChange(false)
    } catch (error) {
      console.error("Error logging event:", error)
      toast({
        title: "Error",
        description: "Failed to log event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setEventTitle("")
    setEventCategory("")
    setEventDescription("")
    setEventDate(new Date())
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Log an Event</DialogTitle>
          <DialogDescription>Record a significant event in your lab's timeline.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="eventTitle">Event Title</Label>
            <Input
              id="eventTitle"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="e.g., New Research Finding"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventCategory">Category</Label>
            <Select value={eventCategory} onValueChange={setEventCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {eventCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventDate">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !eventDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {eventDate ? format(eventDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={eventDate} onSelect={setEventDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventDescription">Description</Label>
            <Textarea
              id="eventDescription"
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              placeholder="Describe the event and its significance..."
              rows={4}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !eventTitle || !eventCategory || !eventDescription || !eventDate}
            >
              {isSubmitting ? "Logging..." : "Log Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
