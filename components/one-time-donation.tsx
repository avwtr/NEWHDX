"use client"

import { useState } from "react"
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

export function OneTimeDonation() {
  const isAdmin = true // Replace with your actual admin role check
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [minAmount, setMinAmount] = useState("10")
  const [suggestedAmounts, setSuggestedAmounts] = useState(["25", "50", "100", "250"])
  const [newAmount, setNewAmount] = useState("")

  const handleAddAmount = () => {
    if (newAmount && !suggestedAmounts.includes(newAmount)) {
      setSuggestedAmounts([...suggestedAmounts, newAmount])
      setNewAmount("")
    }
  }

  const handleRemoveAmount = (amount: string) => {
    setSuggestedAmounts(suggestedAmounts.filter((a) => a !== amount))
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* One-time Donation */}
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">ONE-TIME DONATION</CardTitle>
          <CardDescription>Support our research with a single contribution</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid grid-cols-2 gap-2 mb-4">
            {suggestedAmounts.map((amount) => (
              <Button key={amount} variant="outline" className="w-full">
                ${amount}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-muted-foreground">$</span>
              </div>
              <Input className="pl-7" placeholder="Other amount" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          {isAdmin ? (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full border-accent text-accent hover:bg-secondary" variant="outline">
                  <Edit2 className="h-4 w-4 mr-2" />
                  EDIT
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit One-Time Donation</DialogTitle>
                  <DialogDescription>Customize the donation amounts and minimum contribution.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="min-amount" className="text-right">
                      Minimum
                    </Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <span>$</span>
                      <Input
                        id="min-amount"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                        className="w-20"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">Suggested Amounts</Label>
                    <div className="col-span-3 space-y-3">
                      {suggestedAmounts.map((amount) => (
                        <div key={amount} className="flex items-center gap-2">
                          <div className="flex items-center border rounded-md px-3 py-1 flex-1">
                            <span className="text-muted-foreground mr-1">$</span>
                            <span>{amount}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600"
                            onClick={() => handleRemoveAmount(amount)}
                          >
                            <span className="sr-only">Remove</span>×
                          </Button>
                        </div>
                      ))}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center flex-1">
                          <span className="text-muted-foreground mr-1">$</span>
                          <Input
                            value={newAmount}
                            onChange={(e) => setNewAmount(e.target.value)}
                            placeholder="Add amount"
                            className="flex-1"
                          />
                        </div>
                        <Button variant="outline" className="h-8" onClick={handleAddAmount}>
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setIsDialogOpen(false)}>Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Button className="w-full">DONATE</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
