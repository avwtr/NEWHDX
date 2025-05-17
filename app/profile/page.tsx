"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { UserLabsSection } from "@/components/profile/user-labs-section"
import { UserActivityLogs } from "@/components/profile/user-activity-logs"
import { UserCollections } from "@/components/profile/user-collections"
import { UserPublications } from "@/components/profile/user-publications"
import { UserProfileSettings } from "@/components/profile/user-profile-settings"
import { Settings } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useSearchParams } from "next/navigation"

export default function ProfilePage() {
  const [showSettings, setShowSettings] = useState(false)
  const { user, isLoading } = useAuth()
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "profile";

  useEffect(() => {
    if (searchParams.get("tab")) {
      setShowSettings(true);
    }
  }, [searchParams]);

  // Simple loading state
  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">Loading profile...</div>
      </div>
    )
  }

  // Not logged in state
  if (!user) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view your profile</h2>
          <Button asChild>
            <a href="/login?redirectTo=/profile">Log In</a>
          </Button>
        </div>
      </div>
    )
  }

  // Prepare user data
  const userData = {
    id: user.id,
    name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
    username: user.user_metadata?.username || user.email?.split("@")[0] || "user",
    avatar: user.user_metadata?.avatar_url || "/placeholder.svg?height=100&width=100",
    bio: user.user_metadata?.bio || "Computational biologist specializing in genomic data analysis and visualization.",
    joinDate: new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    interests: user.user_metadata?.research_interests || ["Genomics", "Machine Learning", "Bioinformatics"],
    stats: {
      contributions: 127,
      labs: 5,
      following: 32,
    },
  }

  if (showSettings) {
    return <UserProfileSettings user={userData} onClose={() => setShowSettings(false)} defaultTab={defaultTab} />
  }

  return (
    <div className="container py-8 max-w-6xl">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* User Profile Sidebar */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="relative pb-0">
              <div className="absolute top-4 right-4">
                <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)} aria-label="Profile settings">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={userData.avatar} alt={userData.name} />
                  <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-center">{userData.name}</CardTitle>
                <CardDescription className="text-center">@{userData.username}</CardDescription>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {userData.interests.map((interest, index) => (
                    <Badge key={index} variant="secondary">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-4">{userData.bio}</div>

              <Separator className="my-4" />

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{userData.stats.contributions}</div>
                  <div className="text-xs text-muted-foreground">Contributions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{userData.stats.labs}</div>
                  <div className="text-xs text-muted-foreground">Labs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{userData.stats.following}</div>
                  <div className="text-xs text-muted-foreground">Following</div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="text-xs text-muted-foreground">Member since {userData.joinDate}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-2">
          <Tabs defaultValue="labs" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="labs">My Labs</TabsTrigger>
              <TabsTrigger value="publications">Publications</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="collections">Collections</TabsTrigger>
            </TabsList>

            <TabsContent value="labs" className="mt-6">
              <UserLabsSection />
            </TabsContent>

            <TabsContent value="publications" className="mt-6">
              <UserPublications />
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <UserActivityLogs />
            </TabsContent>

            <TabsContent value="collections" className="mt-6">
              <UserCollections />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
