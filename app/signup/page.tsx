"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { X, Search, Check } from "lucide-react"
import { signUp } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { researchAreas } from "@/lib/research-areas"

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [interestsError, setInterestsError] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  // Filter research areas based on search term
  const filteredAreas = searchTerm
    ? researchAreas.filter((area) => area.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : researchAreas

  // Handle clicking outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isDropdownOpen])

  // Handle form input changes
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))

    // Clear password error when user types
    if (id === "password" || id === "confirmPassword") {
      setPasswordError("")
    }
  }

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validate form
    let isValid = true

    // Validate interests
    if (selectedInterests.length === 0) {
      setInterestsError("Please select at least one research interest")
      isValid = false
    }

    // Validate password
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match")
      isValid = false
    }

    if (!isValid) return

    // Form is valid, proceed with submission
    setIsSubmitting(true)

    try {
      const { user, session, error } = await signUp({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        researchInterests: selectedInterests,
      })

      if (error) {
        toast({
          title: "Error creating account",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Welcome to HDX!",
          description: "Your account has been created successfully.",
        })

        // If email confirmation is not required, redirect to explore
        if (session) {
          router.push("/explore")
        } else {
          router.push("/login")
        }
      }
    } catch (error) {
      console.error("Signup error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle selecting/deselecting an interest
  function handleInterestClick(value: string) {
    setSelectedInterests((prev) => {
      const newInterests = prev.includes(value) ? prev.filter((interest) => interest !== value) : [...prev, value]

      // Clear error if at least one interest is selected
      if (interestsError && newInterests.length > 0) {
        setInterestsError("")
      }

      return newInterests
    })
  }

  // Handle removing an interest from the selected list
  function handleRemoveInterest(e: React.MouseEvent, value: string) {
    e.preventDefault() // Prevent form submission
    e.stopPropagation() // Prevent event bubbling

    setSelectedInterests((prev) => prev.filter((interest) => interest !== value))
  }

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
              <CardDescription>Join Virtual Lab to start your research journey</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="researcher@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={formData.password} onChange={handleInputChange} required />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters long and include a number and special character
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  {passwordError && <span className="text-xs text-destructive">{passwordError}</span>}
                </div>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Research Interests</Label>
                  {interestsError && <span className="text-xs text-destructive">{interestsError}</span>}
                </div>

                <div className="relative" ref={dropdownRef}>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                  >
                    {selectedInterests.length > 0
                      ? `${selectedInterests.length} selected`
                      : "Select research interests..."}
                  </Button>

                  {isDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
                      <div className="flex items-center border-b p-2">
                        <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                        <Input
                          placeholder="Search research areas..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>

                      <div className="max-h-60 overflow-y-auto p-1">
                        {filteredAreas.length === 0 ? (
                          <div className="py-2 px-3 text-sm text-muted-foreground">No research areas found</div>
                        ) : (
                          filteredAreas.map((area) => {
                            const isSelected = selectedInterests.includes(area.value)
                            return (
                              <div
                                key={area.value}
                                className={`flex items-center px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                                  isSelected ? "bg-accent/50" : ""
                                }`}
                                onClick={() => handleInterestClick(area.value)}
                              >
                                <div className="mr-2 h-4 w-4 flex items-center justify-center border rounded">
                                  {isSelected && <Check className="h-3 w-3" />}
                                </div>
                                {area.label}
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {selectedInterests.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedInterests.map((interest) => {
                      const area = researchAreas.find((a) => a.value === interest)
                      return (
                        <Badge key={interest} variant="secondary" className="flex items-center gap-1">
                          {area?.label}
                          <button
                            type="button"
                            className="h-4 w-4 p-0 hover:bg-transparent rounded-full flex items-center justify-center"
                            onClick={(e) => handleRemoveInterest(e, interest)}
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove {area?.label}</span>
                          </button>
                        </Badge>
                      )
                    })}
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-1">
                  Select at least one research interest ({selectedInterests.length} selected)
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="terms" required />
                <Label htmlFor="terms" className="text-sm font-normal">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    terms of service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    privacy policy
                  </Link>
                </Label>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
