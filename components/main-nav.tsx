import type React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
        Home
      </Link>
      <Link
        href="/dashboard"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Dashboard
      </Link>
      <Link href="/lab" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
        Lab
      </Link>
      <Link
        href="/contributions"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Contributions
      </Link>
      <Link href="/funding" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
        Funding
      </Link>
      <Link href="/network" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
        Network
      </Link>
    </nav>
  )
}
