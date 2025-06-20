"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileText, Code, Database, Download, Check, X, ExternalLink, MessageSquare } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileViewerDialog } from "./file-viewer-dialog"
import path from "path"
import { downloadFile } from "./file-viewer-dialog"
import { supabase } from "@/lib/supabase"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { useAuth } from '@/components/auth-provider'
dayjs.extend(relativeTime)

export type ContributionFile = {
  id: string
  name: string
  type: "code" | "data" | "document" | "other"
  url: string
  preview?: string
  bucket?: string
  storageKey?: string
  storage_key?: string
}

export type Contribution = {
  id: string
  title: string
  description: string
  contributor: {
    id: string
    name: string
    avatar: string
  }
  date: string
  status: "pending" | "approved" | "rejected"
  type?: string
  files: ContributionFile[]
  rejectReason?: string
  submittedBy?: string
  created_at?: string
}

interface ContributionDetailModalProps {
  labId: string;
  contribution: Contribution | null;
  isOpen: boolean;
  onClose: () => void;
  onReject: (id: string, reason: string) => void;
  onContributionStatusChange?: (contributionId: string, newStatus: string) => void;
}

export function ContributionDetailModal({
  labId,
  contribution,
  isOpen,
  onClose,
  onReject,
  onContributionStatusChange,
}: ContributionDetailModalProps) {
  if (!contribution) return null;
  // All hooks below this line
  const [activeTab, setActiveTab] = useState("details")
  const [rejectReason, setRejectReason] = useState("")
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [filePreview, setFilePreview] = useState<any | null>(null)
  const [filePreviewOpen, setFilePreviewOpen] = useState(false)
  const [submitterUsername, setSubmitterUsername] = useState<string | null>(null)
  const { user } = useAuth();

  useEffect(() => {
    async function fetchSubmitterUsername() {
      if (!contribution?.submittedBy) return
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", contribution.submittedBy)
        .single()
      setSubmitterUsername(data?.username || null)
    }
    fetchSubmitterUsername()
  }, [contribution?.submittedBy])

  const handleApprove = async () => {
    if (!contribution) return;
    try {
      const labId = (contribution as any).labFrom;
      if (!labId || typeof labId !== 'string' || labId.length < 8) {
        console.error('Missing or invalid labId for file insert:', labId);
        toast({
          title: 'Lab ID Error',
          description: 'Cannot approve contribution: missing or invalid lab ID. Please check the contribution data.',
          variant: 'destructive',
        });
        return;
      }
      if (!user?.id || typeof user.id !== 'string' || user.id.length < 8) {
        console.error('Missing or invalid user.id for file insert:', user?.id);
        toast({
          title: 'User ID Error',
          description: 'Cannot approve contribution: missing or invalid user ID. Please check your authentication.',
          variant: 'destructive',
        });
        return;
      }
      for (const file of contribution.files) {
        // Check for missing or undefined storage_key
        if (!(file as any).storage_key) {
          console.error('File is missing storage_key. File object:', file);
          toast({
            title: 'File Error',
            description: `A file in this contribution is missing a storage_key. See console for details.`,
            variant: 'destructive',
          });
          continue;
        }
        // Debug: Log the file path before download
        console.log("Trying to download from cont-requests:", (file as any).storage_key);
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('cont-requests')
          .download((file as any).storage_key);
        if (downloadError) {
          console.error("Download error details:", downloadError);
          console.error("Full download error object:", JSON.stringify(downloadError, null, 2));
          throw downloadError;
        }
        console.log('Downloaded file:', (file as any).storage_key);
        // Convert to arrayBuffer for upload
        const fileBuffer = await fileData.arrayBuffer();
        // Infer MIME type from file.type or filename
        function inferMimeType(filename: string): string {
          const ext = filename.split('.').pop()?.toLowerCase();
          if (!ext) return 'application/octet-stream';
          if (["png"].includes(ext)) return 'image/png';
          if (["jpg", "jpeg"].includes(ext)) return 'image/jpeg';
          if (["gif"].includes(ext)) return 'image/gif';
          if (["svg"].includes(ext)) return 'image/svg+xml';
          if (["pdf"].includes(ext)) return 'application/pdf';
          if (["csv"].includes(ext)) return 'text/csv';
          if (["md"].includes(ext)) return 'text/markdown';
          if (["txt"].includes(ext)) return 'text/plain';
          if (["json"].includes(ext)) return 'application/json';
          if (["js"].includes(ext)) return 'application/javascript';
          if (["py"].includes(ext)) return 'text/x-python';
          return 'application/octet-stream';
        }
        const mimeType = file.type || inferMimeType(file.name);
        const blob = new Blob([fileBuffer], { type: mimeType });
        // Upload to labmaterials (no root subfolder)
        const newStorageKey = `${labId}/${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('labmaterials')
          .upload(newStorageKey, blob, { upsert: true, contentType: mimeType });
        if (uploadError) throw uploadError;
        console.log('Uploaded file to:', newStorageKey);
        // Infer frontend type from extension
        function inferFrontendType(filename: string): string {
          const ext = filename.split('.').pop()?.toLowerCase();
          if (!ext) return "other";
          if (["png", "jpg", "jpeg", "gif", "bmp", "svg", "webp"].includes(ext)) return "image";
          if (["pdf", "doc", "docx", "txt", "rtf", "odt"].includes(ext)) return "document";
          if (["csv", "tsv", "xls", "xlsx", "json"].includes(ext)) return "data";
          if (["py", "js", "ts", "java", "cpp", "c", "ipynb", "r"].includes(ext)) return "code";
          return "other";
        }
        // Insert into files table
        const { error: insertError } = await supabase.from('files').insert({
          filename: file.name,
          fileType: file.type, // MIME type from upload (may be empty for some browsers, but best effort)
          fileTag: inferFrontendType(file.name), // frontend type (was 'type', now 'fileTag')
          fileSize: (file as any).size,
          labID: labId,
          initiallycreatedBy: user.id,
          lastUpdatedBy: user.id,
          lastUpdated: new Date().toISOString(),
          folder: 'root',
          storageKey: newStorageKey,
        });
        if (insertError) throw insertError;
        console.log('Inserted file record for:', file.name);
        // Delete from cont-requests
        const { error: deleteError } = await supabase.storage
          .from('cont-requests')
          .remove([(file as any).storage_key]);
        if (deleteError) throw deleteError;
        console.log('Deleted from cont-requests:', (file as any).storage_key);
      }
      // Update contribution request
      const fileSummaries = contribution.files.map(f => ({
        name: f.name,
        type: f.type,
        size: (f as any).size || '',
      }));
      const updatePayload = {
        status: 'accepted',
        reviewed_by: user.id,
        files: fileSummaries,
      };
      const { error: updateError } = await supabase
        .from('contribution_requests')
        .update(updatePayload)
        .eq('id', Number(contribution.id));
      if (updateError) throw updateError;

      // Notify parent component of status change
      if (onContributionStatusChange) {
        onContributionStatusChange(contribution.id, 'accepted');
      }

      toast({
        title: 'Contribution Approved',
        description: `You have approved "${contribution.title}" and files have been moved to lab materials.`,
      });
      onClose();
    } catch (error) {
      console.error('[MODAL APPROVE] Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve contribution',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async () => {
    if (!contribution) return;
    try {
      for (const file of contribution.files) {
        const { error: deleteError } = await supabase.storage
          .from('cont-requests')
          .remove([(file as any).storage_key]);
        if (deleteError) throw deleteError;
      }
      const rejectFileSummaries = contribution.files.map(f => ({
        name: f.name,
        type: f.type,
        size: (f as any).size || '',
      }));
      const updatePayload = {
        status: 'rejected',
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        files: rejectFileSummaries,
      };
      const { error: updateError } = await supabase
        .from('contribution_requests')
        .update(updatePayload)
        .eq('id', Number(contribution.id));
      if (updateError) throw updateError;

      // Notify parent component of status change
      if (onContributionStatusChange) {
        onContributionStatusChange(contribution.id, 'rejected');
      }

      toast({
        title: 'Contribution Rejected',
        description: `You have rejected "${contribution.title}" and files have been deleted.`,
      });
      onClose();
    } catch (error) {
      console.error('Error rejecting contribution:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject contribution',
        variant: 'destructive',
      });
    }
  };

  const handleCancelReject = () => {
    setShowRejectForm(false)
    setRejectReason("")
  }

  const getFileIcon = (type: ContributionFile["type"]) => {
    switch (type) {
      case "code":
        return <Code className="h-5 w-5 text-blue-400" />
      case "data":
        return <Database className="h-5 w-5 text-green-400" />
      case "document":
        return <FileText className="h-5 w-5 text-amber-400" />
      default:
        return <FileText className="h-5 w-5 text-gray-400" />
    }
  }

  const renderFilePreview = (file: ContributionFile) => {
    switch (file.type) {
      case "code":
        return (
          <div className="bg-secondary/50 p-4 rounded-md font-mono text-sm overflow-x-auto">
            <pre>{file.preview || "Code preview not available"}</pre>
          </div>
        )
      case "data":
        return (
          <div className="bg-secondary/50 p-4 rounded-md overflow-x-auto">
            <div className="text-sm text-muted-foreground mb-2">Data preview:</div>
            <pre className="text-xs">{file.preview || "Data preview not available"}</pre>
          </div>
        )
      case "document":
        return (
          <div className="bg-secondary/50 p-4 rounded-md">
            <div className="prose prose-invert max-w-none">
              {file.preview ? (
                <div dangerouslySetInnerHTML={{ __html: file.preview }} />
              ) : (
                "Document preview not available"
              )}
            </div>
          </div>
        )
      default:
        return <div className="text-muted-foreground">Preview not available for this file type</div>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center justify-between">
            <span>Contribution: {contribution.title}</span>
            <div className="flex items-center gap-2">
              <Badge
                className={
                  ["pending"].includes(contribution.status)
                    ? "bg-amber-500 text-white"
                    : ["approved", "accepted"].includes(contribution.status)
                      ? "bg-green-600 text-white"
                      : "bg-red-600 text-white"
                }
              >
                {["approved", "accepted"].includes(contribution.status) ? "APPROVED" : contribution.status.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {contribution.type ? contribution.type.toUpperCase() : "UNKNOWN"}
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={contribution.contributor?.avatar || undefined} alt={submitterUsername || 'Unknown User'} />
                <AvatarFallback>{submitterUsername ? submitterUsername.charAt(0) : '?'}</AvatarFallback>
              </Avatar>
              <span>{submitterUsername || 'Unknown User'}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{contribution.created_at ? dayjs(contribution.created_at).fromNow() : ''}</span>
            </span>
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="files">Files ({contribution.files.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="flex-1 overflow-hidden flex flex-col">
            <ScrollArea className="flex-1">
              <div className="space-y-4 p-1">
                <div>
                  <h3 className="text-sm font-medium mb-2">Description</h3>
                  <div className="bg-secondary/30 p-4 rounded-md">
                    <p className="whitespace-pre-line">{contribution.description}</p>
                  </div>
                </div>
                {contribution.status === "rejected" && contribution.rejectReason && (
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center text-red-400">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Rejection Reason
                    </h3>
                    <div className="bg-red-900/20 border border-red-900/30 p-4 rounded-md">
                      <p className="whitespace-pre-line text-red-200">{contribution.rejectReason}</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="files" className="flex-1 overflow-hidden flex flex-col">
            <ScrollArea className="flex-1">
              <div className="space-y-6 p-1">
                {['approved', 'accepted'].includes(contribution.status) ? (
                  <div className="bg-green-900/20 border border-green-900/30 rounded p-4 mb-4">
                    <div className="font-semibold mb-2 text-green-200">
                      The following {contribution.files.length} file{contribution.files.length !== 1 ? 's' : ''} were approved and have been added to the lab materials:
                    </div>
                    <ul className="list-disc pl-6 mb-3 text-green-100">
                      {contribution.files.map((file, idx) => (
                        <li key={file.name + '-' + idx}>{file.name}</li>
                      ))}
                    </ul>
                    <div className="mt-4 text-green-300 text-sm font-medium">
                      All files have been contributed to the Lab Materials tab.
                    </div>
                  </div>
                ) : (
                  contribution.files.map((file, idx) => {
                    let ext = ''
                    if (file.name && file.name.includes('.')) {
                      ext = file.name.split('.').pop()?.toLowerCase() || ''
                    }
                    const fileType = ext || file.type
                    return (
                      <div key={file.id || file.name + '-' + idx} className="border border-secondary rounded-md overflow-hidden mb-6">
                        <div className="bg-secondary/50 p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getFileIcon(file.type)}
                            <span className="font-medium">{file.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {fileType.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={async () => {
                              await downloadFile({
                                id: file.id || file.name,
                                name: file.name,
                                type: fileType,
                                url: file.url,
                                size: '',
                                author: '',
                                date: '',
                                bucket: 'cont-requests',
                                storageKey: file.storageKey || file.storage_key,
                              })
                            }}>
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => {
                              setFilePreview({
                                id: file.id || file.name,
                                name: file.name,
                                type: fileType,
                                url: file.url,
                                size: '',
                                author: '',
                                date: '',
                                bucket: 'cont-requests',
                                storageKey: file.storageKey || file.storage_key,
                              });
                              setFilePreviewOpen(true);
                            }}>
                              Preview
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {contribution.status === "pending" && (
          <DialogFooter className="flex-shrink-0">
            {showRejectForm ? (
              <div className="w-full space-y-3">
                <Textarea
                  placeholder="Provide a reason for rejection (optional)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleCancelReject}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleReject}>
                    Confirm Rejection
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button variant="destructive" onClick={handleReject}>
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button variant="default" className="bg-green-600 hover:bg-green-700" onClick={handleApprove}>
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            )}
          </DialogFooter>
        )}
      </DialogContent>
      {/* File preview dialog for contribution files */}
      {filePreview && (
        <FileViewerDialog
          file={filePreview}
          isOpen={filePreviewOpen}
          onClose={() => setFilePreviewOpen(false)}
          labId={labId}
          userRole={"guest"}
        />
      )}
    </Dialog>
  )
}
