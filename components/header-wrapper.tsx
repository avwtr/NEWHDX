"use client"

import { usePathname } from "next/navigation"
import { SiteHeader } from "@/components/site-header"

export function HeaderWrapper() {
  const pathname = usePathname()
  
  // Don't render header on landing page
  if (pathname === "/" || pathname === "/landing") {
    return null
  }
  
  return <SiteHeader />
} 