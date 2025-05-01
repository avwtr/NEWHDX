"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase" // adjust path if needed

export function FundingGoals({ labId }: { labId: string }) {
  const [fundingGoals, setFundingGoals] = useState<any[]>([])

  useEffect(() => {
    async function fetchFundingGoals() {
      if (!labId) return
      const { data, error } = await supabase
        .from("funding")
        .select("*")
        .eq("lab_id", labId)
        .order("created_at", { ascending: false })
      if (error) {
        setFundingGoals([])
        return
      }
      setFundingGoals(data || [])
    }
    fetchFundingGoals()
  }, [labId])

  if (fundingGoals.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-muted-foreground">
          <p>No funding goals for this lab yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {fundingGoals.map((goal) => (
        <div key={goal.id} className="p-4 border rounded">
          <div className="font-medium">{goal.name}</div>
          <div className="text-sm text-muted-foreground">{goal.description}</div>
          <div className="text-xs mt-2">
            ${goal.currentAmount} / ${goal.goalAmount}
          </div>
        </div>
      ))}
    </div>
  )
}
