"use client"

import { useState, useEffect, useRef } from "react"
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
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    bio: string;
    joinDate: string;
    interests: string[];
    stats: {
      contributions: number;
      labs: number;
      following: number;
    };
    research_interests?: string[];
  };
  onClose: () => void;
  defaultTab?: string;
}

// Stripe initialization with robust key check
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
if (!stripeKey) {
  console.error('Stripe publishable key is missing! Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your .env.local file.')
}
const stripePromise = stripeKey ? loadStripe(stripeKey) : null

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
      const { setupIntent, error: submitError } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/profile?payment=success`,
        },
        redirect: 'if_required',
      });

      if (submitError) {
        setError(submitError.message || 'An error occurred');
      } else if (setupIntent && setupIntent.status === 'succeeded') {
        // Call backend to finalize and set default payment method
        if (setupIntent.id) {
          await fetch('/api/stripe/finalize-setup-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ setupIntentId: setupIntent.id }),
          });
        }
        onSuccess();
      } else {
        onSuccess(); // fallback
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Only allow card payment element */}
      <PaymentElement options={{ paymentMethodOrder: ['card'] }} />
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

export function UserProfileSettings({ user, onClose, defaultTab = "profile" }: UserProfileSettingsProps) {
  const [username, setUsername] = useState(user.username)
  const [bio, setBio] = useState(user.bio)
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user.interests)
  const [tab, setTab] = useState(defaultTab)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarUrl, setAvatarUrl] = useState(user.avatar)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Add a list of all possible science categories (can be imported or hardcoded)
  const allScienceCategories = [
    "Neuroscience", "AI", "Biology", "Chemistry", "Physics", "Medicine", "Psychology", "Engineering", "Mathematics", "Environmental", "Astronomy", "Geology", "Brain Mapping", "Cognitive Science", "Quantum Mechanics", "Particle Physics", "Genomics", "Bioinformatics", "Ethics", "Computer Science", "Climate Science", "Data Analysis", "Molecular Biology", "Biochemistry", "Astrophysics", "Cosmology", "Clinical Research", "Biotechnology", "Medical Imaging", "Meteorology", "Machine Learning", "Optimization", "Data Processing", "Data Visualization", "Methodology", "Computing", "Evaluation", "Innovation", "Research Funding", "Governance", "Mitigation", "Diversity Studies", "Public Perception", "Citizen Science", "Bias Studies"
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
  // Separate loading state for payment method
  const [loadingPayment, setLoadingPayment] = useState(false)

  // Add state for research interests
  const [researchInterests, setResearchInterests] = useState<string[]>(user.research_interests || [])

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

  // Fetch research_interests from Supabase on mount
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('research_interests')
        .eq('user_id', user.id)
        .single();
      if (!error && data?.research_interests) {
        setResearchInterests(data.research_interests);
      }
    })();
  }, [user?.id]);

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
    if (!user) return;
    setLoadingPayment(true);
    setError(null);
    try {
      const response = await fetch('/api/stripe/remove-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
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
      setLoadingPayment(false);
    }
  };

  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user.id) return
    setUploading(true)
    // Check Supabase auth before upload
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData?.user) {
      setUploading(false)
      alert('You must be logged in to upload a profile image.')
      console.error('Supabase auth error or not logged in:', authError)
      return
    }
    // Always use the same file path so it replaces the old image
    const filePath = `${user.id}/profile-pic`
    let uploadResponse
    try {
      uploadResponse = await supabase.storage
        .from("user-profile-pics")
        .upload(filePath, file, { upsert: true })
    } catch (err) {
      setUploading(false)
      alert("Unexpected error during upload. Please try again.")
      console.error("Upload threw error:", err)
      return
    }
    const { data, error } = uploadResponse || {}
    if (error || !data) {
      setUploading(false)
      if (error && typeof error.message === 'string' && error.message.trim().startsWith('<')) {
        alert("Upload failed: received an HTML error page. Please check your login and bucket permissions.")
        console.error("Upload error (HTML):", error.message)
      } else {
        alert("Failed to upload image. " + (error?.message || "Unknown error."))
        console.error("Upload error:", error?.message || error, uploadResponse)
      }
      return
    }
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("user-profile-pics")
      .getPublicUrl(filePath)
    setAvatarUrl(
      typeof publicUrlData?.publicUrl === 'string' && publicUrlData.publicUrl
        ? publicUrlData.publicUrl
        : "/placeholder.svg?height=80&width=80"
    )
    setAvatarFile(file)
    setUploading(false)
  }

  // Save profile changes (bio and profilePic)
  const handleSave = async () => {
    setLoading(true)
    const updates: any = {
      bio,
      research_interests: researchInterests,
    }
    if (avatarUrl) updates.profilePic = avatarUrl
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", user.id)
    setLoading(false)
    if (error) {
      alert("Failed to update profile")
      console.error("Supabase update error:", error)
    } else {
      // Refetch research_interests after save
      const { data: profileData, error: fetchError } = await supabase
        .from("profiles")
        .select("research_interests")
        .eq("user_id", user.id)
        .single();
      if (!fetchError && profileData?.research_interests) {
        setResearchInterests(profileData.research_interests);
      }
      onClose()
    }
  }

  // Handler to add a new interest
  const handleAddInterest = (interest: string) => {
    if (!researchInterests.includes(interest)) {
      setResearchInterests([...researchInterests, interest])
    }
  }

  // Handler to remove an interest
  const handleRemoveInterest = (interest: string) => {
    setResearchInterests(researchInterests.filter(i => i !== interest))
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
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="contributions">My Contributions</TabsTrigger>
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
                    <AvatarImage src={avatarUrl || "/placeholder.svg?height=80&width=80"} alt={user?.username || "User"} />
                    <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-fit"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {uploading ? "Uploading..." : "Upload New Image"}
                    </Button>
                    <span className="text-xs text-muted-foreground">JPG, PNG or GIF. 1MB max.</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} disabled readOnly />
                <span className="text-xs text-muted-foreground">Your username is not editable.</span>
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

              <div className="flex flex-col space-y-2 mt-2">
                <label className="font-semibold">Research Interests</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {researchInterests.length === 0 && (
                    <span className="text-xs text-muted-foreground">No research interests selected.</span>
                  )}
                  {researchInterests.map((interest, idx) => (
                    <span key={idx} className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs font-medium">
                      {interest}
                      <button
                        type="button"
                        className="ml-1 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveInterest(interest)}
                        aria-label={`Remove ${interest}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading || uploading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
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
                    // If no payout account, show only connect UI (no error message)
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
                    {loadingPayment ? (
                      <div className="text-accent font-semibold">Loading...</div>
                    ) : paymentInfo && paymentInfo.type === 'card' ? (
                      <div className="flex flex-col items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">Connected</Badge>
                        <span className="text-sm text-muted-foreground">
                          {paymentInfo.brand?.toUpperCase()} ••••{paymentInfo.last4}
                        </span>
                      </div>
                    ) : null}
                    <div className="flex gap-2 w-full">
                      <Button variant="outline" className="flex-1" onClick={handleAddPaymentMethod} disabled={loadingPayment}>
                        {paymentInfo && paymentInfo.type === 'card' ? 'Change/Add Payment Method' : 'Add Payment Method'}
                      </Button>
                      {paymentInfo && (
                        <Button variant="destructive" className="flex-1" onClick={() => setShowRemovePaymentConfirm(true)} disabled={loadingPayment}>
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

      {/* Add confirmation dialog for payout bank account */}
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
            <Button variant="destructive" onClick={async () => { await handleRemove(); setShowRemoveConfirm(false); }}>Remove Account</Button>
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
          {clientSecret && stripePromise && (
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
