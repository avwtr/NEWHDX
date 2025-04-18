"use client"
import Image from "next/image"
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Bell, Users, FileText, FlaskConical, DollarSign } from "lucide-react"

interface LabProfileProps {
  isAdmin: boolean
  isGuest: boolean
  isFollowing: boolean
  setIsFollowing: (value: boolean) => void
  notifications: any[]
  notificationsSidebarOpen: boolean
  setNotificationsSidebarOpen: (value: boolean) => void
  handleGuestAction: () => void
  setActiveTab: (tab: string) => void
  router: AppRouterInstance
}

export function LabProfile({
  isAdmin,
  isGuest,
  isFollowing,
  setIsFollowing,
  notifications,
  notificationsSidebarOpen,
  setNotificationsSidebarOpen,
  handleGuestAction,
  setActiveTab,
  router,
}: LabProfileProps) {
  return (
    <Card className="border-accent">
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-md overflow-hidden border-2 border-accent">
              <Image src="/science-lab-setup.png" alt="Lab Logo" width={64} height={64} className="object-cover" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">NEUROCOGNITIVE RESEARCH LAB</h2>
              <div className="flex flex-wrap gap-2 mt-1">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                  NEUROSCIENCE
                </Badge>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                  COGNITIVE SCIENCE
                </Badge>
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                  PSYCHOLOGY
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            {isAdmin ? (
              <Button
                variant="outline"
                size="sm"
                className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                onClick={() => router.push("/create-lab")}
              >
                EDIT LAB
              </Button>
            ) : (
              <Button
                variant={isFollowing ? "outline" : "default"}
                size="sm"
                className={
                  isFollowing
                    ? "border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                    : "bg-accent text-accent-foreground hover:bg-accent/90"
                }
                onClick={isGuest ? handleGuestAction : () => setIsFollowing(!isFollowing)}
              >
                {isFollowing ? "FOLLOWING" : "FOLLOW"}
              </Button>
            )}

            {isAdmin && (
              <Button
                variant="outline"
                size="icon"
                className={`border-accent ${
                  notificationsSidebarOpen ? "bg-accent text-accent-foreground" : "text-accent hover:bg-accent/20"
                }`}
                onClick={() => setNotificationsSidebarOpen(!notificationsSidebarOpen)}
              >
                <Bell className="h-4 w-4" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground">
          Investigating the neural correlates of cognitive processes and their implications for understanding human
          behavior and mental health. Our interdisciplinary approach combines neuroimaging, computational modeling, and
          behavioral experiments.
        </p>
      </CardContent>

      <CardFooter className="flex justify-between pt-0">
        <div className="grid grid-cols-4 gap-4 w-full">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">24</span>
            <span className="text-muted-foreground">Files</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">5</span>
            <span className="text-muted-foreground">Experiments</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">8</span>
            <span className="text-muted-foreground">Members</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">$125,000</span>
            <span className="text-muted-foreground">Funding</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
