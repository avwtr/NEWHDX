"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"

export default function ProfileRedirect() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    // Fetch the user's username from profiles table
    supabase
      .from("profiles")
      .select("username")
      .eq("user_id", user.id)
      .single()
      .then(({ data, error }) => {
        if (error || !data?.username) {
          // If no username found, redirect to settings to set one
          router.push("/profile?tab=settings")
        } else {
          // Redirect to the username-based profile route
          router.push(`/profile/${data.username}`)
        }
      })
  }, [user, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Redirecting...</h2>
        <p className="text-muted-foreground">Taking you to your profile page</p>
      </div>
    </div>
  )
}
