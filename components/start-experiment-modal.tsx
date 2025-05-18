"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Beaker, Search, Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { researchAreas } from "@/lib/research-areas"
import { supabase } from "@/lib/supabase"

interface StartExperimentModalProps {
  isOpen: boolean
  onClose: () => void
  suggestedCategories?: string[]
  labId: string
  userId: string
}

export function StartExperimentModal({ isOpen, onClose, suggestedCategories, labId, userId }: StartExperimentModalProps) {
  const router = useRouter()
  const [experimentName, setExperimentName] = useState("")
  const [objective, setObjective] = useState("")
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag))
  }

  const handleSubmit = async () => {
    if (!experimentName || !objective) {
      return
    }

    setIsSubmitting(true)

    // Prepare payload and log it for debugging
    const payload = {
      name: experimentName,
      objective: objective,
      categories: selectedTags,
      created_by: userId,
      lab_id: labId,
      // end_date must be a string in YYYY-MM-DD format or null for Supabase 'date' type
      end_date: endDate ? endDate.toISOString().slice(0, 10) : null,
    };
    console.log('Inserting experiment:', payload);

    try {
      const { data, error } = await supabase
        .from("experiments")
        .insert([payload])
        .select()
        .single()

      if (error) throw error

      if (data && data.id) {
        router.push(`/newexperiments/${data.id}`)
      }
      onClose()
    } catch (error) {
      // Optionally: show a toast or error message
      console.error("Error creating experiment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter research areas based on search term
  const filteredAreas = searchTerm
    ? researchAreas.filter((area) => area.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : researchAreas

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Beaker className="h-5 w-5 text-accent" />
            Start New Experiment
          </DialogTitle>
          <DialogDescription>
            Define the parameters of your new experiment. You can add more details after creation.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="experiment-name" className="text-sm font-medium">
              Experiment Name*
            </Label>
            <Input
              id="experiment-name"
              value={experimentName}
              onChange={(e) => setExperimentName(e.target.value)}
              placeholder="e.g., NEURAL NETWORK OPTIMIZATION"
              className="col-span-3"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="objective" className="text-sm font-medium">
              Objective*
            </Label>
            <Textarea
              id="objective"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Define specific goals and expected outcomes"
              className="min-h-[80px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Science Categories</Label>
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
              >
                {selectedTags.length > 0
                  ? `${selectedTags.length} selected`
                  : "Select science categories..."}
              </Button>

              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
                  <div className="flex items-center border-b p-2">
                    <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                    <Input
                      placeholder="Search science categories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>

                  <div className="max-h-60 overflow-y-auto p-1">
                    {filteredAreas.length === 0 ? (
                      <div className="py-2 px-3 text-sm text-muted-foreground">No categories found</div>
                    ) : (
                      filteredAreas.map((area) => {
                        const isSelected = selectedTags.includes(area.value)
                        return (
                          <div
                            key={area.value}
                            className={`flex items-center px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                              isSelected ? "bg-accent/50" : ""
                            }`}
                            onClick={() => handleAddTag(area.value)}
                          >
                            <div className="mr-2 h-4 w-4 flex items-center justify-center border rounded">
                              {isSelected && <Check className="h-3 w-3" />}
                            </div>
                            {area.label}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedTags.map((tag) => {
                  const area = researchAreas.find((a) => a.value === tag)
                  return (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {area?.label}
                      <button
                        type="button"
                        className="h-4 w-4 p-0 hover:bg-transparent rounded-full flex items-center justify-center"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove {area?.label}</span>
                      </button>
                    </Badge>
                  )
                })}
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-1">
              Select up to 10 science categories ({selectedTags.length}/10 selected)
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">End Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Select end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!experimentName || !objective || isSubmitting}
            className="bg-accent text-primary-foreground hover:bg-accent/90 gap-2"
          >
            {isSubmitting ? (
              "Creating..."
            ) : (
              <>
                INITIATE EXPERIMENT
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 