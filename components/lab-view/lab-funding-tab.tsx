"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Maximize2, Minimize2, Edit2, Trash2, PowerOff, Power } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { CreateFundDialog } from "@/components/create-fund-dialog"
import { FundAllocationDialog } from "@/components/fund-allocation-dialog"
import { EditDonationDialog } from "@/components/edit-donation-dialog"
import { FundingActivityDialog } from "@/components/funding-activity-dialog"

interface LabFundingTabProps {
  isAdmin: boolean
  isGuest: boolean
  expandedTab: string | null
  toggleExpand: (tabName: string) => void
  funds: any[]
  setFunds: React.Dispatch<React.SetStateAction<any[]>>
  membershipBenefits: any[]
  donationBenefits: any[]
  isDonationsActive: boolean
  toggleDonations: () => void
  handleGuestAction: () => void
  handleEditFund: (fund: any) => void
  handleManageMembership: () => void
}

export function LabFundingTab({
  isAdmin,
  isGuest,
  expandedTab,
  toggleExpand,
  funds,
  setFunds,
  membershipBenefits,
  donationBenefits,
  isDonationsActive,
  toggleDonations,
  handleGuestAction,
  handleEditFund,
  handleManageMembership,
}: LabFundingTabProps) {
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
          <Card className="border-accent">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">LAB MEMBERSHIP</CardTitle>
              <CardDescription>$25/month</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {membershipBenefits.map((benefit) => (
                  <li key={benefit.id}>{benefit.text}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {isGuest ? (
                <Button
                  className="w-full bg-accent text-primary-foreground hover:bg-accent/90"
                  onClick={handleGuestAction}
                >
                  SUBSCRIBE
                </Button>
              ) : isAdmin ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManageMembership}
                    className="text-accent border-accent hover:bg-secondary"
                  >
                    MANAGE
                  </Button>
                </>
              ) : (
                <FundAllocationDialog funds={funds} buttonText="SUBSCRIBE" donationType="monthly" fixedAmount={25} />
              )}
            </CardFooter>
          </Card>

          <Card className={`border-secondary ${!isDonationsActive ? "opacity-60" : ""}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">ONE-TIME DONATION</CardTitle>
                  <CardDescription>Any amount</CardDescription>
                </div>
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    className={isDonationsActive ? "text-red-500 border-red-500" : "text-green-500 border-green-500"}
                    onClick={toggleDonations}
                  >
                    {isDonationsActive ? (
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
              {!isDonationsActive && isAdmin && (
                <div className="mt-2 text-sm text-amber-500 font-medium">DONATIONS CURRENTLY DISABLED</div>
              )}
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {donationBenefits.map((benefit) => (
                  <li key={benefit.id}>{benefit.text}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {isGuest ? (
                <Button
                  className="w-full bg-accent text-primary-foreground hover:bg-accent/90"
                  onClick={handleGuestAction}
                  disabled={!isDonationsActive}
                >
                  DONATE
                </Button>
              ) : isAdmin ? (
                <EditDonationDialog
                  initialBenefits={donationBenefits}
                  initialSuggestedAmounts={[10, 25, 50, 100, 250, 500]}
                />
              ) : (
                <FundAllocationDialog funds={funds} buttonText="DONATE" donationType="one-time" defaultAmount={25} />
              )}
            </CardFooter>
          </Card>
        </div>

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
                      <Button
                        className="bg-accent text-primary-foreground hover:bg-accent/90"
                        onClick={handleGuestAction}
                      >
                        CONTRIBUTE
                      </Button>
                    ) : isAdmin ? (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="border-accent text-accent hover:bg-secondary"
                          onClick={() => handleEditFund(fund)}
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          EDIT
                        </Button>
                        <Button
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-500/10"
                          onClick={() => {
                            toast({
                              title: "Delete Fund",
                              description: `${fund.name} has been deleted`,
                            })
                            setFunds(funds.filter((f) => f.id !== fund.id))
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          DELETE
                        </Button>
                      </div>
                    ) : (
                      <FundAllocationDialog
                        funds={[fund]}
                        buttonText="CONTRIBUTE"
                        donationType="one-time"
                        defaultAmount={25}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="mt-4">
          <FundingActivityDialog />
        </div>
      </CardContent>
    </Card>
  )
}
