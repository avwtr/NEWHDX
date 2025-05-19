"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ArrowLeft,
  FlaskConical,
  Calendar,
  Clock,
  FileIcon,
  CheckCircle,
  Upload,
  FileText,
  Trash2,
  UserPlus,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Pencil,
  Paperclip,
  Send,
  MessageSquare,
  X,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { FileList } from "@/components/file-list"
import { Timeline } from "@/components/timeline"
import { CustomEventDialog } from "@/components/custom-event-dialog"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { FileViewerDialog } from "@/components/file-viewer-dialog"
import { toast } from "@/components/ui/use-toast"

// Add science categories mapping
const scienceCategories = {
  "biochemistry": {
    color: "bg-blue-600",
    label: "BIOCHEMISTRY"
  },
  "molecular-biology": {
    color: "bg-green-600",
    label: "MOLECULAR BIOLOGY"
  },
  "genetics": {
    color: "bg-purple-600",
    label: "GENETICS"
  },
  "cell-biology": {
    color: "bg-red-600",
    label: "CELL BIOLOGY"
  },
  "neuroscience": {
    color: "bg-indigo-600",
    label: "NEUROSCIENCE"
  },
  "immunology": {
    color: "bg-pink-600",
    label: "IMMUNOLOGY"
  },
  "microbiology": {
    color: "bg-yellow-600",
    label: "MICROBIOLOGY"
  },
  "biophysics": {
    color: "bg-cyan-600",
    label: "BIOPHYSICS"
  },
  "bioinformatics": {
    color: "bg-orange-600",
    label: "BIOINFORMATICS"
  },
  "pharmacology": {
    color: "bg-teal-600",
    label: "PHARMACOLOGY"
  }
} as const

// Add sample data for timeline and contributions
const timelineEvents = [
  {
    id: "1",
    date: "2024-03-15",
    event: "Experiment Started",
    description: "Initial setup and calibration completed"
  },
  {
    id: "2",
    date: "2024-03-16",
    event: "Data Collection",
    description: "First round of measurements recorded"
  },
  {
    id: "3",
    date: "2024-03-17",
    event: "Analysis",
    description: "Preliminary results analyzed"
  }
]

const contributions = [
  {
    id: "1",
    title: "Additional Data Analysis",
    description: "Provided supplementary statistical analysis of the results",
    date: "2024-03-18",
    status: "pending",
    contributor: {
      name: "Dr. Jane Smith",
      avatar: "/placeholder.svg",
      initials: "JS"
    }
  }
]

const labMaterials = [
  {
    id: "1",
    name: "Protocol Document",
    size: "2.4 MB",
    date: "2024-03-15"
  },
  {
    id: "2",
    name: "Calibration Data",
    size: "1.8 MB",
    date: "2024-03-14"
  }
]

