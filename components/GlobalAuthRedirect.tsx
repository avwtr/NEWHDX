"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

export function GlobalAuthRedirect() {
  const { user, isLoading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    // Prevent redirect on /first-login
    if (user && pathname === "/") {
      router.push("/dashboard")
    }
  }, [user, isLoading, pathname, router])

  return null
}
