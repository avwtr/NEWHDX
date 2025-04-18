"use client"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { GlobalHeader } from "@/components/global-header"

export function SiteHeader() {
  const pathname = usePathname()
  const { user, isLoading } = useAuth()

  // Use the GlobalHeader for the main site navigation
  return <GlobalHeader />
}
