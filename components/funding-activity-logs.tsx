"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowDownIcon, ArrowUpIcon, ChevronDownIcon, FilterIcon, SearchIcon } from "lucide-react"
import { format } from "date-fns"

type FundingEvent = {
  id: string
  type: "donation" | "grant" | "withdrawal" | "goal-created" | "goal-completed"
  amount?: number
  description: string
  date: Date
  user: {
    name: string
    avatar: string
  }
  goalId?: string
  goalTitle?: string
}

export function FundingActivityLogs() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<string | null>(null)

  // Sample funding events data
  const fundingEvents: FundingEvent[] = [
    {
      id: "1",
      type: "donation",
      amount: 500,
      description: "Donation to Cancer Research Fund",
      date: new Date(2023, 2, 15, 14, 30),
      user: {
        name: "Alex Johnson",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      goalId: "goal-1",
      goalTitle: "Cancer Research Fund",
    },
    {
      id: "2",
      type: "grant",
      amount: 25000,
      description: "National Science Foundation Grant",
      date: new Date(2023, 2, 10, 9, 15),
      user: {
        name: "Dr. Sarah Williams",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      goalId: "goal-2",
      goalTitle: "Quantum Computing Research",
    },
    {
      id: "3",
      type: "withdrawal",
      amount: 1200,
      description: "Equipment purchase - Microscope",
      date: new Date(2023, 2, 5, 11, 45),
      user: {
        name: "Dr. Michael Chen",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      goalId: "goal-1",
      goalTitle: "Cancer Research Fund",
    },
    {
      id: "4",
      type: "goal-created",
      description: "New funding goal created",
      date: new Date(2023, 2, 1, 10, 0),
      user: {
        name: "Dr. Emily Rodriguez",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      goalId: "goal-3",
      goalTitle: "Climate Change Research Initiative",
    },
    {
      id: "5",
      type: "donation",
      amount: 1000,
      description: "Anonymous donation",
      date: new Date(2023, 1, 28, 16, 20),
      user: {
        name: "Anonymous Donor",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      goalId: "goal-2",
      goalTitle: "Quantum Computing Research",
    },
    {
      id: "6",
      type: "goal-completed",
      description: "Funding goal reached",
      date: new Date(2023, 1, 25, 13, 10),
      user: {
        name: "System",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      goalId: "goal-4",
      goalTitle: "Genetics Lab Equipment",
    },
    {
      id: "7",
      type: "grant",
      amount: 15000,
      description: "University Research Grant",
      date: new Date(2023, 1, 20, 9, 30),
      user: {
        name: "University Grant Committee",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      goalId: "goal-3",
      goalTitle: "Climate Change Research Initiative",
    },
  ]

  const filteredEvents = fundingEvents
    .filter((event) => {
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          event.description.toLowerCase().includes(query) ||
          event.user.name.toLowerCase().includes(query) ||
          (event.goalTitle && event.goalTitle.toLowerCase().includes(query))
        )
      }
      return true
    })
    .filter((event) => {
      // Apply type filter
      if (filter) {
        return event.type === filter
      }
      return true
    })

  const getEventIcon = (type: FundingEvent["type"]) => {
    switch (type) {
      case "donation":
        return <ArrowUpIcon className="h-4 w-4 text-green-500" />
      case "grant":
        return <ArrowUpIcon className="h-4 w-4 text-blue-500" />
      case "withdrawal":
        return <ArrowDownIcon className="h-4 w-4 text-red-500" />
      case "goal-created":
        return (
          <Badge variant="outline" className="px-1 py-0">
            New
          </Badge>
        )
      case "goal-completed":
        return (
          <Badge variant="outline" className="px-1 py-0 bg-green-100">
            Complete
          </Badge>
        )
      default:
        return null
    }
  }

  const getEventTypeLabel = (type: FundingEvent["type"]) => {
    switch (type) {
      case "donation":
        return "Donation"
      case "grant":
        return "Grant"
      case "withdrawal":
        return "Withdrawal"
      case "goal-created":
        return "Goal Created"
      case "goal-completed":
        return "Goal Completed"
      default:
        return type
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)} className="flex items-center gap-2">
        <FilterIcon className="h-4 w-4" />
        View Funding Activity
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Funding Activity Logs</DialogTitle>
          </DialogHeader>

          <div className="flex items-center gap-2 my-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search funding activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <FilterIcon className="h-4 w-4" />
                  {filter ? getEventTypeLabel(filter as FundingEvent["type"]) : "All Types"}
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilter(null)}>All Types</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("donation")}>Donations</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("grant")}>Grants</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("withdrawal")}>Withdrawals</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("goal-created")}>Goals Created</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("goal-completed")}>Goals Completed</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Tabs defaultValue="all" className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="all">All Activity</TabsTrigger>
              <TabsTrigger value="incoming">Incoming Funds</TabsTrigger>
              <TabsTrigger value="outgoing">Outgoing Funds</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          <img
                            src={event.user.avatar || "/placeholder.svg"}
                            alt={event.user.name}
                            className="h-10 w-10 rounded-full"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{event.user.name}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">
                              {format(event.date, "MMM d, yyyy 'at' h:mm a")}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            {getEventIcon(event.type)}
                            <span className="text-sm font-medium">{getEventTypeLabel(event.type)}</span>
                            {event.amount && (
                              <span className="text-sm font-semibold">
                                {new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                }).format(event.amount)}
                              </span>
                            )}
                          </div>

                          <p className="text-sm mt-1">{event.description}</p>

                          {event.goalTitle && (
                            <div className="mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {event.goalTitle}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No funding activities found matching your criteria
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="incoming" className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {filteredEvents
                    .filter((event) => ["donation", "grant"].includes(event.type))
                    .map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          <img
                            src={event.user.avatar || "/placeholder.svg"}
                            alt={event.user.name}
                            className="h-10 w-10 rounded-full"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{event.user.name}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">
                              {format(event.date, "MMM d, yyyy 'at' h:mm a")}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            {getEventIcon(event.type)}
                            <span className="text-sm font-medium">{getEventTypeLabel(event.type)}</span>
                            {event.amount && (
                              <span className="text-sm font-semibold">
                                {new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                }).format(event.amount)}
                              </span>
                            )}
                          </div>

                          <p className="text-sm mt-1">{event.description}</p>

                          {event.goalTitle && (
                            <div className="mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {event.goalTitle}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="outgoing" className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {filteredEvents
                    .filter((event) => ["withdrawal"].includes(event.type))
                    .map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          <img
                            src={event.user.avatar || "/placeholder.svg"}
                            alt={event.user.name}
                            className="h-10 w-10 rounded-full"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{event.user.name}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">
                              {format(event.date, "MMM d, yyyy 'at' h:mm a")}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            {getEventIcon(event.type)}
                            <span className="text-sm font-medium">{getEventTypeLabel(event.type)}</span>
                            {event.amount && (
                              <span className="text-sm font-semibold">
                                {new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                }).format(event.amount)}
                              </span>
                            )}
                          </div>

                          <p className="text-sm mt-1">{event.description}</p>

                          {event.goalTitle && (
                            <div className="mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {event.goalTitle}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredEvents.length} of {fundingEvents.length} funding activities
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
