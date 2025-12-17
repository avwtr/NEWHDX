"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  FileIcon,
  FileTextIcon,
  FileSpreadsheetIcon,
  FileCodeIcon,
  Edit2,
  Check,
  X,
  FileJsonIcon,
  PlusCircle,
  Eye,
  Tag,
  Trash2,
  Download,
  Plus,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { FileViewerDialog } from "@/components/file-viewer-dialog"
import { Badge } from "@/components/ui/badge"
import { downloadFile } from "./file-viewer-dialog" // adjust path if moved to utils
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/components/auth-provider"

interface FileItemProps {
  id: string
  name: string
  type: string
  size: string
  author: string
  date: string
  tag?: string
  file?: {
    id: string
    filename: string
    fileType: string
    fileSize: string
    author: string
    date: string
    url?: string
    storageKey?: string
    path?: string
    content?: string
    lastUpdatedBy?: string
    lastUpdated?: string
  }
  onRename: (id: string, newName: string) => void
  onDragStart: (e: React.DragEvent, id: string, name: string, type: string) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, targetId?: string) => void
  onDelete?: (id: string) => void
  onDownload?: (file: { id: string; name: string; type: string; size: string; author: string; date: string; content?: string; url?: string; storageKey?: string; path?: string }) => void
  onSave?: (fileId: string, content: any) => void
  isDragging?: boolean
  isDraggedOver?: boolean
  userRole?: string
  onClick?: () => void
  labId: string
  showSaveToProfile?: boolean
}

