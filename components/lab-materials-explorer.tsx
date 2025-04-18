"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Maximize2, Minimize2, Upload, FileIcon, FolderPlus } from "lucide-react"
import { CreateFileDialog } from "@/components/create-file-dialog"
import { CreateFolderDialog } from "@/components/create-folder-dialog"
import { FileUploadDialog } from "@/components/file-upload-dialog"
import { DraggableFolder } from "@/components/draggable-folder"
import { DraggableFileItem } from "@/components/draggable-file-item"
import { toast } from "@/hooks/use-toast"

// Sample folder data
const initialFolders = [
  {
    id: "datasets",
    name: "DATASETS",
    count: 4,
    lastUpdated: "2 days ago",
    files: [
      {
        id: "fmri-data",
        name: "FMRI_DATA_2023.CSV",
        type: "csv",
        size: "1.2 MB",
        author: "Dr. Johnson",
        date: "2 days ago",
      },
      {
        id: "patient-responses",
        name: "PATIENT_RESPONSES.XLSX",
        type: "xlsx",
        size: "845 KB",
        author: "Alex Kim",
        date: "3 days ago",
      },
      {
        id: "brain-scans",
        name: "BRAIN_SCANS_METADATA.JSON",
        type: "json",
        size: "128 KB",
        author: "Dr. Johnson",
        date: "2 days ago",
      },
      {
        id: "cognitive-test",
        name: "COGNITIVE_TEST_RESULTS.CSV",
        type: "csv",
        size: "2.1 MB",
        author: "Maya Patel",
        date: "1 week ago",
      },
    ],
  },
  {
    id: "models",
    name: "MODELS",
    count: 3,
    lastUpdated: "1 week ago",
    files: [
      {
        id: "neural-network",
        name: "NEURAL_NETWORK_V2.PY",
        type: "py",
        size: "45 KB",
        author: "Dr. Johnson",
        date: "1 week ago",
      },
      {
        id: "brain-mapping",
        name: "BRAIN_MAPPING_MODEL.H5",
        type: "h5",
        size: "250 MB",
        author: "Alex Kim",
        date: "2 weeks ago",
      },
      {
        id: "prediction-algorithm",
        name: "PREDICTION_ALGORITHM.PY",
        type: "py",
        size: "32 KB",
        author: "Maya Patel",
        date: "10 days ago",
      },
    ],
  },
  {
    id: "protocols",
    name: "PROTOCOLS",
    count: 2,
    lastUpdated: "3 days ago",
    files: [
      {
        id: "experiment-procedure",
        name: "EXPERIMENT_PROCEDURE.MD",
        type: "md",
        size: "15 KB",
        author: "Dr. Johnson",
        date: "3 days ago",
        tag: "PROTOCOL",
      },
      {
        id: "data-collection",
        name: "DATA_COLLECTION_PROTOCOL.PDF",
        type: "pdf",
        size: "1.8 MB",
        author: "Research Team",
        date: "1 week ago",
        tag: "PROTOCOL",
      },
    ],
  },
  {
    id: "publications",
    name: "PUBLICATIONS",
    count: 3,
    lastUpdated: "1 week ago",
    files: [
      {
        id: "neural-network-paper",
        name: "NEURAL NETWORK ADAPTATIONS IN COGNITIVE LEARNING",
        type: "md",
        size: "42 KB",
        author: "Dr. Sarah Johnson",
        date: "1 week ago",
        tag: "PUBLICATION",
      },
      {
        id: "brain-mapping-paper",
        name: "MAPPING BRAIN ACTIVITY DURING COMPLEX PROBLEM SOLVING",
        type: "md",
        size: "38 KB",
        author: "Dr. Sarah Johnson",
        date: "2 weeks ago",
        tag: "PUBLICATION",
      },
      {
        id: "bci-advances",
        name: "ADVANCES IN BRAIN-COMPUTER INTERFACE TECHNOLOGIES",
        type: "md",
        size: "45 KB",
        author: "Alex Kim",
        date: "3 weeks ago",
        tag: "PUBLICATION",
      },
    ],
  },
  {
    id: "experiments",
    name: "EXPERIMENTS",
    count: 2,
    lastUpdated: "5 days ago",
    files: [
      {
        id: "experiment-notes",
        name: "EXPERIMENT_NOTES.TXT",
        type: "txt",
        size: "8 KB",
        author: "Maya Patel",
        date: "5 days ago",
        tag: "EXPERIMENT",
      },
      {
        id: "experiment-results",
        name: "EXPERIMENT_RESULTS_SUMMARY.MD",
        type: "md",
        size: "22 KB",
        author: "Alex Kim",
        date: "6 days ago",
        tag: "EXPERIMENT",
      },
    ],
  },
]

