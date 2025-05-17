"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { Search, Award, DollarSign, Calendar, BookmarkPlus, TestTubeIcon as Lab, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import GrantReviewLoading from "./loading"

export default function GrantReviewPage() {
  const router = useRouter()
  const params = useParams();
  const grantId = params.id as string;
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null)
  const [confirmAwardDialog, setConfirmAwardDialog] = useState({ open: false, applicationId: "" })
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false)
  const [grant, setGrant] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bankInfo, setBankInfo] = useState<any>(null);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankError, setBankError] = useState<string | null>(null);
  const [authorizeChecked, setAuthorizeChecked] = useState(false);
  const [isAwarding, setIsAwarding] = useState(false);
  const [awardedUser, setAwardedUser] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      // 1. Fetch grant
      const { data: grantData, error: grantError } = await supabase
        .from("grants")
        .select("*")
        .eq("grant_id", grantId)
        .single()
      if (grantError) { setError("Grant not found"); setLoading(false); return; }
      setGrant(grantData)
      // 2. Fetch applications (no join)
      const { data: applicants, error: applicantsError } = await supabase
        .from("grant_applicants")
        .select("*")
        .eq("grant_id", grantId)
      console.log('applicantsError', applicantsError, 'applicants', applicants);
      if (applicantsError) { setError("Failed to fetch applications"); setLoading(false); return; }
      // 3. Fetch profiles for all completed_by UUIDs
      const completedByIds = (applicants || []).map(a => a.completed_by).filter(Boolean)
      let profileMap: Record<string, any> = {}
      if (completedByIds.length > 0) {
        // First get profiles (without email)
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("user_id, username")
          .in("user_id", completedByIds)
        console.log('profilesError', profilesError, 'profiles', profiles);
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          setError("Failed to fetch applicant profiles");
          setLoading(false);
          return;
        }
        if (profiles) {
          profiles.forEach(p => { profileMap[p.user_id] = p })
        }
        // Then get emails from auth.users using a server action
        try {
          const response = await fetch('/api/users/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userIds: completedByIds }),
          });
          const { data: userEmails, error: emailError } = await response.json();
          if (emailError) {
            console.error('Error fetching user emails:', emailError);
          } else if (userEmails) {
            userEmails.forEach((user: { id: string, email: string }) => {
              if (profileMap[user.id]) {
                profileMap[user.id].email = user.email;
              }
            });
          }
        } catch (error) {
          console.error('Error fetching user emails:', error);
        }
      }
      // 4. Fetch labs for all unique lab_associated UUIDs
      const labIds = (applicants || []).map(a => a.lab_associated).filter(Boolean)
      let labMap: Record<string, any> = {}
      if (labIds.length > 0) {
        const { data: labsData } = await supabase
          .from("labs")
          .select("labId, labName, profilePic")
          .in("labId", labIds)
        if (labsData) {
          labsData.forEach(lab => { labMap[lab.labId] = lab })
        }
      }
      // 5. Fetch all questions for this grant and build a map using question_id (UUID) as the key
      console.log('grantId used for questions query:', grantId);
      const { data: questions, error: questionsError } = await supabase
        .from("grant_questions")
        .select("question_id, question_text, question_type, answer_choices")
        .eq("grant_id", grantId)
      console.log('Questions fetched:', questions);
      const questionMap: Record<string, any> = {};
      if (questions && Array.isArray(questions)) {
        questions.forEach(q => {
          console.log('Mapping question:', q.question_id, q);
          questionMap[String(q.question_id)] = q;
        });
      } else if (questions && typeof questions === 'object') {
        Object.values(questions).forEach((q: any) => {
          console.log('Mapping question:', q.question_id, q);
          questionMap[String(q.question_id)] = q;
        });
      }
      console.log('Final questionMap keys:', Object.keys(questionMap));
      // 6. Merge profiles and labs into applicants
      const applicantsWithProfiles = (applicants || []).map(app => ({
        ...app,
        profile: profileMap[app.completed_by] || null,
        lab: labMap[app.lab_associated] || null,
      }))
      console.log('applicantsWithProfiles', applicantsWithProfiles);
      // 7. For each applicant, fetch their answers (no join)
      const applicationsWithAnswers = await Promise.all((applicantsWithProfiles || []).map(async (app) => {
        const { data: answers, error: answersError } = await supabase
          .from("grant_answers")
          .select("*")
          .eq("grant_id", grantId)
          .eq("answered_by", app.completed_by)
        if (answersError) {
          console.error('Error fetching answers for applicant:', app.completed_by, answersError);
          return {
            ...app,
            answers: [],
            error: "Failed to fetch answers"
          };
        }
        // Debug: log question_ids and questionMap keys (force string)
        if (answers) {
          console.log('Applicant', app.completed_by, 'answers question_ids:', answers.map(a => String(a.question_id)));
          console.log('Available questionMap keys:', Object.keys(questionMap));
        }
        return {
          ...app,
          answers: (answers || []).map(ans => ({
            question_id: String(ans.question_id),
            question: questionMap[String(ans.question_id)]?.question_text,
            answer: ans.answer_text,
            type: questionMap[String(ans.question_id)]?.question_type,
            options: questionMap[String(ans.question_id)]?.answer_choices || [],
          })),
        }
      }))
      setApplications(applicationsWithAnswers)
      setLoading(false)
    }
    fetchData()
  }, [grantId])

  // Authorization: Only the grant creator can view this page
  useEffect(() => {
    if (grant && user && grant.created_by && grant.created_by !== user.id) {
      setError("You are not authorized to review this grant.");
    }
  }, [grant, user]);

  // Fetch grant creator's payment method (card) using /api/stripe/get-payment-info and user ID
  useEffect(() => {
    if (!grant?.created_by) return;
    setBankLoading(true);
    setBankError(null);
    (async () => {
      try {
        const res = await fetch('/api/stripe/get-payment-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': grant.created_by },
        });
        const data = await res.json();
        if (data.error) setBankError(data.error);
        else setBankInfo(data);
      } catch (err) {
        setBankError('Failed to fetch payment info');
      } finally {
        setBankLoading(false);
      }
    })();
  }, [grant?.created_by]);

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

  if (error) {
    return <div className="container py-8 text-center text-destructive">{error}</div>;
  }

  // Metrics
  const totalApplications = applications.length
  const shortlistedCount = applications.filter(app => app.shortlisted).length
  const awardedCount = applications.filter(app => app.acceptance_status === "awarded").length

  // Filter applications based on search query
  const filteredApplications = applications.filter((app) => {
    if (!searchQuery) return true
    const applicantName = app.profile?.username || app.profile?.email || ""
    const labName = app.lab?.labName || ""
    return (
      applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      labName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  // Separate shortlisted applications from others
  const shortlistedApplications = filteredApplications.filter((app) => app.shortlisted)
  const otherApplications = filteredApplications.filter((app) => !app.shortlisted)

  // Handlers
  const handleShortlist = async (applicationId: string) => {
    const app = applications.find(a => a.id === applicationId)
    if (!app) return
    const newShortlisted = !app.shortlisted
    await supabase
      .from("grant_applicants")
      .update({ shortlisted: newShortlisted })
      .eq("id", applicationId)
    // Refetch data
    setApplications(applications.map(a => a.id === applicationId ? { ...a, shortlisted: newShortlisted } : a))
    setSelectedApplication(null)
  }

  const handleAwardGrant = async (applicationId: string, applicantUserId: string) => {
    setIsAwarding(true);
    // 1. Update the applicant's acceptance_status
    await supabase
      .from("grant_applicants")
      .update({ acceptance_status: "awarded" })
      .eq("id", applicationId)
    // 2. Update the grant's user_accepted and closure_status only
    await supabase
      .from("grants")
      .update({
        user_accepted: applicantUserId,
        closure_status: "AWARDED"
      })
      .eq("grant_id", grantId)
    // Refetch grant to get updated status and awarded user
    const { data: updatedGrant } = await supabase
      .from("grants")
      .select("*")
      .eq("grant_id", grantId)
      .single();
    setGrant(updatedGrant);
    setApplications((applications: any[]) => applications.map((a: any) => a.id === applicationId ? { ...a, acceptance_status: "awarded" } : a))
    setConfirmAwardDialog({ open: false, applicationId: "" })
    setIsAwarding(false);
  }

  const handleDeleteGrant = async () => {
    // Delete all grant_answers for this grant
    await supabase.from("grant_answers").delete().eq("grant_id", grantId)
    // Delete all grant_applicants for this grant
    await supabase.from("grant_applicants").delete().eq("grant_id", grantId)
    // Delete the grant itself
    await supabase.from("grants").delete().eq("grant_id", grantId)
    setConfirmDeleteDialog(false)
    router.push("/grants")
  }

  const getStatusBadge = (app: any) => {
    if (app.acceptance_status === "awarded") {
      return (
        <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800">
          <Award className="h-3 w-3" /> Awarded
        </Badge>
      )
    }
    if (app.shortlisted) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <BookmarkPlus className="h-3 w-3" /> Shortlisted
        </Badge>
      )
    }
    return null
  }

  // Find the selected application
  const selectedApp = applications.find((app) => app.id === selectedApplication)

  if (isAwarding) {
    return <GrantReviewLoading />;
  }

  if (grant?.closure_status === "AWARDED" && awardedUser) {
    const isWinner = user?.id === grant.user_accepted;
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center z-10 bg-background">
        <div className="w-full max-w-xl">
          <div className="flex flex-col items-center mb-8">
            <Badge variant="secondary" className="bg-primary/10 text-primary text-lg px-6 py-3 mb-4 shadow-md rounded-full border border-primary">
              <Award className="h-5 w-5 mr-2 text-primary" /> AWARDED to {awardedUser}
            </Badge>
            {isWinner && (
              <>
                <h2 className="text-2xl font-bold text-primary mb-2 tracking-tight">Congratulations!</h2>
                <p className="text-muted-foreground text-center max-w-md">You have been awarded this grant. See the details below.</p>
              </>
            )}
          </div>
          <Card className="shadow-lg border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center">{grant.grant_name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-lg text-muted-foreground text-center">{grant.grant_description}</div>
              <div className="flex flex-wrap gap-2 justify-center">
                {Array.isArray(grant.grant_categories) && grant.grant_categories.map((cat: string) => (
                  <Badge key={cat} variant="outline">{cat}</Badge>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-4">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-primary" />
                  <span className="font-semibold text-xl text-primary">
                    {typeof grant.grant_amount === "number" ? `$${grant.grant_amount.toLocaleString()}` : ""}
                  </span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  <span className="text-lg text-primary">Deadline: {grant.deadline ? new Date(grant.deadline).toLocaleDateString() : ""}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Link href="/grants" className="text-sm text-muted-foreground hover:underline mb-2 inline-block">
              ← Back to Grants
            </Link>
            <h1 className="text-3xl font-bold">{grant?.grant_name || 'Grant'}</h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="font-medium">
                  {typeof grant?.grant_amount === "number" ? `$${grant.grant_amount.toLocaleString()}` : ""}
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>Deadline: {grant?.deadline ? new Date(grant.deadline).toLocaleDateString() : ""}</span>
              </div>
            </div>
          </div>
          <Button variant="destructive" size="sm" className="gap-1" onClick={() => setConfirmDeleteDialog(true)}>
            <Trash className="h-4 w-4" />
            Delete Grant
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {Array.isArray(grant?.grant_categories) &&
            grant.grant_categories.map((category: string) => (
              <Badge key={category} variant="secondary">
                {category}
              </Badge>
            ))}
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Application Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted rounded-lg p-3">
                <div className="text-sm text-muted-foreground mb-1">Total Applications</div>
                <div className="text-2xl font-bold">{totalApplications}</div>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="text-sm text-muted-foreground mb-1">Shortlisted</div>
                <div className="text-2xl font-bold">{shortlistedCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Applications</h2>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search applicants..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="text-center py-8 bg-muted rounded-lg">
          <h3 className="text-lg font-medium">No applications found</h3>
          <p className="text-muted-foreground mt-1">
            {searchQuery ? "Try adjusting your search query" : "There are no applications for this grant yet"}
          </p>
        </div>
      ) : (
        <>
          {/* Shortlisted Applications Section */}
          {shortlistedApplications.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <BookmarkPlus className="h-5 w-5 mr-2 text-blue-500" />
                <h3 className="text-lg font-medium">Shortlisted Applicants</h3>
                <Badge variant="outline" className="ml-2">
                  {shortlistedApplications.length}
                </Badge>
              </div>
              <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
                {shortlistedApplications.map((application) => (
                  <Card
                    key={application.id}
                    className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500"
                    onClick={() => setSelectedApplication(application.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={"/placeholder.svg"}
                              alt={application.profile?.username || application.profile?.email || "Applicant"}
                            />
                            <AvatarFallback>
                              {application.profile?.username
                                ? application.profile?.username.split(" ").map((n: string) => n[0]).join("")
                                : application.profile?.email?.split("@")[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {application.profile?.username || "Unknown Applicant"}
                            </div>
                            {application.profile?.email && (
                              <div className="text-xs text-muted-foreground">{application.profile.email}</div>
                            )}
                            {application.lab && (
                              <div className="flex items-center gap-2 mt-1">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={application.lab.profilePic || "/placeholder.svg"} alt={application.lab.labName || "Lab"} />
                                  <AvatarFallback>{application.lab.labName?.[0] || "L"}</AvatarFallback>
                                </Avatar>
                                <span className="text-xs">{application.lab.labName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <BookmarkPlus className="h-3 w-3" /> Shortlisted
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            {application.created_at ? new Date(application.created_at).toLocaleDateString() : ""}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Other Applications Section */}
          {otherApplications.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <h3 className="text-lg font-medium">All Other Applicants</h3>
                <Badge variant="outline" className="ml-2">
                  {otherApplications.length}
                </Badge>
              </div>
              <div className="space-y-3">
                {otherApplications.map((application) => (
                  <Card
                    key={application.id}
                    className={`hover:shadow-md transition-shadow cursor-pointer ${
                      application.acceptance_status === "awarded" ? "border-l-4 border-l-green-500" : ""
                    }`}
                    onClick={() => setSelectedApplication(application.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={"/placeholder.svg"}
                              alt={application.profile?.username || application.profile?.email || "Applicant"}
                            />
                            <AvatarFallback>
                              {application.profile?.username
                                ? application.profile?.username.split(" ").map((n: string) => n[0]).join("")
                                : application.profile?.email?.split("@")[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {application.profile?.username || "Unknown Applicant"}
                            </div>
                            {application.profile?.email && (
                              <div className="text-xs text-muted-foreground">{application.profile.email}</div>
                            )}
                            {application.lab && (
                              <div className="flex items-center gap-2 mt-1">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={application.lab.profilePic || "/placeholder.svg"} alt={application.lab.labName || "Lab"} />
                                  <AvatarFallback>{application.lab.labName?.[0] || "L"}</AvatarFallback>
                                </Avatar>
                                <span className="text-xs">{application.lab.labName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {application.shortlisted && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <BookmarkPlus className="h-3 w-3" /> Shortlisted
                            </Badge>
                          )}
                          <div className="text-sm text-muted-foreground">
                            {application.created_at ? new Date(application.created_at).toLocaleDateString() : ""}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Application Detail Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={(open) => !open && setSelectedApplication(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>Review the applicant's answers and associated questions below.</DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="max-h-[70vh] overflow-y-auto pr-2">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={"/placeholder.svg"} alt={selectedApp.profile?.username || selectedApp.profile?.email || "Applicant"} />
                  <AvatarFallback>
                    {selectedApp.profile?.username
                      ? selectedApp.profile?.username.split(" ").map((n: string) => n[0]).join("")
                      : selectedApp.profile?.email?.split("@")[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedApp.profile?.username || "Unknown Applicant"}
                  </h3>
                  {selectedApp.profile?.email && (
                    <div className="text-xs text-muted-foreground">{selectedApp.profile.email}</div>
                  )}
                  {selectedApp.lab && (
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={selectedApp.lab.profilePic || "/placeholder.svg"} alt={selectedApp.lab.labName || "Lab"} />
                        <AvatarFallback>{selectedApp.lab.labName?.[0] || "L"}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{selectedApp.lab.labName}</span>
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground mt-1">
                    Submitted on {selectedApp.created_at ? new Date(selectedApp.created_at).toLocaleDateString() : ""}
                  </div>
                </div>
                <div className="ml-auto">{getStatusBadge(selectedApp)}</div>
              </div>

              <Separator className="my-6" />

              <h4 className="text-lg font-medium mb-4">Application Responses</h4>
              <div className="space-y-6">
                {selectedApp.answers && selectedApp.answers.length > 0 ? (
                  selectedApp.answers.map((response: any, index: number) => {
                    // Debug log for each answer
                    console.log('Rendering answer:', response);
                    return (
                      <div key={index} className="space-y-2">
                        {/* Only show question_text above answer_text, do NOT show QID or question_id */}
                        <div className="font-medium">
                          {response.question || <span className="text-destructive">No matching question found</span>}
                        </div>
                        <div className="bg-muted p-4 rounded-md">{response.answer}</div>
                        {response.type === "multiple_choice" && (
                          <div className="text-xs text-muted-foreground">Options: {response.options.join(", ")}</div>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <div className="text-muted-foreground">No responses found for this applicant.</div>
                )}
              </div>

              <Separator className="my-6" />

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => handleShortlist(selectedApp.id)}>
                  <BookmarkPlus className="mr-2 h-4 w-4" />
                  {selectedApp.shortlisted ? "Remove from Shortlist" : "Add to Shortlist"}
                </Button>
                {selectedApp.acceptance_status !== "awarded" && (
                  <Button
                    variant="default"
                    onClick={() => setConfirmAwardDialog({ open: true, applicationId: selectedApp.id })}
                  >
                    <Award className="mr-2 h-4 w-4" />
                    Award Grant
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Award Grant Confirmation Dialog */}
      <Dialog
        open={confirmAwardDialog.open}
        onOpenChange={(open) => setConfirmAwardDialog({ ...confirmAwardDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Award Grant</DialogTitle>
          </DialogHeader>
          {/* Payment method info and authorization (not inside DialogDescription) */}
          <div className="mb-2 text-sm text-muted-foreground">
            Are you sure you want to award this grant to this applicant? This action will notify the applicant and cannot be undone.
          </div>
          <div className="mb-4">
            <div className="font-semibold mb-1">Your Payment Method on File:</div>
            {bankLoading ? (
              <div className="text-muted-foreground">Loading payment method…</div>
            ) : bankError ? (
              <div className="text-red-600">{bankError}</div>
            ) : bankInfo && bankInfo.type === 'card' ? (
              <div className="flex items-center gap-3">
                <span className="text-sm">{bankInfo.brand?.toUpperCase()} ••••{bankInfo.last4}</span>
                {/* Add change/remove logic as needed */}
              </div>
            ) : (
              <div className="text-muted-foreground">No payment method connected.</div>
            )}
          </div>
          <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded text-yellow-900 text-sm">
            <strong>Payment Authorization:</strong> By confirming, you authorize us to charge your connected payment source for the grant amount (${grant?.grant_amount?.toLocaleString() || ""}) <b>only if the winner claims the payout</b>.
          </div>
          <div className="flex items-center gap-2 mb-4">
            <input type="checkbox" id="authorize" checked={authorizeChecked} onChange={e => setAuthorizeChecked(e.target.checked)} />
            <label htmlFor="authorize" className="text-sm">I authorize this charge if the winner claims the payout.</label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAwardDialog({ open: false, applicationId: "" })}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const app = applications.find(a => a.id === confirmAwardDialog.applicationId);
                if (app) handleAwardGrant(confirmAwardDialog.applicationId, app.completed_by);
              }}
              disabled={!authorizeChecked || bankLoading || !bankInfo}
            >
              Confirm & Authorize Award
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Grant Confirmation Dialog */}
      <AlertDialog open={confirmDeleteDialog} onOpenChange={setConfirmDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Grant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this grant? This action cannot be undone and will remove all associated
              applications. Applicants will be notified that the grant has been cancelled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGrant}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
