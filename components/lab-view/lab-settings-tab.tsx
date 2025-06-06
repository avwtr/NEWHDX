"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, Search, Filter, AlertCircle, FileText, Code, Database } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SettingsDialog } from "@/components/settings-dialog"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { researchAreas } from "@/lib/research-areas"

interface LabSettingsTabProps {
  activeSettingsTab: string
  setActiveSettingsTab: (value: string) => void
  setActiveTab: (value: string) => void
  pendingCount: number
  contributionSearch: string
  setContributionSearch: (value: string) => void
  contributionFilter: string
  setContributionFilter: (value: string) => void
  filteredContributions: any[]
  handleViewContribution: (contribution: any) => void
  SettingsDialogComponent?: React.ReactNode
}

export function LabSettingsTab({
  activeSettingsTab,
  setActiveSettingsTab,
  setActiveTab,
  pendingCount,
  contributionSearch,
  setContributionSearch,
  contributionFilter,
  setContributionFilter,
  filteredContributions,
  handleViewContribution,
  SettingsDialogComponent,
  ...props
}: LabSettingsTabProps & { labId?: string }) {
  const [contributions, setContributions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [usernames, setUsernames] = useState<{ [userId: string]: string }>({})
  const [founders, setFounders] = useState<any[]>([])
  const [admins, setAdmins] = useState<any[]>([])
  const [adminProfiles, setAdminProfiles] = useState<{ [userId: string]: any }>({})
  const labId = props.labId

  useEffect(() => {
    if (!labId) return
    setLoading(true)
    supabase
      .from("contribution_requests")
      .select("*")
      .eq("labFrom", labId)
      .order("created_at", { ascending: false })
      .then(async ({ data, error }) => {
        if (!error && data) {
          setContributions(data)
          // Fetch usernames for all unique submittedBy
          const userIds = Array.from(new Set(data.map((c: any) => c.submittedBy)))
          if (userIds.length > 0) {
            const { data: profiles } = await supabase
              .from("profiles")
              .select("user_id, username")
              .in("user_id", userIds)
            const map: { [userId: string]: string } = {}
            profiles?.forEach((p: any) => { map[p.user_id] = p.username })
            setUsernames(map)
          }
        }
        setLoading(false)
      })
  }, [labId])

  useEffect(() => {
    if (!labId) return
    (async () => {
      // Fetch founders and admins from labMembers
      const { data: members, error: membersError } = await supabase
        .from("labMembers")
        .select("user, role")
        .eq("lab_id", labId)
      const founderIds = members?.filter(m => m.role === "founder").map(m => m.user) || []
      const adminIdsFromMembers = members?.filter(m => m.role === "admin").map(m => m.user) || []
      // Fetch admins from labAdmins
      const { data: adminsData, error: adminsError } = await supabase
        .from("labAdmins")
        .select("user")
        .eq("lab_id", labId)
      const adminIdsFromAdmins = adminsData?.map(a => a.user) || []
      // Combine and deduplicate admin IDs
      const allAdminIds = Array.from(new Set([...adminIdsFromMembers, ...adminIdsFromAdmins]))
      setFounders(founderIds)
      setAdmins(allAdminIds)
      // Fetch profiles for all unique IDs
      const allIds = Array.from(new Set([...founderIds, ...allAdminIds]))
      if (allIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, username")
          .in("user_id", allIds)
        const map: { [userId: string]: any } = {}
        profiles?.forEach((p: any) => { map[p.user_id] = p })
        setAdminProfiles(map)
      }
    })()
  }, [labId])

  // Filtering and searching
  const filtered = contributions
    .filter((contribution) => {
      if (contributionFilter === "all") return true
      return contribution.status === contributionFilter
    })
    .filter(
      (contribution) =>
        contribution.title.toLowerCase().includes(contributionSearch.toLowerCase()) ||
        (contribution.description && contribution.description.toLowerCase().includes(contributionSearch.toLowerCase()))
    )

  const pendingCountLocal = contributions.filter((c) => c.status === "pending").length

  return (
    <div className="mt-4">
      {/* --- Founders & Admins Section --- */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>FOUNDERS & ADMINS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Founders first */}
            {founders.map((userId) => (
              <div key={userId} className="flex items-center gap-2 px-3 py-2 rounded bg-secondary/50">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{adminProfiles[userId]?.username?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{adminProfiles[userId]?.username || userId}</div>
                  <div className="text-xs text-accent font-bold uppercase">Founder</div>
                </div>
              </div>
            ))}
            {/* Admins (excluding those who are also founders) */}
            {admins.filter(userId => !founders.includes(userId)).map((userId) => (
              <div key={userId} className="flex items-center gap-2 px-3 py-2 rounded bg-secondary/50">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{adminProfiles[userId]?.username?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{adminProfiles[userId]?.username || userId}</div>
                  <div className="text-xs text-muted-foreground uppercase">Admin</div>
                </div>
              </div>
            ))}
            {founders.length === 0 && admins.length === 0 && (
              <div className="text-muted-foreground">No founders or admins found for this lab.</div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* --- End Founders & Admins Section --- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>SETTINGS</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("overview")}
            className="text-accent hover:bg-secondary"
          >
            <X className="h-4 w-4 mr-1" />
            CLOSE
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs value={activeSettingsTab} onValueChange={setActiveSettingsTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="contributions" className="relative">
                Contributions
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              {SettingsDialogComponent ? SettingsDialogComponent : <SettingsDialog lab={{}} />}
            </TabsContent>

            <TabsContent value="contributions">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 justify-between">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search contributions..."
                      className="pl-8"
                      value={contributionSearch}
                      onChange={(e) => setContributionSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={contributionFilter} onValueChange={setContributionFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border rounded-md">
                  <div className="bg-secondary/50 p-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">
                      {pendingCountLocal} pending contribution{pendingCountLocal !== 1 && "s"} require
                      {pendingCountLocal === 1 && "s"} review
                    </span>
                  </div>
                  <ScrollArea className="h-[400px]">
                    <div className="divide-y divide-secondary">
                      {loading ? (
                        <div className="py-8 text-center text-muted-foreground">Loading...</div>
                      ) : filtered.length > 0 ? (
                        filtered.map((contribution) => (
                          <div
                            key={contribution.id}
                            className="p-4 hover:bg-secondary/20 transition-colors cursor-pointer"
                            onClick={() => handleViewContribution(contribution)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium">{contribution.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                  <span>{usernames[contribution.submittedBy] || contribution.submittedBy}</span>
                                  <span>•</span>
                                  <span>{new Date(contribution.created_at).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm line-clamp-2 mt-1">{contribution.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge
                                className={
                                  ["pending"].includes(contribution.status)
                                    ? "bg-amber-500"
                                    : ["approved", "accepted"].includes(contribution.status)
                                      ? "bg-green-600 text-white"
                                      : "bg-red-600 text-white"
                                }
                              >
                                {["approved", "accepted"].includes(contribution.status) ? "APPROVED" : contribution.status.toUpperCase()}
                              </Badge>
                              {contribution.type && (
                                <Badge variant="outline" className="text-xs">
                                  {contribution.type.toUpperCase()}
                                </Badge>
                              )}
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <FileText className="h-3.5 w-3.5" />
                                <span>
                                  {contribution.num_files} file{contribution.num_files !== 1 && "s"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center text-muted-foreground">
                          <p>No contributions found</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
