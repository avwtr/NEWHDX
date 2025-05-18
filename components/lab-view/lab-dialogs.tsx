"use client"

import { InviteMemberDialog } from "@/components/invite-member-dialog"
import { FileUploadDialog } from "@/components/file-upload-dialog"
import { CreateExperimentDialog } from "@/components/create-experiment-dialog"
import { EditFundDialog } from "@/components/edit-fund-dialog"
import { ContributionDetailModal } from "@/components/contribution-detail-modal"
import { LogEventDialog } from "@/components/log-event-dialog"
import { toast } from "@/components/ui/use-toast"
import { EditMembershipDialog } from "@/components/edit-membership-dialog"
import { StartExperimentModal } from "@/components/start-experiment-modal"
import { useAuth } from "@/components/auth-provider"

interface LabDialogsProps {
  isAdmin: boolean
  isUser: boolean
  inviteMemberDialogOpen: boolean
  setInviteMemberDialogOpen: (value: boolean) => void
  uploadFileDialogOpen: boolean
  setUploadFileDialogOpen: (value: boolean) => void
  createExperimentDialogOpen: boolean
  setCreateExperimentDialogOpen: (value: boolean) => void
  editFundDialogOpen: boolean
  setEditFundDialogOpen: (value: boolean) => void
  currentEditFund: any
  handleSaveFund: (fund: any) => void
  contributionDetailOpen: boolean
  setContributionDetailOpen: (value: boolean) => void
  selectedContribution: any
  setSelectedContribution: (contribution: any) => void
  handleApproveContribution: (id: string) => void
  handleRejectContribution: (id: string, reason: string) => void
  logEventDialogOpen: boolean
  setLogEventDialogOpen: (value: boolean) => void
  editMembershipDialogOpen: boolean
  setEditMembershipDialogOpen: (value: boolean) => void
  labId: string
  lab: any
  userId: string
}

export function LabDialogs({
  isAdmin,
  isUser,
  inviteMemberDialogOpen,
  setInviteMemberDialogOpen,
  uploadFileDialogOpen,
  setUploadFileDialogOpen,
  createExperimentDialogOpen,
  setCreateExperimentDialogOpen,
  editFundDialogOpen,
  setEditFundDialogOpen,
  currentEditFund,
  handleSaveFund,
  contributionDetailOpen,
  setContributionDetailOpen,
  selectedContribution,
  setSelectedContribution,
  handleApproveContribution,
  handleRejectContribution,
  logEventDialogOpen,
  setLogEventDialogOpen,
  editMembershipDialogOpen,
  setEditMembershipDialogOpen,
  labId,
  lab,
  userId,
}: LabDialogsProps) {
  return (
    <>
      {isAdmin && (
        <>
          <InviteMemberDialog isOpen={inviteMemberDialogOpen} onClose={() => setInviteMemberDialogOpen(false)} />

          {uploadFileDialogOpen && (
            <FileUploadDialog
              onClose={() => setUploadFileDialogOpen(false)}
              onUploadComplete={(files) => {
                toast({
                  title: "Files Uploaded",
                  description: `${files.length} file(s) uploaded successfully`,
                })
                setUploadFileDialogOpen(false)
              }}
            />
          )}

          {createExperimentDialogOpen && (
            <StartExperimentModal
              isOpen={createExperimentDialogOpen}
              onClose={() => setCreateExperimentDialogOpen(false)}
              suggestedCategories={
                Array.isArray(lab?.researchAreas)
                  ? lab.researchAreas.map((cat: any) => typeof cat === 'string' ? cat : cat.category)
                  : []
              }
              labId={labId}
              userId={userId}
            />
          )}

          {currentEditFund && (
            <EditFundDialog
              fund={currentEditFund}
              onSave={handleSaveFund}
              isOpen={editFundDialogOpen}
              onOpenChange={setEditFundDialogOpen}
            />
          )}

          {contributionDetailOpen && selectedContribution && (
            <ContributionDetailModal
              contribution={selectedContribution}
              isOpen={contributionDetailOpen}
              onClose={() => {
                setContributionDetailOpen(false)
                setSelectedContribution(null)
              }}
              onApprove={handleApproveContribution}
              onReject={handleRejectContribution}
            />
          )}

          <LogEventDialog open={logEventDialogOpen} onOpenChange={setLogEventDialogOpen} />

          <EditMembershipDialog
            initialPrice={25}
            initialBenefits={[
              { id: "1", text: "Access to member-only updates" },
              { id: "2", text: "Name in acknowledgments" },
              { id: "3", text: "Early access to publications" },
              { id: "4", text: "Quarterly virtual lab meetings" },
              { id: "5", text: "Access to raw datasets" },
            ]}
            open={editMembershipDialogOpen}
            onOpenChange={setEditMembershipDialogOpen}
          />
        </>
      )}
    </>
  )
}
