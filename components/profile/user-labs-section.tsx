import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Beaker, Users, FileText, FlaskConical, DollarSign } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UserLabsSectionProps {
  userId: string
  isOwnProfile?: boolean
  onLabsCountChange?: (count: number) => void
}

export function UserLabsSection({ userId, isOwnProfile = false, onLabsCountChange }: UserLabsSectionProps) {
  const [allLabs, setAllLabs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orgMap, setOrgMap] = useState<Record<string, any>>({})
  const [metricsMap, setMetricsMap] = useState<Record<string, any>>({})
  const [sortOption, setSortOption] = useState<string>("role")
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["Founder", "Member", "Contributor", "Follower"])

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    setError(null)
    // Fetch labs founded by user
    const foundedPromise = supabase
      .from('labs')
      .select('*')
      .eq('createdBy', userId)
      .then(async (res) => {
        if (res.error) return res
        if (isOwnProfile) return res
        // For other users' profiles, filter to only public labs
        const filtered = (res.data || []).filter((lab: any) => 
          lab.public_private === 'public' || lab.public_private === null
        )
        return { ...res, data: filtered }
      })

    // Fetch lab memberships, then fetch labs by those IDs
    const memberPromise = supabase
      .from('labMembers')
      .select('lab_id')
      .eq('user', userId)
      .then(async (res) => {
        if (res.error) return { data: [], error: res.error }
        const labIds = (res.data || [])
          .map((m: any) => m.lab_id)
          .filter((id: string | null | undefined) => !!id && id !== "null");
        if (!labIds.length) return { data: [], error: null }
        const labsRes = await supabase
          .from('labs')
          .select('*')
          .in('labId', labIds)
        
        if (labsRes.error) return labsRes
        if (isOwnProfile) return labsRes
        
        // For other users' profiles, filter to only public labs
        const filtered = (labsRes.data || []).filter((lab: any) => 
          lab.public_private === 'public' || lab.public_private === null
        )
        return { ...labsRes, data: filtered }
      })

    // Fetch labs the user follows
    const followerPromise = supabase
      .from('labFollowers')
      .select('labId')
      .eq('userId', userId)
      .then(async (res) => {
        if (res.error) return { data: [], error: res.error }
        const labIds = (res.data || [])
          .map((m: any) => m.labId)
          .filter((id: string | null | undefined) => !!id && id !== "null");
        if (!labIds.length) return { data: [], error: null }
        const labsRes = await supabase
          .from('labs')
          .select('*')
          .in('labId', labIds)
        
        if (labsRes.error) return labsRes
        if (isOwnProfile) return labsRes
        
        // For other users' profiles, filter to only public labs
        const filtered = (labsRes.data || []).filter((lab: any) => 
          lab.public_private === 'public' || lab.public_private === null
        )
        return { ...labsRes, data: filtered }
      })

    // Fetch labs contributed to
    const contributorPromise = supabase
      .from('labContributors')
      .select('labId:labId')
      .eq('userId', userId)
      .then(async (res) => {
        if (res.error) return { data: [], error: res.error }
        const labIds = (res.data || [])
          .map((m: any) => m.labId)
          .filter((id: string | null | undefined) => !!id && id !== "null");
        if (!labIds.length) return { data: [], error: null }
        const labsRes = await supabase
          .from('labs')
          .select('*')
          .in('labId', labIds)
        
        if (labsRes.error) return labsRes
        if (isOwnProfile) return labsRes
        
        // For other users' profiles, filter to only public labs
        const filtered = (labsRes.data || []).filter((lab: any) => 
          lab.public_private === 'public' || lab.public_private === null
        )
        return { ...labsRes, data: filtered }
      })

    Promise.all([foundedPromise, memberPromise, followerPromise, contributorPromise]).then(async ([foundedRes, memberRes, followerRes, contributorRes]) => {
      if (foundedRes.error) setError(foundedRes.error.message)
      if (memberRes.error) setError(memberRes.error.message)
      if (followerRes.error) setError(followerRes.error.message)
      if (contributorRes.error) setError(contributorRes.error.message)
      // Merge and dedupe labs, add role
      const founded = (foundedRes.data || []).map((lab: any) => ({ ...lab, _role: 'Founder' }))
      const member = (memberRes.data || []).map((lab: any) => ({ ...lab, _role: 'Member' }))
      const follower = (followerRes.data || []).map((lab: any) => ({ ...lab, _role: 'Follower' }))
      const contributor = (contributorRes.data || []).map((lab: any) => ({ ...lab, _role: 'Contributor' }))
      const all: Record<string, any> = {}
      // Precedence: Founder > Member > Contributor > Follower
      founded.forEach(lab => { all[lab.labId] = lab })
      member.forEach(lab => {
        if (!all[lab.labId]) all[lab.labId] = lab
      })
      contributor.forEach(lab => {
        if (!all[lab.labId]) all[lab.labId] = lab
      })
      follower.forEach(lab => {
        if (!all[lab.labId]) all[lab.labId] = lab
      })
      // Sort by role precedence, then name
      const roleOrder = { Founder: 0, Member: 1, Contributor: 2, Follower: 3 }
      // Show all labs - if user is admin/founder/member of a private lab, they should see it
      // The labs are already filtered by the user's memberships/contributions, so we don't need to filter by visibility
      let labsList = Object.values(all)
      // Fetch org info for all labs
      const orgIds = [...new Set(labsList.map(l => l.org_id).filter(Boolean))]
      if (orgIds.length > 0) {
        const { data: orgs } = await supabase
          .from('organizations')
          .select('org_id, org_name, profilePic, slug')
          .in('org_id', orgIds)
        if (orgs) {
          const orgMap: Record<string, any> = {}
          orgs.forEach(org => {
            orgMap[org.org_id] = org
          })
          setOrgMap(orgMap)
        }
      }
      // Fetch metrics for all labs
      const labIds = labsList.map(l => l.labId)
      if (labIds.length > 0) {
        // Fetch members count
        const { data: members } = await supabase
          .from('labMembers')
          .select('lab_id')
          .in('lab_id', labIds)
        // Fetch files count
        const { data: files } = await supabase
          .from('files')
          .select('labID')
          .in('labID', labIds)
        // Fetch experiments count
        const { data: experiments } = await supabase
          .from('experiments')
          .select('lab_id')
          .in('lab_id', labIds)
        // Fetch funding info
        let fundingMap: Record<string, { goal: number, raised: number }> = {};
        if (labIds.length > 0) {
          const { data: fundingGoals } = await supabase
            .from("funding_goals")
            .select("lab_id, amount_contributed, goal_amount");
          if (fundingGoals) {
            fundingGoals.forEach(fg => {
              if (!fundingMap[fg.lab_id]) fundingMap[fg.lab_id] = { goal: 0, raised: 0 };
              fundingMap[fg.lab_id].goal += fg.goal_amount || 0;
              fundingMap[fg.lab_id].raised += fg.amount_contributed || 0;
            });
          }
        }

        const metricsMap: Record<string, any> = {}
        labIds.forEach(labId => {
          metricsMap[labId] = {
            members: (members || []).filter((m: any) => m.lab_id === labId).length,
            files: (files || []).filter((f: any) => f.labID === labId).length,
            experiments: (experiments || []).filter((e: any) => e.lab_id === labId).length,
            funding: fundingMap[labId] || { goal: 0, raised: 0 }
          }
        })
        setMetricsMap(metricsMap)
      }

      setAllLabs(labsList)
      setLoading(false)
      if (onLabsCountChange) {
        onLabsCountChange(labsList.length)
      }
    })
  }, [userId, onLabsCountChange])

  // Filtering logic
  const getFilteredLabs = () => {
    return allLabs.filter((lab: any) => selectedRoles.includes(lab._role))
  }

  // Sorting logic
  const getSortedLabs = () => {
    const roleOrder = { Founder: 0, Member: 1, Contributor: 2, Follower: 3 }
    return [...getFilteredLabs()].sort((a: any, b: any) => {
      if (sortOption === "role") {
        const roleA = roleOrder[a._role as keyof typeof roleOrder] ?? 99
        const roleB = roleOrder[b._role as keyof typeof roleOrder] ?? 99
        if (roleA !== roleB) return roleA - roleB
        return (a.labName || a.name || '').localeCompare(b.labName || b.name || '')
      } else if (sortOption === "name") {
        return (a.labName || a.name || '').localeCompare(b.labName || b.name || '')
      } else if (sortOption === "files") {
        const filesA = metricsMap[a.labId]?.files || 0
        const filesB = metricsMap[b.labId]?.files || 0
        return filesB - filesA
      } else if (sortOption === "experiments") {
        const expA = metricsMap[a.labId]?.experiments || 0
        const expB = metricsMap[b.labId]?.experiments || 0
        return expB - expA
      } else if (sortOption === "funding") {
        const fundA = metricsMap[a.labId]?.funding?.raised || 0
        const fundB = metricsMap[b.labId]?.funding?.raised || 0
        return fundB - fundA
      }
      return 0
    })
  }

  // Role badge toggle handler
  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  const renderLabCard = (lab: any) => {
    const metrics = metricsMap[lab.labId] || { members: 0, files: 0, experiments: 0, funding: { goal: 0, raised: 0 } }
    const org = orgMap[lab.org_id]
    const fundingProgress = metrics.funding.goal > 0 ? (metrics.funding.raised / metrics.funding.goal) * 100 : 0
    const raised = metrics.funding.raised || 0
    const goal = metrics.funding.goal || 0

    return (
      <Card key={lab.labId} className="mb-4 border-accent">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 rounded-md overflow-hidden border-2 border-accent">
                <Image
                  src={lab.profilePic || "/science-lab-setup.png"}
                  alt="Lab Logo"
                  width={64}
                  height={64}
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div>
                <CardTitle className="text-lg">{lab.labName || lab.name}</CardTitle>
                {org && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="relative h-6 w-6 rounded-full overflow-hidden border border-secondary">
                      <Image
                        src={org.profilePic || "/placeholder.svg"}
                        alt={org.org_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Link href={`/orgs/${org.slug}`} className="text-xs text-muted-foreground font-medium hover:underline truncate max-w-[120px]">
                      {org.org_name}
                    </Link>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mt-1">
                  {(lab.categories || []).map((cat: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="mr-2 mb-2">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <Badge
              className={lab._role === "Founder" ? "bg-primary text-primary-foreground" : lab._role === "Follower" ? "bg-muted text-muted-foreground border" : ""}
              variant={lab._role === "Member" ? "secondary" : undefined}
            >
              {lab._role}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <CardDescription className="mb-4">{lab.description}</CardDescription>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">{metrics.members}</div>
                <div className="text-xs text-muted-foreground">Members</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">{metrics.files}</div>
                <div className="text-xs text-muted-foreground">Files</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">{metrics.experiments}</div>
                <div className="text-xs text-muted-foreground">Experiments</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">
                  ${raised.toLocaleString()} / ${goal.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Funding</div>
              </div>
            </div>
          </div>
          {goal > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Funding Progress</span>
                <span>${raised.toLocaleString()} of ${goal.toLocaleString()}</span>
              </div>
              <Progress value={fundingProgress} className="h-2" />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button asChild variant="ghost" className="ml-auto" size="sm">
            <Link href={`/lab/${lab.labId}`}>
              Visit Lab <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (loading) {
    return <div className="py-8 text-center">Loading labs...</div>
  }
  if (error) {
    return <div className="py-8 text-center text-red-500">{error}</div>
  }

  const roleOptions = ["Founder", "Member", "Contributor", "Follower"]

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
        <div className="flex flex-wrap gap-2 items-center">
          {roleOptions.map((role) => (
            <Badge
              key={role}
              onClick={() => toggleRole(role)}
              className={`cursor-pointer px-3 py-1 text-sm border ${selectedRoles.includes(role) ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-muted"}`}
              variant={selectedRoles.includes(role) ? "default" : "secondary"}
              style={{ userSelect: "none" }}
            >
              {role}
            </Badge>
          ))}
        </div>
        <Select value={sortOption} onValueChange={setSortOption}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="role">Role (Founder &gt; ...)</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="files">Most Files</SelectItem>
            <SelectItem value="experiments">Most Experiments</SelectItem>
            <SelectItem value="funding">Most Funding Raised</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {allLabs.length === 0 ? (
        <div className="text-muted-foreground">No labs found.</div>
      ) : (
        getSortedLabs().map((lab) => renderLabCard(lab))
      )}
    </div>
  )
}
