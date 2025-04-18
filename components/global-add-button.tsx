"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Beaker, Upload, FolderPlus, Users, X, Settings } from "lucide-react"
import { useRouter } from "next/navigation"

interface GlobalAddButtonProps {
  onUploadFile: () => void
  onNewFolder: () => void
  onNewExperiment: () => void
  onInviteMember: () => void
  onSettings: () => void
  onLogEvent: () => void
}

export function GlobalAddButton({
  onUploadFile,
  onNewFolder,
  onNewExperiment,
  onInviteMember,
  onSettings,
  onLogEvent,
}: GlobalAddButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleAction = (action: () => void) => {
    action()
    setIsOpen(false)
  }

  const navigateToPublications = () => {
    router.push("/publications/create")
    setIsOpen(false)
  }

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-[#0F1642] rounded-lg shadow-lg p-2 mb-2 w-48">
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start text-left hover:bg-secondary/50"
              onClick={() => navigateToPublications()}
            >
              <FileText className="h-4 w-4 mr-2 text-accent" />
              Publication
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-left hover:bg-secondary/50"
              onClick={() => handleAction(onUploadFile)}
            >
              <Upload className="h-4 w-4 mr-2 text-accent" />
              Upload File
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-left hover:bg-secondary/50"
              onClick={() => handleAction(onNewFolder)}
            >
              <FolderPlus className="h-4 w-4 mr-2 text-accent" />
              New Folder
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-left hover:bg-secondary/50"
              onClick={() => handleAction(onNewExperiment)}
            >
              <Beaker className="h-4 w-4 mr-2 text-accent" />
              Experiment
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-left hover:bg-secondary/50"
              onClick={() => handleAction(onLogEvent)}
            >
              <FileText className="h-4 w-4 mr-2 text-accent" />
              Log an Event
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-left hover:bg-secondary/50"
              onClick={() => handleAction(onInviteMember)}
            >
              <Users className="h-4 w-4 mr-2 text-accent" />
              Invite Member
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-left hover:bg-secondary/50"
              onClick={() => handleAction(onSettings)}
            >
              <Settings className="h-4 w-4 mr-2 text-accent" />
              Settings
            </Button>
          </div>
        </div>
      )}

      <Button
        size="lg"
        className={`rounded-full h-14 w-14 shadow-lg ${isOpen ? "bg-secondary hover:bg-secondary/80" : "bg-accent hover:bg-accent/90"}`}
        onClick={toggleMenu}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </Button>
    </div>
  )
}
