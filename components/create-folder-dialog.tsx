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
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface CreateFolderDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreateFolder: (name: string, parent: string) => void
}

export function CreateFolderDialog({ isOpen, onClose, onCreateFolder }: CreateFolderDialogProps) {
  const [folderName, setFolderName] = useState("NEW_FOLDER")
  const [folderDescription, setFolderDescription] = useState("")
  const [parentFolder, setParentFolder] = useState("root")
  const [isCreating, setIsCreating] = useState(false)

  const handleSubmit = () => {
    if (!folderName.trim()) return

    setIsCreating(true)
    onCreateFolder(folderName, parentFolder)
    setIsCreating(false)
    onClose()

    // Reset form
    setFolderName("NEW_FOLDER")
    setFolderDescription("")
    setParentFolder("root")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>Create a new folder to organize your lab files</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="foldername">Folder Name</Label>
            <Input
              id="foldername"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g., EXPERIMENT_DATA_2023"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={folderDescription}
              onChange={(e) => setFolderDescription(e.target.value)}
              placeholder="Brief description of this folder's contents"
              className="min-h-[80px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-accent text-primary-foreground hover:bg-accent/90"
            onClick={handleSubmit}
            disabled={isCreating || !folderName.trim()}
          >
            {isCreating ? "Creating..." : "Create Folder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
