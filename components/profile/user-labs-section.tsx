import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Beaker, Users, Plus } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface UserLabsSectionProps {
  userId: string
  onLabsCountChange?: (count: number) => void
}

export function UserLabsSection({ userId, onLabsCountChange }: UserLabsSectionProps) {
  const [allLabs, setAllLabs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    setError(null)
    // Fetch labs founded by user
    const foundedPromise = supabase
      .from('labs')
      .select('*')
      .eq('createdBy', userId)

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
        return labsRes
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
        return labsRes
      })

    Promise.all([foundedPromise, memberPromise, followerPromise]).then(([foundedRes, memberRes, followerRes]) => {
      if (foundedRes.error) setError(foundedRes.error.message)
      if (memberRes.error) setError(memberRes.error.message)
      if (followerRes.error) setError(followerRes.error.message)
      // Merge and dedupe labs, add role
      const founded = (foundedRes.data || []).map((lab: any) => ({ ...lab, _role: 'Founder' }))
      const member = (memberRes.data || []).map((lab: any) => ({ ...lab, _role: 'Member' }))
      const follower = (followerRes.data || []).map((lab: any) => ({ ...lab, _role: 'Follower' }))
      const all: Record<string, any> = {}
      founded.forEach(lab => { all[lab.labId] = lab })
      member.forEach(lab => {
        if (all[lab.labId]) {
          // If already founder, keep founder role
        } else {
          all[lab.labId] = lab
        }
      })
      follower.forEach(lab => {
        if (all[lab.labId]) {
          // If already founder/member, keep higher role
        } else {
          all[lab.labId] = lab
        }
      })
      // Sort by role precedence, then name
      const roleOrder = { Founder: 0, Member: 1, Follower: 2 }
      const labsList = Object.values(all).sort((a: any, b: any) => {
        const roleA = roleOrder[a._role as keyof typeof roleOrder] ?? 99
        const roleB = roleOrder[b._role as keyof typeof roleOrder] ?? 99
        if (roleA !== roleB) return roleA - roleB
        return (a.labName || a.name || '').localeCompare(b.labName || b.name || '')
      })
      setAllLabs(labsList)
      setLoading(false)
      if (onLabsCountChange) {
        onLabsCountChange(labsList.length)
      }
    })
  }, [userId, onLabsCountChange])

  const renderLabCard = (lab: any) => (
    <Card key={lab.labId} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{lab.labName || lab.name}</CardTitle>
            <CardDescription className="mt-1">{lab.description}</CardDescription>
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
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{lab.members || 0} members</span>
          </div>
          <div className="flex items-center">
            <Beaker className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>Activity: {lab.activity || "-"}</span>
          </div>
          <div className="text-muted-foreground text-xs">Last active: {lab.lastActive || "-"}</div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="ghost" className="ml-auto" size="sm">
          <Link href={`/labs/${lab.id}`}>
            Visit Lab <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )

  if (loading) {
    return <div className="py-8 text-center">Loading labs...</div>
  }
  if (error) {
    return <div className="py-8 text-center text-red-500">{error}</div>
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-medium mb-4">Labs</h3>
      {allLabs.length === 0 ? (
        <div className="text-muted-foreground">No labs found.</div>
      ) : (
        allLabs.map((lab) => renderLabCard(lab))
      )}
    </div>
  )
}
