"use client"

import { useState } from "react"
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

export type ContributionFile = {
  id: string
  name: string
  type: "code" | "data" | "document" | "other"
  url: string
  preview?: string
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
  files: ContributionFile[]
  rejectReason?: string
}

interface ContributionDetailModalProps {
  contribution: Contribution | null
  isOpen: boolean
  onClose: () => void
  onApprove: (id: string) => void
  onReject: (id: string, reason: string) => void
}

export function ContributionDetailModal({
  contribution,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: ContributionDetailModalProps) {
  const [activeTab, setActiveTab] = useState("details")
  const [rejectReason, setRejectReason] = useState("")
  const [showRejectForm, setShowRejectForm] = useState(false)

  if (!contribution) return null

  const handleApprove = () => {
    onApprove(contribution.id)
    toast({
      title: "Contribution Approved",
      description: `You have approved "${contribution.title}"`,
    })
    onClose()
  }

  const handleReject = () => {
    if (showRejectForm) {
      onReject(contribution.id, rejectReason)
      toast({
        title: "Contribution Rejected",
        description: `You have rejected "${contribution.title}"`,
      })
      onClose()
      setRejectReason("")
      setShowRejectForm(false)
    } else {
      setShowRejectForm(true)
    }
  }

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
            <Badge
              className={
                contribution.status === "pending"
                  ? "bg-amber-500"
                  : contribution.status === "approved"
                    ? "bg-green-500"
                    : "bg-red-500"
              }
            >
              {contribution.status.toUpperCase()}
            </Badge>
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={contribution.contributor.avatar} alt={contribution.contributor.name} />
                <AvatarFallback>{contribution.contributor.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{contribution.contributor.name}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{contribution.date}</span>
            </div>
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

                <div className="space-y-2">
                  <Label htmlFor="relatedExperiment">
                    CONTRIBUTION TO AN ONGOING EXPERIMENT?{" "}
                    <span className="text-muted-foreground text-xs">(optional)</span>
                  </Label>
                  <Select>
                    <SelectTrigger id="relatedExperiment">
                      <SelectValue placeholder="Select an experiment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="neural-network">
                        Neural Network Optimization <Badge className="ml-2 bg-green-500 text-xs">LIVE</Badge>
                      </SelectItem>
                      <SelectItem value="fmri-data">
                        fMRI Data Analysis <Badge className="ml-2 bg-green-500 text-xs">LIVE</Badge>
                      </SelectItem>
                      <SelectItem value="cognitive-function">
                        Cognitive Function Assessment <Badge className="ml-2 bg-green-500 text-xs">LIVE</Badge>
                      </SelectItem>
                      <SelectItem value="bci-testing">
                        Brain-Computer Interface Testing <Badge className="ml-2 bg-green-500 text-xs">LIVE</Badge>
                      </SelectItem>
                      <SelectItem value="memory-formation">
                        Memory Formation Study <Badge className="ml-2 bg-green-500 text-xs">LIVE</Badge>
                      </SelectItem>
                    </SelectContent>
                  </Select>
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
                {contribution.files.map((file) => (
                  <div key={file.id} className="border border-secondary rounded-md overflow-hidden">
                    <div className="bg-secondary/50 p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getFileIcon(file.type)}
                        <span className="font-medium">{file.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {file.type.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={file.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a href={file.url} download={file.name}>
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </a>
                        </Button>
                      </div>
                    </div>
                    <div className="p-4">{renderFilePreview(file)}</div>
                  </div>
                ))}
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
    </Dialog>
  )
}
