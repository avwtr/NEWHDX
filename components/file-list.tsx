"use client"

import { useState, useEffect } from "react"
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
  Trash2,
} from "lucide-react"
import { FileViewer } from "./file-viewer"
import { FileUploadDialog } from "./file-upload-dialog"
import { useRole } from "@/contexts/role-context"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  files: any[]; // experiment_files rows
  experimentId: string;
  onViewFile: (file: any) => void;
}

export function FileList({ files, experimentId, onViewFile }: FileListProps) {
  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [fileViewerOpen, setFileViewerOpen] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const { isAdmin } = useRole()
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [fileList, setFileList] = useState(files);

  useEffect(() => {
    setFileList(files);
  }, [files]);

  const getFileIcon = (type: string | undefined, fileName?: string) => {
    if (!type && fileName) {
      const ext = fileName.split('.').pop();
      type = ext ? ext.toLowerCase() : '';
    }
    type = (type || '').toLowerCase();
    if (type === "pdf") return <FileTextIconLucide className="h-5 w-5" />
    if (["jpg", "jpeg", "png", "gif", "svg"].includes(type)) return <ImageIcon className="h-5 w-5" />
    if (["csv", "xlsx", "xls"].includes(type)) return <TableIcon className="h-5 w-5" />
    if (["doc", "docx", "txt", "md"].includes(type)) return <FileTextIconLucide className="h-5 w-5" />
    return <FileIcon className="h-5 w-5" />
  }

  const handleDownload = async (file: any) => {
    try {
      const { data, error } = await supabase.storage.from("experiment-files").download(file.storageKey);
      if (error || !data) throw new Error("Failed to download file");
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.file || file.name || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
      toast({ title: "File Downloaded", description: `${file.file || file.name} has been downloaded.` });
    } catch (err: any) {
      toast({ title: "Error", description: `Failed to download file: ${err.message}`, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!selectedFile) return;
    try {
      if (selectedFile.storageKey) {
        await supabase.storage.from("experiment-files").remove([selectedFile.storageKey]);
      }
      await supabase.from("experiment_files").delete().eq("id", selectedFile.id);
      setShowDeleteDialog(false);
      setFileList((prev) => prev.filter((f) => f.id !== selectedFile.id));
      toast({ title: "File Deleted", description: `${selectedFile.file || selectedFile.name} has been deleted.` });
      // Optionally: refresh file list here
    } catch (err: any) {
      toast({ title: "Error", description: `Failed to delete file: ${err.message}`, variant: "destructive" });
    }
  };

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
        {fileList.length > 0 ? (
          fileList.map((file) => (
            <div key={file.id} className="p-4 flex items-center justify-between hover:bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                  {getFileIcon(undefined, file.file)}
                </div>
                <div>
                  <h4 className="text-sm font-medium">{file.file}</h4>
                  <p className="text-xs text-muted-foreground">
                    {file.file_size ? `${(parseInt(file.file_size) / 1024).toFixed(1)} KB` : ""} • Uploaded {file.created_at ? new Date(file.created_at).toLocaleDateString() : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1" onClick={() => onViewFile(file)}>
                  <Eye className="h-3.5 w-3.5" />
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  onClick={() => handleDownload(file)}
                  title="Download"
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-red-500"
                    onClick={() => { setSelectedFile(file); setShowDeleteDialog(true); }}
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <FileIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-1">No Files Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {"No files have been uploaded for this experiment yet."}
            </p>
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this file?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete <span className="font-bold">{selectedFile?.file || selectedFile?.name}</span> from the experiment files.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 text-white hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
