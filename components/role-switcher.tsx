"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRole } from "@/contexts/role-context"
import { Shield, User, UserX } from "lucide-react"

export function RoleSwitcher() {
  const { currentRole, setRole } = useRole()
  const [isOpen, setIsOpen] = useState(false)

  const toggleOpen = () => setIsOpen(!isOpen)

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 bg-background border-accent border rounded-md shadow-lg p-2 space-y-2 min-w-[200px]">
          <Button
            variant={currentRole === "admin" ? "default" : "outline"}
            size="sm"
            className={`w-full justify-start ${currentRole === "admin" ? "bg-accent text-primary-foreground" : ""}`}
            onClick={() => {
              setRole("admin")
              setIsOpen(false)
            }}
          >
            <Shield className="h-4 w-4 mr-2" />
            Lab Admin
          </Button>
          <Button
            variant={currentRole === "user" ? "default" : "outline"}
            size="sm"
            className={`w-full justify-start ${currentRole === "user" ? "bg-accent text-primary-foreground" : ""}`}
            onClick={() => {
              setRole("user")
              setIsOpen(false)
            }}
          >
            <User className="h-4 w-4 mr-2" />
            Logged-in User
          </Button>
          <Button
            variant={currentRole === "guest" ? "default" : "outline"}
            size="sm"
            className={`w-full justify-start ${currentRole === "guest" ? "bg-accent text-primary-foreground" : ""}`}
            onClick={() => {
              setRole("guest")
              setIsOpen(false)
            }}
          >
            <UserX className="h-4 w-4 mr-2" />
            Guest (Not Logged In)
          </Button>
        </div>
      )}

      <Button onClick={toggleOpen} className="bg-accent text-primary-foreground hover:bg-accent/90 shadow-lg">
        {currentRole === "admin" ? (
          <Shield className="h-4 w-4 mr-2" />
        ) : currentRole === "user" ? (
          <User className="h-4 w-4 mr-2" />
        ) : (
          <UserX className="h-4 w-4 mr-2" />
        )}
        Switch Role
      </Button>
    </div>
  )
}
