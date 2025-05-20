"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Maximize2, Minimize2, Plus, Calendar, Users, Edit, Trash, Image as ImageIcon, Circle } from "lucide-react"
import Link from "next/link"
import { CreateFundDialog } from "@/components/create-fund-dialog"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns"
import { ExperimentCard } from "@/components/experiments-list"

interface LabOverviewTabProps {
  isAdmin: boolean
  expandedTab: string | null
  toggleExpand: (tabName: string) => void
  funds: any[]
  experimentsExpanded: boolean
  setExperimentsExpanded: (value: boolean) => void
  setCreateExperimentDialogOpen: (value: boolean) => void
  liveExperimentsData: any[]
  labId: string
}

// Hook to fetch and cache usernames by user ID
function useUsername(userId: string | undefined) {
  const [username, setUsername] = useState<string>("");
  const cache = useRef<{ [key: string]: string }>({});
  useEffect(() => {
    async function fetchUsername() {
      if (!userId) { setUsername(""); return; }
      if (cache.current[userId]) {
        setUsername(cache.current[userId]);
        return;
      }
      const { data } = await supabase.from('profiles').select('username').eq('user_id', userId).single();
      const name = data?.username || "Unknown";
      cache.current[userId] = name;
      setUsername(name);
    }
    fetchUsername();
  }, [userId]);
  return username;
}

function getElapsedString(date: string | Date) {
  if (!date) return "-";
  const now = new Date();
  const end = typeof date === 'string' ? new Date(date) : date;
  let years = differenceInYears(now, end);
  let months = differenceInMonths(now, end) % 12;
  let days = differenceInDays(now, end) % 30;
  let hours = differenceInHours(now, end) % 24;
  let minutes = differenceInMinutes(now, end) % 60;
  let parts = [];
  if (years) parts.push(`${years}y`);
  if (months) parts.push(`${months}mo`);
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (parts.length === 0) parts.push("just now");
  return parts.join(" ") + " ago";
}

