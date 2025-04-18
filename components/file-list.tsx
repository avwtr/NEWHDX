"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  FileIcon,
  ImageIcon,
  FileTextIcon as FileTextIconLucide,
  TableIcon,
  Eye,
  Pencil,
  Download,
  Upload,
} from "lucide-react"
import { FileViewer } from "./file-viewer"
import { FileUploadDialog } from "./file-upload-dialog"
import { useRole } from "@/contexts/role-context"

interface File {
  id: string
  name: string
  type: string
  size: string
  uploadedBy: string
  date: string
  description?: string
  content?: string
}

interface FileListProps {
  files: File[]
  experimentId: string
  onAddFile?: (file: any) => void
  onUpdateFile?: (file: any, content: string) => void
}

export function FileList({ files, experimentId, onAddFile, onUpdateFile }: FileListProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileViewerOpen, setFileViewerOpen] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const { isAdmin } = useRole()
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  const getFileIcon = (type: string) => {
    type = type.toLowerCase()

    if (type === "pdf") return <FileTextIconLucide className="h-5 w-5" />
    if (["jpg", "jpeg", "png", "gif", "svg"].includes(type)) return <ImageIcon className="h-5 w-5" />
    if (["csv", "xlsx", "xls"].includes(type)) return <TableIcon className="h-5 w-5" />
    if (["doc", "docx", "txt", "md"].includes(type)) return <FileTextIconLucide className="h-5 w-5" />
    return <FileIcon className="h-5 w-5" />
  }

  const handleViewFile = (file: File) => {
    setSelectedFile(file)
    setViewDialogOpen(true)
  }

  const handleSaveFile = async (file: File, content: string) => {
    if (onUpdateFile) {
      await onUpdateFile(file, content)
    }
  }

  const handleAddFile = (file: any) => {
    if (onAddFile) {
      onAddFile({
        id: `file-${Date.now()}`,
        ...file,
      })
    }
  }

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => setUploadDialogOpen(true)}>
            <Upload className="h-4 w-4" />
            Upload New File
          </Button>
        </div>
      )}

      <div className="border rounded-md divide-y">
        {files.length > 0 ? (
          files.map((file) => (
            <div key={file.id} className="p-4 flex items-center justify-between hover:bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                  {getFileIcon(file.type)}
                </div>
                <div>
                  <h4 className="text-sm font-medium">{file.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {file.size} • Uploaded {file.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => handleViewFile(file)}>
                    <Pencil className="h-3.5 w-3.5" />
                    View & Edit
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => handleViewFile(file)}>
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </Button>
                )}

                <Button variant="ghost" size="sm" className="gap-1">
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <FileIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-1">No Files Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {isAdmin
                ? "Upload files to share with experiment participants."
                : "No files have been uploaded for this experiment yet."}
            </p>
            {isAdmin && (
              <Button variant="outline" onClick={() => setUploadDialogOpen(true)} className="gap-1">
                <Upload className="h-4 w-4" />
                Upload First File
              </Button>
            )}
          </div>
        )}
      </div>

      {selectedFile && (
        <FileViewer
          open={fileViewerOpen}
          onOpenChange={setFileViewerOpen}
          file={selectedFile}
          onSave={isAdmin ? handleSaveFile : undefined}
        />
      )}

      <FileUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        experimentId={experimentId}
        onFileUpload={handleAddFile}
      />

      {/* File View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{selectedFile?.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedFile?.content ? (
              <div className="max-h-[500px] overflow-auto border rounded-md p-4 bg-muted/20">
                {selectedFile.type === "csv" ? (
                  <table className="min-w-full divide-y divide-gray-300">
                    <tbody>
                      {selectedFile.content.split("\n").map((row, i) => (
                        <tr key={i} className={i === 0 ? "bg-muted font-medium" : ""}>
                          {row.split(",").map((cell, j) => (
                            <td key={j} className="px-3 py-2 border-r last:border-r-0">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="prose max-w-none">
                    {selectedFile.content.split("\n").map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] bg-muted/20 rounded-md">
                {selectedFile?.type === "png" || selectedFile?.type === "jpg" || selectedFile?.type === "jpeg" ? (
                  <div className="text-center">
                    <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Image preview not available</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Content not available for preview</p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
