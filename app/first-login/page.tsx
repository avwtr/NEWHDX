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
      const { data: sessionData } = await supabase.auth.getSession()
      console.log("Session data:", sessionData)

      if (!sessionData?.session) {
        toast({
          title: "Session missing",
          description: "Click the login link from your email again.",
          variant: "destructive",
        })
        return
      }

      const { data: user } = await supabase.auth.getUser()
      setUserId(user?.user?.id ?? null)
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

    if (userId) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ migrated: false })
        .eq("user_id", userId)

      if (updateError) console.error("Failed to update 'migrated' flag:", updateError)
    }

    toast({ title: "Password set", description: "You're good to go!" })
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
          You've been signed in with a temporary password. Please update it now to finish setting up your account.
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
