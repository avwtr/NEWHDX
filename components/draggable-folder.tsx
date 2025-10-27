"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDownIcon, ChevronRightIcon, FolderIcon, Edit2, Check, X, Trash2, Download } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import JSZip from "jszip"
import { supabase } from "@/lib/supabaseClient"
import { firebaseStorage } from "@/lib/firebaseClient"
import { getDownloadURL, ref as firebaseRef } from "firebase/storage"

interface FileProps {
  id: string
  name: string
  type: string
  size: string
  author: string
  date: string
}

interface DraggableFolderProps {
  id: string
  name: string
  count: number
  lastUpdated: string
  files: FileProps[]
  isOpen: boolean
  onToggle: (id: string) => void
  onRenameFolder: (id: string, newName: string) => void
  onRenameFile: (id: string, newName: string) => void
  renderFileItem: (file: FileProps) => React.ReactNode
  userRole?: string
  onDeleteFolder?: (id: string) => void
  actions?: React.ReactNode
}

// Utility function to robustly download a file from Supabase or Firebase (for folder zipping)
async function fetchFileBlob(file: any) {
  if (file.url) {
    const resp = await fetch(file.url)
    return await resp.blob()
  } else if (file.storageKey && file.fileSize && typeof file.fileSize === 'string' && file.fileSize.includes('MB') && parseFloat(file.fileSize) > 50) {
    // Firebase for large files
    const url = await getDownloadURL(firebaseRef(firebaseStorage, file.storageKey))
    const resp = await fetch(url)
    return await resp.blob()
  } else if (file.storageKey || file.path) {
    // Supabase Storage
    const path = file.storageKey || file.path
    const { data } = await supabase.storage.from("labmaterials").download(path)
    if (!data) throw new Error("Failed to download file")
    return data
  }
  throw new Error("No download URL available")
}

