"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Search, FlaskConical, ChevronDown, User, Settings, LogOut, Building2, Users, Bell, Plus } from "lucide-react"

export function GlobalHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState("")
  const [showPlusDropdown, setShowPlusDropdown] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false)
  
  const searchRef = useRef<HTMLInputElement>(null)
  const plusDropdownRef = useRef<HTMLDivElement>(null)
  const profileDropdownRef = useRef<HTMLDivElement>(null)
  const notificationsDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (plusDropdownRef.current && !plusDropdownRef.current.contains(event.target as Node)) {
        setShowPlusDropdown(false)
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false)
      }
      if (notificationsDropdownRef.current && !notificationsDropdownRef.current.contains(event.target as Node)) {
        setShowNotificationsDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Handle search functionality here
      console.log("Searching for:", searchQuery)
    }
  }

  const handleExperimentEngineClick = () => {
    router.push('/my-experiments')
  }

  const handleExploreClick = () => {
    router.push('/explore')
  }

  const handleCreateNewLab = () => {
    // Handle create new lab functionality
    console.log("Create new lab")
    setShowPlusDropdown(false)
  }

  const handleCreateNewOrganization = () => {
    // Handle create new organization functionality
    console.log("Create new organization")
    setShowPlusDropdown(false)
  }

  const handleProfileSettings = () => {
    // Handle profile settings
    console.log("Profile settings")
    setShowProfileDropdown(false)
  }

  const handleLogout = () => {
    // Handle logout functionality
    console.log("Logout")
    setShowProfileDropdown(false)
  }

  const handleNotificationsClick = () => {
    setShowNotificationsDropdown(!showNotificationsDropdown)
  }

  // Check if current page is explore
  const isExplorePage = pathname === '/explore'

  return (
    <>
      <header className="w-full bg-background/95 backdrop-blur-sm border-b border-[#070D2C] sticky top-0 z-50">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo - Far Left */}
            <div className="flex items-center">
              <button
                onClick={() => router.push('/explore')}
                className="flex items-center hover:opacity-80 transition-opacity"
              >
                <img 
                  src="/mainlogo.png" 
                  alt="HDX" 
                  className="h-11 w-auto object-contain"
                />
              </button>
            </div>

            {/* Search Bar - Center */}
            <div className="flex-1 max-w-md mx-12">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8AFFD4]" />
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Try 'suggestion'"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-[#0a0f1f] border-0 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:bg-[#070D2C] transition-all duration-300 font-fell italic text-sm"
                  />
                </div>
              </form>
            </div>

            {/* Navigation - Right Aligned */}
            <div className="flex items-center space-x-8">
              {/* Explore Tab with Globe Icon */}
              <button
                onClick={handleExploreClick}
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
                onClick={handleExperimentEngineClick}
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-[#0a0f1f]/50 transition-all duration-200 font-fell italic text-sm px-4 py-2 normal-case"
              >
                <FlaskConical className="h-5 w-5" />
                <span>Launch Experiment Engine</span>
              </Button>

              {/* Plus Button with Dropdown */}
              <div className="relative" ref={plusDropdownRef}>
                <button
                  onClick={() => setShowPlusDropdown(!showPlusDropdown)}
                  className="w-10 h-10 flex items-center justify-center hover:opacity-80 transition-all duration-200 rounded-lg hover:bg-[#0a0f1f]/50 group"
                >
                  <Plus className="w-6 h-6 group-hover:brightness-0 group-hover:invert transition-all duration-200" />
                </button>

                {showPlusDropdown && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-1 w-56 bg-[#0a0f1f]/95 backdrop-blur-sm border border-[#070D2C] rounded-lg shadow-xl py-1.5 z-50">
                    <button
                      onClick={handleCreateNewLab}
                      className="w-full px-3 py-2.5 text-left hover:bg-[#070D2C]/50 transition-colors flex items-center space-x-2.5 text-gray-300 hover:text-white font-fell italic text-sm"
                    >
                      <Building2 className="h-3.5 w-3.5" />
                      <span>Create new lab</span>
                    </button>
                    <button
                      onClick={handleCreateNewOrganization}
                      className="w-full px-3 py-2.5 text-left hover:bg-[#070D2C]/50 transition-colors flex items-center space-x-2.5 text-gray-300 hover:text-white font-fell italic text-sm"
                    >
                      <Users className="h-3.5 w-3.5" />
                      <span>Create new organization</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Notifications Icon with Dropdown */}
              <div className="relative" ref={notificationsDropdownRef}>
                <button
                  onClick={handleNotificationsClick}
                  className="w-10 h-10 flex items-center justify-center hover:opacity-80 transition-opacity rounded-lg hover:bg-[#0a0f1f]/50"
                >
                  <Bell className="h-5 w-5 text-gray-300 hover:text-white" />
                </button>

                {showNotificationsDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-80 bg-[#0a0f1f]/95 backdrop-blur-sm border border-[#070D2C] rounded-lg shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-[#070D2C]">
                      <div className="text-sm font-medium text-white font-fell italic">Notifications</div>
                    </div>
                    <div className="px-4 py-3 text-sm text-gray-400 font-fell italic">
                      No new notifications
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Photo Circle with Dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform duration-200"
                  style={{ backgroundColor: '#A0FFDD' }}
                >
                  <User className="h-5 w-5 text-gray-800" />
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-[#0a0f1f]/95 backdrop-blur-sm border border-[#070D2C] rounded-lg shadow-xl py-1.5 z-50">
                    <div className="px-3 py-2 border-b border-[#070D2C]">
                      <div className="text-xs font-medium text-white font-fell italic">Alex Vawter</div>
                      <div className="text-xs text-gray-400 font-fell italic">alex@heterodox.com</div>
                    </div>
                    <button
                      onClick={handleProfileSettings}
                      className="w-full px-3 py-2 text-left hover:bg-[#070D2C]/50 transition-colors flex items-center space-x-2.5 text-gray-300 hover:text-white font-fell italic text-sm"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-3 py-2 text-left hover:bg-[#070D2C]/50 transition-colors flex items-center space-x-2.5 text-gray-300 hover:text-white font-fell italic text-sm"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
