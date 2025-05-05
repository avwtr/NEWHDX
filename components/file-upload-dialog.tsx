"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
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
import { FileIcon, UploadIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/components/auth-provider"
import { firebaseStorage } from "@/lib/firebaseClient"
import { ref as firebaseRef, uploadBytesResumable, getDownloadURL } from "firebase/storage"

interface FileUploadDialogProps {
  labId: string;
  open?: boolean
  onOpenChange?: (open: boolean) => void
  experimentId?: string
  onFileUpload?: (file: any) => void
  onClose: () => void
  onUploadComplete: (files: any[]) => void
}

export function FileUploadDialog({
  labId,
  open,
  onOpenChange,
  experimentId,
  onFileUpload,
  onClose,
  onUploadComplete,
}: FileUploadDialogProps) {
  const [fileName, setFileName] = useState("")
  const [fileDescription, setFileDescription] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState("root")
  const [fileTag, setFileTag] = useState("file")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState(open || false)
  const { user } = useAuth();
  const [folders, setFolders] = useState<string[]>([]);
  const MAX_FILE_SIZE_MB = 50;

  // Handle dialog open state
  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen)
    if (onOpenChange) {
      onOpenChange(newOpen)
    }
    if (!newOpen) {
      onClose()
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      setSelectedFile(file)
      if (!fileName) {
        setFileName(file.name)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setSelectedFile(file)
      if (!fileName) {
        setFileName(file.name)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile || !fileName) return

    // Hybrid upload logic
    if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setIsSubmitting(true);
      const fileExtension = fileName.split(".").pop()?.toLowerCase() || "";
      const firebasePath = `BIG_FILES/${labId}/${selectedFile.name}`;
      const storageRef = firebaseRef(firebaseStorage, firebasePath);
      try {
        await new Promise<void>((resolve, reject) => {
          const uploadTask = uploadBytesResumable(storageRef, selectedFile);
          uploadTask.on(
            'state_changed',
            () => {}, // progress
            (error) => {
              alert("Firebase upload error: " + error.message);
              setIsSubmitting(false);
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              // Insert into Supabase DB
              const { error: dbError } = await supabase.from("files").insert([
                {
                  filename: fileName,
                  fileType: fileExtension,
                  fileSize: `${selectedFile.size} B`,
                  labID: labId,
                  folder: selectedFolder,
                  fileTag: fileTag || "file",
                  storageKey: firebasePath,
                  url: downloadURL,
                  initiallycreatedBy: user?.id || null,
                  lastUpdatedBy: user?.id || null,
                  lastUpdated: new Date().toISOString(),
                }
              ]);
              if (dbError) {
                alert("Supabase DB insert error: " + dbError.message);
                setIsSubmitting(false);
                reject(dbError);
                return;
              }
              setIsSubmitting(false);
              setFileName("");
              setFileDescription("");
              setSelectedFile(null);
              setSelectedFolder("root");
              handleOpenChange(false);
              if (onUploadComplete) onUploadComplete([
                {
                  name: fileName,
                  url: downloadURL,
                  storageProvider: "firebase",
                  storageKey: firebasePath,
                  folder: selectedFolder,
                  size: `${selectedFile.size} B`,
                  type: fileExtension,
                  author: user?.email || "Current User",
                  date: "Just now",
                  description: fileDescription,
                }
              ]);
              resolve();
            }
          );
        });
      } catch (error) {
        // Already handled above
      }
      return;
    }

    setIsSubmitting(true)

    try {
      // Get file type from extension
      const fileExtension = fileName.split(".").pop()?.toLowerCase() || ""
      let fileType = "unknown"

      if (["pdf"].includes(fileExtension)) fileType = "pdf"
      else if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) fileType = "image"
      else if (["csv", "xlsx", "xls"].includes(fileExtension)) fileType = "data"
      else if (["txt", "md", "json"].includes(fileExtension)) fileType = "text"
      else if (["py", "js", "ts", "r"].includes(fileExtension)) fileType = fileExtension

      // 1. Insert into files table to get the UUID
      const { data: inserted, error: dbError } = await supabase.from("files").insert([
        {
          fileType: fileExtension,
          filename: fileName,
          fileSize: `${selectedFile.size} B`,
          labID: labId,
          folder: selectedFolder,
          initiallycreatedBy: user?.id || null,
          lastUpdatedBy: user?.id || null,
          lastUpdated: new Date().toISOString(),
          fileTag: fileTag || "file",
          storageKey: null,
        },
      ]).select()
      if (dbError || !inserted || !inserted[0]?.id) {
        console.error("Supabase DB insert error:", dbError)
        throw dbError || new Error("Failed to insert file record")
      }
      const fileId = inserted[0].id

      // 2. Upload to storage using the UUID as the object name
      const storageKey = `${labId}/${fileId}${fileExtension ? '.' + fileExtension : ''}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("labmaterials")
        .upload(storageKey, selectedFile)
      if (uploadError) {
        // Rollback DB insert if storage upload fails
        await supabase.from("files").delete().eq("id", fileId)
        console.error("Supabase upload error:", uploadError)
        throw uploadError
      }

      // 3. Update the files table with the correct storageKey
      await supabase.from("files").update({ storageKey }).eq("id", fileId)

      // 4. Get the public URL
      const { data: urlData } = supabase.storage
        .from("labmaterials")
        .getPublicUrl(storageKey)

      // 5. Insert activity log
      await supabase.from("activity").insert([
        {
          activity_id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
          activity_name: `File Uploaded: ${fileName} to ${selectedFolder === "root" ? "ROOT" : selectedFolder.toUpperCase()}`,
          activity_type: "fileupload",
          performed_by: user?.id || null,
          lab_from: labId
        },
      ])

      // 6. Create a file object for the UI
      const fileObject = {
        id: fileId,
        name: fileName,
        type: fileExtension,
        size: `${selectedFile.size} B`,
        author: user?.email || "Current User",
        date: "Just now",
        description: fileDescription,
        folder: selectedFolder,
        url: urlData?.publicUrl || "",
        storageKey,
      }

      // Call the callback to add the file
      if (experimentId && onFileUpload) {
        onFileUpload(fileObject)
      } else {
        onUploadComplete([fileObject])
      }

      // Reset form and close dialog
      setFileName("")
      setFileDescription("")
      setSelectedFile(null)
      setSelectedFolder("root")
      handleOpenChange(false)
    } catch (error) {
      console.error("Error uploading file:", error, JSON.stringify(error))
      if (error instanceof Error) {
        alert(error.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    async function fetchFolders() {
      const { data, error } = await supabase
        .from("files")
        .select("folder")
        .eq("labID", labId);
      if (!error && data) {
        // Exclude root and duplicates
        const folderNames = Array.from(new Set(data.map((f: any) => f.folder).filter((f: string) => f && f !== "root")));
        setFolders(folderNames);
      }
    }
    if (labId) fetchFolders();
  }, [labId]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>
            {experimentId ? "Add a new file to this experiment." : "Upload a file to your lab materials."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer ${
              dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {selectedFile ? (
              <div className="flex flex-col items-center gap-2">
                <FileIcon className="h-10 w-10 text-primary" />
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedFile(null)
                  }}
                >
                  Change File
                </Button>
              </div>
            ) : (
              <>
                <UploadIcon className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-center text-muted-foreground mb-1">
                  Drag and drop a file here, or click to select a file
                </p>
                <p className="text-xs text-center text-muted-foreground">
                  Supports PDF, images, CSV, Excel, and text files
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.csv,.xlsx,.xls,.txt,.md,.json,.py,.js,.ts,.r"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileName">File Name</Label>
            <Input
              id="fileName"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="e.g., experiment_results.pdf"
              required
            />
          </div>

          {!experimentId && (
            <div className="space-y-2">
              <Label htmlFor="folderSelect">Destination Folder</Label>
              <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">ROOT (No Folder)</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder} value={folder}>{folder.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="fileTag">File Tag</Label>
            <Select value={fileTag} onValueChange={setFileTag}>
              <SelectTrigger>
                <SelectValue placeholder="Select a tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="file">File (default)</SelectItem>
                <SelectItem value="dataset">Dataset</SelectItem>
                <SelectItem value="code file">Code File</SelectItem>
                <SelectItem value="note">Note</SelectItem>
                <SelectItem value="link">Link</SelectItem>
                <SelectItem value="publication">Publication</SelectItem>
                <SelectItem value="protocol">Protocol</SelectItem>
                <SelectItem value="model">Model</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileDescription">Description (Optional)</Label>
            <Textarea
              id="fileDescription"
              value={fileDescription}
              onChange={(e) => setFileDescription(e.target.value)}
              placeholder="Provide details about this file..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedFile || !fileName}>
              {isSubmitting ? "Uploading..." : "Upload File"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
