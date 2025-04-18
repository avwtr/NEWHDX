"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ArrowLeft,
  FileIcon,
  FileTextIcon,
  FileSpreadsheetIcon,
  FileCodeIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  FolderIcon,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Type,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

interface Author {
  id: number
  name: string
  username: string
  avatar: string
  initials: string
}

interface Material {
  id: number
  name: string
  type: string
  fileType: string
  size: string
  author: string
  date: string
}

interface Category {
  value: string
  label: string
  color: string
}

interface PublicationEditorProps {
  title: string
  category: Category | undefined
  authors: Author[]
  attachedMaterials: Material[]
  labMaterials: Material[]
  onAttachMaterial: (materialId: number) => void
  onBack: () => void
}

export function PublicationEditor({
  title,
  category,
  authors,
  attachedMaterials,
  labMaterials,
  onAttachMaterial,
  onBack,
}: PublicationEditorProps) {
  const [content, setContent] = useState("")
  const [draggedMaterial, setDraggedMaterial] = useState<Material | null>(null)
  const [dropIndicator, setDropIndicator] = useState<{ x: number; y: number } | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const [editorHasFocus, setEditorHasFocus] = useState(false)
  const [placeholderVisible, setPlaceholderVisible] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<Material[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [openFolders, setOpenFolders] = useState<string[]>(["datasets"])

  // Get file icon based on type
  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "csv":
      case "xlsx":
      case "fits":
        return <FileSpreadsheetIcon className="h-4 w-4 text-accent" />
      case "py":
      case "js":
      case "ts":
        return <FileCodeIcon className="h-4 w-4 text-accent" />
      case "md":
      case "txt":
        return <FileTextIcon className="h-4 w-4 text-accent" />
      default:
        return <FileIcon className="h-4 w-4 text-accent" />
    }
  }

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, material: Material) => {
    e.dataTransfer.setData("application/json", JSON.stringify(material))
    e.dataTransfer.effectAllowed = "copy"
    setDraggedMaterial(material)

    // Create a custom drag image
    const dragPreview = document.createElement("div")
    dragPreview.className = "bg-secondary/80 text-white px-2 py-1 rounded text-sm"
    dragPreview.textContent = material.name
    document.body.appendChild(dragPreview)
    e.dataTransfer.setDragImage(dragPreview, 0, 0)

    setTimeout(() => {
      document.body.removeChild(dragPreview)
    }, 0)
  }

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedMaterial(null)
  }

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!editorRef.current) return

    e.dataTransfer.dropEffect = "copy"

    // Get caret position from mouse coordinates
    const selection = document.caretPositionFromPoint
      ? document.caretPositionFromPoint(e.clientX, e.clientY)
      : document.caretRangeFromPoint
        ? document.caretRangeFromPoint(e.clientX, e.clientY)
        : null

    if (selection) {
      // Calculate position for drop indicator
      const editorRect = editorRef.current.getBoundingClientRect()
      const x = e.clientX - editorRect.left
      const y = e.clientY - editorRect.top

      setDropIndicator({ x, y })
    }
  }

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    // Only hide indicator if we're leaving the editor
    if (!editorRef.current?.contains(e.relatedTarget as Node)) {
      setDropIndicator(null)
    }
  }

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDropIndicator(null)

    if (!editorRef.current) return

    try {
      // Get the material data
      const materialData = e.dataTransfer.getData("application/json")
      if (!materialData) return

      const material = JSON.parse(materialData) as Material

      // Get caret position from mouse coordinates
      const selection = document.caretPositionFromPoint
        ? document.caretPositionFromPoint(e.clientX, e.clientY)
        : document.caretRangeFromPoint
          ? document.caretRangeFromPoint(e.clientX, e.clientY)
          : null

      if (selection) {
        // Create a range at the drop position
        const range = document.createRange()
        const sel = window.getSelection()

        if (document.caretPositionFromPoint) {
          // For browsers supporting caretPositionFromPoint
          range.setStart(selection.offsetNode!, selection.offset)
        } else {
          // For browsers supporting caretRangeFromPoint
          range.setStart((selection as Range).startContainer, (selection as Range).startOffset)
        }

        range.collapse(true)

        if (sel) {
          sel.removeAllRanges()
          sel.addRange(range)

          // Create the reference element
          const refElement = document.createElement("span")
          refElement.className = "inline-flex items-center bg-secondary/30 rounded px-2 py-0.5 mx-1 text-accent text-sm"
          refElement.contentEditable = "false"
          refElement.dataset.materialId = String(material.id)
          refElement.innerHTML = `${material.name} (${material.fileType.toUpperCase()})`

          // Insert the element
          range.insertNode(refElement)

          // Move caret after the inserted element
          range.setStartAfter(refElement)
          range.collapse(true)
          sel.removeAllRanges()
          sel.addRange(range)

          // Ensure material is attached
          if (!attachedMaterials.some((m) => m.id === material.id)) {
            onAttachMaterial(material.id)

            toast({
              title: "Material Attached",
              description: `${material.name} has been attached to your publication`,
            })
          }

          // Update content state
          setContent(editorRef.current.innerHTML)
          setPlaceholderVisible(false)
        }
      }
    } catch (error) {
      console.error("Error dropping material:", error)
      toast({
        title: "Error",
        description: "Failed to insert material reference",
        variant: "destructive",
      })
    }

    setDraggedMaterial(null)
  }

  // Handle editor input
  const handleEditorInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerHTML
    setContent(newContent)
    setPlaceholderVisible(newContent === "" || newContent === "<br>")
  }

  // Handle editor focus
  const handleEditorFocus = () => {
    setEditorHasFocus(true)
    if (placeholderVisible) {
      // Clear placeholder when editor gets focus
      if (editorRef.current) {
        editorRef.current.innerHTML = ""
      }
    }
  }

  // Handle editor blur
  const handleEditorBlur = () => {
    setEditorHasFocus(false)
    // Show placeholder if content is empty
    if (editorRef.current && (editorRef.current.innerHTML === "" || editorRef.current.innerHTML === "<br>")) {
      setPlaceholderVisible(true)
    }
  }

  // Handle click on the editor container
  const handleContainerClick = (e: React.MouseEvent) => {
    // Focus the editor when clicking anywhere in the container
    if (e.target === e.currentTarget && editorRef.current) {
      editorRef.current.focus()
    }
  }

  // Initialize editor with placeholder
  useEffect(() => {
    if (editorRef.current && !editorHasFocus && placeholderVisible) {
      editorRef.current.innerHTML = ""
    }
  }, [editorHasFocus, placeholderVisible])

  // Add a function to handle file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        id: Math.random().toString(36).substring(2, 9),
        name: file.name.toUpperCase(),
        type: file.name.split(".").pop() || "",
        fileType: file.name.split(".").pop() || "",
        size: `${(file.size / 1024).toFixed(1)} KB`,
        author: "Current User",
        date: "Just now",
      }))

      setUploadedFiles([...uploadedFiles, ...newFiles])

      // Automatically attach the uploaded files
      newFiles.forEach((file) => {
        if (!attachedMaterials.some((m) => m.id === file.id)) {
          onAttachMaterial(file.id)
        }
      })
    }
  }

  // Add a function to trigger file input click
  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  // Text formatting functions
  const formatText = (command: string, value = "") => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML)
    }
    // Refocus the editor after formatting
    editorRef.current?.focus()
  }

  // Apply heading styles
  const applyHeading = (level: string) => {
    formatText("formatBlock", level)
  }

  // Apply font size
  const applyFontSize = (size: string) => {
    formatText("fontSize", size)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-secondary/30">
          <ArrowLeft className="h-4 w-4 mr-2" />
          BACK
        </Button>

        <Button className="bg-accent/80 hover:bg-accent text-primary-foreground">PUBLISH</Button>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div
          className={`${sidebarCollapsed ? "w-12" : "w-64"} bg-[#0F1642]/80 p-4 rounded-r-3xl transition-all duration-300 relative`}
        >
          {/* Collapse/Expand Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -right-3 top-8 h-6 w-6 rounded-full bg-accent text-primary-foreground p-0 z-10"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>

          {/* Hidden file input for uploads */}
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" multiple />

          <div
            className={`${sidebarCollapsed ? "opacity-0 invisible" : "opacity-100 visible"} transition-opacity duration-200`}
          >
            <div className="flex items-center mb-2">
              <div className="w-2 h-2 rounded-full bg-accent mr-2"></div>
              <h3 className="text-sm font-mono uppercase">Lab Materials</h3>
            </div>

            {/* Lab Materials Section - Mirrors lab-materials-explorer.tsx */}
            <div className="space-y-4 mt-4 overflow-auto max-h-[calc(100vh-200px)]">
              {/* Folders with expandable/collapsible behavior */}
              {[
                {
                  id: "datasets",
                  name: "DATASETS",
                  files: [
                    {
                      id: 101,
                      name: "FMRI_DATA_2023.CSV",
                      type: "data",
                      fileType: "csv",
                      size: "1.2 MB",
                      author: "Dr. Johnson",
                      date: "2 days ago",
                    },
                    {
                      id: 102,
                      name: "PATIENT_RESPONSES.XLSX",
                      type: "data",
                      fileType: "xlsx",
                      size: "845 KB",
                      author: "Alex Kim",
                      date: "3 days ago",
                    },
                  ],
                },
                {
                  id: "models",
                  name: "MODELS",
                  files: [
                    {
                      id: 103,
                      name: "NEURAL_NETWORK_V2.PY",
                      type: "code",
                      fileType: "py",
                      size: "45 KB",
                      author: "Dr. Johnson",
                      date: "1 week ago",
                    },
                  ],
                },
                {
                  id: "protocols",
                  name: "PROTOCOLS",
                  files: [
                    {
                      id: 104,
                      name: "EXPERIMENT_PROCEDURE.MD",
                      type: "document",
                      fileType: "md",
                      size: "15 KB",
                      author: "Dr. Johnson",
                      date: "3 days ago",
                    },
                  ],
                },
              ].map((folder) => (
                <div key={folder.id} className="space-y-1">
                  {/* Folder header - clickable to expand/collapse */}
                  <div
                    className="flex items-center p-2 bg-secondary/20 rounded-md cursor-pointer hover:bg-secondary/30"
                    onClick={() => {
                      setOpenFolders((prev) =>
                        prev.includes(folder.id) ? prev.filter((id) => id !== folder.id) : [...prev, folder.id],
                      )
                    }}
                  >
                    <FolderIcon className="h-4 w-4 mr-2 text-accent" />
                    <span className="text-xs font-mono">{folder.name}</span>
                    <div className="ml-auto text-xs text-muted-foreground">{folder.files.length}</div>
                  </div>

                  {/* Folder contents - shown when expanded */}
                  {openFolders.includes(folder.id) && (
                    <div className="pl-4 space-y-1 border-l border-secondary/30 ml-2">
                      {folder.files.map((file) => (
                        <div
                          key={file.id}
                          className={`flex items-center p-2 ${
                            attachedMaterials.some((m) => m.id === file.id)
                              ? "bg-secondary/40"
                              : "hover:bg-secondary/20"
                          } rounded-md cursor-pointer`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, file)}
                          onDragEnd={handleDragEnd}
                        >
                          <div className="mr-2">{getFileIcon(file.fileType)}</div>
                          <div className="text-xs">
                            <div className="font-mono uppercase truncate max-w-[140px]">{file.name}</div>
                            <div className="text-gray-400 text-xs">
                              {file.fileType.toUpperCase()} • {file.size}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Root level files */}
              {[
                {
                  id: 105,
                  name: "FMRI_ANALYSIS_PIPELINE.PY",
                  type: "code",
                  fileType: "py",
                  size: "78 KB",
                  author: "Dr. Johnson",
                  date: "1 day ago",
                },
                {
                  id: 106,
                  name: "COGNITIVE_TEST_RESULTS.CSV",
                  type: "data",
                  fileType: "csv",
                  size: "1.5 MB",
                  author: "Alex Kim",
                  date: "3 days ago",
                },
                ...uploadedFiles,
              ].map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center p-2 ${
                    attachedMaterials.some((m) => m.id === file.id) ? "bg-secondary/40" : "hover:bg-secondary/20"
                  } rounded-md cursor-pointer`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, file)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="mr-2">{getFileIcon(file.fileType)}</div>
                  <div className="text-xs">
                    <div className="font-mono uppercase truncate max-w-[160px]">{file.name}</div>
                    <div className="text-gray-400 text-xs">
                      {file.fileType.toUpperCase()} • {file.size}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full text-xs border-accent text-accent hover:bg-secondary/30 mt-4"
              onClick={triggerFileUpload}
            >
              <Plus className="h-3 w-3 mr-1" /> UPLOAD NEW ATTACHMENT
            </Button>
          </div>

          {/* Collapsed view - compact folder structure */}
          {sidebarCollapsed && (
            <div className="flex flex-col items-center space-y-4 mt-10">
              <div className="flex flex-col items-center gap-2">
                <FolderIcon className="h-5 w-5 text-accent" title="Folders" />
                <FileIcon className="h-5 w-5 text-accent" title="Files" />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full bg-accent/20"
                onClick={triggerFileUpload}
                title="Upload New File"
              >
                <Plus className="h-3 w-3 text-accent" />
              </Button>
            </div>
          )}
        </div>

        {/* Main Editor */}
        <div className="flex-1 p-8">
          <div className="max-w-3xl mx-auto">
            {/* Title */}
            <h1 className="text-3xl font-serif italic mb-4">{title}</h1>

            {/* Category */}
            {category && (
              <div className="mb-4">
                <Badge className={`${category.color} text-white px-4 py-1`}>{category.label}</Badge>
              </div>
            )}

            {/* Authors */}
            <div className="flex items-center mb-8">
              <span className="text-sm mr-2">AUTHORS:</span>
              <div className="flex items-center space-x-2">
                {authors.map((author, index) => (
                  <div key={author.id} className="flex items-center">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={author.avatar} alt={author.name} />
                      <AvatarFallback>{author.initials}</AvatarFallback>
                    </Avatar>
                    {index < authors.length - 1 && <span className="mx-1">,</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Text Formatting Toolbar */}
            <div className="bg-secondary/10 rounded-t-md p-2 border border-secondary/20 flex flex-wrap gap-1 items-center">
              {/* Text Style Controls */}
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => formatText("bold")} title="Bold">
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => formatText("italic")}
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => formatText("underline")}
                title="Underline"
              >
                <Underline className="h-4 w-4" />
              </Button>

              <Separator orientation="vertical" className="mx-1 h-6" />

              {/* List Controls */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => formatText("insertUnorderedList")}
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => formatText("insertOrderedList")}
                title="Numbered List"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>

              <Separator orientation="vertical" className="mx-1 h-6" />

              {/* Heading Controls */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                    <Heading1 className="h-4 w-4 mr-1" />
                    Heading
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => applyHeading("h1")}>
                    <Heading1 className="h-4 w-4 mr-2" />
                    <span>Heading 1</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyHeading("h2")}>
                    <Heading2 className="h-4 w-4 mr-2" />
                    <span>Heading 2</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyHeading("h3")}>
                    <Heading3 className="h-4 w-4 mr-2" />
                    <span>Heading 3</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyHeading("p")}>
                    <Type className="h-4 w-4 mr-2" />
                    <span>Normal Text</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Font Size Controls */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                    <Type className="h-4 w-4 mr-1" />
                    Font Size
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => applyFontSize("1")}>
                    <span className="text-xs">Small</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyFontSize("3")}>
                    <span className="text-sm">Normal</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyFontSize("5")}>
                    <span className="text-base">Large</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyFontSize("7")}>
                    <span className="text-lg">Extra Large</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Separator orientation="vertical" className="mx-1 h-6" />

              {/* Alignment Controls */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => formatText("justifyLeft")}
                title="Align Left"
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => formatText("justifyCenter")}
                title="Align Center"
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => formatText("justifyRight")}
                title="Align Right"
              >
                <AlignRight className="h-4 w-4" />
              </Button>

              <Separator orientation="vertical" className="mx-1 h-6" />

              {/* Quote Control */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => formatText("formatBlock", "<blockquote>")}
                title="Quote"
              >
                <Quote className="h-4 w-4" />
              </Button>
            </div>

            {/* Editor Container */}
            <div
              className="relative min-h-[500px] border border-secondary/20 border-t-0 rounded-b-md p-4"
              onClick={handleContainerClick}
            >
              {/* Editable Content */}
              <div
                ref={editorRef}
                contentEditable
                className="min-h-[500px] focus:outline-none prose prose-invert max-w-none"
                onInput={handleEditorInput}
                onFocus={handleEditorFocus}
                onBlur={handleEditorBlur}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                suppressContentEditableWarning
              />

              {/* Placeholder */}
              {placeholderVisible && !editorHasFocus && (
                <div className="absolute top-4 left-4 text-gray-500 pointer-events-none">Start typing here...</div>
              )}

              {/* Drop Indicator */}
              {dropIndicator && (
                <div
                  className="absolute w-0.5 h-5 bg-accent animate-pulse"
                  style={{
                    left: `${dropIndicator.x}px`,
                    top: `${dropIndicator.y - 10}px`,
                  }}
                />
              )}
            </div>

            {/* Drag Instructions */}
            {draggedMaterial && (
              <div className="mt-4 text-sm text-center text-accent animate-pulse">
                Drag the material to where you want to insert it in your text
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
