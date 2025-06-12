"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tokenChecked, setTokenChecked] = useState(false)

  // On mount, check for access_token in URL and set it in Supabase
  useEffect(() => {
    if (!searchParams) {
      setTokenChecked(true)
      return
    }
    // Only process tokens from the hash fragment, do not rewrite URL
    let access_token = ""
    let refresh_token = ""
    let type = ""
    if (typeof window !== "undefined") {
      const hash = window.location.hash
      if (hash && hash.includes("access_token")) {
        const hashParams = new URLSearchParams(hash.substring(1))
        access_token = hashParams.get("access_token") || ""
        refresh_token = hashParams.get("refresh_token") || access_token
        type = hashParams.get("type") || ""
      } else {
        access_token = searchParams.get("access_token") || ""
        refresh_token = searchParams.get("refresh_token") || access_token
        type = searchParams.get("type") || ""
      }
    }
    // Debug: log tokens and type
    console.log("access_token:", access_token, "refresh_token:", refresh_token, "type:", type)
    if (access_token && type === "recovery") {
      supabase.auth.setSession({ access_token, refresh_token })
        .then(async () => {
          const { data: sessionData } = await supabase.auth.getSession()
          console.log("Session after setSession:", sessionData)
          setTokenChecked(true)
        })
        .catch((err) => {
          console.error("Error setting session:", err)
          setTokenChecked(true)
        })
    } else {
      setTokenChecked(true)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      })
      return
    }
    setIsSubmitting(true)
    try {
      // Check session before updating password
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData?.session) {
        toast({
          title: "Error",
          description: "Auth session missing. Please use the link from your email again.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Password reset successful",
          description: "You can now log in with your new password.",
        })
        setTimeout(() => router.push("/login"), 2000)
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!tokenChecked) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
              <CardDescription>Enter your new password below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Re-enter your new password"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                <a href="/login" className="text-primary hover:underline">Back to login</a>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
