"use client"
import { Button } from "@/components/ui/button"

export function SiteFooter() {
  return (
    <footer className="border-t border-secondary bg-background">
      <div className="container flex flex-col items-center justify-between space-y-4 py-6 md:flex-row md:space-y-0">
        <div className="flex flex-col items-center space-y-1 md:items-start">
          <h2 className="text-sm font-bold tracking-tight">Virtual Lab Platform</h2>
          <p className="text-xs text-muted-foreground">Built by HDX Students</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-xs">
            Contact
          </Button>
          <Button variant="ghost" size="sm" className="text-xs">
            About
          </Button>
          <Button variant="ghost" size="sm" className="text-xs">
            Terms
          </Button>
        </div>
      </div>
    </footer>
  )
}
