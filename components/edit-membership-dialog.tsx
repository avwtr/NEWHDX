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
  const [description, setDescription] = useState("")
  const [isActive, setIsActive] = useState(true)

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
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Edit Membership</DialogTitle>
          <DialogDescription>
            Set up or edit your lab's recurring membership option.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={membershipName} onChange={e => setMembershipName(e.target.value)} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div>
            <Label>Monthly Amount ($)</Label>
            <Input type="number" min="1" value={price} onChange={e => setPrice(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Label>Active</Label>
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
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
