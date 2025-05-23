"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Plus, X, DollarSign, FileText, Tag, HelpCircle, Clock, CheckCircle2, Check, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from 'uuid'
import { useAuth } from '@/components/auth-provider'
import { researchAreas } from "@/lib/research-areas"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingAnimation } from "@/components/loading-animation"

export default function NewGrantPage() {
  const router = useRouter()
  const { user } = useAuth()

  // Form state - all initialized as empty
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState<Date>()

  // Categories - initialized as empty array
  const [categories, setCategories] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState("")

  // Questions - initialized as empty array
  const [questions, setQuestions] = useState<
    {
      id: number
      text: string
      type: string
      options?: string[]
      characterLimit?: number
    }[]
  >([])

  // Grant creation loading and success animation
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)

  // Add a category
  const addCategory = () => {
    if (newCategory && categories.length < 3) {
      setCategories([...categories, newCategory])
      setNewCategory("")
    }
  }

  // Remove a category
  const removeCategory = (category: string) => {
    setCategories(categories.filter((c) => c !== category))
  }

  // Add a short answer question
  const addShortQuestion = () => {
    if (questions.length < 5) {
      setQuestions([
        ...questions,
        {
          id: Date.now(),
          text: "",
          type: "shortAnswer",
          characterLimit: 500,
        },
      ])
    }
  }

  // Add a multiple choice question
  const addMultipleChoiceQuestion = () => {
    if (questions.length < 5) {
      setQuestions([
        ...questions,
        {
          id: Date.now(),
          text: "",
          type: "multipleChoice",
          options: ["", "", ""],
        },
      ])
    }
  }

  // Update question text
  const updateQuestionText = (id: number, text: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, text } : q)))
  }

  // Update option text
  const updateOptionText = (questionId: number, optionIndex: number, text: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.options) {
          const newOptions = [...q.options]
          newOptions[optionIndex] = text
          return { ...q, options: newOptions }
        }
        return q
      }),
    )
  }

  // Update character limit for short answer questions
  const updateCharacterLimit = (id: number, limit: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === id && q.type === "shortAnswer") {
          return { ...q, characterLimit: limit }
        }
        return q
      }),
    )
  }

  // Remove a question
  const removeQuestion = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  // Validate the form
  const validateForm = () => {
    // Check basic fields
    if (!name || !amount || !date || !description || categories.length === 0) {
      return false
    }

    // Check questions
    if (questions.length === 0) {
      return false
    }

    // Check each question has text
    for (const question of questions) {
      if (!question.text.trim()) {
        return false
      }

      // Check multiple choice options
      if (question.type === "multipleChoice" && question.options) {
        for (const option of question.options) {
          if (!option.trim()) {
            return false
          }
        }
      }
    }

    return true
  }

  // Handle form submission
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (!validateForm()) {
        alert("Please fill out all required fields. Each question and answer option must have at least 1 character.")
        return
      }

      // Generate a UUID for this grant
      const newGrantId = uuidv4();

      // Insert grant into Supabase
      const { data: grant, error: grantError } = await supabase
        .from("grants")
        .insert({
          grant_id: newGrantId,
          grant_name: name,
          grant_description: description,
          grant_amount: Number.parseFloat(amount),
          grant_categories: categories,
          created_at: new Date().toISOString(),
          deadline: date ? date.toISOString() : null,
          org_id: selectedOrg ? selectedOrg.org_id : null,
          created_by: user?.id || null,
        })
        .select()
        .single()

      if (grantError || !grant) {
        setIsSubmitting(false)
        alert("Error creating grant: " + (grantError?.message || "Unknown error"))
        return
      }

      // Insert questions into Supabase
      for (const q of questions) {
        const { error: questionError } = await supabase
          .from("grant_questions")
          .insert({
            question_id: uuidv4(),
            grant_id: newGrantId, // Use the generated UUID
            question_text: q.text,
            question_type: q.type,
            answer_choices: q.options || null,
            character_limit: q.characterLimit !== undefined && q.characterLimit !== null ? parseInt(q.characterLimit as any, 10) : null,
            created_by: user?.id || null,
            created_at: new Date().toISOString(),
          })
        if (questionError) {
          setIsSubmitting(false)
          alert("Error creating question: " + questionError.message)
          return
        }
      }

      setShowSuccessAnimation(true)
      setTimeout(() => {
        setIsSubmitting(false);
        sessionStorage.removeItem("isNavigatingToCreateOrg");
        sessionStorage.removeItem("isNavigatingToCreateGrant");
        sessionStorage.removeItem("isNavigatingToLanding");
        sessionStorage.removeItem("isNavigatingToProfile");
        sessionStorage.removeItem("isNavigatingToCreateLab");
        router.push(`/grants/review/${newGrantId}`)
      }, 1800)
    } catch (error) {
      setIsSubmitting(false)
      alert("Failed to create grant. Please try again.")
    }
  }

  // Get progress percentage
  const getProgress = () => {
    let total = 4 // name, amount, date, description
    let completed = 0

    if (name) completed++
    if (amount) completed++
    if (date) completed++
    if (description) completed++

    // Categories
    total += 1
    if (categories.length > 0) completed++

    // Questions
    total += 1
    if (questions.length > 0) {
      let allQuestionsValid = true
      for (const q of questions) {
        if (!q.text) {
          allQuestionsValid = false
          break
        }
        if (q.type === "multipleChoice" && q.options) {
          for (const opt of q.options) {
            if (!opt) {
              allQuestionsValid = false
              break
            }
          }
        }
      }
      if (allQuestionsValid) completed++
    }

    return Math.round((completed / total) * 100)
  }

  // Fetch user's organizations
  const [organizations, setOrganizations] = useState<any[]>([])
  const [selectedOrg, setSelectedOrg] = useState<{ org_id: string; org_name: string; profilePic?: string } | null>(null)

  useEffect(() => {
    const fetchOrganizations = async () => {
      if (!user) return
      // Fetch orgs where the current user is the creator
      const { data: orgs, error: orgsError } = await supabase
        .from("organizations")
        .select("org_id, org_name")
        .eq("created_by", user.id)
      if (!orgsError && orgs) {
        setOrganizations(orgs)
      }
    }
    fetchOrganizations()
  }, [user])

  // Handle category selection
  const handleCategoryClick = (value: string) => {
    setCategories((prev) => {
      const newCategories = prev.includes(value) 
        ? prev.filter((category) => category !== value)
        : prev.length < 3 
          ? [...prev, value]
          : prev
      return newCategories
    })
  }

  // Handle removing a category
  const handleRemoveCategory = (e: React.MouseEvent, value: string) => {
    e.preventDefault()
    e.stopPropagation()
    setCategories((prev) => prev.filter((category) => category !== value))
  }

  // --- Science categories dropdown logic (like create-lab) ---
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false)
  const [categorySearchTerm, setCategorySearchTerm] = useState("")
  const filteredAreas = categorySearchTerm
    ? researchAreas.filter((area) => area.label.toLowerCase().includes(categorySearchTerm.toLowerCase()))
    : researchAreas

  // --- Organization search and selection logic (like create-lab) ---
  const [orgSearch, setOrgSearch] = useState("")
  const [orgOptions, setOrgOptions] = useState<{ org_id: string; org_name: string; profilePic?: string }[]>([])
  const [orgSearchLoading, setOrgSearchLoading] = useState(false)
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false)

  useEffect(() => {
    if (orgSearch.length < 1) {
      setOrgOptions([])
      return
    }
    setOrgSearchLoading(true)
    supabase
      .from("organizations")
      .select("org_id, org_name, profilePic")
      .ilike("org_name", `%${orgSearch}%`)
      .limit(10)
      .then(({ data, error }) => {
        if (!error && data) setOrgOptions(data)
        setOrgSearchLoading(false)
      })
  }, [orgSearch])

  useEffect(() => {
    sessionStorage.removeItem("isNavigatingToCreateOrg");
    sessionStorage.removeItem("isNavigatingToCreateGrant");
    sessionStorage.removeItem("isNavigatingToLanding");
    sessionStorage.removeItem("isNavigatingToProfile");
    sessionStorage.removeItem("isNavigatingToCreateLab");
  }, []);

  return (
    <div className="container max-w-4xl py-8 px-4">
      {(isLoading || isSubmitting) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <LoadingAnimation />
        </div>
      )}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Create New Grant</h1>
        <p className="text-muted-foreground">Set up your grant details and application questions</p>
      </div>

      <div className="w-full bg-muted h-2 rounded-full mb-8">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${getProgress()}%` }}
        ></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader className="bg-muted/50">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Enter the fundamental details about your grant</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Grant Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Neuroscience Research Fellowship"
                  className="border-muted-foreground/20 focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">
                  Grant Amount <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      const value = Math.min(Number(e.target.value), 5000);
                      setAmount(value.toString());
                    }}
                    placeholder="e.g., 5000"
                    className="pl-10 border-muted-foreground/20 focus:border-primary"
                    min="0"
                    max="5000"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Maximum grant amount is $5,000. This is a micro-grant platform.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Application Deadline <span className="text-destructive">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left border-muted-foreground/20 ${!date ? "text-muted-foreground" : ""}`}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {date ? format(date, "MMMM d, yyyy") : "Select a deadline date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Grant Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the grant purpose, eligibility criteria, and other details..."
                className="min-h-[150px] border-muted-foreground/20 focus:border-primary"
                required
              />
              <p className="text-xs text-muted-foreground">
                Provide a clear description of your grant, including its purpose, eligibility requirements, and any
                other relevant details.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Associated Organization */}
        <Card>
          <CardHeader className="bg-muted/50">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Associate with Organization (optional)
            </CardTitle>
            <CardDescription>Search and select an organization to associate with this grant</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-search">Organization</Label>
              <div className="relative">
                <Input
                  id="org-search"
                  placeholder="Search organizations by name..."
                  value={selectedOrg ? selectedOrg.org_name : orgSearch}
                  onChange={e => {
                    setSelectedOrg(null)
                    setOrgSearch(e.target.value)
                    setOrgDropdownOpen(true)
                  }}
                  onFocus={() => setOrgDropdownOpen(true)}
                  autoComplete="off"
                />
                {orgDropdownOpen && (orgSearch.length > 0 || orgOptions.length > 0) && (
                  <div className="absolute z-20 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-auto">
                    {orgSearchLoading && (
                      <div className="p-2 text-center text-muted-foreground">Searching...</div>
                    )}
                    {!orgSearchLoading && orgOptions.length === 0 && orgSearch.length > 0 && (
                      <div className="p-2 text-center text-muted-foreground">No organizations found</div>
                    )}
                    {!orgSearchLoading && orgOptions.map(org => (
                      <div
                        key={org.org_id}
                        className="p-2 hover:bg-accent cursor-pointer flex items-center gap-2"
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => {
                          setSelectedOrg(org)
                          setOrgSearch(org.org_name)
                          setOrgDropdownOpen(false)
                        }}
                      >
                        <img src={org.profilePic || "/placeholder.svg"} alt={org.org_name} className="h-6 w-6 rounded-full object-cover border" />
                        <span className="truncate">{org.org_name}</span>
                      </div>
                    ))}
                    {selectedOrg && (
                      <div className="p-2 text-xs text-muted-foreground border-t flex items-center gap-2">
                        <img src={selectedOrg.profilePic || "/placeholder.svg"} alt={selectedOrg.org_name} className="h-4 w-4 rounded-full object-cover border" />
                        <span>Selected: {selectedOrg.org_name}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {selectedOrg && (
                <div className="flex items-center gap-2 mt-1">
                  <img src={selectedOrg.profilePic || "/placeholder.svg"} alt={selectedOrg.org_name} className="h-4 w-4 rounded-full object-cover border" />
                  <span className="text-xs text-muted-foreground">Selected: {selectedOrg.org_name}</span>
                  <Button size="sm" variant="ghost" onClick={() => { setSelectedOrg(null); setOrgSearch(""); }}>
                    Remove
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader className="bg-muted/50">
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Science Categories
            </CardTitle>
            <CardDescription>Select up to 3 scientific fields relevant to your grant</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between"
                onClick={() => setIsCategoryDropdownOpen((prev) => !prev)}
              >
                {categories.length > 0
                  ? `${categories.length} selected`
                  : "Select science categories..."}
              </Button>

              {isCategoryDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
                  <div className="flex items-center border-b p-2">
                    <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                    <Input
                      placeholder="Search science categories..."
                      value={categorySearchTerm}
                      onChange={(e) => setCategorySearchTerm(e.target.value)}
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>

                  <div className="max-h-60 overflow-y-auto p-1">
                    {filteredAreas.length === 0 ? (
                      <div className="py-2 px-3 text-sm text-muted-foreground">No categories found</div>
                    ) : (
                      filteredAreas.map((area) => {
                        const isSelected = categories.includes(area.value)
                        return (
                          <div
                            key={area.value}
                            className={`flex items-center px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                              isSelected ? "bg-accent/50" : ""
                            }`}
                            onClick={() => handleCategoryClick(area.value)}
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

            {categories.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {categories.map((category) => {
                  const area = researchAreas.find((a) => a.value === category)
                  return (
                    <Badge key={category} variant="secondary" className="flex items-center gap-1">
                      {area?.label}
                      <button
                        type="button"
                        className="h-4 w-4 p-0 hover:bg-transparent rounded-full flex items-center justify-center"
                        onClick={(e) => handleRemoveCategory(e, category)}
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
              Select up to 3 science categories ({categories.length}/3 selected)
            </p>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader className="bg-muted/50">
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Application Questions
            </CardTitle>
            <CardDescription>Create up to 5 questions for grant applicants to answer</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Add Question Buttons - at the top */}
            {questions.length < 5 && (
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-primary/30 hover:border-primary hover:bg-primary/5"
                  onClick={addShortQuestion}
                >
                  <Plus className="h-4 w-4 mr-2 text-primary" />
                  Add Short Answer Question
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-primary/30 hover:border-primary hover:bg-primary/5"
                  onClick={addMultipleChoiceQuestion}
                >
                  <Plus className="h-4 w-4 mr-2 text-primary" />
                  Add Multiple Choice Question
                </Button>
              </div>
            )}

            {questions.length > 0 ? (
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <Card key={question.id} className="border-muted-foreground/20 overflow-hidden">
                    <div className="bg-muted/30 px-4 py-3 flex justify-between items-center border-b">
                      <h3 className="font-medium flex items-center">
                        <span className="bg-primary/10 text-primary font-semibold rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">
                          {index + 1}
                        </span>
                        {question.type === "shortAnswer" ? "Short Answer" : "Multiple Choice"}
                      </h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(question.id)}
                        className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove question</span>
                      </Button>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`question-${question.id}`} className="text-sm font-medium">
                          Question Text <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id={`question-${question.id}`}
                          value={question.text}
                          onChange={(e) => updateQuestionText(question.id, e.target.value)}
                          placeholder="Enter your question here..."
                          className="border-muted-foreground/20 focus:border-primary"
                          required
                          minLength={1}
                        />
                      </div>

                      {question.type === "shortAnswer" && (
                        <div className="space-y-2">
                          <Label htmlFor={`limit-${question.id}`} className="text-sm font-medium">
                            Character Limit
                          </Label>
                          <div className="flex items-center gap-2 max-w-xs">
                            <Input
                              id={`limit-${question.id}`}
                              type="number"
                              value={question.characterLimit}
                              onChange={(e) =>
                                updateCharacterLimit(question.id, Number.parseInt(e.target.value) || 500)
                              }
                              min={1}
                              max={10000}
                              className="border-muted-foreground/20 focus:border-primary"
                            />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">words</span>
                          </div>
                          <div className="bg-muted/30 p-3 rounded-md mt-2">
                            <p className="text-xs text-muted-foreground">
                              Preview: Applicants will see a text area with a {question.characterLimit} word limit
                            </p>
                          </div>
                        </div>
                      )}

                      {question.type === "multipleChoice" && question.options && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">
                            Answer Options <span className="text-destructive">*</span>
                          </Label>
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-3 mt-1">
                              <div className="h-5 w-5 rounded-full border-2 border-primary flex-shrink-0"></div>
                              <Input
                                value={option}
                                onChange={(e) => updateOptionText(question.id, optionIndex, e.target.value)}
                                placeholder={`Option ${optionIndex + 1}`}
                                className="border-muted-foreground/20 focus:border-primary"
                                required
                                minLength={1}
                              />
                            </div>
                          ))}
                          <div className="bg-muted/30 p-3 rounded-md mt-2">
                            <p className="text-xs text-muted-foreground">
                              Preview: Applicants will select one of these three options
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border-2 border-dashed rounded-md border-muted-foreground/20">
                <HelpCircle className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No questions added yet. Click one of the buttons above to add a question.
                </p>
              </div>
            )}

            <div className="bg-muted/30 p-4 rounded-md">
              <p className="text-sm flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="font-medium">{questions.length}/5</strong> questions added.
                  {questions.length < 5
                    ? " You can add up to 5 questions for applicants to answer."
                    : " You've reached the maximum number of questions."}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" className="gap-2" disabled={!name || !description || !amount || !date || categories.length === 0 || isSubmitting}>
                {isSubmitting ? "Creating..." : <CheckCircle2 className="h-4 w-4" />}
                Create Grant
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Grant creation loading/success animation overlay */}
      {(showSuccessAnimation) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col items-center animate-fade-in min-w-[320px]">
            <div className="mb-4">
              {/* Checkmark animation */}
              <svg className="w-16 h-16 text-green-500 animate-pop-in" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="4" fill="none" className="animate-circular-stroke" />
                <path d="M20 34L29 43L44 25" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="animate-checkmark" />
              </svg>
            </div>
            <div className="text-lg font-semibold text-accent text-center">
              "Grant created successfully!"
            </div>
            <div className="text-sm text-muted-foreground text-center mt-1">Redirecting…</div>
          </div>
          <style jsx global>{`
            @keyframes fade-in {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .animate-fade-in {
              animation: fade-in 0.3s ease;
            }
            @keyframes pop-in {
              0% { transform: scale(0.5); opacity: 0; }
              80% { transform: scale(1.1); opacity: 1; }
              100% { transform: scale(1); opacity: 1; }
            }
            .animate-pop-in {
              animation: pop-in 0.5s cubic-bezier(0.22, 1, 0.36, 1);
            }
            @keyframes circular-stroke {
              0% { stroke-dasharray: 0 188.4; }
              100% { stroke-dasharray: 188.4 0; }
            }
            .animate-circular-stroke {
              stroke-dasharray: 188.4 0;
              stroke-dashoffset: 0;
              animation: circular-stroke 0.7s ease-out;
            }
            @keyframes checkmark {
              0% { stroke-dasharray: 0 36; }
              100% { stroke-dasharray: 36 0; }
            }
            .animate-checkmark {
              stroke-dasharray: 36 0;
              stroke-dashoffset: 0;
              animation: checkmark 0.4s 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }
          `}</style>
        </div>
      )}
    </div>
  )
}
