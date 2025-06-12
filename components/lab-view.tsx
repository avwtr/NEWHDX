"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Maximize2, Minimize2, FlaskConical, Home, FileText, Users, DollarSign } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useRole } from "@/contexts/role-context"
import ActivityExplorer from "@/components/activity-explorer"
import ExperimentsList from "@/components/experiments-list"
import { LabNotifications } from "@/components/lab-notifications"
import { GlobalAddButton } from "@/components/global-add-button"
import { LabChat } from "@/components/lab-chat"
import { LabMaterialsExplorer } from "@/components/lab-materials-explorer"
import type { Contribution } from "@/components/contribution-detail-modal"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { isFollowingLab, followLab, unfollowLab } from "@/lib/followLab"
import { LoadingAnimation } from "@/components/loading-animation"

// Sub-components
import LabProfile from "@/components/lab-view/lab-profile"
import { LabOverviewTab } from "@/components/lab-view/lab-overview-tab"
import { LabFundingTab } from "@/components/lab-view/lab-funding-tab"
import { LabSettingsTab } from "@/components/lab-view/lab-settings-tab"
import { NotificationsSidebar } from "@/components/lab-view/notifications-sidebar"
import { LoginPrompt } from "@/components/lab-view/login-prompt"
import { LabDialogs } from "@/components/lab-view/lab-dialogs"
import { SettingsDialog } from "@/components/settings-dialog"
import { ContributionDialog } from "@/components/contribution-dialog"

// Data imports
import {
  liveExperimentsData,
  notificationsData,
} from "@/components/lab-view/lab-data"

// Add type for props
interface LabViewProps {
  lab: any;
  categories: any;
  isGuest: any;
  notifications: any;
  notificationsSidebarOpen: any;
  setNotificationsSidebarOpen: any;
  handleGuestAction: any;
  setActiveTab: any;
  router: any;
}

