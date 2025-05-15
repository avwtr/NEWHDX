"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, DollarSign, ArrowLeft, FileText } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
        </CardContent>
      </Card>

      {/* Apply Button */}
      <div className="flex justify-center">
        <Button 
          size="lg" 
          className="px-8 py-6 text-lg"
          onClick={() => router.push(`/grants/${grantId}/apply`)}
        >
          Apply for this Grant
        </Button>
      </div>
    </div>
  )
}
