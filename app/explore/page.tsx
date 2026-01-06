"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Search,
  Building2,
  FileText,
  SlidersHorizontal,
  ChevronDown,
  X,
  ArrowUpDown,
  FlaskRoundIcon as Flask,
  Users,
  DollarSign,
  Circle,
  Star,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { supabase } from "@/lib/supabase"
import { researchAreas, scienceCategoryColors } from "@/lib/research-areas"
import { useAuth } from "@/components/auth-provider"
import { createPortal } from "react-dom"
import { differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns"
import { LoadingAnimation } from "@/components/loading-animation"
import { Video, Loader2 } from "lucide-react"

// Thumbnail generation functions for Experiment Engine
const generateVideoThumbnail = async (videoUrl: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    
    const timeout = setTimeout(() => {
      resolve(null);
    }, 10000);
    
    video.onloadedmetadata = () => {
      const seekTime = Math.min(1, video.duration * 0.1);
      video.currentTime = seekTime;
    };
    
    video.onseeked = () => {
      clearTimeout(timeout);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(null);
        return;
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
      resolve(thumbnail);
    };
    
    video.onerror = () => {
      clearTimeout(timeout);
      resolve(null);
    };
    
    video.src = videoUrl;
  });
};

const getFirstVideoSegment = async (experimentId: string): Promise<string | null> => {
  try {
    const response = await fetch(`/api/experiment-engine/video-segment?experimentId=${experimentId}`);
    if (!response.ok) {
      return null;
    }
    const result = await response.json();
    return result.data?.videoUrl || null;
  } catch (error) {
    console.debug('[Thumbnail] Error getting video segment:', error);
    return null;
  }
};

const getConcludedVideoUrl = async (experimentId: string): Promise<string | null> => {
  try {
    const response = await fetch(`/api/experiment-engine/concluded-video?experimentId=${experimentId}`);
    if (!response.ok) {
      return null;
    }
    const result = await response.json();
    return result.data?.videoUrl || null;
  } catch (e) {
    console.debug('[Thumbnail] Error getting concluded video:', e);
    return null;
  }
};


// Sample data for live experiments
const experimentsData = [
  {
    id: 1,
    name: "Cognitive Response Patterns",
    description: "Collecting data on cognitive responses to visual stimuli across different demographics",
    categories: ["neuroscience", "cognitive-science", "psychology"],
    lab: "Neuroscience Lab",
    institution: "University Research Center",
    participantsNeeded: 500,
    participantsCurrent: 213,
    deadline: "2024-08-15",
    compensation: "$25 per session",
    timeCommitment: "30 minutes",
    lastUpdated: "2 days ago",
  },
  {
    id: 2,
    name: "Quantum Computing Perception",
    description: "Survey on public understanding and perception of quantum computing applications",
    categories: ["physics", "quantum-mechanics", "public-perception"],
    lab: "Quantum Physics Lab",
    institution: "National Physics Institute",
    participantsNeeded: 1000,
    participantsCurrent: 456,
    deadline: "2024-07-30",
    compensation: "$15 per survey",
    timeCommitment: "15 minutes",
    lastUpdated: "5 days ago",
  },
  {
    id: 3,
    name: "Genomic Data Collection",
    description: "Collecting anonymous genomic data for diversity research in genetics",
    categories: ["biology", "genomics", "diversity-studies"],
    lab: "Genomics Research Group",
    institution: "Biotech University",
    participantsNeeded: 2000,
    participantsCurrent: 879,
    deadline: "2024-09-30",
    compensation: "$50 per sample",
    timeCommitment: "1 hour",
    lastUpdated: "1 week ago",
  },
  {
    id: 4,
    name: "AI Bias Detection",
    description: "Crowdsourced identification of bias in AI-generated content",
    categories: ["ai", "ethics", "bias-studies"],
    lab: "AI Ethics Lab",
    institution: "Tech Institute",
    participantsNeeded: 5000,
    participantsCurrent: 2145,
    deadline: "2024-10-15",
    compensation: "$0.50 per review",
    timeCommitment: "5 minutes per review",
    lastUpdated: "3 days ago",
  },
  {
    id: 5,
    name: "Climate Change Observations",
    description: "Citizen science project collecting local climate observations",
    categories: ["environmental", "climate-science", "citizen-science"],
    lab: "Climate Science Center",
    institution: "Environmental Research Institute",
    participantsNeeded: 10000,
    participantsCurrent: 4567,
    deadline: "2024-12-31",
    compensation: "Non-paid volunteer",
    timeCommitment: "5 minutes daily",
    lastUpdated: "1 day ago",
  },
]

// Add this new component before ExplorePage
const ExpandButton = ({ 
  id, 
  expandedIds, 
  setExpandedIds, 
  position 
}: { 
  id: string; 
  expandedIds: string[]; 
  setExpandedIds: (fn: (ids: string[]) => string[]) => void;
  position: { top: number; right: number; }
}) => {
  const [mounted, setMounted] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanding(true);
    // Add a small delay before updating the expanded state
    setTimeout(() => {
      setExpandedIds(ids => [...ids, id]);
    }, 100);
  };

  return createPortal(
    <div 
      style={{
        position: 'absolute',
        top: position.top,
        right: position.right,
        zIndex: 9999,
        pointerEvents: isExpanding ? 'none' : 'auto'
      }}
    >
      <button
        type="button"
        className="text-xs text-muted-foreground font-bold px-2 py-1 rounded hover:bg-accent cursor-pointer"
        onClick={handleClick}
        title="View all categories"
      >
        ...
      </button>
    </div>,
    document.body
  );
};

// Helper to get elapsed time string for concluded experiments
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

