"use client"
import Image from "next/image"
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Bell, Users, FileText, FlaskConical, DollarSign } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface LabProfileProps {
  isAdmin: boolean
  isGuest: boolean
  isFollowing: boolean
  setIsFollowing: () => void
  notifications: any[]
  notificationsSidebarOpen: boolean
  setNotificationsSidebarOpen: (value: boolean) => void
  handleGuestAction: () => void
  setActiveTab: (tab: string) => void
  router: AppRouterInstance
  lab: any
  categories: { category: string }[]
  experimentsCount?: number
  filesCount?: number
  fundingTotal?: { raised: number, goal: number } | undefined
  membersCount?: number
  membersBreakdown?: { total: number, founders: number, admins: number, donors: number, contributors: number }
  onOpenContributeDialog?: () => void
}

export default function LabProfile({
  isAdmin,
  isGuest,
  isFollowing,
  setIsFollowing,
  notifications = [],
  notificationsSidebarOpen,
  setNotificationsSidebarOpen,
  handleGuestAction,
  setActiveTab,
  router,
  lab,
  categories,
  experimentsCount = 0,
  filesCount = 0,
  fundingTotal,
  membersCount = 0,
  membersBreakdown,
  onOpenContributeDialog,
}: LabProfileProps) {
  return (
    <Card className="border-accent">
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
              <h2 className="text-2xl font-bold">{lab.labName}</h2>
              <div className="flex flex-wrap gap-2 mt-1">
                {categories.map((cat, idx) => (
                  <Badge key={idx} variant="outline" className="rounded-full px-3 py-1">
                    {cat.category}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 self-end md:self-auto">
            {/* Button group for non-admin users */}
            {!isAdmin && (
              <div className="flex flex-row gap-3 mt-4 md:mt-0 items-center">
                {onOpenContributeDialog && (
                  <Button
                    variant="default"
                    size="lg"
                    className="font-bold px-6 py-2 text-base"
                    onClick={onOpenContributeDialog}
                    data-testid="contribute-button"
                  >
                    CONTRIBUTE +
                  </Button>
                )}
                <Button
                  variant={isFollowing ? "default" : "outline"}
                  size="sm"
                  className={
                    isFollowing
                      ? "bg-background text-foreground hover:bg-background/90"
                      : "bg-accent text-background hover:bg-accent/90"
                  }
                  onClick={isGuest ? handleGuestAction : setIsFollowing}
                >
                  {isFollowing ? "FOLLOWING" : "FOLLOW"}
                </Button>
              </div>
            )}
            {/* Admin button group remains unchanged */}
            {isAdmin && (
              <div className="flex items-center gap-2 self-end md:self-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setActiveTab("settings")}
                >
                  EDIT LAB
                </Button>
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
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground">
          {lab.description}
        </p>
      </CardContent>

      <CardFooter className="flex justify-between pt-0">
        <div className="grid grid-cols-4 gap-4 w-full">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{filesCount}</span>
            <span className="text-muted-foreground">Files</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{experimentsCount}</span>
            <span className="text-muted-foreground">Experiments</span>
          </div>

          <div className="flex flex-col gap-0.5 text-sm min-w-[120px]">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{membersCount}</span>
              <span className="text-muted-foreground">Members</span>
            </div>
            {membersBreakdown && (
              <div className="flex flex-wrap gap-2 mt-0.5 text-xs text-muted-foreground">
                {membersBreakdown.founders > 0 && (
                  <span><span className="font-semibold text-primary">{membersBreakdown.founders}</span> founders</span>
                )}
                {membersBreakdown.admins > 0 && (
                  <span><span className="font-semibold text-primary">{membersBreakdown.admins}</span> admins</span>
                )}
                {membersBreakdown.donors > 0 && (
                  <span><span className="font-semibold text-primary">{membersBreakdown.donors}</span> donors</span>
                )}
                {membersBreakdown.contributors > 0 && (
                  <span><span className="font-semibold text-primary">{membersBreakdown.contributors}</span> contributors</span>
                )}
              </div>
            )}
          </div>

          {fundingTotal && fundingTotal.raised > 0 && fundingTotal.goal > 0 && (
            <div className="flex flex-col gap-1 min-w-[180px]">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  <span className="text-accent">${fundingTotal.raised.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground ml-1">funded</span>
                  <span className="mx-1 text-muted-foreground">/</span>
                  <span className="text-primary">${fundingTotal.goal.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground ml-1">goal</span>
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 max-w-[120px]">
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all duration-500"
                      style={{ width: `${Math.round((fundingTotal.raised / fundingTotal.goal) * 100)}%` }}
                    />
                  </div>
                </div>
                <span className="ml-2 text-xs font-semibold text-accent whitespace-nowrap">
                  {Math.round((fundingTotal.raised / fundingTotal.goal) * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
