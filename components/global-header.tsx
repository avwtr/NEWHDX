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

export function GlobalHeader() {
  const [searchQuery, setSearchQuery] = useState("")
  const { user, signOut, isLoading } = useAuth()

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
              <Button variant="ghost" size="icon" className="text-foreground hover:bg-secondary hover:text-accent">
                <Plus className="h-5 w-5" />
                <span className="sr-only">Create new</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel className="uppercase text-xs tracking-wide">Create New</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/create-lab" className="flex w-full items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Lab
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/create-organization" className="flex w-full items-center">
                  <Building2 className="h-4 w-4 mr-2" />
                  Organization
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/create-grant" className="flex w-full items-center">
                  <Award className="h-4 w-4 mr-2" />
                  Grant
                </Link>
              </DropdownMenuItem>
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
                  <Link href="/profile" className="gap-2 flex items-center">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="gap-2 flex items-center">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/content" className="gap-2 flex items-center">
                    <FileText className="h-4 w-4" />
                    <span>HDX Content</span>
                  </Link>
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
                <DropdownMenuItem asChild>
                  <Link href="/membership" className="gap-2 flex items-center">
                    <CreditCard className="h-4 w-4" />
                    <span>Membership</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/help" className="gap-2 flex items-center">
                    <HelpCircle className="h-4 w-4" />
                    <span>Help</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuLabel className="uppercase text-xs tracking-wide">Follow Us</DropdownMenuLabel>
                <DropdownMenuGroup className="flex justify-between px-2 py-1.5">
                  <Link href="https://instagram.com/hdx" target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Instagram className="h-4 w-4" />
                      <span className="sr-only">Instagram</span>
                    </Button>
                  </Link>
                  <Link href="https://twitter.com/hdx" target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Twitter className="h-4 w-4" />
                      <span className="sr-only">Twitter</span>
                    </Button>
                  </Link>
                  <Link href="https://youtube.com/hdx" target="_blank" rel="noopener noreferrer">
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
    </header>
  )
}
