"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import {
  DollarSign,
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
  HelpCircle,
  ArrowLeft,
  Users,
  User,
  Building,
  CreditCard,
  AlertCircle,
  LogOut,
  Check,
  CalendarIcon,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"

export default function GrantPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const grantId = (params?.id ?? "") as string;
  const { user, signOut } = useAuth()
  const [currentStep, setCurrentStep] = useState<"userConfirmation" | "questions">("userConfirmation")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [selectedLab, setSelectedLab] = useState<string>("")
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [grant, setGrant] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Mock user data - in a real app, this would come from your auth context
  const userData = {
    name: user?.user_metadata?.first_name
      ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ""}`
      : user?.email?.split("@")[0] || "User",
    avatar: user?.user_metadata?.avatar_url || "",
    initials: (() => {
      if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
        return `${user.user_metadata.first_name[0]}${user.user_metadata.last_name[0]}`.toUpperCase()
      } else if (user?.user_metadata?.first_name) {
        return user.user_metadata.first_name[0].toUpperCase()
      } else if (user?.email) {
        return user.email[0].toUpperCase()
      }
      return "U"
    })(),
    email: user?.email || "user@example.com",
    // Mock bank account data - in a real app, this would be fetched from your database
    bankAccount: {
      exists: false,
      last4: "••••",
      kycVerified: false,
    },
    // Mock labs data - in a real app, this would be fetched from your database
    labs: [
      { id: "lab1", name: "Neuroscience Research Lab" },
      { id: "lab2", name: "Cognitive Science Lab" },
      { id: "lab3", name: "Computational Biology Lab" },
    ],
  }

  useEffect(() => {
    if (!grantId) return;
    const fetchGrant = async () => {
      setLoading(true)
      const { data: grant, error: grantError } = await supabase
        .from("grants")
        .select("*")
        .eq("grant_id", grantId)
        .single()
      setGrant(grant)
      setLoading(false)
    }
    fetchGrant()
  }, [grantId])

  // Markdown-like description renderer
  const renderDescription = (text: string) => {
    if (!text) return null;
    return text.split("\n\n").map((paragraph, i) => {
      if (paragraph.startsWith("## ")) {
        return (
          <h2 key={i} className="text-xl font-bold mt-6 mb-3">
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
      return (
        <p key={i} className="my-3">
          {paragraph}
        </p>
      )
    })
  }

  if (loading) {
    return <div className="container py-8 max-w-4xl text-center">Loading grant…</div>
  }
  if (!grant) {
    return <div className="container py-8 max-w-4xl text-center text-destructive">Grant not found.</div>
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < grant.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  // Map questions from Supabase to expected structure
  type GrantQuestion = {
    id: number;
    question_text: string;
    question_type: string;
    options?: string[];
    character_limit?: number;
  };
  const questions = (grant.questions || []).map((q: GrantQuestion) => ({
    id: q.id,
    text: q.question_text,
    type: q.question_type,
    options: q.options || [],
    characterLimit: q.character_limit || 500,
  }))

  // Use mapped questions throughout
  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const isFirstQuestion = currentQuestionIndex === 0

  // Update answer logic to use mapped questions
  const handleAnswerChange = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value,
    })
    if (currentQuestion.type === "shortAnswer") {
      const words = value.trim() ? value.trim().split(/\s+/).length : 0
      setWordCount(words)
    }
  }

  const handleSubmit = () => {
    const allAnswered = questions.every((q: { id: number }) => answers[q.id])
    if (!allAnswered) {
      alert("Please answer all questions before submitting.")
      return
    }
    setSubmitted(true)
  }

  const handleContinueToQuestions = () => {
    setCurrentStep("questions")
  }

  const handleSwitchAccount = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = async () => {
    await signOut()
    router.push("/login")
  }

  useEffect(() => {
    const currentAnswer = answers[currentQuestion?.id] || ""
    if (currentQuestion?.type === "shortAnswer") {
      const words = currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0
      setWordCount(words)
    }
  }, [currentQuestionIndex, answers])

  return (
    <div className="container max-w-4xl py-8 px-4">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}> 
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Grant Details Section */}
      <Card className="mb-8">
        <CardHeader className="bg-muted/50 pb-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <CardTitle className="text-2xl">{grant.grant_name}</CardTitle>
              <CardDescription className="mt-2">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center text-sm">
                    <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="font-medium">${grant.grant_amount?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>Deadline: {grant.deadline ? new Date(grant.deadline).toLocaleDateString() : "N/A"}</span>
                  </div>
                </div>
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {grant.grant_categories?.map((category: string) => (
                <Badge
                  key={category}
                  className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="prose prose-sm dark:prose-invert max-w-none">{renderDescription(grant.grant_description)}</div>
        </CardContent>
      </Card>

      {/* Apply Button */}
      <div className="flex justify-center">
        <Button 
          size="lg" 
          className="px-8 py-6 text-lg"
          onClick={() => router.push(`/grants/view/${grantId}/apply`)}
        >
          Apply for this Grant
        </Button>
      </div>
    </div>
  )
}
