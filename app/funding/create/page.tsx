import { FundingGoalCreator } from "@/components/funding-goal-creator"

export default function CreateFundingGoalPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Create Funding Goal</h1>
      <FundingGoalCreator />
    </div>
  )
}
