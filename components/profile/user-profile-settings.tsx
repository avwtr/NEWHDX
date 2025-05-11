"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Upload, X, Plus, Bell, Mail, FileText, Beaker, Database } from "lucide-react"

interface UserProfileSettingsProps {
  user: any
  onClose: () => void
}

export function UserProfileSettings({ user, onClose }: UserProfileSettingsProps) {
  const [name, setName] = useState(user.name)
  const [username, setUsername] = useState(user.username)
  const [bio, setBio] = useState(user.bio)
  const [selectedInterests, setSelectedInterests] = useState(user.interests)

  // Mock data for science categories
  const allScienceCategories = [
    "Genomics",
    "Proteomics",
    "Bioinformatics",
    "Machine Learning",
    "Neural Networks",
    "Computational Biology",
    "Molecular Biology",
    "Structural Biology",
    "Protein Folding",
    "Gene Expression",
    "Systems Biology",
    "Synthetic Biology",
    "Biostatistics",
    "Evolutionary Biology",
    "Immunology",
    "Neuroscience",
    "Cancer Research",
    "Drug Discovery",
    "Microbiology",
    "Virology",
    "Ecology",
    "Climate Science",
    "Quantum Computing",
  ]

  // Mock data for user contributions
  const userContributions = [
    {
      id: "contrib-1",
      title: "Genomic Data Analysis Pipeline",
      lab: "Genomic Data Analysis Lab",
      status: "published",
      date: "2 months ago",
      type: "code",
    },
    {
      id: "contrib-2",
      title: "Protein Structure Visualization Tool",
      lab: "Protein Folding Simulation",
      status: "under review",
      date: "3 weeks ago",
      type: "application",
    },
    {
      id: "contrib-3",
      title: "Neural Network Training Dataset",
      lab: "Neural Network Applications in Biology",
      status: "published",
      date: "1 month ago",
      type: "dataset",
    },
    {
      id: "contrib-4",
      title: "Comparative Analysis of Protein Folding Algorithms",
      lab: "Protein Folding Simulation",
      status: "draft",
      date: "2 days ago",
      type: "publication",
    },
  ]

  const toggleInterest = (interest: any) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i: any) => i !== interest))
    } else {
      setSelectedInterests([...selectedInterests, interest])
    }
  }

  const getContributionIcon = (type: string) => {
    switch (type) {
      case "code":
        return <FileText className="h-4 w-4" />
      case "application":
        return <Beaker className="h-4 w-4" />
      case "dataset":
        return <Database className="h-4 w-4" />
      case "publication":
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800">Published</Badge>
      case "under review":
        return <Badge className="bg-amber-100 text-amber-800">Under Review</Badge>
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Profile Settings</h1>
        </div>
        <Button onClick={onClose}>Save Changes</Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="interests">Research Interests</TabsTrigger>
          <TabsTrigger value="contributions">My Contributions</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="bank">Bank Account</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update your profile information visible to other users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="avatar">Profile Picture</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" className="w-fit">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload New Image
                    </Button>
                    <span className="text-xs text-muted-foreground">JPG, PNG or GIF. 1MB max.</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div className="flex flex-col space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                  <span className="text-xs text-muted-foreground">This will be displayed as @{username}</span>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Tell others about yourself and your research interests..."
                />
                <span className="text-xs text-muted-foreground">
                  Brief description for your profile. Maximum 300 characters.
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="interests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Research Interests</CardTitle>
              <CardDescription>
                Select scientific categories that interest you. These will help personalize your experience and connect
                you with relevant labs and researchers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label className="text-base">Selected Interests</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedInterests.length > 0 ? (
                    selectedInterests.map((interest, index) => (
                      <Badge key={index} variant="secondary" className="pl-2 pr-1 py-1">
                        {interest}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 hover:bg-transparent"
                          onClick={() => toggleInterest(interest)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No interests selected yet</span>
                  )}
                </div>
              </div>

              <Separator className="my-4" />

              <div>
                <Label className="text-base mb-2 block">Available Categories</Label>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {allScienceCategories
                      .filter((category) => !selectedInterests.includes(category))
                      .map((category, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="justify-start h-auto py-2"
                          onClick={() => toggleInterest(category)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          {category}
                        </Button>
                      ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="contributions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>My Contributions</CardTitle>
              <CardDescription>Manage your contributions to various labs and research projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userContributions.map((contribution) => (
                  <div key={contribution.id} className="flex items-start justify-between p-4 border rounded-md">
                    <div className="flex gap-3">
                      <div className="mt-0.5 p-2 bg-muted rounded-md">{getContributionIcon(contribution.type)}</div>
                      <div>
                        <h4 className="font-medium">{contribution.title}</h4>
                        <div className="text-sm text-muted-foreground">
                          {contribution.lab} • {contribution.date}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(contribution.status)}
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Create New Contribution
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="email-lab-updates" className="font-normal">
                        Lab updates and announcements
                      </Label>
                    </div>
                    <Switch id="email-lab-updates" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="email-contribution-updates" className="font-normal">
                        Contribution status updates
                      </Label>
                    </div>
                    <Switch id="email-contribution-updates" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="email-new-followers" className="font-normal">
                        New followers
                      </Label>
                    </div>
                    <Switch id="email-new-followers" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="email-newsletter" className="font-normal">
                        Weekly newsletter and digest
                      </Label>
                    </div>
                    <Switch id="email-newsletter" defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">In-App Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="app-comments" className="font-normal">
                        Comments on your contributions
                      </Label>
                    </div>
                    <Switch id="app-comments" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="app-mentions" className="font-normal">
                        Mentions and tags
                      </Label>
                    </div>
                    <Switch id="app-mentions" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="app-lab-activity" className="font-normal">
                        Lab activity updates
                      </Label>
                    </div>
                    <Switch id="app-lab-activity" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="app-funding" className="font-normal">
                        Funding opportunities
                      </Label>
                    </div>
                    <Switch id="app-funding" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="bank" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Bank Account for Payouts</CardTitle>
              <CardDescription>Connect your bank account to receive payouts from lab memberships, donations, and grants.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {(() => {
                const [isBankConnected, setIsBankConnected] = useState(false)
                const [accountInfo, setAccountInfo] = useState<any>(null)
                const [loading, setLoading] = useState(false)
                const [success, setSuccess] = useState(false)
                const [businessType, setBusinessType] = useState<'individual' | 'company'>('individual')
                // Check for Stripe return
                useState(() => {
                  if (typeof window !== 'undefined' && window.location.search.includes('stripe=success')) {
                    setSuccess(true)
                  }
                })
                const handleStripeConnect = async () => {
                  setLoading(true)
                  try {
                    const res = await fetch('/api/stripe/create-connect-link', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ businessType }),
                    })
                    const data = await res.json()
                    if (data.url) {
                      window.location.href = data.url
                    } else {
                      setLoading(false)
                      alert('Failed to get Stripe onboarding link.')
                    }
                  } catch (err) {
                    setLoading(false)
                    alert('Error connecting to Stripe.')
                  }
                }
                if (success) {
                  return <div className="text-green-600 font-semibold">Bank account connected successfully!</div>
                }
                return (
                  <div className="space-y-4">
                    <div className="flex gap-4 items-center">
                      <label className="font-medium">Account Type:</label>
                      <Button
                        variant={businessType === 'individual' ? 'default' : 'outline'}
                        onClick={() => setBusinessType('individual')}
                        className={businessType === 'individual' ? 'bg-accent text-primary-foreground' : ''}
                      >
                        Individual
                      </Button>
                      <Button
                        variant={businessType === 'company' ? 'default' : 'outline'}
                        onClick={() => setBusinessType('company')}
                        className={businessType === 'company' ? 'bg-accent text-primary-foreground' : ''}
                      >
                        Business
                      </Button>
                    </div>
                    {isBankConnected && accountInfo ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800">Connected</Badge>
                          <span className="text-sm text-muted-foreground">{accountInfo.bankName} ••••{accountInfo.last4}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Status: {accountInfo.status}</div>
                        <Button variant="outline" onClick={() => setIsBankConnected(false)}>Change Bank Account</Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">No bank account connected.</div>
                        <Button className="bg-accent text-primary-foreground hover:bg-accent/90" onClick={handleStripeConnect} disabled={loading}>
                          {loading ? 'Redirecting to Stripe...' : 'Connect Bank Account'}
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })()}
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">You must connect a bank account to receive payouts from HDX.</div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
