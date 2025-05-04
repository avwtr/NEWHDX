"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Image, Table, File, Save, Download } from "lucide-react"
import { useRole } from "@/contexts/role-context"
import { supabase } from "@/lib/supabaseClient"
import { firebaseStorage } from "@/lib/firebaseClient"
import { getDownloadURL, ref as firebaseRef, uploadBytes } from "firebase/storage"
import { toast } from "@/components/ui/use-toast"

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
    url?: string
    storageKey?: string
    path?: string
    id?: string
  }
  onSave?: (file: any, content: string) => void
}

export function FileViewer({ open, onOpenChange, file, onSave }: FileViewerProps) {
  const [activeTab, setActiveTab] = useState("view")
  const [editedContent, setEditedContent] = useState(file.content || "")
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined)
  const { isAdmin } = useRole()

  // Fetch file content if not present
  useEffect(() => {
    let ignore = false;
    async function fetchContent() {
      if (file.content) return;
      setLoading(true);
      setError(null);
      try {
        let content = "";
        let url = null;
        const type = file.type?.toLowerCase();
        // If file.url exists, use it (Firebase or Supabase public URL)
        if (file.url) {
          url = file.url;
          if (["jpg","jpeg","png","gif","svg","pdf"].includes(type)) {
            setPreviewUrl(url);
            setLoading(false);
            return;
          } else {
            // Fetch text content from url
            const resp = await fetch(url);
            content = await resp.text();
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
            content = await resp.text();
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
            content = await data.text();
          }
        }
        if (!ignore) {
          setEditedContent(content);
        }
      } catch (err: any) {
        if (!ignore) setError("Failed to load file preview.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchContent();
    return () => { ignore = true; };
  }, [file]);

  const handleSave = async () => {
    if (!onSave) return;

    setIsSaving(true);
    try {
      let blob;
      const type = file.type?.toLowerCase();

      // Create appropriate blob based on file type
      if (["md", "txt", "py", "js", "ts", "r"].includes(type)) {
        blob = new Blob([editedContent], { type: 'text/plain' });
      } else if (["csv", "xlsx", "json"].includes(type)) {
        blob = new Blob([editedContent], { type: 'application/json' });
      }

      if (!blob) {
        throw new Error("Unsupported file type for editing");
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

      await onSave(file, editedContent);
      setActiveTab("view");
    } catch (error: any) {
      console.error("Error saving file:", error);
      toast({
        title: "Error",
        description: `Failed to save file: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getFileIcon = () => {
    const type = file.type?.toLowerCase()

    if (type === "pdf") return <FileText className="h-5 w-5" />
    if (["jpg", "jpeg", "png", "gif", "svg"].includes(type)) return <Image className="h-5 w-5" />
    if (["csv", "xlsx", "xls"].includes(type)) return <Table className="h-5 w-5" />
    if (["doc", "docx", "txt", "md"].includes(type)) return <FileText className="h-5 w-5" />
    return <File className="h-5 w-5" />
  }

  const renderFileContent = () => {
    const type = file.type?.toLowerCase();
    const content = activeTab === "edit" ? editedContent : (file.content || editedContent);
    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading preview...</div>;
    if (error) return <div className="p-8 text-center text-destructive">{error}</div>;
    // Image files
    if (["jpg", "jpeg", "png", "gif", "svg"].includes(type)) {
      return (
        <div className="flex justify-center p-4 bg-gray-50 rounded-md">
          <img src={previewUrl || content || `/placeholder.svg?height=300&width=400`} alt={file.name} className="max-h-[500px] object-contain" />
        </div>
      );
    }
    // PDF files
    if (type === "pdf") {
      return (
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-md">
          <iframe src={previewUrl} title="PDF Preview" className="w-full max-w-2xl h-[500px] rounded-md border" />
          <p className="text-lg font-medium mb-2">{file.name}</p>
          <p className="text-sm text-muted-foreground mb-4">PDF Document</p>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <a href={previewUrl || "#"} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4" /> Download PDF</a>
          </Button>
        </div>
      );
    }
    // CSV/Excel files
    if (["csv", "xlsx", "xls"].includes(type)) {
      return (
        <div className="overflow-auto max-h-[500px]">
          <div className="p-4 font-mono text-sm whitespace-pre overflow-x-auto bg-gray-50 rounded-md">
            {content || "Preview not available for this file type."}
          </div>
        </div>
      );
    }
    // Text files
    return (
      <div className="overflow-auto max-h-[500px]">
        <div className="p-4 font-mono text-sm whitespace-pre-wrap bg-gray-50 rounded-md">
          {content || "No content available for this file."}
        </div>
      </div>
    );
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