export function LabOverviewTab({
  isAdmin,
  expandedTab,
  toggleExpand,
  funds,
  experimentsExpanded,
  setExperimentsExpanded,
  setCreateExperimentDialogOpen,
  liveExperimentsData,
  labId,
}: LabOverviewTabProps) {
  const [bulletins, setBulletins] = useState<any[]>([])
  const [isAddingBulletin, setIsAddingBulletin] = useState(false)
  const [newBulletinText, setNewBulletinText] = useState("")
  const [newBulletinImage, setNewBulletinImage] = useState<File | null>(null)
  const [newBulletinImageUrl, setNewBulletinImageUrl] = useState<string>("")
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [editingBulletinId, setEditingBulletinId] = useState<number | null>(null)
  const [editingText, setEditingText] = useState("")
  const { user } = useAuth();
  const [usernames, setUsernames] = useState<{ [userId: string]: string }>({})
  const [showCreateFundDialog, setShowCreateFundDialog] = useState(false);
  const [recentFunds, setRecentFunds] = useState<any[]>([]);

  useEffect(() => {
    async function fetchBulletins() {
      if (!labId) return
      const response = await supabase
        .from("bulletin_posts")
        .select("*")
        .eq("labFrom", labId)
        .order("created_at", { ascending: false })
      const { data, error, status, statusText } = response;
      if (error) {
        console.error("Error fetching bulletins:", error);
        console.error("Full Supabase response:", response);
        alert(`Error fetching bulletins: ${error.message || JSON.stringify(error)} | status: ${status} ${statusText}`);
        setBulletins([])
        return
      }
      setBulletins(data || [])
      // Fetch usernames for all unique userFrom values
      const uniqueUserIds = Array.from(new Set((data || []).map((b: any) => b.userFrom).filter(Boolean)))
      if (uniqueUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id,username')
          .in('user_id', uniqueUserIds)
        const usernameMap: { [userId: string]: string } = {}
        profiles?.forEach((profile: any) => {
          usernameMap[profile.user_id] = profile.username || "Unknown"
        })
        setUsernames(usernameMap)
      }
    }
    fetchBulletins()
  }, [labId])

  // Fetch the two most recent funding goals (excluding 'GENERAL FUND')
  useEffect(() => {
    async function fetchRecentFunds() {
      if (!labId) return;
      const { data, error } = await supabase
        .from("funding_goals")
        .select("*")
        .eq("lab_id", labId)
        .neq("goalName", "GENERAL FUND")
        .order("created_at", { ascending: false })
        .limit(2);
      if (!error && data) setRecentFunds(data);
      else setRecentFunds([]);
    }
    fetchRecentFunds();
  }, [labId]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed.")
      return
    }
    setIsUploadingImage(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${labId}/${fileName}`
      const { error: uploadError } = await supabase.storage.from("bulletin-media").upload(filePath, file)
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from("bulletin-media").getPublicUrl(filePath)
      setNewBulletinImage(file)
      setNewBulletinImageUrl(data.publicUrl)
    } catch (err: any) {
      alert("Failed to upload image: " + (err.message || err))
      setNewBulletinImage(null)
      setNewBulletinImageUrl("")
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleAddBulletin = async () => {
    if (!newBulletinText.trim()) return;
    if (!labId) {
      alert("Lab ID is missing.");
      return;
    }
    if (!user?.id) {
      alert("You must be logged in to post a bulletin.");
      return;
    }

    // Log the data we're about to send
    const bulletinData = {
      postText: newBulletinText,
      media: newBulletinImageUrl || null,
      labFrom: labId,
      userFrom: user.id,
      created_at: new Date().toISOString(),
    };
    console.log("Attempting to post bulletin with data:", bulletinData);

    try {
      const { data, error } = await supabase
        .from("bulletin_posts")
        .insert([bulletinData])
        .select()

      if (error) {
        console.error("Failed to post bulletin:", error);
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        alert("Failed to post bulletin: " + (error.message || JSON.stringify(error)));
        return;
      }

      console.log("Successfully posted bulletin:", data);
      
      // Update local state with the new bulletin
      const newBulletin = {
        id: data[0].id,
        text: newBulletinText,
        date: new Date(),
        media: newBulletinImageUrl,
        created_at: data[0].created_at,
        postText: newBulletinText,
        labFrom: labId,
        userFrom: user.id
      };
      
      setBulletins([newBulletin, ...bulletins]);
      setNewBulletinText("");
      setNewBulletinImage(null);
      setNewBulletinImageUrl("");
      setIsAddingBulletin(false);

      // Activity logging for bulletin post
      const activityData = {
        activity_id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
        activity_name: `Bulletin Posted: ${newBulletinText.substring(0, 50)}`,
        activity_type: "bulletposted",
        performed_by: user.id,
        lab_from: labId
      };
      await supabase.from("activity").insert([activityData]);
    } catch (err: any) {
      console.error("Failed to post bulletin (catch):", err);
      console.error("Error details:", {
        message: err.message,
        stack: err.stack
      });
      alert("Failed to post bulletin: " + (err.message || JSON.stringify(err)));
    }
  }

  const handleEditBulletin = (id: number) => {
    const bulletin = bulletins.find((b) => b.id === id)
    if (bulletin) {
      setEditingBulletinId(id)
      setEditingText(bulletin.text || bulletin.postText || "")
    }
  }

  const handleSaveEdit = async (id: number) => {
    if (editingText.trim()) {
      // Update in Supabase
      const { error } = await supabase
        .from("bulletin_posts")
        .update({ postText: editingText })
        .eq("id", id)
      if (error) {
        alert("Failed to update bulletin: " + (error.message || JSON.stringify(error)));
        return;
      }
      // Update local state
      setBulletins(bulletins.map((bulletin) => (bulletin.id === id ? { ...bulletin, text: editingText, postText: editingText } : bulletin)))
      setEditingBulletinId(null)
      // Log activity
      if (user?.id && labId) {
        const activityData = {
          activity_id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
          activity_name: `Bulletin Edited: ${editingText.substring(0, 50)}`,
          activity_type: "bulletinedited",
          performed_by: user.id,
          lab_from: labId
        };
        await supabase.from("activity").insert([activityData]);
      }
    }
  }

  const handleDeleteBulletin = async (id: number) => {
    // Delete from Supabase
    const { error } = await supabase
      .from("bulletin_posts")
      .delete()
      .eq("id", id)
    if (error) {
      alert("Failed to delete bulletin: " + (error.message || JSON.stringify(error)));
      return;
    }
    // Update local state
    setBulletins(bulletins.filter((bulletin) => bulletin.id !== id))
    // Log activity
    if (user?.id && labId) {
      const activityData = {
        activity_id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
        activity_name: `Bulletin Deleted: ID ${id}`,
        activity_type: "bulletindeleted",
        performed_by: user.id,
        lab_from: labId
      };
      await supabase.from("activity").insert([activityData]);
    }
  }

  // Enhanced Funding Goals Section
  // Map DB fields to UI fields for all funds
  const mappedFunds = funds.map(fund => ({
    ...fund,
    name: fund.goalName ?? fund.name,
    description: fund.goal_description ?? fund.description,
    currentAmount: fund.amount_contributed ?? fund.currentAmount ?? 0,
    goalAmount: fund.goal_amount ?? fund.goalAmount ?? 0,
    percentFunded: (fund.goal_amount ?? fund.goalAmount)
      ? Math.round(((fund.amount_contributed ?? fund.currentAmount ?? 0) / (fund.goal_amount ?? fund.goalAmount)) * 100)
      : 0,
    daysRemaining: fund.deadline
      ? Math.max(0, Math.ceil((new Date(fund.deadline).getTime() - Date.now()) / (1000*60*60*24)))
      : undefined,
  }));

  return (
    <>
      {/* Lab Bulletin Board */}
      <Card className="border-accent/20 mb-6">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-xl">LAB BULLETIN</CardTitle>
          <div className="flex items-center gap-2">
            {isAdmin && !isAddingBulletin && (
              <Button
                variant="outline"
                size="sm"
                className="border-accent text-accent hover:bg-secondary"
                onClick={() => setIsAddingBulletin(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                POST UPDATE
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => toggleExpand("bulletin")} className="h-8 w-8">
              {expandedTab === "bulletin" ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isAdmin && isAddingBulletin && (
            <div className="mb-4 space-y-2">
              <Textarea
                placeholder="Type your bulletin update here..."
                value={newBulletinText}
                onChange={(e) => setNewBulletinText(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex items-center gap-2">
                <label htmlFor="bulletin-image-upload" className="cursor-pointer flex items-center gap-1">
                  <ImageIcon className="h-5 w-5 text-accent" />
                  <span className="text-xs text-muted-foreground">Attach Image</span>
                  <input
                    id="bulletin-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={isUploadingImage}
                  />
                </label>
                {newBulletinImage && newBulletinImageUrl && (
                  <img 
                    src={newBulletinImageUrl} 
                    alt="Preview" 
                    className="max-h-24 rounded border ml-2" 
                    style={{ maxWidth: 120 }}
                    onError={e => { console.error('[Preview] Image failed to load:', newBulletinImageUrl); e.currentTarget.alt = 'Image failed to load'; }}
                  />
                )}
                {isUploadingImage && <span className="text-xs text-muted-foreground ml-2">Uploading...</span>}
                <div className="flex-1" />
                <Button variant="outline" onClick={() => setIsAddingBulletin(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddBulletin} disabled={isUploadingImage}>
                  Post Update
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {bulletins.length === 0 ? (
              <div className="text-muted-foreground text-sm">No bulletins yet.</div>
            ) : (
              bulletins.map((bulletin) => (
                <div key={bulletin.id} className="p-4 bg-secondary/50 border border-secondary rounded-lg">
                  {editingBulletinId === bulletin.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="min-h-[80px]"
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingBulletinId(null)}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={() => handleSaveEdit(bulletin.id)}>
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm whitespace-pre-wrap">{bulletin.text || bulletin.postText}</p>
                      {bulletin.media && (
                        <img
                          src={bulletin.media}
                          alt="Bulletin"
                          className="mt-3 max-h-64 w-auto rounded border"
                          style={{ maxWidth: '100%', objectFit: 'contain' }}
                          onError={e => { console.error('[Bulletin] Image failed to load:', bulletin.media); e.currentTarget.alt = 'Image failed to load'; }}
                        />
                      )}
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(bulletin.created_at || bulletin.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                          {usernames[bulletin.userFrom] && ` • Posted by ${usernames[bulletin.userFrom]}`}
                        </span>
                        {isAdmin && (
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleEditBulletin(bulletin.id)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteBulletin(bulletin.id)}
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Experiments Section (only if there are live experiments) */}
      {liveExperimentsData.filter((experiment) => experiment.closed_status !== "CLOSED").length > 0 && (
        <Card className="border-accent/20">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xl">LIVE EXPERIMENTS</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => toggleExpand("experiments")} className="h-8 w-8">
                {expandedTab === "experiments" ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {liveExperimentsData.filter((experiment) => experiment.closed_status !== "CLOSED").map((experiment) => (
                <ExperimentCard key={experiment.id} experiment={experiment} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Funding Goals Section (only if there are any) */}
      {recentFunds && recentFunds.length > 0 && (
        <Card className="border-accent/20">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xl">FUNDING GOALS</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => toggleExpand("funding")} className="h-8 w-8">
                {expandedTab === "funding" ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentFunds.map((fund) => {
                const percentFunded = fund.goal_amount ? Math.round((fund.amount_contributed || 0) / fund.goal_amount * 100) : 0;
                const daysRemaining = fund.deadline ? Math.max(0, Math.ceil((new Date(fund.deadline).getTime() - Date.now()) / (1000*60*60*24))) : undefined;
                return (
                  <Card key={fund.id} className="bg-secondary/50 border-secondary">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium text-accent">{fund.goalName}</h3>
                          <span className="text-sm font-medium">
                            ${Number(fund.amount_contributed ?? 0).toLocaleString()} / ${Number(fund.goal_amount ?? 0).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{fund.goal_description}</p>
                        <div className="mt-2">
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-accent" style={{ width: `${percentFunded}%` }} />
                          </div>
                          <div className="flex justify-between mt-1">
                            <p className="text-xs text-muted-foreground">{percentFunded}% funded</p>
                            <p className="text-xs text-muted-foreground">{daysRemaining !== undefined ? `${daysRemaining} days remaining` : 'No deadline'}</p>
                          </div>
                        </div>
                        {!isAdmin && (
                          <div className="mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-accent border-accent/20 hover:bg-accent/10"
                            >
                              CONTRIBUTE $
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
