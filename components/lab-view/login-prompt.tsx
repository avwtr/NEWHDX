"use client"

import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"

interface LoginPromptProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginPrompt({ isOpen, onClose }: LoginPromptProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-x-0 top-20 mx-auto w-max z-50 bg-background border border-accent rounded-md shadow-lg p-4 animate-in fade-in slide-in-from-top-5">
      <div className="flex items-center gap-3">
        <LogIn className="h-5 w-5 text-accent" />
        <span>Please log in to perform this action</span>
        <Button size="sm" variant="outline" onClick={onClose}>
          Dismiss
        </Button>
      </div>
    </div>
  )
}
