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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Edit2 } from "lucide-react"

interface DonationBenefit {
  id: string
  text: string
}

interface EditDonationDialogProps {
  initialBenefits: DonationBenefit[]
  initialSuggestedAmounts?: number[]
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onSave?: (data: any) => void
}

export function EditDonationDialog({
  initialBenefits,
  initialSuggestedAmounts = [10, 25, 50, 100, 250, 500],
  isOpen,
  onOpenChange,
  onSave,
}: EditDonationDialogProps) {
  const [localOpen, setLocalOpen] = useState(false)
  const [benefits, setBenefits] = useState<DonationBenefit[]>(
    initialBenefits || [
      { id: "1", text: "Support our research" },
      { id: "2", text: "Name in acknowledgments" },
      { id: "3", text: "Tax-deductible contribution" },
    ],
  )
  const [newBenefit, setNewBenefit] = useState("")
  const [suggestedAmounts, setSuggestedAmounts] = useState<string[]>(
    initialSuggestedAmounts.map((amount) => amount.toString()),
  )
  const [newAmount, setNewAmount] = useState("")
  const [allowCustomAmount, setAllowCustomAmount] = useState(true)
  const [minAmount, setMinAmount] = useState("1")
  const [isActive, setIsActive] = useState(true)

  const handleSave = () => {
    if (onSave) {
      onSave({
        name: "One-Time Donation",
        description: "Make a one-time donation to support our research initiatives.",
        amounts: suggestedAmounts.map(Number),
        isActive,
        allowCustomAmount,
        minAmount: Number(minAmount)
      })
    } else {
      toast({
        title: "Donation Options Updated",
        description: `One-time donation options have been updated with ${benefits.length} benefits and ${suggestedAmounts.length} suggested amounts.`,
      })
    }
    if (onOpenChange) {
      onOpenChange(false)
    } else {
      setLocalOpen(false)
    }
  }

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setBenefits([...benefits, { id: Date.now().toString(), text: newBenefit.trim() }])
      setNewBenefit("")
    }
  }

  const removeBenefit = (id: string) => {
    setBenefits(benefits.filter((benefit) => benefit.id !== id))
  }

  const updateBenefit = (id: string, newText: string) => {
    setBenefits(benefits.map((benefit) => (benefit.id === id ? { ...benefit, text: newText } : benefit)))
  }

  const addAmount = () => {
    if (newAmount.trim() && !isNaN(Number(newAmount))) {
      setSuggestedAmounts([...suggestedAmounts, newAmount])
      setNewAmount("")
    }
  }

  const removeAmount = (amount: string) => {
    setSuggestedAmounts(suggestedAmounts.filter((a) => a !== amount))
  }

  return (
    <Dialog open={isOpen ?? localOpen} onOpenChange={onOpenChange ?? setLocalOpen}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit One-Time Donation Options</DialogTitle>
          <DialogDescription>Update the donation options and benefits for one-time contributors.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the donation options..."
              className="col-span-3"
              defaultValue="Make a one-time donation to support our research initiatives and help us reach our funding goals."
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Suggested Amounts</Label>
            <div className="col-span-3 space-y-3">
              <div className="flex flex-wrap gap-2">
                {suggestedAmounts.map((amount) => (
                  <div key={amount} className="flex items-center bg-secondary rounded-md px-2 py-1">
                    <span className="mr-1">${amount}</span>
                    <button className="text-red-500 hover:text-red-600" onClick={() => removeAmount(amount)}>
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-lg">$</span>
                <Input
                  type="number"
                  min="1"
                  placeholder="Add amount..."
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-24"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addAmount()
                    }
                  }}
                />
                <Button variant="outline" className="h-8" onClick={addAmount}>
                  Add
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="custom-amount" className="text-right">
              Custom Amount
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Switch id="custom-amount" checked={allowCustomAmount} onCheckedChange={setAllowCustomAmount} />
              <Label htmlFor="custom-amount">Allow custom amount</Label>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="min-amount" className="text-right">
              Minimum Amount
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <span className="text-lg">$</span>
              <Input
                id="min-amount"
                type="number"
                min="1"
                step="0.01"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="w-24"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isActive" className="text-right">
              Active
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange ? onOpenChange(false) : setLocalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
