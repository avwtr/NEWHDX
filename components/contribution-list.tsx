"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatDistanceToNow } from "date-fns"
import { AlertCircle, CheckCircle, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export type Contribution = {
  id: string
  title: string
  amount: number
  date: Date
  type: "one-time" | "membership"
  status: "active" | "inactive"
  contributor: {
    name: string
    avatar?: string
    email: string
  }
}

interface ContributionListProps {
  contributions: Contribution[]
  onStatusChange?: (id: string, status: "active" | "inactive") => void
  isAdmin?: boolean
}

export function ContributionList({ contributions, onStatusChange, isAdmin = false }: ContributionListProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    id: string
    title: string
    action: "activate" | "deactivate"
  }>({
    open: false,
    id: "",
    title: "",
    action: "deactivate",
  })

  const handleStatusChange = (id: string, status: "active" | "inactive") => {
    if (onStatusChange) {
      onStatusChange(id, status)
    }

    setConfirmDialog((prev) => ({ ...prev, open: false }))

    toast.success(`Contribution ${status === "active" ? "activated" : "deactivated"} successfully`)
  }

  const openConfirmDialog = (id: string, title: string, action: "activate" | "deactivate") => {
    setConfirmDialog({
      open: true,
      id,
      title,
      action,
    })
  }

  return (
    <div className="space-y-4">
      {contributions.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground">No contributions found.</div>
      ) : (
        contributions.map((contribution) => (
          <Card key={contribution.id} className={`${contribution.status === "inactive" ? "opacity-60" : ""}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{contribution.title}</CardTitle>
                  <Badge variant={contribution.type === "membership" ? "default" : "outline"}>
                    {contribution.type === "membership" ? "Membership" : "One-time"}
                  </Badge>
                  <Badge variant={contribution.status === "active" ? "success" : "destructive"} className="ml-2">
                    {contribution.status === "active" ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" /> Active
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3 mr-1" /> Inactive
                      </>
                    )}
                  </Badge>
                </div>
                <div className="text-xl font-bold">${contribution.amount.toLocaleString()}</div>
              </div>
              <CardDescription>{formatDistanceToNow(contribution.date, { addSuffix: true })}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={contribution.contributor.avatar} />
                  <AvatarFallback>
                    {contribution.contributor.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{contribution.contributor.name}</div>
                  <div className="text-sm text-muted-foreground">{contribution.contributor.email}</div>
                </div>
              </div>
            </CardContent>
            {isAdmin && (
              <CardFooter className="pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className={`ml-auto ${contribution.status === "active" ? "text-destructive" : "text-primary"}`}
                  onClick={() =>
                    openConfirmDialog(
                      contribution.id,
                      contribution.title,
                      contribution.status === "active" ? "deactivate" : "activate",
                    )
                  }
                >
                  {contribution.status === "active" ? "Deactivate" : "Reactivate"}
                </Button>
              </CardFooter>
            )}
          </Card>
        ))
      )}

      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              {confirmDialog.action === "deactivate" ? "Deactivate Contribution" : "Reactivate Contribution"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {confirmDialog.action} <span className="font-medium">{confirmDialog.title}</span>
              ?
              {confirmDialog.action === "deactivate" && (
                <p className="mt-2">This will mark the contribution as inactive. You can reactivate it later.</p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}>
              Cancel
            </Button>
            <Button
              variant={confirmDialog.action === "deactivate" ? "destructive" : "default"}
              onClick={() =>
                handleStatusChange(confirmDialog.id, confirmDialog.action === "deactivate" ? "inactive" : "active")
              }
            >
              {confirmDialog.action === "deactivate" ? "Deactivate" : "Reactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