// --- Add scienceCategoryColors and helpers from explore/profile for consistent badge coloring ---
const scienceCategoryColors: Record<string, { bg: string; text: string }> = {
  neuroscience: { bg: "bg-[#9D4EDD]", text: "text-white" },
  ai: { bg: "bg-[#3A86FF]", text: "text-white" },
  biology: { bg: "bg-[#38B000]", text: "text-white" },
  chemistry: { bg: "bg-[#FF5400]", text: "text-white" },
  physics: { bg: "bg-[#FFD60A]", text: "text-black" },
  medicine: { bg: "bg-[#FF0054]", text: "text-white" },
  psychology: { bg: "bg-[#FB5607]", text: "text-white" },
  engineering: { bg: "bg-[#4361EE]", text: "text-white" },
  mathematics: { bg: "bg-[#7209B7]", text: "text-white" },
  environmental: { bg: "bg-[#2DC653]", text: "text-white" },
  astronomy: { bg: "bg-[#3F37C9]", text: "text-white" },
  geology: { bg: "bg-[#AA6C25]", text: "text-white" },
  "brain-mapping": { bg: "bg-[#9D4EDD]", text: "text-white" },
  "cognitive-science": { bg: "bg-[#FB5607]", text: "text-white" },
  "quantum-mechanics": { bg: "bg-[#FFD60A]", text: "text-black" },
  "particle-physics": { bg: "bg-[#FFD60A]", text: "text-black" },
  genomics: { bg: "bg-[#38B000]", text: "text-white" },
  bioinformatics: { bg: "bg-[#38B000]", text: "text-white" },
  ethics: { bg: "bg-[#FB5607]", text: "text-white" },
  "computer-science": { bg: "bg-[#3A86FF]", text: "text-white" },
  "climate-science": { bg: "bg-[#2DC653]", text: "text-white" },
  "data-analysis": { bg: "bg-[#7209B7]", text: "text-white" },
  biochemistry: { bg: "bg-[#FF5400]", text: "text-white" },
  astrophysics: { bg: "bg-[#3F37C9]", text: "text-white" },
  cosmology: { bg: "bg-[#3F37C9]", text: "text-white" },
  "clinical-research": { bg: "bg-[#FF0054]", text: "text-white" },
  biotechnology: { bg: "bg-[#38B000]", text: "text-white" },
  "medical-imaging": { bg: "bg-[#FF0054]", text: "text-white" },
  meteorology: { bg: "bg-[#2DC653]", text: "text-white" },
  "machine-learning": { bg: "bg-[#3A86FF]", text: "text-white" },
  optimization: { bg: "bg-[#7209B7]", text: "text-white" },
  "data-processing": { bg: "bg-[#7209B7]", text: "text-white" },
  "data-visualization": { bg: "bg-[#7209B7]", text: "text-white" },
  methodology: { bg: "bg-[#6C757D]", text: "text-white" },
  computing: { bg: "bg-[#3A86FF]", text: "text-white" },
  evaluation: { bg: "bg-[#6C757D]", text: "text-white" },
  innovation: { bg: "bg-[#6C757D]", text: "text-white" },
  "research-funding": { bg: "bg-[#6C757D]", text: "text-white" },
  governance: { bg: "bg-[#6C757D]", text: "text-white" },
  mitigation: { bg: "bg-[#2DC653]", text: "text-white" },
  "diversity-studies": { bg: "bg-[#6C757D]", text: "text-white" },
  "public-perception": { bg: "bg-[#FB5607]", text: "text-white" },
  "citizen-science": { bg: "bg-[#6C757D]", text: "text-white" },
  "bias-studies": { bg: "bg-[#3A86FF]", text: "text-white" },
  "cell-biology": { bg: "bg-[#38B000]", text: "text-white" },
  "genetics": { bg: "bg-[#38B000]", text: "text-white" },
  "proteomics": { bg: "bg-[#38B000]", text: "text-white" },
  "microbiology": { bg: "bg-[#38B000]", text: "text-white" },
  "virology": { bg: "bg-[#38B000]", text: "text-white" },
  "immunology": { bg: "bg-[#38B000]", text: "text-white" },
  "developmental-biology": { bg: "bg-[#38B000]", text: "text-white" },
  "evolutionary-biology": { bg: "bg-[#38B000]", text: "text-white" },
  "ecology": { bg: "bg-[#2DC653]", text: "text-white" },
  "marine-biology": { bg: "bg-[#2DC653]", text: "text-white" },
  "botany": { bg: "bg-[#2DC653]", text: "text-white" },
  "zoology": { bg: "bg-[#2DC653]", text: "text-white" },
  "organic-chemistry": { bg: "bg-[#FF5400]", text: "text-white" },
  "inorganic-chemistry": { bg: "bg-[#FF5400]", text: "text-white" },
  "physical-chemistry": { bg: "bg-[#FF5400]", text: "text-white" },
  "analytical-chemistry": { bg: "bg-[#FF5400]", text: "text-white" },
  "medicinal-chemistry": { bg: "bg-[#FF5400]", text: "text-white" },
  "polymer-chemistry": { bg: "bg-[#FF5400]", text: "text-white" },
  "materials-chemistry": { bg: "bg-[#FF5400]", text: "text-white" },
  "computational-chemistry": { bg: "bg-[#3A86FF]", text: "text-white" },
  "environmental-chemistry": { bg: "bg-[#2DC653]", text: "text-white" },
  "quantum-physics": { bg: "bg-[#FFD60A]", text: "text-black" },
  "nuclear-physics": { bg: "bg-[#FFD60A]", text: "text-black" },
  "condensed-matter-physics": { bg: "bg-[#FFD60A]", text: "text-black" },
  optics: { bg: "bg-[#FFD60A]", text: "text-black" },
  thermodynamics: { bg: "bg-[#FFD60A]", text: "text-black" },
  "fluid-dynamics": { bg: "bg-[#FFD60A]", text: "text-black" },
  "plasma-physics": { bg: "bg-[#FFD60A]", text: "text-black" },
  biophysics: { bg: "bg-[#38B000]", text: "text-white" },
  geophysics: { bg: "bg-[#AA6C25]", text: "text-white" },
  geochemistry: { bg: "bg-[#AA6C25]", text: "text-white" },
  climatology: { bg: "bg-[#2DC653]", text: "text-white" },
  oceanography: { bg: "bg-[#2DC653]", text: "text-white" },
  hydrology: { bg: "bg-[#2DC653]", text: "text-white" },
  seismology: { bg: "bg-[#AA6C25]", text: "text-white" },
  volcanology: { bg: "bg-[#AA6C25]", text: "text-white" },
  paleontology: { bg: "bg-[#AA6C25]", text: "text-white" },
  anatomy: { bg: "bg-[#FF0054]", text: "text-white" },
  physiology: { bg: "bg-[#FF0054]", text: "text-white" },
  pathology: { bg: "bg-[#FF0054]", text: "text-white" },
  pharmacology: { bg: "bg-[#FF0054]", text: "text-white" },
  toxicology: { bg: "bg-[#FF0054]", text: "text-white" },
  epidemiology: { bg: "bg-[#FF0054]", text: "text-white" },
  "public-health": { bg: "bg-[#FF0054]", text: "text-white" },
  cardiology: { bg: "bg-[#FF0054]", text: "text-white" },
  neurology: { bg: "bg-[#9D4EDD]", text: "text-white" },
  oncology: { bg: "bg-[#FF0054]", text: "text-white" },
  pediatrics: { bg: "bg-[#FF0054]", text: "text-white" },
  geriatrics: { bg: "bg-[#FF0054]", text: "text-white" },
  psychiatry: { bg: "bg-[#FB5607]", text: "text-white" },
  "biomedical-engineering": { bg: "bg-[#4361EE]", text: "text-white" },
  "chemical-engineering": { bg: "bg-[#4361EE]", text: "text-white" },
  "civil-engineering": { bg: "bg-[#4361EE]", text: "text-white" },
  "electrical-engineering": { bg: "bg-[#4361EE]", text: "text-white" },
  "mechanical-engineering": { bg: "bg-[#4361EE]", text: "text-white" },
  "artificial-intelligence": { bg: "bg-[#3A86FF]", text: "text-white" },
  robotics: { bg: "bg-[#3A86FF]", text: "text-white" },
  nanotechnology: { bg: "bg-[#3A86FF]", text: "text-white" },
  "materials-science": { bg: "bg-[#FF5400]", text: "text-white" },
  "systems-biology": { bg: "bg-[#38B000]", text: "text-white" },
  "synthetic-biology": { bg: "bg-[#38B000]", text: "text-white" },
  "computational-biology": { bg: "bg-[#38B000]", text: "text-white" },
  "quantum-computing": { bg: "bg-[#FFD60A]", text: "text-black" },
  "renewable-energy": { bg: "bg-[#2DC653]", text: "text-white" },
  "sustainable-development": { bg: "bg-[#2DC653]", text: "text-white" },
  "data-science": { bg: "bg-[#7209B7]", text: "text-white" },
  astrobiology: { bg: "bg-[#3F37C9]", text: "text-white" },
};

