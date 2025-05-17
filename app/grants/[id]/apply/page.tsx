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
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"

export default function GrantApplyPage() {
  const params = useParams();
  const router = useRouter();
  const grantId = params.id as string;
  const { user } = useAuth();
  const [grant, setGrant] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState<"userConfirmation" | "questions">("userConfirmation")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [selectedLab, setSelectedLab] = useState<string>("")
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [labs, setLabs] = useState<any[]>([])
  const [labsLoading, setLabsLoading] = useState(false)
  const [fundingId, setFundingId] = useState<string | null>(null)
  const [bankInfo, setBankInfo] = useState<any>(null)
  const [bankLoading, setBankLoading] = useState(false)
  const [bankError, setBankError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [businessType, setBusinessType] = useState<'individual' | 'company'>('individual')
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!grantId) return;
    const fetchGrantAndQuestions = async () => {
      setLoading(true)
      // Fetch grant details
      const { data: grantData } = await supabase
        .from("grants")
        .select("*")
        .eq("grant_id", grantId)
        .single()
      setGrant(grantData)
      // Fetch questions
      if (grantData && grantData.grant_id) {
        const { data: questionsData } = await supabase
          .from("grant_questions")
          .select("*")
          .eq("grant_id", grantData.grant_id)
        setQuestions(questionsData || [])
      } else {
        setQuestions([])
      }
      setLoading(false)
    }
    fetchGrantAndQuestions()
  }, [grantId])

  useEffect(() => {
    if (!user?.id) return;
    console.log('[DEBUG] Current user object:', user);
    console.log('[DEBUG] Using user.id for lab fetch:', user.id);
    setLabsLoading(true);
    const fetchLabs = async () => {
      // Get labs where user is founder or admin
      const { data: founderLabs, error: founderError } = await supabase
        .from("labMembers")
        .select("lab_id")
        .eq("user", user.id)
        .or("role.eq.founder,role.eq.admin");
      const { data: adminLabs, error: adminError } = await supabase
        .from("labAdmins")
        .select("lab_id")
        .eq("user", user.id);
      // Merge lab_ids
      const labIds = Array.from(new Set([
        ...(founderLabs?.map((l: any) => l.lab_id) || []),
        ...(adminLabs?.map((l: any) => l.lab_id) || []),
      ]));
      const filteredLabIds = labIds.filter((id) => !!id);
      console.log("[DEBUG] Fetched labIds for user:", labIds, {founderLabs, adminLabs, founderError, adminError});
      if (filteredLabIds.length === 0) {
        setLabs([])
        setLabsLoading(false)
        return
      }
      // Fetch labs info
      const { data: labsData, error: labsError } = await supabase
        .from("labs")
        .select("labId, labName, profilePic")
        .in("labId", filteredLabIds)
      console.log("[DEBUG] Fetched labs for dropdown:", labsData, labsError, labsError?.message, labsError?.details, labsError?.hint);
      setLabs(labsData || [])
      setLabsLoading(false)
    }
    fetchLabs()
  }, [user])

  // Fetch funding_id from profiles
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('funding_id')
        .eq('user_id', user.id)
        .single();
      if (error) return;
      setFundingId(data?.funding_id || null);
    })();
  }, [user]);

  // Fetch bank info if fundingId exists
  useEffect(() => {
    if (!fundingId) { setBankInfo(null); return; }
    (async () => {
      setBankLoading(true);
      setBankError(null);
      try {
        const res = await fetch('/api/stripe/get-funding-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ funding_id: fundingId }),
        });
        const data = await res.json();
        if (data.error) setBankError(data.error);
        else setBankInfo(data);
      } catch (err: any) {
        setBankError('Failed to fetch bank info');
      } finally {
        setBankLoading(false);
      }
    })();
  }, [fundingId]);

  // Stripe connect logic
  const handleStripeConnect = async () => {
    setBankLoading(true);
    try {
      const res = await fetch('/api/stripe/create-connect-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessType }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setBankLoading(false);
        alert('Failed to get Stripe onboarding link.');
      }
    } catch (err) {
      setBankLoading(false);
      alert('Error connecting to Stripe.');
    }
  };

  // Remove payout account
  const handleRemove = async () => {
    if (!user) return;
    setBankLoading(true);
    await fetch('/api/stripe/remove-funding-id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id,
      },
    });
    setFundingId(null);
    setBankInfo(null);
    setBankLoading(false);
    setShowRemoveConfirm(false);
  };

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

  // Map questions to expected structure
  const mappedQuestions = questions.map((q: any) => ({
    id: q.question_id,
    text: q.question_text,
    type: q.question_type,
    options: q.answer_choices || [],
    characterLimit: q.character_limit || 500,
  }))

  const handleNextQuestion = () => {
    if (currentQuestionIndex < mappedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleAnswerChange = (value: string) => {
    setAnswers({
      ...answers,
      [mappedQuestions[currentQuestionIndex].id]: value,
    })
    if (mappedQuestions[currentQuestionIndex].type === "shortAnswer") {
      const words = value.trim() ? value.trim().split(/\s+/).length : 0
      setWordCount(words)
    }
  }

  const handleSubmit = async () => {
    setSubmitError(null);
    if (!user?.id) {
      setSubmitError("You must be logged in to submit an application.");
      return;
    }
    const allAnswered = mappedQuestions.every((q) => answers[q.id])
    if (!allAnswered) {
      setSubmitError("Please answer all questions before submitting.");
      return;
    }
    try {
      // 1. Insert into grant_applicants
      const { error: applicantError } = await supabase
        .from("grant_applicants")
        .insert({
          grant_id: grant.grant_id,
          completed_by: user.id,
          lab_associated: selectedLab || null,
          created_at: new Date().toISOString(),
          acceptance_status: null,
        })
      if (applicantError) throw new Error(applicantError.message)
      // 2. Insert each answer into grant_answers
      const answerRows = mappedQuestions.map((q) => ({
        grant_id: grant.grant_id,
        answered_by: user.id,
        question_id: q.id,
        answer_text: answers[q.id],
        created_at: new Date().toISOString(),
      }))
      const { error: answersError } = await supabase
        .from("grant_answers")
        .insert(answerRows)
      if (answersError) throw new Error(answersError.message)
      setSubmitted(true)
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit application.")
    }
  }

  const handleContinueToQuestions = () => {
    setCurrentStep("questions")
  }

  const handleSwitchAccount = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = async () => {
    router.push("/login")
  }

  useEffect(() => {
    const currentAnswer = answers[mappedQuestions[currentQuestionIndex]?.id] || ""
    if (mappedQuestions[currentQuestionIndex]?.type === "shortAnswer") {
      const words = currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0
      setWordCount(words)
    }
  }, [currentQuestionIndex, answers, mappedQuestions])

  const currentQuestion = mappedQuestions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === mappedQuestions.length - 1
  const isFirstQuestion = currentQuestionIndex === 0

  if (loading) {
    return <div className="container py-8 max-w-4xl text-center">Loading application form…</div>
  }
  if (!grant) {
    return <div className="container py-8 max-w-4xl text-center text-destructive">Grant not found.</div>
  }

  return (
    <div className="container max-w-4xl py-8 px-4">
      <Button variant="ghost" className="mb-6" onClick={() => router.push("/explore")}> 
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
              <h2 className="text-2xl font-bold mb-2 text-background">Application Submitted!</h2>
              <p className="text-muted-foreground mb-6 text-background">
                Thank you for applying to the {grant.grant_name}. We'll review your application and get back to you soon.
              </p>
              <Button onClick={() => router.push("/explore")}>Return to Grants</Button>
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

          {/* Application Section */}
          <div className="mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5" />
              Grant Application
            </h2>
            <p className="text-muted-foreground">
              {currentStep === "userConfirmation"
                ? "Please confirm your details before proceeding with the application."
                : `Please answer all ${mappedQuestions.length} questions to complete your application.`}
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
                    APPLICANT INFORMATION
                  </CardTitle>
                  <CardDescription>Confirm your account details for this application</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg"} alt={user?.user_metadata?.username || user?.email || "User"} />
                        <AvatarFallback className="text-lg">{(user?.user_metadata?.username?.[0] || user?.email?.[0] || "U").toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-lg tracking-wider">{user?.user_metadata?.username || user?.email}</h3>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
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
                        <SelectValue placeholder={labsLoading ? "Loading labs..." : "Select a lab (optional)"} />
                      </SelectTrigger>
                      <SelectContent>
                        {labsLoading ? (
                          <div className="p-2 text-center text-muted-foreground">Loading labs…</div>
                        ) : labs.length === 0 ? (
                          <div className="p-2 text-center text-muted-foreground">No labs found</div>
                        ) : (
                          labs.map((lab) => (
                            <SelectItem key={lab.labId} value={lab.labId}>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={lab.profilePic || "/placeholder.svg"} alt={lab.labName} />
                                  <AvatarFallback>{lab.labName?.[0] || "L"}</AvatarFallback>
                                </Avatar>
                                <span>{lab.labName}</span>
                              </div>
                            </SelectItem>
                          ))
                        )}
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
                  <CardDescription>Payout account for receiving grant funds</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {bankLoading ? (
                    <div className="text-accent font-semibold">Loading…</div>
                  ) : bankError ? (
                    <div className="text-red-600 font-semibold">{bankError}</div>
                  ) : fundingId && bankInfo ? (
                    <div className="space-y-4">
                      <div className="flex flex-col items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">Connected</Badge>
                        <span className="text-sm text-muted-foreground">
                          {bankInfo.bankName} ••••{bankInfo.last4}
                        </span>
                        <span className="text-xs text-muted-foreground">Status: {bankInfo.status}</span>
                      </div>
                      <div className="flex gap-2 w-full">
                        <Button variant="outline" className="flex-1" onClick={handleStripeConnect}>Change</Button>
                        <Button variant="destructive" className="flex-1" onClick={() => setShowRemoveConfirm(true)}>Remove</Button>
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          If awarded, your connected payout account will receive funds after disbursed by grant issuer.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex gap-4 items-center justify-center">
                        <label className="font-medium">Account Type:</label>
                        <Button
                          variant={businessType === 'individual' ? 'default' : 'outline'}
                          onClick={() => setBusinessType('individual')}
                          className={businessType === 'individual' ? 'bg-accent text-primary-foreground' : ''}
                        >
                          Individual
                        </Button>
                        <Button
                          variant={businessType === 'company' ? 'default' : 'outline'}
                          onClick={() => setBusinessType('company')}
                          className={businessType === 'company' ? 'bg-accent text-primary-foreground' : ''}
                        >
                          Business
                        </Button>
                      </div>
                      <Button className="bg-accent text-primary-foreground hover:bg-accent/90 w-full" onClick={handleStripeConnect} disabled={bankLoading}>
                        {bankLoading ? 'Redirecting to Stripe…' : 'Connect Payout Bank Account'}
                      </Button>
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          You will need to connect a payout bank account and complete KYC to receive grant funds. However, this will not stop you from being able to apply.
                        </p>
                      </div>
                    </div>
                  )}
                  <Dialog open={showRemoveConfirm} onOpenChange={setShowRemoveConfirm}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Remove Payout Account</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to remove your payout bank account? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRemoveConfirm(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleRemove}>Remove Account</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
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
                    Question {currentQuestionIndex + 1} of {mappedQuestions.length}
                  </span>
                  <span className="text-sm font-medium">
                    {Math.round(((currentQuestionIndex + 1) / mappedQuestions.length) * 100)}% Complete
                  </span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
                    style={{ width: `${((currentQuestionIndex + 1) / mappedQuestions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Question Navigation */}
              <div className="flex gap-2 mb-4 overflow-x-auto py-2 px-1">
                {mappedQuestions.map((question, index) => (
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

      {submitError && (
        <div className="text-red-600 font-semibold mb-4">{submitError}</div>
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