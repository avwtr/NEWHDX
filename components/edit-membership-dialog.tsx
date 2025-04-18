"use client"

import { DialogFooter } from "@/components/ui/dialog"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Search, Filter, Mail, FileUp, X, Send, Users, DollarSign, Calendar, BarChart2, Download } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface MembershipBenefit {
  id: string
  text: string
}

interface Subscriber {
  id: string
  name: string
  email: string
  avatar: string
  joinDate: string
  status: "active" | "cancelled" | "paused"
  totalContributed: number
  lastPayment: string
}

const mockSubscribers: Subscriber[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://github.com/shadcn.png",
    joinDate: "2023-01-15",
    status: "active",
    totalContributed: 150,
    lastPayment: "2023-10-28",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    avatar: "https://avatars.githubusercontent.com/u/284139?s=48&v=4",
    joinDate: "2023-02-20",
    status: "active",
    totalContributed: 200,
    lastPayment: "2023-10-20",
  },
  {
    id: "3",
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Alice",
    joinDate: "2023-03-10",
    status: "cancelled",
    totalContributed: 75,
    lastPayment: "2023-06-10",
  },
  {
    id: "4",
    name: "Bob Williams",
    email: "bob.williams@example.com",
    avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Bob",
    joinDate: "2023-04-01",
    status: "paused",
    totalContributed: 100,
    lastPayment: "2023-09-01",
  },
  {
    id: "5",
    name: "Charlie Brown",
    email: "charlie.brown@example.com",
    avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Charlie",
    joinDate: "2023-05-05",
    status: "active",
    totalContributed: 120,
    lastPayment: "2023-10-05",
  },
  {
    id: "6",
    name: "Diana Miller",
    email: "diana.miller@example.com",
    avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Diana",
    joinDate: "2023-06-12",
    status: "active",
    totalContributed: 180,
    lastPayment: "2023-10-12",
  },
  {
    id: "7",
    name: "Ethan Davis",
    email: "ethan.davis@example.com",
    avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Ethan",
    joinDate: "2023-07-22",
    status: "cancelled",
    totalContributed: 90,
    lastPayment: "2023-09-22",
  },
  {
    id: "8",
    name: "Fiona Wilson",
    email: "fiona.wilson@example.com",
    avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Fiona",
    joinDate: "2023-08-08",
    status: "paused",
    totalContributed: 110,
    lastPayment: "2023-10-08",
  },
  {
    id: "9",
    name: "George Moore",
    email: "george.moore@example.com",
    avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=George",
    joinDate: "2023-09-18",
    status: "active",
    totalContributed: 160,
    lastPayment: "2023-10-18",
  },
  {
    id: "10",
    name: "Hannah Taylor",
    email: "hannah.taylor@example.com",
    avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Hannah",
    joinDate: "2023-10-01",
    status: "active",
    totalContributed: 130,
    lastPayment: "2023-10-01",
  },
]

interface EditMembershipDialogProps {
  initialPrice: number
  initialBenefits: MembershipBenefit[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditMembershipDialog({
  initialPrice = 25,
  initialBenefits,
  open,
  onOpenChange,
}: EditMembershipDialogProps) {
  const [activeTab, setActiveTab] = useState("details")
  const [price, setPrice] = useState(initialPrice.toString())
  const [membershipName, setMembershipName] = useState("LAB MEMBERSHIP")
  const [benefits, setBenefits] = useState<MembershipBenefit[]>(
    initialBenefits || [
      { id: "1", text: "Access to member-only updates" },
      { id: "2", text: "Name in acknowledgments" },
      { id: "3", text: "Early access to publications" },
      { id: "4", text: "Quarterly virtual lab meetings" },
      { id: "5", text: "Access to raw datasets" },
    ],
  )
  const [newBenefit, setNewBenefit] = useState("")
  const [subscribers, setSubscribers] = useState<Subscriber[]>(mockSubscribers)
  const [subscriberSearch, setSubscriberSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([])
  const [emailSubject, setEmailSubject] = useState("")
  const [emailContent, setEmailContent] = useState("")
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])

  // Metrics calculations
  const activeSubscribers = subscribers.filter((sub) => sub.status === "active").length
  const totalHistoricalSubscribers = subscribers.length
  const monthlyRevenue = activeSubscribers * Number.parseFloat(price)
  const totalRevenue = subscribers.reduce((sum, sub) => sum + sub.totalContributed, 0)

  const handleSave = () => {
    // Here you would typically save the changes to your backend
    toast({
      title: "Membership Updated",
      description: `Lab membership has been updated to $${price}/month with ${benefits.length} benefits.`,
    })
    onOpenChange(false)
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setAttachedFiles([...attachedFiles, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index))
  }

  const sendEmail = () => {
    if (!emailSubject.trim() || !emailContent.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both subject and content for your email.",
        variant: "destructive",
      })
      return
    }

