"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function FirstLogin() {
  const router = useRouter()
  const { toast } = useToast()
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data?.session) {
        toast({ title: "Session missing", description: "Click the login link again.", variant: "destructive" })
        return
      }

      const { data: userData } = await supabase.auth.getUser()
      if (userData?.user?.id) {
        setUserId(userData.user.id)
      }

      setSessionReady(true)
    }

    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
      setIsSubmitting(false)
      return
    }

    // ✅ Update profile to mark as fully migrated
    if (userId) {
      await supabase.from("profiles").update({ migrated: false }).eq("user_id", userId)
    }

    toast({
      title: "Password updated",
      description: "You can now log in normally with your new password.",
    })

    router.push("/dashboard")
  }

  if (!sessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold">Welcome Back</h1>
        <p className="text-muted-foreground text-sm">
          We've logged you in with a temporary password. To finish setting up your account, please choose a new password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />

          <div className="flex gap-2 justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/dashboard")}
            >
              Skip for now
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Update Password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
