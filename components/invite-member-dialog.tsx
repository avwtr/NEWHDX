"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, Check, Mail } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface InviteMemberDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function InviteMemberDialog({ isOpen, onClose }: InviteMemberDialogProps) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("member")
  const [copied, setCopied] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // This would be a dynamic link in a real app
  const inviteLink = "https://hdx.science/labs/neuroscience-lab/join?token=abc123xyz456"

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)

    toast({
      title: "Link copied to clipboard",
      description: "You can now share this link with others to invite them to your lab",
    })

    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendInvite = () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter an email address to send the invitation",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)

    // Simulate API call
    setTimeout(() => {
      setIsSending(false)
      setEmail("")

      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${email}`,
      })
    }, 1000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Invite Lab Members</DialogTitle>
          <DialogDescription>Invite collaborators to join your lab and contribute to your research</DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <div className="space-y-4">
            <Label>Share Invite Link</Label>
            <div className="flex items-center gap-2">
              <Input value={inviteLink} readOnly className="bg-secondary/20 text-sm font-mono" />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                className={copied ? "border-green-500 text-green-500" : "border-accent text-accent"}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Anyone with this link can request to join your lab. The link expires in 7 days.
            </p>
          </div>

          <div className="border-t border-secondary pt-4">
            <Label className="mb-4 block">Send Email Invitation</Label>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@institution.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full bg-accent text-primary-foreground hover:bg-accent/90"
                onClick={handleSendInvite}
                disabled={isSending}
              >
                {isSending ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
