"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { v4 as uuidv4 } from 'uuid'

interface Fund {
  id: string
  name: string
  description: string
  currentAmount: number
  goalAmount: number
  percentFunded: number
  daysRemaining?: number
  endDate?: Date
}

interface EditFundDialogProps {
  fund: Fund
  onSave: (updatedFund: Fund) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function EditFundDialog({ fund, onSave, isOpen, onOpenChange }: EditFundDialogProps) {
  const [name, setName] = useState(fund.name)
  const [description, setDescription] = useState(fund.description)
  const [currentAmount, setCurrentAmount] = useState((fund.currentAmount ?? 0).toString())
  const [goalAmount, setGoalAmount] = useState((fund.goalAmount ?? 0).toString())
  const [endDate, setEndDate] = useState<Date | undefined>(
    fund.endDate || (fund.daysRemaining ? new Date(Date.now() + fund.daysRemaining * 24 * 60 * 60 * 1000) : undefined),
  )

  const { user } = useAuth();

  useEffect(() => {
    setName(fund.name)
    setDescription(fund.description)
    setCurrentAmount((fund.currentAmount ?? 0).toString())
    setGoalAmount((fund.goalAmount ?? 0).toString())
    setEndDate(
      fund.endDate ||
      (fund.daysRemaining ? new Date(Date.now() + fund.daysRemaining * 24 * 60 * 60 * 1000) : undefined)
    )
  }, [fund])

  const handleSave = async () => {
    // Calculate days remaining based on end date
    const now = new Date()
    const daysRemaining = endDate ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : undefined

    // Calculate percent funded
    const current = Number.parseFloat(currentAmount)
    const goal = Number.parseFloat(goalAmount)
    const percentFunded = Math.round((current / goal) * 100)

    const updatedFund: Fund = {
      ...fund,
      name,
      description,
      currentAmount: current,
      goalAmount: goal,
      percentFunded,
      daysRemaining,
      endDate,
    }

    onSave(updatedFund)
    // Log activity for funding goal edit
    await supabase.from("activity").insert({
      activity_id: uuidv4(),
      created_at: new Date().toISOString(),
      activity_name: `Funding Goal Edited: ${name}`,
      activity_type: "funding_edited",
      performed_by: user?.id || null,
      lab_from: null // Pass labId if available
    })
    toast({
      title: "Fund Updated",
      description: `${name} has been updated successfully.`,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Funding Goal</DialogTitle>
          <DialogDescription>Update the details for this funding goal.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fund-name" className="text-right">
              Name
            </Label>
            <Input id="fund-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fund-description" className="text-right">
              Description
            </Label>
            <Textarea
              id="fund-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="current-amount" className="text-right">
              Current Amount
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <span className="text-lg">$</span>
              <Input
                id="current-amount"
                type="number"
                min="0"
                step="0.01"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-32"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="goal-amount" className="text-right">
              Goal Amount
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <span className="text-lg">$</span>
              <Input
                id="goal-amount"
                type="number"
                min="1"
                step="0.01"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                className="w-32"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end-date" className="text-right">
              End Date
            </Label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="end-date"
                    variant={"outline"}
                    className={cn("w-[240px] justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-4">
              <div className="mt-2 p-3 bg-secondary/30 rounded-md">
                <div className="text-sm font-medium mb-1">Preview</div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((Number.parseFloat(currentAmount) / Number.parseFloat(goalAmount)) * 100) || 0,
                      )}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>
                    ${Number.parseFloat(currentAmount).toLocaleString()}/ $
                    {Number.parseFloat(goalAmount).toLocaleString()}
                  </span>
                  {endDate && (
                    <span>
                      {Math.max(0, Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days
                      remaining
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

<style jsx global>{`
  .rdp-head_cell {
    color: transparent !important;
    font-size: 0 !important;
    pointer-events: none !important;
    user-select: none !important;
  }
`}</style>
