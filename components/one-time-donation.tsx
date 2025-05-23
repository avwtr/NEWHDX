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
import { useAuth } from "@/components/auth-provider"
import { toast } from "@/components/ui/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function OneTimeDonation({ labId, funds = [], onDonationSuccess }: { labId: string, funds?: any[], onDonationSuccess?: () => void }) {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [suggestedAmounts, setSuggestedAmounts] = useState(["25", "50", "100", "250"])
  const [selectedAmount, setSelectedAmount] = useState("")
  const [customAmount, setCustomAmount] = useState("")
  const [selectedFund, setSelectedFund] = useState(funds[0]?.id || "")
  const [paymentMethod, setPaymentMethod] = useState<any>(null)
  const [loadingPM, setLoadingPM] = useState(false)
  const [donating, setDonating] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [caption, setCaption] = useState("")

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

  // Use dollars for all UI calculations
  const amount = Number(selectedAmount || customAmount)
  const fee = amount ? +(amount * 0.025).toFixed(2) : 0
  const net = amount ? +(amount - fee).toFixed(2) : 0

  const handleDonate = async () => {
    console.log('ONE-TIME-DONATION handleDonate called', { user, amount, selectedFund, paymentMethod });
    if (!user) {
      toast({ title: "Not logged in", description: "You must be logged in to donate." })
      return
    }
    if (!amount) {
      toast({ title: "Missing amount", description: "Please enter or select a donation amount." })
      return
    }
    if (!selectedFund) {
      toast({ title: "Missing fund", description: "Please select a fund or goal." })
      return
    }
    if (!paymentMethod) {
      toast({ title: "No payment method", description: "Please add a payment method in your profile before donating." })
      return
    }
    setDonating(true)
    try {
      const selectedFundObj = funds.find(f => f.id === selectedFund);
      const fundName = selectedFundObj?.goalName || selectedFundObj?.name || "";
      const fundId = selectedFundObj?.id || "";
      const res = await fetch("/api/stripe/charge-donation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          labId,
          goalId: fundId,
          goalName: fundName,
          amount: Math.round(amount * 100), // Stripe expects cents
          caption: caption.trim(),
        }),
      })
      const data = await res.json()
      console.log('Donation response:', data);
      
      if (data.success) {
        toast({ title: "Thank you!", description: "Your donation was successful." })
        setIsDialogOpen(false)
        setSelectedAmount("")
        setCustomAmount("")
        setCaption("")
        setShowSuccessAnimation(true)
        setTimeout(() => setShowSuccessAnimation(false), 3000)
        // Log donation activity
        await fetch('/api/log-activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activity_name: 'Donated',
            activity_type: 'donation',
            performed_by: user.id,
            lab_from: labId,
            goal_id: fundId,
            goal_name: fundName,
            amount,
            created_at: new Date().toISOString(),
          })
        });
        if (typeof onDonationSuccess === 'function') {
          onDonationSuccess();
        }
      } else {
        console.error('Donation failed:', data.error);
        toast({ 
          title: "Error", 
          description: data.error || "Donation failed. Please try again." 
        })
      }
    } catch (err: any) {
      console.error('Donation error:', err);
      toast({ 
        title: "Error", 
        description: err.message || "An unexpected error occurred. Please try again." 
      })
    } finally {
      setDonating(false)
    }
  }

  return (
    <>
      <Button
        className="w-full bg-accent text-primary-foreground hover:bg-accent/90"
        onClick={() => user ? setIsDialogOpen(true) : undefined}
        disabled={!user}
        title={!user ? "You must be logged in to donate" : ""}
      >
        {user ? "CONTRIBUTE" : "LOGIN TO DONATE"}
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>One-Time Donation</DialogTitle>
            <DialogDescription>Support our research with a single contribution</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Amount</Label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {suggestedAmounts.map((amt) => (
                  <Button key={amt} variant={selectedAmount === amt ? "default" : "outline"} className="w-full" onClick={() => { setSelectedAmount(amt); setCustomAmount("") }}>
                    ${amt}
                  </Button>
                ))}
              </div>
              <Input className="mt-2" placeholder="Other amount" value={customAmount} onChange={e => { setCustomAmount(e.target.value); setSelectedAmount("") }} type="number" min="1" />
            </div>
            <div>
              <Label>Select Fund</Label>
              <RadioGroup value={selectedFund} onValueChange={setSelectedFund} className="max-h-[40vh] overflow-y-auto pr-2">
                {funds.map((fund) => (
                  <div key={fund.id} className="flex items-start space-x-2 p-2 rounded-md hover:bg-secondary/50 mb-2">
                    <RadioGroupItem value={fund.id} id={`fund-${fund.id}`} className="mt-1" />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor={`fund-${fund.id}`} className="font-medium">
                        {fund.goalName || fund.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">{fund.goal_description || fund.description}</p>
                      <div className="mt-1">
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-accent" style={{ width: `${fund.percentFunded}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>
                            ${fund.currentAmount?.toLocaleString?.() ?? 0}/{fund.goalAmount?.toLocaleString?.() ?? 0}
                          </span>
                          {fund.daysRemaining && <span>{fund.daysRemaining} days remaining</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="donation-caption">Add a caption (optional)</Label>
              <Input id="donation-caption" placeholder="e.g. In honor of..." value={caption} onChange={e => setCaption(e.target.value)} maxLength={120} />
              <div className="text-xs text-muted-foreground mt-1">This will be shown with your donation (optional, max 120 chars).</div>
            </div>
            <div>
              <Label>HDX Fee (2.5%)</Label>
              <div className="text-md">${fee ? fee.toFixed(2) : "-"}</div>
            </div>
            <div>
              <Label>Net to Lab</Label>
              <div className="text-md font-semibold text-green-700">${net ? net.toFixed(2) : "-"}</div>
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
          </div>
          <DialogFooter>
            <Button onClick={handleDonate} disabled={donating || !amount || !paymentMethod || !user || !selectedFund} className="w-full bg-accent text-primary-foreground hover:bg-accent/90">
              {donating ? "Processing..." : `Confirm $${amount ? amount.toFixed(2) : "-"} Donation`}
            </Button>
            {(!user || !amount || !paymentMethod || !selectedFund) && (
              <div className="text-xs text-red-500 mt-2">
                {!user && "You must be logged in to donate."}
                {!paymentMethod && user && "You must add a payment method in your profile before donating."}
                {user && paymentMethod && !amount && "Please enter or select a donation amount."}
                {user && !selectedFund && "Please select a fund or goal."}
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {showSuccessAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col items-center animate-fade-in">
            <div className="mb-4">
              <span className="inline-block">
                <svg className="w-16 h-16 text-green-500 animate-pop-in" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="4" fill="none" className="animate-circular-stroke" />
                  <path d="M20 34L29 43L44 25" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="animate-checkmark" />
                </svg>
              </span>
            </div>
            <div className="text-lg font-semibold text-green-700 text-center">Donation submitted successfully.</div>
            <div className="text-sm text-muted-foreground text-center mt-1">An email confirmation will be sent to you.</div>
          </div>
          <style jsx global>{`
            @keyframes fade-in {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .animate-fade-in {
              animation: fade-in 0.3s ease;
            }
            @keyframes pop-in {
              0% { transform: scale(0.5); opacity: 0; }
              80% { transform: scale(1.1); opacity: 1; }
              100% { transform: scale(1); opacity: 1; }
            }
            .animate-pop-in {
              animation: pop-in 0.5s cubic-bezier(0.22, 1, 0.36, 1);
            }
            @keyframes circular-stroke {
              0% { stroke-dasharray: 0 188.4; }
              100% { stroke-dasharray: 188.4 0; }
            }
            .animate-circular-stroke {
              stroke-dasharray: 188.4 0;
              stroke-dashoffset: 0;
              animation: circular-stroke 0.7s ease-out;
            }
            @keyframes checkmark {
              0% { stroke-dasharray: 0 36; }
              100% { stroke-dasharray: 36 0; }
            }
            .animate-checkmark {
              stroke-dasharray: 36 0;
              stroke-dashoffset: 0;
              animation: checkmark 0.4s 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }
          `}</style>
        </div>
      )}
    </>
  )
}
