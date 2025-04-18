"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LabFunding } from "@/components/lab-funding"
import { OneTimeDonation } from "@/components/one-time-donation"
import { FundingGoals } from "@/components/funding-goals"

export default function LabFundingPage({ params }: { params: { slug: string } }) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Lab Funding</h1>
          <p className="text-muted-foreground">Manage funding sources and track financial goals for your lab.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="goals">Funding Goals</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 pt-4">
          <LabFunding />
          <OneTimeDonation />
        </TabsContent>

        <TabsContent value="goals" className="pt-4">
          <FundingGoals />
        </TabsContent>

        <TabsContent value="activity" className="pt-4">
          <div className="rounded-lg border p-8 text-center">
            <h3 className="text-lg font-medium">Funding Activity</h3>
            <p className="text-muted-foreground mt-2">Detailed funding activity will be displayed here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
