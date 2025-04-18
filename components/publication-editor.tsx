"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
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
  ImageIcon,
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

// Define the sections of a scientific publication
const publicationSections = [
  {
    id: "introduction",
    label: "Introduction",
    placeholder: "Provide background information and state the purpose of your research...",
  },
  {
    id: "methods",
    label: "Methods",
    placeholder: "Describe the methodology, experimental design, and procedures used...",
  },
  { id: "results", label: "Results", placeholder: "Present your findings without interpretation..." },
  { id: "discussion", label: "Discussion", placeholder: "Interpret your results and discuss their implications..." },
  { id: "conclusion", label: "Conclusion", placeholder: "Summarize your findings and their significance..." },
  {
    id: "acknowledgments",
    label: "Acknowledgments",
    placeholder: "Acknowledge individuals or organizations that contributed to the research...",
  },
  { id: "references", label: "References", placeholder: "List all references cited in your publication..." },
]

// File type icons mapping
const fileTypeIcons: Record<string, any> = {
  pdf: FileIcon,
  docx: FileIcon,
  xlsx: FileIcon,
  csv: FileIcon,
  fits: FileIcon,
  py: FileIcon,
  r: FileIcon,
  ipynb: FileIcon,
  jpg: ImageIcon,
  png: ImageIcon,
  gif: ImageIcon,
  folder: FolderIcon,
}

// Interface for reference objects
interface Reference {
  id: string
  itemId: number
  name: string
  fileType: string
}

// Interface for section content
interface SectionContent {
  text: string
  references: Reference[]
}

