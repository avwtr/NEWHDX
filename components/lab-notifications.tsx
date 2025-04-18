"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bell, X, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Notification {
  id: number
  type: string
  message: string
  time: string
}

interface LabNotificationsProps {
  notifications: Notification[]
  onDismiss: (id: number) => void
  onDismissAll: () => void
}

export function LabNotifications({ notifications, onDismiss, onDismissAll }: LabNotificationsProps) {
  const [hoveredNotification, setHoveredNotification] = useState<number | null>(null)

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "contribution":
        return "bg-science-ai text-white"
      case "follower":
        return "bg-science-neuroscience text-white"
      case "mention":
        return "bg-science-biology text-white"
      default:
        return "bg-secondary text-white"
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "contribution":
        return <Badge className="bg-science-ai">CONTRIBUTION</Badge>
      case "follower":
        return <Badge className="bg-science-neuroscience">FOLLOWER</Badge>
      case "mention":
        return <Badge className="bg-science-biology">MENTION</Badge>
      default:
        return <Badge className="bg-secondary">NOTIFICATION</Badge>
    }
  }

  return (
    <div className="bg-secondary/30 backdrop-blur-sm rounded-lg p-2 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Bell className="h-4 w-4 mr-2 text-accent" />
          <span className="text-sm font-medium">NOTIFICATIONS ({notifications.length})</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onDismissAll} className="text-xs hover:bg-secondary/50">
          DISMISS ALL
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="flex items-center justify-between p-2 rounded-md bg-secondary/20 hover:bg-secondary/40 transition-colors"
            onMouseEnter={() => setHoveredNotification(notification.id)}
            onMouseLeave={() => setHoveredNotification(null)}
          >
            <div className="flex items-center gap-2">
              {getNotificationIcon(notification.type)}
              <span className="text-sm opacity-90">{notification.message}</span>
              <span className="text-xs text-muted-foreground">{notification.time}</span>
            </div>

            <div
              className={`flex gap-1 transition-opacity ${hoveredNotification === notification.id ? "opacity-100" : "opacity-0"}`}
            >
              <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-secondary/50">
                <Eye className="h-3.5 w-3.5 text-accent" />
                <span className="sr-only">View</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-secondary/50"
                onClick={() => onDismiss(notification.id)}
              >
                <X className="h-3.5 w-3.5 text-accent" />
                <span className="sr-only">Dismiss</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
