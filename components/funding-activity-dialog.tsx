"use client"

import { useState } from "react"
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

// Sample funding activity data
const fundingActivityData = [
  {
    id: 1,
    type: "donation",
    user: {
      name: "Alex Wong",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "AW",
    },
    amount: 50,
    fund: "NEW EQUIPMENT FUND",
    date: "2024-03-18T14:32:00Z",
    message: "Keep up the great research!",
  },
  {
    id: 2,
    type: "subscription",
    user: {
      name: "Maria Rodriguez",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "MR",
    },
    amount: 25,
    fund: "GENERAL FUND",
    date: "2024-03-17T09:15:00Z",
  },
  {
    id: 3,
    type: "donation",
    user: {
      name: "John Smith",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "JS",
    },
    amount: 100,
    fund: "RESEARCH ASSISTANT STIPEND",
    date: "2024-03-15T16:45:00Z",
    message: "Supporting the next generation of researchers!",
  },
  {
    id: 4,
    type: "subscription",
    user: {
      name: "Emily Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "EC",
    },
    amount: 25,
    fund: "CONFERENCE TRAVEL",
    date: "2024-03-14T11:20:00Z",
  },
  {
    id: 5,
    type: "donation",
    user: {
      name: "David Kim",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "DK",
    },
    amount: 75,
    fund: "NEW EQUIPMENT FUND",
    date: "2024-03-12T13:10:00Z",
  },
  {
    id: 6,
    type: "donation",
    user: {
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "SJ",
    },
    amount: 200,
    fund: "GENERAL FUND",
    date: "2024-03-10T15:30:00Z",
    message: "Excited to see where this research leads!",
  },
  {
    id: 7,
    type: "subscription",
    user: {
      name: "Michael Brown",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "MB",
    },
    amount: 25,
    fund: "RESEARCH ASSISTANT STIPEND",
    date: "2024-03-08T10:45:00Z",
  },
  {
    id: 8,
    type: "donation",
    user: {
      name: "Lisa Park",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "LP",
    },
    amount: 150,
    fund: "CONFERENCE TRAVEL",
    date: "2024-03-05T09:20:00Z",
    message: "Hope this helps researchers share their findings!",
  },
  {
    id: 9,
    type: "subscription",
    user: {
      name: "Robert Garcia",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "RG",
    },
    amount: 25,
    fund: "GENERAL FUND",
    date: "2024-03-03T14:15:00Z",
  },
  {
    id: 10,
    type: "donation",
    user: {
      name: "Jennifer Lee",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "JL",
    },
    amount: 50,
    fund: "NEW EQUIPMENT FUND",
    date: "2024-03-01T11:30:00Z",
  },
]

export function FundingActivityDialog() {
  const [isOpen, setIsOpen] = useState(false)

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full border-accent text-accent hover:bg-secondary"
          onClick={() => setIsOpen(true)}
        >
          VIEW FUNDING ACTIVITY
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>FUNDING ACTIVITY</DialogTitle>
          <DialogDescription>Recent donations and subscriptions supporting our research</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 py-2">
            {fundingActivityData.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-md border border-secondary hover:bg-secondary/20 transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                  <AvatarFallback>{activity.user.initials}</AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{activity.user.name}</div>
                    <Badge className={activity.type === "subscription" ? "bg-blue-600" : "bg-accent"}>
                      {activity.type === "subscription" ? "SUBSCRIPTION" : "DONATION"}
                    </Badge>
                  </div>

                  <p className="text-sm">
                    {activity.type === "subscription"
                      ? `Paid monthly membership of $${activity.amount} towards ${activity.fund}`
                      : `Donated $${activity.amount} to ${activity.fund}`}
                  </p>

                  {activity.message && (
                    <p className="text-sm italic text-muted-foreground mt-1">"{activity.message}"</p>
                  )}

                  <p className="text-xs text-muted-foreground mt-1">{formatDate(activity.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
