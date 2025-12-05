"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { LoadingAnimation } from "@/components/loading-animation"

interface PrivateLabAccessControlProps {
  lab: any
  labId: string
  children: React.ReactNode
}

export default function PrivateLabAccessControl({ lab, labId, children }: PrivateLabAccessControlProps) {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    const checkAccess = async () => {
      // If lab is public, allow access
      if (!lab.public_private || lab.public_private === 'public') {
        setHasAccess(true)
        setIsChecking(false)
        return
      }

      // If lab is private, check if user has access
      if (lab.public_private === 'private') {
        // Wait for auth to load
        if (authLoading) return

        // If no user, redirect to login
        if (!user) {
          router.push(`/login?redirectTo=/lab/${labId}`)
          return
        }

        // Check if user is admin or founder
        const { data: memberData, error } = await supabase
          .from("labMembers")
          .select("role")
          .eq("lab_id", labId)
          .eq("user", user.id)
          .in("role", ["admin", "founder"])
          .limit(1)

        if (error) {
          console.error("Error checking lab access:", error)
          setHasAccess(false)
        } else if (memberData && memberData.length > 0) {
          setHasAccess(true)
        } else {
          setHasAccess(false)
        }
      }

      setIsChecking(false)
    }

    checkAccess()
  }, [lab, labId, user, authLoading, router])

  if (isChecking || authLoading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <LoadingAnimation />
      </div>
    )
  }

  if (!hasAccess && lab.public_private === 'private') {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground">This lab is private. Only admins and founders can access it.</p>
      </div>
    )
  }

  return <>{children}</>
}

