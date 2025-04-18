"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Welcome to Virtual Lab</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>My Experiments</CardTitle>
            <CardDescription>View and manage your ongoing experiments</CardDescription>
          </CardHeader>
          <CardContent>
            <p>You have 0 active experiments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Research Materials</CardTitle>
            <CardDescription>Access your research materials and data</CardDescription>
          </CardHeader>
          <CardContent>
            <p>You have 0 research materials</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Collaborations</CardTitle>
            <CardDescription>View your research collaborations</CardDescription>
          </CardHeader>
          <CardContent>
            <p>You have 0 active collaborations</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
