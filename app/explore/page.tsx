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
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { supabase } from "@/lib/supabase"
import { researchAreas } from "@/lib/research-areas"
import { useAuth } from "@/components/auth-provider"

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

// Sample data for labs to fund
const labsData = [
  {
    id: 1,
    name: "Neuroscience Lab",
    description: "Research on neural networks and brain mapping technologies",
    categories: ["neuroscience", "brain-mapping", "cognitive-science"],
    pi: "Dr. Sarah Johnson",
    institution: "University Research Center",
    members: 18,
    fundingGoal: 150000,
    fundingCurrent: 87500,
    projects: 5,
    publications: 12,
    lastUpdated: "2 days ago",
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 2,
    name: "Quantum Physics Lab",
    description: "Exploring quantum mechanics and particle physics",
    categories: ["physics", "quantum-mechanics", "particle-physics"],
    pi: "Dr. Michael Chen",
    institution: "National Physics Institute",
    members: 12,
    fundingGoal: 200000,
    fundingCurrent: 65000,
    projects: 3,
    publications: 8,
    lastUpdated: "1 week ago",
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 3,
    name: "Genomics Research Group",
    description: "Studying gene expression and DNA sequencing",
    categories: ["biology", "genomics", "bioinformatics"],
    pi: "Dr. Emily Rodriguez",
    institution: "Biotech University",
    members: 15,
    fundingGoal: 175000,
    fundingCurrent: 120000,
    projects: 4,
    publications: 15,
    lastUpdated: "3 days ago",
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 4,
    name: "AI Ethics Lab",
    description: "Researching ethical implications of artificial intelligence",
    categories: ["ai", "ethics", "computer-science"],
    pi: "Dr. James Wilson",
    institution: "Tech Institute",
    members: 9,
    fundingGoal: 100000,
    fundingCurrent: 45000,
    projects: 2,
    publications: 6,
    lastUpdated: "5 days ago",
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 5,
    name: "Climate Science Center",
    description: "Analyzing climate data and environmental impacts",
    categories: ["environmental", "climate-science", "data-analysis"],
    pi: "Dr. Lisa Park",
    institution: "Environmental Research Institute",
    members: 21,
    fundingGoal: 250000,
    fundingCurrent: 180000,
    projects: 7,
    publications: 23,
    lastUpdated: "1 day ago",
    image: "/placeholder.svg?height=80&width=80",
  },
]

