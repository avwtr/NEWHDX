"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, DollarSign, ArrowLeft, FileText } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function GrantDetailPage() {
  const params = useParams();
  const grantId = params.id as string;
  const [grant, setGrant] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showQuestions, setShowQuestions] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!grantId) return;
    const fetchGrantAndQuestions = async () => {
      setLoading(true)
      const { data: grant, error: grantError } = await supabase
        .from("grants")
        .select("*")
        .eq("grant_id", grantId)
        .single()
      if (grant) {
        const { data: questionsData, error: questionsError } = await supabase
          .from("grant_questions")
          .select("*")
          .eq("grant_id", grant.grant_id)
        setQuestions(questionsData || [])
      } else {
        setQuestions([])
      }
      setGrant(grant)
      setLoading(false)
    }
    fetchGrantAndQuestions()
  }, [grantId])

  if (loading) {
    return <div className="container py-8 max-w-4xl text-center">Loading grant…</div>
  }
  if (!grant) {
    return <div className="container py-8 max-w-4xl text-center text-destructive">Grant not found.</div>
  }

  // Map questions to expected structure
  const mappedQuestions = (questions || []).map((q: any) => ({
    id: q.id,
    text: q.question_text,
    type: q.question_type,
    options: q.options || [],
    characterLimit: q.character_limit || 500,
  }))

  // Function to render markdown-like formatting
  const renderDescription = (text: string) => {
    return text.split("\n\n").map((paragraph, i) => {
      if (paragraph.startsWith("## ")) {
        return (
          <h2 key={i} className="text-xl font-bold mt-4 mb-2">
            {paragraph.substring(3)}
          </h2>
        )
      }
      if (paragraph.includes("\n- ")) {
        const [listTitle, ...items] = paragraph.split("\n- ")
        return (
          <div key={i} className="my-3">
            <p className="mb-2">{listTitle}</p>
            <ul className="list-disc pl-5 space-y-1">
              {items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          </div>
        )
      }
      if (paragraph.includes("\n1. ")) {
        const [listTitle, ...items] = paragraph.split("\n")
        return (
          <div key={i} className="my-3">
            <p className="mb-2">{listTitle}</p>
            <ol className="list-decimal pl-5 space-y-1">
              {items.map((item, j) => (
                <li key={j}>{item.substring(3)}</li>
              ))}
            </ol>
          </div>
        )
      }
      if (paragraph.includes("\n* ")) {
        const [listTitle, ...items] = paragraph.split("\n* ")
        return (
          <div key={i} className="my-3">
            <p className="mb-2">{listTitle}</p>
            <ul className="list-disc pl-5 space-y-1">
              {items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          </div>
        )
      }
      let formattedText = paragraph
      formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      formattedText = formattedText.replace(/\*(.*?)\*/g, "<em>$1</em>")
      return <p key={i} className="my-3" dangerouslySetInnerHTML={{ __html: formattedText }} />
    })
  }

  // Handler for answer changes
  const handleAnswerChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  // Handler for form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/grants">
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Grants
          </Button>
        </Link>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{grant.grant_name}</CardTitle>
            <CardDescription>
              <div className="flex flex-wrap gap-4 mt-2">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-1" />
                  <span className="text-lg">${grant.grant_amount?.toLocaleString()}</span>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-1" />
                  <span>Deadline: {grant.deadline ? new Date(grant.deadline).toLocaleDateString() : "N/A"}</span>
                </div>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {grant.grant_categories?.map((category: string) => (
                <Badge key={category} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none">{renderDescription(grant.grant_description)}</div>
          </CardContent>
          <CardFooter>
            {!showQuestions && !submitted && (
              <Button className="w-full" onClick={() => setShowQuestions(true)}>
                Apply for this Grant
              </Button>
            )}
          </CardFooter>
        </Card>
        {showQuestions && !submitted && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Application Questions
              </CardTitle>
              <CardDescription>Your application will need to answer the following questions:</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {mappedQuestions.map((question: any, index: number) => (
                  <div key={question.id} className="border-b pb-4 last:border-0">
                    <h3 className="font-medium mb-2">
                      Question {index + 1}: {question.text}
                    </h3>
                    {question.type === "multipleChoice" && question.options && (
                      <div className="ml-6 mt-2 space-y-2">
                        {question.options.map((option: string, i: number) => (
                          <label key={i} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={option}
                              checked={answers[question.id] === option}
                              onChange={() => handleAnswerChange(question.id, option)}
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    )}
                    {question.type === "shortAnswer" && (
                      <textarea
                        className="w-full border rounded p-2 mt-2"
                        rows={4}
                        value={answers[question.id] || ""}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        placeholder="Type your answer here..."
                        required
                      />
                    )}
                  </div>
                ))}
                <Button type="submit" className="w-full mt-4">
                  Submit Application
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
        {submitted && (
          <Card>
            <CardHeader>
              <CardTitle>Application Submitted!</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center">
                <p className="text-lg mb-4">Thank you for applying to the {grant.grant_name}.</p>
                <p className="text-muted-foreground">We'll review your application and get back to you soon.</p>
                <Button className="mt-6" onClick={() => setShowQuestions(false)}>
                  Back to Grant
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
