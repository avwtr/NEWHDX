"use client"

import { useState } from "react"
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"

const eventTypes = [
  { value: "experiment", label: "Experiment" },
  { value: "discovery", label: "Discovery" },
  { value: "publication", label: "Publication" },
  { value: "funding", label: "Funding" },
  { value: "collaboration", label: "Collaboration" },
  { value: "milestone", label: "Milestone" },
  { value: "other", label: "Other" },
]

interface LogCustomEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (event: {
    title: string
    description: string
    date: Date
    type: string
  }) => void
}

export function LogCustomEventDialog({ open, onOpenChange, onSubmit }: LogCustomEventDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [eventType, setEventType] = useState(eventTypes[0])
  const [openCalendar, setOpenCalendar] = useState(false)
  const [openEventTypeDropdown, setOpenEventTypeDropdown] = useState(false)

  const handleSubmit = () => {
    onSubmit({
      title,
      description,
      date,
      type: eventType.value,
    })

    // Reset form
    setTitle("")
    setDescription("")
    setDate(new Date())
    setEventType(eventTypes[0])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Log Custom Event</DialogTitle>
          <DialogDescription>Create a custom event to add to your lab activity timeline.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="event-title" className="text-right">
              Title
            </Label>
            <Input
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="Enter event title"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="event-type" className="text-right">
              Event Type
            </Label>
            <Popover open={openEventTypeDropdown} onOpenChange={setOpenEventTypeDropdown}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openEventTypeDropdown}
                  className="col-span-3 justify-between"
                >
                  {eventType.label}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search event type..." />
                  <CommandEmpty>No event type found.</CommandEmpty>
                  <CommandGroup>
                    {eventTypes.map((type) => (
                      <CommandItem
                        key={type.value}
                        value={type.value}
                        onSelect={() => {
                          setEventType(type)
                          setOpenEventTypeDropdown(false)
                        }}
                      >
                        <Check
                          className={cn("mr-2 h-4 w-4", eventType.value === type.value ? "opacity-100" : "opacity-0")}
                        />
                        {type.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="event-date" className="text-right">
              Date
            </Label>
            <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
              <PopoverTrigger asChild>
                <Button id="event-date" variant={"outline"} className="col-span-3 justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => {
                    if (date) {
                      setDate(date)
                      setOpenCalendar(false)
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="event-description" className="text-right pt-2">
              Description
            </Label>
            <Textarea
              id="event-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Describe the event..."
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={!title}>
            Log Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
