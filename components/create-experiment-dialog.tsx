"use client"

import type React from "react"

import { useState } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUploader } from "@/components/file-uploader"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Beaker } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { researchAreas } from "@/lib/research-areas"

interface CreateExperimentDialogProps {
  isOpen: boolean
  onClose: () => void
  labId: string
}

export function CreateExperimentDialog({ isOpen, onClose, labId }: CreateExperimentDialogProps) {
  const [experimentName, setExperimentName] = useState("")
  const [objective, setObjective] = useState("")
  const [startDate, setStartDate] = useState<Date>()
  const [isOngoing, setIsOngoing] = useState(true)
  const [endDate, setEndDate] = useState<Date>()
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileChange = (files: File[]) => {
    setSelectedFiles((prevFiles) => [...prevFiles, ...files])
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
  }

  const handleAddTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag])
    }
    setTagInput("")
  }

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput) {
      e.preventDefault()
      handleAddTag(tagInput)
    }
  }

  const handleSubmit = async () => {
    if (!experimentName || !objective || !startDate) {
      // Show validation errors
      return
    }

    setIsSubmitting(true)

    try {
      const { data, error } = await supabase
        .from("experiments")
        .insert([
          {
            name: experimentName,
            objective: objective,
            startDate: startDate.toISOString(),
            endDate: isOngoing ? null : endDate?.toISOString(),
            status: "LIVE",
            categories: selectedTags,
            lab_id: labId
          }
        ])
        .select()
        .single()

      if (error) throw error

      // Upload files if any
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const filePath = `experiments/${data.id}/${file.name}`
          const { error: uploadError } = await supabase.storage
            .from("experiment-files")
            .upload(filePath, file)
          
          if (uploadError) throw uploadError

          // Add file reference to experiment_files table
          await supabase
            .from("experiment_files")
            .insert([
              {
                experiment_id: data.id,
                file_name: file.name,
                file_path: filePath,
                file_size: file.size,
                file_type: file.type
              }
            ])
        }
      }

      // Reset form
      setExperimentName("")
      setObjective("")
      setStartDate(undefined)
      setIsOngoing(true)
      setEndDate(undefined)
      setSelectedTags([])
      setSelectedFiles([])

      // Close dialog
      onClose()

      // Show success toast
      toast({
        title: "Experiment Created",
        description: "Your experiment has been created successfully.",
      })
    } catch (error) {
      console.error("Error creating experiment:", error)
      toast({
        title: "Error",
        description: "Failed to create experiment. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Experiment</DialogTitle>
          <DialogDescription>
            Set up a new experiment for your lab. Define its parameters and upload relevant files.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="experiment-name" className="text-sm font-medium">
              Experiment Name
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
              Objective
            </Label>
            <Textarea
              id="objective"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Describe the goals and expected outcomes of this experiment"
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">End Date</Label>
                <div className="flex items-center space-x-2">
                  <Switch id="ongoing" checked={isOngoing} onCheckedChange={setIsOngoing} />
                  <Label htmlFor="ongoing" className="text-xs">
                    Ongoing
                  </Label>
                </div>
              </div>

              {!isOngoing && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => !startDate || date < startDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}

              {isOngoing && (
                <div className="h-10 flex items-center px-3 text-muted-foreground border border-input rounded-md">
                  Ongoing experiment
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Categories</Label>
            <Select onValueChange={handleAddTag}>
              <SelectTrigger>
                <SelectValue placeholder="Select categories" />
              </SelectTrigger>
              <SelectContent>
                {researchAreas.map(area => (
                  <SelectItem key={area.value} value={area.value}>{area.label.toUpperCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex flex-wrap gap-2 mt-2">
              {selectedTags.map((tag) => (
                <div key={tag} className="flex items-center bg-secondary/50 rounded-full px-3 py-1">
                  <span className="text-xs">{tag.toUpperCase()}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 rounded-full hover:bg-secondary"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <span className="sr-only">Remove</span>×
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Upload Files (Optional)</Label>
            <FileUploader onChange={handleFileChange} />

            {selectedFiles.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium mb-1">Selected Files:</p>
                <ul className="text-sm space-y-1">
                  {selectedFiles.map((file, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-accent mr-2">•</span>
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-white"
                        onClick={() => handleRemoveFile(index)}
                      >
                        ×
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!experimentName || !objective || !startDate || isSubmitting}
            className="bg-accent text-primary-foreground hover:bg-accent/90"
          >
            {isSubmitting ? (
              "Initiating..."
            ) : (
              <>
                <Beaker className="h-4 w-4 mr-2" />
                INITIATE EXPERIMENT
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
