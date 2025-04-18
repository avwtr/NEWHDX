"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { Input } from "@/components/ui/input"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUploader } from "@/components/file-uploader"
import { FileIcon } from "lucide-react"

interface ContributionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  experimentId: string
  experimentName: string
}

export function ContributionDialog({ open, onOpenChange, experimentId, experimentName }: ContributionDialogProps) {
  const [contributionType, setContributionType] = useState("general")
  const [contributionTitle, setContributionTitle] = useState("")
  const [contributionDescription, setContributionDescription] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleFileChange = (files: File[]) => {
    setSelectedFiles(files)
  }

  const handleSubmit = () => {
    // In a real app, this would submit the contribution to an API
    console.log("Submitting contribution:", {
      type: contributionType,
      title: contributionTitle,
      description: contributionDescription,
      experimentId: experimentId,
      files: selectedFiles.map((file) => file.name),
    })

    // Close the dialog and reset form
    onOpenChange(false)
    setContributionType("general")
    setContributionTitle("")
    setContributionDescription("")
    setSelectedFiles([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Submit Contribution to {experimentName}</DialogTitle>
          <DialogDescription>Share your insights and findings with the lab.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="contribution-type">Contribution Type</Label>
            <Select value={contributionType} onValueChange={setContributionType}>
              <SelectTrigger id="contribution-type">
                <SelectValue placeholder="Select contribution type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="analysis">Analysis</SelectItem>
                <SelectItem value="revision">Revision</SelectItem>
                <SelectItem value="models-code">Models/Code</SelectItem>
                <SelectItem value="capsule-materials">Capsule Materials</SelectItem>
                <SelectItem value="data">Data</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contribution-title">Title</Label>
            <Input
              id="contribution-title"
              value={contributionTitle}
              onChange={(e) => setContributionTitle(e.target.value)}
              placeholder="Enter a title for your contribution"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contribution-description">Description</Label>
            <Textarea
              id="contribution-description"
              value={contributionDescription}
              onChange={(e) => setContributionDescription(e.target.value)}
              placeholder="Describe your contribution and how it relates to this experiment"
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Files (Optional)</Label>
            <FileUploader onChange={handleFileChange} />

            {selectedFiles.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium mb-1">Selected Files:</p>
                <ul className="text-sm space-y-1">
                  {selectedFiles.map((file, index) => (
                    <li key={index} className="flex items-center">
                      <FileIcon className="h-4 w-4 mr-2 text-blue-500" />
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Submit for Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