// Custom rich text editor component
const RichTextEditor = ({
  section,
  content,
  placeholder,
  onChange,
  onDrop,
  onDragOver,
  onRemoveReference,
}: {
  section: string
  content: SectionContent
  placeholder: string
  onChange: (text: string) => void
  onDrop: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onRemoveReference: (refId: string) => void
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const [plainText, setPlainText] = useState(content.text)

  // Create a map of reference IDs to their objects for quick lookup
  const refsMap: Record<string, Reference> = {}
  content.references.forEach((ref) => {
    refsMap[ref.id] = ref
  })

  // Update the editor content when plainText changes
  useEffect(() => {
    if (!editorRef.current) return

    // Split text by reference placeholders
    const parts = plainText.split(/(\[REF:[^\]]+\])/)

    // Clear the editor
    editorRef.current.innerHTML = ""

    // Rebuild the editor content
    parts.forEach((part) => {
      const match = part.match(/\[REF:([^\]]+)\]/)
      if (match) {
        const refId = match[1]
        const ref = refsMap[refId]

        if (ref) {
          // Create reference element
          const refElement = document.createElement("span")
          refElement.className =
            "inline-flex items-center bg-green-500/20 text-green-300 rounded px-2 py-0.5 mx-1 border border-green-500/30"
          refElement.contentEditable = "false"
          refElement.dataset.refId = refId

          // Add icon
          const IconComponent = fileTypeIcons[ref.fileType] || FileIcon
          const iconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
          iconSvg.setAttribute("viewBox", "0 0 24 24")
          iconSvg.setAttribute("width", "12")
          iconSvg.setAttribute("height", "12")
          iconSvg.setAttribute("fill", "none")
          iconSvg.setAttribute("stroke", "currentColor")
          iconSvg.setAttribute("stroke-width", "2")
          iconSvg.setAttribute("stroke-linecap", "round")
          iconSvg.setAttribute("stroke-linejoin", "round")
          iconSvg.classList.add("mr-1")

          // Add appropriate path based on file type
          if (ref.fileType === "pdf" || ref.fileType === "docx" || ref.fileType === "xlsx" || ref.fileType === "csv") {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
            path.setAttribute("d", "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z")
            iconSvg.appendChild(path)

            const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline")
            polyline.setAttribute("points", "14 2 14 8 20 8")
            iconSvg.appendChild(polyline)
          } else if (ref.fileType === "jpg" || ref.fileType === "png" || ref.fileType === "gif") {
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
            rect.setAttribute("x", "3")
            rect.setAttribute("y", "3")
            rect.setAttribute("width", "18")
            rect.setAttribute("height", "18")
            rect.setAttribute("rx", "2")
            rect.setAttribute("ry", "2")
            iconSvg.appendChild(rect)

            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
            circle.setAttribute("cx", "8.5")
            circle.setAttribute("cy", "8.5")
            circle.setAttribute("r", "1.5")
            iconSvg.appendChild(circle)

            const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline")
            polyline.setAttribute("points", "21 15 16 10 5 21")
            iconSvg.appendChild(polyline)
          } else {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
            path.setAttribute("d", "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z")
            iconSvg.appendChild(path)

            const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline")
            polyline.setAttribute("points", "14 2 14 8 20 8")
            iconSvg.appendChild(polyline)
          }

          refElement.appendChild(iconSvg)

          // Add name
          const nameSpan = document.createElement("span")
          nameSpan.className = "text-xs"
          nameSpan.textContent = ref.name
          refElement.appendChild(nameSpan)

          // Add delete button
          const deleteButton = document.createElement("button")
          deleteButton.className = "ml-1 text-red-400 hover:text-red-300 focus:outline-none"
          deleteButton.setAttribute("aria-label", "Remove reference")
          deleteButton.onclick = (e) => {
            e.preventDefault()
            e.stopPropagation()
            onRemoveReference(refId)
          }

          const deleteIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg")
          deleteIcon.setAttribute("viewBox", "0 0 24 24")
          deleteIcon.setAttribute("width", "12")
          deleteIcon.setAttribute("height", "12")
          deleteIcon.setAttribute("fill", "none")
          deleteIcon.setAttribute("stroke", "currentColor")
          deleteIcon.setAttribute("stroke-width", "2")
          deleteIcon.setAttribute("stroke-linecap", "round")
          deleteIcon.setAttribute("stroke-linejoin", "round")

          const line1 = document.createElementNS("http://www.w3.org/2000/svg", "line")
          line1.setAttribute("x1", "18")
          line1.setAttribute("y1", "6")
          line1.setAttribute("x2", "6")
          line1.setAttribute("y2", "18")
          deleteIcon.appendChild(line1)

          const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line")
          line2.setAttribute("x1", "6")
          line1.setAttribute("y1", "6")
          line2.setAttribute("x2", "18")
          line2.setAttribute("y2", "18")
          deleteIcon.appendChild(line2)

          deleteButton.appendChild(deleteIcon)
          refElement.appendChild(deleteButton)

          editorRef.current.appendChild(refElement)
        } else {
          // If reference not found, just add the text
          const textNode = document.createTextNode(part)
          editorRef.current.appendChild(textNode)
        }
      } else if (part) {
        // Add regular text
        const textNode = document.createTextNode(part)
        editorRef.current.appendChild(textNode)
      }
    })

    // If empty, show placeholder
    if (!plainText && editorRef.current.innerHTML === "") {
      editorRef.current.innerHTML = `<div class="text-muted-foreground">${placeholder}</div>`
    }
  }, [plainText, refsMap, placeholder])

  // Handle input events to update the plainText state
  const handleInput = useCallback(() => {
    if (!editorRef.current) return

    // Extract text and references
    let extractedText = ""
    let currentNode = editorRef.current.firstChild

    while (currentNode) {
      if (currentNode.nodeType === Node.TEXT_NODE) {
        extractedText += currentNode.textContent
      } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
        const element = currentNode as HTMLElement
        if (element.dataset.refId) {
          extractedText += `[REF:${element.dataset.refId}]`
        } else {
          extractedText += element.textContent
        }
      }
      currentNode = currentNode.nextSibling
    }

    setPlainText(extractedText)
    onChange(extractedText)
  }, [onChange])

  // Handle keydown events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Handle backspace to delete references
      if (e.key === "Backspace" || e.key === "Delete") {
        const selection = window.getSelection()
        if (!selection || !selection.rangeCount) return

        const range = selection.getRangeAt(0)
        if (range.collapsed) {
          const node = range.startContainer
          const offset = range.startOffset

          // Check if we're at the beginning of a text node that follows a reference
          if (node.nodeType === Node.TEXT_NODE && offset === 0 && node.previousSibling) {
            const prevSibling = node.previousSibling as HTMLElement
            if (prevSibling.dataset?.refId) {
              e.preventDefault()
              onRemoveReference(prevSibling.dataset.refId)
              return
            }
          }

          // Check if we're at the end of a text node that precedes a reference
          if (node.nodeType === Node.TEXT_NODE && offset === node.textContent?.length && node.nextSibling) {
            const nextSibling = node.nextSibling as HTMLElement
            if (nextSibling.dataset?.refId && e.key === "Delete") {
              e.preventDefault()
              onRemoveReference(nextSibling.dataset.refId)
              return
            }
          }
        }
      }
    },
    [onRemoveReference],
  )

  return (
    <div
      ref={editorRef}
      className="min-h-[400px] p-4 border rounded-md font-mono bg-[#0F1642] text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
      contentEditable
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onDragOver={onDragOver}
      onDrop={onDrop}
      suppressContentEditableWarning
    />
  )
}

