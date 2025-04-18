"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowDownIcon, ArrowUpIcon, CalendarIcon, DollarSign, SearchIcon, SlidersIcon } from "lucide-react"
import { format } from "date-fns"

// Mock data for funding activities
const fundingActivities = [
  {
    id: "fa1",
    type: "grant-awarded",
    amount: 75000,
    date: new Date("2025-02-15"),
    project: "Quantum Computing Research Initiative",
    recipient: "Dr. Sarah Chen",
    funder: "National Science Foundation",
    notes: "Full funding approved for 2-year research project",
  },
  {
    id: "fa2",
    type: "donation",
    amount: 5000,
    date: new Date("2025-02-10"),
    project: "Ocean Plastic Remediation Study",
    recipient: "Marine Biology Department",
    funder: "Anonymous Donor",
    notes: "Unrestricted donation to support ongoing research",
  },
  {
    id: "fa3",
    type: "equipment-purchase",
    amount: -12500,
    date: new Date("2025-02-05"),
    project: "Genetic Sequencing Lab",
    recipient: "Vendor: BioTech Solutions",
    funder: "Research Fund",
    notes: "Purchase of next-gen sequencing equipment",
  },
  {
    id: "fa4",
    type: "grant-awarded",
    amount: 120000,
    date: new Date("2025-01-28"),
    project: "Climate Change Modeling",
    recipient: "Environmental Science Team",
    funder: "Global Climate Initiative",
    notes: "3-year funding package with annual review",
  },
  {
    id: "fa5",
    type: "expense",
    amount: -3200,
    date: new Date("2025-01-22"),
    project: "Neuroscience Conference",
    recipient: "Travel & Accommodations",
    funder: "Department Budget",
    notes: "Expenses for 4 researchers to attend international conference",
  },
  {
    id: "fa6",
    type: "donation",
    amount: 25000,
    date: new Date("2025-01-15"),
    project: "STEM Education Outreach",
    recipient: "Community Programs Division",
    funder: "TechFuture Foundation",
    notes: "Earmarked for K-12 science education initiatives",
  },
  {
    id: "fa7",
    type: "expense",
    amount: -8750,
    date: new Date("2025-01-10"),
    project: "Molecular Biology Lab",
    recipient: "Lab Supplies & Reagents",
    funder: "Research Grant #RF-2024-089",
    notes: "Quarterly supply restock",
  },
  {
    id: "fa8",
    type: "grant-awarded",
    amount: 45000,
    date: new Date("2025-01-05"),
    project: "AI in Medical Diagnostics",
    recipient: "Dr. James Wilson",
    funder: "Healthcare Innovation Fund",
    notes: "Pilot project funding",
  },
]

type FundingActivityProps = {
  showTriggerButton?: boolean
}

export function FundingActivityLog({ showTriggerButton = true }: FundingActivityProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortOrder, setSortOrder] = useState("newest")

  // Filter and sort activities
  const filteredActivities = fundingActivities
    .filter((activity) => {
      // Filter by type
      if (filterType !== "all" && activity.type !== filterType) {
        return false
      }

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          activity.project.toLowerCase().includes(query) ||
          activity.recipient.toLowerCase().includes(query) ||
          activity.funder.toLowerCase().includes(query) ||
          activity.notes.toLowerCase().includes(query)
        )
      }

      return true
    })
    .sort((a, b) => {
      // Sort by date
      if (sortOrder === "newest") {
        return b.date.getTime() - a.date.getTime()
      } else {
        return a.date.getTime() - b.date.getTime()
      }
    })

  const totalIncoming = fundingActivities.filter((a) => a.amount > 0).reduce((sum, a) => sum + a.amount, 0)

  const totalOutgoing = fundingActivities.filter((a) => a.amount < 0).reduce((sum, a) => sum + Math.abs(a.amount), 0)

  const netBalance = totalIncoming - totalOutgoing

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case "grant-awarded":
        return "Grant Awarded"
      case "donation":
        return "Donation"
      case "equipment-purchase":
        return "Equipment Purchase"
      case "expense":
        return "Expense"
      default:
        return type
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
    }
  }

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case "grant-awarded":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "donation":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "equipment-purchase":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
      case "expense":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <>
      {showTriggerButton && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <DollarSign className="h-4 w-4 mr-2" />
              View Funding Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Funding Activity Log</DialogTitle>
              <DialogDescription>Track all funding-related transactions and activities</DialogDescription>
            </DialogHeader>
            <FundingActivityContent
              filteredActivities={filteredActivities}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterType={filterType}
              setFilterType={setFilterType}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              totalIncoming={totalIncoming}
              totalOutgoing={totalOutgoing}
              netBalance={netBalance}
              getActivityTypeLabel={getActivityTypeLabel}
              getActivityTypeColor={getActivityTypeColor}
            />
          </DialogContent>
        </Dialog>
      )}

      {!showTriggerButton && (
        <FundingActivityContent
          filteredActivities={filteredActivities}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterType={filterType}
          setFilterType={setFilterType}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          totalIncoming={totalIncoming}
          totalOutgoing={totalOutgoing}
          netBalance={netBalance}
          getActivityTypeLabel={getActivityTypeLabel}
          getActivityTypeColor={getActivityTypeColor}
        />
      )}
    </>
  )
}