    const recipientCount =
      selectedSubscribers.length > 0
        ? selectedSubscribers.length
        : subscribers.filter((sub) => sub.status === "active").length

    toast({
      title: "Email Sent",
      description: `Your message has been sent to ${recipientCount} subscribers.`,
    })

    // Reset the form
    setEmailSubject("")
    setEmailContent("")
    setAttachedFiles([])
    setSelectedSubscribers([])
  }

  const toggleSubscriberSelection = (id: string) => {
    if (selectedSubscribers.includes(id)) {
      setSelectedSubscribers(selectedSubscribers.filter((subId) => subId !== id))
    } else {
      setSelectedSubscribers([...selectedSubscribers, id])
    }
  }

  const selectAllSubscribers = () => {
    if (selectedSubscribers.length === filteredSubscribers.length) {
      setSelectedSubscribers([])
    } else {
      setSelectedSubscribers(filteredSubscribers.map((sub) => sub.id))
    }
  }

  // Filter subscribers based on search and status filter
  const filteredSubscribers = subscribers.filter((subscriber) => {
    const matchesSearch =
      subscriber.name.toLowerCase().includes(subscriberSearch.toLowerCase()) ||
      subscriber.email.toLowerCase().includes(subscriberSearch.toLowerCase())

    const matchesStatus = statusFilter === "all" || subscriber.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl">Manage Lab Membership</DialogTitle>
          <DialogDescription>
            Configure membership details, view subscribers, and communicate with your members.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="details">Membership Details</TabsTrigger>
              <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="communications">Communications</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="details" className="p-6 pt-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="membership-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="membership-name"
                  value={membershipName}
                  onChange={(e) => setMembershipName(e.target.value)}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Price
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <span className="text-lg">$</span>
                  <Input
                    id="price"
                    type="number"
                    min="1"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Benefits</Label>
                <div className="col-span-3 space-y-3">
                  {benefits.map((benefit) => (
                    <div key={benefit.id} className="flex items-center gap-2">
                      <Input
                        value={benefit.text}
                        onChange={(e) => updateBenefit(benefit.id, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600"
                        onClick={() => removeBenefit(benefit.id)}
                      >
                        <span className="sr-only">Remove</span>×
                      </Button>
                    </div>
                  ))}

                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Add new benefit..."
                      value={newBenefit}
                      onChange={(e) => setNewBenefit(e.target.value)}
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addBenefit()
                        }
                      }}
                    />
                    <Button variant="outline" className="h-8" onClick={addBenefit}>
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the membership benefits..."
                  className="col-span-3"
                  defaultValue="Become a lab member and support our ongoing research while gaining exclusive access to our work."
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="subscribers" className="border-t">
            <div className="p-4 border-b flex flex-col sm:flex-row gap-3 justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subscribers..."
                  className="pl-8"
                  value={subscriberSearch}
                  onChange={(e) => setSubscriberSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2 items-center">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-b px-4 py-2 flex items-center">
              <Checkbox
                id="select-all"
                checked={selectedSubscribers.length === filteredSubscribers.length && filteredSubscribers.length > 0}
                onCheckedChange={selectAllSubscribers}
                className="mr-2"
              />
              <Label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                Select All
              </Label>
              <div className="ml-auto text-sm text-muted-foreground">
                {filteredSubscribers.length} subscriber{filteredSubscribers.length !== 1 ? "s" : ""}
              </div>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="divide-y divide-border">
                {filteredSubscribers.length > 0 ? (
                  filteredSubscribers.map((subscriber) => (
                    <div key={subscriber.id} className="p-4 hover:bg-secondary/20 transition-colors">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={`select-${subscriber.id}`}
                          checked={selectedSubscribers.includes(subscriber.id)}
                          onCheckedChange={() => toggleSubscriberSelection(subscriber.id)}
                          className="mt-1"
                        />
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={subscriber.avatar} alt={subscriber.name} />
                          <AvatarFallback>{subscriber.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{subscriber.name}</h3>
                              <p className="text-sm text-muted-foreground">{subscriber.email}</p>
                            </div>
                            <Badge
                              className={
                                subscriber.status === "active"
                                  ? "bg-green-500"
                                  : subscriber.status === "paused"
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                              }
                            >
                              {subscriber.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
                            <div className="text-muted-foreground">
                              <span className="font-medium">Joined:</span>{" "}
                              {new Date(subscriber.joinDate).toLocaleDateString()}
                            </div>
                            <div className="text-muted-foreground">
                              <span className="font-medium">Last payment:</span>{" "}
                              {new Date(subscriber.lastPayment).toLocaleDateString()}
                            </div>
                            <div className="text-muted-foreground">
                              <span className="font-medium">Total contributed:</span> ${subscriber.totalContributed}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <p>No subscribers found</p>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t flex justify-between items-center">
              <div className="text-sm text-muted-foreground">{selectedSubscribers.length} selected</div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selectedSubscribers.length === 0}
                  onClick={() => {
                    toast({
                      title: "Export Completed",
                      description: `Data for ${selectedSubscribers.length} subscribers has been exported.`,
                    })
                  }}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-accent border-accent"
                  disabled={selectedSubscribers.length === 0}
                  onClick={() => {
                    setActiveTab("communications")
                  }}
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Email Selected
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Users className="h-4 w-4 mr-2 text-accent" />
                    Subscriber Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Active Subscribers</p>
                      <p className="text-2xl font-bold">{activeSubscribers}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Historical</p>
                      <p className="text-2xl font-bold">{totalHistoricalSubscribers}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Retention Rate</p>
                      <p className="text-2xl font-bold">
                        {totalHistoricalSubscribers > 0
                          ? Math.round((activeSubscribers / totalHistoricalSubscribers) * 100)
                          : 0}
                        %
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Avg. Subscription Length</p>
                      <p className="text-2xl font-bold">4.2 mo</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-accent" />
                    Revenue Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                      <p className="text-2xl font-bold">${monthlyRevenue}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">${totalRevenue}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Avg. Subscriber Value</p>
                      <p className="text-2xl font-bold">
                        ${totalHistoricalSubscribers > 0 ? Math.round(totalRevenue / totalHistoricalSubscribers) : 0}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Projected Annual</p>
                      <p className="text-2xl font-bold">${monthlyRevenue * 12}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-accent" />
                  Subscription Activity
                </CardTitle>
                <CardDescription>Monthly subscriber growth and churn over the past 6 months</CardDescription>
              </CardHeader>
              <CardContent className="h-[250px] flex items-center justify-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BarChart2 className="h-5 w-5" />
                  <span>Subscription activity chart would appear here</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communications" className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="recipients" className="block mb-2">
                  Recipients
                </Label>
                <div className="flex items-center gap-2 p-2 border rounded-md bg-secondary/20">
                  {selectedSubscribers.length > 0 ? (
                    <div className="text-sm">
                      <span className="font-medium">{selectedSubscribers.length}</span> subscribers selected
                    </div>
                  ) : (
                    <div className="text-sm">
                      All <span className="font-medium">{activeSubscribers}</span> active subscribers
                    </div>
                  )}
                  <Button variant="outline" size="sm" className="ml-auto" onClick={() => setActiveTab("subscribers")}>
                    Change Selection
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="email-subject" className="block mb-2">
                  Subject
                </Label>
                <Input
                  id="email-subject"
                  placeholder="Enter email subject..."
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="email-content" className="block mb-2">
                  Message
                </Label>
                <Textarea
                  id="email-content"
                  placeholder="Write your message to subscribers..."
                  className="min-h-[200px]"
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                />
              </div>

              <div>
                <Label className="block mb-2">Attachments</Label>
                <div className="space-y-2">
                  {attachedFiles.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {attachedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 border rounded-md bg-secondary/20">
                          <div className="text-sm flex-1 truncate">{file.name}</div>
                          <div className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-secondary/50"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-3.5 w-3.5" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => document.getElementById("file-upload")?.click()}
                    >
                      <FileUp className="h-4 w-4" />
                      Attach Files
                    </Button>
                    <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileChange} />
                    <span className="text-xs text-muted-foreground">Max 5MB per file</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6 gap-2">
              <Button variant="outline" onClick={() => setActiveTab("subscribers")}>
                Back to Subscribers
              </Button>
              <Button className="gap-2" onClick={sendEmail} disabled={!emailSubject.trim() || !emailContent.trim()}>
                <Send className="h-4 w-4" />
                Send Email
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
