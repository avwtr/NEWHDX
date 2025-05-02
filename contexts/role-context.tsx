"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"

type Role = "admin" | "user" | "guest"

interface RoleContextType {
  currentRole: Role
  setRole: (role: Role) => void
  isAdmin: boolean
}

const RoleContext = createContext<RoleContextType>({
  currentRole: "guest",
  setRole: () => {},
  isAdmin: false,
})

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [currentRole, setCurrentRole] = useState<Role>("guest")

  // Set role based on authentication status
  useEffect(() => {
    if (user) {
      setCurrentRole("user")
    } else {
      setCurrentRole("guest")
    }
  }, [user])

  const setRole = (role: Role) => {
    setCurrentRole(role)
  }

  const isAdmin = currentRole === "admin"

  return <RoleContext.Provider value={{ currentRole, setRole, isAdmin }}>{children}</RoleContext.Provider>
}

export function useRole() {
  const context = useContext(RoleContext)
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider")
  }
  return context
}

export const useRoleContext = useRole
