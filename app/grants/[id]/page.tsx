"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, DollarSign, ArrowLeft, FileText, Banknote, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/components/auth-provider"

export default function GrantPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const grantId = params.id as string;
  const [grant, setGrant] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [creator, setCreator] = useState<any>(null)
  const [org, setOrg] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [questionsLoading, setQuestionsLoading] = useState(false)
  const { user } = useAuth();
  const [userApplication, setUserApplication] = useState<any>(null);
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [answersLoading, setAnswersLoading] = useState(false);
  const [awardedUser, setAwardedUser] = useState<string | null>(null);
  const [bankInfo, setBankInfo] = useState<any>(null);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankError, setBankError] = useState<string | null>(null);
  const [showConnectBank, setShowConnectBank] = useState(false);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  useEffect(() => {
    if (!grantId) return;
    const fetchGrant = async () => {
      setLoading(true)
      // Fetch grant
      const { data: grant, error: grantError } = await supabase
        .from("grants")
        .select("*")
        .eq("grant_id", grantId)
        .single()
      setGrant(grant)
      // Fetch creator profile
      let creatorProfile = null
      if (grant?.created_by) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_id, username, avatar_url")
          .eq("user_id", grant.created_by)
          .single()
        creatorProfile = profile
      }
      setCreator(creatorProfile)
      // Fetch org info
      let orgInfo = null
      if (grant?.org_id) {
        const { data: orgData } = await supabase
          .from("organizations")
          .select("org_id, org_name, profilePic")
          .eq("org_id", grant.org_id)
          .single()
        orgInfo = orgData
      }
      setOrg(orgInfo)
      setLoading(false)
      // Fetch questions only if grant exists
      if (grant && grant.grant_id) {
        setQuestionsLoading(true)
        const { data: questionsData } = await supabase
          .from("grant_questions")
          .select("*")
          .eq("grant_id", grant.grant_id)
        setQuestions(questionsData || [])
        setQuestionsLoading(false)
      } else {
        setQuestions([])
      }
    }
    fetchGrant()
  }, [grantId])

  useEffect(() => {
    if (!grantId || !user?.id) return;
    const fetchUserApplicationAndAnswers = async () => {
      setAnswersLoading(true);
      // 1. Check if user has applied
      const { data: application, error: appError } = await supabase
        .from("grant_applicants")
        .select("*")
        .eq("grant_id", grantId)
        .eq("completed_by", user.id)
        .single();
      setUserApplication(application);
      if (application) {
        // 2. Fetch answers
        const { data: answers, error: answersError } = await supabase
          .from("grant_answers")
          .select("*")
          .eq("grant_id", grantId)
          .eq("answered_by", user.id);
        // 3. Map answers to questions
        const questionMap: Record<string, any> = {};
        (questions || []).forEach((q: any) => {
          questionMap[String(q.question_id)] = q;
        });
        setUserAnswers(
          (answers || []).map(ans => ({
            question_id: String(ans.question_id),
            question: questionMap[String(ans.question_id)]?.question_text,
            answer: ans.answer_text,
            type: questionMap[String(ans.question_id)]?.question_type,
            options: questionMap[String(ans.question_id)]?.answer_choices || [],
          }))
        );
      } else {
        setUserAnswers([]);
      }
      setAnswersLoading(false);
    };
    fetchUserApplicationAndAnswers();
  }, [grantId, user, questions]);

  // Fetch awarded user's username if awarded
  useEffect(() => {
    if (grant && grant.closure_status === "AWARDED" && grant.user_accepted) {
      (async () => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("user_id", grant.user_accepted)
          .single();
        setAwardedUser(profile?.username || null);
      })();
    } else {
      setAwardedUser(null);
    }
  }, [grant]);

  // Fetch user's payout bank info
  useEffect(() => {
    if (!user?.id) return;
    setBankLoading(true);
    setBankError(null);
    (async () => {
      try {
        // 1. Fetch funding_id from profiles
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('funding_id')
          .eq('user_id', user.id)
          .single();
        if (error || !profile?.funding_id) {
          setBankInfo(null);
          setBankLoading(false);
          return;
        }
        // 2. Fetch bank info using funding_id
        const res = await fetch('/api/stripe/get-funding-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ funding_id: profile.funding_id }),
        });
        const data = await res.json();
        if (data.error) setBankError(data.error);
        else setBankInfo(data);
      } catch (err) {
        setBankError('Failed to fetch bank info');
      } finally {
        setBankLoading(false);
      }
    })();
  }, [user?.id, payoutSuccess]);

  // Payout handler
  const handlePayout = async () => {
    if (!user?.id) return;
    setPayoutLoading(true);
    setPayoutSuccess(false);
    try {
      const res = await fetch('/api/stripe/send-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({ grant_id: grantId }),
      });
      const data = await res.json();
      if (!data.error) {
        setPayoutSuccess(true);
        // Refresh grant data to get updated stripe_id
        const { data: updatedGrant } = await supabase
          .from("grants")
          .select("*")
          .eq("grant_id", grantId)
          .single();
        if (updatedGrant) {
          setGrant(updatedGrant);
        }
      } else {
        setBankError(data.error);
      }
    } catch (err) {
      setBankError('Failed to send payout');
    } finally {
      setPayoutLoading(false);
    }
  }

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

  return (
    <div className="container max-w-4xl py-8 px-4">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Grant Details Section */}
      <Card className="mb-8">
        <CardHeader className="bg-muted/50 pb-4">
          {/* Status Badge Row */}
          <div className="flex items-center gap-3 mb-2">
            {user && userApplication && (
              <Badge className="bg-blue-100 text-blue-800">APPLIED</Badge>
            )}
            {grant.closure_status === "AWARDED" && grant.user_accepted ? (
              <Badge className="bg-green-100 text-green-800">
                {user && user.id === grant.user_accepted
                  ? "GRANT AWARDED TO YOU"
                  : awardedUser
                  ? `GRANT AWARDED TO ${awardedUser}`
                  : "GRANT AWARDED"}
              </Badge>
            ) : (
              <Badge className="bg-yellow-100 text-yellow-800">GRANT NOT YET AWARDED</Badge>
            )}
          </div>
          {/* End Status Badge Row */}
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
            {/* Creator/Org Info */}
            <div className="flex flex-col items-end gap-2 min-w-[160px]">
              {org && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={org.profilePic || "/placeholder.svg"} alt={org.org_name} />
                    <AvatarFallback>{org.org_name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground font-medium truncate max-w-[120px]">{org.org_name}</span>
                </div>
              )}
              {creator && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={creator.avatar_url || "/placeholder.svg"} alt={creator.username} />
                    <AvatarFallback>{creator.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground font-medium truncate max-w-[120px]">{creator.username}</span>
                </div>
              )}
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
          <div className="prose prose-sm dark:prose-invert max-w-none mb-8">{renderDescription(grant.grant_description)}</div>
          {/* If user has applied, show their answers instead of the apply button */}
          {user && userApplication && grant.closure_status === "AWARDED" && grant.user_accepted === user.id && (
            <>
              <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 flex items-center gap-3">
                <Banknote className="h-6 w-6 text-green-700" />
                <div>
                  <div className="font-bold text-green-900 text-lg">Congratulations! You have been awarded this grant.</div>
                  <div className="text-green-800 text-sm">Please connect your payout bank account and claim your funds below.</div>
                </div>
              </div>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <Banknote className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Your Payout Bank Account</span>
                </div>
                {grant.stripe_id ? (
                  <div className="bg-muted/60 border border-muted-foreground/20 rounded p-4 flex flex-col items-center opacity-60 cursor-not-allowed select-none">
                    <div className="flex items-center gap-3 mb-2">
                      {bankInfo && bankInfo.last4 ? (
                        <span className="text-sm">{bankInfo.bankName || bankInfo.bank_name} ••••{bankInfo.last4}</span>
                      ) : (
                        <span className="text-muted-foreground">No payout bank account connected.</span>
                      )}
                    </div>
                    <Button variant="outline" size="sm" disabled>Change</Button>
                    <Button className="mt-2" disabled>Payout has been issued</Button>
                    <div className="mt-4 text-center text-sm text-muted-foreground font-semibold">
                      PAYOUT HAS BEEN ISSUED TO YOUR CONNECTED PAYOUT ACCOUNT.<br />
                      PLEASE CONTACT US: <a href="mailto:contact@heterodoxlabs.com" className="underline">contact@heterodoxlabs.com</a> if you experience any issues.
                    </div>
                  </div>
                ) : bankLoading ? (
                  <div className="text-muted-foreground">Loading bank info…</div>
                ) : bankInfo && bankInfo.last4 ? (
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm">{bankInfo.bankName || bankInfo.bank_name} ••••{bankInfo.last4}</span>
                    <Button variant="outline" size="sm" onClick={() => setShowConnectBank(true)}>Change</Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-muted-foreground">No payout bank account connected.</span>
                    <Button variant="outline" size="sm" onClick={() => router.push('/profile?tab=bank')}>Connect Bank</Button>
                  </div>
                )}
                {bankInfo && bankInfo.last4 && !grant.stripe_id && (
                  <Button 
                    className="mt-2" 
                    onClick={handlePayout} 
                    disabled={payoutLoading || payoutSuccess}
                  >
                    {payoutLoading ? (
                      <span className="flex items-center gap-2"><Loader2 className="animate-spin h-4 w-4" /> Processing…</span>
                    ) : payoutSuccess ? (
                      'Payout has been issued!'
                    ) : (
                      'Receive Grant Payout'
                    )}
                  </Button>
                )}
                {bankError && <div className="text-red-600 mt-2">{bankError}</div>}
                {/* Modal or dialog for connecting bank can be implemented here if needed */}
              </div>
            </>
          )}
          {user && userApplication ? (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg font-bold">Your Application Responses</span>
              </div>
              {answersLoading ? (
                <div className="text-muted-foreground text-sm">Loading your responses…</div>
              ) : userAnswers.length === 0 ? (
                <div className="text-muted-foreground text-sm">No responses found for your application.</div>
              ) : (
                <ol className="space-y-4 list-decimal ml-6">
                  {userAnswers.map((response, i) => (
                    <li key={response.question_id || i} className="">
                      <div className="font-medium">{response.question || <span className="text-destructive">No matching question found</span>}</div>
                      <div className="bg-muted p-4 rounded-md mt-1">{response.answer}</div>
                      {response.type === "multiple_choice" && (
                        <div className="text-xs text-muted-foreground">Options: {response.options.join(", ")}</div>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          ) : (
            // Show application questions preview and apply button if not applied
            <>
              {/* Application Questions Preview */}
              <div className="mt-8">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg font-bold">Application Questions</span>
                </div>
                {questionsLoading ? (
                  <div className="text-muted-foreground text-sm">Loading questions…</div>
                ) : questions.length === 0 ? (
                  <div className="text-muted-foreground text-sm">No application questions for this grant.</div>
                ) : (
                  <ol className="space-y-4 list-decimal ml-6">
                    {questions.map((q, i) => (
                      <li key={q.id || q.question_id} className="">
                        <div className="font-medium">{q.question_text}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {q.question_type === "shortAnswer"
                            ? `Short answer${q.character_limit ? ` (limit: ${q.character_limit} words)` : ""}`
                            : q.question_type === "multipleChoice"
                            ? `Multiple choice: ${Array.isArray(q.answer_choices) ? q.answer_choices.join(", ") : ""}`
                            : q.question_type}
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
              {/* Apply Button */}
              <div className="flex flex-col items-center mt-8 gap-3">
                {user ? (
                  <Button 
                    size="lg" 
                    className="px-8 py-6 text-lg"
                    onClick={() => router.push(`/grants/${grantId}/apply`)}
                  >
                    Apply for this Grant
                  </Button>
                ) : (
                  <>
                    <Button 
                      size="lg" 
                      className="px-8 py-6 text-lg"
                      disabled
                      title="You must be logged in to apply"
                    >
                      Log in to apply for this Grant
                    </Button>
                    <a href="/login" className="mt-2 text-blue-600 underline text-sm">Go to Login</a>
                  </>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
