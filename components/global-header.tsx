"use client"

import { useState, useEffect, useRef } from "react"
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
  AlertCircle,
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
import { supabase } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { useRouter, usePathname } from "next/navigation"

export function GlobalHeader() {
  const router = useRouter();
  const pathname = usePathname();

  // Don't render header on landing page
  if (pathname === "/" || pathname === "/landing") {
    return null;
  }

  const [searchQuery, setSearchQuery] = useState("")
  const { user, signOut, isLoading } = useAuth()
  const [helpOpen, setHelpOpen] = useState(false)
  const [helpSubject, setHelpSubject] = useState("")
  const [helpMessage, setHelpMessage] = useState("")
  const [helpLoading, setHelpLoading] = useState(false)
  const [helpSuccess, setHelpSuccess] = useState<string | null>(null)
  const [helpError, setHelpError] = useState<string | null>(null)

  // Search state
  const [searchResults, setSearchResults] = useState<any>({ users: [], labs: [], grants: [], experiments: [], orgs: [] })
  const [searchLoading, setSearchLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const searchTimeout = useRef<any>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  const [issueModalOpen, setIssueModalOpen] = useState(false)
  const [issueSubject, setIssueSubject] = useState("")
  const [issueDescription, setIssueDescription] = useState("")
  const [issueLoading, setIssueLoading] = useState(false)
  const [issueSuccess, setIssueSuccess] = useState<string | null>(null)
  const [issueError, setIssueError] = useState<string | null>(null)

  // Helper to handle navigation
  const handleNav = (href: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (href === "/") {
      sessionStorage.setItem("isNavigatingToLanding", "true");
    }
    if (href === "/profile") {
      sessionStorage.setItem("isNavigatingToProfile", "true");
    }
    if (href === "/create-lab") {
      sessionStorage.setItem("isNavigatingToCreateLab", "true");
    }
    if (href === "/grants/new") {
      sessionStorage.setItem("isNavigatingToCreateGrant", "true");
    }
    if (href === "/orgCreate") {
      sessionStorage.setItem("isNavigatingToCreateOrg", "true");
    }
    router.push(href);
  };

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ users: [], labs: [], grants: [], experiments: [], orgs: [] })
      setShowDropdown(false)
      return
    }
    setSearchLoading(true)
    setShowDropdown(true)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(async () => {
      // Query users, labs, grants, experiments, and organizations
      const [
        { data: users },
        { data: labs, error: labsError },
        { data: grants },
        { data: experiments },
        { data: orgs }
      ] = await Promise.all([
        supabase.from("profiles").select("user_id, username, profilePic, research_interests").ilike("username", `%${searchQuery}%`).limit(5),
        supabase.from("labs").select("labId, labName, description").ilike("labName", `%${searchQuery}%`).limit(5),
        supabase.from("grants").select("id, title, description").ilike("title", `%${searchQuery}%`).limit(5),
        supabase.from("experiments").select("id, name, objective").ilike("name", `%${searchQuery}%`).limit(5),
        supabase.from("organizations").select("org_id, org_name, description, profilePic, slug").ilike("org_name", `%${searchQuery}%`).limit(5),
      ])
      let labsWithCategories = labs || [];
      if (labs && labs.length > 0) {
        const labIds = labs.map((lab: any) => lab.labId);
        const { data: labCategories } = await supabase
          .from("labCategories")
          .select("lab_id, category")
          .in("lab_id", labIds);
        labsWithCategories = labs.map((lab: any) => ({
          ...lab,
          categories: (labCategories || [])
            .filter((cat: any) => cat.lab_id === lab.labId)
            .map((cat: any) => cat.category)
        }));
      }
      if (labsError) {
        console.error("Labs search error:", labsError)
      }
      setSearchResults({
        users: users || [],
        labs: labsWithCategories,
        grants: grants || [],
        experiments: experiments || [],
        orgs: orgs || [],
      })
      setSearchLoading(false)
      setShowDropdown(true)
    }, 350)
    return () => clearTimeout(searchTimeout.current)
  }, [searchQuery])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClick)
    }
    return () => document.removeEventListener("mousedown", handleClick)
  }, [showDropdown])

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

  // Handle issue submission
  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIssueLoading(true)
    setIssueSuccess(null)
    setIssueError(null)
    if (!user) {
      setIssueError("You must be logged in to submit an issue.")
      setIssueLoading(false)
      return
    }
    try {
      const { error } = await supabase.from("issues").insert({
        user_id: user.id,
        current_route: pathname,
        subject: issueSubject,
        description: issueDescription,
      })
      if (error) {
        setIssueError("Failed to submit issue. Please try again later.")
      } else {
        setIssueSuccess("Thank you for your feedback! We'll look into it.")
        setIssueSubject("")
        setIssueDescription("")
        setTimeout(() => setIssueModalOpen(false), 1500)
      }
    } catch (err) {
      setIssueError("Failed to submit issue. Please try again later.")
    } finally {
      setIssueLoading(false)
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
    <>
      {/* Top Center Testing Badge and Report Link */}
      <div className="w-full flex justify-center items-center pt-2 pb-1">
        <div className="flex items-center gap-3">
          <span className="bg-yellow-400 text-black rounded-full px-3 py-1 text-xs font-semibold tracking-wide shadow border border-yellow-300">(IN TESTING)</span>
          <button
            className="text-xs text-blue-700 underline font-medium hover:text-blue-900 focus:outline-none"
            onClick={() => setIssueModalOpen(true)}
            type="button"
          >
            Report a bug or issue
          </button>
        </div>
      </div>
      {/* Main Header */}
      <header className="sticky top-0 z-50 w-full border-b border-secondary bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2" onClick={e => handleNav("/", e)}>
              <span className="text-xl font-bold tracking-tight text-accent uppercase">HDX</span>
            </a>

            {/* Search Bar */}
            <div className="relative hidden md:block" ref={searchRef}>
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for users, labs, experiments, orgs"
                className="w-[300px] lg:w-[400px] pl-8 bg-secondary border-secondary text-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowDropdown(true)}
              />
              {/* Search Results Dropdown */}
              {showDropdown && (
                <div className="absolute left-0 mt-2 w-full bg-background border border-secondary rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  {searchLoading ? (
                    <div className="p-4 text-center text-muted-foreground">Searching...</div>
                  ) : (
                    <>
                      {searchResults.users.length === 0 && searchResults.labs.length === 0 && searchResults.grants.length === 0 && searchResults.experiments.length === 0 && searchResults.orgs.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">No results found.</div>
                      ) : (
                        <>
                          {/* Users */}
                          {searchResults.users.length > 0 && (
                            <div>
                              <div className="px-4 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase">Users</div>
                              {searchResults.users.map((user: any) => (
                                <Link key={user.user_id} href={`/profile/${user.username}`} className="flex flex-col gap-1 px-4 py-2 hover:bg-secondary/50">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-7 w-7">
                                      <AvatarImage src={user.profilePic || "/placeholder.svg"} alt={user.username} />
                                      <AvatarFallback>{(user.username || "U").charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{user.username}</span>
                                  </div>
                                  {Array.isArray(user.research_interests) && user.research_interests.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {user.research_interests.slice(0, 3).map((cat: string, idx: number) => (
                                        <Badge key={idx} variant="secondary" className="text-[10px] px-2 py-0.5">
                                          {cat.replace(/-/g, ' ').toUpperCase()}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </Link>
                              ))}
                            </div>
                          )}
                          {/* Labs */}
                          {searchResults.labs.length > 0 && (
                            <div>
                              <div className="px-4 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase">Labs</div>
                              {searchResults.labs.map((lab: any) => (
                                <Link key={lab.labId} href={`/lab/${lab.labId}`} className="block px-4 py-2 hover:bg-secondary/50">
                                  <span className="font-medium">{lab.labName}</span>
                                  <span className="block text-xs text-muted-foreground">{lab.description}</span>
                                  {Array.isArray(lab.categories) && lab.categories.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {lab.categories.slice(0, 3).map((cat: string, idx: number) => (
                                        <Badge key={idx} variant="secondary" className="text-[10px] px-2 py-0.5">
                                          {cat.replace(/-/g, ' ').toUpperCase()}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </Link>
                              ))}
                            </div>
                          )}
                          {/* Grants */}
                          {searchResults.grants.length > 0 && (
                            <div>
                              <div className="px-4 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase">Grants</div>
                              {searchResults.grants.map((grant: any) => (
                                <Link key={grant.id} href={`/grants/${grant.id}`} className="block px-4 py-2 hover:bg-secondary/50">
                                  <span className="font-medium">{grant.title}</span>
                                  <span className="block text-xs text-muted-foreground">{grant.description}</span>
                                </Link>
                              ))}
                            </div>
                          )}
                          {/* Organizations */}
                          {searchResults.orgs && searchResults.orgs.length > 0 && (
                            <div>
                              <div className="px-4 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase">Organizations</div>
                              {searchResults.orgs.map((org: any) => (
                                <Link key={org.org_id} href={`/orgs/${org.slug || org.org_id}`} className="flex items-center gap-3 px-4 py-2 hover:bg-secondary/50">
                                  <Avatar className="h-7 w-7">
                                    <AvatarImage src={org.profilePic || "/placeholder.svg"} alt={org.org_name} />
                                    <AvatarFallback>{(org.org_name || "O").charAt(0).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <span className="font-medium">{org.org_name}</span>
                                    <div className="block text-xs text-muted-foreground">{org.description}</div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                          {/* Experiments */}
                          {searchResults.experiments.length > 0 && (
                            <div>
                              <div className="px-4 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase">Experiments</div>
                              {searchResults.experiments.map((exp: any) => (
                                <Link key={exp.id} href={`/experiments/${exp.id}`} className="block px-4 py-2 hover:bg-secondary/50">
                                  <span className="font-medium">{exp.name}</span>
                                  <span className="block text-xs text-muted-foreground">{exp.objective}</span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Explore Link */}
            <Button
              variant={pathname === "/explore" ? "secondary" : "ghost"}
              className={`gap-1 text-foreground hover:bg-secondary hover:text-accent text-xs uppercase tracking-wide ${pathname === "/explore" ? "bg-accent text-primary-foreground" : ""}`}
              onClick={() => handleNav("/explore")}
            >
              <Globe className="h-4 w-4 mr-2" />
              Explore
            </Button>

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
                  <a href="/create-lab" className="flex w-full items-center" onClick={e => handleNav("/create-lab", e)}>
                    <FileText className="h-4 w-4 mr-2" />
                    Lab
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem disabled={!user} className={!user ? "opacity-50 cursor-not-allowed" : ""}>
                  <a href="/orgCreate" className="flex w-full items-center" onClick={e => handleNav("/orgCreate", e)}>
                    <Building2 className="h-4 w-4 mr-2" />
                    Organization
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem disabled={!user} className={!user ? "opacity-50 cursor-not-allowed" : ""}>
                  <a href="/grants/new" className="flex w-full items-center" onClick={e => handleNav("/grants/new", e)}>
                    <Award className="h-4 w-4 mr-2" />
                    Grant
                  </a>
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
                    <a href="/profile" className="gap-2 flex items-center w-full" onClick={e => handleNav("/profile", e)}>
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/profile?tab=settings" className="gap-2 flex items-center w-full" onClick={e => handleNav("/profile?tab=settings", e)}>
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </a>
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
                <Button variant="ghost" size="sm" onClick={() => handleNav("/login")}>Login</Button>
                <Button size="sm" onClick={() => handleNav("/signup")}>Sign Up</Button>
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
              placeholder="Search for users, labs, experiments"
              className="w-full pl-8 bg-secondary border-secondary text-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

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

      {/* Issue Modal (outside header) */}
      {issueModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
              onClick={() => setIssueModalOpen(false)}
              aria-label="Close"
            >
              <span aria-hidden>×</span>
            </button>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="text-yellow-500 h-5 w-5" />
              <h2 className="text-lg font-bold">Report a Bug or Issue</h2>
            </div>
            <form onSubmit={handleIssueSubmit} className="space-y-4">
              <div>
                <label htmlFor="issue-subject" className="block text-sm font-medium mb-1">Subject</label>
                <Input
                  id="issue-subject"
                  value={issueSubject}
                  onChange={e => setIssueSubject(e.target.value)}
                  required
                  maxLength={100}
                  placeholder="Short summary of the issue"
                  disabled={issueLoading}
                />
              </div>
              <div>
                <label htmlFor="issue-description" className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  id="issue-description"
                  value={issueDescription}
                  onChange={e => setIssueDescription(e.target.value)}
                  required
                  maxLength={1000}
                  rows={5}
                  placeholder="Describe the bug or issue in detail..."
                  disabled={issueLoading}
                />
              </div>
              {!user && (
                <div className="text-red-600 text-sm">You must be logged in to submit an issue.</div>
              )}
              {issueSuccess && <div className="text-green-600 text-sm">{issueSuccess}</div>}
              {issueError && <div className="text-red-600 text-sm">{issueError}</div>}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIssueModalOpen(false)} disabled={issueLoading}>Cancel</Button>
                <Button type="submit" className="bg-yellow-400 text-black hover:bg-yellow-300" disabled={issueLoading || !user}>
                  {issueLoading ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
