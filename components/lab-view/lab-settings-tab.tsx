"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, Search, Filter, AlertCircle, FileText, Code, Database } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SettingsDialog } from "@/components/settings-dialog"

interface LabSettingsTabProps {
  activeSettingsTab: string
  setActiveSettingsTab: (value: string) => void
  setActiveTab: (value: string) => void
  pendingCount: number
  contributionSearch: string
  setContributionSearch: (value: string) => void
  contributionFilter: string
  setContributionFilter: (value: string) => void
  filteredContributions: any[]
  handleViewContribution: (contribution: any) => void
}

export function LabSettingsTab({
  activeSettingsTab,
  setActiveSettingsTab,
  setActiveTab,
  pendingCount,
  contributionSearch,
  setContributionSearch,
  contributionFilter,
  setContributionFilter,
  filteredContributions,
  handleViewContribution,
}: LabSettingsTabProps) {
  return (
    <div className="mt-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>SETTINGS</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("overview")}
            className="text-accent hover:bg-secondary"
          >
            <X className="h-4 w-4 mr-1" />
            CLOSE
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs value={activeSettingsTab} onValueChange={setActiveSettingsTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="contributions" className="relative">
                Contributions
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <SettingsDialog />
            </TabsContent>

            <TabsContent value="contributions">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 justify-between">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search contributions..."
                      className="pl-8"
                      value={contributionSearch}
                      onChange={(e) => setContributionSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={contributionFilter} onValueChange={setContributionFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border rounded-md">
                  <div className="bg-secondary/50 p-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">
                      {pendingCount} pending contribution{pendingCount !== 1 && "s"} require
                      {pendingCount === 1 && "s"} review
                    </span>
                  </div>
                  <ScrollArea className="h-[400px]">
                    <div className="divide-y divide-secondary">
                      {filteredContributions.length > 0 ? (
                        filteredContributions.map((contribution) => (
                          <div
                            key={contribution.id}
                            className="p-4 hover:bg-secondary/20 transition-colors cursor-pointer"
                            onClick={() => handleViewContribution(contribution)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium">{contribution.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage
                                      src={contribution.contributor.avatar}
                                      alt={contribution.contributor.name}
                                    />
                                    <AvatarFallback>{contribution.contributor.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <span>{contribution.contributor.name}</span>
                                  <span>•</span>
                                  <span>{contribution.date}</span>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm line-clamp-2 mt-1">{contribution.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge
                                className={
                                  contribution.status === "pending"
                                    ? "bg-amber-500"
                                    : contribution.status === "approved"
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                }
                              >
                                {contribution.status.toUpperCase()}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <FileText className="h-3.5 w-3.5" />
                                <span>
                                  {contribution.files.length} file{contribution.files.length !== 1 && "s"}
                                </span>
                              </div>
                              {contribution.files.some((f) => f.type === "code") && (
                                <div className="flex items-center gap-1 text-xs text-blue-400">
                                  <Code className="h-3.5 w-3.5" />
                                  <span>Code</span>
                                </div>
                              )}
                              {contribution.files.some((f) => f.type === "data") && (
                                <div className="flex items-center gap-1 text-xs text-green-400">
                                  <Database className="h-3.5 w-3.5" />
                                  <span>Data</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center text-muted-foreground">
                          <p>No contributions found</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
