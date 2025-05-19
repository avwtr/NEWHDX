"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  ArrowLeft,
  Beaker,
  Calendar,
  Clock,
  FileIcon,
  CheckCircle,
  ChevronDown,
  Plus,
  MessageSquare,
  Loader2,
  Users,
  Timer,
  BarChart3,
} from "lucide-react"
import { formatDistanceToNow, differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from "date-fns"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"

const outcomeOptions = [
  { id: "as-intended", label: "As Intended", description: "The experiment achieved its stated objectives" },
  { id: "novel-discovery", label: "Novel Discovery", description: "The experiment led to unexpected but valuable findings" },
  { id: "partial-success", label: "Partial Success", description: "Some objectives were met, but not all" },
  { id: "inconclusive", label: "Inconclusive", description: "Results were unclear or insufficient to draw conclusions" },
  { id: "no-useful-info", label: "No Useful Information", description: "The experiment did not yield actionable insights" },
  { id: "technical-failure", label: "Technical Failure", description: "Technical issues prevented proper execution" },
]

function AnimatedCounter({ value, label, icon }: { value: number | string; label: string; icon: React.ReactNode }) {
  const [count, setCount] = useState<number>(typeof value === 'number' ? 0 : 0)
  const [display, setDisplay] = useState<string>(typeof value === 'string' ? value : '')
  useEffect(() => {
    if (typeof value === 'number') {
      if (count < value) {
        const timeout = setTimeout(() => {
          setCount((prev) => Math.min(prev + 1, value))
        }, 50)
        return () => clearTimeout(timeout)
      }
    } else if (typeof value === 'string') {
      setDisplay(value)
    }
  }, [count, value])
  return (
    <Card className="bg-accent/10 border-accent/20">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-accent/20 p-3">{icon}</div>
          <div>
            <div className="text-2xl md:text-3xl font-bold text-accent break-words leading-tight">
              {typeof value === 'number' ? count : display}
            </div>
            <div className="text-sm text-muted-foreground">{label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ConcludeExperimentPage() {
  const params = useParams();
  const router = useRouter();
  const experimentId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [experiment, setExperiment] = useState<any>(null);
  const [contributors, setContributors] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEventsExpanded, setIsEventsExpanded] = useState(false)
  const [isFilesExpanded, setIsFilesExpanded] = useState(false)
  const [isContributorsExpanded, setIsContributorsExpanded] = useState(false)
  const [conclusionDescription, setConclusionDescription] = useState("")
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showMetrics, setShowMetrics] = useState(false)
  const [loadingDots, setLoadingDots] = useState(0)

  useEffect(() => {
    if (!experimentId) return;
    setLoading(true);
    // Fetch experiment details
    supabase.from("experiments").select("*").eq("id", experimentId).single().then(({ data, error }) => {
      setExperiment(data);
      setLoading(false);
    });
    // Fetch contributors and their profiles manually
    (async () => {
      const { data: contribs, error: contribErr } = await supabase
        .from("experiment_contributors")
        .select("*")
        .eq("experiment_id", experimentId);
      if (contribErr || !contribs) {
        setContributors([]);
        return;
      }
      const userIds = Array.from(new Set(contribs.map((c: any) => c.user_id)));
      if (userIds.length === 0) {
        setContributors([]);
        return;
      }
      const { data: profiles, error: profErr } = await supabase
        .from("profiles")
        .select("user_id, username, profilePic")
        .in("user_id", userIds);
      const profileMap: Record<string, any> = {};
      (profiles || []).forEach((p: any) => { profileMap[p.user_id] = p; });
      const merged = contribs.map((c: any) => ({ ...c, profile: profileMap[c.user_id] || null }));
      setContributors(merged);
    })();
    // Fetch files
    supabase.from("experiment_files").select("*").eq("experiment_id", experimentId).then(({ data }) => {
      setFiles(data || []);
    });
    // Fetch events/activity
    supabase.from("experiment_activity").select("*").eq("experiment_id", experimentId).order("created_at", { ascending: true }).then(({ data }) => {
      setEvents(data || []);
    });
  }, [experimentId]);

  // Helper for detailed elapsed time
  function getDetailedElapsedTime(start: Date) {
    const now = new Date();
    let years = differenceInYears(now, start);
    let months = differenceInMonths(now, start) % 12;
    let days = differenceInDays(now, start) % 30;
    let hours = differenceInHours(now, start) % 24;
    let minutes = differenceInMinutes(now, start) % 60;
    let seconds = differenceInSeconds(now, start) % 60;
    let parts = [];
    if (years) parts.push(`${years}y`);
    if (months) parts.push(`${months}mo`);
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    if (seconds || parts.length === 0) parts.push(`${seconds}s`);
    return parts.join(" ");
  }

  // Calculate running time
  const runningTime = experiment?.created_at ? getDetailedElapsedTime(new Date(experiment.created_at)) : "-";

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMetrics(true)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  // Helper function to get file icon based on type
  const getFileIcon = (type: string) => {
    switch ((type || "").toLowerCase()) {
      case "csv":
      case "xlsx":
        return <FileIcon className="h-4 w-4 text-blue-500" />
      case "py":
      case "js":
        return <FileIcon className="h-4 w-4 text-green-500" />
      case "json":
        return <FileIcon className="h-4 w-4 text-yellow-500" />
      default:
        return <FileIcon className="h-4 w-4 text-accent" />
    }
  }

  // Helper function to get event icon based on type
  const getEventIcon = (type: string) => {
    switch (type) {
      case "creation":
        return <Beaker className="h-4 w-4 text-accent" />
      case "file_upload":
      case "file_uploaded":
      case "file_added_from_lab":
        return <FileIcon className="h-4 w-4 text-accent" />
      case "comment":
        return <MessageSquare className="h-4 w-4 text-accent" />
      case "milestone":
        return <CheckCircle className="h-4 w-4 text-accent" />
      default:
        return <MessageSquare className="h-4 w-4 text-accent" />
    }
  }

  // Loading animation effect for dots
  useEffect(() => {
    let interval: any;
    if (isSubmitting && !isSuccess) {
      interval = setInterval(() => {
        setLoadingDots((prev) => (prev + 1) % 4)
      }, 400)
    } else {
      setLoadingDots(0)
    }
    return () => clearInterval(interval)
  }, [isSubmitting, isSuccess])

  const handleConcludeExperiment = async () => {
    if (!selectedOutcome) {
      toast({ title: "Please select an outcome assessment.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    // Cool loading animation for 1.5s
    await new Promise((res) => setTimeout(res, 1500));
    // Update experiment in Supabase
    const { error } = await supabase
      .from("experiments")
      .update({
        closed_status: "CLOSED",
        conclusion_tag: selectedOutcome,
        conclusion_description: conclusionDescription || null,
        end_date: new Date().toISOString(),
      })
      .eq("id", experiment.id);
    setIsSubmitting(false);
    if (!error) {
      setIsSuccess(true);
    } else {
      toast({ title: "Failed to conclude experiment.", description: error.message, variant: "destructive" });
    }
  };

  const isClosed = experiment?.closed_status === "CLOSED";

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading experiment data...</div>;
  }

  if (!experiment) {
    return <div className="p-8 text-center text-destructive">Experiment not found.</div>;
  }

  if (isSuccess || isClosed) {
    return (
      <div className="container mx-auto py-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-accent mx-auto animate-pulse" />
          <h1 className="text-2xl font-bold">Experiment Concluded Successfully</h1>
          <p className="text-muted-foreground">
            The experiment has been marked as concluded and all data has been saved.
          </p>
          {experiment?.lab_id && (
            <Link href={`/lab/${experiment.lab_id}`}>
              <Button className="mt-4">Back to My Lab</Button>
            </Link>
          )}
        </div>
        {/* Show summary of conclusion assessment and description */}
        <div className="mt-8 w-full max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Conclusion Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Outcome Assessment</h3>
                  <Badge className="bg-red-100 text-red-600 border-red-200 text-base px-3 py-1">
                    {experiment.conclusion_tag ? experiment.conclusion_tag.replace(/-/g, ' ').toUpperCase() : "CONCLUDED"}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Conclusion Description</h3>
                  <p className="text-sm whitespace-pre-line">
                    {experiment.conclusion_description || <span className="text-muted-foreground">No description provided.</span>}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Concluded At</h3>
                  <p className="text-sm">
                    {experiment.end_date ? new Date(experiment.end_date).toLocaleString() : "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isClosed) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          {experiment?.lab_id && (
            <Link href={`/lab/${experiment.lab_id}`} className="flex items-center text-sm hover:underline">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to My Lab
            </Link>
          )}
        </div>
        <div className="flex flex-col space-y-8">
          {/* Experiment Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-accent/20 p-2 rounded-lg">
                  <Beaker className="h-6 w-6 text-accent" />
                </div>
                <h1 className="text-2xl font-bold">Conclude Experiment: {experiment.name}</h1>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {experiment.categories?.map((category: string) => (
                  <Badge key={category} className="bg-accent text-primary-foreground">
                    {category.toUpperCase()}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Started: {experiment.created_at ? new Date(experiment.created_at).toLocaleDateString() : "-"}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Time Elapsed: {experiment.created_at ? getDetailedElapsedTime(new Date(experiment.created_at)) : "-"}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Experiment Summary Banner */}
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-6 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-500">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">Experiment Summary</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              This experiment has concluded. Below is the final summary.
            </p>
            {/* Animated Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <AnimatedCounter
                value={events.length}
                label="Total Events"
                icon={<MessageSquare className="h-5 w-5 text-accent" />}
              />
              <AnimatedCounter
                value={files.length}
                label="Materials Used"
                icon={<FileIcon className="h-5 w-5 text-accent" />}
              />
              <AnimatedCounter
                value={contributors.filter((c, i, arr) => arr.findIndex(x => x.user_id === c.user_id) === i).length}
                label="Contributors"
                icon={<Users className="h-5 w-5 text-accent" />}
              />
              <AnimatedCounter
                value={experiment?.created_at ? getDetailedElapsedTime(new Date(experiment.created_at)) : "-"}
                label="Time Elapsed"
                icon={<Timer className="h-5 w-5 text-accent" />}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Experiment Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Experiment Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">OBJECTIVE</h3>
                      <p className="text-sm">{experiment.objective}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Conclusion Details (read-only) */}
              <Card>
                <CardHeader>
                  <CardTitle>Conclusion Details</CardTitle>
                  <CardDescription>Final summary of the experiment's outcomes and assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Conclusion Description</Label>
                      <div className="min-h-[80px] p-2 border rounded bg-muted/30 text-muted-foreground">
                        {experiment.conclusion_description || <span className="text-muted-foreground">No description provided.</span>}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Outcome Assessment</Label>
                      <div className="p-2 border rounded bg-muted/30 text-muted-foreground font-semibold">
                        {experiment.conclusion_tag ? experiment.conclusion_tag.replace(/-/g, ' ').toUpperCase() : "CONCLUDED"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              {/* Events Timeline (read-only) */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Events Timeline</CardTitle>
                    <Badge variant="outline">{events.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-2 text-sm">
                    {events.slice(0, 6).map((event: any) => (
                      <div
                        key={event.id || event.activity_id}
                        className="flex items-start gap-2 p-1.5 rounded-md bg-secondary/30 text-xs"
                      >
                        {getEventIcon(event.activity_type || event.type)}
                        <div>
                          <p className="font-medium">{event.activity_name || event.description}</p>
                          <p className="text-muted-foreground text-xs">
                            {event.performed_by || event.user} • {event.created_at ? new Date(event.created_at).toLocaleDateString() : event.date}
                          </p>
                        </div>
                      </div>
                    ))}
                    {events.length > 6 && (
                      <div className="text-xs text-muted-foreground mt-2">...and {events.length - 6} more events</div>
                    )}
                  </div>
                </CardContent>
              </Card>
              {/* Materials Used (read-only) */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Materials Used</CardTitle>
                    <Badge variant="outline">{files.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-2 text-sm">
                    {files.slice(0, 6).map((file: any) => (
                      <div
                        key={file.id}
                        className="flex items-start gap-2 p-1.5 rounded-md bg-secondary/30 text-xs"
                      >
                        {getFileIcon(file.file?.split('.').pop() || file.type)}
                        <div>
                          <p className="font-medium">{file.file || file.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {file.file_size || file.size} • {file.added_by || file.addedBy}
                          </p>
                        </div>
                      </div>
                    ))}
                    {files.length > 6 && (
                      <div className="text-xs text-muted-foreground mt-2">...and {files.length - 6} more files</div>
                    )}
                  </div>
                </CardContent>
              </Card>
              {/* Contributors (read-only) */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Contributors</CardTitle>
                    <Badge variant="outline">{contributors.filter((c, i, arr) => arr.findIndex(x => x.user_id === c.user_id) === i).length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="flex flex-wrap gap-2">
                    {contributors
                      .filter((c, i, arr) => arr.findIndex(x => x.user_id === c.user_id) === i)
                      .slice(0, 6)
                      .map((contributor: any) => (
                        <div
                          key={contributor.user_id || contributor.id}
                          className="flex items-center gap-1.5 bg-secondary/30 rounded-full px-2 py-1 text-xs"
                        >
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={contributor.profile?.profilePic || "/placeholder.svg"} alt={contributor.profile?.username || contributor.user_id} />
                            <AvatarFallback className="text-[10px]">{(contributor.profile?.username || contributor.user_id || "U").slice(0,2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span>{contributor.profile?.username || contributor.user_id}</span>
                        </div>
                      ))}
                    {contributors.filter((c, i, arr) => arr.findIndex(x => x.user_id === c.user_id) === i).length > 6 && (
                      <div className="text-xs text-muted-foreground mt-2">...and {contributors.filter((c, i, arr) => arr.findIndex(x => x.user_id === c.user_id) === i).length - 6} more contributors</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href={`/newexperiments/${experiment.id}`} className="flex items-center text-sm hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Experiment
        </Link>
      </div>

      <div className="flex flex-col space-y-8">
        {/* Experiment Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-accent/20 p-2 rounded-lg">
                <Beaker className="h-6 w-6 text-accent" />
              </div>
              <h1 className="text-2xl font-bold">Conclude Experiment: {experiment.name}</h1>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {experiment.categories?.map((category: string) => (
                <Badge key={category} className="bg-accent text-primary-foreground">
                  {category.toUpperCase()}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Started: {experiment.created_at ? new Date(experiment.created_at).toLocaleDateString() : "-"}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>Running: {runningTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Experiment Summary Banner */}
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-6 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-500">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-semibold">Experiment Summary</h2>
          </div>

          <p className="text-muted-foreground mb-6">
            Please review the final summary of your experiment and confirm conclude below
          </p>

          {/* Animated Metrics */}
          <div
            className={`grid grid-cols-1 md:grid-cols-4 gap-4 transition-all duration-1000 ${showMetrics ? "opacity-100 transform-none" : "opacity-0 translate-y-4"}`}
          >
            <AnimatedCounter
              value={events.length}
              label="Total Events"
              icon={<MessageSquare className="h-5 w-5 text-accent" />}
            />
            <AnimatedCounter
              value={files.length}
              label="Materials Used"
              icon={<FileIcon className="h-5 w-5 text-accent" />}
            />
            <AnimatedCounter
              value={contributors.filter((c, i, arr) => arr.findIndex(x => x.user_id === c.user_id) === i).length}
              label="Contributors"
              icon={<Users className="h-5 w-5 text-accent" />}
            />
            <AnimatedCounter
              value={experiment?.created_at ? getDetailedElapsedTime(new Date(experiment.created_at)) : "-"}
              label="Time Elapsed"
              icon={<Timer className="h-5 w-5 text-accent" />}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Experiment Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Experiment Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">OBJECTIVE</h3>
                    <p className="text-sm">{experiment.objective}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conclusion Details */}
            <Card>
              <CardHeader>
                <CardTitle>Conclusion Details</CardTitle>
                <CardDescription>Provide a summary of the experiment's outcomes and your assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="conclusion-description" className="text-sm font-medium">
                      Conclusion Description
                    </Label>
                    <Textarea
                      id="conclusion-description"
                      placeholder="Describe the outcomes, findings, and conclusions of this experiment..."
                      className="min-h-[150px]"
                      value={conclusionDescription}
                      onChange={(e) => setConclusionDescription(e.target.value)}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Outcome Assessment</Label>
                    <RadioGroup value={selectedOutcome || ""} onValueChange={setSelectedOutcome}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {outcomeOptions.map((option) => (
                          <div key={option.id} className="flex items-start space-x-2">
                            <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                            <div className="grid gap-1 leading-none">
                              <Label htmlFor={option.id} className="font-medium">
                                {option.label}
                              </Label>
                              <p className="text-xs text-muted-foreground">{option.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Compact Summaries */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Events Timeline</CardTitle>
                  <Badge variant="outline">{events.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <Collapsible open={isEventsExpanded} onOpenChange={setIsEventsExpanded}>
                  <div className="space-y-2 text-sm">
                    {events.slice(0, isEventsExpanded ? undefined : 3).map((event: any) => (
                      <div
                        key={event.id || event.activity_id}
                        className="flex items-start gap-2 p-1.5 rounded-md hover:bg-secondary/50 text-xs"
                      >
                        {getEventIcon(event.activity_type || event.type)}
                        <div>
                          <p className="font-medium">{event.activity_name || event.description}</p>
                          <p className="text-muted-foreground text-xs">
                            {event.performed_by || event.user} • {event.created_at ? new Date(event.created_at).toLocaleDateString() : event.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {events.length > 3 && (
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full mt-2 h-7 text-xs">
                        {isEventsExpanded ? "Show Less" : `Show All (${events.length})`}
                        <ChevronDown
                          className={`h-3 w-3 ml-1 transition-transform ${isEventsExpanded ? "rotate-180" : ""}`}
                        />
                      </Button>
                    </CollapsibleTrigger>
                  )}
                </Collapsible>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Materials Used</CardTitle>
                  <Badge variant="outline">{files.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <Collapsible open={isFilesExpanded} onOpenChange={setIsFilesExpanded}>
                  <div className="space-y-2 text-sm">
                    {files.slice(0, isFilesExpanded ? undefined : 3).map((file: any) => (
                      <div
                        key={file.id}
                        className="flex items-start gap-2 p-1.5 rounded-md hover:bg-secondary/50 text-xs"
                      >
                        {getFileIcon(file.file?.split('.').pop() || file.type)}
                        <div>
                          <p className="font-medium">{file.file || file.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {file.file_size || file.size} • {file.added_by || file.addedBy}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {files.length > 3 && (
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full mt-2 h-7 text-xs">
                        {isFilesExpanded ? "Show Less" : `Show All (${files.length})`}
                        <ChevronDown
                          className={`h-3 w-3 ml-1 transition-transform ${isFilesExpanded ? "rotate-180" : ""}`}
                        />
                      </Button>
                    </CollapsibleTrigger>
                  )}
                </Collapsible>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Contributors</CardTitle>
                  <Badge variant="outline">{contributors.filter((c, i, arr) => arr.findIndex(x => x.user_id === c.user_id) === i).length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <Collapsible open={isContributorsExpanded} onOpenChange={setIsContributorsExpanded}>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {contributors
                        .filter((c, i, arr) => arr.findIndex(x => x.user_id === c.user_id) === i)
                        .slice(0, isContributorsExpanded ? undefined : 3)
                        .map((contributor: any) => (
                          <div
                            key={contributor.user_id || contributor.id}
                            className="flex items-center gap-1.5 bg-secondary/50 rounded-full px-2 py-1 text-xs"
                          >
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={contributor.profile?.profilePic || "/placeholder.svg"} alt={contributor.profile?.username || contributor.user_id} />
                              <AvatarFallback className="text-[10px]">{(contributor.profile?.username || contributor.user_id || "U").slice(0,2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span>{contributor.profile?.username || contributor.user_id}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {contributors.filter((c, i, arr) => arr.findIndex(x => x.user_id === c.user_id) === i).length > 3 && (
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full mt-2 h-7 text-xs">
                        {isContributorsExpanded ? "Show Less" : `Show All (${contributors.filter((c, i, arr) => arr.findIndex(x => x.user_id === c.user_id) === i).length})`}
                        <ChevronDown
                          className={`h-3 w-3 ml-1 transition-transform ${isContributorsExpanded ? "rotate-180" : ""}`}
                        />
                      </Button>
                    </CollapsibleTrigger>
                  )}
                </Collapsible>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button
            onClick={handleConcludeExperiment}
            className="bg-accent text-primary-foreground hover:bg-accent/90"
            disabled={isSubmitting || !selectedOutcome}
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Concluding Experiment{'.'.repeat(loadingDots)}
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Conclude Experiment
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
} 