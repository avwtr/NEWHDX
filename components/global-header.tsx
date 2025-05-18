"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Search,
  Plus,
  LogOut,
  User,
  HelpCircle,
  Globe,
  ShoppingBag,
  FileText,
  Instagram,
  Twitter,
  Youtube,
  CreditCard,
  Building2,
  Award,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth-provider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

export function GlobalHeader() {
  const [searchQuery, setSearchQuery] = useState("")
  const { user, signOut, isLoading } = useAuth()
  const [helpOpen, setHelpOpen] = useState(false)
  const [helpSubject, setHelpSubject] = useState("")
  const [helpMessage, setHelpMessage] = useState("")
  const [helpLoading, setHelpLoading] = useState(false)
  const [helpSuccess, setHelpSuccess] = useState<string | null>(null)
  const [helpError, setHelpError] = useState<string | null>(null)

  const handleHelpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setHelpLoading(true)
    setHelpSuccess(null)
    setHelpError(null)
    try {
      const res = await fetch("/api/send-help-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: helpSubject,
          message: helpMessage,
          from: user?.email || "anonymous@hdx.com"
        })
      })
      if (res.ok) {
        setHelpSuccess("Your message has been sent! We'll get back to you soon.")
        setHelpSubject("")
        setHelpMessage("")
      } else {
        setHelpError("Failed to send message. Please try again later.")
      }
    } catch (err) {
      setHelpError("Failed to send message. Please try again later.")
    } finally {
      setHelpLoading(false)
    }
  }

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user) return "U"

    const firstName = user.user_metadata?.first_name || ""
    const lastName = user.user_metadata?.last_name || ""

    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase()
    } else if (firstName) {
      return firstName[0].toUpperCase()
    } else if (user.email) {
      return user.email[0].toUpperCase()
    }

    return "U"
  }

  // Get user display name
  const getDisplayName = () => {
    if (!user) return "User"

    const firstName = user.user_metadata?.first_name
    const lastName = user.user_metadata?.last_name

    if (firstName && lastName) {
      return `${firstName} ${lastName}`
    } else if (firstName) {
      return firstName
    } else if (user.email) {
      return user.email.split("@")[0]
    }

    return "User"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-secondary bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-accent uppercase">HDX</span>
          </Link>

          {/* Search Bar */}
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search labs, datasets, publications..."
              className="w-[300px] lg:w-[400px] pl-8 bg-secondary border-secondary text-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Explore Link */}
          <Link href="/explore">
            <Button
              variant="ghost"
              className="gap-1 text-foreground hover:bg-secondary hover:text-accent text-xs uppercase tracking-wide"
            >
              <Globe className="h-4 w-4 mr-2" />
              Explore
            </Button>
          </Link>

          {/* Create New Dropdown - Simplified */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-foreground hover:bg-secondary hover:text-accent"
              >
                <Plus className="h-5 w-5" />
                <span className="sr-only">Create new</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel className="uppercase text-xs tracking-wide">Create New</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled={!user} className={!user ? "opacity-50 cursor-not-allowed" : ""}>
                <Link href="/create-lab" className="flex w-full items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Lab
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!user} className={!user ? "opacity-50 cursor-not-allowed" : ""}>
                <Link href="/orgCreate" className="flex w-full items-center">
                  <Building2 className="h-4 w-4 mr-2" />
                  Organization
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!user} className={!user ? "opacity-50 cursor-not-allowed" : ""}>
                <Link href="/grants/new" className="flex w-full items-center">
                  <Award className="h-4 w-4 mr-2" />
                  Grant
                </Link>
              </DropdownMenuItem>
              {!user && (
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  Please sign in to create content
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile or Login/Signup */}
          {isLoading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url || ""} alt={getDisplayName()} />
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[220px]">
                <DropdownMenuLabel className="uppercase text-xs tracking-wide">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="gap-2 flex items-center w-full">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile?tab=settings" className="gap-2 flex items-center w-full">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="https://heterodoxlabs.org" target="_blank" rel="noopener noreferrer" className="gap-2 flex items-center">
                    <FileText className="h-4 w-4" />
                    <span>HDX Foundation</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href="https://shop.heterodoxlabs.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gap-2 flex items-center"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>HDX Shop</span>
                  </a>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuLabel className="uppercase text-xs tracking-wide">Follow Us</DropdownMenuLabel>
                <DropdownMenuGroup className="flex justify-between px-2 py-1.5">
                  <Link href="https://instagram.com/heterodoxlabs" target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Instagram className="h-4 w-4" />
                      <span className="sr-only">Instagram</span>
                    </Button>
                  </Link>
                  <Link href="https://twitter.com/heterodoxlabs" target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Twitter className="h-4 w-4" />
                      <span className="sr-only">Twitter</span>
                    </Button>
                  </Link>
                  <Link href="https://www.youtube.com/@HDXLABS" target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Youtube className="h-4 w-4" />
                      <span className="sr-only">YouTube</span>
                    </Button>
                  </Link>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={signOut} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search */}
      <div className="container py-2 md:hidden">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search labs, datasets, publications..."
            className="w-full pl-8 bg-secondary border-secondary text-foreground"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact HDX Support</DialogTitle>
            <DialogDescription>
              Send a message to the HDX Foundation team. We'll get back to you as soon as possible.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleHelpSubmit} className="space-y-4">
            <Input
              placeholder="Subject"
              value={helpSubject}
              onChange={e => setHelpSubject(e.target.value)}
              required
              maxLength={100}
            />
            <Textarea
              placeholder="How can we help you?"
              value={helpMessage}
              onChange={e => setHelpMessage(e.target.value)}
              rows={5}
              required
              maxLength={1000}
            />
            {helpSuccess && <div className="text-green-600 text-sm">{helpSuccess}</div>}
            {helpError && <div className="text-red-600 text-sm">{helpError}</div>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setHelpOpen(false)} disabled={helpLoading}>Cancel</Button>
              <Button type="submit" disabled={helpLoading || !helpSubject || !helpMessage} className="bg-accent text-primary-foreground hover:bg-accent/90">
                {helpLoading ? "Sending..." : "Send"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  )
}
