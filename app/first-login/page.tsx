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

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data?.session) {
        toast({ title: "Missing session", description: "Please click the link in your email again.", variant: "destructive" })
      } else {
        setSessionReady(true)
      }
    }
    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } else {
      // Optional: update the user row to mark them as no longer migrated
      const { data: user } = await supabase.auth.getUser()
      if (user) {
        await supabase.from("users").update({ migrated: false }).eq("id", user.user.id)
      }

      toast({ title: "Password set", description: "You're all set." })
      router.push("/dashboard") // or wherever
    }
    setIsSubmitting(false)
  }

  if (!sessionReady) {
    return <div className="p-4 text-center">Verifying session...</div>
  }

  return (
    <div className="min-h-screen flex justify-center items-center p-4">
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
        <h1 className="text-2xl font-bold">Set Your New Password</h1>
        <Input
          type="password"
          placeholder="New password"
          value={password}
          minLength={8}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Set Password"}
        </Button>
      </form>
    </div>
  )
}
