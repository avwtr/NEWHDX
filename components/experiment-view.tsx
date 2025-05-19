"use client"

import { useState } from "react"
import { useRole } from "@/contexts/role-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FlaskConical } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
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
import { CalendarIcon } from "lucide-react"

const ExperimentView = () => {
  const { userRole } = useRole()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [experimentName, setExperimentName] = useState("")
  const [objective, setObjective] = useState("")
  const [startDate, setStartDate] = useState<Date>()
  const [isOngoing, setIsOngoing] = useState(true)
  const [endDate, setEndDate] = useState<Date>()
  const [selectedTags, setSelectedTags] = useState<string[]>([])
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
  }

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag))
  }

  const handleSubmit = () => {
    if (!experimentName || !objective || !startDate) {
      // Show validation errors
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsCreateDialogOpen(false)
      
      // Reset form
      setExperimentName("")
      setObjective("")
      setStartDate(undefined)
      setIsOngoing(true)
      setEndDate(undefined)
      setSelectedTags([])
      setSelectedFiles([])
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Experiments</h1>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-accent text-primary-foreground hover:bg-accent/90"
        >
          <FlaskConical className="h-4 w-4 mr-2" />
          Start New Experiment
        </Button>
      </div>

      <div className="grid gap-4">
        {/* Placeholder for experiment list */}
        <Card>
          <CardHeader>
            <CardTitle>Active Experiments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No active experiments yet. Start your first experiment to begin.</p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Experiment</DialogTitle>
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
                  <SelectItem value="neuroscience">NEUROSCIENCE</SelectItem>
                  <SelectItem value="brain-mapping">BRAIN MAPPING</SelectItem>
                  <SelectItem value="cognitive-science">COGNITIVE SCIENCE</SelectItem>
                  <SelectItem value="ai">ARTIFICIAL INTELLIGENCE</SelectItem>
                  <SelectItem value="machine-learning">MACHINE LEARNING</SelectItem>
                  <SelectItem value="neural-networks">NEURAL NETWORKS</SelectItem>
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
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!experimentName || !objective || !startDate || isSubmitting}
              className="bg-accent text-primary-foreground hover:bg-accent/90"
            >
              {isSubmitting ? (
                "Creating..."
              ) : (
                <>
                  <FlaskConical className="h-4 w-4 mr-2" />
                  Create Experiment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ExperimentView