export function DraggableFolder({
  id,
  name,
  count,
  lastUpdated,
  files,
  isOpen,
  onToggle,
  onRenameFolder,
  onRenameFile,
  renderFileItem,
  userRole = "guest",
  onDeleteFolder,
  actions,
}: DraggableFolderProps) {
  const isAdmin = userRole === "admin"
  const [isRenamingFolder, setIsRenamingFolder] = useState(false)
  const [tempName, setTempName] = useState(name)
  const [isBeingDragged, setIsBeingDragged] = useState(false)
  const [isDropTarget, setIsDropTarget] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const folderRef = useRef<HTMLDivElement>(null)

  const startRenamingFolder = (e: React.MouseEvent) => {
    if (!isAdmin) return
    e.stopPropagation()
    setTempName(name)
    setIsRenamingFolder(true)
  }

  const saveRenamedFolder = () => {
    if (!isAdmin) return
    if (tempName.trim()) {
      onRenameFolder(id, tempName)
    }
    setIsRenamingFolder(false)
  }

  const cancelRenamingFolder = () => {
    setIsRenamingFolder(false)
  }

  const handleDragStart = (e: React.DragEvent) => {
    if (!isAdmin) return
    e.stopPropagation()
    setIsBeingDragged(true)

    // Create a ghost image for dragging
    if (folderRef.current) {
      const rect = folderRef.current.getBoundingClientRect()
      const ghostElement = document.createElement("div")
      ghostElement.style.width = `${rect.width}px`
      ghostElement.style.height = `${rect.height}px`
      ghostElement.style.backgroundColor = "rgba(160, 255, 221, 0.2)"
      ghostElement.style.border = "2px dashed #A0FFDD"
      ghostElement.style.borderRadius = "6px"
      ghostElement.style.display = "flex"
      ghostElement.style.alignItems = "center"
      ghostElement.style.justifyContent = "center"
      ghostElement.style.color = "#A0FFDD"
      ghostElement.style.fontSize = "14px"
      ghostElement.style.fontWeight = "bold"
      ghostElement.textContent = `📁 ${name}`

      document.body.appendChild(ghostElement)
      ghostElement.style.position = "absolute"
      ghostElement.style.top = "-1000px"
      ghostElement.style.left = "-1000px"

      e.dataTransfer.setDragImage(ghostElement, rect.width / 2, 30)

      setTimeout(() => {
        document.body.removeChild(ghostElement)
      }, 0)
    }
  }

  const handleDragEnd = () => {
    if (!isAdmin) return
    setIsBeingDragged(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (!isAdmin) return
    e.preventDefault()
    e.stopPropagation()
    // Only highlight if dragging a file, not a folder
    try {
      const data = e.dataTransfer.getData('application/json');
      const obj = JSON.parse(data);
      if (obj && obj.isFolder) return;
    } catch {}
    setIsDropTarget(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (!isAdmin) return
    e.preventDefault()
    e.stopPropagation()
    setIsDropTarget(false)
  }

  const confirmDelete = () => {
    if (onDeleteFolder) {
      onDeleteFolder(id)
    }
    setDeleteDialogOpen(false)
  }

  // Folder download as zip
  const handleDownloadFolder = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      // Fetch all files in this folder from DB
      const { data: files, error } = await supabase.from("files").select("*", { count: "exact" }).eq("folder", id)
      if (error) throw error
      if (!files || files.length === 0) throw new Error("No files in folder")
      const zip = new JSZip()
      let added = 0;
      for (const file of files) {
        // Skip folders, .keep, or files with no storageKey/path/url
        if (
          file.filename === '.keep' ||
          file.fileType === 'folder' ||
          (!file.storageKey && !file.path && !file.url)
        ) {
          console.warn(`Skipping file ${file.filename || file.name}: not downloadable`)
          continue;
        }
        try {
          const blob = await fetchFileBlob(file)
          zip.file(file.filename || file.name, blob)
          added++;
        } catch (err: unknown) {
          const error = err as Error
          console.warn(`Skipping file ${file.filename || file.name}: ${error.message}`)
        }
      }
      if (added === 0) {
        alert("No downloadable files in this folder.")
        return;
      }
      const zipBlob = await zip.generateAsync({ type: "blob" })
      const url = URL.createObjectURL(zipBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${name}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err: any) {
      alert("Failed to download folder as zip: " + (err.message || err))
    }
  }

  // Determine if the folder should be draggable
  const draggableProps = isAdmin
    ? {
        draggable: true,
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
      }
    : {}

  return (
    <>
      <div
        ref={folderRef}
        className={`border rounded-md overflow-hidden transition-all duration-200
          ${isBeingDragged ? "opacity-50" : ""}
          ${isDropTarget ? "border-2 border-accent shadow-lg" : "border-secondary"}
        `}
        onDragOver={isAdmin ? handleDragOver : undefined}
        onDragLeave={isAdmin ? handleDragLeave : undefined}
      >
        <div
          className={`flex items-center p-3 hover:bg-secondary/50 cursor-pointer transition-colors
            ${isOpen ? "bg-secondary" : ""}
            ${isAdmin ? "cursor-grab active:cursor-grabbing" : ""}
          `}
          onClick={() => onToggle(id)}
          {...draggableProps}
        >
          <div className="flex items-center flex-1">
            <FolderIcon className={`h-5 w-5 mr-2 ${isDropTarget ? "text-accent animate-pulse" : "text-accent"}`} />
            <div className="flex-1">
              {isRenamingFolder ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="h-7 py-1"
                    autoFocus
                  />
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={saveRenamedFolder}>
                    <Check className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelRenamingFolder}>
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center">
                  <h3 className="text-sm font-medium font-fell">{name}</h3>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 ml-2 text-muted-foreground hover:text-accent"
                      onClick={startRenamingFolder}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {actions}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {count} files, last updated {lastUpdated}
              </p>
            </div>
          </div>
          {isAdmin && onDeleteFolder && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:bg-red-500/10 hover:text-red-400"
              onClick={(e) => {
                e.stopPropagation()
                setDeleteDialogOpen(true)
              }}
              title="Delete folder"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-500 hover:bg-blue-500/10 hover:text-blue-400 ml-2"
            onClick={handleDownloadFolder}
            title="Download folder as zip"
          >
            <Download className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-accent hover:bg-secondary/80 ml-2"
            onClick={(e) => {
              e.stopPropagation()
              onToggle(id)
            }}
          >
            {isOpen ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
          </Button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`border-t ${isDropTarget ? "border-accent" : "border-secondary"}`}
            >
              <div className={`p-2 space-y-1 ${isDropTarget ? "bg-accent/5" : ""}`}>
                {files.map((file) => renderFileItem(file))}
                {files.length === 0 && (
                  <div
                    className={`text-center py-4 ${isDropTarget ? "text-accent font-medium" : "text-muted-foreground"}`}
                  >
                    {isAdmin && isDropTarget ? "Drop files here" : "This folder is empty."}
                    {isAdmin && !isDropTarget && " Drag and drop files here."}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Folder</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the folder "{name}"? This action cannot be undone and all files within
              this folder will be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex sm:justify-between mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
