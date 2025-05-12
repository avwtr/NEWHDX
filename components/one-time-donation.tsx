"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Edit2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { toast } from "@/components/ui/use-toast"

export function OneTimeDonation({ labId, funds = [] }: { labId: string, funds?: any[] }) {
  const { user } = useAuth();
  const isAdmin = false // Only show donation UI for non-admins
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [minAmount, setMinAmount] = useState("10")
  const [suggestedAmounts, setSuggestedAmounts] = useState(["25", "50", "100", "250"])
  const [newAmount, setNewAmount] = useState("")
  const [selectedAmount, setSelectedAmount] = useState("")
  const [customAmount, setCustomAmount] = useState("")
  const [selectedFund, setSelectedFund] = useState(funds[0]?.id || "")
  const [paymentMethod, setPaymentMethod] = useState<any>(null)
  const [loadingPM, setLoadingPM] = useState(false)
  const [donating, setDonating] = useState(false)

  // Fetch payment method on modal open
  useEffect(() => {
    if (isDialogOpen && user?.id) {
      setLoadingPM(true)
      fetch("/api/stripe/get-payment-info", {
        method: "POST",
        headers: { "x-user-id": user.id },
      })
        .then(res => res.json())
        .then(data => {
          setPaymentMethod(data.error ? null : data)
        })
        .finally(() => setLoadingPM(false))
    }
  }, [isDialogOpen, user?.id])

  const handleAddAmount = () => {
    if (newAmount && !suggestedAmounts.includes(newAmount)) {
      setSuggestedAmounts([...suggestedAmounts, newAmount])
      setNewAmount("")
    }
  }

  const handleRemoveAmount = (amount: string) => {
    setSuggestedAmounts(suggestedAmounts.filter((a) => a !== amount))
  }

  const amount = Number(selectedAmount || customAmount)
  const fee = Math.round(amount * 0.025)
  const net = amount - fee

  const handleDonate = async () => {
    if (!user || !amount || !selectedFund) {
      toast({ title: "Missing info", description: "Please select an amount, a fund, and ensure you are logged in." })
      return
    }
    setDonating(true)
    try {
      const res = await fetch("/api/stripe/charge-donation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          labId,
          goalId: selectedFund,
          amount: amount * 100, // Stripe expects cents
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Thank you!", description: "Your donation was successful." })
        setIsDialogOpen(false)
        setSelectedAmount("")
        setCustomAmount("")
      } else {
        toast({ title: "Error", description: data.error || "Donation failed." })
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message })
    } finally {
      setDonating(false)
    }
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">ONE-TIME DONATION</CardTitle>
          <CardDescription>Support our research with a single contribution</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid grid-cols-2 gap-2 mb-4">
            {suggestedAmounts.map((amount) => (
              <Button key={amount} variant={selectedAmount === amount ? "default" : "outline"} className="w-full" onClick={() => { setSelectedAmount(amount); setCustomAmount("") }}>
                ${amount}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-muted-foreground">$</span>
              </div>
              <Input className="pl-7" placeholder="Other amount" value={customAmount} onChange={e => { setCustomAmount(e.target.value); setSelectedAmount("") }} type="number" min="1" />
            </div>
          </div>
          <div className="mb-2">
            <Label htmlFor="fund-select">Fund/Goal</Label>
            <select id="fund-select" className="w-full border rounded px-2 py-1 mt-1" value={selectedFund} onChange={e => setSelectedFund(e.target.value)}>
              {funds.map(fund => (
                <option key={fund.id} value={fund.id}>{fund.goalName || fund.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-accent text-primary-foreground hover:bg-accent/90" variant="default">
                DONATE
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Donation</DialogTitle>
                <DialogDescription>Review and confirm your donation details.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Amount</Label>
                  <div className="text-lg font-bold">${amount ? (amount / 1).toFixed(2) : "-"}</div>
                </div>
                <div>
                  <Label>HDX Fee (2.5%)</Label>
                  <div className="text-md">${fee ? (fee / 100).toFixed(2) : "-"}</div>
                </div>
                <div>
                  <Label>Net to Lab</Label>
                  <div className="text-md font-semibold text-green-700">${net ? (net / 100).toFixed(2) : "-"}</div>
                </div>
                <div>
                  <Label>Payment Method</Label>
                  {loadingPM ? (
                    <div>Loading...</div>
                  ) : paymentMethod ? (
                    <div className="flex items-center gap-3">
                      <span>{paymentMethod.brand?.toUpperCase() || paymentMethod.bank_name}</span>
                      <span>•••• {paymentMethod.last4}</span>
                      {paymentMethod.exp_month && paymentMethod.exp_year && (
                        <span>Exp: {paymentMethod.exp_month}/{paymentMethod.exp_year}</span>
                      )}
                      <Button size="sm" variant="outline" className="ml-2" asChild>
                        <a href="/profile">Change</a>
                      </Button>
                      <Button size="sm" variant="destructive" className="ml-1" asChild>
                        <a href="/profile">Remove</a>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-red-500">No payment method found. <a href="/profile" className="underline">Add one in your profile</a>.</div>
                  )}
                </div>
                <div>
                  <Label>Fund/Goal</Label>
                  <div>{funds.find(f => f.id === selectedFund)?.goalName || funds.find(f => f.id === selectedFund)?.name || "-"}</div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleDonate} disabled={donating || !amount || !paymentMethod || !user} className="w-full bg-accent text-primary-foreground hover:bg-accent/90">
                  {donating ? "Processing..." : `Confirm $${(amount / 100).toFixed(2)} Donation`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  )
}