// Copy scienceCategoryColors from lab-profile.tsx
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
}

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState("experiments")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortOption, setSortOption] = useState("recent")
  const [showFilters, setShowFilters] = useState(true)

  // Move grants state and fetching logic here
  const [grantsData, setGrantsData] = useState<any[]>([])
  const [grantsLoading, setGrantsLoading] = useState(false)

  const { user } = useAuth();

  // Fetch grants from DB when grants tab is active
  useEffect(() => {
    if (activeTab === "grants") {
      setGrantsLoading(true)
      // 1. Fetch grants (no join)
      supabase
        .from("grants")
        .select("grant_id, grant_name, grant_description, grant_categories, grant_amount, deadline, created_at, created_by, org_id")
        .order("created_at", { ascending: false })
        .then(async ({ data: grants, error }) => {
          if (error || !grants) {
            setGrantsData([])
            setGrantsLoading(false)
            return
          }
          // 2. Collect unique user IDs
          const userIds = [...new Set(grants.map(g => g.created_by).filter(Boolean))]
          // 3. Fetch profiles
          let profileMap: Record<string, any> = {}
          if (userIds.length > 0) {
            const { data: profiles } = await supabase
              .from("profiles")
              .select("user_id, username")
              .in("user_id", userIds)
            if (profiles) {
              profiles.forEach(p => { profileMap[p.user_id] = p })
            }
          }
          // 4. Collect unique org IDs
          const orgIds = [...new Set(grants.map(g => g.org_id).filter(Boolean))]
          // 5. Fetch organizations
          let orgMap: Record<string, any> = {}
          if (orgIds.length > 0) {
            const { data: orgs } = await supabase
              .from("organizations")
              .select("org_id, org_name, profilePic")
              .in("org_id", orgIds)
            if (orgs) {
              orgs.forEach(o => { orgMap[o.org_id] = o })
            }
          }
          // 6. Merge usernames and org info into grants
          setGrantsData(
            grants.map((g: any) => ({
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
              orgName: orgMap[g.org_id]?.org_name || "",
              orgProfilePic: orgMap[g.org_id]?.profilePic || "",
              created_by: g.created_by,
            }))
          )
          setGrantsLoading(false)
        })
    }
  }, [activeTab])

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
        return experimentsData
      case "labs":
        return labsData
      case "grants":
        return grantsData
      default:
        return experimentsData
    }
  }

  // Filter data based on search query and selected categories
  const filterData = useCallback(
    (data: any[]) => {
      return data.filter((item) => {
        // Search filter
        const matchesSearch =
          searchQuery === "" ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())

        // Category filter
        const matchesCategory =
          selectedCategories.length === 0 || item.categories.some((cat: string) => selectedCategories.includes(cat))

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
    const data = getCurrentData()
    const categories = new Set<string>()

    data.forEach((item) => {
      item.categories.forEach((cat: string) => categories.add(cat))
    })

    return Array.from(categories).sort()
  }, [activeTab])

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
    <div className="container mx-auto pt-4 pb-8">
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

          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[180px] bg-secondary border-secondary">
              <SelectValue>
                <div className="flex items-center">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  {getSortOptions().find((option) => option.value === sortOption)?.label || "Sort By"}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="deadline">Deadline (Soonest)</SelectItem>
              <SelectItem value="funding">Funding Progress</SelectItem>
              <SelectItem value="amount">Amount (Highest)</SelectItem>
              <SelectItem value="participation">Needs Participants</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="experiments" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full bg-secondary">
          <TabsTrigger
            value="experiments"
            className="data-[state=active]:bg-accent data-[state=active]:text-primary-foreground text-xs"
          >
            <Flask className="h-4 w-4 mr-2" />
            Live Experiments
          </TabsTrigger>
          <TabsTrigger
            value="labs"
            className="data-[state=active]:bg-accent data-[state=active]:text-primary-foreground text-xs"
          >
            <Building2 className="h-4 w-4 mr-2" />
            Labs to Fund
          </TabsTrigger>
          <TabsTrigger
            value="grants"
            className="data-[state=active]:bg-accent data-[state=active]:text-primary-foreground text-xs"
          >
            <FileText className="h-4 w-4 mr-2" />
            Open Grants
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
              <Collapsible defaultOpen>
                <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-xs font-medium uppercase tracking-wide">
                  Categories
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-2 pt-2">
                      {uniqueCategories.map((category) => (
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
                            <Badge className={`${getBadgeClass(category)} mr-2`}>&nbsp;</Badge>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredData.map((experiment: any) => (
                  <Card key={experiment.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <Link href={`/experiments/view?id=${experiment.id}`} className="block p-4 hover:bg-secondary/50">
                        <div className="space-y-1">
                          <h3 className="font-medium text-accent">{experiment.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{experiment.description}</p>
                        </div>

                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>
                              Participants: {experiment.participantsCurrent}/{experiment.participantsNeeded}
                            </span>
                            <span>
                              {Math.round((experiment.participantsCurrent / experiment.participantsNeeded) * 100)}%
                            </span>
                          </div>
                          <Progress
                            value={(experiment.participantsCurrent / experiment.participantsNeeded) * 100}
                            className="h-2"
                          />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-1">
                          {experiment.categories.slice(0, 3).map((category: string) => (
                            <Badge key={category} className={`${getBadgeClass(category)} text-xs`}>
                              {getCategoryLabel(category)}
                            </Badge>
                          ))}
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                          <span>{experiment.lab}</span>
                          <span>{experiment.lastUpdated}</span>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="labs" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredData.map((lab: any) => (
                  <Card key={lab.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <Link href={`/lab/guest`} className="block p-4 hover:bg-secondary/50">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={lab.image || "/placeholder.svg"} alt={lab.name} />
                            <AvatarFallback>{lab.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <h3 className="font-medium text-accent">{lab.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{lab.description}</p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>
                              Funding: $
                              {typeof lab.fundingCurrent === "number" ? lab.fundingCurrent.toLocaleString() : "0"} / $
                              {typeof lab.fundingGoal === "number" ? lab.fundingGoal.toLocaleString() : "0"}
                            </span>
                            <span>{Math.round(((lab.fundingCurrent || 0) / (lab.fundingGoal || 1)) * 100)}%</span>
                          </div>
                          <Progress
                            value={((lab.fundingCurrent || 0) / (lab.fundingGoal || 1)) * 100}
                            className="h-2"
                          />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-1">
                          {lab.categories.slice(0, 3).map((category: string) => (
                            <Badge
                              key={category}
                              className={`${getBadgeClass(category)} text-xs`}
                            >
                              {getCategoryLabel(category)}
                            </Badge>
                          ))}
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                          <span>PI: {lab.pi}</span>
                          <span>{lab.lastUpdated}</span>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
                    return (
                      <Card key={grant.id} className="overflow-hidden relative">
                        <CardContent className="p-0">
                          <Link href={grantUrl} className="block p-4 hover:bg-secondary/50 relative">
                            {/* Top right: Org and user info */}
                            <div className="absolute top-4 right-4 flex flex-col items-end gap-1 z-10">
                              {grant.orgName && (
                                <div className="flex items-center gap-1 mb-0.5">
                                  <img
                                    src={grant.orgProfilePic || "/placeholder.svg"}
                                    alt={grant.orgName}
                                    className="h-6 w-6 rounded-full object-cover border"
                                  />
                                  <span className="text-xs font-medium text-muted-foreground truncate max-w-[100px]">{grant.orgName}</span>
                                </div>
                              )}
                              {grant.creatorUsername && (
                                <span className="text-[11px] text-muted-foreground font-normal mt-0.5">@{grant.creatorUsername}</span>
                              )}
                            </div>
                            <div className="space-y-1">
                              <h3 className="font-medium text-accent">{grant.name}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">{grant.description}</p>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                              <Badge variant="outline" className="text-xs font-semibold">
                                {grant.amount}
                              </Badge>
                              <span className="text-xs text-muted-foreground">Deadline: {formatDate(grant.deadline)}</span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-1">
                              {grant.categories.slice(0, 3).map((category: string) => {
                                const color = getCategoryBadgeColors(category)
                                return (
                                  <Badge key={category} className={`text-xs ${color.bg} ${color.text}`}>
                                    {getCategoryLabel(category)}
                                  </Badge>
                                )
                              })}
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
  )
}
