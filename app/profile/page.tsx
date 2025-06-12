"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { LoadingAnimation } from "@/components/loading-animation"

export default function ProfileRedirect() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const isNavigating = sessionStorage.getItem("isNavigatingToProfile") === "true";
    if (isNavigating) {
      sessionStorage.removeItem("isNavigatingToProfile");
    }

    if (!user) {
      router.push("/login")
      return
    }

    // Fetch the user's username from profiles table
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("username")
          .eq("user_id", user.id)
          .single()

        if (error || !data?.username) {
          // If no username found, redirect to settings to set one
          router.push("/profile?tab=settings")
        } else {
          // Redirect to the username-based profile route
          router.push(`/profile/${data.username}`)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        // Set loading to false after the fetch and redirect attempt
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [user, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <LoadingAnimation />
        </div>
      )}
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Redirecting...</h2>
        <p className="text-muted-foreground">Taking you to your profile page</p>
      </div>
    </div>
  )
}
