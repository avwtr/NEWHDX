import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "User Profile",
  description: "View and manage your profile, labs, activity, and collections",
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <main className="container py-8">
        {children}
      </main>
    </div>
  )
}
