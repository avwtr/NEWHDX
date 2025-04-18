"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export function CreateFundDialog() {
  const [fundName, setFundName] = useState("")
  const [description, setDescription] = useState("")
  const [goalAmount, setGoalAmount] = useState("")
  const [date, setDate] = useState<Date>()
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = () => {
    // Here you would typically save the fund to your database
    console.log({
      name: fundName,
      description,
      goalAmount: Number.parseFloat(goalAmount),
      deadline: date,
    })

    // Reset form and close dialog
    setFundName("")
    setDescription("")
    setGoalAmount("")
    setDate(undefined)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-accent text-accent hover:bg-secondary">
          <Plus className="h-4 w-4 mr-1" />
          ADD GOAL
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Funding Goal</DialogTitle>
          <DialogDescription>
            Create a new funding goal for your lab. Members and donors can contribute to specific goals.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fund-name">Goal Name</Label>
            <Input
              id="fund-name"
              value={fundName}
              onChange={(e) => setFundName(e.target.value)}
              placeholder="e.g., NEW EQUIPMENT FUND"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this funding will be used for"
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-amount">Goal Amount ($)</Label>
            <Input
              id="goal-amount"
              type="number"
              min="0"
              step="100"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              placeholder="e.g., 25000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="deadline"
                  variant={"outline"}
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select a deadline"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            className="bg-accent text-primary-foreground hover:bg-accent/90"
            onClick={handleSubmit}
            disabled={!fundName.trim() || !goalAmount.trim()}
          >
            Create Funding Goal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
