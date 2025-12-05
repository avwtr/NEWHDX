"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import {
  Search,
  Plus,
  LogOut,
  User,
  HelpCircle,
  Globe,
  ShoppingBag,
  FileText,
  Building2,
  Award,
  Settings,
  AlertCircle,
  FlaskConical,
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
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth-provider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"

export function GlobalHeader() {
  const router = useRouter()
  const pathname = usePathname()

  // Don't render header on landing page
  if (pathname === "/" || pathname === "/landing") {
    return null
  }

  const [searchQuery, setSearchQuery] = useState("")
  const { user, signOut, isLoading } = useAuth()
  const [issueModalOpen, setIssueModalOpen] = useState(false)
  const [issueSubject, setIssueSubject] = useState("")
  const [issueDescription, setIssueDescription] = useState("")
  const [issueLoading, setIssueLoading] = useState(false)
  const [issueSuccess, setIssueSuccess] = useState<string | null>(null)
  const [issueError, setIssueError] = useState<string | null>(null)

  // Search state
  const [searchResults, setSearchResults] = useState<any>({ users: [], labs: [], grants: [], experiments: [], orgs: [] })
  const [searchLoading, setSearchLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const searchTimeout = useRef<any>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  // Handle navigation
  const handleNav = (href: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault()
    router.push(href)
  }

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
        supabase.from("profiles").select("user_id, username, avatar_url, research_interests").ilike("username", `%${searchQuery}%`).limit(5),
        supabase.from("labs").select("labId, labName, description").ilike("labName", `%${searchQuery}%`).or("public_private.is.null,public_private.eq.public").limit(5),
        supabase.from("grants").select("id, title, description").ilike("title", `%${searchQuery}%`).limit(5),
        supabase.from("experiments").select("id, name, objective, lab_id").ilike("name", `%${searchQuery}%`).limit(5),
        supabase.from("organizations").select("org_id, org_name, description, profilePic, slug").ilike("org_name", `%${searchQuery}%`).limit(5),
      ])
      
      // Filter out experiments from private labs
      let filteredExperiments = experiments || []
      if (experiments && experiments.length > 0) {
        const experimentLabIds = [...new Set(experiments.map((e: any) => e.lab_id).filter(Boolean))]
        if (experimentLabIds.length > 0) {
          const { data: experimentLabs } = await supabase
            .from("labs")
            .select("labId, public_private")
            .in("labId", experimentLabIds)
          
          const privateLabIds = new Set(
            (experimentLabs || [])
              .filter((lab: any) => lab.public_private === 'private')
              .map((lab: any) => lab.labId)
          )
          
          filteredExperiments = experiments.filter((exp: any) => !privateLabIds.has(exp.lab_id))
        }
      }
      
      let labsWithCategories = labs || []
      if (labs && labs.length > 0) {
        const labIds = labs.map((lab: any) => lab.labId)
        const { data: labCategories } = await supabase
          .from("labCategories")
          .select("lab_id, category")
          .in("lab_id", labIds)
        labsWithCategories = labs.map((lab: any) => ({
          ...lab,
          categories: (labCategories || [])
            .filter((cat: any) => cat.lab_id === lab.labId)
            .map((cat: any) => cat.category)
        }))
      }
      if (labsError) {
        console.error("Labs search error:", labsError)
      }
      setSearchResults({
        users: users || [],
        labs: labsWithCategories,
        grants: grants || [],
        experiments: filteredExperiments || [],
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
      // Use click instead of mousedown to allow link clicks to register first
      document.addEventListener("click", handleClick, true)
      return () => document.removeEventListener("click", handleClick, true)
    }
  }, [showDropdown])

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

  // Check if current page is explore
  const isExplorePage = pathname === "/explore"

  return (
    <>
      {/* Top Center Testing Badge and Report Link */}
      <div className="w-full flex justify-center items-center pt-2 pb-1">
        <div className="flex items-center gap-3">
          <span className="bg-yellow-400 text-black rounded-full px-3 py-1 text-xs font-semibold tracking-wide shadow border border-yellow-300 font-fell italic">(IN TESTING)</span>
          <button
            className="text-xs text-blue-700 underline font-medium hover:text-blue-900 focus:outline-none font-fell italic"
            onClick={() => setIssueModalOpen(true)}
            type="button"
          >
            Report a bug or issue
          </button>
        </div>
      </div>
      
      {/* Main Header */}
      <header className="w-full bg-background/95 backdrop-blur-sm border-b border-secondary sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-8 py-4">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <img 
                src="/mainlogo.png" 
                alt="HDX" 
                className="h-11 w-auto object-contain"
              />
            </Link>

            {/* Search Bar */}
            <div className="relative hidden md:block" ref={searchRef}>
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8AFFD4]" />
              <input
                type="text"
                placeholder="Try 'suggestion'"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowDropdown(true)}
                className="w-[300px] lg:w-[400px] pl-11 pr-4 py-2.5 bg-[#0a0f1f] border-0 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:bg-[#070D2C] transition-all duration-300 font-fell italic text-sm"
              />
              {/* Search Results Dropdown */}
              {showDropdown && (
                <div 
                  className="absolute left-0 mt-2 w-full bg-background border border-secondary rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
                  onClick={(e) => e.stopPropagation()} // Prevent click from bubbling up
                >
                  {searchLoading ? (
                    <div className="p-4 text-center text-muted-foreground font-fell italic">Searching...</div>
                  ) : (
                    <>
                      {searchResults.users.length === 0 && searchResults.labs.length === 0 && searchResults.grants.length === 0 && searchResults.experiments.length === 0 && searchResults.orgs.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground font-fell italic">No results found.</div>
                      ) : (
                        <>
                          {/* Users */}
                          {searchResults.users.length > 0 && (
                            <div>
                              <div className="px-4 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase font-fell italic">Users</div>
                              <div className="border-t border-secondary/50 my-1" />
                              {searchResults.users.map((user: any) => (
                                <Link 
                                  key={user.user_id} 
                                  href={`/profile/${user.username}`} 
                                  className="flex flex-col gap-1 px-4 py-2 hover:bg-secondary/50"
                                  onClick={() => setShowDropdown(false)}
                                >
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-7 w-7">
                                      <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.username} />
                                      <AvatarFallback>{(user.username || "U").charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium font-fell italic">{user.username}</span>
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
                              <div className="px-4 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase font-fell italic">Labs</div>
                              <div className="border-t border-secondary/50 my-1" />
                              {searchResults.labs.map((lab: any) => (
                                <Link 
                                  key={lab.labId} 
                                  href={`/lab/${lab.labId}`} 
                                  className="block px-4 py-2 hover:bg-secondary/50"
                                  onClick={() => setShowDropdown(false)}
                                >
                                  <span className="font-medium font-fell italic">{lab.labName}</span>
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
                              <div className="px-4 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase font-fell italic">Grants</div>
                              <div className="border-t border-secondary/50 my-1" />
                              {searchResults.grants.map((grant: any) => (
                                <Link 
                                  key={grant.id} 
                                  href={`/grants/${grant.id}`} 
                                  className="block px-4 py-2 hover:bg-secondary/50"
                                  onClick={() => setShowDropdown(false)}
                                >
                                  <span className="font-medium font-fell italic">{grant.title}</span>
                                  <span className="block text-xs text-muted-foreground">{grant.description}</span>
                                </Link>
                              ))}
                            </div>
                          )}
                          {/* Organizations */}
                          {searchResults.orgs && searchResults.orgs.length > 0 && (
                            <div>
                              <div className="px-4 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase font-fell italic">Organizations</div>
                              <div className="border-t border-secondary/50 my-1" />
                              {searchResults.orgs.map((org: any) => (
                                <Link 
                                  key={org.org_id} 
                                  href={`/orgs/${org.slug || org.org_id}`} 
                                  className="flex items-center gap-3 px-4 py-2 hover:bg-secondary/50"
                                  onClick={() => setShowDropdown(false)}
                                >
                                  <Avatar className="h-7 w-7">
                                    <AvatarImage src={org.profilePic || "/placeholder.svg"} alt={org.org_name} />
                                    <AvatarFallback>{(org.org_name || "O").charAt(0).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <span className="font-medium font-fell italic">{org.org_name}</span>
                                    <div className="block text-xs text-muted-foreground">{org.description}</div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                          {/* Experiments */}
                          {searchResults.experiments.length > 0 && (
                            <div>
                              <div className="px-4 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase font-fell italic">Experiments</div>
                              <div className="border-t border-secondary/50 my-1" />
                              {searchResults.experiments.map((exp: any) => (
                                <Link 
                                  key={exp.id} 
                                  href={`/newexperiments/${exp.id}`} 
                                  className="block px-4 py-2 hover:bg-secondary/50"
                                  onClick={() => setShowDropdown(false)}
                                >
                                  <span className="font-medium font-fell italic">{exp.name}</span>
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
            <button
              onClick={() => router.push("/explore")}
              className={`flex items-center space-x-2.5 transition-colors font-fell italic text-sm ${
                isExplorePage 
                  ? 'text-[#A0FFDD]' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Search className="h-5 w-5" />
              <span>Explore</span>
            </button>

            {/* Launch Experiment Engine Button */}
            <Button
              onClick={() => window.open('https://experimentengine.ai', '_blank')}
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-[#0a0f1f]/50 transition-all duration-200 font-fell italic text-sm px-4 py-2 normal-case"
            >
              <FlaskConical className="h-5 w-5" />
              <span>Launch Experiment Engine</span>
            </Button>

            {/* Create New Dropdown */}
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
                <DropdownMenuLabel className="uppercase text-xs tracking-wide font-fell italic">Create New</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled={!user} className={!user ? "opacity-50 cursor-not-allowed" : ""}>
                  <Link href="/create-lab" className="flex w-full items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="font-fell italic">Lab</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem disabled={!user} className={!user ? "opacity-50 cursor-not-allowed" : ""}>
                  <Link href="/orgCreate" className="flex w-full items-center">
                    <Building2 className="h-4 w-4 mr-2" />
                    <span className="font-fell italic">Organization</span>
                  </Link>
                </DropdownMenuItem>
                {!user && (
                  <div className="px-2 py-1.5 text-xs text-muted-foreground font-fell italic">
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
                  <DropdownMenuLabel className="uppercase text-xs tracking-wide font-fell italic">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="gap-2 flex items-center w-full">
                      <User className="h-4 w-4" />
                      <span className="font-fell italic">Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="https://heterodoxlabs.org" target="_blank" rel="noopener noreferrer" className="gap-2 flex items-center">
                      <FileText className="h-4 w-4" />
                      <span className="font-fell italic">HDX Foundation</span>
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
                      <span className="font-fell italic">HDX Shop</span>
                    </a>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={signOut} className="gap-2">
                    <LogOut className="h-4 w-4" />
                    <span className="font-fell italic">Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => router.push("/login")} className="font-fell italic">Login</Button>
                <Button size="sm" onClick={() => router.push("/signup")} className="font-fell italic">Sign Up</Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        <div className="container py-2 md:hidden">
          <div className="relative" ref={searchRef}>
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8AFFD4]" />
            <input
              type="text"
              placeholder="Try 'suggestion'"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowDropdown(true)}
              className="w-full pl-11 pr-4 py-2.5 bg-[#0a0f1f] border-0 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:bg-[#070D2C] transition-all duration-300 font-fell italic text-sm"
            />
            {/* Show mobile dropdown if needed */}
            {showDropdown && searchQuery && (
              <div 
                className="absolute left-0 mt-2 w-full bg-background border border-secondary rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
                onClick={(e) => e.stopPropagation()} // Prevent click from bubbling up
              >
                {searchLoading ? (
                  <div className="p-4 text-center text-muted-foreground font-fell italic">Searching...</div>
                ) : (
                  <>
                    {searchResults.users.length === 0 && searchResults.labs.length === 0 && searchResults.grants.length === 0 && searchResults.experiments.length === 0 && searchResults.orgs.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground font-fell italic">No results found.</div>
                    ) : (
                      <>
                        {/* Users */}
                        {searchResults.users.length > 0 && (
                          <div>
                            <div className="px-4 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase font-fell italic">Users</div>
                            {searchResults.users.map((user: any) => (
                              <Link key={user.user_id} href={`/profile/${user.username}`} className="flex flex-col gap-1 px-4 py-2 hover:bg-secondary/50">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-7 w-7">
                                    <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.username} />
                                    <AvatarFallback>{(user.username || "U").charAt(0).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium font-fell italic">{user.username}</span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                        {/* Labs */}
                        {searchResults.labs.length > 0 && (
                          <div>
                            <div className="px-4 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase font-fell italic">Labs</div>
                            {searchResults.labs.map((lab: any) => (
                              <Link key={lab.labId} href={`/lab/${lab.labId}`} className="block px-4 py-2 hover:bg-secondary/50">
                                <span className="font-medium font-fell italic">{lab.labName}</span>
                                <span className="block text-xs text-muted-foreground">{lab.description}</span>
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
      </header>

      {/* Issue Modal */}
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
              <h2 className="text-lg font-bold font-fell italic">Report a Bug or Issue</h2>
            </div>
            <form onSubmit={handleIssueSubmit} className="space-y-4">
              <div>
                <label htmlFor="issue-subject" className="block text-sm font-medium mb-1 font-fell italic">Subject</label>
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
                <label htmlFor="issue-description" className="block text-sm font-medium mb-1 font-fell italic">Description</label>
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
                <Button type="button" variant="outline" onClick={() => setIssueModalOpen(false)} disabled={issueLoading} className="font-fell italic">Cancel</Button>
                <Button type="submit" className="bg-yellow-400 text-black hover:bg-yellow-300 font-fell italic" disabled={issueLoading || !user}>
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