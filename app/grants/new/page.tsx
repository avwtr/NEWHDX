"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Plus, X, DollarSign, FileText, Tag, HelpCircle, Clock, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function NewGrantPage() {
  const router = useRouter()

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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      alert("Please fill out all required fields. Each question and answer option must have at least 1 character.")
      return
    }

    console.log({
      name,
      amount: Number.parseFloat(amount),
      description,
      deadline: date,
      categories,
      questions,
    })
    alert("Grant created successfully!")
    router.push("/grants")
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

  return (
    <div className="container max-w-4xl py-8 px-4">
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
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g., 25000"
                    className="pl-10 border-muted-foreground/20 focus:border-primary"
                    required
                  />
                </div>
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
            <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
              {categories.map((category) => (
                <Badge
                  key={category}
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                >
                  {category}
                  <button
                    type="button"
                    onClick={() => removeCategory(category)}
                    className="ml-1 h-4 w-4 rounded-full flex items-center justify-center hover:bg-primary/20"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {category}</span>
                  </button>
                </Badge>
              ))}
              {categories.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No categories selected yet</p>
              )}
            </div>

            <div className="flex gap-2">
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g., Neuroscience, Biology, Chemistry"
                className="flex-1 border-muted-foreground/20 focus:border-primary"
              />
              <Button
                type="button"
                onClick={addCategory}
                disabled={!newCategory || categories.length >= 3}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {categories.length}/3 categories selected. Choose categories that best represent your grant's focus area.
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
              <Button type="submit" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Create Grant
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
