import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FundingActivityLogs } from "@/components/funding-activity-logs"
import Link from "next/link"
import { DollarSign, PlusCircle } from "lucide-react"

export default function FundingPage() {
  // Sample funding goals data
  const fundingGoals = [
    {
      id: "goal-1",
      title: "Cancer Research Fund",
      description: "Supporting innovative research in cancer treatment methods",
      currentAmount: 15000,
      targetAmount: 50000,
      deadline: new Date(2023, 5, 30),
      progress: 30,
    },
    {
      id: "goal-2",
      title: "Quantum Computing Research",
      description: "Advancing the field of quantum computing through experimental research",
      currentAmount: 75000,
      targetAmount: 100000,
      deadline: new Date(2023, 8, 15),
      progress: 75,
    },
    {
      id: "goal-3",
      title: "Climate Change Research Initiative",
      description: "Studying the effects of climate change on marine ecosystems",
      currentAmount: 12000,
      targetAmount: 80000,
      deadline: new Date(2023, 11, 1),
      progress: 15,
    },
  ]

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Funding Goals</h1>
        <div className="flex items-center gap-3">
          <FundingActivityLogs />
          <Button asChild>
            <Link href="/funding/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Funding Goal
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fundingGoals.map((goal) => (
          <Card key={goal.id}>
            <CardHeader>
              <CardTitle>{goal.title}</CardTitle>
              <CardDescription>{goal.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-primary mr-1" />
                    <span className="font-semibold">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                      }).format(goal.currentAmount)}
                    </span>
                    <span className="text-muted-foreground ml-1">raised</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{goal.progress}% of goal</span>
                </div>

                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${goal.progress}%` }}></div>
                </div>

                <div className="flex justify-between text-sm">
                  <span>
                    Goal:{" "}
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    }).format(goal.targetAmount)}
                  </span>
                  <span>Deadline: {goal.deadline.toLocaleDateString()}</span>
                </div>

                <div className="pt-2">
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