export default function LabView({ lab, categories, isGuest, notifications, notificationsSidebarOpen, setNotificationsSidebarOpen, handleGuestAction, setActiveTab, router }: LabViewProps) {
  const { user } = useAuth()
  const { currentRole } = useRole()
  const isUser = currentRole === "user"

  // Tab state
  const [localActiveTab, setLocalActiveTab] = useState("overview")
  const [expandedTab, setExpandedTab] = useState<string | null>(null)

  // File state
  const [renamingFile, setRenamingFile] = useState<string | null>(null)
  const [fmriFileName, setFmriFileName] = useState("FMRI_ANALYSIS_PIPELINE.PY")
  const [cognitiveFileName, setCognitiveFileName] = useState("COGNITIVE_TEST_RESULTS.CSV")
  const [tempFileName, setTempFileName] = useState("")

  // Notifications state (only for real notifications, not hardcoded)
  const [localNotifications, setLocalNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(true)
  const [localNotificationsSidebarOpen, setLocalNotificationsSidebarOpen] = useState(false)

  // Funding state
  const [funds, setFunds] = useState<any[]>([])
  const [isDonationsActive, setIsDonationsActive] = useState(true)
  const [fundingTotals, setFundingTotals] = useState<{raised: number, goal: number} | undefined>(undefined)

  // Experiments state
  const [experimentsExpanded, setExperimentsExpanded] = useState(false)

  // Dialog states
  const [inviteMemberDialogOpen, setInviteMemberDialogOpen] = useState(false)
  const [uploadFileDialogOpen, setUploadFileDialogOpen] = useState(false)
  const [createNewFolder, setCreateNewFolder] = useState(false)
  const [createExperimentDialogOpen, setCreateExperimentDialogOpen] = useState(false)
  const [loginPromptOpen, setLoginPromptOpen] = useState(false)
  const [editFundDialogOpen, setEditFundDialogOpen] = useState(false)
  const [currentEditFund, setCurrentEditFund] = useState<(typeof funds)[0] | null>(null)
  const [logEventDialogOpen, setLogEventDialogOpen] = useState(false)
  const [editMembershipDialogOpen, setEditMembershipDialogOpen] = useState(false)

  // User interaction states
  const [localIsFollowing, setLocalIsFollowing] = useState(false)

  // Contributions state
  const [contributions, setContributions] = useState<any[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null)
  const [contributionDetailOpen, setContributionDetailOpen] = useState(false)
  const [contributionFilter, setContributionFilter] = useState("all")
  const [contributionSearch, setContributionSearch] = useState("")
  const [activeSettingsTab, setActiveSettingsTab] = useState("general")

  const [experiments, setExperiments] = useState<any[]>([])
  const [filesCount, setFilesCount] = useState(0)
  const [members, setMembers] = useState<any[]>([])
  const [bulletins, setBulletins] = useState<any[]>([])

  // --- Add state for experiments and funding ---
  const [experimentsCount, setExperimentsCount] = useState(0)

  // --- LAB ADMIN STATUS ---
  const [isAdmin, setIsAdmin] = useState(false)

  const [labState, setLabState] = useState(lab)

  // Contribution dialog state
  const [contributionDialogOpen, setContributionDialogOpen] = useState(false)

  const [oneTimeDonation, setOneTimeDonation] = useState(null)

  const [membership, setMembership] = useState(null)
  const [labsMembershipOption, setLabsMembershipOption] = useState(false)

  // --- Members breakdown state ---
  const [membersBreakdown, setMembersBreakdown] = useState<{ total: number, founders: number, admins: number, donors: number, contributors: number }>({ total: 0, founders: 0, admins: 0, donors: 0, contributors: 0 });

  // --- Organization Info state ---
  const [orgInfo, setOrgInfo] = useState<{ org_name: string; profilePic?: string } | null>(null)

  const [loading, setLoading] = useState(true)

  // Helper to refetch lab data (including funding_setup)
  const refetchLab = async () => {
    if (!lab?.labId) return;
    const { data, error } = await supabase
      .from('labs')
      .select('*')
      .eq('labId', lab.labId)
      .single();
    if (!error && data) setLabState(data);
  }

  useEffect(() => {
    const fetchLabData = async () => {
      setLoading(true)
      if (!lab?.labId) return

      // Fetch experiments
      const { data: expData } = await supabase
        .from("experiments")
        .select("*")
        .eq("lab_id", lab.labId)
      setExperiments(expData || [])

      // Fetch files count (exclude folders)
      const { count: fileCount, error: fileCountError } = await supabase
        .from("files")
        .select("id", { count: "exact", head: true })
        .eq("labID", lab.labId)
        .neq("fileTag", "folder")
      setFilesCount(fileCountError ? 0 : fileCount || 0)

      // Fetch funding
      const { data: fundingData } = await supabase
        .from("funding")
        .select("*")
        .eq("lab_id", lab.labId)
      setFunds(fundingData || [])

      // Fetch members
      const { data: memberData } = await supabase
        .from("labMembers")
        .select("*")
        .eq("lab_id", lab.labId)
      setMembers(memberData || [])

      // Fetch notifications (real only)
      const { data: notificationData } = await supabase
        .from("notifications")
        .select("*")
        .eq("lab_id", lab.labId)
      setLocalNotifications(notificationData || [])

      // Fetch bulletin posts
      const { data: bulletinData } = await supabase
        .from("bulletins")
        .select("*")
        .eq("lab_id", lab.labId)
      setBulletins(bulletinData || [])

      // Fetch lab membership and donation options
      const { data: labData } = await supabase
        .from("labs")
        .select("membership_option, one_time_donation_option")
        .eq("labId", lab.labId)
        .single()
      console.log("Fetched lab membership and donation options:", labData)
      setLabsMembershipOption(labData?.membership_option || false)
      setIsDonationsActive(labData?.one_time_donation_option ?? false)

      // Fetch membership data
      const { data: membershipData, error } = await supabase
        .from("recurring_funding")
        .select("*")
        .eq("labId", lab.labId)
        .single();
      console.log("Fetched membership data:", membershipData, error);
      setMembership(membershipData);
      setLoading(false)
    }
    fetchLabData()
  }, [lab])

  useEffect(() => {
    async function fetchExperimentsAndFunding() {
      if (!lab?.labId) return

      // Fetch experiments count
      const { count: experiments, error: expError } = await supabase
        .from("experiments")
        .select("*", { count: "exact", head: true })
        .eq("lab_id", lab.labId)
      setExperimentsCount(expError ? 0 : experiments || 0)

      // Fetch funding goals from funding_goals table
      const { data: fundingGoals, error: fundError } = await supabase
        .from("funding_goals")
        .select("amount_contributed, goal_amount")
        .eq("lab_id", lab.labId)
      if (fundError || !fundingGoals || fundingGoals.length === 0) {
        setFundingTotals(undefined)
      } else {
        const totalRaised = fundingGoals.reduce((sum, goal) => sum + (goal.amount_contributed || 0), 0)
        const totalGoal = fundingGoals.reduce((sum, goal) => sum + (goal.goal_amount || 0), 0)
        if (totalRaised > 0 && totalGoal > 0) {
          setFundingTotals({ raised: totalRaised, goal: totalGoal })
        } else {
          setFundingTotals(undefined)
        }
      }
    }
    fetchExperimentsAndFunding()
  }, [lab?.labId])

  useEffect(() => {
    async function checkLabAdmin() {
      if (!user?.id || !lab?.labId) {
        console.log("Admin check: missing user or lab", { userId: user?.id, labId: lab?.labId })
        setIsAdmin(false)
        return
      }
      console.log("Admin check: checking for user", user.id, "in lab", lab.labId)
      const { data, error } = await supabase
        .from("labMembers")
        .select("user, role")
        .eq("lab_id", lab.labId)
        .eq("user", user.id)
        .in("role", ["admin", "founder"])
        .limit(1)
      console.log("Admin check result:", { data, error })
      if (error || !data) {
        setIsAdmin(false)
        return
      }
      setIsAdmin(data.length > 0)
      if (data.length > 0) {
        console.log("User IS admin for this lab.")
      } else {
        console.log("User is NOT admin for this lab.")
      }
    }
    checkLabAdmin()
  }, [user?.id, lab?.labId])

  useEffect(() => {
    if (user && lab?.labId) {
      isFollowingLab(lab.labId, user.id).then(setLocalIsFollowing)
    }
  }, [user, lab?.labId])

  useEffect(() => {
    async function fetchOneTimeDonation() {
      if (!lab?.labId) return
      const { data, error } = await supabase
        .from("donation_funding")
        .select("*")
        .eq("labId", lab.labId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      console.log("Fetched oneTimeDonation:", { data, error })
      if (!error && data) setOneTimeDonation(data)
      else setOneTimeDonation(null)
    }
    fetchOneTimeDonation()
  }, [lab?.labId])

  useEffect(() => {
    async function fetchMembership() {
      if (!lab?.labId) return;
      console.log('Fetching membership for labId:', lab.labId);
      const { data, error } = await supabase
        .from("recurring_funding")
        .select("*")
        .eq("labId", String(lab.labId).trim())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      console.log("Fetched membership data:", data, error);
      setMembership(data);
    }
    fetchMembership();
  }, [lab?.labId]);

  useEffect(() => {
    async function fetchMembersBreakdown() {
      if (!lab?.labId) return;
      // 1. Fetch labMembers (founders/admins/others)
      const { data: labMembersRaw } = await supabase
        .from("labMembers")
        .select("user, role")
        .eq("lab_id", lab.labId);
      const labMembers = labMembersRaw || [];
      const founders = new Set(labMembers.filter(m => m.role === "founder").map(m => m.user));
      const admins = new Set(labMembers.filter(m => m.role === "admin").map(m => m.user));
      // 2. Fetch labContributors
      const { data: labContribsRaw } = await supabase
        .from("labContributors")
        .select("userId")
        .eq("labId", lab.labId);
      const labContribs = labContribsRaw || [];
      const contributors = new Set(labContribs.map(c => c.userId));
      // 3. Fetch labDonors
      const { data: labDonorsRaw } = await supabase
        .from("labDonors")
        .select("userId")
        .eq("labId", lab.labId);
      const labDonors = labDonorsRaw || [];
      // 4. Fetch labSubscribers (these are donors)
      const { data: labSubsRaw } = await supabase
        .from("labSubscribers")
        .select("userId")
        .eq("labId", lab.labId);
      const labSubs = labSubsRaw || [];
      const donors = new Set([...labDonors.map(d => d.userId), ...labSubs.map(s => s.userId)]);
      // 5. Union all user IDs for total
      const all = new Set([
        ...founders,
        ...admins,
        ...contributors,
        ...donors,
      ]);
      setMembersBreakdown({
        total: all.size,
        founders: founders.size,
        admins: admins.size,
        donors: donors.size,
        contributors: contributors.size,
      });
    }
    fetchMembersBreakdown();
  }, [lab?.labId]);

  // Fetch contributions from contribution_requests for this lab
  useEffect(() => {
    if (!lab?.labId) return;
    const fetchContributions = async () => {
      const { data, error } = await supabase
        .from('contribution_requests')
        .select('*')
        .eq('labFrom', lab.labId)
      if (!error && data) {
        setContributions(data)
        setPendingCount(data.filter((c: any) => c.status === 'pending').length)
      } else {
        setContributions([])
        setPendingCount(0)
      }
    }
    fetchContributions()
  }, [lab?.labId])

  useEffect(() => {
    async function fetchOrgInfo() {
      if (lab?.org_id) {
        const { data, error } = await supabase
          .from('organizations')
          .select('org_name, profilePic')
          .eq('org_id', lab.org_id)
          .single();
        if (!error && data) setOrgInfo(data)
        else setOrgInfo(null)
      } else {
        setOrgInfo(null)
      }
    }
    fetchOrgInfo()
  }, [lab?.org_id])

  const handleTabChange = (value: string) => {
    setLocalActiveTab(value)
    // Reset expanded state when changing tabs
    setExpandedTab(null)
  }

  const toggleExpand = (tabName: string) => {
    if (expandedTab === tabName) {
      setExpandedTab(null)
    } else {
      setExpandedTab(tabName)
    }
  }

  const startRenamingFile = (fileId: string) => {
    if (fileId === "fmri") {
      setTempFileName(fmriFileName)
    } else if (fileId === "cognitive") {
      setTempFileName(cognitiveFileName)
    }
    setRenamingFile(fileId)
  }

  const saveRenamedFile = (fileId: string) => {
    if (tempFileName.trim()) {
      if (fileId === "fmri") {
        setFmriFileName(tempFileName)
      } else if (fileId === "cognitive") {
        setCognitiveFileName(tempFileName)
      }
    }
    setRenamingFile(null)
  }

  const cancelRenamingFile = () => {
    setRenamingFile(null)
  }

  const dismissNotification = (id: number) => {
    setLocalNotifications(localNotifications.filter((notification) => notification.id !== id))
  }

  const dismissAllNotifications = () => {
    setLocalNotifications([])
  }

  // Global Add Button handlers
  const handleUploadFile = () => {
    setUploadFileDialogOpen(true)
  }

  const handleNewFolder = () => {
    setLocalActiveTab("lab-materials")
    setCreateNewFolder(true)
  }

  const handleNewExperiment = () => {
    setCreateExperimentDialogOpen(true)
  }

  const handleInviteMember = () => {
    setInviteMemberDialogOpen(true)
  }

  const handleSettings = () => {
    setLocalActiveTab("settings")
    setActiveSettingsTab("general")
  }

  const localHandleGuestAction = () => {
    setLoginPromptOpen(true)
    setTimeout(() => setLoginPromptOpen(false), 3000)
  }

  const handleEditFund = (fund: any) => {
    setCurrentEditFund(fund)
    setEditFundDialogOpen(true)
  }

  const handleSaveFund = (updatedFund: any) => {
    setFunds(funds.map((fund) => (fund.id === updatedFund.id ? updatedFund : fund)))
    setEditFundDialogOpen(false)
    setCurrentEditFund(null)
  }

  const handleViewContribution = (contribution: Contribution) => {
    setSelectedContribution(contribution)
    setContributionDetailOpen(true)
  }

  const handleApproveContribution = (id: string) => {
    setContributions(
      contributions.map((contribution) =>
        contribution.id === id ? { ...contribution, status: "approved" } : contribution,
      ),
    )
    // Switch to lab materials tab when contribution is approved
    setLocalActiveTab("lab-materials")
  }

  const handleRejectContribution = (id: string, reason: string) => {
    setContributions(
      contributions.map((contribution) =>
        contribution.id === id ? { ...contribution, status: "rejected", rejectReason: reason } : contribution,
      ),
    )
  }

  const toggleDonations = async () => {
    if (!lab?.labId) return;
    const newValue = !isDonationsActive;
    const { error } = await supabase
      .from("labs")
      .update({ one_time_donation_option: newValue })
      .eq("labId", lab.labId);
    if (!error) {
      setIsDonationsActive(newValue);
      toast({
        title: newValue ? "Donations Activated" : "Donations Deactivated",
        description: newValue
          ? "One-time donations have been activated"
          : "One-time donations have been deactivated",
      });
      refetchLab && refetchLab();
    } else {
      toast({
        title: "Error",
        description: "Failed to update donation status.",
        variant: "destructive",
      });
    }
  };

  const filteredContributions = contributions
    .filter((contribution) => {
      if (contributionFilter === "all") return true
      return contribution.status === contributionFilter
    })
    .filter(
      (contribution) =>
        contribution.title.toLowerCase().includes(contributionSearch.toLowerCase()) ||
        contribution.contributor.name.toLowerCase().includes(contributionSearch.toLowerCase()),
    )

  const isExpanded = expandedTab !== null

  const handleLogEvent = () => {
    setLogEventDialogOpen(true)
  }

  const handleManageMembership = () => {
    setEditMembershipDialogOpen(true)
  }

  const handleFollowToggle = async () => {
    if (!user || !lab?.labId) return
    if (localIsFollowing) {
      const success = await unfollowLab(lab.labId, user.id)
      if (success) setLocalIsFollowing(false)
    } else {
      const success = await followLab(lab.labId, user.id)
      if (success) setLocalIsFollowing(true)
    }
  }

  // Refetch functions for membership and one-time donation
  const refetchMembership = async () => {
    if (!lab?.labId) return;
    const { data, error } = await supabase
      .from("recurring_funding")
      .select("*")
      .eq("labId", String(lab.labId).trim())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    setMembership(data);
    // Also refetch labsMembershipOption in case status changed
    const { data: labData } = await supabase
      .from("labs")
      .select("membership_option")
      .eq("labId", lab.labId)
      .single();
    setLabsMembershipOption(labData?.membership_option || false);
  };
  const refetchOneTimeDonation = async () => {
    if (!lab?.labId) return;
    const { data, error } = await supabase
      .from("donation_funding")
      .select("*")
      .eq("labId", lab.labId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    setOneTimeDonation(data);
    // Also refetch isDonationsActive in case status changed
    const { data: labData } = await supabase
      .from("labs")
      .select("one_time_donation_option")
      .eq("labId", lab.labId)
      .single();
    setIsDonationsActive(labData?.one_time_donation_option ?? false);
  };

  return (
    <div className="container mx-auto pt-4 pb-8">
      {loading ? (
        <LoadingAnimation />
      ) : (
        <>
          {/* Contribution Dialog for non-admin users */}
          <ContributionDialog
            open={contributionDialogOpen}
            onOpenChange={setContributionDialogOpen}
            experimentId={lab.labId}
            experimentName={lab.labName}
          />
          {/* Role indicator banner */}
          <div
            className={`p-2 text-center text-sm font-medium rounded-md mb-4 ${
              isAdmin
                ? "bg-purple-900/30 text-purple-300"
                : isUser
                  ? "bg-blue-900/30 text-blue-300"
                  : "bg-gray-900/30 text-gray-300"
            }`}
          >
            You are viewing as: {isAdmin ? "Lab Admin" : isUser ? "Logged-in User" : "Guest (Not Logged In)"}
          </div>

          {/* Login prompt for guests */}
          <LoginPrompt isOpen={loginPromptOpen} onClose={() => setLoginPromptOpen(false)} />

          {/* Global Add Button - Only visible for admins */}
          {/*
          {isAdmin && (
            <GlobalAddButton
              onUploadFile={handleUploadFile}
              onNewFolder={handleNewFolder}
              onNewExperiment={handleNewExperiment}
              onInviteMember={handleInviteMember}
              onSettings={handleSettings}
              onLogEvent={handleLogEvent}
            />
          )}
          */}

          {/* Lab Profile - Full width at the top */}
          <div className="w-full mb-6">
            <LabProfile
              lab={labState}
              categories={categories}
              notifications={localNotifications}
              isAdmin={isAdmin}
              isGuest={isGuest}
              isFollowing={localIsFollowing}
              setIsFollowing={handleFollowToggle}
              notificationsSidebarOpen={localNotificationsSidebarOpen}
              setNotificationsSidebarOpen={setLocalNotificationsSidebarOpen}
              handleGuestAction={localHandleGuestAction}
              setActiveTab={setLocalActiveTab}
              router={router}
              experimentsCount={experimentsCount}
              filesCount={filesCount}
              fundingTotal={fundingTotals}
              membersCount={membersBreakdown.total}
              membersBreakdown={membersBreakdown}
              onOpenContributeDialog={() => setContributionDialogOpen(true)}
              orgInfo={orgInfo}
              user={user}
            />
          </div>

          {/* Main content with navigation and content area */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left side navigation and activity explorer */}
            <div className="w-full md:w-64 shrink-0 space-y-4">
              {/* Navigation */}
              <div className="bg-card rounded-lg overflow-hidden">
                <nav className="flex flex-col">
                  <button
                    onClick={() => handleTabChange("overview")}
                    className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      localActiveTab === "overview" ? "bg-accent text-background" : "hover:bg-muted"
                    }`}
                  >
                    <Home className="h-5 w-5" />
                    <span className="font-medium">OVERVIEW</span>
                  </button>

                  <button
                    onClick={() => handleTabChange("lab-materials")}
                    className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      localActiveTab === "lab-materials" ? "bg-accent text-background" : "hover:bg-muted"
                    }`}
                  >
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">LAB MATERIALS</span>
                  </button>

                  <button
                    onClick={() => handleTabChange("experiments")}
                    className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      localActiveTab === "experiments" ? "bg-accent text-background" : "hover:bg-muted"
                    }`}
                  >
                    <FlaskConical className="h-5 w-5" />
                    <span className="font-medium">EXPERIMENTS</span>
                  </button>

                  <button
                    onClick={() => handleTabChange("funding")}
                    className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      localActiveTab === "funding" ? "bg-accent text-background" : "hover:bg-muted"
                    }`}
                  >
                    <DollarSign className="h-5 w-5" />
                    <span className="font-medium">FUNDING</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setLocalActiveTab("settings")
                        setActiveSettingsTab("general")
                      }}
                      className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        localActiveTab === "settings" ? "bg-accent text-background" : "hover:bg-muted"
                      }`}
                    >
                      <Users className="h-5 w-5" />
                      <span className="font-medium">SETTINGS</span>
                      {pendingCount > 0 && (
                        <span className="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full px-2 py-0.5">
                          {pendingCount}
                        </span>
                      )}
                    </button>
                  )}
                </nav>
              </div>

              {/* Activity Explorer */}
              <ActivityExplorer labId={lab.labId} isAdmin={isAdmin} />
            </div>

            {/* Main content area */}
            <div className="flex-1">
              {localActiveTab === "overview" && (
                <LabOverviewTab
                  isAdmin={isAdmin}
                  expandedTab={expandedTab}
                  toggleExpand={toggleExpand}
                  funds={funds}
                  experimentsExpanded={experimentsExpanded}
                  setExperimentsExpanded={setExperimentsExpanded}
                  setCreateExperimentDialogOpen={setCreateExperimentDialogOpen}
                  liveExperimentsData={experiments}
                  labId={lab.labId}
                />
              )}

              {localActiveTab === "lab-materials" && (
                <LabMaterialsExplorer labId={lab.labId} createNewFolder={createNewFolder} isAdmin={isAdmin} />
              )}

              {localActiveTab === "experiments" && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle>EXPERIMENTS</CardTitle>
                    <div className="flex items-center gap-2">
                      {/* New experiment button only for admins */}
                      {isAdmin && (
                        <Button
                          className="bg-accent text-primary-foreground hover:bg-accent/90"
                          onClick={() => setCreateExperimentDialogOpen(true)}
                        >
                          <FlaskConical className="h-4 w-4 mr-2" />
                          START NEW EXPERIMENT
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleExpand("experiments")}
                        className="h-8 w-8 ml-2"
                      >
                        {expandedTab === "experiments" ? (
                          <Minimize2 className="h-4 w-4" />
                        ) : (
                          <Maximize2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ExperimentsList labId={lab.labId} experiments={experiments} />
                  </CardContent>
                </Card>
              )}

              {localActiveTab === "funding" && (
                <LabFundingTab
                  isAdmin={isAdmin}
                  isGuest={isGuest}
                  expandedTab={expandedTab}
                  toggleExpand={toggleExpand}
                  funds={funds}
                  setFunds={setFunds}
                  membership={membership}
                  oneTimeDonation={oneTimeDonation}
                  isDonationsActive={isDonationsActive}
                  toggleDonations={toggleDonations}
                  handleGuestAction={localHandleGuestAction}
                  labId={lab.labId}
                  labsMembershipOption={labsMembershipOption}
                  refetchMembership={refetchMembership}
                  refetchOneTimeDonation={refetchOneTimeDonation}
                  lab={labState}
                  refetchLab={refetchLab}
                />
              )}

              {localActiveTab === "settings" && isAdmin && (
                <LabSettingsTab
                  activeSettingsTab={activeSettingsTab}
                  setActiveSettingsTab={setActiveSettingsTab}
                  setActiveTab={setLocalActiveTab}
                  pendingCount={pendingCount}
                  contributionSearch={contributionSearch}
                  setContributionSearch={setContributionSearch}
                  contributionFilter={contributionFilter}
                  setContributionFilter={setContributionFilter}
                  filteredContributions={filteredContributions}
                  handleViewContribution={handleViewContribution}
                  SettingsDialogComponent={<SettingsDialog lab={labState} onLabUpdated={setLabState} />}
                  labId={lab.labId}
                />
              )}
            </div>
          </div>

          {/* Add the LabChat component - only for admins and logged-in users */}
          {!isGuest && lab?.labId && <LabChat labId={String(lab.labId)} />}

          {/* Notifications Sidebar - only for admins */}
          {isAdmin && localNotificationsSidebarOpen && (
            <NotificationsSidebar
              notifications={localNotifications}
              dismissNotification={dismissNotification}
              dismissAllNotifications={dismissAllNotifications}
              setNotificationsSidebarOpen={setLocalNotificationsSidebarOpen}
            />
          )}

          {/* Dialogs */}
          <LabDialogs
            isAdmin={isAdmin}
            isUser={isUser}
            inviteMemberDialogOpen={inviteMemberDialogOpen}
            setInviteMemberDialogOpen={setInviteMemberDialogOpen}
            uploadFileDialogOpen={uploadFileDialogOpen}
            setUploadFileDialogOpen={setUploadFileDialogOpen}
            createExperimentDialogOpen={createExperimentDialogOpen}
            setCreateExperimentDialogOpen={setCreateExperimentDialogOpen}
            editFundDialogOpen={editFundDialogOpen}
            setEditFundDialogOpen={setEditFundDialogOpen}
            currentEditFund={currentEditFund}
            handleSaveFund={handleSaveFund}
            contributionDetailOpen={contributionDetailOpen}
            setContributionDetailOpen={setContributionDetailOpen}
            selectedContribution={selectedContribution}
            setSelectedContribution={setSelectedContribution}
            handleApproveContribution={handleApproveContribution}
            handleRejectContribution={handleRejectContribution}
            logEventDialogOpen={logEventDialogOpen}
            setLogEventDialogOpen={setLogEventDialogOpen}
            editMembershipDialogOpen={editMembershipDialogOpen}
            setEditMembershipDialogOpen={setEditMembershipDialogOpen}
            labId={lab.labId}
            lab={lab}
            userId={user?.id || ""}
          />
        </>
      )}
    </div>
  )
}
