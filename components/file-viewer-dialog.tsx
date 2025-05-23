"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DocumentEditor } from "@/components/editors/document-editor"
import { CodeEditor } from "@/components/editors/code-editor"
import { TabularDataEditor } from "@/components/editors/tabular-data-editor"
import { Download, Save, Trash2, Edit2, X, Maximize2, Minimize2 } from "lucide-react"
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
import Papa from "papaparse"
import { useAuth } from "@/components/auth-provider"

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
    storage_key?: string
    path?: string
    lastUpdatedBy?: string
    lastUpdated?: string
    bucket?: string
    file?: string
    file_size?: string
    added_by?: string
    created_at?: string
  }
  isOpen: boolean
  onClose: () => void
  userRole?: string
  onDelete?: (fileId: string) => void
  onSave?: (fileId: string, content: any) => void
  labId: string
}

// Helper to determine if a file is stored in Firebase (over 50MB)
function isFirebaseFile(file: any) {
  if (file.fileSize && typeof file.fileSize === 'string' && file.fileSize.includes('MB')) {
    return parseFloat(file.fileSize) > 50;
  }
  return false;
}

// Robust CSV parser using PapaParse
function parseCSV(text: string): { columns: string[]; rows: string[][] } {
  const result = Papa.parse<string[]>(text, { skipEmptyLines: true });
  const data = result.data as string[][];
  if (!data.length) return { columns: [], rows: [] };
  const [columns, ...rows] = data;
  return { columns, rows };
}

