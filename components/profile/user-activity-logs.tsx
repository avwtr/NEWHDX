import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Beaker, FileText, Database, MessageSquare, GitBranch, Calendar, Filter } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"

interface UserActivityLogsProps {
  userId: string
  userName: string
  userProfilePic?: string | null
  isOwnProfile?: boolean
}

export function UserActivityLogs({ userId, userName, userProfilePic, isOwnProfile = false }: UserActivityLogsProps) {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [labMap, setLabMap] = useState<Record<string, any>>({})

  useEffect(() => {
    if (!userId) return;
    setLoading(true)
    setError(null)
    supabase
      .from("activity")
      .select("*")
      .eq("performed_by", userId)
      .order("created_at", { ascending: false })
      .then(async ({ data, error }) => {
        if (error) {
          setError(error.message)
          setActivities([])
          setLoading(false)
          return
        }
        let activitiesData = data || []
        
        // If viewing someone else's profile, filter activities to only show those from public labs
        if (!isOwnProfile) {
          // Batch fetch labs to check visibility
          const uniqueLabIds = Array.from(new Set(activitiesData.map((a: any) => a.lab_from).filter(Boolean)))
          let labMap: Record<string, any> = {}
          if (uniqueLabIds.length) {
            const { data: labs } = await supabase
              .from("labs")
              .select("labId, labName, profilePic, description, public_private")
              .in("labId", uniqueLabIds)
            if (labs) {
              labs.forEach((lab: any) => {
                labMap[lab.labId] = {
                  name: lab.labName,
                  profilePic: lab.profilePic || "/science-lab-setup.png",
                  description: lab.description,
                  public_private: lab.public_private
                }
              })
            }
          }
          // Filter activities to only show those from public labs
          activitiesData = activitiesData.filter((activity: any) => {
            const lab = labMap[activity.lab_from]
            return lab && (lab.public_private === 'public' || lab.public_private === null)
          })
          setLabMap(labMap)
        } else {
          // For own profile, fetch all labs without filtering
          const uniqueLabIds = Array.from(new Set(activitiesData.map((a: any) => a.lab_from).filter(Boolean)))
          let labMap: Record<string, any> = {}
          if (uniqueLabIds.length) {
            const { data: labs } = await supabase
              .from("labs")
              .select("labId, labName, profilePic, description")
              .in("labId", uniqueLabIds)
            if (labs) {
              labs.forEach((lab: any) => {
                labMap[lab.labId] = {
                  name: lab.labName,
                  profilePic: lab.profilePic || "/science-lab-setup.png",
                  description: lab.description
                }
              })
            }
          }
          setLabMap(labMap)
        }
        
        setActivities(activitiesData)
        setLoading(false)
      })
  }, [userId])

  const getActivityTypeColor = (type: string) => {
    const types: Record<string, string> = {
      fileupload: "bg-blue-100 text-blue-800",
      documentation: "bg-purple-100 text-purple-800",
      comment: "bg-green-100 text-green-800",
      fork: "bg-amber-100 text-amber-800",
      experiment: "bg-red-100 text-red-800",
      filecreated: "bg-blue-100 text-blue-800",
      filedelete: "bg-red-100 text-red-800",
      filemoved: "bg-yellow-100 text-yellow-800",
      fileedited: "bg-purple-100 text-purple-800",
      bulletinposted: "bg-green-100 text-green-800",
      bulletinedited: "bg-purple-100 text-purple-800",
      bulletindeleted: "bg-red-100 text-red-800",
    }
    return types[type] || "bg-gray-100 text-gray-800"
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "fileupload":
      case "filecreated":
      case "filedelete":
      case "filemoved":
      case "fileedited":
        return <Database className="h-4 w-4" />
      case "documentation":
      case "bulletinposted":
      case "bulletinedited":
      case "bulletindeleted":
        return <FileText className="h-4 w-4" />
      case "comment":
        return <MessageSquare className="h-4 w-4" />
      case "fork":
        return <GitBranch className="h-4 w-4" />
      case "experiment":
        return <Beaker className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Recent Activity</h3>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Activity Timeline</CardTitle>
          <CardDescription>Your recent contributions and interactions across all labs</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">Loading activity...</div>
          ) : error ? (
            <div className="py-8 text-center text-red-500">{error}</div>
          ) : activities.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No activity found.</div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="relative pl-6 border-l">
                {activities.map((activity, index) => {
                  const labName = labMap[activity.lab_from]?.name || `Lab ${activity.lab_from?.slice(0, 6) || "?"}`
                  const avatar = userProfilePic || "/placeholder.svg?height=40&width=40"
                  return (
                    <div key={activity.id || activity.activity_id || activity.created_at || index} className="mb-6 relative">
                      {/* Timeline dot */}
                      <div className="absolute w-3 h-3 bg-primary rounded-full -left-[25px] top-1.5 border-4 border-background"></div>

                      <div className="flex flex-col">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Link href={`/lab/${activity.lab_from || "#"}`} className="font-medium hover:underline flex items-center gap-2">
                              <div className="relative h-6 w-6 rounded-md overflow-hidden border border-secondary">
                                <Image
                                  src={labMap[activity.lab_from]?.profilePic || "/science-lab-setup.png"}
                                  alt={labMap[activity.lab_from]?.name || "Lab"}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              {labMap[activity.lab_from]?.name || "Unknown Lab"}
                            </Link>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {activity.created_at ? new Date(activity.created_at).toLocaleString() : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 ml-8 mt-1 mb-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={avatar} alt={userName} />
                            <AvatarFallback>{userName?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">{userName}</span>
                        </div>
                        <p className="ml-8 text-sm">{activity.activity_name || activity.description || "No description"}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
