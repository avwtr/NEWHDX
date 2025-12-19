"use client"
import Image from "next/image"
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Bell, Users, FileText, FlaskConical, Share2, Lock, Globe } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { scienceCategoryColors } from "@/lib/research-areas"

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
  membersCount?: number
  membersBreakdown?: { total: number, founders: number, admins: number, donors: number, contributors: number }
  onOpenContributeDialog?: () => void
  orgInfo?: { org_name: string; profilePic?: string } | null
  user?: any
}


const scienceCategoryVariant: Record<string, string> = {
  neuroscience: "neuroscience",
  ai: "ai",
  biology: "biology",
  chemistry: "chemistry",
  physics: "physics",
  medicine: "medicine",
  psychology: "psychology",
  engineering: "engineering",
  mathematics: "mathematics",
  environmental: "environmental",
  astronomy: "astronomy",
  geology: "geology",
  "brain-mapping": "neuroscience",
  "cognitive-science": "psychology",
  "quantum-mechanics": "physics",
  "particle-physics": "physics",
  genomics: "biology",
  bioinformatics: "biology",
  ethics: "psychology",
  "computer-science": "ai",
  "climate-science": "environmental",
  "data-analysis": "mathematics",
  "molecular-biology": "biology",
  biochemistry: "chemistry",
  astrophysics: "astronomy",
  cosmology: "astronomy",
  "clinical-research": "medicine",
  biotechnology: "biology",
  "medical-imaging": "medicine",
  meteorology: "environmental",
  "machine-learning": "ai",
  optimization: "mathematics",
  "data-processing": "mathematics",
  "data-visualization": "mathematics",
  methodology: "default",
  computing: "ai",
  evaluation: "default",
  innovation: "default",
  "research-funding": "default",
  governance: "default",
  mitigation: "environmental",
  "diversity-studies": "default",
  "public-perception": "psychology",
  "citizen-science": "default",
  "bias-studies": "ai",
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
  membersCount = 0,
  membersBreakdown,
  onOpenContributeDialog,
  orgInfo,
  user,
}: LabProfileProps) {
  const [shareCopied, setShareCopied] = useState(false)
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false)
  const [labVisibility, setLabVisibility] = useState(lab.public_private || 'public')

  // Sync visibility state when lab prop changes
  useEffect(() => {
    setLabVisibility(lab.public_private || 'public')
  }, [lab.public_private])

  // Helper to get share URL
  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href
    }
    return ''
  }

  // Toggle lab visibility (public/private)
  const handleToggleVisibility = async () => {
    if (!isAdmin || !lab?.labId) return
    
    setIsUpdatingVisibility(true)
    const newVisibility = labVisibility === 'public' ? 'private' : 'public'
    
    try {
      const { error } = await supabase
        .from('labs')
        .update({ public_private: newVisibility })
        .eq('labId', lab.labId)
      
      if (error) throw error
      
      setLabVisibility(newVisibility)
      toast({
        title: "Visibility updated",
        description: `Lab is now ${newVisibility}`,
      })
    } catch (error: any) {
      toast({
        title: "Error updating visibility",
        description: error.message || String(error),
        variant: "destructive",
      })
    } finally {
      setIsUpdatingVisibility(false)
    }
  }

  const handleShare = async () => {
    const url = getShareUrl()
    try {
      await navigator.clipboard.writeText(url)
      setShareCopied(true)
      toast({ title: "Link copied!", description: "Lab link copied to clipboard." })
      setTimeout(() => setShareCopied(false), 1500)
    } catch {
      toast({ title: "Error", description: "Failed to copy link." })
    }
  }

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
              <h2 className="text-2xl font-bold font-fell italic normal-case">{lab.labName}</h2>
              {/* Organization display */}
              {orgInfo && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="relative h-6 w-6 rounded-full overflow-hidden border border-secondary">
                    <Image
                      src={orgInfo.profilePic || "/placeholder.svg"}
                      alt={orgInfo.org_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium truncate max-w-[120px] font-fell italic">{orgInfo.org_name}</span>
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-1">
                {lab.researchAreas?.map((cat: { category: string }, idx: number) => {
                  const variant = cat.category.toLowerCase().replace(/\s+/g, '-') as any;
                  return (
                    <Badge
                      key={idx}
                      variant={variant}
                      className="mr-2 mb-2"
                    >
                      {cat.category}
                    </Badge>
                  );
                }) || categories?.map((cat: { category: string }, idx: number) => {
                  const variant = cat.category.toLowerCase().replace(/\s+/g, '-') as any;
                  return (
                    <Badge
                      key={idx}
                      variant={variant}
                      className="mr-2 mb-2"
                    >
                      {cat.category}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 self-end md:self-auto w-full md:w-auto">
            {/* Share button */}
            <button
              className="ml-auto mb-1 flex items-center gap-1 text-accent hover:text-accent/80 text-xs"
              title={shareCopied ? "Copied!" : "Share lab"}
              onClick={handleShare}
              style={{ alignSelf: 'flex-end' }}
            >
              <Share2 className="h-4 w-4" />
              <span>{shareCopied ? "Copied!" : "Share"}</span>
            </button>
            {/* Button group for non-admin users */}
            {!isAdmin && (
              <div className="flex flex-row gap-3 mt-4 md:mt-0 items-center">
                {onOpenContributeDialog && (
                  <Button
                    variant="default"
                    size="lg"
                    className="font-bold px-6 py-2 text-base font-fell italic"
                    onClick={onOpenContributeDialog}
                    data-testid="contribute-button"
                    disabled={!user}
                    title={!user ? 'Login to contribute' : undefined}
                  >
                    CONTRIBUTE +
                  </Button>
                )}
                <Button
                  variant={isFollowing ? "default" : "outline"}
                  size="sm"
                  className={`font-fell italic ${
                    isFollowing
                      ? "bg-background text-foreground hover:bg-background/90"
                      : "bg-accent text-background hover:bg-accent/90"
                  }`}
                  onClick={isGuest ? handleGuestAction : setIsFollowing}
                  disabled={!user}
                  title={!user ? 'Login to follow labs' : undefined}
                >
                  {isFollowing ? "FOLLOWING" : "FOLLOW"}
                </Button>
              </div>
            )}
            {/* Admin button group */}
            {isAdmin && (
              <div className="flex flex-col items-end gap-2 self-end md:self-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-accent text-accent hover:bg-accent hover:text-accent-foreground font-fell italic"
                  onClick={() => setActiveTab("settings")}
                >
                  EDIT LAB
                </Button>
                {/* Public/Private Toggle Badge */}
                <button
                  onClick={handleToggleVisibility}
                  disabled={isUpdatingVisibility}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium font-fell italic transition-colors ${
                    labVisibility === 'public'
                      ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                      : 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={`Click to make lab ${labVisibility === 'public' ? 'private' : 'public'}`}
                >
                  {labVisibility === 'public' ? (
                    <>
                      <Globe className="h-3.5 w-3.5" />
                      <span>PUBLIC</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-3.5 w-3.5" />
                      <span>PRIVATE</span>
                    </>
                  )}
                </button>
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
        <div className="grid grid-cols-3 gap-4 w-full">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium font-fell text-base">{filesCount}</span>
            <span className="text-muted-foreground">Files</span>
          </div>

          <div className="flex flex-col gap-1 text-sm">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium font-fell text-base">{experimentsCount}</span>
              <span className="text-muted-foreground">Experiments</span>
            </div>
            {/* Live Experiments List */}
            {Array.isArray(lab.experiments) && lab.experiments.filter(
              (exp: any) => (exp.status === "LIVE" || exp.closed_status !== "CLOSED")
            ).length > 0 && (
              <div className="mt-1 flex flex-col gap-1">
                {lab.experiments.filter((exp: any) => (exp.status === "LIVE" || exp.closed_status !== "CLOSED")).map((exp: any) => (
                  <div key={exp.id} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-[pulse_2s_ease-in-out_infinite]" />
                    <span className="text-sm text-accent font-semibold">{exp.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-0.5 text-sm min-w-[120px]">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium font-fell italic">{Math.max(membersCount, 1)}</span>
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
        </div>
      </CardFooter>
    </Card>
  )
}
