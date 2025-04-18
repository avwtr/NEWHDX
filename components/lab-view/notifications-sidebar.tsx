"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, X } from "lucide-react"

interface NotificationsSidebarProps {
  notifications: any[]
  dismissNotification: (id: number) => void
  dismissAllNotifications: () => void
  setNotificationsSidebarOpen: (value: boolean) => void
}

export function NotificationsSidebar({
  notifications,
  dismissNotification,
  dismissAllNotifications,
  setNotificationsSidebarOpen,
}: NotificationsSidebarProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setNotificationsSidebarOpen(false)}>
      <div
        className="fixed right-0 top-0 h-full w-80 md:w-96 bg-background border-l border-secondary overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-secondary p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="h-4 w-4 mr-2 text-accent" />
            <h2 className="font-medium">NOTIFICATIONS</h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissAllNotifications}
              className="text-xs hover:bg-secondary/50"
            >
              DISMISS ALL
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setNotificationsSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {notifications.length > 0 ? (
            [...notifications].reverse().map((notification) => (
              <div
                key={notification.id}
                className="flex items-start justify-between p-3 rounded-md bg-secondary/20 hover:bg-secondary/40 transition-colors"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`
                      ${
                        notification.type === "contribution"
                          ? "bg-science-ai"
                          : notification.type === "follower"
                            ? "bg-science-neuroscience"
                            : "bg-science-biology"
                      }
                    `}
                    >
                      {notification.type.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                  </div>
                  <span className="text-sm">{notification.message}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-secondary/50 mt-1"
                  onClick={() => dismissNotification(notification.id)}
                >
                  <X className="h-3.5 w-3.5 text-accent" />
                  <span className="sr-only">Dismiss</span>
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No notifications</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
