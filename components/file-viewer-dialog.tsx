"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DocumentEditor } from "@/components/editors/document-editor"
import { CodeEditor } from "@/components/editors/code-editor"
import { TabularDataEditor } from "@/components/editors/tabular-data-editor"
import { Download, Save, Trash2, Edit2, X } from "lucide-react"
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
import { supabase } from "@/lib/supabaseClient"
import { firebaseStorage } from "@/lib/firebaseClient"
import { getDownloadURL, ref as firebaseRef, uploadBytes, deleteObject } from "firebase/storage"

interface FileViewerDialogProps {
  file: {
    id: string
    name: string
    type: string
    size: string
    author: string
    date: string
    content?: string
    url?: string
    storageKey?: string
    path?: string
  }
  isOpen: boolean
  onClose: () => void
  userRole?: string
  onDelete?: (fileId: string) => void
  onSave?: (fileId: string, content: any) => void
}

export function FileViewerDialog({
  file,
  isOpen,
  onClose,
  userRole = "guest",
  onDelete,
  onSave,
}: FileViewerDialogProps) {
  const isAdmin = userRole === "admin"
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // State for different content types
  const [documentContent, setDocumentContent] = useState("")
  const [documentFormat, setDocumentFormat] = useState("markdown")
  const [codeContent, setCodeContent] = useState("")
  const [codeLanguage, setCodeLanguage] = useState("python")
  const [tabularData, setTabularData] = useState<{ columns: string[]; rows: string[][] }>({
    columns: ["Column 1", "Column 2", "Column 3"],
    rows: [
      ["", "", ""],
      ["", "", ""],
    ],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")

  // Reset editing state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsEditing(false)
    }
  }, [isOpen, file])

  // Fetch file content if not present
  useEffect(() => {
    let ignore = false;
    async function fetchContent() {
      setLoading(true);
      setError(null);
      try {
        let url = null;
        const type = file.type?.toLowerCase();
       
        if (file.url) {
          url = file.url;
          if (["jpg","jpeg","png","gif","svg","pdf"].includes(type)) {
            setPreviewUrl(url);
            setLoading(false);
            return;
          } else {
            // Fetch text content from url
            const resp = await fetch(url);
            const text = await resp.text();
            if (["md", "txt"].includes(type)) setDocumentContent(text);
            else if (["py", "js", "ts", "r"].includes(type)) setCodeContent(text);
            else if (["csv", "xlsx", "json"].includes(type)) setTabularData({ columns: ["Data"], rows: text.split("\n").map(row => [row]) });
          }
        } else if (file.storageKey) {
          // Firebase Storage
          url = await getDownloadURL(firebaseRef(firebaseStorage, file.storageKey));
          if (["jpg","jpeg","png","gif","svg","pdf"].includes(type)) {
            setPreviewUrl(url);
            setLoading(false);
            return;
          } else {
            const resp = await fetch(url);
            const text = await resp.text();
            if (["md", "txt"].includes(type)) setDocumentContent(text);
            else if (["py", "js", "ts", "r"].includes(type)) setCodeContent(text);
            else if (["csv", "xlsx", "json"].includes(type)) setTabularData({ columns: ["Data"], rows: text.split("\n").map(row => [row]) });
          }
        } else if (file.path) {
          // Supabase Storage
          const { data, error } = await supabase.storage.from("labmaterials").download(file.path);
          if (error) throw error;
          if (["jpg","jpeg","png","gif","svg","pdf"].includes(type)) {
            const blobUrl = URL.createObjectURL(data);
            setPreviewUrl(blobUrl);
            setLoading(false);
            return;
          } else {
            const text = await data.text();
            if (["md", "txt"].includes(type)) setDocumentContent(text);
            else if (["py", "js", "ts", "r"].includes(type)) setCodeContent(text);
            else if (["csv", "xlsx", "json"].includes(type)) setTabularData({ columns: ["Data"], rows: text.split("\n").map(row => [row]) });
          }
        }
      } catch (err: any) {
        if (!ignore) setError("Failed to load file preview.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    if (isOpen) fetchContent();
    return () => { ignore = true; };
  }, [file, isOpen]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const fileType = file.type.toLowerCase();
      let content;
      let blob;

      // Prepare content based on file type
      if (fileType === "md" || fileType === "txt") {
        content = documentContent;
        blob = new Blob([content], { type: 'text/plain' });
      } else if (["py", "js", "ts", "r"].includes(fileType)) {
        content = codeContent;
        blob = new Blob([content], { type: 'text/plain' });
      } else if (["csv", "xlsx", "json"].includes(fileType)) {
        content = JSON.stringify(tabularData);
        blob = new Blob([content], { type: 'application/json' });
      }

      if (!content || !blob) {
        throw new Error("No content to save");
      }

      // Save to appropriate storage
      if (file.storageKey) {
        // Firebase Storage
        const fileRef = firebaseRef(firebaseStorage, file.storageKey);
        await uploadBytes(fileRef, blob);
        const url = await getDownloadURL(fileRef);
        // Update Supabase record with new URL
        await supabase
          .from("files")
          .update({ url })
          .eq("id", file.id);
      } else if (file.path) {
        // Supabase Storage
        await supabase.storage
          .from("labmaterials")
          .upload(file.path, blob, { upsert: true });
      }

      // Call the onSave callback
      if (onSave) {
        onSave(file.id, content);
      }

      toast({
        title: "File Saved",
        description: `${file.name} has been saved successfully.`,
      });

      setIsEditing(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Failed to save file: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      // Delete from storage
      if (file.storageKey) {
        // Firebase Storage
        const fileRef = firebaseRef(firebaseStorage, file.storageKey);
        await deleteObject(fileRef);
      } else if (file.path) {
        // Supabase Storage
        await supabase.storage
          .from("labmaterials")
          .remove([file.path]);
      }

      // Delete from database
      await supabase
        .from("files")
        .delete()
        .eq("id", file.id);

      // Call the onDelete callback
      if (onDelete) {
        onDelete(file.id);
      }

      setIsDeleteDialogOpen(false);
      onClose();

      toast({
        title: "File Deleted",
        description: `${file.name} has been deleted.`,
        variant: "destructive",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Failed to delete file: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      let url;
      if (file.url) {
        url = file.url;
      } else if (file.storageKey) {
        // Firebase Storage
        url = await getDownloadURL(firebaseRef(firebaseStorage, file.storageKey));
      } else if (file.path) {
        // Supabase Storage
        const { data } = await supabase.storage
          .from("labmaterials")
          .download(file.path);
        if (!data) throw new Error("Failed to download file");
        url = URL.createObjectURL(data);
      }

      if (!url) throw new Error("No download URL available");

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up object URL if created
      if (file.path && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }

      toast({
        title: "File Downloaded",
        description: `${file.name} has been downloaded.`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Failed to download file: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderFileViewer = () => {
    const fileType = file.type.toLowerCase()
    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading preview...</div>;
    if (error) return <div className="p-8 text-center text-destructive">{error}</div>;
    // Document files
    if (fileType === "md" || fileType === "txt") {
      return (
        <div className="max-h-[60vh] overflow-auto">
          <DocumentEditor
            content={documentContent}
            format={documentFormat}
            onContentChange={setDocumentContent}
            onFormatChange={setDocumentFormat}
            readOnly={!isEditing}
          />
        </div>
      )
    }
    // Code files
    else if (["py", "js", "ts", "r"].includes(fileType)) {
      return (
        <div className="max-h-[60vh] overflow-auto">
          <CodeEditor
            content={codeContent}
            language={codeLanguage}
            onContentChange={setCodeContent}
            onLanguageChange={setCodeLanguage}
            readOnly={!isEditing}
          />
        </div>
      )
    }
    // Tabular data files
    else if (["csv", "xlsx", "json"].includes(fileType)) {
      return (
        <div className="max-h-[60vh] overflow-auto">
          <TabularDataEditor data={tabularData} onChange={setTabularData} readOnly={!isEditing} />
        </div>
      )
    }
    // Images and PDFs
    else if (["jpg", "jpeg", "png", "gif", "svg"].includes(fileType)) {
      return (
        <div className="flex justify-center p-4 bg-gray-50 rounded-md">
          <img src={previewUrl || "/placeholder.svg?height=300&width=400"} alt={file.name} className="max-h-[500px] object-contain" />
        </div>
      )
    } else if (fileType === "pdf") {
      return (
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-md">
          <iframe src={previewUrl || undefined} title="PDF Preview" className="w-full max-w-2xl h-[500px] rounded-md border" />
          <p className="text-lg font-medium mb-2">{file.name}</p>
          <p className="text-sm text-muted-foreground mb-4">PDF Document</p>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <a href={previewUrl || "#"} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4" /> Download PDF</a>
          </Button>
        </div>
      )
    }
    // Other file types
    else {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-secondary/50 p-8 rounded-lg mb-4">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-bold mb-2">{file.name}</h3>
            <p className="text-muted-foreground mb-4">
              {file.size} • Added by {file.author}, {file.date}
            </p>
          </div>
          <p className="text-muted-foreground mb-6">
            This file type cannot be previewed. Please download the file to view its contents.
          </p>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download File
          </Button>
        </div>
      )
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">{file.name}</DialogTitle>
              <div className="flex items-center gap-2">
                {isAdmin && isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                )}
                {isAdmin && !isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-1" /> Edit
                  </Button>
                )}
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-100"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {file.size} • Added by {file.author}, {file.date}
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">{renderFileViewer()}</div>

          <DialogFooter className="mt-4">
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>

              {isAdmin && isEditing && (
                <Button onClick={handleSave} className="bg-accent text-primary-foreground hover:bg-accent/90">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this file?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete <span className="font-bold">{file.name}</span>{" "}
              from the lab materials.
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
    </>
  )
}
