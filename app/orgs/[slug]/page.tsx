"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import type { UserProfile } from "@/lib/types"

export default function OrganizationProfile() {
  const { slug } = useParams() as { slug: string }
  const [org, setOrg] = useState<any | null>(null)
  const [members, setMembers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function fetchOrg() {
      setLoading(true)
      setNotFound(false)
      // Fetch org by slug
      const { data: org, error } = await supabase
        .from("organizations")
        .select("*, org_id")
        .eq("slug", slug)
        .maybeSingle()
      if (!org || error) {
        setNotFound(true)
        setLoading(false)
        return
      }
      setOrg(org)
      console.log('Fetched org:', org)
      // Fetch members
      const { data: memberRows } = await supabase
        .from("orgMembers")
        .select("user_id")
        .eq("org_id", org.org_id)
      console.log('Member rows:', memberRows)
      if (memberRows && memberRows.length > 0) {
        const userIds = memberRows.map((m: any) => m.user_id)
        console.log('User IDs:', userIds)
        let profiles: any[] = [];
        if (userIds.length > 0) {
          const { data, error } = await supabase
            .from("profiles")
            .select("user_id, username")
            .in("user_id", userIds)
          if (error) {
            console.error("Error fetching profiles:", error)
          }
          profiles = data || [];
        }
        console.log('Fetched profiles:', profiles)
        setMembers(
          (profiles || []).map((p: any) => ({
            id: p.user_id,
            name: p.username,
            role: "user", // You can extend this if you store roles
            initials: p.username ? p.username.slice(0, 2).toUpperCase() : "U",
          }))
        )
      } else {
        setMembers([])
      }
      setLoading(false)
    }
    if (slug) fetchOrg()
  }, [slug])

  if (loading) return <div className="container max-w-3xl py-10 text-center">Loading...</div>
  if (notFound) return <div className="container max-w-3xl py-10 text-center text-red-500">Organization not found.</div>
  if (!org) return null

  return (
    <div className="container max-w-3xl py-10 flex flex-col items-center">
      <div className="w-40 h-40 relative mb-6">
        <Image
          src={org.profilePic || "/placeholder.svg"}
          alt={org.org_name}
          fill
          className="rounded-full object-cover border-2 border-border"
        />
      </div>

      <h1 className="text-3xl font-bold mb-2 text-center">{org.org_name}</h1>

      <div className="flex justify-center gap-2 mb-6">
        {(org.categories || []).map((tag: string) => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>

      <Card className="w-full mb-8">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground leading-relaxed">{org.description}</p>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mb-4 text-center">Members</h2>
      <div className="w-full space-y-3">
        {members.map((member) => (
          <Card key={member.id} className="w-full">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image
                  src={"/placeholder.svg?height=50&width=50&query=user"}
                  alt={member.name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium">{member.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">
                  {member.role === "admin" ? "Administrator" : "Member"}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 