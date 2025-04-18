"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Image, Table, File, Save, Download } from "lucide-react"
import { useRole } from "@/contexts/role-context"

interface FileViewerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: {
    name: string
    type: string
    content?: string
    size?: string
    uploadedBy?: string
    date?: string
    description?: string
  }
  onSave?: (file: any, content: string) => void
}

export function FileViewer({ open, onOpenChange, file, onSave }: FileViewerProps) {
  const [activeTab, setActiveTab] = useState("view")
  const [editedContent, setEditedContent] = useState(file.content || "")
  const [isSaving, setIsSaving] = useState(false)
  const { isAdmin } = useRole()

  const handleSave = async () => {
    if (!onSave) return

    setIsSaving(true)
    try {
      await onSave(file, editedContent)
      setActiveTab("view")
    } catch (error) {
      console.error("Error saving file:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const getFileIcon = () => {
    const type = file.type?.toLowerCase()

    if (type === "pdf") return <FileText className="h-5 w-5" />
    if (["jpg", "jpeg", "png", "gif", "svg"].includes(type)) return <Image className="h-5 w-5" />
    if (["csv", "xlsx", "xls"].includes(type)) return <Table className="h-5 w-5" />
    if (["doc", "docx", "txt", "md"].includes(type)) return <FileText className="h-5 w-5" />
    return <File className="h-5 w-5" />
  }

  const renderFileContent = () => {
    const type = file.type?.toLowerCase()
    const content = activeTab === "edit" ? editedContent : file.content

    // Image files
    if (["jpg", "jpeg", "png", "gif", "svg"].includes(type)) {
      return (
        <div className="flex justify-center p-4 bg-gray-50 rounded-md">
          <img
            src={content || `/placeholder.svg?height=300&width=400`}
            alt={file.name}
            className="max-h-[500px] object-contain"
          />
        </div>
      )
    }

    // CSV/Excel files
    if (["csv", "xlsx", "xls"].includes(type)) {
      return (
        <div className="overflow-auto max-h-[500px]">
          <div className="p-4 font-mono text-sm whitespace-pre overflow-x-auto bg-gray-50 rounded-md">
            {content || "Preview not available for this file type."}
          </div>
        </div>
      )
    }

    // PDF files
    if (type === "pdf") {
      return (
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-md">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">{file.name}</p>
          <p className="text-sm text-muted-foreground mb-4">PDF Document</p>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>
      )
    }

    // Text files
    return (
      <div className="overflow-auto max-h-[500px]">
        <div className="p-4 font-mono text-sm whitespace-pre-wrap bg-gray-50 rounded-md">
          {content || "No content available for this file."}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getFileIcon()}
            {file.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="view"
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="view">View</TabsTrigger>
              {isAdmin && <TabsTrigger value="edit">Edit</TabsTrigger>}
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            {activeTab === "edit" && (
              <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-1">
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </div>

          <TabsContent value="view" className="flex-1 overflow-auto mt-4">
            {renderFileContent()}
          </TabsContent>

          <TabsContent value="edit" className="flex-1 overflow-auto mt-4">
            {isAdmin && (
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
                placeholder="Edit file content here..."
              />
            )}
          </TabsContent>

          <TabsContent value="details" className="mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">File Name:</div>
                <div>{file.name}</div>

                <div className="font-medium">File Type:</div>
                <div>{file.type?.toUpperCase() || "Unknown"}</div>

                <div className="font-medium">Size:</div>
                <div>{file.size || "Unknown"}</div>

                <div className="font-medium">Uploaded By:</div>
                <div>{file.uploadedBy || "Unknown"}</div>

                <div className="font-medium">Upload Date:</div>
                <div>{file.date || "Unknown"}</div>
              </div>

              <div className="pt-2 border-t">
                <div className="font-medium mb-1">Description:</div>
                <div className="text-sm">{file.description || "No description provided."}</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
