"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"

export default function ExperimentLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user, isLoading } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showMigrateModal, setShowMigrateModal] = useState(false)
  const [pendingResetEmail, setPendingResetEmail] = useState("")
  const [resetting, setResetting] = useState(false)

  const redirectTo = searchParams?.get("redirectTo") || "/explore"

  useEffect(() => {
    if (!isLoading && user) {
      router.push(redirectTo)
    }
  }, [user, isLoading, router, redirectTo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Check if user is migrated before attempting login
    const { data: emailData, error: emailError } = await supabase
      .from('email')
      .select('id')
      .eq('email', email)
      .single()
    console.log('Email view result:', emailData, emailError)

    if (!emailError && emailData && emailData.id) {
      const user_id = emailData.id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('migrated')
        .eq('user_id', user_id)
        .single()
      console.log('Profiles result:', profile, profileError)

      if (!profileError && profile?.migrated === true) {
        setPendingResetEmail(email)
        setShowMigrateModal(true)
        setIsSubmitting(false)
        return
      }
    }

    try {
      const { user, session, error } = await login({ email, password })

      if (error) {
        toast({
          title: "Login failed",
          description: error.message === "Invalid login credentials"
            ? "Incorrect email or password. Please try again or use the 'Forgot password?' link below."
            : error.message,
          variant: "destructive",
        })
      } else if (session) {
        toast({
          title: "Login successful",
          description: `Welcome back${user?.user_metadata?.first_name ? ", " + user.user_metadata.first_name : ""}!`,
        })
        router.push(redirectTo)
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ✅ Updated magic link flow for migrated users
  const handleMigrateReset = async () => {
    setResetting(true)

    const { error } = await supabase.auth.signInWithOtp({
      email: pendingResetEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/first-login`
      }
    })

    setResetting(false)
    setShowMigrateModal(false)

    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to send login link.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Check your email",
        description: "We sent you a link to log in and set a new password.",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (user) return null

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border border-border">
          <div className="p-4 text-sm text-yellow-700 bg-yellow-100 rounded-t-md border-b border-yellow-200">
            If you already had an account in our previous system, you'll be prompted to update your password.
          </div>
          <form onSubmit={handleSubmit}>
            <div className="p-8">
              {/* Header with better spacing */}
              <div className="mb-12">
                <h1 className="text-2xl font-bold text-foreground">Sign In</h1>
              </div>
              
              {/* Form fields with improved spacing */}
              <div className="space-y-8">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="researcher@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-secondary border-secondary"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-foreground">Password</Label>
                    <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-secondary border-secondary"
                  />
                </div>
              </div>
              
              {/* Button with dark blue text on green background */}
              <div className="mt-12">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-medium bg-green-500 hover:bg-green-600 text-blue-900 border-none" 
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: '#10b981',
                    color: '#1e3a8a'
                  }}
                >
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
              </div>
              
              {/* Footer links with better spacing */}
              <div className="mt-8 space-y-6">
                <div className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-primary hover:underline">
                    Create an account
                  </Link>
                </div>
                <div className="text-center">
                  <Link href="/explore" className="text-sm text-muted-foreground hover:underline">
                    ← Back to Platform
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </Card>
      </div>

      {/* Migrated user modal */}
      {showMigrateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold mb-2">Password Reset Required</h2>
            <p className="mb-4 text-sm text-gray-700">
              This account was migrated from our previous system. We'll send you a secure login link to set your new password.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowMigrateModal(false)} disabled={resetting}>Cancel</Button>
              <Button onClick={handleMigrateReset} disabled={resetting} className="bg-accent text-primary-foreground hover:bg-accent/90">
                {resetting ? "Sending..." : "Send Link" }
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
