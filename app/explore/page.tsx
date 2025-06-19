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
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { supabase } from "@/lib/supabase"
import { researchAreas } from "@/lib/research-areas"
import { useAuth } from "@/components/auth-provider"
import { createPortal } from "react-dom"
import { differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns"
import { LoadingAnimation } from "@/components/loading-animation"

// Add this after imports, before the ExplorePage component
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
  "optics": { bg: "bg-[#FFD60A]", text: "text-black" },
  "thermodynamics": { bg: "bg-[#FFD60A]", text: "text-black" },
  "fluid-dynamics": { bg: "bg-[#FFD60A]", text: "text-black" },
  "plasma-physics": { bg: "bg-[#FFD60A]", text: "text-black" },
  "biophysics": { bg: "bg-[#38B000]", text: "text-white" },
  "geophysics": { bg: "bg-[#AA6C25]", text: "text-white" },
  "geochemistry": { bg: "bg-[#AA6C25]", text: "text-white" },
  "climatology": { bg: "bg-[#2DC653]", text: "text-white" },
  "oceanography": { bg: "bg-[#2DC653]", text: "text-white" },
  "hydrology": { bg: "bg-[#2DC653]", text: "text-white" },
  "seismology": { bg: "bg-[#AA6C25]", text: "text-white" },
  "volcanology": { bg: "bg-[#AA6C25]", text: "text-white" },
  "paleontology": { bg: "bg-[#AA6C25]", text: "text-white" },
  "anatomy": { bg: "bg-[#FF0054]", text: "text-white" },
  "physiology": { bg: "bg-[#FF0054]", text: "text-white" },
  "pathology": { bg: "bg-[#FF0054]", text: "text-white" },
  "pharmacology": { bg: "bg-[#FF0054]", text: "text-white" },
  "toxicology": { bg: "bg-[#FF0054]", text: "text-white" },
  "epidemiology": { bg: "bg-[#FF0054]", text: "text-white" },
  "public-health": { bg: "bg-[#FF0054]", text: "text-white" },
  "cardiology": { bg: "bg-[#FF0054]", text: "text-white" },
  "neurology": { bg: "bg-[#9D4EDD]", text: "text-white" },
  "oncology": { bg: "bg-[#FF0054]", text: "text-white" },
  "pediatrics": { bg: "bg-[#FF0054]", text: "text-white" },
  "geriatrics": { bg: "bg-[#FF0054]", text: "text-white" },
  "psychiatry": { bg: "bg-[#FB5607]", text: "text-white" },
  "biomedical-engineering": { bg: "bg-[#4361EE]", text: "text-white" },
  "chemical-engineering": { bg: "bg-[#4361EE]", text: "text-white" },
  "civil-engineering": { bg: "bg-[#4361EE]", text: "text-white" },
  "electrical-engineering": { bg: "bg-[#4361EE]", text: "text-white" },
  "mechanical-engineering": { bg: "bg-[#4361EE]", text: "text-white" },
  "artificial-intelligence": { bg: "bg-[#3A86FF]", text: "text-white" },
  "robotics": { bg: "bg-[#3A86FF]", text: "text-white" },
  "nanotechnology": { bg: "bg-[#3A86FF]", text: "text-white" },
  "materials-science": { bg: "bg-[#FF5400]", text: "text-white" },
  "systems-biology": { bg: "bg-[#38B000]", text: "text-white" },
  "synthetic-biology": { bg: "bg-[#38B000]", text: "text-white" },
  "computational-biology": { bg: "bg-[#38B000]", text: "text-white" },
  "quantum-computing": { bg: "bg-[#FFD60A]", text: "text-black" },
  "renewable-energy": { bg: "bg-[#2DC653]", text: "text-white" },
  "sustainable-development": { bg: "bg-[#2DC653]", text: "text-white" },
  "data-science": { bg: "bg-[#7209B7]", text: "text-white" },
  "astrobiology": { bg: "bg-[#3F37C9]", text: "text-white" },
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

  // Move grants state and fetching logic here
  const [grantsData, setGrantsData] = useState<any[]>([])
  const [grantsLoading, setGrantsLoading] = useState(false)

  // --- Move labs state and fetching logic here ---
  const [labsData, setLabsData] = useState<any[]>([]);
  const [labsLoading, setLabsLoading] = useState(false);
  const [labsError, setLabsError] = useState<any>(null);
  const [expandedLabIds, setExpandedLabIds] = useState<string[]>([]);
  const [expandedExperimentIds, setExpandedExperimentIds] = useState<string[]>([]);
  const [expandedGrantIds, setExpandedGrantIds] = useState<string[]>([]);

  // Add experiments state and loading state
  const [experimentsData, setExperimentsData] = useState<any[]>([]);
  const [experimentsLoading, setExperimentsLoading] = useState(false);
  const [experimentsError, setExperimentsError] = useState<any>(null);

  const [isNavigating, setIsNavigating] = useState(false)

  // Add these state variables at the top of the component
  const [showMobileWarning, setShowMobileWarning] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

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

  // Fetch all data on initial load
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        // Fetch labs
        const { data: labs, error: labsError } = await supabase
          .from("labs")
          .select("labId, labName, description, profilePic, org_id, createdBy, created_at")
          .order("created_at", { ascending: false });

        if (labsError) throw labsError;

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

        // Fetch members count
        let membersMap: Record<string, number> = {};
        if (labIds.length > 0) {
          const { data: members } = await supabase
            .from("labMembers")
            .select("lab_id")
            .in("lab_id", labIds);
          if (members) {
            members.forEach(m => {
              membersMap[m.lab_id] = (membersMap[m.lab_id] || 0) + 1;
            });
          }
        }

        // Fetch funding info
        let fundingMap: Record<string, { goal: number, raised: number }> = {};
        if (labIds.length > 0) {
          const { data: fundingGoals } = await supabase
            .from("funding_goals")
            .select("lab_id, amount_contributed, goal_amount");
          if (fundingGoals) {
            fundingGoals.forEach(fg => {
              if (!fundingMap[fg.lab_id]) fundingMap[fg.lab_id] = { goal: 0, raised: 0 };
              fundingMap[fg.lab_id].goal += fg.goal_amount || 0;
              fundingMap[fg.lab_id].raised += fg.amount_contributed || 0;
            });
          }
        }

        // Fetch experiments count
        let experimentsMap: Record<string, number> = {};
        if (labIds.length > 0) {
          const { data: experiments } = await supabase
            .from("experiments")
            .select("lab_id");
          if (experiments) {
            experiments.forEach(e => {
              experimentsMap[e.lab_id] = (experimentsMap[e.lab_id] || 0) + 1;
            });
          }
        }

        // Fetch lab files count
        let labFilesMap: Record<string, number> = {};
        if (labIds.length > 0) {
          const { data: files } = await supabase
            .from("files")
            .select("labID, fileTag");
          if (files) {
            files.forEach(f => {
              if (f.fileTag !== 'folder') {
                labFilesMap[f.labID] = (labFilesMap[f.labID] || 0) + 1;
              }
            });
          }
        }

        // Map labs data
        const mappedLabs = labs.map(lab => ({
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
          projects: experimentsMap[lab.labId] || 0,
          publications: 0,
          lastUpdated: lab.created_at ? `${Math.round((Date.now() - new Date(lab.created_at).getTime()) / (1000*60*60*24))} days ago` : '',
          image: lab.profilePic || '/placeholder.svg?height=80&width=80',
        }));

        // Fetch experiments
        const { data: experiments, error: experimentsError } = await supabase
          .from("experiments")
          .select("*")
          .order("created_at", { ascending: false });

        if (experimentsError) throw experimentsError;

        // Fetch experiment contributors
        let contributorsMap: Record<string, any[]> = {};
        if (experiments.length > 0) {
          const { data: contributors } = await supabase
            .from("experiment_contributors")
            .select("experiment_id, user_id, profile:profiles(username, avatar_url)");
          if (contributors) {
            contributors.forEach(c => {
              if (!contributorsMap[c.experiment_id]) contributorsMap[c.experiment_id] = [];
              contributorsMap[c.experiment_id].push(c);
            });
          }
        }

        // Fetch experiment files
        let experimentFilesMap: Record<string, any[]> = {};
        if (experiments.length > 0) {
          const { data: files } = await supabase
            .from("files")
            .select("id, name, file_path, experiment_id, uploaded_by, created_at");
          if (files) {
            files.forEach(f => {
              if (!experimentFilesMap[f.experiment_id]) experimentFilesMap[f.experiment_id] = [];
              experimentFilesMap[f.experiment_id].push(f);
            });
          }
        }

        // After mapping mappedLabs:
        const labInfoMap: Record<string, any> = {};
        mappedLabs.forEach(lab => {
          labInfoMap[lab.id] = {
            name: lab.name,
            image: lab.image,
          };
        });

        // Map experiments data
        const mappedExperiments = experiments.map(exp => {
          const labInfo = labInfoMap[exp.lab_id] || {};
          return {
            id: exp.id,
            name: exp.name,
            description: exp.description,
            objective: exp.objective,
            categories: Array.isArray(exp.categories) ? exp.categories : [],
            lab: exp.lab_id,
            labId: exp.lab_id,
            labName: labInfo.name || "",
            labProfilePic: labInfo.image || "/placeholder.svg",
            participantsNeeded: exp.participants_needed || 0,
            participantsCurrent: exp.participants_current || 0,
            deadline: exp.deadline,
            compensation: exp.compensation || "No compensation",
            timeCommitment: exp.time_commitment || "Not specified",
            lastUpdated: exp.created_at ? `${Math.round((Date.now() - new Date(exp.created_at).getTime()) / (1000*60*60*24))} days ago` : "",
            status: exp.status || "DRAFT",
            closed_status: exp.closed_status,
            end_date: exp.end_date,
            created_at: exp.created_at,
            contributors: contributorsMap[exp.id] || [],
            files: experimentFilesMap[exp.id] || [],
          };
        });

        // Fetch grants
        const { data: grants, error: grantsError } = await supabase
          .from("grants")
          .select("grant_id, grant_name, grant_description, grant_categories, grant_amount, deadline, created_at, created_by, org_id, closure_status")
          .order("created_at", { ascending: false });

        if (grantsError) throw grantsError;

        // Fetch profiles for grant creators
        const userIds = [...new Set(grants.map(g => g.created_by).filter(Boolean))];
        let profileMap: Record<string, any> = {};
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, username")
            .in("user_id", userIds);
          if (profiles) {
            profiles.forEach(p => { profileMap[p.user_id] = p });
          }
        }

        // Fetch organizations for grants
        const grantOrgIds = [...new Set(grants.map(g => g.org_id).filter(Boolean))];
        let grantOrgMap: Record<string, any> = {};
        if (grantOrgIds.length > 0) {
          const { data: orgs } = await supabase
            .from("organizations")
            .select("org_id, org_name, profilePic")
            .in("org_id", grantOrgIds);
          if (orgs) {
            orgs.forEach(o => { grantOrgMap[o.org_id] = o });
          }
        }

        // Map grants data
        const mappedGrants = grants.map((g: any) => ({
          id: g.grant_id || `temp-${g.created_at}`,
          name: g.grant_name,
          description: g.grant_description,
          categories: g.grant_categories || [],
          funder: "",
          amount: g.grant_amount ? `$${g.grant_amount.toLocaleString()}` : "",
          deadline: g.deadline,
          eligibility: "",
          applicationProcess: "",
          lastUpdated: g.created_at ? `${Math.round((Date.now() - new Date(g.created_at).getTime()) / (1000*60*60*24))} days ago` : "",
          creatorUsername: profileMap[g.created_by]?.username || "",
          orgName: grantOrgMap[g.org_id]?.org_name || "",
          orgProfilePic: grantOrgMap[g.org_id]?.profilePic || "",
          created_by: g.created_by,
          closure_status: g.closure_status,
        }));

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

        // Add grant categories
        mappedGrants.forEach(grant => {
          if (Array.isArray(grant.categories)) {
            grant.categories.forEach(cat => uniqueCategories.add(cat));
          }
        });

        // Set all unique categories
        setAllCategories(Array.from(uniqueCategories).sort());

        // Set the data
        setLabsData(mappedLabs);
        setExperimentsData(mappedExperiments);
        setGrantsData(mappedGrants);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []); // Empty dependency array means this runs once on mount

  const { user } = useAuth();

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
      case "grants":
        return grantsData;
      default:
        return experimentsData;
    }
  }

  // Filter data based on search query and selected categories
  const filterData = useCallback(
    (data: any[]) => {
      return data.filter((item) => {
        // Search filter
        const matchesSearch =
          searchQuery === "" ||
          (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description || "").toLowerCase().includes(searchQuery.toLowerCase())

        // Category filter (show labs with no categories if no filter is selected)
        const matchesCategory =
          selectedCategories.length === 0 ||
          (item.categories && item.categories.length > 0 && item.categories.some((cat: string) => selectedCategories.includes(cat)))

        return matchesSearch && matchesCategory
      })
    },
    [searchQuery, selectedCategories],
  )

  // Sort data based on selected sort option
  const sortData = useCallback(
    (data: any[]) => {
      if (sortOption === "recent") {
        // Sort by last updated (most recent first)
        return [...data].sort((a, b) => {
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

  // Get badge class for a category
  const getBadgeClass = (category: string) => {
    const area = researchAreas.find(a => a.value === category)
    if (!area) return "badge-default"
    
    // Map the category to a base category for consistent styling
    const baseCategory = area.value.split('-')[0]
    return `badge-${baseCategory}`
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
          <h1 className="text-2xl font-bold uppercase tracking-wide">Explore</h1>

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
          <TabsList className="grid grid-cols-3 w-full bg-secondary">
            <TabsTrigger
              value="labs"
              className="data-[state=active]:bg-accent data-[state=active]:text-primary-foreground text-xs"
            >
              <Building2 className="h-4 w-4 mr-2" />
              LABS
            </TabsTrigger>
            <TabsTrigger
              value="grants"
              className="data-[state=active]:bg-accent data-[state=active]:text-primary-foreground text-xs"
            >
              <FileText className="h-4 w-4 mr-2" />
              OPEN GRANTS
            </TabsTrigger>
            <TabsTrigger
              value="experiments"
              className="data-[state=active]:bg-accent data-[state=active]:text-primary-foreground text-xs"
            >
              <Flask className="h-4 w-4 mr-2" />
              EXPERIMENTS
            </TabsTrigger>
          </TabsList>

          <div className="flex mt-6 gap-6">
            {/* Filters Sidebar */}
            <div className={`w-full md:w-64 shrink-0 space-y-4 ${showFilters ? "block" : "hidden md:block"}`}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide">Filters</h2>
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
                  <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-xs font-medium uppercase tracking-wide">
                    Categories
                    <ChevronDown className={`h-4 w-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-2 pt-2">
                        {getUniqueCategories().map((category) => (
                          <div key={category} className="flex items-center space--x-2">
                            <Checkbox
                              id={`category-${category}`}
                              checked={selectedCategories.includes(category)}
                              onCheckedChange={() => toggleCategory(category)}
                              className="border-accent data-[state=checked]:bg-accent data-[state=checked]:text-primary-foreground"
                            />
                            <label
                              htmlFor={`category-${category}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
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
                    <Badge key={category} className={`${getBadgeClass(category)} pl-2 pr-1 py-1 flex items-center gap-1`}>
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
              <div className="text-sm text-muted-foreground mb-4">Showing {filteredData.length} results</div>

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
                        const isClosed = experiment.closed_status === "CLOSED";
                        return (
                          <Card key={experiment.id} className="overflow-hidden">
                            <CardContent className="p-0">
                              <Link href={isClosed ? `/experiments/${experiment.id}/conclude` : `/newexperiments/${experiment.id}`} className="block p-4 hover:bg-secondary/50">
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
                                <h3 className="font-semibold text-accent text-lg mb-1">{experiment.name}</h3>
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {(expandedExperimentIds.includes(experiment.id) ? experiment.categories : experiment.categories.slice(0, 3)).map((category: string) => {
                                    const color = getCategoryBadgeColors(category);
                                    return (
                                      <Badge key={category} variant={category as any} className="mr-2 mb-2 text-xs">
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
                                {/* Contributors */}
                                {Array.isArray(experiment.contributors) && experiment.contributors.length > 0 && (
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs text-muted-foreground">Contributors:</span>
                                    {experiment.contributors.map((c: any) => (
                                      <Link key={c.user_id} href={`/profile/${c.user_id}`} target="_blank" rel="noopener noreferrer">
                                        <Avatar className="h-6 w-6 border">
                                          <AvatarImage src={c.profile?.avatar_url || "/placeholder.svg"} alt={c.profile?.username || c.user_id} />
                                          <AvatarFallback>{c.profile?.username?.[0] || "U"}</AvatarFallback>
                                        </Avatar>
                                      </Link>
                                    ))}
                                  </div>
                                )}
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
                              </Link>
                            </CardContent>
                          </Card>
                        );
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredData.map((lab: any) => (
                        <Card key={lab.id} className="overflow-hidden relative">
                          <CardContent className="p-0">
                            {/* Org info in top-right corner, outside the Link to avoid nested <a> */}
                            {lab.institution && lab.org_slug && (
                              <div className="absolute top-4 right-4 flex items-center gap-1 z-10">
                                {lab.orgProfilePic && (
                                  <img src={lab.orgProfilePic} alt={lab.institution} className="h-5 w-5 rounded-full object-cover border" />
                                )}
                                <a
                                  href={`/orgs/${lab.org_slug}`}
                                  className="text-xs font-medium text-primary hover:underline truncate max-w-[100px]"
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
                              className="block p-4 hover:bg-secondary/50"
                              onClick={() => setIsNavigating(true)}
                            >
                              <div className="flex items-start gap-3">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={lab.image || "/placeholder.svg"} alt={lab.name} />
                                  <AvatarFallback>{lab.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1 flex-1">
                                  <h3 className="font-medium text-accent">{lab.name}</h3>
                                  {/* Science categories as colored badges, up to 3, with ellipsis if more */}
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {(expandedLabIds.includes(lab.id) ? lab.categories : lab.categories.slice(0, 3)).map((category: string) => (
                                      <Badge
                                        key={category}
                                        variant={category as any}
                                        className="mr-2 mb-2 text-xs"
                                      >
                                        {getCategoryLabel(category)}
                                      </Badge>
                                    ))}
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
                                {lab.fundingGoal > 0 && (
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-4 w-4" />
                                    <span>${typeof lab.fundingCurrent === "number" ? lab.fundingCurrent.toLocaleString() : "0"}</span>
                                  </div>
                                )}
                              </div>
                              {/* Funding progress bar */}
                              {lab.fundingGoal > 0 && (
                                <div className="mt-2">
                                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                    <span>Goal: ${typeof lab.fundingGoal === "number" ? lab.fundingGoal.toLocaleString() : "0"}</span>
                                    <span>{Math.round((lab.fundingCurrent / lab.fundingGoal) * 100)}%</span>
                                  </div>
                                  <Progress value={(lab.fundingCurrent / lab.fundingGoal) * 100} className="h-2" />
                                </div>
                              )}
                              {/* Last updated */}
                              <div className="mt-2 text-xs text-muted-foreground">{lab.lastUpdated}</div>
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="grants" className="mt-0">
                {grantsLoading ? (
                  <div className="text-center py-8">Loading grants…</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredData.map((grant: any) => {
                      // Route to review page if user is creator
                      const isCreator = user && grant.created_by && user.id === grant.created_by;
                      const grantUrl = isCreator ? `/grants/review/${grant.id}` : `/grants/${grant.id}`;
                      // Only consider closure_status === 'AWARDED' as awarded
                      const isAwarded = grant.closure_status === 'AWARDED';
                      return (
                        <Card key={grant.id} className={`overflow-hidden relative transition-all duration-200 ${isAwarded ? 'opacity-70 grayscale hover:opacity-90 hover:grayscale-0 cursor-pointer' : ''}`}>
                          <CardContent className="p-0 flex flex-col justify-between">
                            <Link href={grantUrl} className="block p-4 hover:bg-secondary/50 relative h-full">
                              <div className="space-y-1 flex flex-col mt-2 mb-2">
                                <h3 className="font-medium text-accent break-words whitespace-normal overflow-hidden text-ellipsis max-h-[3.2em] leading-tight" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>{grant.name}</h3>
                                {/* Org and user info row, below the name */}
                                <div className="flex items-center gap-2 mt-1 mb-1 min-h-[1.5em]">
                                  {grant.orgName && (
                                    <div className="flex items-center gap-1 max-w-[60%] truncate">
                                      <img
                                        src={grant.orgProfilePic || "/placeholder.svg"}
                                        alt={grant.orgName}
                                        className="h-5 w-5 rounded-full object-cover border"
                                      />
                                      <span className="text-xs font-medium text-muted-foreground truncate">{grant.orgName}</span>
                                    </div>
                                  )}
                                  {grant.creatorUsername && (
                                    <span className="text-xs text-muted-foreground font-normal truncate max-w-[40%]">@{grant.creatorUsername}</span>
                                  )}
                                </div>
                                {/* Science categories as colored badges, up to 3, with ellipsis if more */}
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {(expandedGrantIds.includes(grant.id) ? grant.categories : grant.categories.slice(0, 3)).map((category: string) => {
                                    const color = getCategoryBadgeColors(category)
                                    return (
                                      <Badge
                                        key={category}
                                        variant={category as any}
                                        className="mr-2 mb-2 text-xs"
                                      >
                                        {getCategoryLabel(category)}
                                      </Badge>
                                    )
                                  })}
                                  {grant.categories.length > 3 && !expandedGrantIds.includes(grant.id) && (
                                    <button
                                      type="button"
                                      className="text-xs text-muted-foreground font-bold ml-1 px-2 py-1 rounded hover:bg-accent cursor-pointer"
                                      style={{ minWidth: 24 }}
                                      onClick={e => {
                                        e.stopPropagation();
                                        setExpandedGrantIds(ids => [...ids, grant.id]);
                                      }}
                                      title="View all categories"
                                    >
                                      ...
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div className="mt-3 flex items-center justify-between">
                                <span
                                  className={`text-xs font-semibold px-2 py-1 rounded ${isAwarded ? 'bg-green-600 text-white border-none filter-none !filter-none relative z-10' : 'bg-secondary text-foreground border border-border'}`}
                                  style={isAwarded ? { filter: 'none' } : {}}
                                >
                                  {grant.amount} {isAwarded && <span className="ml-2">AWARDED</span>}
                                </span>
                                <span className="text-xs text-muted-foreground">Deadline: {formatDate(grant.deadline)}</span>
                              </div>
                              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                                <span>{grant.funder}</span>
                                <span>{grant.lastUpdated}</span>
                              </div>
                            </Link>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
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
