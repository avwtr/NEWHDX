"use client"

import type React from "react"
import { useState, useEffect } from "react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Maximize2, Minimize2, Edit2, Trash2, PowerOff, Power } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { CreateFundDialog } from "@/components/create-fund-dialog"
import { FundAllocationDialog } from "@/components/fund-allocation-dialog"
import { EditDonationDialog } from "@/components/edit-donation-dialog"
import { FundingActivityDialog } from "@/components/funding-activity-dialog"
import { EditMembershipDialog } from "@/components/edit-membership-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { EditFundDialog } from "@/components/edit-fund-dialog"
import { Dialog as OverlayDialog, DialogContent as OverlayDialogContent, DialogTitle as OverlayDialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { OneTimeDonation } from "@/components/one-time-donation"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface LabFundingTabProps {
  isAdmin: boolean
  isGuest: boolean
  expandedTab: string | null
  toggleExpand: (tabName: string) => void
  funds: any[]
  setFunds: React.Dispatch<React.SetStateAction<any[]>>
  membership: any
  oneTimeDonation: any
  isDonationsActive: boolean
  toggleDonations: () => void
  handleGuestAction: () => void
  handleManageMembership: () => void
  labId: string
  labsMembershipOption: boolean
  refetchMembership: () => Promise<void>
  refetchOneTimeDonation: () => Promise<void>
  lab: any
  refetchLab?: () => Promise<void>
}

export function LabFundingTab({
  isAdmin,
  isGuest,
  expandedTab,
  toggleExpand,
  funds,
  setFunds,
  membership,
  oneTimeDonation,
  isDonationsActive,
  toggleDonations,
  handleGuestAction,
  handleManageMembership,
  labId,
  labsMembershipOption,
  refetchMembership,
  refetchOneTimeDonation,
  lab,
  refetchLab,
}: LabFundingTabProps) {
  console.log("LabFundingTab props:", {
    membership,
    labsMembershipOption,
    isMembershipSetUp: !!membership,
    isMembershipActive: !!membership && labsMembershipOption
  })
  const [showDonationDialog, setShowDonationDialog] = useState(false)
  const [showMembershipDialog, setShowMembershipDialog] = useState(false)
  const [donationName, setDonationName] = useState("")
  const [donationDescription, setDonationDescription] = useState("")
  const [donationActive, setDonationActive] = useState(true)
  const [donationAmounts, setDonationAmounts] = useState<string[]>(["10", "25", "50", "100", "250", "500"])
  const [donationAmountInput, setDonationAmountInput] = useState("")
  const { user } = useAuth()
  const [showEditDonationDialog, setShowEditDonationDialog] = useState(false)
  const [editDonationName, setEditDonationName] = useState("")
  const [editDonationDescription, setEditDonationDescription] = useState("")
  const [editDonationActive, setEditDonationActive] = useState(isDonationsActive)
  const [editDonationAmounts, setEditDonationAmounts] = useState<number[]>([])
  const [editDonationAmountInput, setEditDonationAmountInput] = useState("")
  const [showEditMembershipDialog, setShowEditMembershipDialog] = useState(false)
  const [showSetupMembershipDialog, setShowSetupMembershipDialog] = useState(false)
  const [editMembershipName, setEditMembershipName] = useState("")
  const [editMembershipDescription, setEditMembershipDescription] = useState("")
  const [editMembershipActive, setEditMembershipActive] = useState(!!membership && labsMembershipOption)
  const [editMembershipAmount, setEditMembershipAmount] = useState("")
  const [editFundDialogOpen, setEditFundDialogOpen] = useState(false)
  const [currentEditFund, setCurrentEditFund] = useState<any>(null)
  const [showFundingActivity, setShowFundingActivity] = useState(false)
  const [showCreateFundDialog, setShowCreateFundDialog] = useState(false)
  const [adminFundingId, setAdminFundingId] = useState<string | null>(null)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [adminBankInfo, setAdminBankInfo] = useState<any>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showPokeDialog, setShowPokeDialog] = useState(false)
  const [pokeAnon, setPokeAnon] = useState(false)
  const [pokeLoading, setPokeLoading] = useState(false)
  const [pokeFeed, setPokeFeed] = useState<any[]>([])
  const [usernameMap, setUsernameMap] = useState<Record<string, string>>({})
  const [editMembershipLoading, setEditMembershipLoading] = useState(false)
  const [editDonationLoading, setEditDonationLoading] = useState(false)
  const [donorCount, setDonorCount] = useState<number | null>(null)
  const [avgDonation, setAvgDonation] = useState<number | null>(null)
  const [donorStatsLoading, setDonorStatsLoading] = useState(true)
  const [subscriberCount, setSubscriberCount] = useState(0)
  const [userSubscription, setUserSubscription] = useState<any>(null)
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false)
  const [membershipPaymentMethod, setMembershipPaymentMethod] = useState<any>(null)
  const [loadingMembershipPM, setLoadingMembershipPM] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [pendingDeleteFundId, setPendingDeleteFundId] = useState<string | null>(null)
  const [selectedMembershipFund, setSelectedMembershipFund] = useState(funds[0]?.id || "")
  const [subscribing, setSubscribing] = useState(false)
  const [subscribeSuccess, setSubscribeSuccess] = useState(false)
  const [subscribeError, setSubscribeError] = useState("")

  // Helper to determine if membership is set up and active
  const isMembershipSetUp = !!membership
  const isMembershipActive = !!membership && labsMembershipOption
  const isDonationSetUp = !!oneTimeDonation
  const isDonationActive = isDonationsActive

  // Add funding_setup and funding_id from lab prop
  const fundingSetup = lab?.funding_setup
  const labFundingId = lab?.funding_id

  // Calculate fee and net for membership
  const membershipAmount = Number(membership?.monthly_amount || 0)
  const membershipFee = +(membershipAmount * 0.025).toFixed(2)
  const membershipNet = +(membershipAmount - membershipFee).toFixed(2)

  // Centralized fetch and refetch logic for funding goals
  const refetchFunds = async () => {
    if (!labId) return;
    try {
      const { data: allFunds, error } = await supabase
        .from("funding_goals")
        .select("*")
        .eq("lab_id", labId)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching funds:", error);
        setFunds([]);
        return;
      }

      // Always put General Fund first if present
      const generalFund = allFunds?.find(f => f.goalName === "GENERAL FUND");
      const sortedFunds = [
        ...(generalFund ? [generalFund] : []),
        ...(allFunds ? allFunds.filter(f => f.goalName !== "GENERAL FUND") : [])
      ];

      // Map the funds once during the fetch
      const mappedFunds = sortedFunds.map(fund => ({
        ...fund,
        currentAmount: fund.amount_contributed ?? 0,
        goalAmount: fund.goal_amount ?? 0,
        percentFunded: fund.goal_amount ? Math.round((fund.amount_contributed ?? 0) / fund.goal_amount * 100) : 0,
        daysRemaining: fund.deadline ? Math.max(0, Math.ceil((new Date(fund.deadline).getTime() - Date.now()) / (1000*60*60*24))) : undefined,
      }));

      setFunds(mappedFunds);
    } catch (err) {
      console.error("Error in refetchFunds:", err);
      setFunds([]);
    }
  };

  useEffect(() => {
    refetchFunds();
  }, [labId]);

  // Handler to refetch funds after creation
  const handleFundCreated = async (logActivity = false) => {
    // Refetch funds
    await refetchFunds()
    // Only log activity if requested (i.e. for actual fund creation/update)
    if (logActivity) {
      await supabase.from("activity").insert({
        activity_id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
        created_at: new Date().toISOString(),
        activity_name: "Funding Goal Created or Updated",
        activity_type: "funding_goal",
        performed_by: user?.id,
        lab_from: labId
      })
    }
  }

  // Handler to save donation setup
  const handleSaveDonation = async (data: any) => {
    try {
      const { error } = await supabase
        .from("donation_funding")
        .insert({
          donation_setup_name: data.name,
          donation_description: data.description,
          suggested_amounts: data.amounts,
          labId: labId,
          created_by: user?.id || null,
        });
      if (error) throw error;
      // Log activity for donation setup
      await handleFundCreated(true)
      toast({ title: "Success", description: "Donation setup has been saved." });
      setShowDonationDialog(false);
      await refetchOneTimeDonation();
    } catch (err) {
      let message = "Failed to save donation setup";
      if (err instanceof Error) message = err.message;
      toast({ title: "Error", description: message });
    }
  };

  // Handler to save membership setup
  const handleSaveMembership = async (data: any) => {
    try {
      const { error } = await supabase
        .from("recurring_funding")
        .insert({
          name: data.name,
          description: data.description,
          monthly_amount: data.amount,
          labId: labId,
          created_by: user?.id || null,
        });
      if (error) throw error;
      // Log activity for membership setup
      await handleFundCreated(true)
      toast({ title: "Success", description: "Membership setup has been saved." });
      setShowSetupMembershipDialog(false);
      await refetchMembership();
    } catch (err) {
      let message = "Failed to save membership setup";
      if (err instanceof Error) message = err.message;
      toast({ title: "Error", description: message });
    }
  };

  // Handler to edit donation
  const handleEditDonation = async (data: any) => {
    try {
      const { error } = await supabase
        .from("donation_funding")
        .update({
          donation_setup_name: data.name,
          donation_description: data.description,
          suggested_amounts: data.amounts,
        })
        .eq("id", oneTimeDonation.id);
      if (error) throw error;
      toast({ title: "Success", description: "Donation settings have been updated." });
      setShowEditDonationDialog(false);
      await refetchOneTimeDonation();
    } catch (err) {
      let message = "Failed to update donation settings";
      if (err instanceof Error) message = err.message;
      toast({ title: "Error", description: message });
    }
  }

  // Handler to edit membership
  const handleEditMembership = async (data: any) => {
    try {
      const { error } = await supabase
        .from("recurring_funding")
        .update({
          name: data.name,
          description: data.description,
          monthly_amount: data.amount,
        })
        .eq("id", membership.id);
      if (error) throw error;
      toast({ title: "Success", description: "Membership settings have been updated." });
      setShowEditMembershipDialog(false);
      await refetchMembership();
    } catch (err) {
      let message = "Failed to update membership settings";
      if (err instanceof Error) message = err.message;
      toast({ title: "Error", description: message });
    }
  }

  // Fetch admin's payout account (funding_id) from their profile
  useEffect(() => {
    if (!isAdmin || !user) return
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('funding_id')
        .eq('user_id', user.id)
        .single()
      if (!error) setAdminFundingId(data?.funding_id || null)
    })()
  }, [isAdmin, user])

  // Fetch bank info for adminFundingId
  useEffect(() => {
    if (!adminFundingId) { setAdminBankInfo(null); return }
    (async () => {
      try {
        const res = await fetch('/api/stripe/get-funding-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ funding_id: adminFundingId }),
        })
        const data = await res.json()
        setAdminBankInfo(data)
      } catch (err) {
        setAdminBankInfo(null)
      }
    })()
  }, [adminFundingId, showConnectModal])

  // Handler to open edit dialog and fetch latest fund data
  const handleEditFund = async (fund: any) => {
    // Fetch latest data for this fund
    const { data, error } = await supabase
      .from("funding_goals")
      .select("*")
      .eq("id", fund.id)
      .single()
    if (!error && data) {
      setCurrentEditFund({
        id: data.id,
        name: data.goalName,
        description: data.goal_description,
        currentAmount: data.amount_contributed ?? 0,
        goalAmount: data.goal_amount ?? 0,
        percentFunded: data.goal_amount ? Math.round((data.amount_contributed ?? 0) / data.goal_amount * 100) : 0,
        daysRemaining: data.deadline ? Math.max(0, Math.ceil((new Date(data.deadline).getTime() - Date.now()) / (1000*60*60*24))) : undefined,
        endDate: data.deadline ? new Date(data.deadline) : undefined,
      })
      setEditFundDialogOpen(true)
    }
  }

  // Handler to save edits to a fund
  const handleSaveFund = async (updatedFund: any) => {
    // Update backend
    await supabase.from("funding_goals").update({
      goalName: updatedFund.name,
      goal_description: updatedFund.description,
      amount_contributed: updatedFund.currentAmount,
      goal_amount: updatedFund.goalAmount,
      deadline: updatedFund.endDate ? updatedFund.endDate.toISOString() : null,
    }).eq("id", updatedFund.id)
    setEditFundDialogOpen(false)
    setCurrentEditFund(null)
    // Refetch funds
    await handleFundCreated(true)
  }

  // Fetch poke feed for this lab
  useEffect(() => {
    let isMounted = true;
    async function fetchPokes() {
      const { data, error } = await supabase
        .from('labFundingPokes')
        .select('*')
        .eq('labId', labId)
        .order('created_at', { ascending: false });
      if (!error && isMounted) setPokeFeed(data || []);
    }
    fetchPokes();
    // Optionally: subscribe to changes for real-time updates
    const channel = supabase
      .channel('labFundingPokes-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'labFundingPokes', filter: `labId=eq.${labId}` }, fetchPokes)
      .subscribe();
    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [labId]);

  // Fetch usernames for all unique pokedBy in the feed
  useEffect(() => {
    async function fetchUsernames() {
      const ids = Array.from(new Set(pokeFeed.filter(p => p.pokedBy && !p.anon).map(p => p.pokedBy)));
      if (ids.length === 0) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, username')
        .in('user_id', ids);
      if (!error && data) {
        const map: Record<string, string> = {};
        data.forEach((row: any) => { map[row.user_id] = row.username; });
        setUsernameMap(map);
      }
    }
    fetchUsernames();
  }, [pokeFeed]);

  // Handle poke submit
  async function handlePoke() {
    if (!user && !pokeAnon) return;
    setPokeLoading(true);
    const tempId = Math.random().toString(36).substring(2, 15);
    const newPoke = {
      id: tempId,
      labId,
      pokedBy: pokeAnon ? null : user?.id,
      anon: pokeAnon,
      created_at: new Date().toISOString()
    };
    // Optimistic update
    setPokeFeed([newPoke, ...pokeFeed]);
    
    try {
      // Insert poke into labFundingPokes table
      const { error: pokeError } = await supabase.from('labFundingPokes').insert({
        labId,
        pokedBy: pokeAnon ? null : user?.id,
        anon: pokeAnon
      });
      if (pokeError) throw pokeError;

      // Log activity for the poke
      const activityData = {
        activity_id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
        created_at: new Date().toISOString(),
        activity_name: `Lab Poked: ${pokeAnon ? 'Anonymous' : 'User'} suggested setting up funding`,
        activity_type: "lab_poked",
        performed_by: pokeAnon ? null : user?.id,
        lab_from: labId
      };
      
      const { error: activityError } = await supabase.from("activity").insert(activityData);
      if (activityError) {
        console.error("Failed to log poke activity:", activityError);
      }
    } catch (err) {
      console.error("Error in handlePoke:", err);
      // Revert optimistic update on error
      setPokeFeed(pokeFeed.filter(p => p.id !== tempId));
      toast({
        title: "Error",
        description: "Failed to send poke. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPokeLoading(false);
      setShowPokeDialog(false);
    }
  }

  const fetchDonorAndSubscriberStats = async () => {
    setDonorStatsLoading(true);
    if (!labId) return;
    // Fetch donors
    const { data: donorsRaw } = await supabase
      .from("labDonors")
      .select("userId, donationAmount")
      .eq("labId", labId);
    const donors = donorsRaw || [];
    // Unique donors
    const uniqueDonors = new Set(donors.map(d => d.userId));
    setDonorCount(uniqueDonors.size);
    // Average donation (all donations)
    const totalDonated = donors.reduce((sum, d) => sum + (d.donationAmount || 0), 0);
    setAvgDonation(donors.length > 0 ? Number((totalDonated / donors.length).toFixed(2)) : 0);
    // Fetch subscribers
    const { data: subsRaw } = await supabase
      .from("labSubscribers")
      .select("userId")
      .eq("labId", labId);
    const subs = subsRaw || [];
    const uniqueSubs = new Set(subs.map(s => s.userId));
    setSubscriberCount(uniqueSubs.size);
    setDonorStatsLoading(false);
  };

  useEffect(() => {
    fetchDonorAndSubscriberStats();
  }, [labId]);

  // Handle donation success
  const handleDonationSuccess = async () => {
    try {
      // Refetch donor stats
      await fetchDonorAndSubscriberStats()
      // Show success message
      toast({
        title: "Donation Successful",
        description: "Thank you for your support!",
      })
    } catch (error) {
      console.error('Error handling donation success:', error)
      toast({
        title: "Error",
        description: "There was an error processing your donation. Please try again.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    async function fetchUserSubscription() {
      if (!user?.id || !labId) {
        setUserSubscription(null);
        return;
      }
      const { data, error } = await supabase
        .from('labSubscribers')
        .select('*')
        .eq('userId', user.id)
        .eq('labId', labId)
        .single();
      if (!error && data) setUserSubscription(data);
      else setUserSubscription(null);
    }
    fetchUserSubscription();
  }, [user?.id, labId]);

  // Fetch payment method when subscribe dialog opens
  useEffect(() => {
    if (showSubscribeDialog && user?.id) {
      setLoadingMembershipPM(true);
      fetch("/api/stripe/get-payment-info", {
        method: "POST",
        headers: { "x-user-id": user.id },
      })
        .then(res => res.json())
        .then(data => {
          setMembershipPaymentMethod(data.error ? null : data);
        })
        .finally(() => setLoadingMembershipPM(false));
    } else if (!showSubscribeDialog) {
      setMembershipPaymentMethod(null);
    }
  }, [showSubscribeDialog, user?.id]);

  // Handle subscribe
  async function handleSubscribe() {
    if (!user || !selectedMembershipFund) return;
    setSubscribing(true);
    setSubscribeError("");
    try {
      const res = await fetch("/api/stripe/create-membership-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          labId,
          goalId: selectedMembershipFund,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Log activity for successful subscription
        const selectedFund = funds.find(f => f.id === selectedMembershipFund);
        const activityData = {
          activity_id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
          created_at: new Date().toISOString(),
          activity_name: `Lab Membership: Subscribed $${membershipAmount.toFixed(2)}/mo to ${selectedFund?.goalName || 'Lab Membership'}`,
          activity_type: "lab_subscribed",
          performed_by: user.id,
          lab_from: labId
        };
        
        const { error: activityError } = await supabase.from("activity").insert(activityData);
        if (activityError) {
          console.error("Failed to log subscription activity:", activityError);
        }

        setSubscribeSuccess(true);
        setTimeout(() => {
          setShowSubscribeDialog(false);
          setSubscribeSuccess(false);
          refetchMembership();
        }, 2000);
      } else {
        setSubscribeError(data.error || "Subscription failed. Please try again.");
      }
    } catch (err) {
      setSubscribeError("An unexpected error occurred. Please try again.");
    } finally {
      setSubscribing(false);
    }
  }

  // Handler to cancel membership subscription
  async function handleCancelSubscription() {
    if (!userSubscription) return;
    setCancelling(true);
    setSubscribeError("");
    try {
      const res = await fetch("/api/stripe/cancel-membership-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: userSubscription.stripe_id }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCancelDialog(false);
        setUserSubscription(null);
        toast({ title: "Subscription Cancelled", description: "Your membership has been cancelled." });
        refetchMembership();
      } else {
        setSubscribeError(data.error || "Cancellation failed. Please try again.");
      }
    } catch (err) {
      setSubscribeError("An unexpected error occurred. Please try again.");
    } finally {
      setCancelling(false);
    }
  }

  // Handler to delete a funding goal
  const handleDeleteFund = async (goalId: string) => {
    try {
      const res = await fetch('/api/funding-goals/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Funding Goal Deleted", description: "The funding goal was deleted successfully." });
        await refetchFunds();
      } else {
        toast({ title: "Error", description: data.error || "Failed to delete funding goal." });
      }
    } catch (err) {
      toast({ title: "Error", description: "An unexpected error occurred." });
    }
  };

  // Handler to toggle membership active/inactive
  const handleToggleMembershipActive = async () => {
    if (!labId) return;
    try {
      const { error } = await supabase
        .from('labs')
        .update({ membership_option: !labsMembershipOption })
        .eq('labId', labId);
      if (error) {
        toast({ title: 'Error', description: 'Failed to update membership status.' });
        return;
      }
      toast({ title: labsMembershipOption ? 'Membership Deactivated' : 'Membership Activated' });
      await refetchMembership();
    } catch (err) {
      toast({ title: 'Error', description: 'An unexpected error occurred.' });
    }
  };

  // Handler to toggle one-time donation active/inactive
  const handleToggleDonationActive = async () => {
    if (!labId) return;
    try {
      const { error } = await supabase
        .from('labs')
        .update({ one_time_donation_option: !isDonationsActive })
        .eq('labId', labId);
      if (error) {
        toast({ title: 'Error', description: 'Failed to update donation status.' });
        return;
      }
      toast({ title: isDonationsActive ? 'Donations Deactivated' : 'Donations Activated' });
      await refetchOneTimeDonation();
    } catch (err) {
      toast({ title: 'Error', description: 'An unexpected error occurred.' });
    }
  };

  // Only show setup UI if fundingSetup is false
  if (!fundingSetup) {
    if (isAdmin) {
      // Admins see setup card and poke feed
      return (
        <div className="space-y-6">
          {/* Admin Setup Card */}
          <Card className="max-w-2xl mx-auto shadow-lg border-accent/40">
            <CardHeader className="bg-accent/10 rounded-t-lg p-6 flex flex-col items-center">
              <CardTitle className="text-2xl font-bold text-accent mb-2 text-center">Set Up Lab Funding</CardTitle>
              <CardDescription className="text-center text-base mb-4 max-w-xl">
                To receive funding, donations, or memberships for this lab, you must connect a payout bank account.<br />
                This is done via Stripe Connect. You can use your existing payout account from your profile.
              </CardDescription>
              {!adminFundingId ? (
                <>
                  <div className="text-red-500 font-semibold mb-2">You must first connect a payout bank account in your <a href="/profile" className="underline text-accent">profile settings</a>.</div>
                  <Button className="bg-accent text-primary-foreground px-8 py-3 text-lg font-semibold rounded shadow hover:bg-accent/90 mt-2" asChild>
                    <a href="/profile">Go to Profile Settings</a>
                  </Button>
                </>
              ) : (
                <>
                  <div className="text-green-500 font-semibold mb-2">Payout account found. You can use this to receive lab funding.</div>
                  <Button
                    className="bg-accent text-primary-foreground px-8 py-3 text-lg font-semibold rounded shadow hover:bg-accent/90 mt-2"
                    onClick={() => setShowConnectModal(true)}
                  >
                    Connect Payout Account to Lab
                  </Button>
                  <Dialog open={showConnectModal} onOpenChange={setShowConnectModal}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Payout Account for Lab</DialogTitle>
                        <DialogDescription>
                          This payout account will be used to receive all funding for this lab. You can change or remove it in your profile settings.
                        </DialogDescription>
                      </DialogHeader>
                      {adminBankInfo ? (
                        <div className="space-y-2 mb-4">
                          <div className="flex flex-col items-center gap-2">
                            <span className="font-semibold">{adminBankInfo.bankName}</span>
                            <span className="text-sm text-muted-foreground">••••{adminBankInfo.last4}</span>
                            <span className="text-xs text-muted-foreground">Status: {adminBankInfo.status}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground mb-4">Loading account info...</div>
                      )}
                      <div className="flex gap-2 w-full mb-4">
                        <Button variant="outline" className="flex-1" asChild>
                          <a href="/profile">Change</a>
                        </Button>
                        <Button variant="destructive" className="flex-1" asChild>
                          <a href="/profile">Remove</a>
                        </Button>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConnectModal(false)} disabled={isConnecting}>Cancel</Button>
                        <Button
                          className="bg-accent text-primary-foreground"
                          onClick={async () => {
                            setIsConnecting(true)
                            try {
                              const { error } = await supabase
                                .from('labs')
                                .update({ funding_setup: true, funding_id: adminFundingId })
                                .eq('labId', labId)
                              if (error) throw error
                              toast({ title: "Lab Funding Setup Complete", description: "You can now receive funding for this lab!" })
                              setShowConnectModal(false)
                              if (typeof refetchLab === 'function') {
                                await refetchLab();
                              }
                            } catch (err) {
                              let message = "Failed to set up lab funding"
                              if (err instanceof Error) message = err.message
                              toast({ title: "Error", description: message })
                            } finally {
                              setIsConnecting(false)
                            }
                          }}
                          disabled={isConnecting}
                        >
                          {isConnecting ? 'Connecting...' : 'Confirm'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              {/* Example Funding Goals */}
              <div>
                <div className="font-semibold mb-2 text-accent">Example Funding Goals</div>
                <div className="space-y-4">
                  <div className="border border-secondary rounded-lg p-4 bg-accent/5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">GENERAL FUND</span>
                      <Badge className="bg-accent text-primary-foreground">GENERAL</Badge>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-accent" style={{ width: '0%' }} />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>$0 raised</span>
                      <span>No deadline</span>
                    </div>
                  </div>
                  <div className="border border-secondary rounded-lg p-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">NEW EQUIPMENT FUND</span>
                      <Badge className="bg-accent/60 text-primary-foreground">0% FUNDED</Badge>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-accent/60" style={{ width: '0%' }} />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>$0 raised</span>
                      <span>Goal: $5,000</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">30 days remaining</div>
                  </div>
                </div>
              </div>
              {/* Example Funding Activity & Metrics */}
              <div>
                <div className="font-semibold mb-2 text-accent">Example Funding Activity</div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm bg-secondary/50 rounded px-3 py-2">
                    <Avatar className="h-7 w-7"><AvatarFallback>AW</AvatarFallback></Avatar>
                    <span className="font-medium">Alex Wong</span>
                    <span className="text-muted-foreground">donated $50 to GENERAL FUND</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm bg-secondary/50 rounded px-3 py-2">
                    <Avatar className="h-7 w-7"><AvatarFallback>MR</AvatarFallback></Avatar>
                    <span className="font-medium">Maria Rodriguez</span>
                    <span className="text-muted-foreground">subscribed $25/mo to NEW EQUIPMENT FUND</span>
                  </div>
                </div>
                <div className="font-semibold mb-2 text-accent">Example Metrics</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-secondary/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground">Total Raised</div>
                    <div className="text-lg font-bold text-accent">$0</div>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground">Active Donors</div>
                    <div className="text-lg font-bold text-accent">0</div>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground">Active Members</div>
                    <div className="text-lg font-bold text-accent">0</div>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground">Funding Goals</div>
                    <div className="text-lg font-bold text-accent">2</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Poke Feed for Admins */}
          <Card className="max-w-2xl mx-auto shadow-lg border-accent/40">
            <CardHeader className="bg-accent/10 rounded-t-lg p-6 flex flex-col items-center">
              <CardTitle className="text-2xl font-bold text-accent mb-2 text-center">Lab Funding Not Set Up</CardTitle>
              <CardDescription className="text-center text-base mb-4 max-w-xl">
                Others can poke this lab to suggest setting up funding.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="font-semibold mb-2 text-accent">Recent Pokes</div>
                <div className="space-y-2">
                  {pokeFeed.length === 0 && <div className="text-muted-foreground text-sm">No pokes yet. Be the first!</div>}
                  {pokeFeed.map((poke) => {
                    let displayName = 'Unknown';
                    if (poke.anon) displayName = 'Anonymous';
                    else if (poke.pokedBy && usernameMap[poke.pokedBy]) displayName = usernameMap[poke.pokedBy];
                    return (
                      <div key={poke.id} className="flex items-center gap-2 text-sm bg-secondary/50 rounded px-3 py-2">
                        <Avatar className="h-7 w-7"><AvatarFallback>{displayName.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                        <span className="font-medium">{displayName}</span>
                        <span className="text-muted-foreground">poked this lab</span>
                        <span className="ml-auto text-xs text-muted-foreground">{new Date(poke.created_at).toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    } else {
      // Non-admins see only the poke card
      return (
        <div className="space-y-6">
          {/* Poke Card - Only for non-admins */}
          <Card className="max-w-2xl mx-auto shadow-lg border-accent/40">
            <CardHeader className="bg-accent/10 rounded-t-lg p-6 flex flex-col items-center">
              <CardTitle className="text-2xl font-bold text-accent mb-2 text-center">Lab Funding Not Set Up</CardTitle>
              <CardDescription className="text-center text-base mb-4 max-w-xl">
                Poke this lab to suggest they setup funding so you can donate!
              </CardDescription>
              <Button 
                className="bg-accent text-primary-foreground px-8 py-3 text-lg font-semibold rounded shadow hover:bg-accent/90 mt-2" 
                onClick={() => setShowPokeDialog(true)}
                disabled={!user}
                title={!user ? "You must be logged in to poke this lab" : "Poke this lab"}
              >
                {!user ? "LOGIN TO POKE" : "Poke Lab"}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="font-semibold mb-2 text-accent">Recent Pokes</div>
                <div className="space-y-2">
                  {pokeFeed.length === 0 && <div className="text-muted-foreground text-sm">No pokes yet. Be the first!</div>}
                  {pokeFeed.map((poke) => {
                    let displayName = 'Unknown';
                    if (poke.anon) displayName = 'Anonymous';
                    else if (poke.pokedBy && usernameMap[poke.pokedBy]) displayName = usernameMap[poke.pokedBy];
                    return (
                      <div key={poke.id} className="flex items-center gap-2 text-sm bg-secondary/50 rounded px-3 py-2">
                        <Avatar className="h-7 w-7"><AvatarFallback>{displayName.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                        <span className="font-medium">{displayName}</span>
                        <span className="text-muted-foreground">poked this lab</span>
                        <span className="ml-auto text-xs text-muted-foreground">{new Date(poke.created_at).toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <Dialog open={showPokeDialog} onOpenChange={setShowPokeDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Poke this lab to set up funding?</DialogTitle>
                    <DialogDescription>
                      You can poke as yourself or anonymously. Your username will be shown unless you choose anonymous.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col gap-4 mt-4">
                    <Label className="flex items-center gap-2">
                      <Switch checked={pokeAnon} onCheckedChange={setPokeAnon} />
                      Poke anonymously
                    </Label>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowPokeDialog(false)}>Cancel</Button>
                    <Button className="bg-accent text-primary-foreground" onClick={handlePoke} disabled={pokeLoading}>
                      {pokeLoading ? 'Poking...' : 'Poke'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // --- POST-SETUP: SHOW FULL FUNDING UI ---
  // Only show admin controls if fundingSetup is true
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="text-5xl font-bold text-accent">$</div>
        {isAdmin && (
          <div className="flex flex-col items-end gap-1 ml-auto">
            <Button
              className="bg-accent text-primary-foreground hover:bg-accent/90 font-semibold px-4 py-2 rounded"
              onClick={() => setShowCreateFundDialog(true)}
            >
              CREATE FUNDING GOAL +
            </Button>
            <button
              className="text-xs text-accent underline hover:text-accent/80 mt-1"
              onClick={() => setShowFundingActivity(true)}
              style={{ alignSelf: 'flex-end' }}
            >
              VIEW FUNDING ACTIVITY
            </button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Membership Tile */}
          <Card className={`border-accent ${isMembershipSetUp && !isMembershipActive ? "opacity-60" : ""}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{membership?.name || "LAB MEMBERSHIP"}</CardTitle>
                  <CardDescription>{membership?.description || "No description yet."}</CardDescription>
                </div>
                {isAdmin && isMembershipSetUp && (
                  <Button
                    variant="outline"
                    size="sm"
                    className={(isMembershipActive ? "text-red-500 border-red-500" : "text-green-500 border-green-500") + " px-2 py-1 text-xs h-7 min-w-[90px]"}
                    onClick={handleToggleMembershipActive}
                  >
                    {isMembershipActive ? (
                      <>
                        <PowerOff className="h-4 w-4 mr-1" />
                        DEACTIVATE
                      </>
                    ) : (
                      <>
                        <Power className="h-4 w-4 mr-1" />
                        ACTIVATE
                      </>
                    )}
                  </Button>
                )}
              </div>
              {!isMembershipActive && isAdmin && isMembershipSetUp && (
                <div className="mt-2 text-sm text-amber-500 font-medium">MEMBERSHIPS CURRENTLY DISABLED</div>
              )}
            </CardHeader>
            <CardContent>
              {isMembershipSetUp && (
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <div className="bg-secondary/50 rounded px-2 py-1">
                    <span className="font-semibold text-accent">${membership.monthly_amount || 0}</span> / month
                  </div>
                  <div className="bg-secondary/50 rounded px-2 py-1">
                    Subscribers: <span className="font-semibold text-accent">{subscriberCount}</span>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {isAdmin ? (
                isMembershipSetUp ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-accent text-accent hover:bg-secondary"
                    onClick={async () => {
                      setEditMembershipLoading(true);
                      const { data, error } = await supabase
                        .from("recurring_funding")
                        .select("*")
                        .eq("id", membership.id)
                        .single();
                      if (!error && data) {
                        setEditMembershipName(data.name || "LAB MEMBERSHIP");
                        setEditMembershipDescription(data.description || "");
                        setEditMembershipAmount(data.monthly_amount?.toString() || "");
                      }
                      setEditMembershipLoading(false);
                      setShowEditMembershipDialog(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    EDIT
                  </Button>
                ) : (
                  <Button 
                    className="w-full bg-accent text-primary-foreground hover:bg-accent/90" 
                    onClick={() => setShowSetupMembershipDialog(true)}
                  >
                    SET UP
                  </Button>
                )
              ) : isGuest ? (
                <Button 
                  className="w-full bg-accent text-primary-foreground hover:bg-accent/90" 
                  onClick={handleGuestAction} 
                  disabled={!isMembershipActive || !user}
                  title={!user ? "You must be logged in to subscribe" : ""}
                >
                  {isMembershipActive ? (!user ? "LOGIN TO SUBSCRIBE" : "SUBSCRIBE") : "SET UP"}
                </Button>
              ) : (!userSubscription && isMembershipActive && user) ? (
                <>
                  <Button className="w-full bg-accent text-primary-foreground hover:bg-accent/90" onClick={() => setShowSubscribeDialog(true)}>
                    SUBSCRIBE
                  </Button>
                  <Dialog open={showSubscribeDialog} onOpenChange={setShowSubscribeDialog}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Subscribe to Lab Membership</DialogTitle>
                        <DialogDescription>
                          Support this lab with a recurring monthly membership. Select a fund/goal for your membership to support.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Select Fund/Goal</Label>
                          <RadioGroup value={selectedMembershipFund} onValueChange={setSelectedMembershipFund} className="max-h-[40vh] overflow-y-auto pr-2">
                            {funds.map((fund) => (
                              <div key={fund.id} className="flex items-start space-x-2 p-2 rounded-md hover:bg-secondary/50 mb-2">
                                <RadioGroupItem value={fund.id} id={`membership-fund-${fund.id}`} className="mt-1" />
                                <div className="grid gap-1.5 leading-none">
                                  <Label htmlFor={`membership-fund-${fund.id}`} className="font-medium">
                                    {fund.goalName || fund.name}
                                  </Label>
                                  <p className="text-sm text-muted-foreground">{fund.goal_description || fund.description}</p>
                                </div>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                        <div>
                          <Label>Monthly Amount</Label>
                          <div className="text-md font-semibold">${membershipAmount.toFixed(2)}</div>
                        </div>
                        <div>
                          <Label>HDX Fee (2.5%)</Label>
                          <div className="text-md">${membershipFee.toFixed(2)}</div>
                        </div>
                        <div>
                          <Label>Net to Lab</Label>
                          <div className="text-md font-semibold text-green-700">${membershipNet.toFixed(2)}</div>
                        </div>
                        <div>
                          <Label>Payment Method</Label>
                          {loadingMembershipPM ? (
                            <div>Loading...</div>
                          ) : membershipPaymentMethod ? (
                            <div className="flex items-center gap-3">
                              <span>{membershipPaymentMethod.brand?.toUpperCase() || membershipPaymentMethod.bank_name}</span>
                              <span>•••• {membershipPaymentMethod.last4}</span>
                              {membershipPaymentMethod.exp_month && membershipPaymentMethod.exp_year && (
                                <span>Exp: {membershipPaymentMethod.exp_month}/{membershipPaymentMethod.exp_year}</span>
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
                        <Button variant="outline" onClick={() => setShowSubscribeDialog(false)} disabled={subscribing}>Cancel</Button>
                        <Button className="bg-accent text-primary-foreground" onClick={handleSubscribe} disabled={subscribing || !membershipPaymentMethod || !user}>
                          {subscribing ? "Subscribing..." : `Confirm $${membershipAmount.toFixed(2)} / month`}
                        </Button>
                        {(user === null || membershipPaymentMethod === null) && (
                          <div className="text-xs text-red-500 mt-2">
                            {!user && "You must be logged in to subscribe."}
                            {!membershipPaymentMethod && user && "You must add a payment method in your profile before subscribing."}
                          </div>
                        )}
                      </DialogFooter>
                      {subscribeError && <div className="text-red-500 text-sm mt-2">{subscribeError}</div>}
                      {subscribeSuccess && (
                        <div className="flex flex-col items-center mt-4">
                          <div className="text-green-600 text-lg font-semibold mb-2">Subscription successful!</div>
                          <div className="text-muted-foreground text-sm">Thank you for supporting this lab.</div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </>
              ) : null}
            </CardFooter>
          </Card>

          {/* One-Time Donation Tile */}
          <Card className={`border-secondary ${isDonationSetUp && !isDonationActive ? "opacity-60" : ""}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{oneTimeDonation?.donation_setup_name || "ONE-TIME DONATION"}</CardTitle>
                  <CardDescription>{oneTimeDonation?.donation_description || "No description yet."}</CardDescription>
                </div>
                {isAdmin && isDonationSetUp && (
                  <Button
                    variant="outline"
                    size="sm"
                    className={(isDonationActive ? "text-red-500 border-red-500" : "text-green-500 border-green-500") + " px-2 py-1 text-xs h-7 min-w-[90px]"}
                    onClick={handleToggleDonationActive}
                  >
                    {isDonationActive ? (
                      <>
                        <PowerOff className="h-4 w-4 mr-1" />
                        DEACTIVATE
                      </>
                    ) : (
                      <>
                        <Power className="h-4 w-4 mr-1" />
                        ACTIVATE
                      </>
                    )}
                  </Button>
                )}
              </div>
              {!isDonationActive && isAdmin && isDonationSetUp && (
                <div className="mt-2 text-sm text-amber-500 font-medium">DONATIONS CURRENTLY DISABLED</div>
              )}
            </CardHeader>
            <CardContent>
              {isDonationSetUp && (
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <div className="bg-secondary/50 rounded px-2 py-1">
                    Donors: <span className="font-semibold text-accent">{donorStatsLoading ? '...' : donorCount}</span>
                  </div>
                  <div className="bg-secondary/50 rounded px-2 py-1">
                    Avg. Donation: <span className="font-semibold text-accent">{donorStatsLoading ? '...' : `$${avgDonation}`}</span>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {isAdmin ? (
                isDonationSetUp ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-accent text-accent hover:bg-secondary"
                    onClick={async () => {
                      setEditDonationLoading(true);
                      const { data, error } = await supabase
                        .from("donation_funding")
                        .select("*")
                        .eq("id", oneTimeDonation.id)
                        .single();
                      if (!error && data) {
                        setEditDonationName(data.donation_setup_name || "One-Time Donation");
                        setEditDonationDescription(data.donation_description || "");
                        setEditDonationAmounts(data.suggested_amounts || []);
                      }
                      setEditDonationLoading(false);
                      setShowEditDonationDialog(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    EDIT
                  </Button>
                ) : (
                  <Button 
                    className="w-full bg-accent text-primary-foreground hover:bg-accent/90" 
                    onClick={() => setShowDonationDialog(true)}
                  >
                    SET UP
                  </Button>
                )
              ) : isGuest ? (
                <Button className="w-full bg-accent text-primary-foreground hover:bg-accent/90" onClick={handleGuestAction} disabled={!isDonationActive}>
                  {isDonationActive ? "DONATE" : "SET UP"}
                </Button>
              ) : (
                <OneTimeDonation labId={labId} funds={funds} onDonationSuccess={handleDonationSuccess} />
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Only show funding goals if at least one funding option is active */}
        {(isMembershipActive || isDonationActive) && (
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">CURRENT FUNDING GOALS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {funds.map((fund) => (
                  <div key={fund.id} className={`border border-secondary rounded-lg p-4${fund.goalName === "GENERAL FUND" ? " bg-accent/10" : ""}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{fund.goalName}</h3>
                        <p className="text-sm text-muted-foreground">{fund.goal_description}</p>
                      </div>
                      <Badge className="bg-accent text-primary-foreground">
                        {fund.goalName === "GENERAL FUND" ? "GENERAL" : `${fund.percentFunded}% FUNDED`}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: `${fund.percentFunded}%` }} />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>${fund.currentAmount.toLocaleString()} raised</span>
                        {fund.goalName !== "GENERAL FUND" && <span>Goal: ${fund.goalAmount.toLocaleString()}</span>}
                      </div>
                      {fund.goalName !== "GENERAL FUND" && (
                        <div className="text-xs text-muted-foreground">
                          {fund.daysRemaining !== undefined ? `${fund.daysRemaining} days remaining` : "No deadline"}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      {/* Only show edit/delete for non-General Fund and only for admins */}
                      {isAdmin && fund.goalName !== "GENERAL FUND" && (
                        <>
                          <Button variant="outline" className="border-accent text-accent hover:bg-secondary" onClick={() => handleEditFund(fund)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            EDIT
                          </Button>
                          <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10" onClick={() => setPendingDeleteFundId(fund.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            DELETE
                          </Button>
                          <Dialog 
                            open={pendingDeleteFundId === fund.id} 
                            onOpenChange={(open) => setPendingDeleteFundId(open ? fund.id : null)}
                          >
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Funding Goal?</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete this funding goal? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setPendingDeleteFundId(null)}>Cancel</Button>
                                <Button variant="destructive" onClick={async () => { await handleDeleteFund(fund.id); setPendingDeleteFundId(null); }}>
                                  Confirm Delete
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
      {/* Edit Fund Dialog */}
      {currentEditFund && (
        <EditFundDialog
          fund={currentEditFund}
          onSave={handleSaveFund}
          isOpen={editFundDialogOpen}
          onOpenChange={setEditFundDialogOpen}
        />
      )}
      {/* Create Funding Goal Dialog */}
      <OverlayDialog open={showCreateFundDialog} onOpenChange={setShowCreateFundDialog}>
        <OverlayDialogContent className="sm:max-w-[525px]">
          <OverlayDialogTitle>Create New Funding Goal</OverlayDialogTitle>
          <CreateFundDialog
            labId={labId}
            onFundCreated={() => {
              handleFundCreated(true)
              setShowCreateFundDialog(false)
            }}
            isOpen={true}
            onOpenChange={setShowCreateFundDialog}
          />
        </OverlayDialogContent>
      </OverlayDialog>
      {/* Funding Activity Dialog */}
      <OverlayDialog open={showFundingActivity} onOpenChange={setShowFundingActivity}>
        <OverlayDialogContent className="max-w-3xl">
          <OverlayDialogTitle>Funding Activity</OverlayDialogTitle>
          <FundingActivityDialog isOpen={showFundingActivity} onOpenChange={setShowFundingActivity} />
        </OverlayDialogContent>
      </OverlayDialog>
      {/* Donation Setup Dialog */}
      <Dialog open={showDonationDialog} onOpenChange={setShowDonationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Up One-Time Donations</DialogTitle>
            <DialogDescription>
              Configure the options for one-time donations to your lab.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={donationName} onChange={e => setDonationName(e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={donationDescription} onChange={e => setDonationDescription(e.target.value)} />
            </div>
            <div>
              <Label>Suggested Amounts</Label>
              <div className="flex flex-wrap gap-2">
                {donationAmounts.map((amount, index) => (
                  <div key={index} className="flex items-center bg-secondary rounded-md px-2 py-1">
                    <span className="mr-1">${amount}</span>
                    <button className="text-red-500 hover:text-red-600" onClick={() => setDonationAmounts(donationAmounts.filter((_, i) => i !== index))}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-lg">$</span>
                <Input
                  type="number"
                  min="1"
                  placeholder="Add amount..."
                  value={donationAmountInput}
                  onChange={(e) => setDonationAmountInput(e.target.value)}
                  className="w-24"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      if (donationAmountInput) {
                        setDonationAmounts([...donationAmounts, donationAmountInput])
                        setDonationAmountInput("")
                      }
                    }
                  }}
                />
                <Button variant="outline" onClick={() => {
                  if (donationAmountInput) {
                    setDonationAmounts([...donationAmounts, donationAmountInput])
                    setDonationAmountInput("")
                  }
                }}>
                  Add
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDonationDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-accent text-primary-foreground"
              onClick={() => handleSaveDonation({
                name: donationName,
                description: donationDescription,
                amounts: donationAmounts.map(Number)
              })}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Membership Setup Dialog */}
      <Dialog open={showSetupMembershipDialog} onOpenChange={setShowSetupMembershipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Up Lab Membership</DialogTitle>
            <DialogDescription>
              Configure the options for recurring lab memberships.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={editMembershipName} onChange={e => setEditMembershipName(e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={editMembershipDescription} onChange={e => setEditMembershipDescription(e.target.value)} />
            </div>
            <div>
              <Label>Monthly Amount ($)</Label>
              <Input 
                type="number" 
                min="1" 
                value={editMembershipAmount} 
                onChange={e => setEditMembershipAmount(e.target.value)} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSetupMembershipDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-accent text-primary-foreground"
              onClick={() => handleSaveMembership({
                name: editMembershipName,
                description: editMembershipDescription,
                amount: Number(editMembershipAmount)
              })}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Donation Dialog */}
      <EditDonationDialog
        initialName={editDonationName}
        initialDescription={editDonationDescription}
        initialSuggestedAmounts={editDonationAmounts}
        isOpen={showEditDonationDialog}
        onOpenChange={setShowEditDonationDialog}
        onSave={handleEditDonation}
        initialBenefits={[]}
      />

      {/* Edit Membership Dialog */}
      <EditMembershipDialog
        initialName={editMembershipName}
        initialDescription={editMembershipDescription}
        initialPrice={Number(editMembershipAmount) || 0}
        open={showEditMembershipDialog}
        onOpenChange={setShowEditMembershipDialog}
        onSave={handleEditMembership}
        initialIsActive={isMembershipActive}
        initialBenefits={[]}
      />
    </Card>
  )
}