export function PublicationEditor({
  title,
  category,
  authors = [],
  attachedMaterials = [],
  labMaterials = [],
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
        id: Math.random(),
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

  const [activeSection, setActiveSection] = useState("introduction")
  const [sectionContent, setSectionContent] = useState<Record<string, SectionContent>>(() => {
    const initialContent: Record<string, SectionContent> = {}
    publicationSections.forEach((section) => {
      initialContent[section.id] = { text: "", references: [] }
    })
    return initialContent
  })

  const generateRefId = () => `ref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const handleContentChange = (section: string, text: string) => {
    setSectionContent((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        text,
      },
    }))
  }

  const insertFormatting = (format: string) => {
    // This would be implemented to insert formatting at cursor position
    // For a real implementation, you would need to track cursor position
    // and insert the appropriate markdown or formatting
    console.log(`Insert ${format} formatting`)
  }

  // Handle drag start for lab materials
  // const handleDragStart = (e: React.DragEvent, item: any) => {
  //   setDraggedItem(item)
  //   e.dataTransfer.setData("text/plain", JSON.stringify(item))
  //   e.dataTransfer.effectAllowed = "copy"
  // }

  // Handle drag over for editor
  // const handleDragOver = (e: React.DragEvent) => {
  //   e.preventDefault()
  //   e.dataTransfer.dropEffect = "copy"
  // }

  // Handle drop for editor
  // const handleDrop = (e: React.DragEvent, section: string) => {
  //   e.preventDefault()

  //   if (!draggedItem) return

  //   // Create a unique ID for the reference
  //   const refId = generateRefId()

  //   // Create reference object
  //   const newReference: Reference = {
  //     id: refId,
  //     itemId: draggedItem.id,
  //     name: draggedItem.name,
  //     fileType: draggedItem.fileType,
  //   }

  //   // Get selection position
  //   const selection = window.getSelection()
  //   if (!selection || !selection.rangeCount) return

  //   const range = selection.getRangeAt(0)

  //   // Create reference element
  //   const refElement = document.createElement("span")
  //   refElement.className =
  //     "inline-flex items-center bg-green-500/20 text-green-300 rounded px-2 py-0.5 mx-1 border border-green-500/30"
  //   refElement.contentEditable = "false"
  //   refElement.dataset.refId = refId

  //   // Add icon
  //   const IconComponent = fileTypeIcons[draggedItem.fileType] || FileIcon
  //   const iconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  //   iconSvg.setAttribute("viewBox", "0 0 24 24")
  //   iconSvg.setAttribute("width", "12")
  //   iconSvg.setAttribute("height", "12")
  //   iconSvg.setAttribute("fill", "none")
  //   iconSvg.setAttribute("stroke", "currentColor")
  //   iconSvg.setAttribute("stroke-width", "2")
  //   iconSvg.setAttribute("stroke-linecap", "round")
  //   iconSvg.setAttribute("stroke-linejoin", "round")
  //   iconSvg.classList.add("mr-1")

  //   // Add appropriate path based on file type
  //   if (
  //     draggedItem.fileType === "pdf" ||
  //     draggedItem.fileType === "docx" ||
  //     draggedItem.fileType === "xlsx" ||
  //     draggedItem.fileType === "csv"
  //   ) {
  //     const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
  //     path.setAttribute("d", "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z")
  //     iconSvg.appendChild(path)

  //     const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline")
  //     polyline.setAttribute("points", "14 2 14 8 20 8")
  //     iconSvg.appendChild(polyline)
  //   } else if (draggedItem.fileType === "jpg" || draggedItem.fileType === "png" || draggedItem.fileType === "gif") {
  //     const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
  //     rect.setAttribute("x", "3")
  //     rect.setAttribute("y", "3")
  //     rect.setAttribute("width", "18")
  //     rect.setAttribute("height", "18")
  //     rect.setAttribute("rx", "2")
  //     rect.setAttribute("ry", "2")
  //     iconSvg.appendChild(rect)

  //     const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
  //     circle.setAttribute("cx", "8.5")
  //     circle.setAttribute("cy", "8.5")
  //     circle.setAttribute("r", "1.5")
  //     iconSvg.appendChild(circle)

  //     const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline")
  //     polyline.setAttribute("points", "21 15 16 10 5 21")
  //     iconSvg.appendChild(polyline)
  //   } else {
  //     const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
  //     path.setAttribute("d", "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z")
  //     iconSvg.appendChild(path)

  //     const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline")
  //     polyline.setAttribute("points", "14 2 14 8 20 8")
  //     iconSvg.appendChild(polyline)
  //   }

  //   refElement.appendChild(iconSvg)

  //   // Add name
  //   const nameSpan = document.createElement("span")
  //   nameSpan.className = "text-xs"
  //   nameSpan.textContent = draggedItem.name
  //   refElement.appendChild(nameSpan)

  //   // Add delete button
  //   const deleteButton = document.createElement("button")
  //   deleteButton.className = "ml-1 text-red-400 hover:text-red-300 focus:outline-none"
  //   deleteButton.setAttribute("aria-label", "Remove reference")
  //   deleteButton.onclick = (e) => {
  //     e.preventDefault()
  //     e.stopPropagation()
  //     removeReference(section, refId)
  //   }

  //   const deleteIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  //   deleteIcon.setAttribute("viewBox", "0 0 24 24")
  //   deleteIcon.setAttribute("width", "12")
  //   deleteIcon.setAttribute("height", "12")
  //   deleteIcon.setAttribute("fill", "none")
  //   deleteIcon.setAttribute("stroke", "currentColor")
  //   deleteIcon.setAttribute("stroke-width", "2")
  //   deleteIcon.setAttribute("stroke-linecap", "round")
  //   deleteIcon.setAttribute("stroke-linejoin", "round")

  //   const line1 = document.createElementNS("http://www.w3.org/2000/svg", "line")
  //   line1.setAttribute("x1", "18")
  //   line1.setAttribute("y1", "6")
  //   line1.setAttribute("x2", "6")
  //   line1.setAttribute("y2", "18")
  //   deleteIcon.appendChild(line1)

  //   const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line")
  //   line2.setAttribute("x1", "6")
  //   line2.setAttribute("y1", "6")
  //   line2.setAttribute("x2", "18")
  //   line2.setAttribute("y2", "18")
  //   deleteIcon.appendChild(line2)

  //   deleteButton.appendChild(deleteIcon)
  //   refElement.appendChild(deleteButton)

  //   // Insert reference at cursor position
  //   range.deleteContents()
  //   range.insertNode(refElement)

  //   // Move cursor after the reference
  //   range.setStartAfter(refElement)
  //   range.setEndAfter(refElement)
  //   selection.removeAllRanges()
  //   selection.addRange(range)

  //   // Update content with new reference
  //   setSectionContent((prev) => ({
  //     ...prev,
  //     [section]: {
  //       ...prev[section],
  //       references: [...prev[section].references, newReference],
  //     },
  //   }))

  //   // Reset dragged item
  //   setDraggedItem(null)

  //   // Trigger input event to update the content
  //   const inputEvent = new Event("input", { bubbles: true })
  //   editorRefs.current[section]?.dispatchEvent(inputEvent)
  // }

  // Handle file upload
  // const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files.length > 0) {
  //     // In a real implementation, this would upload the file to a server
  //     // For now, we'll just log the file name
  //     console.log(`Uploading file: ${e.target.files[0].name}`)
  //     alert(`File "${e.target.files[0].name}" would be uploaded in a real implementation`)
  //   }
  // }

  // Remove reference by ID
  const removeReference = useCallback((section: string, refId: string) => {
    setSectionContent((prev) => {
      const sectionData = prev[section]
      const refIndex = sectionData.references.findIndex((ref) => ref.id === refId)

      if (refIndex === -1) return prev

      // Remove reference from array
      const updatedRefs = [...sectionData.references]
      updatedRefs.splice(refIndex, 1)

      // Remove reference placeholder from text
      const refPlaceholder = `[REF:${refId}]`
      const updatedText = sectionData.text.replace(refPlaceholder, "")

      return {
        ...prev,
        [section]: {
          text: updatedText,
          references: updatedRefs,
        },
      }
    })

    // Find and remove the reference element from the DOM
    // if (editorRefs.current[section]) {
    //   const refElements = editorRefs.current[section]?.querySelectorAll(`[data-ref-id="${refId}"]`)
    //   refElements?.forEach((el) => el.remove())

    //   // Trigger input event to update the content
    //   const inputEvent = new Event("input", { bubbles: true })
    //   editorRefs.current[section]?.dispatchEvent(inputEvent)
    // }
  }, [])

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
