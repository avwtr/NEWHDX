"use client"

import type React from "react"
import { useState, useEffect } from "react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Maximize2, Minimize2, Edit2, Trash2, PowerOff, Power } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { CreateFundDialog } from "@/components/create-fund-dialog"
import { FundAllocationDialog } from "@/components/fund-allocation-dialog"
import { EditDonationDialog } from "@/components/edit-donation-dialog"
import { FundingActivityDialog } from "@/components/funding-activity-dialog"
import { EditMembershipDialog } from "@/components/edit-membership-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { EditFundDialog } from "@/components/edit-fund-dialog"

interface LabFundingTabProps {
  isAdmin: boolean
  isGuest: boolean
  expandedTab: string | null
  toggleExpand: (tabName: string) => void
  funds: any[]
  setFunds: React.Dispatch<React.SetStateAction<any[]>>
  membership: any
  oneTimeDonation: any
  isDonationsActive: boolean
  toggleDonations: () => void
  handleGuestAction: () => void
  handleManageMembership: () => void
  labId: string
  labsMembershipOption: boolean
  refetchMembership: () => Promise<void>
  refetchOneTimeDonation: () => Promise<void>
}

export function LabFundingTab({
  isAdmin,
  isGuest,
  expandedTab,
  toggleExpand,
  funds,
  setFunds,
  membership,
  oneTimeDonation,
  isDonationsActive,
  toggleDonations,
  handleGuestAction,
  handleManageMembership,
  labId,
  labsMembershipOption,
  refetchMembership,
  refetchOneTimeDonation,
}: LabFundingTabProps) {
  console.log("LabFundingTab props:", {
    membership,
    labsMembershipOption,
    isMembershipSetUp: !!membership,
    isMembershipActive: !!membership && labsMembershipOption
  })
  const [showDonationDialog, setShowDonationDialog] = useState(false)
  const [showMembershipDialog, setShowMembershipDialog] = useState(false)
  const [donationName, setDonationName] = useState("")
  const [donationDescription, setDonationDescription] = useState("")
  const [donationActive, setDonationActive] = useState(true)
  const [donationAmounts, setDonationAmounts] = useState<string[]>(["10", "25", "50", "100", "250", "500"])
  const [donationAmountInput, setDonationAmountInput] = useState("")
  const { user } = useAuth()
  const [showEditDonationDialog, setShowEditDonationDialog] = useState(false)
  const [editDonationName, setEditDonationName] = useState("")
  const [editDonationDescription, setEditDonationDescription] = useState("")
  const [editDonationActive, setEditDonationActive] = useState(isDonationsActive)
  const [editDonationAmounts, setEditDonationAmounts] = useState<number[]>([])
  const [editDonationAmountInput, setEditDonationAmountInput] = useState("")
  const [showEditMembershipDialog, setShowEditMembershipDialog] = useState(false)
  const [showSetupMembershipDialog, setShowSetupMembershipDialog] = useState(false)
  const [editMembershipName, setEditMembershipName] = useState("")
  const [editMembershipDescription, setEditMembershipDescription] = useState("")
  const [editMembershipActive, setEditMembershipActive] = useState(!!membership && labsMembershipOption)
  const [editMembershipAmount, setEditMembershipAmount] = useState("")
  const [editFundDialogOpen, setEditFundDialogOpen] = useState(false)
  const [currentEditFund, setCurrentEditFund] = useState<any>(null)

  // Helper to determine if membership is set up and active
  const isMembershipSetUp = !!membership
  const isMembershipActive = !!membership && labsMembershipOption
  const isDonationSetUp = !!oneTimeDonation
  const isDonationActive = isDonationsActive

  // Fetch and ensure General Fund
  useEffect(() => {
    async function fetchAndEnsureFunds() {
      if (!labId) return
      let { data: allFunds, error } = await supabase
        .from("funding_goals")
        .select("*")
        .eq("lab_id", labId)
      if (error) return
      allFunds = allFunds || []
      // Check for General Fund
      let generalFund = allFunds.find(f => f.goalName === "GENERAL FUND")
      if (!generalFund) {
        const { data: inserted, error: insertError } = await supabase
          .from("funding_goals")
          .insert({
            lab_id: labId,
            goalName: "GENERAL FUND",
            goal_description: "A flexible fund for general lab support.",
            goal_amount: null,
            deadline: null,
            amount_contributed: 0,
            created_by: null,
          })
          .select()
          .single()
        if (!insertError && inserted) {
          generalFund = inserted
          allFunds = [inserted, ...allFunds]
        }
      }
      // Always put General Fund first
      const sortedFunds = [
        ...(generalFund ? [generalFund] : []),
        ...allFunds.filter(f => f.goalName !== "GENERAL FUND")
      ]
      setFunds(sortedFunds)
    }
    fetchAndEnsureFunds()
  }, [labId])

  // Handler to refetch funds after creation
  const handleFundCreated = () => {
    // Refetch funds
    (async () => {
      let { data: allFunds, error } = await supabase
        .from("funding_goals")
        .select("*")
        .eq("lab_id", labId)
      if (error) return
      allFunds = allFunds || []
      let generalFund = allFunds.find(f => f.goalName === "GENERAL FUND")
      const sortedFunds = [
        ...(generalFund ? [generalFund] : []),
        ...allFunds.filter(f => f.goalName !== "GENERAL FUND")
      ]
      setFunds(sortedFunds)
    })()
  }

  // When opening the edit modal, prefill fields
  const openEditDonationModal = () => {
    setEditDonationName(oneTimeDonation.donation_setup_name || "")
    setEditDonationDescription(oneTimeDonation.donation_description || "")
    setEditDonationActive(isDonationsActive)
    setEditDonationAmounts(oneTimeDonation.suggested_amounts || [])
    setShowEditDonationDialog(true)
  }

  const openEditMembershipModal = () => {
    setEditMembershipName(membership?.name || "")
    setEditMembershipDescription(membership?.description || "")
    setEditMembershipActive(labsMembershipOption)
    setEditMembershipAmount(membership?.monthly_amount || "")
    setShowEditMembershipDialog(true)
  }

  const openSetupMembershipModal = () => {
    setEditMembershipName("")
    setEditMembershipDescription("")
    setEditMembershipActive(true)
    setEditMembershipAmount("")
    setShowSetupMembershipDialog(true)
  }

  // Handler to open edit dialog and fetch latest fund data
  const handleEditFund = async (fund: any) => {
    // Fetch latest data for this fund
    const { data, error } = await supabase
      .from("funding_goals")
      .select("*")
      .eq("id", fund.id)
      .single()
    if (!error && data) {
      setCurrentEditFund({
        id: data.id,
        name: data.goalName,
        description: data.goal_description,
        currentAmount: data.amount_contributed ?? 0,
        goalAmount: data.goal_amount ?? 0,
        percentFunded: data.goal_amount ? Math.round((data.amount_contributed ?? 0) / data.goal_amount * 100) : 0,
        daysRemaining: data.deadline ? Math.max(0, Math.ceil((new Date(data.deadline).getTime() - Date.now()) / (1000*60*60*24))) : undefined,
        endDate: data.deadline ? new Date(data.deadline) : undefined,
      })
      setEditFundDialogOpen(true)
    }
  }

  // Handler to save edits to a fund
  const handleSaveFund = async (updatedFund: any) => {
    // Update backend
    await supabase.from("funding_goals").update({
      goalName: updatedFund.name,
      goal_description: updatedFund.description,
      amount_contributed: updatedFund.currentAmount,
      goal_amount: updatedFund.goalAmount,
      deadline: updatedFund.endDate ? updatedFund.endDate.toISOString() : null,
    }).eq("id", updatedFund.id)
    setEditFundDialogOpen(false)
    setCurrentEditFund(null)
    // Refetch funds
    await handleFundCreated()
  }

  // Map backend funds to expected shape for FundAllocationDialog
  const mappedFunds = funds.map(fund => ({
    ...fund,
    currentAmount: fund.amount_contributed ?? 0,
    goalAmount: fund.goal_amount ?? 0,
    percentFunded: fund.goal_amount ? Math.round((fund.amount_contributed ?? 0) / fund.goal_amount * 100) : 0,
  }))

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>SUPPORT OUR RESEARCH</CardTitle>
        <div className="flex items-center gap-2">
          {/* Create fund button only for admins */}
          {isAdmin && <CreateFundDialog labId={labId} onFundCreated={handleFundCreated} />}
          <Button variant="ghost" size="icon" onClick={() => toggleExpand("funding")} className="h-8 w-8">
            {expandedTab === "funding" ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription>Your contributions help us advance our research and develop new technologies</CardDescription>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className={`border-accent ${isMembershipSetUp && !isMembershipActive ? "opacity-60" : ""}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">LAB MEMBERSHIP</CardTitle>
                  <CardDescription>{isMembershipSetUp ? membership.name : "Not set up"}</CardDescription>
                </div>
                {isAdmin && isMembershipSetUp && (
                  <Button
                    variant="outline"
                    size="sm"
                    className={(isMembershipActive ? "text-red-500 border-red-500" : "text-green-500 border-green-500") + " px-2 py-1 text-xs h-7 min-w-[90px]"}
                    onClick={async () => {
                      try {
                        const { error } = await supabase.from("labs").update({ membership_option: !isMembershipActive }).eq("labId", labId)
                        if (error) throw error
                        toast({ title: isMembershipActive ? "Memberships Deactivated" : "Memberships Activated", description: `Lab memberships have been ${isMembershipActive ? "deactivated" : "activated"}.` })
                        await refetchMembership()
                      } catch (err) {
                        let message = "Failed to update membership status"
                        if (err instanceof Error) message = err.message
                        toast({ title: "Error", description: message })
                      }
                    }}
                  >
                    {isMembershipActive ? (
                      <>
                        <PowerOff className="h-4 w-4 mr-1" />
                        DEACTIVATE
                      </>
                    ) : (
                      <>
                        <Power className="h-4 w-4 mr-1" />
                        ACTIVATE
                      </>
                    )}
                  </Button>
                )}
              </div>
              {!isMembershipActive && isAdmin && isMembershipSetUp && (
                <div className="mt-2 text-sm text-amber-500 font-medium">MEMBERSHIPS CURRENTLY DISABLED</div>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{isMembershipSetUp ? membership.description : "No description yet."}</p>
              {isMembershipSetUp && (
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <div className="bg-secondary/50 rounded px-2 py-1">
                    <span className="font-semibold text-accent">${membership.monthly_amount || 0}</span> / month
                  </div>
                  <div className="bg-secondary/50 rounded px-2 py-1">
                    Subscribers: <span className="font-semibold text-accent">42</span>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {isAdmin ? (
                isMembershipSetUp ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-accent text-accent hover:bg-secondary"
                      onClick={openEditMembershipModal}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      EDIT
                    </Button>
                    <Dialog open={showEditMembershipDialog} onOpenChange={setShowEditMembershipDialog}>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Membership</DialogTitle>
                          <DialogDescription>Update your lab's recurring membership option.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input placeholder="Membership Name" value={editMembershipName} onChange={e => setEditMembershipName(e.target.value)} />
                          <Input placeholder="Description" value={editMembershipDescription} onChange={e => setEditMembershipDescription(e.target.value)} />
                          <Input placeholder="Monthly Amount" type="number" min="1" value={editMembershipAmount} onChange={e => setEditMembershipAmount(e.target.value)} />
                          <div className="border-t pt-4">
                            <h4 className="font-medium mb-2">Welcome Email</h4>
                            <Input 
                              placeholder="Welcome Email Subject" 
                              value={membership.welcome_email_subject || ""} 
                              onChange={(e) => {
                                // Handle welcome email subject update
                              }}
                            />
                            <textarea 
                              className="w-full min-h-[100px] bg-secondary/50 rounded-md p-2 text-sm mt-2"
                              placeholder="Welcome Email Content"
                              value={membership.welcome_email_content || ""}
                              onChange={(e) => {
                                // Handle welcome email content update
                              }}
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-4 mt-4">
                            <div className="bg-secondary/50 rounded-lg p-3">
                              <div className="text-sm text-muted-foreground">Monthly Revenue</div>
                              <div className="text-lg font-semibold">${membership.monthly_amount || 0}</div>
                            </div>
                            <div className="bg-secondary/50 rounded-lg p-3">
                              <div className="text-sm text-muted-foreground">Active Subscribers</div>
                              <div className="text-lg font-semibold">{membership.subscriber_count || 0}</div>
                            </div>
                            <div className="bg-secondary/50 rounded-lg p-3">
                              <div className="text-sm text-muted-foreground">Total Revenue</div>
                              <div className="text-lg font-semibold">${membership.total_revenue || 0}</div>
                            </div>
                          </div>
                          <div className="border border-secondary rounded-lg p-4 mt-4">
                            <h4 className="font-medium mb-2">Recent Subscribers</h4>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto">
                              {membership.subscribers?.map((subscriber: any) => (
                                <div key={subscriber.id} className="flex items-center justify-between bg-secondary/50 rounded-md p-2">
                                  <div>
                                    <div className="font-medium">{subscriber.name}</div>
                                    <div className="text-sm text-muted-foreground">{subscriber.email}</div>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Joined {new Date(subscriber.joined_at).toLocaleDateString()}
                                  </div>
                                </div>
                              ))}
                              {(!membership.subscribers || membership.subscribers.length === 0) && (
                                <div className="text-sm text-muted-foreground text-center py-2">
                                  No subscribers yet
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowEditMembershipDialog(false)}>Cancel</Button>
                          <Button
                            onClick={async () => {
                              try {
                                const { error: updateError } = await supabase.from("recurring_funding").update({
                                  name: editMembershipName,
                                  description: editMembershipDescription,
                                  monthly_amount: editMembershipAmount,
                                  welcome_email_subject: membership.welcome_email_subject,
                                  welcome_email_content: membership.welcome_email_content,
                                }).eq("id", membership.id)
                                if (updateError) throw updateError
                                const { error: labsError } = await supabase.from("labs").update({ membership_option: editMembershipActive }).eq("labId", labId)
                                if (labsError) throw labsError
                                toast({ title: "Membership Updated", description: "Membership option updated!" })
                                setShowEditMembershipDialog(false)
                                await refetchMembership()
                                // Optionally trigger a refetch here
                              } catch (err) {
                                let message = "Failed to update membership option"
                                if (err instanceof Error) message = err.message
                                toast({ title: "Error", description: message })
                              }
                            }}
                          >
                            Confirm
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                ) : (
                  <Button className="w-full bg-accent text-primary-foreground hover:bg-accent/90" onClick={openSetupMembershipModal}>
                    SET UP
                  </Button>
                )
              ) : isGuest ? (
                <Button className="w-full bg-accent text-primary-foreground hover:bg-accent/90" onClick={handleGuestAction} disabled={!isMembershipActive}>
                  {isMembershipActive ? "SUBSCRIBE" : "SET UP"}
                </Button>
              ) : (
                <FundAllocationDialog funds={mappedFunds} buttonText={isMembershipActive ? "SUBSCRIBE" : "SET UP"} donationType="monthly" fixedAmount={isMembershipActive ? membership?.monthly_amount || 0 : 0} />
              )}
            </CardFooter>
          </Card>

          <Card className={`border-secondary ${isDonationSetUp && !isDonationActive ? "opacity-60" : ""}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">ONE-TIME DONATION</CardTitle>
                  <CardDescription>{isDonationSetUp ? oneTimeDonation.donation_setup_name : "Not set up"}</CardDescription>
                </div>
                {isAdmin && isDonationSetUp && (
                  <Button
                    variant="outline"
                    size="sm"
                    className={(isDonationActive ? "text-red-500 border-red-500" : "text-green-500 border-green-500") + " px-2 py-1 text-xs h-7 min-w-[90px]"}
                    onClick={async () => {
                      try {
                        const { error } = await supabase.from("labs").update({ one_time_donation_option: !isDonationActive }).eq("labId", labId)
                        if (error) throw error
                        toast({ title: isDonationActive ? "Donations Deactivated" : "Donations Activated", description: `One-time donations have been ${isDonationActive ? "deactivated" : "activated"}.` })
                        await refetchOneTimeDonation()
                      } catch (err) {
                        let message = "Failed to update donation status"
                        if (err instanceof Error) message = err.message
                        toast({ title: "Error", description: message })
                      }
                    }}
                  >
                    {isDonationActive ? (
                      <>
                        <PowerOff className="h-4 w-4 mr-1" />
                        DEACTIVATE
                      </>
                    ) : (
                      <>
                        <Power className="h-4 w-4 mr-1" />
                        ACTIVATE
                      </>
                    )}
                  </Button>
                )}
              </div>
              {!isDonationActive && isAdmin && isDonationSetUp && (
                <div className="mt-2 text-sm text-amber-500 font-medium">DONATIONS CURRENTLY DISABLED</div>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{isDonationSetUp ? oneTimeDonation.donation_description : "No description yet."}</p>
              {isDonationSetUp && (
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <div className="bg-secondary/50 rounded px-2 py-1">
                    Donors: <span className="font-semibold text-accent">17</span>
                  </div>
                  <div className="bg-secondary/50 rounded px-2 py-1">
                    Avg. Donation: <span className="font-semibold text-accent">$68</span>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {isAdmin ? (
                isDonationSetUp ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-accent text-accent hover:bg-secondary"
                      onClick={openEditDonationModal}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      EDIT
                    </Button>
                    <Dialog open={showEditDonationDialog} onOpenChange={setShowEditDonationDialog}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit One-Time Donation</DialogTitle>
                          <DialogDescription>Update your one-time donation option.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input placeholder="Donation Name" value={editDonationName} onChange={e => setEditDonationName(e.target.value)} />
                          <Input placeholder="Description" value={editDonationDescription} onChange={e => setEditDonationDescription(e.target.value)} />
                          <div>
                            <label className="block mb-1">Suggested Amounts</label>
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {editDonationAmounts.map((amt, idx) => (
                                <div key={idx} className="flex items-center bg-secondary rounded-md px-2 py-1 mb-1">
                                  <input
                                    type="number"
                                    value={amt}
                                    min="1"
                                    className="w-16 bg-transparent border-none outline-none text-accent mr-1"
                                    onChange={e => {
                                      const newAmts = [...editDonationAmounts]
                                      newAmts[idx] = Number(e.target.value)
                                      setEditDonationAmounts(newAmts)
                                    }}
                                  />
                                  <button
                                    className="text-red-500 hover:text-red-600 ml-1"
                                    onClick={() => setEditDonationAmounts(editDonationAmounts.filter((_, i) => i !== idx))}
                                    type="button"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Input
                                type="number"
                                min="1"
                                placeholder="Add amount..."
                                value={editDonationAmountInput}
                                onChange={e => setEditDonationAmountInput(e.target.value)}
                                className="w-24"
                                onKeyDown={e => {
                                  if (e.key === "Enter" && editDonationAmountInput && !isNaN(Number(editDonationAmountInput))) {
                                    setEditDonationAmounts([...editDonationAmounts, Number(editDonationAmountInput)])
                                    setEditDonationAmountInput("")
                                  }
                                }}
                              />
                              <Button variant="outline" onClick={() => {
                                if (editDonationAmountInput && !isNaN(Number(editDonationAmountInput))) {
                                  setEditDonationAmounts([...editDonationAmounts, Number(editDonationAmountInput)])
                                  setEditDonationAmountInput("")
                                }
                              }}>Add</Button>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowEditDonationDialog(false)}>Cancel</Button>
                          <Button
                            onClick={async () => {
                              try {
                                const { error: updateError } = await supabase.from("donation_funding").update({
                                  donation_setup_name: editDonationName,
                                  donation_description: editDonationDescription,
                                  suggested_amounts: editDonationAmounts,
                                }).eq("id", oneTimeDonation.id)
                                if (updateError) throw updateError
                                const { error: labsError } = await supabase.from("labs").update({ one_time_donation_option: editDonationActive }).eq("labId", labId)
                                if (labsError) throw labsError
                                toast({ title: "One-Time Donation Updated", description: "Donation option updated!" })
                                setShowEditDonationDialog(false)
                                await refetchOneTimeDonation()
                                // Optionally trigger a refetch here
                              } catch (err) {
                                let message = "Failed to update donation option"
                                if (err instanceof Error) message = err.message
                                toast({ title: "Error", description: message })
                              }
                            }}
                          >
                            Confirm
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                ) : (
                  <Button className="w-full bg-accent text-primary-foreground hover:bg-accent/90" onClick={() => setShowDonationDialog(true)}>
                    SET UP
                  </Button>
                )
              ) : isGuest ? (
                <Button className="w-full bg-accent text-primary-foreground hover:bg-accent/90" onClick={handleGuestAction} disabled={!isDonationActive}>
                  {isDonationActive ? "DONATE" : "SET UP"}
                </Button>
              ) : (
                <FundAllocationDialog funds={mappedFunds} buttonText="CONTRIBUTE" donationType="one-time" defaultAmount={mappedFunds[0]?.amount || 0} />
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Only show funding goals if at least one funding option is active */}
        {(isMembershipActive || isDonationActive) && (
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">CURRENT FUNDING GOALS</CardTitle>
              {isAdmin && <CreateFundDialog labId={labId} onFundCreated={handleFundCreated} />}
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {funds.map((fund, idx) => {
                  const percentFunded = fund.goal_amount ? Math.round((fund.amount_contributed ?? 0) / fund.goal_amount * 100) : 0;
                  return (
                    <div key={fund.id} className={`border border-secondary rounded-lg p-4${fund.goalName === "GENERAL FUND" ? " bg-accent/10" : ""}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{fund.goalName}</h3>
                          <p className="text-sm text-muted-foreground">{fund.goal_description}</p>
                        </div>
                        <Badge className="bg-accent text-primary-foreground">{fund.goalName === "GENERAL FUND" ? "GENERAL" : `${percentFunded}% FUNDED`}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-accent" style={{ width: `${percentFunded}%` }} />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>${(fund.amount_contributed ?? 0).toLocaleString()} raised</span>
                          {fund.goalName !== "GENERAL FUND" && <span>Goal: ${(fund.goal_amount ?? 0).toLocaleString()}</span>}
                        </div>
                        {fund.goalName !== "GENERAL FUND" && <div className="text-xs text-muted-foreground">{fund.deadline ? `${Math.max(0, Math.ceil((new Date(fund.deadline).getTime() - Date.now()) / (1000*60*60*24)))} days remaining` : "No deadline"}</div>}
                      </div>
                      <div className="mt-4 flex justify-end gap-2">
                        {/* Only show edit/delete for non-General Fund and only for admins */}
                        {isAdmin && fund.goalName !== "GENERAL FUND" && (
                          <>
                            <Button variant="outline" className="border-accent text-accent hover:bg-secondary" onClick={() => handleEditFund(fund)}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              EDIT
                            </Button>
                            <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10" onClick={() => {
                              toast({ title: "Delete Fund", description: `${fund.goalName} has been deleted` });
                              setFunds(funds.filter((f) => f.id !== fund.id));
                              // Optionally: delete from backend and refetch
                            }}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              DELETE
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
        <div className="mt-4">
          <FundingActivityDialog />
        </div>
      </CardContent>
      {/* Edit Fund Dialog */}
      {currentEditFund && (
        <EditFundDialog
          fund={currentEditFund}
          onSave={handleSaveFund}
          isOpen={editFundDialogOpen}
          onOpenChange={setEditFundDialogOpen}
        />
      )}
    </Card>
  )
}
