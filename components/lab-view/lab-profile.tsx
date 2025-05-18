"use client"
import Image from "next/image"
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Bell, Users, FileText, FlaskConical, DollarSign, Share2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"

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
  orgInfo?: { org_name: string; profilePic?: string } | null
}

const scienceCategoryColors: Record<string, { bg: string; text: string }> = {
  neuroscience: { bg: "bg-[#9D4EDD]", text: "text-white" },
  ai: { bg: "bg-[#3A86FF]", text: "text-white" },
  biology: { bg: "bg-[#38B000]", text: "text-white" },
  chemistry: { bg: "bg-[#FF5400]", text: "text-white" },
  physics: { bg: "bg-[#FFD60A]", text: "text-black" },
  medicine: { bg: "bg-[#FF0054]", text: "text-white" },
  psychology: { bg: "bg-[#FB5607]", text: "text-white" },
  engineering: { bg: "bg-[#4361EE]", text: "text-white" },
  mathematics: { bg: "bg-[#7209B7]", text: "text-white" },
  environmental: { bg: "bg-[#2DC653]", text: "text-white" },
  astronomy: { bg: "bg-[#3F37C9]", text: "text-white" },
  geology: { bg: "bg-[#AA6C25]", text: "text-white" },
  "brain-mapping": { bg: "bg-[#9D4EDD]", text: "text-white" },
  "cognitive-science": { bg: "bg-[#FB5607]", text: "text-white" },
  "quantum-mechanics": { bg: "bg-[#FFD60A]", text: "text-black" },
  "particle-physics": { bg: "bg-[#FFD60A]", text: "text-black" },
  genomics: { bg: "bg-[#38B000]", text: "text-white" },
  bioinformatics: { bg: "bg-[#38B000]", text: "text-white" },
  ethics: { bg: "bg-[#FB5607]", text: "text-white" },
  "computer-science": { bg: "bg-[#3A86FF]", text: "text-white" },
  "climate-science": { bg: "bg-[#2DC653]", text: "text-white" },
  "data-analysis": { bg: "bg-[#7209B7]", text: "text-white" },
  "molecular-biology": { bg: "bg-[#38B000]", text: "text-white" },
  biochemistry: { bg: "bg-[#FF5400]", text: "text-white" },
  astrophysics: { bg: "bg-[#3F37C9]", text: "text-white" },
  cosmology: { bg: "bg-[#3F37C9]", text: "text-white" },
  "clinical-research": { bg: "bg-[#FF0054]", text: "text-white" },
  biotechnology: { bg: "bg-[#38B000]", text: "text-white" },
  "medical-imaging": { bg: "bg-[#FF0054]", text: "text-white" },
  meteorology: { bg: "bg-[#2DC653]", text: "text-white" },
  "machine-learning": { bg: "bg-[#3A86FF]", text: "text-white" },
  optimization: { bg: "bg-[#7209B7]", text: "text-white" },
  "data-processing": { bg: "bg-[#7209B7]", text: "text-white" },
  "data-visualization": { bg: "bg-[#7209B7]", text: "text-white" },
  methodology: { bg: "bg-[#6C757D]", text: "text-white" },
  computing: { bg: "bg-[#3A86FF]", text: "text-white" },
  evaluation: { bg: "bg-[#6C757D]", text: "text-white" },
  innovation: { bg: "bg-[#6C757D]", text: "text-white" },
  "research-funding": { bg: "bg-[#6C757D]", text: "text-white" },
  governance: { bg: "bg-[#6C757D]", text: "text-white" },
  mitigation: { bg: "bg-[#2DC653]", text: "text-white" },
  "diversity-studies": { bg: "bg-[#6C757D]", text: "text-white" },
  "public-perception": { bg: "bg-[#FB5607]", text: "text-white" },
  "citizen-science": { bg: "bg-[#6C757D]", text: "text-white" },
  "bias-studies": { bg: "bg-[#3A86FF]", text: "text-white" },
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
  fundingTotal,
  membersCount = 0,
  membersBreakdown,
  onOpenContributeDialog,
  orgInfo,
}: LabProfileProps) {
  const [shareCopied, setShareCopied] = useState(false)

  // Helper to get share URL
  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href
    }
    return ''
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
              <h2 className="text-2xl font-bold">{lab.labName}</h2>
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
                  <span className="text-xs text-muted-foreground font-medium truncate max-w-[120px]">{orgInfo.org_name}</span>
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
