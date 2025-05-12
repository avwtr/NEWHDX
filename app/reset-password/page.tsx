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
    // If access_token and type are not in the query string, but are in the hash, move them to the query string
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const hash = window.location.hash
      if (!params.get("access_token") && hash && hash.includes("access_token")) {
        const hashParams = new URLSearchParams(hash.substring(1))
        const access_token = hashParams.get("access_token")
        const type = hashParams.get("type")
        if (access_token && type) {
          // Move to query string and reload
          const newUrl = `${window.location.pathname}?access_token=${encodeURIComponent(access_token)}&type=${encodeURIComponent(type)}`
          window.location.replace(newUrl)
          return
        }
      }
    }
    const access_token = searchParams.get("access_token")
    const type = searchParams.get("type")
    if (access_token && type === "recovery") {
      supabase.auth.setSession({ access_token, refresh_token: access_token })
        .then(() => setTokenChecked(true))
        .catch(() => setTokenChecked(true))
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
