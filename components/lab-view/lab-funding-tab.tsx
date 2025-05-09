"use client"

import type React from "react"
import { useState } from "react"

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
  handleEditFund: (fund: any) => void
  handleManageMembership: () => void
  labId: string
  labsMembershipOption: boolean
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
  handleEditFund,
  handleManageMembership,
  labId,
  labsMembershipOption,
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

  // Helper to determine if membership is set up and active
  const isMembershipSetUp = !!membership
  const isMembershipActive = !!membership && labsMembershipOption
  const isDonationSetUp = !!oneTimeDonation
  const isDonationActive = isDonationsActive

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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>SUPPORT OUR RESEARCH</CardTitle>
        <div className="flex items-center gap-2">
          {/* Create fund button only for admins */}
          {isAdmin && <CreateFundDialog />}
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
              <CardTitle className="text-lg">LAB MEMBERSHIP</CardTitle>
              <CardDescription>{isMembershipSetUp ? membership.name : "Not set up"}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{isMembershipSetUp ? membership.description : "No description yet."}</p>
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
                          <div className="flex items-center gap-2">
                            <Switch checked={editMembershipActive} onCheckedChange={setEditMembershipActive} />
                            <span>Active</span>
                          </div>
                          {/* Detailed admin info only in modal */}
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
                <FundAllocationDialog funds={funds} buttonText={isMembershipActive ? "SUBSCRIBE" : "SET UP"} donationType="monthly" fixedAmount={isMembershipActive ? membership?.monthly_amount || 0 : 0} />
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
                    className={isDonationActive ? "text-red-500 border-red-500" : "text-green-500 border-green-500"}
                    onClick={toggleDonations}
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
                          <div className="flex items-center gap-2">
                            <Switch checked={editDonationActive} onCheckedChange={setEditDonationActive} />
                            <span>Active</span>
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
                <FundAllocationDialog funds={funds} buttonText={isDonationActive ? "DONATE" : "SET UP"} donationType="one-time" defaultAmount={isDonationActive ? oneTimeDonation.suggested_amounts?.[0] || 0 : 0} />
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Only show funding goals if at least one funding option is active */}
        {(isMembershipActive || isDonationActive) && (
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">CURRENT FUNDING GOALS</CardTitle>
              {isAdmin && <CreateFundDialog />}
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {funds.map((fund) => (
                  <div key={fund.id} className="border border-secondary rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{fund.name}</h3>
                        <p className="text-sm text-muted-foreground">{fund.description}</p>
                      </div>
                      <Badge className="bg-accent text-primary-foreground">{fund.percentFunded}% FUNDED</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: `${fund.percentFunded}%` }} />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>${fund.currentAmount.toLocaleString()} raised</span>
                        <span>Goal: ${fund.goalAmount.toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{fund.daysRemaining} days remaining</div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      {isGuest ? (
                        <Button className="bg-accent text-primary-foreground hover:bg-accent/90" onClick={handleGuestAction}>
                          CONTRIBUTE
                        </Button>
                      ) : isAdmin ? (
                        <div className="flex gap-2">
                          <Button variant="outline" className="border-accent text-accent hover:bg-secondary" onClick={() => handleEditFund(fund)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            EDIT
                          </Button>
                          <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10" onClick={() => {
                            toast({ title: "Delete Fund", description: `${fund.name} has been deleted` });
                            setFunds(funds.filter((f) => f.id !== fund.id));
                          }}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            DELETE
                          </Button>
                        </div>
                      ) : (
                        <FundAllocationDialog funds={[fund]} buttonText="CONTRIBUTE" donationType="one-time" defaultAmount={fund.amount} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        <div className="mt-4">
          <FundingActivityDialog />
        </div>
      </CardContent>
    </Card>
  )
}