// Utility to format file sizes
function formatFileSize(size: string | number): string {
  let bytes = 0;
  if (typeof size === 'number') {
    bytes = size;
  } else if (typeof size === 'string') {
    const match = size.match(/([\d.]+)\s*(B|KB|MB|GB)?/i);
    if (match) {
      const value = parseFloat(match[1]);
      const unit = (match[2] || 'B').toUpperCase();
      if (unit === 'B') bytes = value;
      else if (unit === 'KB') bytes = value * 1024;
      else if (unit === 'MB') bytes = value * 1024 * 1024;
      else if (unit === 'GB') bytes = value * 1024 * 1024 * 1024;
    }
  }
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// Hook to fetch username from userId
function useUsername(userId: string | undefined) {
  const [username, setUsername] = useState<string>("");
  useEffect(() => {
    async function fetchUsername() {
      if (!userId) { setUsername(""); return; }
      const { data } = await supabase.from('profiles').select('username').eq('user_id', userId).single();
      setUsername(data?.username || "Unknown");
    }
    fetchUsername();
  }, [userId]);
  return username;
}

// Helper to get display name for a file
function getFileDisplayName(file: any, fallback: string) {
  return file?.fileType === 'link' ? file?.storageKey : (file?.filename || fallback);
}

export function DraggableFileItem({
  id,
  name,
  type,
  size,
  author,
  date,
  tag,
  file,
  onRename = () => {},
  onDragStart = () => {},
  onDragOver = () => {},
  onDrop = () => {},
  onDelete = () => {},
  onDownload = () => {},
  onSave,
  isDragging,
  isDraggedOver,
  userRole = "guest",
  onClick,
  labId,
  showSaveToProfile = false,
}: FileItemProps) {
  const isAdmin = userRole === "admin"
  const [isRenaming, setIsRenaming] = useState(false)
  const [tempName, setTempName] = useState(name)
  const [isBeingDragged, setIsBeingDragged] = useState(false)
  const [isDropTarget, setIsDropTarget] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [fileViewerOpen, setFileViewerOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const fileRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth();

  const lastUpdatedBy = file?.lastUpdatedBy;
  const lastUpdated = file?.lastUpdated || date;
  const lastUpdatedByName = useUsername(lastUpdatedBy);

  // Determine file tag if not provided
  const fileTag = tag || getAutoTag(type)

  function getAutoTag(fileType: string | undefined | null): string | undefined {
    if (!fileType) return undefined;
    const lowerType = fileType.toLowerCase();

    // Tabular data files
    if (["csv", "xlsx", "json", "fits"].includes(lowerType)) {
      return "DATASET";
    }

    // Code files
    if (["py", "js", "ts", "r", "c", "cpp", "java", "php", "rb", "go", "rust"].includes(lowerType)) {
      return "CODE";
    }

    return undefined;
  }

  const getTagColor = (tag?: string): string => {
    switch (tag) {
      case "DATASET":
        return "bg-blue-500 hover:bg-blue-600"
      case "CODE":
        return "bg-purple-500 hover:bg-purple-600"
      case "PROTOCOL":
        return "bg-green-500 hover:bg-green-600"
      case "PUBLICATION":
        return "bg-amber-500 hover:bg-amber-600"
      case "EXPERIMENT":
        return "bg-red-500 hover:bg-red-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  const getFileIcon = (type: string | undefined | null) => {
    if (!type) return <FileIcon className="h-5 w-5 mr-2 text-accent" />;
    switch (type.toLowerCase()) {
      case "csv":
      case "xlsx":
      case "fits":
        return <FileSpreadsheetIcon className="h-5 w-5 mr-2 text-accent" />
      case "json":
        return <FileJsonIcon className="h-5 w-5 mr-2 text-accent" />
      case "py":
      case "js":
      case "ts":
      case "r":
        return <FileCodeIcon className="h-5 w-5 mr-2 text-accent" />
      case "md":
      case "txt":
        return <FileTextIcon className="h-5 w-5 mr-2 text-accent" />
      default:
        return <FileIcon className="h-5 w-5 mr-2 text-accent" />
    }
  }

  const startRenaming = () => {
    if (!isAdmin) return
    setIsRenaming(true)
    setTempName(file?.fileType === 'link' ? (file?.storageKey || "") : (name || ""))
  }

  const saveRename = () => {
    if (!isAdmin) return
    if (tempName.trim()) {
      onRename(id, tempName)
    }
    setIsRenaming(false)
  }

  const cancelRenaming = () => {
    setIsRenaming(false)
  }

  const handleDragStart = (e: React.DragEvent) => {
    if (!isAdmin) return
    setIsBeingDragged(true)
    onDragStart(e, id, name, type)

    // Create a ghost image for dragging
    if (fileRef.current) {
      const rect = fileRef.current.getBoundingClientRect()
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
      ghostElement.textContent = name

      document.body.appendChild(ghostElement)
      ghostElement.style.position = "absolute"
      ghostElement.style.top = "-1000px"
      ghostElement.style.left = "-1000px"

      e.dataTransfer.setDragImage(ghostElement, rect.width / 2, rect.height / 2)

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
    setIsDropTarget(true)
    onDragOver(e)
  }

  const handleDragLeave = () => {
    if (!isAdmin) return
    setIsDropTarget(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    if (!isAdmin) return
    e.preventDefault()
    setIsDropTarget(false)
    onDrop(e, id)
  }

  const handleSaveToProfile = async () => {
    if (!user) {
      toast({ title: "Not logged in", description: "Please log in to save files to your profile.", variant: "destructive" });
      setSaveDialogOpen(false);
      return;
    }
    try {
      // Prevent duplicate saves
      const { data: existing, error: fetchError } = await supabase
        .from("saved_files")
        .select("id")
        .eq("user_id", user.id)
        .eq("file_id", id)
        .maybeSingle();
      if (existing) {
        toast({ title: "Already saved", description: "This file is already in your saved files.", variant: "default" });
        setSaveDialogOpen(false);
        return;
      }
      const { error } = await supabase.from("saved_files").insert([
        { user_id: user.id, file_id: id, labId: labId }
      ]);
      if (error) throw error;
      toast({ title: "File saved", description: `${getFileDisplayName(file, name)} has been saved to your profile.` });
    } catch (err: any) {
      toast({ title: "Error saving file", description: err.message || String(err), variant: "destructive" });
    }
    setSaveDialogOpen(false);
  }

  const handleOpenFile = () => {
    setFileViewerOpen(true)
  }

  const handleSaveFile = (fileId: string, content: any) => {
    // Pass through to the onSave prop from lab-materials-explorer
    if (onSave) {
      onSave(fileId, content);
    } else {
      toast({
        title: "Save Not Available",
        description: "Save functionality is not available for this file.",
        variant: "destructive",
      });
    }
  }

  const confirmDelete = () => {
    if (onDelete) {
      onDelete(id)
    }
    setDeleteDialogOpen(false)
  }

  const handleDeleteFile = (fileId: string) => {
    if (onDelete) {
      onDelete(fileId)
    }
  }

  // Determine if the item should be draggable
  const draggableProps = isAdmin
    ? {
        draggable: true,
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
      }
    : {}

  return (
    <>
      <div
        ref={fileRef}
        className={`flex items-center p-2 rounded-md transition-all duration-200
          ${isBeingDragged ? "opacity-50" : ""}
          ${isDropTarget || isDraggedOver ? "bg-accent/20 border-2 border-dashed border-accent" : "hover:bg-secondary border-2 border-transparent"}
          ${isAdmin ? "cursor-grab active:cursor-grabbing" : ""}
          ${onClick ? "cursor-pointer" : ""}
        `}
        {...draggableProps}
        onClick={onClick}
      >
        {getFileIcon(type)}
        <div className="flex-1">
          {isRenaming ? (
            <div className="flex items-center gap-2">
              <Input value={tempName} onChange={(e) => setTempName(e.target.value)} className="h-7 py-1" autoFocus />
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={saveRename}>
                <Check className="h-4 w-4 text-green-500" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelRenaming}>
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center">
              {file?.fileType === 'link' ? (
                <a href={file?.storageKey} target="_blank" rel="noopener noreferrer" className="underline break-all text-sm font-medium font-fell">{getFileDisplayName(file, name)}</a>
              ) : (
                <h3 className="text-sm font-medium font-fell">{getFileDisplayName(file, name)}</h3>
              )}
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-2 text-muted-foreground hover:text-accent"
                  onClick={startRenaming}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}
          {fileTag && (
            <div className="flex items-center gap-1 mt-1 mb-1">
              <Tag className="h-3 w-3 text-muted-foreground" />
              <Badge className={`text-xs px-1.5 py-0 h-4 ${getTagColor(fileTag)}`}>{fileTag}</Badge>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {formatFileSize(size || file?.fileSize || 0)} • Last updated by {lastUpdatedByName || lastUpdatedBy || "Unknown"}{lastUpdated ? `, ${new Date(lastUpdated).toLocaleString()}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-500 hover:bg-blue-500/10 hover:text-blue-400"
            onClick={handleOpenFile}
            title="Open file"
          >
            <Eye className="h-5 w-5" />
          </Button>
          {showSaveToProfile && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-accent hover:bg-accent/10"
              onClick={handleSaveToProfile}
              title="Save to profile"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-500 hover:bg-blue-500/10 hover:text-blue-400"
            onClick={async () => { try { await downloadFile(file); } catch (e) { alert('Download failed'); } }}
            title="Download file"
          >
            <Download className="h-5 w-5" />
          </Button>
          {isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:bg-red-500/10 hover:text-red-400"
              onClick={() => setDeleteDialogOpen(true)}
              title="Delete file"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Save to Profile Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save to Profile</DialogTitle>
            <DialogDescription>Do you want to save this file to your profile?</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-md">
            {getFileIcon(type)}
            <div>
              <h3 className="font-medium">{getFileDisplayName(file, name)}</h3>
              {fileTag && (
                <div className="flex items-center gap-1 mt-1">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  <Badge className={`text-xs px-1.5 py-0 h-4 ${getTagColor(fileTag)}`}>{fileTag}</Badge>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                {formatFileSize(size || file?.fileSize || 0)} • Last updated by {lastUpdatedByName || lastUpdatedBy || "Unknown"}{lastUpdated ? `, ${new Date(lastUpdated).toLocaleString()}` : ""}
              </p>
            </div>
          </div>
          <DialogFooter className="flex sm:justify-between mt-4">
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleSaveToProfile}>
              Save to My Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{getFileDisplayName(file, name)}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex sm:justify-between mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Viewer Dialog */}
      {fileViewerOpen && (
        <FileViewerDialog
          file={{
            id,
            name: getFileDisplayName(file, name),
            type: (file && file.filename && file.filename.includes('.') ? file.filename.split('.').pop()?.toLowerCase() : type) || type,
            size,
            author,
            date,
            url: file?.url || '',
            storageKey: file?.storageKey || '',
            path: (file?.storageKey || file?.path) || '',
            content: file?.content || ''
          }}
          isOpen={fileViewerOpen}
          onClose={() => setFileViewerOpen(false)}
          userRole={userRole}
          onDelete={handleDeleteFile}
          onSave={handleSaveFile}
          labId={labId}
        />
      )}
    </>
  )
}
