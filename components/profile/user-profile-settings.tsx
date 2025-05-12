"use client"

import { useState, useEffect } from "react"
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
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface UserProfileSettingsProps {
  onClose: () => void
}

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Payment Form Component
function PaymentForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/profile?payment=success`,
        },
      });

      if (submitError) {
        setError(submitError.message || 'An error occurred');
      } else {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Payment Method'}
      </button>
    </form>
  );
}

export function UserProfileSettings({ onClose }: UserProfileSettingsProps) {
  const { user } = useAuth()
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])

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

  const [fundingId, setFundingId] = useState<string | null>(null)
  const [bankInfo, setBankInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [businessType, setBusinessType] = useState<'individual' | 'company'>('individual')
  const [error, setError] = useState<string | null>(null)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [showRemovePaymentConfirm, setShowRemovePaymentConfirm] = useState(false)

  // Populate initial state from user when available
  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.name || "")
      setUsername(user.user_metadata?.username || "")
      setBio(user.user_metadata?.bio || "")
      setSelectedInterests(user.user_metadata?.interests || [])
    }
  }, [user])

  // Fetch profile on mount
  useEffect(() => {
    if (!user) return
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('funding_id')
        .eq('user_id', user.id)
        .single()
      if (error) return
      setFundingId(data?.funding_id || null)
    })()
  }, [user])

  // Fetch bank info if fundingId exists
  useEffect(() => {
    if (!fundingId) { setBankInfo(null); return }
    (async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/stripe/get-funding-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ funding_id: fundingId }),
        })
        const data = await res.json()
        if (data.error) setError(data.error)
        else setBankInfo(data)
      } catch (err: any) {
        setError('Failed to fetch bank info')
      } finally {
        setLoading(false)
      }
    })()
  }, [fundingId])

  // After onboarding, save funding_id
  useEffect(() => {
    if (!user) return
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const accountId = params.get('account')
    if (params.get('stripe') === 'success' && accountId) {
      (async () => {
        await fetch('/api/stripe/save-funding-id', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id,
          },
          body: JSON.stringify({ funding_id: accountId }),
        })
        setFundingId(accountId)
        setSuccess(true)
        // Remove query params from URL
        window.history.replaceState({}, document.title, window.location.pathname)
      })()
    }
  }, [user])

  // Add this effect to fetch payment info
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await fetch('/api/stripe/get-payment-info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id,
          },
        });
        const data = await res.json();
        if (!data.error) {
          setPaymentInfo(data);
        }
      } catch (err) {
        console.error('Failed to fetch payment info:', err);
      }
    })();
  }, [user]);

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

  const handleRemove = async () => {
    if (!user) return
    setLoading(true)
    await fetch('/api/stripe/remove-funding-id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id,
      },
    })
    setFundingId(null)
    setBankInfo(null)
    setLoading(false)
    setShowRemoveConfirm(false)
  }

  // Add this function to handle adding a payment method
  const handleAddPaymentMethod = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/stripe/setup-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
      });
      const data = await res.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setShowPaymentForm(true);
      }
    } catch (err) {
      console.error('Failed to setup payment method:', err);
    }
  };

  const handleRemovePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/stripe/remove-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setPaymentInfo(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
          <TabsTrigger value="bank">Bank Accounts</TabsTrigger>
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
                    <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg?height=80&width=80"} alt={user?.user_metadata?.name || user?.email || "User"} />
                    <AvatarFallback>{(user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0) || "U")}</AvatarFallback>
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
              <CardTitle>Bank Accounts</CardTitle>
              <CardDescription>Manage your payout and payment bank accounts for HDX.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Payout Bank Account (Stripe Connect) */}
                <div className="border rounded-lg p-6 flex flex-col items-center bg-secondary/30">
                  <h3 className="text-lg font-bold mb-2">PAYOUT BANK ACCOUNT</h3>
                  <p className="text-sm text-muted-foreground mb-4 text-center">
                    Required for receiving funding or grants on HDX.<br />Requires more info (KYC).
                  </p>
                  {/* Stripe Connect logic */}
                  {(() => {
                    if (loading) {
                      return <div className="text-accent font-semibold">Loading...</div>
                    }
                    if (error) {
                      return <div className="text-red-600 font-semibold">{error}</div>
                    }
                    if (bankInfo) {
                      return (
                        <div className="space-y-4 w-full">
                          <div className="flex flex-col items-center gap-2">
                            <Badge className="bg-green-100 text-green-800">Connected</Badge>
                            <span className="text-sm text-muted-foreground">
                              {bankInfo.bankName} ••••{bankInfo.last4}
                            </span>
                            <span className="text-xs text-muted-foreground">Status: {bankInfo.status}</span>
                          </div>
                          <div className="flex gap-2 w-full">
                            <Button variant="outline" className="flex-1" onClick={handleStripeConnect}>Change</Button>
                            <Button variant="destructive" className="flex-1" onClick={() => setShowRemoveConfirm(true)}>Remove</Button>
                          </div>
                        </div>
                      )
                    }
                    return (
                      <div className="space-y-4 w-full">
                        <div className="flex gap-4 items-center justify-center">
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
                        <Button className="bg-accent text-primary-foreground hover:bg-accent/90 w-full" onClick={handleStripeConnect} disabled={loading}>
                          {loading ? 'Redirecting to Stripe...' : 'Connect Payout Bank Account'}
                        </Button>
                        {success && <div className="text-green-600 font-semibold">Bank account connected successfully!</div>}
                      </div>
                    )
                  })()}
                </div>
                {/* Payment Bank Account (Stripe Customer) */}
                <div className="border rounded-lg p-6 flex flex-col items-center bg-secondary/30">
                  <h3 className="text-lg font-bold mb-2">PAYMENT BANK ACCOUNT</h3>
                  <p className="text-sm text-muted-foreground mb-4 text-center">
                    Required to donate to labs or subscribe to HDX membership tiers.<br />Brief KYC.
                  </p>
                  <div className="space-y-4 w-full">
                    {paymentInfo ? (
                      <div className="flex flex-col items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">Connected</Badge>
                        {paymentInfo.type === 'card' ? (
                          <span className="text-sm text-muted-foreground">
                            {paymentInfo.brand?.toUpperCase()} ••••{paymentInfo.last4}
                          </span>
                        ) : paymentInfo.type === 'us_bank_account' ? (
                          <span className="text-sm text-muted-foreground">
                            {paymentInfo.bank_name} ••••{paymentInfo.last4}
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground text-center">No payment method connected.</div>
                    )}
                    <div className="flex gap-2 w-full">
                      <Button variant="outline" className="flex-1" onClick={handleAddPaymentMethod}>
                        {paymentInfo ? 'Change/Add Payment Method' : 'Add Payment Method'}
                      </Button>
                      {paymentInfo && (
                        <Button variant="destructive" className="flex-1" onClick={() => setShowRemovePaymentConfirm(true)}>
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                  {showRemovePaymentConfirm && (
                    <Dialog open={showRemovePaymentConfirm} onOpenChange={setShowRemovePaymentConfirm}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Remove Payment Method</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to remove your payment method? This action cannot be undone and you will not be able to make payments until you add a new one.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowRemovePaymentConfirm(false)}>Cancel</Button>
                          <Button variant="destructive" onClick={async () => { await handleRemovePayment(); setShowRemovePaymentConfirm(false); }}>Remove Payment Method</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground text-center w-full">
                <span className="font-semibold">Payout Bank Account:</span> Required for receiving funds. <br />
                <span className="font-semibold">Payment Bank Account:</span> Required for making payments. <br />
                You can manage both here.
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add confirmation dialog */}
      <Dialog open={showRemoveConfirm} onOpenChange={setShowRemoveConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Bank Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove your payout bank account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemoveConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRemove}>Remove Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Stripe Elements Dialog */}
      <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>
              Add a credit card or bank account for making payments.
            </DialogDescription>
          </DialogHeader>
          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm onSuccess={() => {
                setShowPaymentForm(false);
                setClientSecret(null);
                // Refresh payment info
                window.location.reload();
              }} />
            </Elements>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