// Root level files
const initialRootFiles = [
  {
    id: "fmri-analysis",
    name: "FMRI_ANALYSIS_PIPELINE.PY",
    type: "py",
    size: "78 KB",
    author: "Dr. Johnson",
    date: "1 day ago",
  },
  {
    id: "cognitive-results",
    name: "COGNITIVE_TEST_RESULTS.CSV",
    type: "csv",
    size: "1.5 MB",
    author: "Alex Kim",
    date: "3 days ago",
  },
  {
    id: "lab-overview",
    name: "LAB_OVERVIEW.MD",
    type: "md",
    size: "12 KB",
    author: "Dr. Johnson",
    date: "1 day ago",
    tag: "PUBLICATION",
  },
]

interface LabMaterialsExplorerProps {
  createNewFolder?: boolean
  userRole?: string
}

export function LabMaterialsExplorer({ createNewFolder, userRole = "admin" }: LabMaterialsExplorerProps) {
  const isAdmin = userRole === "admin"
  const [isExpanded, setIsExpanded] = useState(false)
  const [openFolders, setOpenFolders] = useState<string[]>(["datasets", "publications"]) // Open datasets and publications by default
  const [folders, setFolders] = useState(initialFolders)
  const [rootFiles, setRootFiles] = useState(initialRootFiles)
  const [draggedItem, setDraggedItem] = useState<{ id: string; name: string; type: string; isFolder?: boolean } | null>(
    null,
  )
  const [dropTargetId, setDropTargetId] = useState<string | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false)
  const [isCreateFileDialogOpen, setIsCreateFileDialogOpen] = useState(false)

  // Toggle folder open/closed state
  const toggleFolder = (folderId: string) => {
    setOpenFolders((prev) => (prev.includes(folderId) ? prev.filter((id) => id !== folderId) : [...prev, folderId]))
  }

  // Open all folders
  const openAllFolders = () => {
    setOpenFolders(folders.map((folder) => folder.id))
  }

  // Handle "Browse All Files" button click
  const handleBrowseAll = () => {
    setIsExpanded(true)
    openAllFolders()
  }

  // Rename folder
  const handleRenameFolder = (folderId: string, newName: string) => {
    if (!isAdmin) return
    setFolders((prev) => prev.map((folder) => (folder.id === folderId ? { ...folder, name: newName } : folder)))
  }

  // Rename file within a folder
  const handleRenameFile = (fileId: string, newName: string) => {
    if (!isAdmin) return

    // Check if file is in root
    const rootFileIndex = rootFiles.findIndex((file) => file.id === fileId)

    if (rootFileIndex !== -1) {
      setRootFiles((prev) => prev.map((file) => (file.id === fileId ? { ...file, name: newName } : file)))
      return
    }

    // Check in folders
    setFolders((prev) =>
      prev.map((folder) => ({
        ...folder,
        files: folder.files.map((file) => (file.id === fileId ? { ...file, name: newName } : file)),
      })),
    )
  }

  // Delete file
  const handleDeleteFile = (fileId: string) => {
    if (!isAdmin) return

    // Check if file is in root
    const rootFileIndex = rootFiles.findIndex((file) => file.id === fileId)

    if (rootFileIndex !== -1) {
      setRootFiles((prev) => prev.filter((file) => file.id !== fileId))

      toast({
        title: "File Deleted",
        description: `File has been deleted from root.`,
      })
      return
    }

    // Check in folders
    let folderFound = false
    setFolders((prev) =>
      prev.map((folder) => {
        const fileIndex = folder.files.findIndex((file) => file.id === fileId)
        if (fileIndex !== -1) {
          folderFound = true
          return {
            ...folder,
            files: folder.files.filter((file) => file.id !== fileId),
            count: folder.files.length - 1,
            lastUpdated: "Just now",
          }
        }
        return folder
      }),
    )

    if (folderFound) {
      toast({
        title: "File Deleted",
        description: `File has been deleted.`,
      })
    }
  }

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, id: string, name: string, type: string, isFolder = false) => {
    if (!isAdmin) return

    setDraggedItem({ id, name, type, isFolder })

    // Set drag image and data
    if (e.dataTransfer) {
      e.dataTransfer.setData("text/plain", JSON.stringify({ id, name, type, isFolder }))
      e.dataTransfer.effectAllowed = "move"
    }
  }

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    if (!isAdmin) return

    e.preventDefault()
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move"
    }
  }

  // Handle container drag over
  const handleContainerDragOver = (e: React.DragEvent) => {
    if (!isAdmin) return

    e.preventDefault()
    setIsDraggingOver(true)
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "copy"
    }
  }

  // Handle container drag leave
  const handleContainerDragLeave = (e: React.DragEvent) => {
    if (!isAdmin) return

    e.preventDefault()
    // Only set to false if we're leaving the container (not entering a child)
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsDraggingOver(false)
    }
  }

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetId?: string) => {
    if (!isAdmin) return

    e.preventDefault()
    setDropTargetId(null)
    setIsDraggingOver(false)

    // Handle external files dropped from desktop
    if (e.dataTransfer?.files.length > 0) {
      const files = Array.from(e.dataTransfer.files)
      handleExternalFileDrop(files, targetId)
      return
    }

    // Skip if dropping onto itself
    if (draggedItem?.id === targetId) return

    // Handle internal drag and drop
    if (draggedItem?.isFolder) {
      // TODO: Implement folder moving logic if needed
      toast({
        title: "Folder Moving",
        description: "Folder moving is not implemented yet",
      })
    } else if (draggedItem) {
      moveFile(draggedItem.id, targetId)
    }

    setDraggedItem(null)
  }

  // Handle external file drop
  const handleExternalFileDrop = (files: File[], targetFolderId?: string) => {
    if (!isAdmin) return

    const newFiles = files.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name.toUpperCase(),
      type: file.name.split(".").pop() || "",
      size: `${(file.size / 1024).toFixed(1)} KB`,
      author: "Current User",
      date: "Just now",
    }))

    if (targetFolderId) {
      // Add to specific folder
      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === targetFolderId
            ? {
                ...folder,
                files: [...folder.files, ...newFiles],
                count: folder.files.length + newFiles.length,
                lastUpdated: "Just now",
              }
            : folder,
        ),
      )

      toast({
        title: "Files Uploaded",
        description: `${newFiles.length} file(s) added to ${folders.find((f) => f.id === targetFolderId)?.name || "folder"}`,
      })
    } else {
      // Add to root
      setRootFiles((prev) => [...prev, ...newFiles])

      toast({
        title: "Files Uploaded",
        description: `${newFiles.length} file(s) added to root`,
      })
    }
  }

  // Move file between folders or to/from root
  const moveFile = (fileId: string, targetFolderId?: string) => {
    if (!isAdmin) return

    // Find the file
    let fileToMove = rootFiles.find((file) => file.id === fileId)
    let sourceIsRoot = false
    let sourceFolderId = ""

    if (fileToMove) {
      sourceIsRoot = true
    } else {
      // Check in folders
      for (const folder of folders) {
        const foundFile = folder.files.find((file) => file.id === fileId)
        if (foundFile) {
          fileToMove = foundFile
          sourceFolderId = folder.id
          break
        }
      }
    }

    if (!fileToMove) return

    // Remove from source
    if (sourceIsRoot) {
      setRootFiles((prev) => prev.filter((file) => file.id !== fileId))
    } else {
      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === sourceFolderId
            ? {
                ...folder,
                files: folder.files.filter((file) => file.id !== fileId),
                count: folder.files.length - 1,
                lastUpdated: "Just now",
              }
            : folder,
        ),
      )
    }

    // Add to target
    if (!targetFolderId) {
      // Move to root
      setRootFiles((prev) => [...prev, fileToMove!])

      toast({
        title: "File Moved",
        description: `${fileToMove.name} moved to root`,
      })
    } else {
      // Move to folder
      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === targetFolderId
            ? {
                ...folder,
                files: [...folder.files, fileToMove!],
                count: folder.files.length + 1,
                lastUpdated: "Just now",
              }
            : folder,
        ),
      )

      toast({
        title: "File Moved",
        description: `${fileToMove.name} moved to ${folders.find((f) => f.id === targetFolderId)?.name || "folder"}`,
      })
    }
  }

  // Handle file upload completion
  const handleUploadComplete = (files: any[]) => {
    if (!isAdmin) return

    // Determine where to add the files based on the folder property
    files.forEach((file) => {
      if (file.folder === "root") {
        setRootFiles((prev) => [...prev, file])
      } else {
        setFolders((prev) =>
          prev.map((folder) =>
            folder.id === file.folder
              ? {
                  ...folder,
                  files: [...folder.files, file],
                  count: folder.files.length + 1,
                  lastUpdated: "Just now",
                }
              : folder,
          ),
        )
      }
    })

    toast({
      title: "Upload Complete",
      description: `${files.length} file(s) uploaded successfully`,
    })
  }

  // Create a new folder
  const createFolder = (folderName: string) => {
    if (!isAdmin) return

    const newFolder = {
      id: `folder-${Date.now()}`,
      name: folderName,
      count: 0,
      lastUpdated: "Just now",
      files: [],
    }

    setFolders([...folders, newFolder])
    setOpenFolders([...openFolders, newFolder.id]) // Open the new folder

    toast({
      title: "Folder Created",
      description: `New folder "${folderName}" has been created`,
    })
  }

  // Effect to create a new folder when createNewFolder prop changes
  useEffect(() => {
    if (createNewFolder && isAdmin) {
      setIsCreateFolderDialogOpen(true)
    }
  }, [createNewFolder, isAdmin])

  // Setup container drop zone for files from desktop
  useEffect(() => {
    const container = containerRef.current
    if (!container || !isAdmin) return

    const handleContainerDragOver = (e: DragEvent) => {
      e.preventDefault()
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy"
      }
    }

    const handleContainerDrop = (e: DragEvent) => {
      e.preventDefault()
      if (e.dataTransfer?.files.length > 0) {
        const files = Array.from(e.dataTransfer.files)
        handleExternalFileDrop(files)
      }
    }

    // Add event listeners with the passive option set to false
    container.addEventListener("dragover", handleContainerDragOver, { passive: false })
    container.addEventListener("drop", handleContainerDrop, { passive: false })

    // Make sure to clean up event listeners
    return () => {
      container.removeEventListener("dragover", handleContainerDragOver)
      container.removeEventListener("drop", handleContainerDrop)
    }
  }, [isAdmin])

  // Handle publication file click
  const handlePublicationClick = (fileId: string) => {
    // In a real app, this would navigate to the publication editor with the file ID
    if (fileId.includes("publication")) {
      toast({
        title: "Opening Publication",
        description: "Navigating to publication editor...",
      })
      // This would be replaced with actual navigation in a real app
      // router.push(`/publications/edit/${fileId}`)
    }
  }

  return (
    <Card className={isExpanded ? "fixed inset-4 z-50 overflow-auto" : ""}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>LAB MATERIALS</CardTitle>
        <div className="flex gap-2 items-center">
          <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)} className="h-8 w-8">
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent
        ref={containerRef}
        className={`space-y-4 ${isExpanded ? "min-h-[calc(100vh-200px)]" : ""} relative`}
        onDragOver={isAdmin ? handleContainerDragOver : undefined}
        onDragLeave={isAdmin ? handleContainerDragLeave : undefined}
        onDrop={isAdmin ? handleDrop : undefined}
      >
        {/* Drop indicator overlay */}
        {isAdmin && isDraggingOver && !dropTargetId && (
          <div className="absolute inset-0 border-2 border-dashed border-accent bg-accent/10 rounded-md flex items-center justify-center z-10 pointer-events-none">
            <div className="bg-card p-4 rounded-md shadow-lg text-center">
              <p className="text-lg font-bold text-accent">Drop Files Here</p>
              <p className="text-sm text-muted-foreground">Release to upload files to root</p>
            </div>
          </div>
        )}

        <div className="flex justify-center mb-4">
          {userRole === "admin" && (
            <div className="flex gap-2">
              <Button
                className="bg-accent text-primary-foreground hover:bg-accent/90"
                onClick={() => setIsUploadDialogOpen(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                UPLOAD FILE
              </Button>
              <Button
                className="bg-accent text-primary-foreground hover:bg-accent/90"
                onClick={() => setIsCreateFileDialogOpen(true)}
              >
                <FileIcon className="h-4 w-4 mr-2" />
                CREATE FILE
              </Button>
              <Button
                className="bg-accent text-primary-foreground hover:bg-accent/90"
                onClick={() => setIsCreateFolderDialogOpen(true)}
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                NEW FOLDER
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {folders.map((folder) => (
            <DraggableFolder
              key={folder.id}
              id={folder.id}
              name={folder.name}
              count={folder.count}
              lastUpdated={folder.lastUpdated}
              files={folder.files}
              isOpen={openFolders.includes(folder.id)}
              onToggle={toggleFolder}
              onRenameFolder={handleRenameFolder}
              onRenameFile={handleRenameFile}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              userRole={userRole}
              renderFileItem={(file) => (
                <DraggableFileItem
                  key={file.id}
                  id={file.id}
                  name={file.name}
                  type={file.type}
                  size={file.size}
                  author={file.author}
                  date={file.date}
                  tag={file.tag}
                  onRename={handleRenameFile}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDelete={handleDeleteFile}
                  isDraggedOver={dropTargetId === file.id}
                  userRole={userRole}
                  onClick={file.tag === "PUBLICATION" ? () => handlePublicationClick(file.id) : undefined}
                />
              )}
            />
          ))}

          {rootFiles.map((file) => (
            <DraggableFileItem
              key={file.id}
              id={file.id}
              name={file.name}
              type={file.type}
              size={file.size}
              author={file.author}
              date={file.date}
              onRename={handleRenameFile}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDelete={handleDeleteFile}
              isDraggedOver={dropTargetId === file.id}
              userRole={userRole}
            />
          ))}
        </div>

        {isExpanded && (
          <div className="fixed bottom-8 right-8">
            <Button
              onClick={() => setIsExpanded(false)}
              className="bg-accent text-primary-foreground hover:bg-accent/90"
            >
              <Minimize2 className="h-4 w-4 mr-2" />
              Close Expanded View
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full border-accent text-accent hover:bg-secondary"
          onClick={handleBrowseAll}
        >
          BROWSE ALL FILES
        </Button>
      </CardFooter>

      {/* Dialogs */}
      {isUploadDialogOpen && (
        <FileUploadDialog
          open={isUploadDialogOpen}
          onOpenChange={setIsUploadDialogOpen}
          onClose={() => setIsUploadDialogOpen(false)}
          onUploadComplete={handleUploadComplete}
        />
      )}

      {isCreateFolderDialogOpen && (
        <CreateFolderDialog
          onCreateFolder={createFolder}
          onClose={() => setIsCreateFolderDialogOpen(false)}
          isOpen={isCreateFolderDialogOpen}
        />
      )}

      {isCreateFileDialogOpen && <CreateFileDialog onClose={() => setIsCreateFileDialogOpen(false)} />}
    </Card>
  )
}
