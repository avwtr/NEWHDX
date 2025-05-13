"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
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
}

interface FundAllocationDialogProps {
  funds: Fund[]
  buttonText: string
  donationType: "one-time" | "monthly"
  defaultAmount?: number
  fixedAmount?: number
}

export function FundAllocationDialog({
  funds,
  buttonText,
  donationType,
  defaultAmount = 10,
  fixedAmount,
}: FundAllocationDialogProps) {
  const [amount, setAmount] = useState(fixedAmount?.toString() || defaultAmount.toString())
  const [selectedFund, setSelectedFund] = useState<string | null>(funds.length > 0 ? funds[0].id : null)
  const [customAmount, setCustomAmount] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth();

  const handleSubmit = async () => {
    // Here you would typically process the donation
    console.log({
      amount: Number.parseFloat(amount),
      fundId: selectedFund,
      donationType,
    })

    // Log activity for donation
    await supabase.from("activity").insert({
      activity_id: uuidv4(),
      created_at: new Date().toISOString(),
      activity_name: `Donation Made: $${amount} to fund ${selectedFund} (${donationType})`,
      activity_type: donationType === "one-time" ? "donation_made" : "membership_subscribed",
      performed_by: user?.id || null,
      lab_from: null // You may want to pass labId as a prop for more context
    })

    // Reset form and close dialog
    if (!fixedAmount) {
      setAmount(defaultAmount.toString())
    }
    setSelectedFund(funds.length > 0 ? funds[0].id : null)
    setCustomAmount(false)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-accent text-primary-foreground hover:bg-accent/90" onClick={() => setIsOpen(true)}>
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{donationType === "one-time" ? "Make a Donation" : "Subscribe as a Lab Member"}</DialogTitle>
          <DialogDescription>
            {donationType === "one-time"
              ? "Choose an amount and select which fund you'd like to support."
              : `Your monthly contribution of $${fixedAmount} helps sustain our research.`}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          {/* Only show amount selection for one-time donations */}
          {donationType === "one-time" && (
            <div className="space-y-4">
              <Label>Amount</Label>
              {!customAmount ? (
                <div className="grid grid-cols-3 gap-2">
                  {[10, 25, 50, 100, 250, 500].map((value) => (
                    <Button
                      key={value}
                      type="button"
                      variant={amount === value.toString() ? "default" : "outline"}
                      className={amount === value.toString() ? "bg-accent text-primary-foreground" : ""}
                      onClick={() => setAmount(value.toString())}
                    >
                      ${value}
                    </Button>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCustomAmount(true)
                    }}
                  >
                    Custom
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={() => setCustomAmount(false)}>
                      Cancel
                    </Button>
                  </div>
                  <Slider
                    value={[Number.parseFloat(amount) || 0]}
                    min={1}
                    max={1000}
                    step={1}
                    onValueChange={(value) => setAmount(value[0].toString())}
                  />
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <Label>Select Fund</Label>
            <div className="max-h-[40vh] overflow-y-auto pr-2">
              <RadioGroup value={selectedFund || ""} onValueChange={setSelectedFund}>
                {funds.map((fund) => (
                  <div key={fund.id} className="flex items-start space-x-2 p-2 rounded-md hover:bg-secondary/50 mb-2">
                    <RadioGroupItem value={fund.id} id={`fund-${fund.id}`} className="mt-1" />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor={`fund-${fund.id}`} className="font-medium">
                        {fund.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">{fund.description}</p>
                      <div className="mt-1">
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-accent" style={{ width: `${fund.percentFunded}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>
                            ${fund.currentAmount.toLocaleString()}/${fund.goalAmount.toLocaleString()}
                          </span>
                          {fund.daysRemaining && <span>{fund.daysRemaining} days remaining</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex items-start space-x-2 p-2 rounded-md hover:bg-secondary/50">
                  <RadioGroupItem value="general" id="fund-general" className="mt-1" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="fund-general" className="font-medium">
                      GENERAL FUND
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Support our lab's overall operations and research initiatives.
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            className="bg-accent text-primary-foreground hover:bg-accent/90"
            onClick={handleSubmit}
            disabled={!amount || Number.parseFloat(amount) <= 0 || !selectedFund}
          >
            {donationType === "one-time" ? "Donate" : "Subscribe"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