// Utility function to robustly download a file from Supabase or Firebase
export async function downloadFile(file: any) {
  let url;
  if (file.url) {
    url = file.url;
  } else if (file.storageKey && file.fileSize && typeof file.fileSize === 'string' && file.fileSize.includes('MB') && parseFloat(file.fileSize) > 50) {
    // Firebase for large files
    url = await getDownloadURL(firebaseRef(firebaseStorage, file.storageKey));
  } else if (file.storageKey || file.path) {
    // Supabase Storage
    const path = file.storageKey || file.path;
    const bucket = file.bucket || 'labmaterials';
    const { data } = await supabase.storage.from(bucket).download(path);
    if (!data) throw new Error("Failed to download file");
    url = URL.createObjectURL(data);
  }
  if (!url) throw new Error("No download URL available");
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name || file.filename || 'download';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Clean up object URL if created
  if ((file.storageKey || file.path) && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

// Utility to format file sizes
function formatFileSize(size: string | number): string {
  let bytes = 0;
  if (typeof size === 'number') {
    bytes = size;
  } else if (typeof size === 'string') {
    // Try to parse from '123.4 KB', '0.1 MB', etc.
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

// Optionally, fetch username for lastUpdatedBy
async function fetchUsername(userId: string): Promise<string> {
  if (!userId) return '';
  const { data, error } = await supabase.from('profiles').select('username').eq('user_id', userId).single();
  return data?.username || userId;
}

// Helper to determine if file is editable
function isEditableFileType(fileType: string | undefined) {
  if (!fileType) return false;
  const t = fileType.toLowerCase();
  return ["md", "txt", "py", "js", "ts", "r", "csv", "xlsx", "json"].includes(t);
}

export function FileViewerDialog({
  file,
  isOpen,
  onClose,
  userRole = "guest",
  onDelete,
  onSave,
  labId,
}: FileViewerDialogProps) {
  const isAdmin = userRole === "admin"
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [content, setContent] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Editor states for editing
  const [documentContent, setDocumentContent] = useState("");
  const [documentFormat, setDocumentFormat] = useState("markdown");
  const [codeContent, setCodeContent] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("python");
  const [tabularData, setTabularData] = useState<{ columns: string[]; rows: string[][] }>({ columns: [], rows: [] });

  const [lastUpdatedByName, setLastUpdatedByName] = useState<string>("");
  const { user } = useAuth();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file.lastUpdatedBy) {
      fetchUsername(file.lastUpdatedBy).then(setLastUpdatedByName);
    } else {
      setLastUpdatedByName("");
    }
  }, [file.lastUpdatedBy]);

  // Utility to get bucket and path for experiment_files
  const getBucketAndPath = () => {
    if (file.storageKey && file.file) {
      return { bucket: "experiment-files", path: file.storageKey };
    }
    // fallback for lab materials
    return { bucket: file.bucket || "labmaterials", path: file.storageKey || file.path };
  };

  // Fetch file content (refactored so it can be called after save)
  const fetchFileContent = async () => {
    setLoading(true);
    setError(null);
    try {
      let content = null;
      const fileType = (
        file.type ||
        (file as any).fileType ||
        (file.file && file.file.split('.').pop()) ||
        (file.name && file.name.split('.').pop()) ||
        ((file as any).filename && (file as any).filename.split('.').pop()) ||
        ""
      ).toLowerCase();
      const { bucket = 'labmaterials', path = '' } = getBucketAndPath();
      if (isFirebaseFile(file)) {
        // Firebase logic (not used for experiment files)
        throw new Error('Firebase storage not supported for experiment files');
      } else {
        // Supabase Storage
        if (!path) throw new Error('No path for Supabase file');
        const { data, error } = await supabase.storage.from(bucket).download(path + `?t=${Date.now()}`);
        if (error || !data) throw new Error('Failed to download file from Supabase');
        content = await data.text();
      }
      if (!content) throw new Error('No file content available');

      // Parse content based on file type
      if (["csv", "xlsx", "json"].includes(fileType)) {
        try {
          const jsonData = JSON.parse(content);
          setContent(JSON.stringify(jsonData, null, 2));
        } catch {
          const rows = content.split("\n").map(row => row.split(","));
          const formattedContent = rows.map(row => row.join("\t")).join("\n");
          setContent(formattedContent);
        }
      } else {
        setContent(content);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load file content');
    } finally {
      setLoading(false);
    }
  };

  // On dialog open, fetch file content
  useEffect(() => {
    if (isOpen) {
      setIsEditing(false);
      fetchFileContent();
    }
  }, [isOpen, file]);

  // When file or isEditing changes, initialize editor state
  useEffect(() => {
    if (!isEditing) return;
    const fileType = file.type.toLowerCase();
    if (["md", "txt"].includes(fileType)) {
      setDocumentContent(content);
      setDocumentFormat(fileType === "md" ? "markdown" : "plaintext");
    } else if (["py", "js", "ts", "r"].includes(fileType)) {
      setCodeContent(content);
      setCodeLanguage(
        fileType === "py" ? "python" :
        fileType === "js" ? "javascript" :
        fileType === "ts" ? "javascript" :
        fileType === "r" ? "r" : "plaintext"
      );
    } else if (["csv", "xlsx", "json"].includes(fileType)) {
      if (fileType === "csv") {
        setTabularData(parseCSV(content));
      } else {
        // For JSON/XLSX: try to parse as {columns, rows}
        try {
          const json = JSON.parse(content);
          if (json && Array.isArray(json.columns) && Array.isArray(json.rows)) {
            setTabularData(json);
          } else if (Array.isArray(json)) {
            // If it's an array of objects, convert to columns/rows
            const columns = Object.keys(json[0] || {});
            const rows = json.map((row: any) => columns.map(col => row[col] ?? ""));
            setTabularData({ columns, rows });
          } else {
            setTabularData({ columns: [], rows: [] });
          }
        } catch {
          setTabularData({ columns: [], rows: [] });
        }
      }
    }
  }, [isEditing, content, file.type]);

  // Generate preview URL for images and PDFs
  useEffect(() => {
    async function getPreviewUrl() {
      setPreviewUrl(null);
      const fileType = (
        file.type ||
        (file as any).fileType ||
        (file.file && file.file.split('.').pop()) ||
        (file.name && file.name.split('.').pop()) ||
        ((file as any).filename && (file as any).filename.split('.').pop()) ||
        ""
      ).toLowerCase();
      const { bucket = 'labmaterials', path = '' } = getBucketAndPath();
      if (["jpg", "jpeg", "png", "gif", "svg", "pdf"].includes(fileType)) {
        if (file.url) {
          setPreviewUrl(file.url);
        } else {
          const safePath = typeof path === 'string' ? path : '';
          const safeBucket = typeof bucket === 'string' ? bucket : 'labmaterials';
          if (safePath.length > 0) {
            const { data } = supabase.storage.from(safeBucket).getPublicUrl(safePath);
            if (data?.publicUrl) {
              setPreviewUrl(data.publicUrl);
            } else {
              setPreviewUrl(null);
            }
          } else {
            setPreviewUrl(null);
          }
        }
      } else {
        setPreviewUrl(null);
      }
    }
    if (isOpen) getPreviewUrl();
  }, [file, isOpen]);

  const handleSave = async () => {
    if (!onSave) return;
    setLoading(true);
    try {
      const fileType = file.type.toLowerCase();
      let saveContent = content;
      if (["md", "txt"].includes(fileType)) {
        saveContent = documentContent;
      } else if (["py", "js", "ts", "r"].includes(fileType)) {
        saveContent = codeContent;
      } else if (["csv"].includes(fileType)) {
        // Convert tabularData to CSV string
        const csvRows = [tabularData.columns, ...tabularData.rows].map(row => row.map(cell => `${cell}`.replace(/"/g, '""')).join(",")).join("\n");
        saveContent = csvRows;
      } else if (["json", "xlsx"].includes(fileType)) {
        // Save as JSON string
        saveContent = JSON.stringify(tabularData);
      }

      // Save to storage
      if (isFirebaseFile(file)) {
        // Firebase Storage
        if (!file.storageKey) throw new Error('No storageKey for Firebase file');
        const fileRef = firebaseRef(firebaseStorage, file.storageKey);
        const blob = new Blob([saveContent], { type: 'text/plain' });
        await uploadBytes(fileRef, blob);
        const url = await getDownloadURL(fileRef);
        // Update Supabase record with new URL
        await supabase.from("files").update({ url }).eq("id", file.id);
      } else {
        // Supabase Storage
        const path = file.storageKey || file.path;
        if (!path) throw new Error('No path for Supabase file');
        const blob = new Blob([saveContent], { type: 'text/plain' });
        await supabase.storage.from("labmaterials").upload(path, blob, { upsert: true });
      }

      // Update DB content (if you want to keep a content field in DB)
      await onSave(file.id, saveContent);
      // Log activity after successful save
      await supabase.from("activity").insert([
        {
          activity_id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
          activity_name: `File Edited: ${file.name}`,
          activity_type: "fileedit",
          performed_by: user?.id || null,
          lab_from: labId
        }
      ]);
      setIsEditing(false);
      toast({
        title: "File Saved",
        description: `${file.name} has been saved successfully.`,
      });
      // After saving, re-fetch the file content from storage to ensure UI is in sync
      await fetchFileContent();
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
      // Remove from storage
      if (file.storageKey) {
        await supabase.storage.from("experiment-files").remove([file.storageKey]);
      }
      // Remove from DB
      await supabase.from("experiment_files").delete().eq("id", file.id);
      setIsDeleteDialogOpen(false);
      onClose();
      toast({
        title: "File Deleted",
        description: `${file.file || file.name} has been deleted.`,
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
      const { bucket = 'labmaterials', path = '' } = getBucketAndPath();
      const { data, error } = await supabase.storage.from(bucket).download(path);
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
      toast({
        title: "File Downloaded",
        description: `${file.file || file.name} has been downloaded.`,
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

  const renderContent = () => {
    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
    if (error) return <div className="p-8 text-center text-destructive">{error}</div>;

    const fileType = (
      file.type ||
      (file as any).fileType ||
      (file.file && file.file.split('.').pop()) ||
      (file.name && file.name.split('.').pop()) ||
      ((file as any).filename && (file as any).filename.split('.').pop()) ||
      ""
    ).toLowerCase();

    // For images and PDFs, show preview in overlay
    if (["jpg", "jpeg", "png", "gif", "svg"].includes(fileType)) {
      return (
        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-md">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={file.name}
              className="max-h-[500px] object-contain"
              style={{ maxWidth: "100%", borderRadius: 8 }}
            />
          ) : (
            <div className="text-muted-foreground">
              Image preview not available.<br />
              {file.storageKey && (
                <>
                  <span className="text-xs">Try this link: </span>
                  <a href={`https://YOUR_PROJECT_ID.supabase.co/storage/v1/object/public/labmaterials/${file.storageKey}`} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">Open in new tab</a>
                </>
              )}
            </div>
          )}
        </div>
      );
    }

    if (fileType === "pdf") {
      return (
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-md">
          {previewUrl ? (
            <iframe
              src={previewUrl}
              title="PDF Preview"
              className="w-full max-w-2xl h-[500px] rounded-md border"
            />
          ) : (
            <div className="text-muted-foreground">
              PDF preview not available.<br />
              {file.storageKey && (
                <>
                  <span className="text-xs">Try this link: </span>
                  <a href={`https://YOUR_PROJECT_ID.supabase.co/storage/v1/object/public/labmaterials/${file.storageKey}`} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">Open in new tab</a>
                </>
              )}
            </div>
          )}
        </div>
      );
    }

    // For all other files, show content in a pre tag
    return (
      <pre className="p-4 bg-secondary/30 rounded-md overflow-auto max-h-[60vh] whitespace-pre-wrap">
        {content}
      </pre>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={`max-w-4xl max-h-[90vh] overflow-hidden flex flex-col${isFullScreen ? ' fixed inset-0 z-50 max-w-full max-h-full bg-background' : ''}`} style={isFullScreen ? {padding: 0, borderRadius: 0} : {}}>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">{file.file || file.name}</DialogTitle>
              <div className="flex items-center gap-2">
                {isAdmin && !isEditing && isEditableFileType(
                  file.type ||
                  (file.file && file.file.split('.').pop()) ||
                  (file.name && file.name.split('.').pop()) ||
                  ''
                ) && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-1" /> Edit
                  </Button>
                )}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {`${(parseInt(String(file.file_size || 0)) / 1024).toFixed(1)} KB`} • Uploaded by {file.added_by || "Unknown"}
              {file.created_at ? `, ${new Date(file.created_at).toLocaleString()}` : ""}
            </div>
          </DialogHeader>

          <div className={`flex-1 overflow-hidden${isFullScreen ? ' p-0' : ''}`} style={isFullScreen ? {height: '100%', minHeight: 0} : {}}>
            {isEditing ? (
              (() => {
                const fileType = file.type.toLowerCase();
                if (["md", "txt"].includes(fileType)) {
                  return (
                    <div className={isFullScreen ? "h-full" : ""}>
                      <DocumentEditor
                        content={documentContent}
                        format={documentFormat}
                        onContentChange={setDocumentContent}
                        onFormatChange={setDocumentFormat}
                        readOnly={false}
                      />
                    </div>
                  );
                } else if (["py", "js", "ts", "r"].includes(fileType)) {
                  return (
                    <div className={isFullScreen ? "h-full" : ""}>
                      <CodeEditor
                        content={codeContent}
                        language={codeLanguage}
                        onContentChange={setCodeContent}
                        onLanguageChange={setCodeLanguage}
                        readOnly={false}
                      />
                    </div>
                  );
                } else if (["csv", "xlsx", "json"].includes(fileType)) {
                  return (
                    <div className={isFullScreen ? "h-full" : ""}>
                      <TabularDataEditor
                        data={tabularData}
                        onChange={setTabularData}
                        readOnly={false}
                      />
                    </div>
                  );
                } else {
                  return (
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full h-full p-4 bg-secondary/30 rounded-md resize-none"
                      style={{ minHeight: "300px" }}
                    />
                  );
                }
              })()
            ) : (
              renderContent()
            )}
          </div>

          <DialogFooter className="mt-4">
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={handleDownload} disabled={loading}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              {isAdmin && (
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
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
              This action cannot be undone. This will permanently delete <span className="font-bold">{file.file || file.name}</span> from the experiment files.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { await handleDelete(); }} className="bg-red-500 text-white hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