type FundingActivityContentProps = {
  filteredActivities: typeof fundingActivities
  searchQuery: string
  setSearchQuery: (query: string) => void
  filterType: string
  setFilterType: (type: string) => void
  sortOrder: string
  setSortOrder: (order: string) => void
  totalIncoming: number
  totalOutgoing: number
  netBalance: number
  getActivityTypeLabel: (type: string) => string
  getActivityTypeColor: (type: string) => string
}

function FundingActivityContent({
  filteredActivities,
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  sortOrder,
  setSortOrder,
  totalIncoming,
  totalOutgoing,
  netBalance,
  getActivityTypeLabel,
  getActivityTypeColor,
}: FundingActivityContentProps) {
  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="transactions" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="flex-1 flex flex-col">
          <div className="flex flex-col md:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search funding activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <div className="w-40">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SlidersIcon className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="grant-awarded">Grants</SelectItem>
                    <SelectItem value="donation">Donations</SelectItem>
                    <SelectItem value="expense">Expenses</SelectItem>
                    <SelectItem value="equipment-purchase">Equipment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-40">
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger>
                    {sortOrder === "newest" ? (
                      <ArrowDownIcon className="h-4 w-4 mr-2" />
                    ) : (
                      <ArrowUpIcon className="h-4 w-4 mr-2" />
                    )}
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-3 pr-4">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((activity) => (
                  <div key={activity.id} className="border rounded-lg p-4 hover:bg-secondary/50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivityTypeColor(activity.type)}`}
                        >
                          {getActivityTypeLabel(activity.type)}
                        </span>
                        <span className="text-sm text-muted-foreground flex items-center">
                          <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                          {format(activity.date, "MMM d, yyyy")}
                        </span>
                      </div>
                      <div
                        className={`font-semibold ${activity.amount > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                      >
                        {activity.amount > 0 ? "+" : ""}
                        {activity.amount.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </div>
                    </div>
                    <h4 className="font-medium">{activity.project}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 mt-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Recipient:</span> {activity.recipient}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Source:</span> {activity.funder}
                      </div>
                    </div>
                    {activity.notes && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        <span className="font-medium">Notes:</span> {activity.notes}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No funding activities match your search criteria
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="summary">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="border rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Total Incoming</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {totalIncoming.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Total Outgoing</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {totalOutgoing.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Net Balance</div>
              <div
                className={`text-2xl font-bold ${netBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
              >
                {netBalance.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Funding Breakdown by Type</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Grants</span>
                  <span className="text-sm text-muted-foreground">
                    {fundingActivities
                      .filter((a) => a.type === "grant-awarded")
                      .reduce((sum, a) => sum + a.amount, 0)
                      .toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div
                    className="bg-green-500 h-2.5 rounded-full"
                    style={{
                      width: `${
                        (fundingActivities
                          .filter((a) => a.type === "grant-awarded")
                          .reduce((sum, a) => sum + a.amount, 0) /
                          totalIncoming) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Donations</span>
                  <span className="text-sm text-muted-foreground">
                    {fundingActivities
                      .filter((a) => a.type === "donation")
                      .reduce((sum, a) => sum + a.amount, 0)
                      .toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full"
                    style={{
                      width: `${
                        (fundingActivities.filter((a) => a.type === "donation").reduce((sum, a) => sum + a.amount, 0) /
                          totalIncoming) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Expenses</span>
                  <span className="text-sm text-muted-foreground">
                    {fundingActivities
                      .filter((a) => a.type === "expense")
                      .reduce((sum, a) => sum + Math.abs(a.amount), 0)
                      .toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div
                    className="bg-red-500 h-2.5 rounded-full"
                    style={{
                      width: `${
                        (fundingActivities
                          .filter((a) => a.type === "expense")
                          .reduce((sum, a) => sum + Math.abs(a.amount), 0) /
                          totalOutgoing) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Equipment</span>
                  <span className="text-sm text-muted-foreground">
                    {fundingActivities
                      .filter((a) => a.type === "equipment-purchase")
                      .reduce((sum, a) => sum + Math.abs(a.amount), 0)
                      .toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div
                    className="bg-amber-500 h-2.5 rounded-full"
                    style={{
                      width: `${
                        (fundingActivities
                          .filter((a) => a.type === "equipment-purchase")
                          .reduce((sum, a) => sum + Math.abs(a.amount), 0) /
                          totalOutgoing) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
