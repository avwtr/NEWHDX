"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GitForkIcon, X, Check, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ForkLabDialogProps {
  isOpen: boolean
  onClose: () => void
  labName: string
  labDescription: string
  labCategories: string[]
  labAvatar: string
}

export function ForkLabDialog({
  isOpen,
  onClose,
  labName,
  labDescription,
  labCategories,
  labAvatar,
}: ForkLabDialogProps) {
  const [newLabName, setNewLabName] = useState(labName)
  const [forkStatus, setForkStatus] = useState<"idle" | "loading" | "success">("idle")
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newLabName.trim()) {
      setError("Lab name cannot be empty")
      return
    }

    setError(null)
    setForkStatus("loading")

    // Simulate API call
    setTimeout(() => {
      setForkStatus("success")

      // Redirect after success
      setTimeout(() => {
        // In a real app, this would redirect to the new lab
        window.location.href = "/"
      }, 2000)
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div
        className="bg-background border border-secondary rounded-lg shadow-lg w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {forkStatus === "success" ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Lab Forked Successfully!</h2>
            <p className="text-muted-foreground mb-6">
              Your copy of {labName} has been created. You are now the founder of {newLabName}.
            </p>
            <div className="flex justify-center">
              <Button className="bg-accent text-primary-foreground hover:bg-accent/90">GO TO YOUR LAB</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-4 border-b border-secondary">
              <div className="flex items-center">
                <GitForkIcon className="h-5 w-5 mr-2 text-accent" />
                <h2 className="text-lg font-semibold">FORK LAB</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} disabled={forkStatus === "loading"}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <Avatar className="h-16 w-16 flex-shrink-0">
                  <AvatarImage src={labAvatar} alt={labName} />
                  <AvatarFallback>NL</AvatarFallback>
                </Avatar>

                <div>
                  <h3 className="font-semibold text-lg">{labName}</h3>
                  <div className="flex flex-wrap gap-2 my-2">
                    {labCategories.map((category, index) => (
                      <Badge key={index} className="badge-neuroscience">
                        {category.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{labDescription}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-secondary/30 rounded-md p-4 text-sm">
                  <p>
                    Forking this lab will create a copy with you as the founder. You'll have full control over the
                    forked lab, including:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                    <li>All experiments, publications, and materials</li>
                    <li>Lab settings and configurations</li>
                    <li>The ability to modify and extend the research</li>
                  </ul>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="lab-name">NEW LAB NAME</Label>
                    <Input
                      id="lab-name"
                      value={newLabName}
                      onChange={(e) => setNewLabName(e.target.value)}
                      placeholder="Enter lab name"
                      className="bg-secondary/20"
                      disabled={forkStatus === "loading"}
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <Button type="button" variant="outline" onClick={onClose} disabled={forkStatus === "loading"}>
                      CANCEL
                    </Button>
                    <Button
                      type="submit"
                      className="bg-accent text-primary-foreground hover:bg-accent/90"
                      disabled={forkStatus === "loading"}
                    >
                      {forkStatus === "loading" ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          FORKING LAB...
                        </>
                      ) : (
                        <>
                          <GitForkIcon className="h-4 w-4 mr-2" />
                          FORK LAB
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
