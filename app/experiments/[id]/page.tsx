"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, Users, FileIcon, MessageSquare, Timer, BarChart3 } from "lucide-react"
import { format, parseISO, formatDistanceToNow } from "date-fns"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { AnimatedCounter } from "@/components/animated-counter"

export default function ExperimentPage() {
  const params = useParams()
  const experimentId = Array.isArray(params?.id) ? params.id[0] : params?.id
  const [experiment, setExperiment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showMetrics, setShowMetrics] = useState(false)

  useEffect(() => {
    const fetchExperiment = async () => {
      if (!experimentId) return

      try {
        // Fetch experiment details
        const { data: experimentData, error: experimentError } = await supabase
          .from("experiments")
          .select("*")
          .eq("id", experimentId)
          .single()

        if (experimentError) throw experimentError

        // Fetch contributors
        const { data: contributors } = await supabase
          .from("experiment_contributors")
          .select("*, profiles:user_id(username, profilePic)")
          .eq("experiment_id", experimentId)

        // Fetch files
        const { data: files } = await supabase
          .from("experiment_files")
          .select("*")
          .eq("experiment_id", experimentId)

        // Fetch events/activity
        const { data: events } = await supabase
          .from("experiment_activity")
          .select("*")
          .eq("experiment_id", experimentId)
          .order("created_at", { ascending: false })

        setExperiment({
          ...experimentData,
          contributors: contributors || [],
          files: files || [],
          events: events || [],
        })
      } catch (error) {
        console.error("Error fetching experiment:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchExperiment()

    // Show metrics with a slight delay for animation effect
    const timer = setTimeout(() => {
      setShowMetrics(true)
    }, 800)
    return () => clearTimeout(timer)
  }, [experimentId])

  if (loading) return <div>Loading...</div>
  if (!experiment) return <div>Experiment not found.</div>

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-accent/5">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{experiment.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{experiment.description}</p>
            </div>
            <Badge variant={experiment.status === "LIVE" ? "default" : "secondary"}>
              {experiment.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Experiment Summary */}
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">Experiment Summary</h2>
            </div>

            {/* Animated Metrics */}
            <div
              className={`grid grid-cols-1 md:grid-cols-4 gap-4 transition-all duration-1000 ${
                showMetrics ? "opacity-100 transform-none" : "opacity-0 translate-y-4"
              }`}
            >
              <AnimatedCounter
                value={experiment.events.length}
                label="Total Events"
                icon={<MessageSquare className="h-5 w-5 text-accent" />}
              />
              <AnimatedCounter
                value={experiment.files.length}
                label="Materials Used"
                icon={<FileIcon className="h-5 w-5 text-accent" />}
              />
              <AnimatedCounter
                value={experiment.contributors.length}
                label="Contributors"
                icon={<Users className="h-5 w-5 text-accent" />}
              />
              <AnimatedCounter
                value={experiment.created_at ? formatDistanceToNow(new Date(experiment.created_at), { addSuffix: false }) : "-"}
                label="Time Elapsed"
                icon={<Timer className="h-5 w-5 text-accent" />}
              />
            </div>
          </div>

          {/* Timeline and Contributors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-accent" />
                    <span>Started: {format(parseISO(experiment.created_at), "MMM d, yyyy")}</span>
                  </div>
                  {experiment.endDate && (
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-accent" />
                      <span>Ended: {format(parseISO(experiment.endDate), "MMM d, yyyy")}</span>
                    </div>
                  )}
                  {!experiment.endDate && (
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-accent" />
                      <span>Ongoing</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Contributors</CardTitle>
                  <Badge variant="outline">{experiment.contributors.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex flex-wrap gap-2">
                  {experiment.contributors.map((contributor: any) => (
                    <div
                      key={contributor.user_id}
                      className="flex items-center gap-1.5 bg-secondary/30 rounded-full px-2 py-1 text-xs"
                    >
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={contributor.profiles?.profilePic || "/placeholder.svg"} alt={contributor.profiles?.username} />
                        <AvatarFallback className="text-[10px]">
                          {(contributor.profiles?.username || "U").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{contributor.profiles?.username || contributor.user_id}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Files and Events */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Materials</CardTitle>
                  <Badge variant="outline">{experiment.files.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-2">
                  {experiment.files.map((file: any) => (
                    <div key={file.id} className="flex items-center gap-2 text-sm">
                      <FileIcon className="h-4 w-4 text-accent" />
                      <span>{file.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Recent Activity</CardTitle>
                  <Badge variant="outline">{experiment.events.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-2">
                  {experiment.events.slice(0, 5).map((event: any) => (
                    <div key={event.id} className="flex items-center gap-2 text-sm">
                      <MessageSquare className="h-4 w-4 text-accent" />
                      <span>{event.activity_name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 