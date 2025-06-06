"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/lib/supabase"

interface FundingActivityDialogProps {
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  labId: string
}

export function FundingActivityDialog({ isOpen, onOpenChange, labId }: FundingActivityDialogProps) {
  const [localOpen, setLocalOpen] = useState(false)
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userMap, setUserMap] = useState<Record<string, { name: string; initials: string; avatar?: string }>>({})

  useEffect(() => {
    if (!labId) return;
    setLoading(true)
    async function fetchActivity() {
      // Funding-related activity types
      const fundingTypes = [
        'lab_subscribed',
        'funding_goal',
        'donation_edited',
        'funding_created',
        'funding_edited',
        'lab_poked',
        'membership_edited',
        'donation_made',
        'membership_subscribed',
      ]
      const { data, error } = await supabase
        .from('activity')
        .select('*')
        .eq('lab_from', labId)
        .in('activity_type', fundingTypes)
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) {
        setActivities([])
        setLoading(false)
        return
      }
      setActivities(data || [])
      // Fetch user info for all unique performed_by
      const userIds = Array.from(new Set((data || []).map((a: any) => a.performed_by).filter(Boolean)))
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id,username,profilePic')
          .in('user_id', userIds)
        const map: Record<string, { name: string; initials: string; avatar?: string }> = {}
        profiles?.forEach((profile: any) => {
          const initials = profile.username ? profile.username.split(' ').map((n: string) => n[0]).join('').toUpperCase() : '??'
          map[profile.user_id] = { name: profile.username || 'Unknown', initials, avatar: profile.profilePic }
        })
        setUserMap(map)
      }
      setLoading(false)
    }
    fetchActivity()
  }, [labId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date)
  }

  const content = (
    <>
      <DialogHeader>
        <DialogTitle>FUNDING ACTIVITY</DialogTitle>
        <DialogDescription>Recent funding-related activity for this lab</DialogDescription>
      </DialogHeader>
      <ScrollArea className="h-[60vh] pr-4">
        <div className="space-y-4 py-2">
          {loading ? (
            <div className="text-center text-muted-foreground py-8">Loading activity...</div>
          ) : activities.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No funding activity found.</div>
          ) : (
            activities.map((activity) => {
              const user = userMap[activity.performed_by] || { name: 'Unknown', initials: '??', avatar: undefined }
              let typeLabel = 'ACTIVITY'
              let desc = activity.activity_name || ''
              if (activity.activity_type === 'lab_subscribed' || activity.activity_type === 'membership_subscribed') typeLabel = 'SUBSCRIPTION'
              if (activity.activity_type === 'donation_made') typeLabel = 'DONATION'
              if (activity.activity_type === 'funding_goal' || activity.activity_type === 'funding_created' || activity.activity_type === 'funding_edited') typeLabel = 'FUNDING GOAL'
              if (activity.activity_type === 'lab_poked') typeLabel = 'POKE'
              if (activity.activity_type === 'donation_edited') typeLabel = 'DONATION EDITED'
              if (activity.activity_type === 'membership_edited') typeLabel = 'MEMBERSHIP EDITED'
              return (
                <div
                  key={activity.activity_id || activity.id || activity.created_at}
                  className="flex items-start gap-3 p-3 rounded-md border border-secondary hover:bg-secondary/20 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    {user.avatar ? (
                      <AvatarImage src={user.avatar} alt={user.name} />
                    ) : (
                      <AvatarFallback>{user.initials}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{user.name}</div>
                      <Badge className={typeLabel === 'SUBSCRIPTION' ? 'bg-blue-600' : typeLabel === 'DONATION' ? 'bg-accent' : 'bg-secondary'}>
                        {typeLabel}
                      </Badge>
                    </div>
                    <p className="text-sm">{desc}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(activity.created_at)}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>
    </>
  )

  if (typeof isOpen === 'boolean' && onOpenChange) {
    return content
  }

  return (
    <Dialog open={localOpen} onOpenChange={setLocalOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full border-accent text-accent hover:bg-secondary"
          onClick={() => setLocalOpen(true)}
        >
          VIEW FUNDING ACTIVITY
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        {content}
      </DialogContent>
    </Dialog>
  )
}