// Add this before ExplorePage component
function MobileWarningDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <div 
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-sm"
        style={{ position: 'fixed' }}
      >
        <div className="relative w-full rounded-lg bg-background p-6 shadow-lg animate-in zoom-in-95 duration-200">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Mobile View Notice</h3>
            <p className="text-sm text-muted-foreground">
              The platform is currently only optimized for desktop view and may be difficult to use on mobile. We will be pushing a mobile optimized version soon.
            </p>
            <div className="flex justify-end">
              <Button 
                onClick={onClose}
                className="bg-accent text-primary-foreground hover:bg-accent/90 w-full sm:w-auto"
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState("labs")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortOption, setSortOption] = useState("recent")
  const [showFilters, setShowFilters] = useState(true)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [allCategories, setAllCategories] = useState<string[]>([])

  // --- Move labs state and fetching logic here ---
  const [labsData, setLabsData] = useState<any[]>([]);
  const [labsLoading, setLabsLoading] = useState(false);
  const [labsError, setLabsError] = useState<any>(null);
  const [expandedLabIds, setExpandedLabIds] = useState<string[]>([]);
  const [expandedExperimentIds, setExpandedExperimentIds] = useState<string[]>([]);

  // Add experiments state and loading state
  const [experimentsData, setExperimentsData] = useState<any[]>([]);
  const [experimentsLoading, setExperimentsLoading] = useState(false);
  const [experimentsError, setExperimentsError] = useState<any>(null);


  const [isNavigating, setIsNavigating] = useState(false)

  // Add these state variables at the top of the component
  const [showMobileWarning, setShowMobileWarning] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Get user authentication - must be before useEffect that uses it
  const { user } = useAuth();

  useEffect(() => {
    // Check if we're on mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // Initial check
    checkMobile()
    
    // Add resize listener
    window.addEventListener('resize', checkMobile)
    
    // Check if we should show the warning
    const hasSeenWarning = sessionStorage.getItem('hasSeenMobileWarning')
    if (!hasSeenWarning && window.innerWidth < 768) {
      setShowMobileWarning(true)
      sessionStorage.setItem('hasSeenMobileWarning', 'true')
    }
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleCloseWarning = () => {
    setShowMobileWarning(false)
  }

  // Fetch all data on initial load with concurrent requests
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        // Fetch labs with limited fields for faster query - public labs
        const { data: publicLabs, error: publicLabsError } = await supabase
          .from("labs")
          .select("labId, labName, description, profilePic, org_id, createdBy, created_at, public_private")
          .or("public_private.is.null,public_private.eq.public")
          .order("created_at", { ascending: false })
          .limit(50); // Limit initial load

        if (publicLabsError) throw publicLabsError;

        // If user is logged in, also fetch private labs where they are admin/founder
        let privateLabs: any[] = [];
        if (user?.id) {
          const { data: privateLabMemberships } = await supabase
            .from("labMembers")
            .select("lab_id")
            .eq("user", user.id)
            .in("role", ["admin", "founder"]);
          
          if (privateLabMemberships && privateLabMemberships.length > 0) {
            const privateLabIds = privateLabMemberships.map(m => m.lab_id);
            const { data: privateLabsData, error: privateLabsError } = await supabase
              .from("labs")
              .select("labId, labName, description, profilePic, org_id, createdBy, created_at, public_private")
              .in("labId", privateLabIds)
              .eq("public_private", "private")
              .order("created_at", { ascending: false });
            
            if (!privateLabsError && privateLabsData) {
              privateLabs = privateLabsData;
            }
          }
        }

        // Merge public and private labs, deduplicate by labId
        const allLabsMap = new Map();
        (publicLabs || []).forEach(lab => allLabsMap.set(lab.labId, lab));
        privateLabs.forEach(lab => allLabsMap.set(lab.labId, lab));
        const labs = Array.from(allLabsMap.values());

        // Fetch lab categories
        const labIds = labs.map(l => l.labId);
        let categoriesMap: Record<string, string[]> = {};
        if (labIds.length > 0) {
          const { data: labCategories } = await supabase
            .from("labCategories")
            .select("lab_id, category");
          if (labCategories) {
            labCategories.forEach(cat => {
              if (!categoriesMap[cat.lab_id]) categoriesMap[cat.lab_id] = [];
              categoriesMap[cat.lab_id].push(cat.category);
            });
          }
        }

        // Fetch org info
        const orgIds = [...new Set(labs.map(l => l.org_id).filter(Boolean))];
        let orgMap: Record<string, any> = {};
        if (orgIds.length > 0) {
          const { data: orgs } = await supabase
            .from("organizations")
            .select("org_id, org_name, profilePic, slug")
            .in("org_id", orgIds);
          if (orgs) {
            orgs.forEach(o => { orgMap[o.org_id] = o });
          }
        }

        // Fetch members count, funding, experiments, and files in parallel for performance
        const [membersData, fundingData, experimentsCountData, filesData] = await Promise.all([
          labIds.length > 0 ? supabase.from("labMembers").select("lab_id").in("lab_id", labIds) : Promise.resolve({ data: [], error: null }),
          labIds.length > 0 ? supabase.from("funding_goals").select("lab_id, amount_contributed, goal_amount") : Promise.resolve({ data: [], error: null }),
          labIds.length > 0 ? supabase.from("experiments").select("lab_id") : Promise.resolve({ data: [], error: null }),
          labIds.length > 0 ? supabase.from("files").select("labID, fileTag") : Promise.resolve({ data: [], error: null })
        ]);

        // Process members
        let membersMap: Record<string, number> = {};
        if (membersData.data) {
          membersData.data.forEach((m: any) => {
            membersMap[m.lab_id] = (membersMap[m.lab_id] || 0) + 1;
          });
        }

        // Process funding
        let fundingMap: Record<string, { goal: number, raised: number }> = {};
        if (fundingData.data) {
          fundingData.data.forEach((fg: any) => {
            if (!fundingMap[fg.lab_id]) fundingMap[fg.lab_id] = { goal: 0, raised: 0 };
            fundingMap[fg.lab_id].goal += fg.goal_amount || 0;
            fundingMap[fg.lab_id].raised += fg.amount_contributed || 0;
          });
        }

        // Process experiments count (manual experiments)
        let experimentsMap: Record<string, number> = {};
        if (experimentsCountData.data) {
          experimentsCountData.data.forEach((e: any) => {
            experimentsMap[e.lab_id] = (experimentsMap[e.lab_id] || 0) + 1;
          });
        }

        // Process lab files count
        let labFilesMap: Record<string, number> = {};
        if (filesData.data) {
          filesData.data.forEach((f: any) => {
            if (f.fileTag !== 'folder') {
              labFilesMap[f.labID] = (labFilesMap[f.labID] || 0) + 1;
            }
          });
        }

        // Map labs data (before fetching experiments, so we can add Experiment Engine count later)
        let mappedLabs = labs.map(lab => ({
          id: lab.labId,
          name: lab.labName,
          description: lab.description,
          categories: categoriesMap[lab.labId] || [],
          pi: '',
          creatorId: lab.createdBy,
          institution: orgMap[lab.org_id]?.org_name || '',
          orgProfilePic: orgMap[lab.org_id]?.profilePic || '',
          org_id: lab.org_id,
          org_slug: orgMap[lab.org_id]?.slug || '',
          members: membersMap[lab.labId] || 0,
          files: labFilesMap[lab.labId] || 0,
          fundingGoal: fundingMap[lab.labId]?.goal || 0,
          fundingCurrent: fundingMap[lab.labId]?.raised || 0,
          projects: experimentsMap[lab.labId] || 0, // Will be updated with Experiment Engine count
          publications: 0,
          lastUpdated: lab.created_at ? `${Math.round((Date.now() - new Date(lab.created_at).getTime()) / (1000*60*60*24))} days ago` : '',
          image: lab.profilePic || '/placeholder.svg?height=80&width=80',
        }));

        // Fetch experiments with limits for performance
        let { data: experiments, error: experimentsError } = await supabase
          .from("experiments")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50); // Limit initial load

        if (experimentsError) throw experimentsError;

        // Fetch public Experiment Engine experiments
        let experimentEngineExps: any[] = [];
        try {
          const response = await fetch('/api/experiment-engine/public-experiments');
          if (response.ok) {
            const { data: expEngineData } = await response.json();
            experimentEngineExps = (expEngineData || []).map((exp: any) => ({
              ...exp,
              is_experiment_engine: true
            }));
            
            // Add Experiment Engine experiments to the count
            experimentEngineExps.forEach((exp: any) => {
              if (exp.lab_id) {
                experimentsMap[exp.lab_id] = (experimentsMap[exp.lab_id] || 0) + 1;
              }
            });
          }
        } catch (err) {
          console.error('Error fetching Experiment Engine experiments:', err);
        }

        // Filter out experiments from private labs (unless user is admin/founder)
        if (experiments && experiments.length > 0) {
          const experimentLabIds = [...new Set(experiments.map((e: any) => e.lab_id).filter(Boolean))]
          
          // Fetch lab visibility for all experiment labs
          const { data: experimentLabs } = await supabase
            .from("labs")
            .select("labId, public_private")
            .in("labId", experimentLabIds)
          
          // Get private lab IDs
          const privateLabIds = new Set(
            (experimentLabs || [])
              .filter((lab: any) => lab.public_private === 'private')
              .map((lab: any) => lab.labId)
          )
          
          // If user is logged in, get labs where they are admin/founder
          let accessiblePrivateLabIds = new Set<string>();
          if (user?.id && privateLabIds.size > 0) {
            const { data: accessibleMemberships } = await supabase
              .from("labMembers")
              .select("lab_id")
              .eq("user", user.id)
              .in("role", ["admin", "founder"])
              .in("lab_id", Array.from(privateLabIds));
            
            if (accessibleMemberships) {
              accessiblePrivateLabIds = new Set(accessibleMemberships.map(m => m.lab_id));
            }
          }
          
          // Filter out experiments from private labs (unless user has access)
          experiments = experiments.filter((exp: any) => {
            if (!privateLabIds.has(exp.lab_id)) return true; // Public lab, show it
            return accessiblePrivateLabIds.has(exp.lab_id); // Private lab, only show if user has access
          })
        }

        // Fetch experiment contributors - fetch separately to avoid foreign key join issues
        let contributorsMap: Record<string, any[]> = {};
        if (experiments && experiments.length > 0) {
          const { data: contributors } = await supabase
            .from("experiment_contributors")
            .select("experiment_id, user_id");
          if (contributors && contributors.length > 0) {
            const userIds = [...new Set(contributors.map((c: any) => c.user_id).filter(Boolean))];
            let profileMap: Record<string, any> = {};
            if (userIds.length > 0) {
              const { data: profiles } = await supabase
                .from("profiles")
                .select("user_id, username, profilePic")
                .in("user_id", userIds);
              if (profiles) {
                profiles.forEach((p: any) => {
                  profileMap[p.user_id] = p;
                });
              }
            }
            contributors.forEach((c: any) => {
              if (!contributorsMap[c.experiment_id]) contributorsMap[c.experiment_id] = [];
              contributorsMap[c.experiment_id].push({
                ...c,
                profile: profileMap[c.user_id] || null,
              });
            });
          }
        }

        // Fetch experiment files from experiment_files table
        let experimentFilesMap: Record<string, any[]> = {};
        if (experiments && experiments.length > 0) {
          const experimentIds = experiments.map((e: any) => e.id);
          const { data: files, error: filesError } = await supabase
            .from("experiment_files")
            .select("id, file, file_name, storageKey, experiment_id, created_at")
            .in("experiment_id", experimentIds);
          if (filesError) {
            // Silently handle error - table might not exist or have RLS issues
            console.debug('Error fetching experiment files (non-critical):', filesError);
          } else if (files) {
            files.forEach(f => {
              if (!experimentFilesMap[f.experiment_id]) experimentFilesMap[f.experiment_id] = [];
              experimentFilesMap[f.experiment_id].push({
                id: f.id,
                name: f.file_name || f.file,
                file_path: f.storageKey,
                created_at: f.created_at,
              });
            });
          }
        }

        // Update mappedLabs with the combined experiment count (manual + Experiment Engine)
        mappedLabs = mappedLabs.map(lab => ({
          ...lab,
          projects: experimentsMap[lab.id] || 0,
        }));

        // After mapping mappedLabs:
        const labInfoMap: Record<string, any> = {};
        mappedLabs.forEach(lab => {
          labInfoMap[lab.id] = {
            name: lab.name,
            image: lab.image,
          };
        });

        // Merge regular experiments with Experiment Engine experiments
        const allExperiments = [...(experiments || []), ...experimentEngineExps];

        // Get labs where user is admin/founder (for filtering experiments)
        let adminLabIds = new Set<string>();
        if (user?.id && allExperiments.length > 0) {
          const allLabIds = [...new Set(allExperiments.map((e: any) => e.lab_id).filter(Boolean))];
          if (allLabIds.length > 0) {
            const { data: adminMemberships } = await supabase
              .from("labMembers")
              .select("lab_id")
              .eq("user", user.id)
              .in("role", ["admin", "founder"])
              .in("lab_id", allLabIds);
            
            if (adminMemberships) {
              adminLabIds = new Set(adminMemberships.map(m => m.lab_id));
            }
          }
        }

        // Map experiments data - handle both regular and Experiment Engine experiments
        const mappedExperiments = allExperiments
          .map((exp: any) => {
            // For Experiment Engine experiments, use the lab info from the API response
            const labInfo = exp.is_experiment_engine 
              ? { name: exp.labName || "", image: exp.labProfilePic || "/placeholder.svg" }
              : (labInfoMap[exp.lab_id] || {});
            
            return {
              id: exp.id || exp.experiment_id,
              experiment_id: exp.experiment_id,
              name: exp.name || exp.experiment_name,
              description: exp.description || "",
              objective: exp.objective || exp.experiment_objective || "",
              categories: Array.isArray(exp.categories) ? exp.categories : [],
              lab: exp.lab_id,
              labId: exp.lab_id,
              labName: labInfo.name || exp.labName || "",
              labProfilePic: labInfo.image || exp.labProfilePic || "/placeholder.svg",
              participantsNeeded: exp.participants_needed || 0,
              participantsCurrent: exp.participants_current || 0,
              deadline: exp.deadline,
              compensation: exp.compensation || "No compensation",
              timeCommitment: exp.time_commitment || "Not specified",
              lastUpdated: exp.created_at ? `${Math.round((Date.now() - new Date(exp.created_at).getTime()) / (1000*60*60*24))} days ago` : "",
              status: exp.status || exp.experiment_status || "DRAFT",
              closed_status: exp.closed_status || (exp.experiment_status === 'concluded' ? 'CLOSED' : null),
              end_date: exp.end_date,
              created_at: exp.created_at,
              created_by: exp.created_by || exp.created_by_user_id,
              contributors: contributorsMap[exp.id] || [],
              files: experimentFilesMap[exp.id] || [],
              is_experiment_engine: exp.is_experiment_engine || false,
              experiment_status: exp.experiment_status,
            };
          })
          .filter((exp: any) => {
            // Manual experiments (non-Experiment Engine) are always shown
            if (!exp.is_experiment_engine) {
              return true;
            }
            
            // For Experiment Engine experiments:
            // If user is admin/founder of the lab, show all experiments
            if (user?.id && exp.labId && adminLabIds.has(exp.labId)) {
              return true;
            }
            
            // For outside users, only show concluded Experiment Engine experiments
            return exp.experiment_status === 'concluded';
          });

        // After fetching all data, collect unique categories
        const uniqueCategories = new Set<string>();
        
        // Add lab categories
        mappedLabs.forEach(lab => {
          if (Array.isArray(lab.categories)) {
            lab.categories.forEach(cat => uniqueCategories.add(cat));
          }
        });

        // Add experiment categories
        mappedExperiments.forEach(exp => {
          if (Array.isArray(exp.categories)) {
            exp.categories.forEach(cat => uniqueCategories.add(cat));
          }
        });

        // Set all unique categories
        setAllCategories(Array.from(uniqueCategories).sort());

        // Set the data
        setLabsData(mappedLabs);
        setExperimentsData(mappedExperiments);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [user?.id]); // Re-fetch when user changes

  // Science categories with their corresponding badge classes
  const scienceCategories = {
    neuroscience: "badge-neuroscience",
    ai: "badge-ai",
    biology: "badge-biology",
    chemistry: "badge-chemistry",
    physics: "badge-physics",
    medicine: "badge-medicine",
    psychology: "badge-psychology",
    engineering: "badge-engineering",
    mathematics: "badge-mathematics",
    environmental: "badge-environmental",
    astronomy: "badge-astronomy",
    geology: "badge-geology",
    "brain-mapping": "badge-neuroscience",
    "cognitive-science": "badge-psychology",
    "quantum-mechanics": "badge-physics",
    "particle-physics": "badge-physics",
    genomics: "badge-biology",
    bioinformatics: "badge-biology",
    ethics: "badge-psychology",
    "computer-science": "badge-ai",
    "climate-science": "badge-environmental",
    "data-analysis": "badge-mathematics",
    "molecular-biology": "badge-biology",
    biochemistry: "badge-chemistry",
    astrophysics: "badge-astronomy",
    cosmology: "Cosmology",
    "clinical-research": "badge-medicine",
    biotechnology: "Biotechnology",
    "medical-imaging": "badge-medicine",
    meteorology: "badge-environmental",
    "machine-learning": "Machine Learning",
    optimization: "badge-mathematics",
    "data-processing": "Data Processing",
    "data-visualization": "Data Visualization",
    methodology: "badge-default",
    computing: "badge-ai",
    evaluation: "badge-default",
    innovation: "badge-default",
    "research-funding": "badge-default",
    governance: "badge-default",
    mitigation: "badge-environmental",
    "diversity-studies": "badge-default",
    "public-perception": "badge-psychology",
    "citizen-science": "badge-default",
    "bias-studies": "badge-ai",
  }

  // Category labels
  const categoryLabels: Record<string, string> = {
    neuroscience: "Neuroscience",
    ai: "AI",
    biology: "Biology",
    chemistry: "Chemistry",
    physics: "Physics",
    medicine: "Medicine",
    psychology: "Psychology",
    engineering: "Engineering",
    mathematics: "Mathematics",
    environmental: "Environmental",
    astronomy: "Astronomy",
    geology: "Geology",
    "brain-mapping": "Brain Mapping",
    "cognitive-science": "Cognitive Science",
    "quantum-mechanics": "Quantum Mechanics",
    "particle-physics": "Particle Physics",
    genomics: "Genomics",
    bioinformatics: "Bioinformatics",
    ethics: "Ethics",
    "computer-science": "Computer Science",
    "climate-science": "Climate Science",
    "data-analysis": "Data Analysis",
    "molecular-biology": "Molecular Biology",
    biochemistry: "Biochemistry",
    astrophysics: "Astrophysics",
    cosmology: "Cosmology",
    "clinical-research": "Clinical Research",
    biotechnology: "Biotechnology",
    "medical-imaging": "Medical Imaging",
    meteorology: "Meteorology",
    "machine-learning": "Machine Learning",
    optimization: "Optimization",
    "data-processing": "Data Processing",
    "data-visualization": "Data Visualization",
    methodology: "Methodology",
    computing: "Computing",
    evaluation: "Evaluation",
    innovation: "Innovation",
    "research-funding": "Research Funding",
    governance: "Governance",
    mitigation: "Mitigation",
    "diversity-studies": "Diversity Studies",
    "public-perception": "Public Perception",
    "citizen-science": "Citizen Science",
    "bias-studies": "Bias Studies",
  }

  const getSortOptions = () => {
    return [
      { value: "recent", label: "Most Recent" },
      { value: "deadline", label: "Deadline (Soonest)" },
      { value: "funding", label: "Funding Progress" },
      { value: "amount", label: "Amount (Highest)" },
      { value: "participation", label: "Needs Participants" },
    ]
  }

  // Get data for the current tab
  const getCurrentData = () => {
    switch (activeTab) {
      case "experiments":
        return experimentsData;
      case "labs":
        return labsData;
      default:
        return labsData;
    }
  }

  // Filter data based on search query and selected categories
  const filterData = useCallback(
    (data: any[]) => {
      return data.filter((item) => {
        // Search filter - handle different item types
        const matchesSearch =
          searchQuery === "" ||
          (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.username || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.bio || "").toLowerCase().includes(searchQuery.toLowerCase())

        // Category filter
        const matchesCategory =
          selectedCategories.length === 0 ||
          (item.categories && Array.isArray(item.categories) && item.categories.length > 0 && item.categories.some((cat: string) => selectedCategories.includes(cat)))

        return matchesSearch && matchesCategory
      })
    },
    [searchQuery, selectedCategories, activeTab],
  )

  // Sort data based on selected sort option
  const sortData = useCallback(
    (data: any[]) => {
      if (sortOption === "recent") {
        // Sort by last updated (most recent first)
        return [...data].sort((a, b) => {
          if (!a.lastUpdated || !b.lastUpdated) return 0
          if (a.lastUpdated.includes("day") && b.lastUpdated.includes("week")) return -1
          if (a.lastUpdated.includes("week") && b.lastUpdated.includes("day")) return 1

          const aDays = Number.parseInt(a.lastUpdated.split(" ")[0], 10) || 0
          const bDays = Number.parseInt(b.lastUpdated.split(" ")[0], 10) || 0

          return aDays - bDays
        })
      } else if (sortOption === "deadline") {
        // Sort by deadline (soonest first)
        return [...data].sort((a, b) => {
          if (!a.deadline) return 1
          if (!b.deadline) return -1
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        })
      } else if (sortOption === "funding") {
        // Sort by funding percentage (highest first)
        return [...data].sort((a, b) => {
          if (activeTab === "labs") {
            const aPercent = (a.fundingCurrent || 0) / (a.fundingGoal || 1) || 0
            const bPercent = (b.fundingCurrent || 0) / (b.fundingGoal || 1) || 0
            return bPercent - aPercent
          }
          return 0
        })
      } else if (sortOption === "amount") {
        // Sort by grant amount (highest first)
        return [...data].sort((a, b) => {
          if (activeTab === "grants") {
            const aAmount = Number.parseInt(a.amount.replace(/[^0-9]/g, "")) || 0
            const bAmount = Number.parseInt(b.amount.replace(/[^0-9]/g, "")) || 0
            return bAmount - aAmount
          }
          return 0
        })
      } else if (sortOption === "participation") {
        // Sort by participation percentage (lowest first, to show those needing more participants)
        return [...data].sort((a, b) => {
          if (activeTab === "experiments") {
            const aPercent = (a.participantsCurrent || 0) / (a.participantsNeeded || 1) || 0
            const bPercent = (b.participantsCurrent || 0) / (b.participantsNeeded || 1) || 0
            return aPercent - bPercent
          }
          return 0
        })
      }

      return data
    },
    [sortOption, activeTab],
  )

  // Toggle category selection
  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((cat) => cat !== category) : [...prev, category],
    )
  }, [])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSelectedCategories([])
    setSearchQuery("")
  }, [])

  // Get unique categories for the current tab
  const getUniqueCategories = useCallback(() => {
    return allCategories;
  }, [allCategories]);

  const currentData = getCurrentData()
  const filteredData = sortData(filterData(currentData))
  const uniqueCategories = getUniqueCategories()

  // Get badge class for a category - maps to CSS classes in globals.css
  const getBadgeClass = (category: string) => {
    // Direct mapping for base categories
    const directMap: Record<string, string> = {
      neuroscience: "badge-neuroscience",
      ai: "badge-ai",
      biology: "badge-biology",
      chemistry: "badge-chemistry",
      physics: "badge-physics",
      medicine: "badge-medicine",
      psychology: "badge-psychology",
      engineering: "badge-engineering",
      mathematics: "badge-mathematics",
      environmental: "badge-environmental",
      astronomy: "badge-astronomy",
      geology: "badge-geology",
    }
    
    // If direct match, use it
    if (directMap[category]) {
      return directMap[category]
    }
    
    // Map subcategories to their parent category
    const categoryMap: Record<string, string> = {
      "brain-mapping": "badge-neuroscience",
      "cognitive-science": "badge-psychology",
      "quantum-mechanics": "badge-physics",
      "particle-physics": "badge-physics",
      genomics: "badge-biology",
      bioinformatics: "badge-biology",
      ethics: "badge-psychology",
      "computer-science": "badge-ai",
      "climate-science": "badge-environmental",
      "data-analysis": "badge-mathematics",
      "molecular-biology": "badge-biology",
      biochemistry: "badge-chemistry",
      astrophysics: "badge-astronomy",
      cosmology: "badge-astronomy",
      "clinical-research": "badge-medicine",
      biotechnology: "badge-biology",
      "medical-imaging": "badge-medicine",
      meteorology: "badge-environmental",
      "machine-learning": "badge-ai",
      optimization: "badge-mathematics",
      "data-processing": "badge-mathematics",
      "data-visualization": "badge-mathematics",
      computing: "badge-ai",
      mitigation: "badge-environmental",
      "public-perception": "badge-psychology",
      "bias-studies": "badge-ai",
      "cell-biology": "badge-biology",
      genetics: "badge-biology",
      proteomics: "badge-biology",
      microbiology: "badge-biology",
      virology: "badge-biology",
      immunology: "badge-biology",
      "developmental-biology": "badge-biology",
      "evolutionary-biology": "badge-biology",
      ecology: "badge-environmental",
      "marine-biology": "badge-environmental",
      botany: "badge-environmental",
      zoology: "badge-environmental",
      "organic-chemistry": "badge-chemistry",
      "inorganic-chemistry": "badge-chemistry",
      "physical-chemistry": "badge-chemistry",
      "analytical-chemistry": "badge-chemistry",
      "medicinal-chemistry": "badge-chemistry",
      "polymer-chemistry": "badge-chemistry",
      "materials-chemistry": "badge-chemistry",
      "computational-chemistry": "badge-ai",
      "environmental-chemistry": "badge-environmental",
      "quantum-physics": "badge-physics",
      "nuclear-physics": "badge-physics",
      "condensed-matter-physics": "badge-physics",
      optics: "badge-physics",
      thermodynamics: "badge-physics",
      "fluid-dynamics": "badge-physics",
      "plasma-physics": "badge-physics",
      biophysics: "badge-biology",
      geophysics: "badge-geology",
      geochemistry: "badge-geology",
      climatology: "badge-environmental",
      oceanography: "badge-environmental",
      hydrology: "badge-environmental",
      seismology: "badge-geology",
      volcanology: "badge-geology",
      paleontology: "badge-geology",
      anatomy: "badge-medicine",
      physiology: "badge-medicine",
      pathology: "badge-medicine",
      pharmacology: "badge-medicine",
      toxicology: "badge-medicine",
      epidemiology: "badge-medicine",
      "public-health": "badge-medicine",
      cardiology: "badge-medicine",
      neurology: "badge-neuroscience",
      oncology: "badge-medicine",
      pediatrics: "badge-medicine",
      geriatrics: "badge-medicine",
      psychiatry: "badge-psychology",
      "biomedical-engineering": "badge-engineering",
      "chemical-engineering": "badge-engineering",
      "civil-engineering": "badge-engineering",
      "electrical-engineering": "badge-engineering",
      "mechanical-engineering": "badge-engineering",
      "artificial-intelligence": "badge-ai",
      robotics: "badge-ai",
      nanotechnology: "badge-ai",
      "materials-science": "badge-chemistry",
      "systems-biology": "badge-biology",
      "synthetic-biology": "badge-biology",
      "computational-biology": "badge-biology",
      "quantum-computing": "badge-physics",
      "renewable-energy": "badge-environmental",
      "sustainable-development": "badge-environmental",
      "data-science": "badge-mathematics",
      astrobiology: "badge-astronomy",
    }
    
    // Check mapped categories
    if (categoryMap[category]) {
      return categoryMap[category]
    }
    
    // Try to extract base category from hyphenated names
    const baseCategory = category.split('-')[0]
    if (directMap[baseCategory]) {
      return directMap[baseCategory]
    }
    
    // Default fallback
    return "badge-default"
  }

  // Get label for a category
  const getCategoryLabel = (category: string) => {
    const area = researchAreas.find(a => a.value === category)
    return area?.label || category
  }

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  // Calculate days remaining until deadline
  const getDaysRemaining = (dateString: string) => {
    const deadline = new Date(dateString)
    const today = new Date()
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Helper to get badge color for a category (matches lab-profile.tsx)
  const getCategoryBadgeColors = (category: string) => {
    return scienceCategoryColors[category] || { bg: "bg-[#6C757D]", text: "text-white" }
  }

  // Get inline styles for badge colors
  const getBadgeStyles = (category: string) => {
    const colors = getCategoryBadgeColors(category);
    // Extract hex color from bg class like "bg-[#9D4EDD]"
    const bgMatch = colors.bg.match(/#[0-9A-Fa-f]{6}/);
    const bgColor = bgMatch ? bgMatch[0] : "#6C757D";
    const textColor = colors.text === "text-black" ? "#000000" : "#FFFFFF";
    return {
      backgroundColor: bgColor,
      color: textColor,
    };
  }

  return (
    <>
      <MobileWarningDialog 
        open={showMobileWarning} 
        onClose={handleCloseWarning} 
      />
      <div className="container mx-auto pt-4 pb-8 relative">
        {isLoading && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <LoadingAnimation />
          </div>
        )}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold uppercase tracking-wide font-fell italic">Explore</h1>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8 bg-secondary border-secondary text-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              className="border-accent text-accent hover:bg-secondary md:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        <Tabs defaultValue="labs" value={activeTab} onValueChange={setActiveTab} className="w-full mt-8">
          <TabsList className="grid grid-cols-2 w-full bg-secondary">
            <TabsTrigger
              value="labs"
              className="data-[state=active]:bg-accent data-[state=active]:text-primary-foreground text-xs font-fell italic"
            >
              <Building2 className="h-4 w-4 mr-2" />
              LABS
            </TabsTrigger>
            <TabsTrigger
              value="experiments"
              className="data-[state=active]:bg-accent data-[state=active]:text-primary-foreground text-xs font-fell italic"
            >
              <Flask className="h-4 w-4 mr-2" />
              EXPERIMENTS
            </TabsTrigger>
          </TabsList>

          <div className="flex mt-6 gap-6">
            {/* Filters Sidebar */}
            <div className={`w-full md:w-64 shrink-0 space-y-4 ${showFilters ? "block" : "hidden md:block"}`}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide font-fell italic">Filters</h2>
                {selectedCategories.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-8 text-xs text-accent hover:bg-secondary"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <Collapsible open={isCategoriesOpen} onOpenChange={setIsCategoriesOpen}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-xs font-medium uppercase tracking-wide font-fell italic">
                    Categories
                    <ChevronDown className={`h-4 w-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-2 pt-2">
                        {getUniqueCategories().map((category) => (
                          <div key={category} className="flex items-center gap-3">
                            <Checkbox
                              id={`category-${category}`}
                              checked={selectedCategories.includes(category)}
                              onCheckedChange={() => toggleCategory(category)}
                              className="border-accent data-[state=checked]:bg-accent data-[state=checked]:text-primary-foreground"
                            />
                            <label
                              htmlFor={`category-${category}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center cursor-pointer"
                            >
                              {getCategoryLabel(category)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1">
              {/* Selected Filters */}
              {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedCategories.map((category) => (
                    <Badge key={category} className={`${getBadgeClass(category)} pl-2 pr-1 py-1 flex items-center gap-1 normal-case`}>
                      {getCategoryLabel(category)}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 rounded-full hover:bg-black/20"
                        onClick={() => toggleCategory(category)}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </Badge>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-6 text-xs text-accent hover:bg-secondary"
                  >
                    Clear all
                  </Button>
                </div>
              )}

              {/* Results Count */}
              <div className="text-sm text-muted-foreground mb-4 font-fell italic">Showing {filteredData.length} results</div>

              {/* Results Grid */}
              <TabsContent value="experiments" className="mt-0">
                {experimentsLoading ? (
                  <div className="text-center py-8">Loading experiments…</div>
                ) : (
                  <>
                    {experimentsError && (
                      <div className="text-red-500 text-sm mb-4">Error fetching experiments: {experimentsError.message || String(experimentsError)}</div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredData.map((experiment: any) => {
                        const isExperimentEngine = experiment.is_experiment_engine || experiment.experiment_id?.startsWith('exp_');
                        const isClosed = experiment.closed_status === "CLOSED" || (isExperimentEngine && experiment.experiment_status === 'concluded');
                        const ExperimentCardContent = () => {
                          const [thumbnail, setThumbnail] = useState<string | null>(null);
                          const [isLoadingThumbnail, setIsLoadingThumbnail] = useState(false);
                          
                          useEffect(() => {
                            if (!isExperimentEngine || !experiment.experiment_id) return;
                            
                            const loadThumbnail = async () => {
                              const status = experiment.experiment_status || experiment.status;
                              if (status === 'experiment_initiated' || status === 'config_complete') {
                                setIsLoadingThumbnail(false);
                                return; // No video content yet
                              }
                              
                              setIsLoadingThumbnail(true);
                              try {
                                let videoUrl: string | null = null;
                                if (status === 'concluded') {
                                  videoUrl = await getConcludedVideoUrl(experiment.experiment_id);
                                } else {
                                  videoUrl = await getFirstVideoSegment(experiment.experiment_id);
                                }
                                
                                if (videoUrl) {
                                  const thumb = await generateVideoThumbnail(videoUrl);
                                  if (thumb) {
                                    setThumbnail(thumb);
                                  }
                                }
                              } catch (error) {
                                console.debug('[Thumbnail] Could not load thumbnail:', error);
                              } finally {
                                setIsLoadingThumbnail(false);
                              }
                            };
                            
                            loadThumbnail();
                          }, [isExperimentEngine, experiment.experiment_id, experiment.experiment_status]);
                          
                          const handleClick = (e: React.MouseEvent) => {
                            if (isExperimentEngine) {
                              e.preventDefault();
                              window.open(`https://www.experimentengine.ai/experiment-summary?experimentId=${experiment.experiment_id}`, '_blank');
                            }
                          };
                          
                          const isOwnExperiment = user?.id && experiment.created_by === user.id;
                          
                          return (
                            <Card key={experiment.id} className="overflow-hidden relative">
                              <CardContent className="p-0">
                                {/* Star icon for own experiments */}
                                {isOwnExperiment && (
                                  <div className="absolute top-3 right-3 z-10">
                                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                  </div>
                                )}
                                <div className="p-4">
                                  <Link 
                                    href={isExperimentEngine 
                                      ? `https://www.experimentengine.ai/experiment-summary?experimentId=${experiment.experiment_id}`
                                      : (isClosed ? `/experiments/${experiment.id}/conclude` : `/newexperiments/${experiment.id}`)
                                    }
                                    onClick={handleClick}
                                    className="block hover:bg-secondary/50 -m-4 p-4"
                                  >
                                    {/* Thumbnail for Experiment Engine experiments */}
                                    {isExperimentEngine && (
                                      <div className="mb-3 flex items-center justify-center w-full h-32 bg-secondary/50 rounded overflow-hidden">
                                        {isLoadingThumbnail ? (
                                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                        ) : thumbnail ? (
                                          <img src={thumbnail} alt={experiment.name} className="w-full h-full object-cover" />
                                        ) : (
                                          <Video className="h-8 w-8 text-muted-foreground" />
                                        )}
                                      </div>
                                    )}
                                  <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                      {isClosed ? (
                                        <><Circle className="h-3 w-3 text-red-500 fill-red-500" /><span className="text-xs text-red-500 font-bold">CONCLUDED</span></>
                                      ) : (
                                        <><div className="h-2 w-2 rounded-full bg-green-500 animate-[pulse_2s_ease-in-out_infinite]" /><span className="text-xs text-green-500 font-medium">LIVE</span></>
                                      )}
                                    </div>
                                    <div className="text-xs text-muted-foreground text-right">
                                      {isClosed ? (
                                        <span>Concluded {experiment.end_date ? getElapsedString(experiment.end_date) : "-"}</span>
                                      ) : (
                                        <span>Ongoing</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="mb-1">
                                    <h3 className="font-semibold text-accent text-lg font-fell italic normal-case">{experiment.name}</h3>
                                    {isExperimentEngine && (
                                      <Badge variant="secondary" className="text-xs normal-case mt-1">EXPERIMENT ENGINE</Badge>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {(expandedExperimentIds.includes(experiment.id) ? experiment.categories : experiment.categories.slice(0, 3)).map((category: string) => {
                                      const badgeClass = getBadgeClass(category);
                                      const badgeStyles = getBadgeStyles(category);
                                      return (
                                        <Badge key={category} className={`${badgeClass} mr-2 mb-2 text-xs uppercase border-0 whitespace-nowrap`} style={badgeStyles}>
                                          {getCategoryLabel(category)}
                                        </Badge>
                                      );
                                    })}
                                    {experiment.categories.length > 3 && !expandedExperimentIds.includes(experiment.id) && (
                                      <button
                                        type="button"
                                        className="text-xs text-muted-foreground font-bold ml-1 px-2 py-1 rounded hover:bg-accent cursor-pointer"
                                        onClick={e => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setExpandedExperimentIds(ids => [...ids, experiment.id]);
                                        }}
                                        title="View all categories"
                                      >
                                        ...
                                      </button>
                                    )}
                                  </div>
                                  {experiment.objective && <p className="text-sm text-muted-foreground mb-2">{experiment.objective}</p>}
                                  </Link>
                                  {/* Files */}
                                  {Array.isArray(experiment.files) && experiment.files.length > 0 && (
                                    <div className="flex items-center gap-2 mb-2">
                                      <FileText className="h-4 w-4 text-muted-foreground" />
                                      {experiment.files.map((file: any) => (
                                        <a
                                          key={file.id}
                                          href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/experiment-files/${file.file_path}`}
                                          download
                                          className="text-xs underline text-accent"
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          {file.name}
                                        </a>
                                      ))}
                                    </div>
                                  )}
                                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="flex items-center gap-2">
                                      <img src={experiment.labProfilePic} alt={experiment.labName} className="h-5 w-5 rounded-full object-cover border" />
                                      {experiment.labName}
                                    </span>
                                    <span>{experiment.lastUpdated}</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        };
                        
                        return <ExperimentCardContent key={experiment.id} />;
                      })}
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="labs" className="mt-0">
                {labsLoading ? (
                  <div className="text-center py-8">Loading labs…</div>
                ) : (
                  <>
                    {labsError && (
                      <div className="text-red-500 text-sm mb-4">Error fetching labs: {labsError.message || String(labsError)}</div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredData.map((lab: any) => {
                        const isOwnLab = user?.id && lab.creatorId === user.id;
                        return (
                        <Card key={lab.id} className="overflow-hidden relative min-h-[200px]">
                          <CardContent className="p-0">
                            {/* Star icon for own labs */}
                            {isOwnLab && (
                              <div className="absolute top-3 right-3 z-20">
                                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                              </div>
                            )}
                            {/* Org info in top-right corner, outside the Link to avoid nested <a> */}
                            {lab.institution && lab.org_slug && (
                              <div className={`absolute ${isOwnLab ? 'top-10' : 'top-4'} right-4 flex items-center gap-1 z-10`}>
                                {lab.orgProfilePic && (
                                  <img src={lab.orgProfilePic} alt={lab.institution} className="h-5 w-5 rounded-full object-cover border" />
                                )}
                                <a
                                  href={`/orgs/${lab.org_slug}`}
                                  className="text-xs font-medium text-primary hover:underline truncate max-w-[80px] font-fell italic"
                                  onClick={e => e.stopPropagation()}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {lab.institution}
                                </a>
                              </div>
                            )}
                            <Link 
                              href={`/lab/${lab.id}`} 
                              className="block p-6 hover:bg-secondary/50"
                              onClick={() => setIsNavigating(true)}
                            >
                              <div className="flex items-start gap-3">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={lab.image || "/placeholder.svg"} alt={lab.name} />
                                  <AvatarFallback>{lab.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1 flex-1 pr-24">
                                  <h3 className="font-medium text-accent font-fell italic normal-case break-words">{lab.name}</h3>
                                  {/* Science categories as colored badges, up to 3, with ellipsis if more */}
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {(expandedLabIds.includes(lab.id) ? lab.categories : lab.categories.slice(0, 3)).map((category: string) => {
                                      const badgeClass = getBadgeClass(category);
                                      const badgeStyles = getBadgeStyles(category);
                                      return (
                                        <Badge
                                          key={category}
                                          className={`${badgeClass} mr-2 mb-2 text-xs uppercase border-0 whitespace-nowrap`}
                                          style={badgeStyles}
                                        >
                                          {getCategoryLabel(category)}
                                        </Badge>
                                      );
                                    })}
                                    {lab.categories.length > 3 && !expandedLabIds.includes(lab.id) && (
                                      <button
                                        type="button"
                                        className="text-xs text-muted-foreground font-bold ml-1 px-2 py-1 rounded hover:bg-accent cursor-pointer"
                                        style={{ minWidth: 24 }}
                                        onClick={e => {
                                          e.stopPropagation();
                                          setExpandedLabIds(ids => [...ids, lab.id]);
                                        }}
                                        title="View all categories"
                                      >
                                        ...
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {/* Compact metrics row */}
                              <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <FileText className="h-4 w-4" />
                                  <span>{lab.files}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Flask className="h-4 w-4" />
                                  <span>{lab.projects}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  <span>{lab.members}</span>
                                </div>
                              </div>
                              {/* Last updated */}
                              <div className="mt-2 text-xs text-muted-foreground">{lab.lastUpdated}</div>
                            </Link>
                          </CardContent>
                        </Card>
                        );
                      })}
                    </div>
                  </>
                )}
              </TabsContent>

            </div>
          </div>
        </Tabs>
      </div>
    </>
  )
}

/* Add this style at the end of the file or in a global CSS file:
.grant-name-truncate {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  max-height: 2.8em;
}
@media (max-width: 640px) {
  .grant-name-truncate {
    -webkit-line-clamp: 1;
    max-height: 1.4em;
  }
}
*/
