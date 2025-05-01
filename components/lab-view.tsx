"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Maximize2, Minimize2, Beaker, Home, FileText, FlaskConical, Users, DollarSign } from "lucide-react"
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

// Sub-components
import LabProfile from "@/components/lab-view/lab-profile"
import { LabOverviewTab } from "@/components/lab-view/lab-overview-tab"
import { LabFundingTab } from "@/components/lab-view/lab-funding-tab"
import { LabSettingsTab } from "@/components/lab-view/lab-settings-tab"
import { NotificationsSidebar } from "@/components/lab-view/notifications-sidebar"
import { LoginPrompt } from "@/components/lab-view/login-prompt"
import { LabDialogs } from "@/components/lab-view/lab-dialogs"

// Data imports
import {
  liveExperimentsData,
  notificationsData,
  fundingData,
  membershipBenefits,
  donationBenefits,
  contributionsData,
} from "@/components/lab-view/lab-data"

export default function LabView({ lab, categories }) {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      if (user?.id && lab?.labId) {
        const { data } = await supabase
          .from("labAdmins")
          .select("id")
          .eq("lab_id", lab.labId)
          .eq("user", user.id)
        setIsAdmin(!!(data && data.length > 0))
      }
    }
    checkAdmin()
  }, [user, lab])

  const router = useRouter()
  const { currentRole, currentUser } = useRole()
  const isGuest = currentRole === "guest"
  const isUser = currentRole === "user"

  // Tab state
  const [activeTab, setActiveTab] = useState("overview")
  const [expandedTab, setExpandedTab] = useState<string | null>(null)

  // File state
  const [renamingFile, setRenamingFile] = useState<string | null>(null)
  const [fmriFileName, setFmriFileName] = useState("FMRI_ANALYSIS_PIPELINE.PY")
  const [cognitiveFileName, setCognitiveFileName] = useState("COGNITIVE_TEST_RESULTS.CSV")
  const [tempFileName, setTempFileName] = useState("")

  // Notifications state
  const [notifications, setNotifications] = useState(notificationsData)
  const [showNotifications, setShowNotifications] = useState(true)
  const [notificationsSidebarOpen, setNotificationsSidebarOpen] = useState(false)

  // Funding state
  const [funds, setFunds] = useState(fundingData)
  const [isDonationsActive, setIsDonationsActive] = useState(true)

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
  const [isFollowing, setIsFollowing] = useState(false)

  // Contributions state
  const [contributions, setContributions] = useState(contributionsData)
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null)
  const [contributionDetailOpen, setContributionDetailOpen] = useState(false)
  const [contributionFilter, setContributionFilter] = useState("all")
  const [contributionSearch, setContributionSearch] = useState("")
  const [activeSettingsTab, setActiveSettingsTab] = useState("general")

  const pendingContributions = contributions.filter((c) => c.status === "pending")
  const pendingCount = pendingContributions.length

  const handleTabChange = (value: string) => {
    setActiveTab(value)
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
    setNotifications(notifications.filter((notification) => notification.id !== id))
  }

  const dismissAllNotifications = () => {
    setNotifications([])
  }

  // Global Add Button handlers
  const handleUploadFile = () => {
    setUploadFileDialogOpen(true)
  }

  const handleNewFolder = () => {
    setActiveTab("lab-materials")
    setCreateNewFolder(true)
  }

  const handleNewExperiment = () => {
    setCreateExperimentDialogOpen(true)
  }

  const handleInviteMember = () => {
    setInviteMemberDialogOpen(true)
  }

  const handleSettings = () => {
    setActiveTab("settings")
    setActiveSettingsTab("general")
  }

  const handleGuestAction = () => {
    setLoginPromptOpen(true)
    setTimeout(() => setLoginPromptOpen(false), 3000)
  }

  const handleEditFund = (fund: (typeof funds)[0]) => {
    setCurrentEditFund(fund)
    setEditFundDialogOpen(true)
  }

  const handleSaveFund = (updatedFund: (typeof funds)[0]) => {
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
  }

  const handleRejectContribution = (id: string, reason: string) => {
    setContributions(
      contributions.map((contribution) =>
        contribution.id === id ? { ...contribution, status: "rejected", rejectReason: reason } : contribution,
      ),
    )
  }

  const toggleDonations = () => {
    setIsDonationsActive(!isDonationsActive)
    toast({
      title: isDonationsActive ? "Donations Deactivated" : "Donations Activated",
      description: isDonationsActive
        ? "One-time donations have been deactivated"
        : "One-time donations have been activated",
    })
  }

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

  return (
    <div className="container mx-auto pt-4 pb-8">
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

      {/* Notifications Bar - Only visible for admins */}
      {isAdmin && showNotifications && notifications.length > 0 && (
        <LabNotifications
          notifications={notifications}
          onDismiss={dismissNotification}
          onDismissAll={dismissAllNotifications}
        />
      )}

      {/* Lab Profile - Full width at the top */}
      <div className="w-full mb-6">
        <LabProfile
          lab={lab}
          categories={categories}
          notifications={notifications || []}
          isAdmin={isAdmin}
          isGuest={isGuest}
          isFollowing={isFollowing}
          setIsFollowing={setIsFollowing}
          notificationsSidebarOpen={notificationsSidebarOpen}
          setNotificationsSidebarOpen={setNotificationsSidebarOpen}
          handleGuestAction={handleGuestAction}
          setActiveTab={setActiveTab}
          router={router}
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
                  activeTab === "overview" ? "bg-accent text-background" : "hover:bg-muted"
                }`}
              >
                <Home className="h-5 w-5" />
                <span className="font-medium">OVERVIEW</span>
              </button>

              <button
                onClick={() => handleTabChange("lab-materials")}
                className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  activeTab === "lab-materials" ? "bg-accent text-background" : "hover:bg-muted"
                }`}
              >
                <FileText className="h-5 w-5" />
                <span className="font-medium">LAB MATERIALS</span>
              </button>

              <button
                onClick={() => handleTabChange("experiments")}
                className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  activeTab === "experiments" ? "bg-accent text-background" : "hover:bg-muted"
                }`}
              >
                <FlaskConical className="h-5 w-5" />
                <span className="font-medium">EXPERIMENTS</span>
              </button>

              <button
                onClick={() => handleTabChange("funding")}
                className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  activeTab === "funding" ? "bg-accent text-background" : "hover:bg-muted"
                }`}
              >
                <DollarSign className="h-5 w-5" />
                <span className="font-medium">FUNDING</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => {
                    setActiveTab("settings")
                    setActiveSettingsTab("general")
                  }}
                  className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    activeTab === "settings" ? "bg-accent text-background" : "hover:bg-muted"
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
          <ActivityExplorer />
        </div>

        {/* Main content area */}
        <div className="flex-1">
          {activeTab === "overview" && (
            <LabOverviewTab
              isAdmin={isAdmin}
              expandedTab={expandedTab}
              toggleExpand={toggleExpand}
              funds={funds}
              experimentsExpanded={experimentsExpanded}
              setExperimentsExpanded={setExperimentsExpanded}
              setCreateExperimentDialogOpen={setCreateExperimentDialogOpen}
              liveExperimentsData={liveExperimentsData}
            />
          )}

          {activeTab === "lab-materials" && (
            <LabMaterialsExplorer createNewFolder={createNewFolder} userRole={currentRole} />
          )}

          {activeTab === "experiments" && (
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
                      <Beaker className="h-4 w-4 mr-2" />
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
                <ExperimentsList />
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full border-accent text-accent hover:bg-secondary" asChild>
                  <Link href="/experiments">VIEW ALL EXPERIMENTS</Link>
                </Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === "funding" && (
            <LabFundingTab
              isAdmin={isAdmin}
              isGuest={isGuest}
              expandedTab={expandedTab}
              toggleExpand={toggleExpand}
              funds={funds}
              setFunds={setFunds}
              membershipBenefits={membershipBenefits}
              donationBenefits={donationBenefits}
              isDonationsActive={isDonationsActive}
              toggleDonations={toggleDonations}
              handleGuestAction={handleGuestAction}
              handleEditFund={handleEditFund}
              handleManageMembership={handleManageMembership}
            />
          )}

          {activeTab === "settings" && isAdmin && (
            <LabSettingsTab
              activeSettingsTab={activeSettingsTab}
              setActiveSettingsTab={setActiveSettingsTab}
              setActiveTab={setActiveTab}
              pendingCount={pendingCount}
              contributionSearch={contributionSearch}
              setContributionSearch={setContributionSearch}
              contributionFilter={contributionFilter}
              setContributionFilter={setContributionFilter}
              filteredContributions={filteredContributions}
              handleViewContribution={handleViewContribution}
            />
          )}
        </div>
      </div>

      {/* Add the LabChat component - only for admins and logged-in users */}
      {!isGuest && <LabChat />}

      {/* Notifications Sidebar - only for admins */}
      {isAdmin && notificationsSidebarOpen && (
        <NotificationsSidebar
          notifications={notifications}
          dismissNotification={dismissNotification}
          dismissAllNotifications={dismissAllNotifications}
          setNotificationsSidebarOpen={setNotificationsSidebarOpen}
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
      />
    </div>
  )
}
