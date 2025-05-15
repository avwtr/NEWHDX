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
import { CalendarIcon, Plus, X } from "lucide-react"

export default function CreateGrantPage() {
  const router = useRouter()

  // Form state
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState<Date>()

  // Categories
  const [categories, setCategories] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState("")

  // Questions
  const [questions, setQuestions] = useState<{ id: number; text: string; type: string; options?: string[] }[]>([])
  const [newQuestionText, setNewQuestionText] = useState("")

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
          text: newQuestionText,
          type: "shortAnswer",
        },
      ])
      setNewQuestionText("")
    }
  }

  // Add a multiple choice question
  const addMultipleChoiceQuestion = () => {
    if (questions.length < 5) {
      setQuestions([
        ...questions,
        {
          id: Date.now(),
          text: newQuestionText,
          type: "multipleChoice",
          options: ["", "", ""],
        },
      ])
      setNewQuestionText("")
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

  // Remove a question
  const removeQuestion = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
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

  return (
    <div className="container max-w-3xl py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Grant</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Basic Information</h2>

          <div>
            <Label htmlFor="name">Grant Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter grant name"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="amount">Grant Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Application Deadline</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left mt-1">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="description">Grant Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the grant purpose, eligibility criteria, and other details"
              className="mt-1 min-h-[150px]"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Science Categories (up to 3)</h2>

          <div className="flex flex-wrap gap-2 mb-2">
            {categories.map((category) => (
              <Badge key={category} className="flex items-center gap-1 px-3 py-1">
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
          </div>

          <div className="flex gap-2">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter a category"
              className="flex-1"
            />
            <Button type="button" onClick={addCategory} disabled={!newCategory || categories.length >= 3}>
              Add
            </Button>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Application Questions (up to 5)</h2>

          {questions.length > 0 ? (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="border rounded-md p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">Question {index + 1}</h3>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(question.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div>
                    <Label htmlFor={`question-${question.id}`}>Question Text</Label>
                    <Input
                      id={`question-${question.id}`}
                      value={question.text}
                      onChange={(e) => updateQuestionText(question.id, e.target.value)}
                      placeholder="Enter your question"
                      className="mt-1"
                    />
                  </div>

                  {question.type === "multipleChoice" && question.options && (
                    <div className="space-y-2">
                      <Label>Answer Options</Label>
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2 mt-1">
                          <div className="h-4 w-4 rounded-full border border-primary flex-shrink-0"></div>
                          <Input
                            value={option}
                            onChange={(e) => updateOptionText(question.id, optionIndex, e.target.value)}
                            placeholder={`Option ${optionIndex + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground border rounded-md">No questions added yet</div>
          )}

          {questions.length < 5 && (
            <div className="space-y-3">
              <Input
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="Enter new question text"
              />

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={addShortQuestion}
                  disabled={!newQuestionText}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Short Answer Question
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={addMultipleChoiceQuestion}
                  disabled={!newQuestionText}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Multiple Choice Question
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit">Create Grant</Button>
        </div>
      </form>
    </div>
  )
}