const getCategoryBadgeColors = (category: string) => {
  return scienceCategoryColors[category] || { bg: "bg-[#6C757D]", text: "text-white" };
};

const getCategoryLabel = (category: string) => category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');

export default function ExperimentViewPage() {
  const params = useParams()
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id
  const [experiment, setExperiment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // State for UI
  const [activeTab, setActiveTab] = useState("overview")
  const [runningTime, setRunningTime] = useState("")
  const [experimentFiles, setExperimentFiles] = useState<any[]>([])
  const [customEventDialogOpen, setCustomEventDialogOpen] = useState(false)
  const [addContributorDialogOpen, setAddContributorDialogOpen] = useState(false)
  const [concludeDialogOpen, setConcludeDialogOpen] = useState(false)
  const [addFromLabDialogOpen, setAddFromLabDialogOpen] = useState(false)
  const [selectedLabFiles, setSelectedLabFiles] = useState<string[]>([])
  const [concludeReason, setConcludeReason] = useState("")
  const [isSubmittingConclusion, setIsSubmittingConclusion] = useState(false)
  const [contributorSearch, setContributorSearch] = useState("")
  const [showContributionDetails, setShowContributionDetails] = useState<string | null>(null)
  const [experimentActivityEvents, setExperimentActivityEvents] = useState<any[]>([])
  const [activityUsers, setActivityUsers] = useState<Record<string, { username: string, profilePic: string }>>({})
  const [isEditingObjective, setIsEditingObjective] = useState(false)
  const [editedObjective, setEditedObjective] = useState("")
  const [isSavingObjective, setIsSavingObjective] = useState(false)
  const [discussionMessages, setDiscussionMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [isSending, setIsSending] = useState(false)
  const [contributors, setContributors] = useState<any[]>([])
  const [isAddContributorOpen, setIsAddContributorOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isAddingContributor, setIsAddingContributor] = useState(false)
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [labMaterials, setLabMaterials] = useState<any[]>([]);
  const [isFetchingLabMaterials, setIsFetchingLabMaterials] = useState(false);
  const [isAddingFromLab, setIsAddingFromLab] = useState(false);
  const [removingContributorId, setRemovingContributorId] = useState<string | null>(null);

  // Refs
  const statusIndicatorRef = useRef<HTMLDivElement>(null)

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!id) return
    setLoading(true)
    supabase
      .from("experiments")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching experiment:", error)
          return
        }
        setExperiment(data)
        setLoading(false)
      })
  }, [id])

  useEffect(() => {
    if (experiment) {
      setExperimentFiles(experiment.files || [])
    }
  }, [experiment])

  useEffect(() => {
    if (experiment?.created_at) {
      const startDate = new Date(experiment.created_at)
      
      // Validate the date
      if (isNaN(startDate.getTime())) {
        console.error("Invalid date:", experiment.created_at)
        setRunningTime("Invalid date")
        return
      }

      const updateRunningTime = () => {
        try {
          setRunningTime(formatDistanceToNow(startDate, { addSuffix: false }))
        } catch (error) {
          console.error("Error formatting date:", error)
          setRunningTime("Error calculating time")
        }
      }

      updateRunningTime()
      const interval = setInterval(updateRunningTime, 1000)

      return () => clearInterval(interval)
    }
  }, [experiment])

  useEffect(() => {
    if (experiment && statusIndicatorRef.current) {
      const interval = setInterval(() => {
        if (statusIndicatorRef.current) {
          statusIndicatorRef.current.classList.toggle("opacity-50")
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [experiment])

  useEffect(() => {
    if (!id) return;
    // Fetch experiment_activity events for this experiment
    supabase
      .from("experiment_activity")
      .select("*")
      .eq("experiment_id", id)
      .order("created_at", { ascending: false })
      .then(async ({ data, error }) => {
        if (error) {
          console.error("Error fetching experiment activity:", error)
          setExperimentActivityEvents([])
          return
        }
        // Fetch user profiles for all unique performed_by UUIDs
        const userIds = Array.from(new Set((data || []).map((row: any) => row.performed_by).filter(Boolean)))
        let userMap: Record<string, { username: string, profilePic: string }> = {}
        if (userIds.length > 0) {
          const { data: users, error: userError } = await supabase
            .from("profiles")
            .select("user_id, username, profilePic")
            .in("user_id", userIds)
          if (!userError && users) {
            users.forEach((u: any) => {
              userMap[u.user_id] = { username: u.username, profilePic: u.profilePic }
            })
          }
        }
        setActivityUsers(userMap)
        // Map to Timeline format
        const events = (data || []).map((row: any) => ({
          id: row.activity_id || row.id,
          date: row.created_at ? new Date(row.created_at).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }) : "",
          activity_name: row.activity_name,
          activity_type: row.activity_type,
          user: userMap[row.performed_by] || null,
        }))
        setExperimentActivityEvents(events)
      })
  }, [id])

  // Fetch messages from experiment_messages on load and after sending
  useEffect(() => {
    if (!experiment?.id) return;
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("experiment_messages")
        .select("*")
        .eq("experiment_id", experiment.id)
        .order("created_at", { ascending: true });
      if (!error && data) {
        // Optionally fetch user info for each message
        const userIds = Array.from(new Set(data.map((msg: any) => msg.user)));
        let userMap: Record<string, { username: string; profilePic: string }> = {};
        if (userIds.length > 0) {
          const { data: users } = await supabase
            .from("profiles")
            .select("user_id, username, profilePic")
            .in("user_id", userIds);
          if (users) {
            users.forEach((u: any) => {
              userMap[u.user_id] = { username: u.username, profilePic: u.profilePic };
            });
          }
        }
        setDiscussionMessages(
          data.map((msg: any) => ({
            ...msg,
            userInfo: userMap[msg.user] || null,
          }))
        );
      }
    };
    fetchMessages();
  }, [experiment?.id]);

  // Helper to get public URL for a file
  const getFileUrl = (storageKey: string) => {
    const { data } = supabase.storage.from("experiment-message-files").getPublicUrl(storageKey);
    return data?.publicUrl;
  };

  const handleSendMessage = async () => {
    if (!user || (!newMessage && newFiles.length === 0)) return;
    setIsSending(true);
    const fileNames: string[] = [];
    const fileSizes: number[] = [];
    const storageKeys: string[] = [];
    // Upload each file to Supabase Storage
    for (const file of newFiles) {
      const storageKey = `${experiment.id}/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage
        .from("experiment-message-files")
        .upload(storageKey, file);
      if (!error) {
        fileNames.push(file.name);
        fileSizes.push(file.size);
        storageKeys.push(storageKey);
      } else {
        console.error("File upload error:", error);
      }
    }
    // Prepare payload, always send arrays (never undefined/null)
    const payload: any = {
      user: user.id,
      experiment_id: experiment.id,
      text_content: newMessage,
      file: fileNames.length ? fileNames : [],
      file_size: fileSizes.length ? fileSizes : [],
      storageKey: storageKeys.length ? storageKeys : [],
      // created_at: new Date().toISOString(), // Remove if table auto-generates
    };
    console.log('[Discussion] Inserting message:', payload);
    const { error: insertError, data: insertData } = await supabase.from("experiment_messages").insert([payload]);
    if (insertError) {
      console.error("Message insert error:", insertError, payload);
    } else {
      console.log('[Discussion] Message insert success:', insertData);
      // Refetch messages
      const { data, error } = await supabase
        .from("experiment_messages")
        .select("*")
        .eq("experiment_id", experiment.id)
        .order("created_at", { ascending: true });
      if (!error && data) {
        // Optionally fetch user info for each message
        const userIds = Array.from(new Set(data.map((msg: any) => msg.user)));
        let userMap: Record<string, { username: string; profilePic: string }> = {};
        if (userIds.length > 0) {
          const { data: users } = await supabase
            .from("profiles")
            .select("user_id, username, profilePic")
            .in("user_id", userIds);
          if (users) {
            users.forEach((u: any) => {
              userMap[u.user_id] = { username: u.username, profilePic: u.profilePic };
            });
          }
        }
        setDiscussionMessages(
          data.map((msg: any) => ({
            ...msg,
            userInfo: userMap[msg.user] || null,
          }))
        );
      }
      setNewMessage("");
      setNewFiles([]);
    }
    setIsSending(false);
  };

  const handleAddCustomEvent = async (event: any) => {
    if (!user || !experiment?.id) return;
    const activity_id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    const payload = {
      activity_id,
      activity_name: event.description,
      activity_type: event.type || 'custom',
      performed_by: user.id,
      experiment_id: experiment.id,
      created_at: new Date().toISOString(),
    };
    console.log('[CustomEvent] Logging experiment activity:', payload);
    const { data: expActData, error: expActError } = await supabase.from('experiment_activity').insert([payload]).select().single();
    console.log('[CustomEvent] Experiment activity log result:', { expActData, expActError });
    // Refresh activity events
    supabase
      .from("experiment_activity")
      .select("*")
      .eq("experiment_id", experiment.id)
      .order("created_at", { ascending: false })
      .then(async ({ data, error }) => {
        if (error) return;
        const userIds = Array.from(new Set((data || []).map((row: any) => row.performed_by).filter(Boolean)))
        let userMap: Record<string, { username: string, profilePic: string }> = {}
        if (userIds.length > 0) {
          const { data: users } = await supabase
            .from("profiles")
            .select("user_id, username, profilePic")
            .in("user_id", userIds)
          if (users) {
            users.forEach((u: any) => {
              userMap[u.user_id] = { username: u.username, profilePic: u.profilePic }
            })
          }
        }
        const events = (data || []).map((row: any) => ({
          id: row.activity_id || row.id,
          date: row.created_at ? new Date(row.created_at).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }) : "",
          activity_name: row.activity_name,
          activity_type: row.activity_type,
          user: userMap[row.performed_by] || null,
        }))
        setExperimentActivityEvents(events)
      });
    setCustomEventDialogOpen(false);
  }

  const handleAddContributor = async (profile: any) => {
    if (!user) return;
    setIsAddingContributor(true);
    await supabase.from("experiment_contributors").insert({
      user_id: profile.user_id,
      experiment_id: experiment.id,
      added_when: "ADDED"
    });
    // Log activity
    await logExperimentActivity({
      activity_name: `Contributor Added: ${profile.username || profile.user_id}`,
      activity_type: "contributor_added",
      performed_by: user.id,
      experiment_id: experiment.id,
    });
    setIsAddingContributor(false);
    setIsAddContributorOpen(false);
    setContributorSearch("");
    setSearchResults([]);
    fetchContributors();
  };

  const handleConcludeExperiment = () => {
    if (!concludeReason.trim()) return

    setIsSubmittingConclusion(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmittingConclusion(false)
      setConcludeDialogOpen(false)

      // In a real app, this would update the experiment status and redirect to a conclusion page
      router.push(`/newexperiments/${experiment.id}/conclude`)
    }, 1500)
  }

  const handleAddFromLab = async () => {
    if (!experiment?.id || !user?.id || selectedLabFiles.length === 0) return;
    setIsAddingFromLab(true);
    try {
      const filesToAdd = labMaterials.filter(f => selectedLabFiles.includes(f.id));
      const newExperimentFiles: any[] = [];
      let failedFiles: string[] = [];
      for (const file of filesToAdd) {
        // 1. Copy file in storage
        const sourcePath = file.folder && file.folder !== "root"
          ? `${experiment.lab_id}/${file.folder}/${file.filename}`
          : `${experiment.lab_id}/${file.filename}`;
        console.log('Trying to download from:', sourcePath, file);
        const { data: fileData, error: downloadError } = await supabase.storage.from("labmaterials").download(sourcePath);
        if (downloadError || !fileData) {
          toast({ title: 'Error', description: `Failed to download ${file.filename} from lab materials.`, variant: 'destructive' });
          failedFiles.push(file.filename);
          continue; // Skip this file, try the rest
        }
        // Upload to experiment-files
        const destPath = `${experiment.id}/${file.filename}`;
        const { error: uploadError } = await supabase.storage.from("experiment-files").upload(destPath, fileData, { upsert: true });
        if (uploadError) {
          toast({ title: 'Error', description: `Failed to upload ${file.filename} to experiment files.`, variant: 'destructive' });
          failedFiles.push(file.filename);
          continue;
        }
        // 2. Insert into experiment_files table
        const insertObj = {
          file: file.filename,
          file_size: file.fileSize || file.size || "",
          how_added: "ADDED FROM LAB",
          added_by: user.id,
          experiment_id: experiment.id,
          storageKey: destPath,
        };
        const { data: inserted, error: insertError } = await supabase.from("experiment_files").insert([insertObj]).select().single();
        if (insertError) {
          toast({ title: 'Error', description: `Failed to insert DB row for ${file.filename}.`, variant: 'destructive' });
          failedFiles.push(file.filename);
          continue;
        }
        newExperimentFiles.push(inserted);
        // Log activity for each file added from lab
        await logExperimentActivity({
          activity_name: `File Added from Lab: ${file.filename}`,
          activity_type: "file_added_from_lab",
          performed_by: user.id,
          experiment_id: experiment.id,
        });
      }
      // Update experimentFiles state so UI updates immediately
      if (newExperimentFiles.length > 0) {
        setExperimentFiles(prev => [...newExperimentFiles, ...prev]);
      }
      setAddFromLabDialogOpen(false);
      setSelectedLabFiles([]);
      if (failedFiles.length > 0) {
        toast({ title: 'Some files could not be added', description: failedFiles.join(', '), variant: 'destructive' });
      }
    } catch (err: any) {
      alert(err.message || "Failed to add files from lab materials.");
    } finally {
      setIsAddingFromLab(false);
    }
  };

  const toggleLabFileSelection = (fileId: string) => {
    if (selectedLabFiles.includes(fileId)) {
      setSelectedLabFiles(selectedLabFiles.filter((id) => id !== fileId))
    } else {
      setSelectedLabFiles([...selectedLabFiles, fileId])
    }
  }

  const toggleContributionDetails = (id: string) => {
    if (showContributionDetails === id) {
      setShowContributionDetails(null)
    } else {
      setShowContributionDetails(id)
    }
  }

  const handleEditObjective = () => {
    setEditedObjective(experiment.objective || "");
    setIsEditingObjective(true);
  };

  const handleCancelEditObjective = () => {
    setIsEditingObjective(false);
    setEditedObjective("");
  };

  const handleSaveObjective = async () => {
    if (!user) return;
    setIsSavingObjective(true);
    const { data, error } = await supabase
      .from("experiments")
      .update({ objective: editedObjective })
      .eq("id", experiment.id)
      .select()
      .single();
    setIsSavingObjective(false);
    if (!error && data) {
      setExperiment((prev: any) => ({ ...prev, objective: editedObjective }));
      setIsEditingObjective(false);
      // Log activity
      await logExperimentActivity({
        activity_name: "Objective Updated",
        activity_type: "objective_updated",
        performed_by: user.id,
        experiment_id: experiment.id,
      });
    } else {
      // Optionally show error
      alert("Failed to update objective");
    }
  };

  // Fetch contributors for this experiment
  const fetchContributors = useCallback(async () => {
    if (!experiment?.id) return;
    // 1. Fetch contributors
    const { data: contributors, error } = await supabase
      .from("experiment_contributors")
      .select("*")
      .eq("experiment_id", experiment.id)
      .order("created_at", { ascending: true });
    console.log('[Contributors] Fetched experiment_contributors:', contributors, error);
    if (!error && contributors && contributors.length > 0) {
      // 2. Extract user_ids
      const userIds = contributors.map(c => c.user_id);
      // 3. Fetch profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, profilePic")
        .in("user_id", userIds);
      console.log('[Contributors] Fetched profiles:', profiles);
      // 4. Merge profiles into contributors
      const profileMap: Record<string, any> = {};
      (profiles || []).forEach(p => { profileMap[p.user_id] = p; });
      const contributorsWithProfiles = contributors.map(c => ({
        ...c,
        profile: profileMap[c.user_id] || null,
      }));
      setContributors(contributorsWithProfiles);
      console.log('[Contributors] Set contributors state:', contributorsWithProfiles);
    } else if (!error) {
      setContributors([]);
    }
  }, [experiment?.id]);

  useEffect(() => {
    fetchContributors();
  }, [fetchContributors]);

  // Search for users to add as contributors
  const handleContributorSearch = async (query: string) => {
    setContributorSearch(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    // Exclude already-contributors
    const excludeIds = contributors.map(c => c.user_id);
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, username, profilePic")
      .ilike("username", `%${query}%`)
      .not("user_id", "in", `(${excludeIds.join(",")})`);
    if (!error && data) {
      setSearchResults(data);
    }
  };

  // Fetch experiment files
  const fetchExperimentFiles = useCallback(async () => {
    if (!experiment?.id) return;
    const { data, error } = await supabase
      .from("experiment_files")
      .select("*")
      .eq("experiment_id", experiment.id)
      .order("created_at", { ascending: false });
    if (!error && data) {
      setExperimentFiles(data);
    }
  }, [experiment?.id]);

  useEffect(() => {
    fetchExperimentFiles();
  }, [fetchExperimentFiles]);

  // File upload handler
  const handleExperimentFileUpload = async (file: File) => {
    if (!file || !experiment?.id || !user?.id) return;
    setIsUploadingFile(true);
    const storageKey = `${experiment.id}/${file.name}`;
    // 1. Upload to storage
    const { error: uploadError } = await supabase
      .storage
      .from("experiment-files")
      .upload(storageKey, file);
    if (uploadError) {
      alert("Upload failed: " + uploadError.message);
      setIsUploadingFile(false);
      return;
    }
    // 2. Insert into experiment_files table
    const { error: dbError } = await supabase.from("experiment_files").insert({
      file: file.name,
      file_size: file.size.toString(),
      how_added: "UPLOADED",
      added_by: user.id,
      experiment_id: experiment.id,
      storageKey,
    });
    if (dbError) {
      alert("DB insert failed: " + dbError.message);
      setIsUploadingFile(false);
      return;
    }
    // 3. Log activity
    await logExperimentActivity({
      activity_name: `File Uploaded: ${file.name}`,
      activity_type: "file_uploaded",
      performed_by: user.id,
      experiment_id: experiment.id,
    });
    // 4. Refresh file list
    fetchExperimentFiles();
    setIsUploadingFile(false);
  };

  // Fetch lab materials when modal opens
  useEffect(() => {
    if (addFromLabDialogOpen && experiment?.lab_id) {
      setIsFetchingLabMaterials(true);
      supabase
        .from("files")
        .select("*")
        .eq("labID", experiment.lab_id)
        .order("filename", { ascending: true })
        .then(({ data, error }) => {
          setIsFetchingLabMaterials(false);
          if (error) {
            setLabMaterials([]);
            return;
          }
          setLabMaterials(data || []);
        });
    }
  }, [addFromLabDialogOpen, experiment?.lab_id]);

  // Helper to log experiment activity
  const logExperimentActivity = async ({ activity_name, activity_type, performed_by, experiment_id }: { activity_name: string, activity_type: string, performed_by: string, experiment_id: number }) => {
    const activity_id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    await supabase.from('experiment_activity').insert([
      {
        activity_id,
        activity_name,
        activity_type,
        performed_by,
        experiment_id,
        created_at: new Date().toISOString(),
      }
    ]);
  };

  // Helper to get creator contributor
  const creatorContributor = contributors.find(c => c.added_when === "CREATED");
  const isCurrentUserCreator = creatorContributor && creatorContributor.user_id === user?.id;

  // Remove contributor handler
  const handleRemoveContributor = async (contributor: any) => {
    if (!experiment?.id || !user?.id) return;
    setRemovingContributorId(contributor.user_id);
    try {
      await supabase.from("experiment_contributors").delete().eq("user_id", contributor.user_id).eq("experiment_id", experiment.id);
      // Log activity
      await logExperimentActivity({
        activity_name: `Contributor Removed: ${contributor.profile?.username || contributor.user_id}`,
        activity_type: "contributor_removed",
        performed_by: user.id,
        experiment_id: experiment.id,
      });
      // Update contributors state
      setContributors(prev => prev.filter(c => c.user_id !== contributor.user_id));
    } catch (err: any) {
      alert("Failed to remove contributor: " + (err.message || "Unknown error"));
    } finally {
      setRemovingContributorId(null);
    }
  };

  if (loading) return <div>Loading...</div>
  if (!experiment) return <div>Experiment not found.</div>

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href={`/lab/${experiment.lab_id}`} className="flex items-center text-sm hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Lab
        </Link>
      </div>

      <div className="flex flex-col space-y-6">
        {/* Experiment Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FlaskConical className="h-7 w-7 text-accent" />
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                {experiment.name}
                {experiment.closed_status == null && (
                  <span className="flex items-center ml-2">
                    <span className="h-3 w-3 rounded-full bg-green-500 animate-blink mr-2"></span>
                    <span className="text-green-500 font-semibold text-xs tracking-wide">LIVE</span>
                  </span>
                )}
              </h1>
              </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {experiment.categories?.map((category: string, idx: number) => {
                const variant = category.toLowerCase().replace(/\s+/g, '-');
                return (
                <Badge
                    key={idx}
                    variant={variant as any}
                    className="mr-2 mb-2 text-xs"
                >
                    {getCategoryLabel(category)}
                </Badge>
                );
              })}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Started: {experiment.created_at ? new Date(experiment.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "-"}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>Running: {runningTime}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button
              variant="outline"
              className="border-accent text-accent hover:bg-secondary"
              onClick={() => router.push(`/newexperiments/${experiment.id}/conclude`)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Conclude Experiment
            </Button>
          </div>
        </div>

        {/* Experiment Content */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full bg-secondary">
            <TabsTrigger value="overview" className="data-[state=active]:bg-accent data-[state=active]:text-primary-foreground">OVERVIEW</TabsTrigger>
            <TabsTrigger value="files" className="data-[state=active]:bg-accent data-[state=active]:text-primary-foreground">FILES</TabsTrigger>
            <TabsTrigger value="timeline" className="data-[state=active]:bg-accent data-[state=active]:text-primary-foreground">TIMELINE</TabsTrigger>
            <TabsTrigger value="discussion" className="data-[state=active]:bg-accent data-[state=active]:text-primary-foreground">DISCUSSION</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Objective</CardTitle>
                {!isEditingObjective && contributors.some(c => c.user_id === user?.id) && (
                  <button
                    className="ml-2 p-1 rounded hover:bg-secondary"
                    onClick={handleEditObjective}
                    aria-label="Edit Objective"
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </CardHeader>
              <CardContent>
                {isEditingObjective ? (
                  <div className="space-y-2">
                    <textarea
                      className="w-full min-h-[80px] p-2 border rounded"
                      value={editedObjective}
                      onChange={e => setEditedObjective(e.target.value)}
                      disabled={isSavingObjective}
                    />
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={handleSaveObjective} disabled={isSavingObjective}>
                        {isSavingObjective ? "Saving..." : "Save"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEditObjective} disabled={isSavingObjective}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                <p>{experiment.objective}</p>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle>Contributors</CardTitle>
                  {contributors.some(c => c.user_id === user?.id) && (
                    <Button variant="outline" size="sm" className="h-8" onClick={() => setIsAddContributorOpen(true)}>
                      Add Contributor
                  </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contributors.length === 0 && <div className="text-muted-foreground">No contributors yet.</div>}
                    {contributors.map((contributor: any) => {
                      console.log('[Contributors] Rendering contributor:', contributor);
                      return (
                        <div key={contributor.user_id} className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={contributor.profile?.profilePic || "/placeholder.svg"} alt={contributor.profile?.username || contributor.user_id} />
                            <AvatarFallback>{(contributor.profile?.username || contributor.user_id || "U").charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            {contributor.profile?.username ? (
                              <Link href={`/profile/${contributor.profile.username}`} className="font-medium text-accent hover:underline">
                                {contributor.profile.username}
                              </Link>
                            ) : (
                              <span className="font-medium">{contributor.user_id}</span>
                            )}
                            <Badge variant={contributor.added_when === "CREATED" ? "default" : "outline"} className="ml-2 text-xs">
                              {contributor.added_when}
                            </Badge>
                        </div>
                        {/* Remove button: only show if current user is creator, and not for the creator themselves */}
                        {isCurrentUserCreator && contributor.added_when !== "CREATED" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="ml-2"
                            disabled={removingContributorId === contributor.user_id}
                            onClick={() => handleRemoveContributor(contributor)}
                          >
                            {removingContributorId === contributor.user_id ? "Removing..." : "Remove"}
                          </Button>
                        )}
                      </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle>Recent Activity</CardTitle>
                  <Button variant="outline" size="sm" className="h-8" onClick={() => setActiveTab("timeline")}>View Timeline</Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {experimentActivityEvents.slice(0, 3).map((event) => (
                      <div key={event.id} className="relative pl-8">
                        {/* Event dot */}
                        <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <span>{event.date}</span>
                            {event.user && (
                              <span className="flex items-center ml-3 gap-1">
                                <img
                                  src={event.user.profilePic || "/placeholder.svg"}
                                  alt={event.user.username}
                                  className="w-5 h-5 rounded-full object-cover border border-secondary"
                                />
                                <span className="font-mono text-xs text-white/80">@{event.user.username}</span>
                              </span>
                            )}
                                </div>
                          <h3 className="font-medium">{event.activity_name}</h3>
                          <p className="text-xs text-muted-foreground">{event.activity_type}</p>
                            </div>
                        </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            </div>
          </TabsContent>

          <TabsContent value="files" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Experiment Files</CardTitle>
                <div className="flex gap-2">
                  {/* Only contributors can upload files */}
                  {contributors.some(c => c.user_id === user?.id) && (
                    <>
                      <input
                        type="file"
                        id="experiment-upload-file"
                        className="hidden"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            handleExperimentFileUpload(e.target.files[0]);
                            e.target.value = "";
                          }
                        }}
                        disabled={isUploadingFile}
                      />
                      <Button asChild className="bg-accent text-primary-foreground hover:bg-accent/90" disabled={isUploadingFile}>
                        <label htmlFor="experiment-upload-file">
                          Upload File
                        </label>
                      </Button>
                    </>
                  )}
                  <Button variant="outline" onClick={() => setAddFromLabDialogOpen(true)}>
                    <FileText className="h-4 w-4 mr-2" />
                    Add from Lab Materials
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <FileList
                  files={experimentFiles}
                  experimentId={experiment.id}
                  onViewFile={(file) => {
                    setSelectedFile(file);
                    setFileViewerOpen(true);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <Card className="bg-[#0c1138] text-white border-none">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>EXPERIMENT TIMELINE</CardTitle>
                  <p className="text-white/70 text-sm mt-1">History of events and milestones</p>
                </div>
                {contributors.some(c => c.user_id === user?.id) && (
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                  onClick={() => setCustomEventDialogOpen(true)}
                >
                  ADD CUSTOM EVENT
                </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {experimentActivityEvents.map((event) => (
                    <div key={event.id} className="relative pl-8">
                      {/* Event dot */}
                      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span>{event.date}</span>
                          {event.user && (
                            <span className="flex items-center ml-3 gap-1">
                              <img
                                src={event.user.profilePic || "/placeholder.svg"}
                                alt={event.user.username}
                                className="w-5 h-5 rounded-full object-cover border border-secondary"
                              />
                              <span className="font-mono text-xs text-white/80">@{event.user.username}</span>
                            </span>
                          )}
                        </div>
                        <h3 className="font-medium">{event.activity_name}</h3>
                        <p className="text-xs text-muted-foreground">{event.activity_type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discussion" className="space-y-6">
            <Card className="flex flex-col rounded-lg border shadow-lg overflow-hidden w-full h-[500px]">
              {/* Chat Header */}
              <div className="bg-secondary/50 p-4 flex items-center justify-between border-b border-secondary">
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 text-accent mr-2" />
                  <h3 className="font-medium text-lg">Discussion</h3>
                  <Badge className="ml-2 bg-accent text-primary-foreground text-xs">LIVE</Badge>
                </div>
              </div>
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 bg-card">
                {discussionMessages.length === 0 && (
                  <div className="text-muted-foreground text-center py-8">No messages yet. Start the discussion!</div>
                )}
                {discussionMessages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src={msg.userInfo?.profilePic || "/placeholder.svg"} alt={msg.userInfo?.username || "User"} />
                      <AvatarFallback>{(msg.userInfo?.username || "U").charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link href={`/profile/${msg.userInfo?.username || msg.user}`}
                          className="font-mono font-semibold text-accent hover:underline text-sm">
                          @{msg.userInfo?.username || msg.user}
                        </Link>
                        <span className="text-xs text-muted-foreground">{msg.created_at ? new Date(msg.created_at).toLocaleString() : ""}</span>
                          </div>
                      <div className="mt-1 text-sm whitespace-pre-line bg-secondary/60 rounded-lg px-3 py-2 shadow-sm">
                        {msg.text_content}
                        </div>
                      {msg.file && msg.file.length > 0 && (
                        <div className="mt-2 flex flex-col gap-1">
                          {msg.file.map((filename: string, idx: number) => (
                            <a
                              key={idx}
                              href="#"
                              onClick={async (e) => {
                                e.preventDefault();
                                const { data } = await supabase
                                  .storage
                                  .from('experiment-message-files')
                                  .createSignedUrl(msg.storageKey[idx], 60, { download: true });
                                if (data?.signedUrl) {
                                  window.open(data.signedUrl, '_blank');
                                }
                              }}
                              className="text-xs text-blue-500 underline flex items-center gap-1"
                            >
                              <Paperclip className="h-4 w-4 inline" />
                              {filename}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* Chat Input Area */}
              {user && (
                <div className="p-4 border-t border-secondary bg-card">
                  <div className="flex items-end gap-2">
                    <input
                      type="file"
                      id="discussion-file"
                      className="hidden"
                      multiple
                      onChange={e => {
                        if (!e.target.files) return;
                        const selected = Array.from(e.target.files);
                        setNewFiles(prev => {
                          // Filter out duplicates by name and size
                          const all = [...prev, ...selected];
                          const unique = all.filter((file, idx, arr) =>
                            arr.findIndex(f => f.name === file.name && f.size === file.size) === idx
                          );
                          return unique;
                        });
                        // Reset input value so the same file can be selected again if needed
                        e.target.value = "";
                      }}
                    />
                    <Button asChild variant="ghost" size="icon" className="shrink-0" title="Attach file">
                      <label htmlFor="discussion-file">
                        <Paperclip className="h-5 w-5" />
                      </label>
                    </Button>
                    <textarea
                      className="flex-1 resize-none border rounded p-2 min-h-[40px] max-h-[120px] text-sm bg-background"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      rows={1}
                      disabled={isSending}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={isSending || (!newMessage && newFiles.length === 0)}
                      className="shrink-0 bg-accent text-primary-foreground hover:bg-accent/90"
                    >
                      <Send className="h-4 w-4" />
                        </Button>
                  </div>
                  {/* Attached Files Preview */}
                  {newFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 w-full">
                      {newFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center bg-secondary/80 rounded-full px-3 py-1 text-xs font-medium shadow border border-secondary">
                          <FileIcon className="h-4 w-4 mr-1 text-accent" />
                          <span className="mr-2">{file.name}</span>
                          <span className="mr-2 text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                          <button
                            type="button"
                            className="ml-1 text-muted-foreground hover:text-red-500 focus:outline-none"
                            onClick={() => setNewFiles(newFiles.filter((_, i) => i !== idx))}
                            title="Remove file"
                          >
                            <X className="h-3 w-3" />
                          </button>
                      </div>
                    ))}
                  </div>
                  )}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Custom Event Dialog */}
      <CustomEventDialog
        open={customEventDialogOpen}
        onOpenChange={setCustomEventDialogOpen}
        experimentId={experiment.id}
        onAddEvent={handleAddCustomEvent}
      />

      {/* Add Contributor Dialog */}
      <Dialog open={isAddContributorOpen} onOpenChange={setIsAddContributorOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Contributor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="contributor-search">Search Users</Label>
              <Input
                id="contributor-search"
                placeholder="Search by username"
                value={contributorSearch}
                onChange={e => handleContributorSearch(e.target.value)}
              />
            </div>
            <div className="border rounded-md">
              <div className="p-4 border-b">
                <p className="font-medium">Search Results</p>
              </div>
              <div className="p-2">
                {contributorSearch && searchResults.length === 0 && <p className="text-sm text-muted-foreground p-2">No users found.</p>}
                {searchResults.map((profile: any) => (
                  <div
                    key={profile.user_id}
                    className="flex items-center gap-3 p-2 hover:bg-secondary rounded-md cursor-pointer"
                    onClick={() => handleAddContributor(profile)}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile.profilePic || "/placeholder.svg"} alt={profile.username} />
                      <AvatarFallback>{(profile.username || "U").charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{profile.username}</p>
                    </div>
                    <Button size="sm" className="ml-auto" disabled={isAddingContributor}>
                      {isAddingContributor ? "Adding..." : "Add"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddContributorOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add from Lab Materials Dialog */}
      <Dialog open={addFromLabDialogOpen} onOpenChange={setAddFromLabDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Add from Lab Materials</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input placeholder="Search lab materials..." />
            <ScrollArea className="h-[300px] border rounded-md">
              <div className="divide-y">
                {isFetchingLabMaterials ? (
                  <div className="p-4 text-center text-muted-foreground">Loading lab materials...</div>
                ) : labMaterials.filter(file => file.filename !== ".keep").length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">No lab materials found.</div>
                ) : (
                  labMaterials.filter(file => file.filename !== ".keep").map((file) => (
                    <div
                      key={file.id}
                      className={`flex items-center justify-between p-3 hover:bg-secondary/50 cursor-pointer ${selectedLabFiles.includes(file.id) ? "bg-accent/10" : ""}`}
                      onClick={() => toggleLabFileSelection(file.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                          <FileIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">{file.filename}</h4>
                          <p className="text-xs text-muted-foreground">
                            {file.fileSize || file.size || ""} • Uploaded {file.date || ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div
                          className={`w-5 h-5 rounded-sm border flex items-center justify-center ${selectedLabFiles.includes(file.id) ? "bg-accent border-accent text-white" : "border-input"}`}
                        >
                          {selectedLabFiles.includes(file.id) && <CheckCircle className="h-3 w-3" />}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{selectedLabFiles.length} file(s) selected</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLabFiles([])}
                disabled={selectedLabFiles.length === 0}
              >
                Clear Selection
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddFromLabDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFromLab} disabled={selectedLabFiles.length === 0 || isAddingFromLab}>
              {isAddingFromLab ? "Adding..." : "Add Selected Files"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedFile && (
        <FileViewerDialog
          file={selectedFile}
          isOpen={fileViewerOpen}
          onClose={() => setFileViewerOpen(false)}
          userRole={contributors.some(c => c.user_id === user?.id) ? "admin" : "user"}
          labId={experiment.lab_id}
        />
      )}
    </div>
  )
}
