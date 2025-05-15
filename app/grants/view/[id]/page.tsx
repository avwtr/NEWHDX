"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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

interface GrantViewPageProps {
  params: {
    id: string
  }
}

export default function GrantViewPage({ params }: GrantViewPageProps) {
  const router = useRouter()
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
    const fetchGrant = async () => {
      setLoading(true)
      const { data: grantData, error } = await supabase
        .from("grants")
        .select("*, questions:grant_questions(*)")
        .eq("grant_id", params.id)
        .single()
      setGrant(grantData)
      setLoading(false)
    }
    fetchGrant()
  }, [params.id])

  if (loading) {
    return <div className="container py-8 max-w-4xl text-center">Loading grant…</div>
  }
  if (!grant) {
    return <div className="container py-8 max-w-4xl text-center text-destructive">Grant not found.</div>
  }

  // Function to render markdown-like formatting
  const renderDescription = (text: string) => {
    return text.split("\n\n").map((paragraph, i) => {
      // Handle headings
      if (paragraph.startsWith("## ")) {
        return (
          <h2 key={i} className="text-xl font-bold mt-6 mb-3">
            {paragraph.substring(3)}
          </h2>
        )
      }

      // Handle lists
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

      // Handle bullet lists with *
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
  const questions = (grant.questions || []).map((q: any) => ({
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
    const allAnswered = questions.every((q) => answers[q.id])
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
      <Button variant="ghost" className="mb-6" onClick={() => router.push("/grants")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Grants
      </Button>

      {submitted ? (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for applying to the {grant.grant_name}. We'll review your application and get back to you soon.
              </p>
              <Button onClick={() => router.push("/grants")}>Return to Grants</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
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
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>Deadline: {grant.deadline ? new Date(grant.deadline).toLocaleDateString() : "N/A"}</span>
                      </div>
                    </div>
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  {grant.grant_categories?.map((category: string) => (
                    <Badge key={category} className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20">
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

          {/* Application Section */}
          <div className="mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5" />
              Grant Application
            </h2>
            <p className="text-muted-foreground">
              {currentStep === "userConfirmation"
                ? "Please confirm your details before proceeding with the application."
                : `Please answer all ${questions.length} questions to complete your application.`}
            </p>
          </div>

          {currentStep === "userConfirmation" ? (
            /* User Confirmation Section */
            <div className="space-y-6">
              {/* User Profile Card */}
              <Card>
                <CardHeader className="bg-muted/50 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Applicant Information
                  </CardTitle>
                  <CardDescription>Confirm your account details for this application</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={userData.avatar || "/placeholder.svg"} alt={userData.name} />
                        <AvatarFallback className="text-lg">{userData.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-lg">{userData.name}</h3>
                        <p className="text-sm text-muted-foreground">{userData.email}</p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={handleSwitchAccount} className="gap-2">
                      <LogOut className="h-4 w-4" />
                      Switch Account
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Lab Selection Card */}
              <Card>
                <CardHeader className="bg-muted/50 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Associated Lab
                  </CardTitle>
                  <CardDescription>Optionally associate this application with one of your labs</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <Select value={selectedLab} onValueChange={setSelectedLab}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a lab (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {userData.labs.map((lab) => (
                          <SelectItem key={lab.id} value={lab.id}>
                            {lab.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Associating with a lab will allow all lab members to view this application.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Banking Information Card */}
              <Card>
                <CardHeader className="bg-muted/50 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                  <CardDescription>Banking details for receiving grant funds</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {userData.bankAccount.exists ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">Bank Account</p>
                            <p className="text-sm text-muted-foreground">Ending in {userData.bankAccount.last4}</p>
                          </div>
                        </div>
                        <div className="space-x-2">
                          <Button variant="outline" size="sm">
                            Change
                          </Button>
                          <Button variant="outline" size="sm">
                            Remove
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {userData.bankAccount.kycVerified ? (
                          <>
                            <Check className="h-4 w-4 text-green-600" />
                            <span className="text-green-600 font-medium">KYC Verified</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <span className="text-amber-600 font-medium">KYC Verification Required</span>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
                        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-800 dark:text-amber-400">Bank Account Required</p>
                          <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
                            You must connect a bank account and successfully complete KYC verification before you will
                            be eligible to receive funds from this grant.
                          </p>
                          <Button className="mt-3" size="sm">
                            Connect Bank Account
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      You must connect a bank account and successfully complete KYC verification before you will be
                      eligible to receive funds from this grant.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Continue Button */}
              <div className="flex justify-end mt-6">
                <Button onClick={handleContinueToQuestions} className="gap-2">
                  Continue to Application
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            /* Questions Section */
            <>
              {/* Progress Indicator */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span className="text-sm font-medium">
                    {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
                  </span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Question Navigation */}
              <div className="flex gap-2 mb-4 overflow-x-auto py-2 px-1">
                {questions.map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
                      ${
                        currentQuestionIndex === index
                          ? "bg-primary text-primary-foreground"
                          : answers[question.id]
                            ? "bg-primary/20 text-primary border border-primary/30"
                            : "bg-muted text-muted-foreground"
                      }`}
                    aria-label={`Go to question ${index + 1}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {/* Current Question Card */}
              <Card className="mb-6">
                <CardHeader className="bg-muted/50">
                  <CardTitle className="text-lg flex items-start gap-2">
                    <HelpCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>{currentQuestion.text}</span>
                  </CardTitle>
                  <CardDescription>
                    {currentQuestion.type === "shortAnswer"
                      ? `Short answer response (${wordCount}/${currentQuestion.characterLimit} words max)`
                      : "Select one option below"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {currentQuestion.type === "shortAnswer" ? (
                    <div className="space-y-2">
                      <Textarea
                        value={answers[currentQuestion.id] || ""}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                        placeholder="Type your answer here..."
                        className="min-h-[150px] border-muted-foreground/20 focus:border-primary"
                      />
                      {wordCount > currentQuestion.characterLimit && (
                        <p className="text-sm text-destructive">
                          Your response exceeds the {currentQuestion.characterLimit} word limit.
                        </p>
                      )}
                    </div>
                  ) : (
                    <RadioGroup
                      value={answers[currentQuestion.id] || ""}
                      onValueChange={handleAnswerChange}
                      className="space-y-3"
                    >
                      {currentQuestion.options?.map((option: string, i: number) => (
                        <div key={i} className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted/50">
                          <RadioGroupItem value={option} id={`option-${i}`} />
                          <Label htmlFor={`option-${i}`} className="flex-grow cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between py-4 border-t">
                  <Button
                    variant="outline"
                    onClick={isFirstQuestion ? () => setCurrentStep("userConfirmation") : handlePreviousQuestion}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {isFirstQuestion ? "Back to Details" : "Previous"}
                  </Button>
                  {isLastQuestion ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={
                        !answers[currentQuestion.id] ||
                        (currentQuestion.type === "shortAnswer" && wordCount > currentQuestion.characterLimit)
                      }
                      className="gap-1"
                    >
                      <Send className="h-4 w-4" />
                      Submit Application
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNextQuestion}
                      disabled={
                        !answers[currentQuestion.id] ||
                        (currentQuestion.type === "shortAnswer" && wordCount > currentQuestion.characterLimit)
                      }
                      className="gap-1"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </CardFooter>
              </Card>

              {/* Application Info */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium mb-1">Application Information</h3>
                      <p className="text-sm text-muted-foreground">
                        Your application will be reviewed by our team. We'll notify you of the decision within 4 weeks
                        of the application deadline.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Switch Account?</DialogTitle>
            <DialogDescription>
              You will be signed out and redirected to the login page. Any unsaved application progress will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowLogoutConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmLogout}>
              Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
