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
  const [foundedLabs, setFoundedLabs] = useState<any[]>([])
  const [memberLabs, setMemberLabs] = useState<any[]>([])
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

    Promise.all([foundedPromise, memberPromise]).then(([foundedRes, memberRes]) => {
      if (foundedRes.error) setError(foundedRes.error.message)
      if (memberRes.error) setError(memberRes.error.message)
      setFoundedLabs(foundedRes.data || [])
      setMemberLabs(memberRes.data || [])
      setLoading(false)
      if (onLabsCountChange) {
        onLabsCountChange((foundedRes.data?.length || 0) + (memberRes.data?.length || 0))
      }
    })
  }, [userId, onLabsCountChange])

  const renderLabCard = (lab: any, role: string) => (
    <Card key={lab.labId} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{lab.labName || lab.name}</CardTitle>
            <CardDescription className="mt-1">{lab.description}</CardDescription>
          </div>
          {role === "founded" && <Badge className="bg-primary text-primary-foreground">Founder</Badge>}
          {role === "member" && <Badge variant="secondary">Member</Badge>}
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
    <Tabs defaultValue="founded" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="founded">Founded ({foundedLabs.length})</TabsTrigger>
        <TabsTrigger value="member">Member ({memberLabs.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="founded">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-medium">Labs You've Founded</h3>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New Lab
          </Button>
        </div>
        {foundedLabs.length === 0 ? <div className="text-muted-foreground">No labs founded yet.</div> : foundedLabs.map((lab) => renderLabCard(lab, "founded"))}
      </TabsContent>

      <TabsContent value="member">
        <h3 className="text-lg font-medium mb-4">Labs You're a Member Of</h3>
        {memberLabs.length === 0 ? <div className="text-muted-foreground">No memberships yet.</div> : memberLabs.map((lab) => renderLabCard(lab, "member"))}
      </TabsContent>
    </Tabs>
  )
}
