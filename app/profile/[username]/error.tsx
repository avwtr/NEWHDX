"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Something went wrong!</CardTitle>
          <CardDescription>
            {error.message || "An error occurred while loading the profile."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button onClick={() => reset()}>Try again</Button>
          <Button variant="outline" onClick={() => router.push("/")}>
            Go home
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 