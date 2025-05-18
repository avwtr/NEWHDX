"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  ChevronDown,
  ChevronUp,
  FileIcon,
  BookOpenIcon,
  MessageSquareIcon,
  GitForkIcon,
  GitCommitIcon,
  Users,
} from "lucide-react"
import { LogCustomEventDialog } from "@/components/log-custom-event-dialog"
import { supabase } from "@/lib/supabase"

// Sample data for the activity log
const activityData = [
  {
    id: 1,
    type: "file_upload",
    user: {
      name: "Alex Kim",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "AK",
    },
    content: "cognitive_test_results.csv",
    timestamp: "3 days ago",
    description: "Uploaded a new dataset with cognitive test results from 50 participants",
  },
  {
    id: 2,
    type: "doc_update",
    user: {
      name: "Dr. Sarah Johnson",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "SJ",
    },
    content: "fMRI Data Collection Protocol",
    timestamp: "2 days ago",
    description: "Updated the protocol with new calibration procedures",
  },
  {
    id: 3,
    type: "comment",
    user: {
      name: "Maria Lopez",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "ML",
    },
    content: "Neural network optimization algorithm",
    timestamp: "1 day ago",
    description: "Suggested improvements to the convergence rate calculation",
  },
  {
    id: 4,
    type: "file_upload",
    user: {
      name: "Dr. Sarah Johnson",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "SJ",
    },
    content: "fMRI_analysis_pipeline.py",
    timestamp: "1 day ago",
    description: "Added a new preprocessing step for motion correction",
  },
  {
    id: 5,
    type: "fork",
    user: {
      name: "James Wilson",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "JW",
    },
    content: "AI Ethics Lab",
    timestamp: "5 days ago",
    description: "Forked the lab to focus on ethical implications of neural interfaces",
  },
  {
    id: 6,
    type: "file_upload",
    user: {
      name: "Emily Chen",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "EC",
    },
    content: "participant_demographics.xlsx",
    timestamp: "6 days ago",
    description: "Uploaded demographic data for the cognitive study participants",
  },
  {
    id: 7,
    type: "doc_update",
    user: {
      name: "Robert Kim",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "RK",
    },
    content: "Data Analysis Guidelines",
    timestamp: "1 week ago",
    description: "Updated statistical analysis procedures for fMRI data",
  },
  {
    id: 8,
    type: "comment",
    user: {
      name: "Lisa Park",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "LP",
    },
    content: "Brain-Computer Interface for Assistive Technologies",
    timestamp: "1 week ago",
    description: "Suggested a new approach for signal processing",
  },
  {
    id: 9,
    type: "fork",
    user: {
      name: "Michael Chen",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "MC",
    },
    content: "Cognitive Neuroscience Lab",
    timestamp: "2 weeks ago",
    description: "Forked the lab to focus on cognitive aspects of neural processing",
  },
  {
    id: 10,
    type: "file_upload",
    user: {
      name: "Jennifer Davis",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "JD",
    },
    content: "eeg_data_processing.py",
    timestamp: "2 weeks ago",
    description: "Uploaded script for processing EEG data with improved noise reduction",
  },
]

// Sample data for the network graph
const networkData = {
  labs: [
    {
      id: "lab-1",
      name: "Neuroscience Lab",
      avatar: "/placeholder.svg?height=64&width=64",
      initials: "NL",
      isMainLab: true,
    },
    {
      id: "lab-2",
      name: "AI Ethics Lab",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "AE",
      isMainLab: false,
      forkedFrom: "lab-1",
      forkedBy: "user-6",
    },
    {
      id: "lab-3",
      name: "Cognitive Neuroscience Lab",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "CN",
      isMainLab: false,
      forkedFrom: "lab-1",
      forkedBy: "user-7",
    },
  ],
  users: [
    // Main lab users
    {
      id: "user-1",
      name: "Dr. Sarah Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "SJ",
      role: "Principal Investigator",
      labId: "lab-1",
      contributions: 12,
    },
    {
      id: "user-2",
      name: "Alex Kim",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "AK",
      role: "Data Scientist",
      labId: "lab-1",
      contributions: 8,
    },
    {
      id: "user-3",
      name: "Maria Lopez",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "ML",
      role: "Research Assistant",
      labId: "lab-1",
      contributions: 5,
    },
    {
      id: "user-4",
      name: "Robert Kim",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "RK",
      role: "Postdoctoral Researcher",
      labId: "lab-1",
      contributions: 7,
    },
    {
      id: "user-5",
      name: "Emily Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "EC",
      role: "Graduate Student",
      labId: "lab-1",
      contributions: 4,
    },
    {
      id: "user-6",
      name: "James Wilson",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "JW",
      role: "Collaborator",
      labId: "lab-1", // Initially in main lab, then forked
      contributions: 3,
    },

    // Users in forked labs
    {
      id: "user-7",
      name: "Michael Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "MC",
      role: "Lab Director",
      labId: "lab-3", // Cognitive Neuroscience Lab
      contributions: 5,
    },
    {
      id: "user-8",
      name: "Lisa Park",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "LP",
      role: "Ethics Researcher",
      labId: "lab-2", // AI Ethics Lab
      contributions: 4,
    },
    {
      id: "user-9",
      name: "David Wong",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "DW",
      role: "Data Analyst",
      labId: "lab-2", // AI Ethics Lab
      contributions: 3,
    },
    {
      id: "user-10",
      name: "Jennifer Davis",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "JD",
      role: "Neuroscientist",
      labId: "lab-3", // Cognitive Neuroscience Lab
      contributions: 4,
    },
  ],
  contributions: [
    // Dr. Sarah Johnson's contributions to main lab
    {
      id: "contrib-1",
      from: "user-1",
      to: "lab-1",
      type: "file_upload",
      content: "fMRI_analysis_pipeline.py",
      timestamp: "1 day ago",
    },
    {
      id: "contrib-2",
      from: "user-1",
      to: "lab-1",
      type: "doc_update",
      content: "fMRI Data Collection Protocol",
      timestamp: "2 days ago",
    },
    {
      id: "contrib-3",
      from: "user-1",
      to: "lab-1",
      type: "comment",
      content: "Weekly Research Meeting Notes",
      timestamp: "3 days ago",
    },
    {
      id: "contrib-4",
      from: "user-1",
      to: "lab-1",
      type: "file_upload",
      content: "grant_proposal_draft.docx",
      timestamp: "5 days ago",
    },

    // Alex Kim's contributions to main lab
    {
      id: "contrib-5",
      from: "user-2",
      to: "lab-1",
      type: "file_upload",
      content: "cognitive_test_results.csv",
      timestamp: "3 days ago",
    },
    {
      id: "contrib-6",
      from: "user-2",
      to: "lab-1",
      type: "comment",
      content: "Data Analysis Methodology",
      timestamp: "4 days ago",
    },
    {
      id: "contrib-7",
      from: "user-2",
      to: "lab-1",
      type: "file_upload",
      content: "neural_network_model.h5",
      timestamp: "1 week ago",
    },

    // Maria Lopez's contributions to main lab
    {
      id: "contrib-8",
      from: "user-3",
      to: "lab-1",
      type: "comment",
      content: "Neural network optimization algorithm",
      timestamp: "1 day ago",
    },
    {
      id: "contrib-9",
      from: "user-3",
      to: "lab-1",
      type: "file_upload",
      content: "participant_consent_forms.pdf",
      timestamp: "4 days ago",
    },

    // Robert Kim's contributions to main lab
    {
      id: "contrib-10",
      from: "user-4",
      to: "lab-1",
      type: "doc_update",
      content: "Data Analysis Guidelines",
      timestamp: "1 week ago",
    },
    {
      id: "contrib-11",
      from: "user-4",
      to: "lab-1",
      type: "file_upload",
      content: "literature_review.docx",
      timestamp: "2 weeks ago",
    },
    {
      id: "contrib-12",
      from: "user-4",
      to: "lab-1",
      type: "comment",
      content: "Statistical Analysis Methods",
      timestamp: "10 days ago",
    },

    // Emily Chen's contributions to main lab
    {
      id: "contrib-13",
      from: "user-5",
      to: "lab-1",
      type: "file_upload",
      content: "participant_demographics.xlsx",
      timestamp: "6 days ago",
    },
    {
      id: "contrib-14",
      from: "user-5",
      to: "lab-1",
      type: "doc_update",
      content: "Recruitment Protocol",
      timestamp: "8 days ago",
    },

    // James Wilson's contributions to main lab and fork action
    {
      id: "contrib-15",
      from: "user-6",
      to: "lab-1",
      type: "comment",
      content: "Ethical Considerations",
      timestamp: "1 week ago",
    },
    {
      id: "contrib-16",
      from: "user-6",
      to: "lab-2", // Fork to AI Ethics Lab
      type: "fork",
      content: "AI Ethics Lab",
      timestamp: "5 days ago",
    },

    // James Wilson's contributions to forked lab
    {
      id: "contrib-17",
      from: "user-6",
      to: "lab-2",
      type: "file_upload",
      content: "ethics_guidelines.md",
      timestamp: "4 days ago",
    },
    {
      id: "contrib-18",
      from: "user-6",
      to: "lab-2",
      type: "doc_update",
      content: "Ethics Review Process",
      timestamp: "3 days ago",
    },

    // Lisa Park's contributions to AI Ethics Lab
    {
      id: "contrib-19",
      from: "user-8",
      to: "lab-2",
      type: "file_upload",
      content: "survey_results.csv",
      timestamp: "2 days ago",
    },
    {
      id: "contrib-20",
      from: "user-8",
      to: "lab-2",
      type: "comment",
      content: "Ethical Framework Draft",
      timestamp: "1 day ago",
    },

    // David Wong's contributions to AI Ethics Lab
    {
      id: "contrib-21",
      from: "user-9",
      to: "lab-2",
      type: "file_upload",
      content: "ethics_analysis.py",
      timestamp: "3 days ago",
    },
    {
      id: "contrib-22",
      from: "user-9",
      to: "lab-2",
      type: "doc_update",
      content: "Data Privacy Guidelines",
      timestamp: "4 days ago",
    },

    // Michael Chen's fork action and contributions to Cognitive Neuroscience Lab
    {
      id: "contrib-23",
      from: "user-7",
      to: "lab-3", // Fork to Cognitive Neuroscience Lab
      type: "fork",
      content: "Cognitive Neuroscience Lab",
      timestamp: "2 weeks ago",
    },
    {
      id: "contrib-24",
      from: "user-7",
      to: "lab-3",
      type: "file_upload",
      content: "cognitive_model.py",
      timestamp: "12 days ago",
    },
    {
      id: "contrib-25",
      from: "user-7",
      to: "lab-3",
      type: "doc_update",
      content: "Research Agenda",
      timestamp: "10 days ago",
    },

    // Jennifer Davis's contributions to Cognitive Neuroscience Lab
    {
      id: "contrib-26",
      from: "user-10",
      to: "lab-3",
      type: "file_upload",
      content: "eeg_data_processing.py",
      timestamp: "1 week ago",
    },
    {
      id: "contrib-27",
      from: "user-10",
      to: "lab-3",
      type: "comment",
      content: "EEG Analysis Protocol",
      timestamp: "5 days ago",
    },
    {
      id: "contrib-28",
      from: "user-10",
      to: "lab-3",
      type: "file_upload",
      content: "participant_eeg_data.csv",
      timestamp: "3 days ago",
    },
  ],
}

// Helper function to get icon based on activity type
const getActivityIcon = (type: string) => {
  switch (type) {
    case "file_upload":
      return <FileIcon className="h-3 w-3 text-accent" />
    case "doc_update":
      return <BookOpenIcon className="h-3 w-3 text-accent" />
    case "comment":
      return <MessageSquareIcon className="h-3 w-3 text-accent" />
    case "fork":
      return <GitForkIcon className="h-3 w-3 text-accent" />
    default:
      return <GitCommitIcon className="h-3 w-3 text-accent" />
  }
}

// Helper function to get color based on activity type
const getActivityColor = (type: string) => {
  switch (type) {
    case "file_upload":
      return "#A0FFDD" // accent
    case "doc_update":
      return "#3A86FF" // science-ai
    case "comment":
      return "#9D4EDD" // science-neuroscience
    case "fork":
      return "#FF5400" // science-chemistry
    default:
      return "#FFFFFF" // white
  }
}

// Network Graph Component
const NetworkGraph = ({ data }: { data: typeof networkData }) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [hoveredContribution, setHoveredContribution] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [transform, setTransform] = useState({ scale: 0.85, x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Calculate positions
  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect()
      // Make sure we have enough space for the visualization
      setDimensions({
        width: Math.max(width, 800),
        height: Math.max(height, 800),
      })
    }

    // Add resize listener
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setDimensions({
          width: Math.max(width, 800),
          height: Math.max(height, 800),
        })
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Center coordinates
  const centerX = dimensions.width / 2
  const centerY = dimensions.height / 2

  // Get main lab and forked labs
  const mainLab = data.labs.find((lab) => lab.isMainLab)
  const forkedLabs = data.labs.filter((lab) => !lab.isMainLab)

  // Position the main lab at the center
  const mainLabPosition = { x: centerX, y: centerY }

  // Position forked labs below the main lab
  const forkedLabPositions = forkedLabs.map((lab, index) => {
    const angle = Math.PI / 2 + (index - (forkedLabs.length - 1) / 2) * (Math.PI / 4)
    const radius = Math.min(dimensions.width, dimensions.height) * 0.4
    return {
      id: lab.id,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      lab,
    }
  })

  // Group users by their lab
  const usersByLab = data.users.reduce(
    (acc, user) => {
      if (!acc[user.labId]) {
        acc[user.labId] = []
      }
      acc[user.labId].push(user)
      return acc
    },
    {} as Record<string, typeof data.users>,
  )

  // Calculate positions for users around their respective labs
  const userPositions = data.users.map((user) => {
    const labUsers = usersByLab[user.labId]
    const userIndex = labUsers.findIndex((u) => u.id === user.id)
    const totalUsers = labUsers.length

    let labPosition
    if (user.labId === mainLab?.id) {
      labPosition = mainLabPosition
    } else {
      const forkedLabPosition = forkedLabPositions.find((pos) => pos.id === user.labId)
      labPosition = forkedLabPosition ? { x: forkedLabPosition.x, y: forkedLabPosition.y } : mainLabPosition
    }

    // Calculate angle based on user's position in their lab's user list
    const angle = (userIndex * 2 * Math.PI) / totalUsers

    // Calculate radius - make it larger for the main lab
    const radius =
      user.labId === mainLab?.id
        ? Math.min(dimensions.width, dimensions.height) * 0.25
        : Math.min(dimensions.width, dimensions.height) * 0.15

    return {
      id: user.id,
      x: labPosition.x + radius * Math.cos(angle),
      y: labPosition.y + radius * Math.sin(angle),
      user,
    }
  })

  // Find position by ID
  const getPositionById = (id: string) => {
    // Check if it's a lab
    if (id === mainLab?.id) return mainLabPosition

    const forkedLabPosition = forkedLabPositions.find((pos) => pos.id === id)
    if (forkedLabPosition) return { x: forkedLabPosition.x, y: forkedLabPosition.y }

    // Check if it's a user
    const userPos = userPositions.find((pos) => pos.id === id)
    if (userPos) return { x: userPos.x, y: userPos.y }

    return { x: centerX, y: centerY }
  }

  // Get node data by ID
  const getNodeById = (id: string) => {
    // Check if it's a lab
    const lab = data.labs.find((l) => l.id === id)
    if (lab) return { type: "lab", data: lab }

    // Check if it's a user
    const user = data.users.find((u) => u.id === id)
    if (user) return { type: "user", data: user }

    return null
  }

  // Count contributions for a node
  const getContributionCount = (id: string) => {
    return data.contributions.filter((c) => c.from === id || c.to === id).length
  }

  // Handle zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY
    const scaleFactor = delta > 0 ? 0.9 : 1.1 // Zoom in or out

    setTransform((prev) => {
      const newScale = Math.max(0.5, Math.min(2.5, prev.scale * scaleFactor))

      // Adjust position to zoom toward cursor position
      const rect = svgRef.current?.getBoundingClientRect()
      if (!rect) return { ...prev, scale: newScale }

      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      const newX = mouseX - (mouseX - prev.x) * (newScale / prev.scale)
      const newY = mouseY - (mouseY - prev.y) * (newScale / prev.scale)

      return { scale: newScale, x: newX, y: newY }
    })
  }

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return // Only left mouse button
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  // Handle drag
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y

    setTransform((prev) => ({
      ...prev,
      x: prev.x + dx,
      y: prev.y + dy,
    }))

    setDragStart({ x: e.clientX, y: e.clientY })
  }

  // Handle drag end
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Reset zoom and position
  const resetView = () => {
    setTransform({ scale: 0.85, x: 0, y: 0 })
  }

  // Add a subtle glow effect to lines when mouse is near them
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!svgRef.current) return

      const svgRect = svgRef.current.getBoundingClientRect()
      const mouseX = (e.clientX - svgRect.left) / transform.scale - transform.x / transform.scale
      const mouseY = (e.clientY - svgRect.top) / transform.scale - transform.y / transform.scale

      // Check if mouse is near any contribution line
      let nearLine = false
      data.contributions.forEach((contribution) => {
        const fromPos = getPositionById(contribution.from)
        const toPos = getPositionById(contribution.to)

        // Simple distance check to line segments
        const distToLine = distanceToLineSegment(fromPos.x, fromPos.y, toPos.x, toPos.y, mouseX, mouseY)

        if (distToLine < 30) {
          // 30px threshold
          setHoveredContribution(contribution.id)
          nearLine = true
        }
      })

      if (!nearLine && hoveredContribution !== null) {
        setHoveredContribution(null)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [data.contributions, transform, hoveredContribution])

  // Helper function to calculate distance from point to line segment
  const distanceToLineSegment = (x1: number, y1: number, x2: number, y2: number, x: number, y: number) => {
    const A = x - x1
    const B = y - y1
    const C = x2 - x1
    const D = y2 - y1

    const dot = A * C + B * D
    const len_sq = C * C + D * D
    let param = -1

    if (len_sq !== 0) param = dot / len_sq

    let xx, yy

    if (param < 0) {
      xx = x1
      yy = y1
    } else if (param > 1) {
      xx = x2
      yy = y2
    } else {
      xx = x1 + param * C
      yy = y1 + param * D
    }

    const dx = x - xx
    const dy = y - yy

    return Math.sqrt(dx * dx + dy * dy)
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-[800px] relative overflow-hidden"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className="overflow-visible"
        style={{
          transformOrigin: "center",
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
        }}
      >
        {/* Background circles for visual context */}
        {dimensions.width > 0 && (
          <>
            <circle
              cx={centerX}
              cy={centerY}
              r={Math.min(dimensions.width, dimensions.height) * 0.3}
              fill="none"
              stroke="#1A2252"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
            {forkedLabPositions.map((pos) => (
              <circle
                key={`circle-${pos.id}`}
                cx={pos.x}
                cy={pos.y}
                r={Math.min(dimensions.width, dimensions.height) * 0.18}
                fill="none"
                stroke="#1A2252"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            ))}
          </>
        )}

        {/* Contribution lines */}
        {dimensions.width > 0 &&
          data.contributions.map((contribution) => {
            const fromPos = getPositionById(contribution.from)
            const toPos = getPositionById(contribution.to)
            const isHovered = hoveredContribution === contribution.id

            // Calculate a slight curve for the line
            const dx = toPos.x - fromPos.x
            const dy = toPos.y - fromPos.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            // Increase curve offset for longer lines
            const curveOffset = distance > 50 ? 30 : 0

            // Perpendicular offset for the curve
            const perpX = (-dy / distance) * curveOffset
            const perpY = (dx / distance) * curveOffset

            // Control point for the curve
            const cpX = (fromPos.x + toPos.x) / 2 + perpX
            const cpY = (fromPos.y + toPos.y) / 2 + perpY

            // Path for the curved line
            const path = `M ${fromPos.x} ${fromPos.y} Q ${cpX} ${cpY} ${toPos.x} ${toPos.y}`

            return (
              <g key={contribution.id}>
                {/* Invisible wider path for easier hover detection */}
                <path
                  d={path}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={40} // Wide for easier hovering
                  onMouseEnter={() => setHoveredContribution(contribution.id)}
                  onMouseLeave={() => setHoveredContribution(null)}
                  style={{ cursor: "pointer" }}
                />

                {/* Visible path */}
                <path
                  d={path}
                  fill="none"
                  stroke={getActivityColor(contribution.type)}
                  strokeWidth={isHovered ? 4 : 2} // Increased from 3/1.5 to 4/2
                  strokeOpacity={isHovered ? 0.9 : 0.6} // Slightly increased base opacity
                  strokeLinecap="round"
                  pointerEvents="none" // This ensures the invisible path handles events
                />

                {/* Small icon on the line to indicate type */}
                <foreignObject
                  x={(fromPos.x + toPos.x) / 2 + perpX - 8}
                  y={(fromPos.y + toPos.y) / 2 + perpY - 8}
                  width="16"
                  height="16"
                  style={{ pointerEvents: "none" }} // Prevent icon from interfering with hover
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${isHovered ? "bg-card" : "bg-background/50"}`}
                  >
                    {getActivityIcon(contribution.type)}
                  </div>
                </foreignObject>

                {isHovered && (
                  <foreignObject
                    x={(fromPos.x + toPos.x) / 2 + perpX - 125}
                    y={(fromPos.y + toPos.y) / 2 + perpY - 50}
                    width="250"
                    height="100"
                    style={{ pointerEvents: "none" }} // Prevent tooltip from interfering with hover
                  >
                    <div className="bg-card border border-secondary rounded-md p-3 text-xs shadow-lg">
                      <div className="font-medium text-sm uppercase mb-1">{contribution.content}</div>
                      <div className="text-muted-foreground flex items-center gap-1 mb-2">
                        {getActivityIcon(contribution.type)}
                        <span className="uppercase">{contribution.type.replace("_", " ")}</span>
                        <span>•</span>
                        <span>{contribution.timestamp}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <span className="text-muted-foreground mr-1">FROM:</span>
                          <Avatar className="h-4 w-4 mr-1">
                            <AvatarImage src={getNodeById(contribution.from)?.data.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{getNodeById(contribution.from)?.data.initials}</AvatarFallback>
                          </Avatar>
                          <span>{getNodeById(contribution.from)?.data.name}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-muted-foreground mr-1">TO:</span>
                          <Avatar className="h-4 w-4 mr-1">
                            <AvatarImage src={getNodeById(contribution.to)?.data.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{getNodeById(contribution.to)?.data.initials}</AvatarFallback>
                          </Avatar>
                          <span>{getNodeById(contribution.to)?.data.name}</span>
                        </div>
                      </div>
                    </div>
                  </foreignObject>
                )}
              </g>
            )
          })}

        {/* Main lab node (center) */}
        {dimensions.width > 0 && mainLab && (
          <g
            transform={`translate(${mainLabPosition.x - 32}, ${mainLabPosition.y - 32})`}
            onMouseEnter={() => setHoveredNode(mainLab.id)}
            onMouseLeave={() => setHoveredNode(null)}
          >
            <circle
              cx="32"
              cy="32"
              r="45"
              fill="#1A2252"
              stroke="#A0FFDD"
              strokeWidth="2"
              className={hoveredNode === mainLab.id ? "filter drop-shadow-[0_0_8px_rgba(160,255,221,0.5)]" : ""}
            />
            <foreignObject x="0" y="0" width="64" height="64">
              <div className="w-16 h-16 flex items-center justify-center">
                <Avatar className="h-12 w-12 border-2 border-accent">
                  <AvatarImage src={mainLab.avatar || "/placeholder.svg"} alt={mainLab.name} />
                  <AvatarFallback>{mainLab.initials}</AvatarFallback>
                </Avatar>
              </div>
            </foreignObject>

            {/* Label below the node */}
            <foreignObject x="-48" y="64" width="160" height="30">
              <div className="w-full text-center">
                <div className="text-xs font-medium uppercase bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 inline-block">
                  {mainLab.name}
                </div>
              </div>
            </foreignObject>

            {/* Contribution count */}
            <circle cx="54" cy="10" r="12" fill="#A0FFDD" />
            <text x="54" y="14" textAnchor="middle" className="text-xs font-bold fill-primary-foreground">
              {getContributionCount(mainLab.id)}
            </text>

            {/* Hover info */}
            {hoveredNode === mainLab.id && (
              <foreignObject x="-118" y="-80" width="300" height="70">
                <div className="bg-card border border-accent rounded-md p-3 text-xs shadow-lg">
                  <div className="font-medium text-sm uppercase mb-1">{mainLab.name}</div>
                  <div className="text-muted-foreground mb-1">Main research lab</div>
                  <div className="flex gap-3">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-accent" />
                      <span>{usersByLab[mainLab.id]?.length || 0} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitForkIcon className="h-3 w-3 text-accent" />
                      <span>{forkedLabs.length} forks</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitCommitIcon className="h-3 w-3 text-accent" />
                      <span>{getContributionCount(mainLab.id)} contributions</span>
                    </div>
                  </div>
                </div>
              </foreignObject>
            )}
          </g>
        )}

        {/* Forked lab nodes */}
        {dimensions.width > 0 &&
          forkedLabPositions.map(({ x, y, lab }) => (
            <g
              key={lab.id}
              transform={`translate(${x - 24}, ${y - 24})`}
              onMouseEnter={() => setHoveredNode(lab.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <circle
                cx="24"
                cy="24"
                r="32"
                fill="#0F1642"
                stroke="#FF5400"
                strokeWidth="2"
                strokeOpacity={hoveredNode === lab.id ? "1" : "0.5"}
                className={hoveredNode === lab.id ? "filter drop-shadow-[0_0_5px_rgba(255,84,0,0.4)]" : ""}
              />
              <foreignObject x="0" y="0" width="48" height="48">
                <div className="w-12 h-12 flex items-center justify-center">
                  <Avatar className="h-10 w-10 border-2 border-science-chemistry">
                    <AvatarImage src={lab.avatar || "/placeholder.svg"} alt={lab.name} />
                    <AvatarFallback>{lab.initials}</AvatarFallback>
                  </Avatar>
                </div>
              </foreignObject>

              {/* Label below the node */}
              <foreignObject x="-36" y="48" width="120" height="30">
                <div className="w-full text-center">
                  <div className="text-xs font-medium uppercase bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 inline-block">
                    {lab.name}
                  </div>
                </div>
              </foreignObject>

              {/* Contribution count */}
              <circle cx="40" cy="8" r="10" fill="#FF5400" />
              <text x="40" y="12" textAnchor="middle" className="text-xs font-bold fill-white">
                {getContributionCount(lab.id)}
              </text>

              {/* Hover info */}
              {hoveredNode === lab.id && (
                <foreignObject x="-100" y="-70" width="250" height="70">
                  <div className="bg-card border border-science-chemistry rounded-md p-3 text-xs shadow-lg">
                    <div className="font-medium text-sm uppercase mb-1">{lab.name}</div>
                    <div className="text-muted-foreground mb-1">
                      Forked from {data.labs.find((l) => l.id === lab.forkedFrom)?.name}
                    </div>
                    <div className="flex gap-3">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-science-chemistry" />
                        <span>{usersByLab[lab.id]?.length || 0} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <GitCommitIcon className="h-3 w-3 text-science-chemistry" />
                        <span>{getContributionCount(lab.id)} contributions</span>
                      </div>
                    </div>
                  </div>
                </foreignObject>
              )}
            </g>
          ))}

        {/* User nodes */}
        {dimensions.width > 0 &&
          userPositions.map(({ x, y, user }) => (
            <g
              key={user.id}
              transform={`translate(${x - 20}, ${y - 20})`}
              onMouseEnter={() => setHoveredNode(user.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <circle
                cx="20"
                cy="20"
                r="24"
                fill="#0F1642"
                stroke={user.labId === mainLab?.id ? "#A0FFDD" : "#FF5400"}
                strokeWidth="1.5"
                strokeOpacity={hoveredNode === user.id ? "1" : "0.4"}
                className={
                  hoveredNode === user.id
                    ? `filter drop-shadow-[0_0_5px_${user.labId === mainLab?.id ? "rgba(160,255,221,0.4)" : "rgba(255,84,0,0.4)"}]`
                    : ""
                }
              />
              <foreignObject x="0" y="0" width="40" height="40">
                <div className="w-10 h-10 flex items-center justify-center">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>{user.initials}</AvatarFallback>
                  </Avatar>
                </div>
              </foreignObject>

              {/* Label below the node */}
              <foreignObject x="-40" y="40" width="120" height="25">
                <div className="w-full text-center">
                  <div className="text-[10px] font-medium uppercase bg-background/80 backdrop-blur-sm rounded-md px-1.5 py-0.5 inline-block truncate max-w-full">
                    {user.name.length > 15 ? user.name.substring(0, 15) + "..." : user.name}
                  </div>
                </div>
              </foreignObject>

              {/* Contribution count */}
              <circle cx="34" cy="6" r="10" fill={user.labId === mainLab?.id ? "#A0FFDD" : "#FF5400"} />
              <text x="34" y="10" textAnchor="middle" className="text-[10px] font-bold fill-primary-foreground">
                {user.contributions}
              </text>

              {/* Hover info */}
              {hoveredNode === user.id && (
                <foreignObject x="-90" y="-70" width="200" height="60">
                  <div
                    className={`bg-card border ${user.labId === mainLab?.id ? "border-accent" : "border-science-chemistry"} rounded-md p-2 text-xs shadow-lg`}
                  >
                    <div className="font-medium uppercase mb-1">{user.name}</div>
                    <div className="text-muted-foreground mb-1">{user.role}</div>
                    <div className="flex items-center gap-1">
                      <GitCommitIcon
                        className={`h-3 w-3 ${user.labId === mainLab?.id ? "text-accent" : "text-science-chemistry"}`}
                      />
                      <span>{user.contributions} contributions</span>
                    </div>
                  </div>
                </foreignObject>
              )}
            </g>
          ))}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 bg-card/80 backdrop-blur-sm border border-secondary rounded-md p-2 z-10">
        <div className="text-xs uppercase font-medium mb-1">LEGEND</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getActivityColor("file_upload") }}></div>
            <span>FILE UPLOAD</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getActivityColor("doc_update") }}></div>
            <span>DOC UPDATE</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getActivityColor("comment") }}></div>
            <span>COMMENT</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getActivityColor("fork") }}></div>
            <span>FORK</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute top-2 right-2 bg-card/80 backdrop-blur-sm border border-secondary rounded-md p-2 text-xs text-muted-foreground z-10">
        <div className="uppercase font-medium mb-1 text-foreground">INTERACTION GUIDE</div>
        <div>• Hover over nodes to see details</div>
        <div>• Hover over connections to see contribution info</div>
        <div>• Scroll to zoom in/out</div>
        <div>• Click and drag to pan</div>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-2 right-2 bg-card/80 backdrop-blur-sm border border-secondary rounded-md p-1 z-10 flex flex-col">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setTransform((prev) => ({ ...prev, scale: Math.min(2.5, prev.scale * 1.2) }))}
        >
          <span className="text-lg">+</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setTransform((prev) => ({ ...prev, scale: Math.max(0.5, prev.scale * 0.8) }))}
        >
          <span className="text-lg">-</span>
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={resetView}>
          <span className="text-xs">RESET</span>
        </Button>
      </div>
    </div>
  )
}

// Activity Timeline Component
const ActivityTimeline = ({ activities, userProfiles }: { activities: any[], userProfiles: { [userId: string]: { username: string, initials: string, profilePic?: string } } }) => {
  // Sort activities by created_at descending (most recent first)
  const sortedActivities = [...activities].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  return (
    <div className="space-y-6 overflow-y-auto max-h-[600px] pr-2">
      {sortedActivities.map((activity, idx) => {
        const userInfo = userProfiles[activity.performed_by] || { username: "Unknown", initials: "U", profilePic: undefined }
        return (
          <div key={activity.id || activity.activity_id || activity.created_at || idx} className="flex gap-3 pb-6 border-b border-secondary last:border-0">
            <Avatar className="h-8 w-8 mt-0.5 flex-shrink-0">
              <AvatarImage src={userInfo.profilePic || "/placeholder.svg"} alt={userInfo.username} />
              <AvatarFallback>{userInfo.initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-2 min-w-0 flex-1 pr-3">
              <p className="text-sm break-words">
                <span className="font-medium">{userInfo.username}</span>{" "}
                {activity.activity_type === "fileupload" && "uploaded a file"}
                {activity.activity_type === "filecreated" && "created a file"}
                {activity.activity_type === "filedelete" && "deleted a file"}
                {activity.activity_type === "filemoved" && "moved a file"}
                {activity.activity_type === "fileedited" && "edited a file"}
                {activity.activity_type === "bulletinposted" && "posted a bulletin"}
                {activity.activity_type === "bulletinedited" && "edited a bulletin"}
                {activity.activity_type === "bulletindeleted" && "deleted a bulletin"}
              </p>
              <div className="flex items-center text-xs text-muted-foreground flex-wrap">
                <span className="ml-1 break-all">{activity.activity_name}</span>
              </div>
              <p className="text-xs text-muted-foreground">{activity.created_at ? new Date(activity.created_at).toLocaleString() : ""}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// --- NEW: Helper to build user activity summary for the network graph ---
function buildUserActivitySummary(activities: any[], userProfiles: { [userId: string]: { username: string, initials: string, profilePic?: string } }) {
  const summary: {
    [userId: string]: {
      total: number,
      typeCounts: { [type: string]: number },
      profile: { username: string, initials: string, profilePic?: string }
    }
  } = {}
  activities.forEach((a) => {
    const userId = a.performed_by
    if (!userId) return
    if (!summary[userId]) {
      summary[userId] = {
        total: 0,
        typeCounts: {},
        profile: userProfiles[userId] || { username: "Unknown", initials: "U", profilePic: undefined }
      }
    }
    summary[userId].total++
    summary[userId].typeCounts[a.activity_type] = (summary[userId].typeCounts[a.activity_type] || 0) + 1
  })
  return summary
}

// --- NEW: Real-data NetworkGraph ---
const RealNetworkGraph = ({ labName, userSummary }: { labName: string, userSummary: ReturnType<typeof buildUserActivitySummary> }) => {
  // Layout: center lab, users in a circle
  const userIds = Object.keys(userSummary)
  const center = { x: 400, y: 400 }
  const radius = 260
  const nodeRadius = 36
  const [hoveredUser, setHoveredUser] = useState<string | null>(null)
  const [hoverPos, setHoverPos] = useState<{ x: number, y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div className="relative w-full h-[800px]" ref={containerRef}>
      <svg width={800} height={800}>
        {/* Center lab node */}
        <circle cx={center.x} cy={center.y} r={nodeRadius + 8} fill="#1A2252" stroke="#A0FFDD" strokeWidth={3} />
        <text x={center.x} y={center.y + nodeRadius + 28} textAnchor="middle" className="text-xs font-bold fill-accent uppercase">
          {labName}
        </text>
        {/* User nodes and edges */}
        {userIds.map((userId, i) => {
          const angle = (2 * Math.PI * i) / userIds.length
          const ux = center.x + radius * Math.cos(angle)
          const uy = center.y + radius * Math.sin(angle)
          const { total, profile } = userSummary[userId]
          // Edge thickness: min 2, max 16
          const strokeWidth = Math.max(2, Math.min(16, 2 + total))
          return (
            <g key={userId}>
              {/* Edge */}
              <line
                x1={center.x}
                y1={center.y}
                x2={ux}
                y2={uy}
                stroke="#A0FFDD"
                strokeWidth={strokeWidth}
                opacity={hoveredUser && hoveredUser !== userId ? 0.3 : 0.8}
              />
              {/* User node */}
              <g
                onMouseEnter={() => {
                  setHoveredUser(userId)
                  setHoverPos({ x: ux, y: uy })
                }}
                onMouseLeave={() => {
                  setHoveredUser(null)
                  setHoverPos(null)
                }}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={ux}
                  cy={uy}
                  r={nodeRadius}
                  fill="#0F1642"
                  stroke="#A0FFDD"
                  strokeWidth={hoveredUser === userId ? 4 : 2}
                />
                <foreignObject x={ux - 24} y={uy - 24} width={48} height={48}>
                  <div className="w-12 h-12 flex items-center justify-center">
                    <Avatar className="h-10 w-10 border-2 border-accent">
                      <AvatarImage src={profile.profilePic || "/placeholder.svg"} alt={profile.username} />
                      <AvatarFallback>{profile.initials}</AvatarFallback>
                    </Avatar>
                  </div>
                </foreignObject>
                {/* Username below node */}
                <text x={ux} y={uy + nodeRadius + 16} textAnchor="middle" className="text-xs font-medium fill-accent uppercase">
                  {profile.username.length > 15 ? profile.username.substring(0, 15) + "..." : profile.username}
                </text>
                {/* Total actions count */}
                <circle cx={ux + nodeRadius - 10} cy={uy - nodeRadius + 10} r={12} fill="#A0FFDD" />
                <text x={ux + nodeRadius - 10} y={uy - nodeRadius + 14} textAnchor="middle" className="text-xs font-bold fill-primary-foreground">
                  {total}
                </text>
              </g>
            </g>
          )
        })}
      </svg>
      {/* Absolutely positioned overlay for hovered user */}
      {hoveredUser && hoverPos && (
        <div
          style={{
            position: 'absolute',
            left: hoverPos.x - 90,
            top: hoverPos.y - 120,
            zIndex: 1000,
            pointerEvents: 'auto',
            minWidth: 180,
            maxWidth: 220,
          }}
          className="bg-card border border-accent rounded-md p-3 text-xs shadow-lg animate-fadeIn"
        >
          <div className="font-semibold mb-1">{userSummary[hoveredUser].profile.username}</div>
          <div className="mb-1">Total actions: <span className="font-bold">{userSummary[hoveredUser].total}</span></div>
          <div className="mb-1">Breakdown:</div>
          <ul className="ml-2">
            {Object.entries(userSummary[hoveredUser].typeCounts).map(([type, count]) => (
              <li key={type} className="flex justify-between"><span>{type}</span> <span className="font-bold">{count}</span></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

interface ActivityExplorerProps {
  labId: string
}

export default function ActivityExplorer({ labId }: ActivityExplorerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isCustomEventModalOpen, setIsCustomEventModalOpen] = useState(false)
  const [activities, setActivities] = useState<any[]>([])
  const [userProfiles, setUserProfiles] = useState<{ [userId: string]: { username: string, initials: string, profilePic?: string } }>({})

  useEffect(() => {
    async function fetchActivities() {
      if (!labId) return;
      const { data, error } = await supabase
        .from("activity")
        .select("*")
        .eq("lab_from", labId)
        .order("created_at", { ascending: false })
      if (error) {
        console.error("Error fetching activity logs:", error)
        setActivities([])
        return
      }
      setActivities(data || [])
      // Fetch user profiles for all unique performed_by values
      const uniqueUserIds = Array.from(new Set((data || []).map((a: any) => a.performed_by).filter(Boolean)))
      if (uniqueUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id,username,profilePic')
          .in('user_id', uniqueUserIds)
        const profileMap: { [userId: string]: { username: string, initials: string, profilePic?: string } } = {}
        profiles?.forEach((profile: any) => {
          const initials = profile.username ? profile.username.split(' ').map((n: string) => n[0]).join('').toUpperCase() : "U"
          profileMap[profile.user_id] = { username: profile.username || "Unknown", initials, profilePic: profile.profilePic }
        })
        setUserProfiles(profileMap)
      }
    }
    fetchActivities()
  }, [labId])

  const handleAddCustomEvent = (event: {
    title: string
    description: string
    date: Date
    type: string
  }) => {
    // Create a new activity with the event data
    const newActivity = {
      id: activityData.length + 1,
      type: event.type as "file_upload" | "doc_update" | "comment" | "fork",
      user: {
        name: "Current User", // In a real app, this would be the current user
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "CU",
      },
      content: event.title,
      timestamp: "Just now",
      description: event.description,
    }

    // In a real app, you would send this to an API
    // For now, we'll just log it to the console
    console.log("New custom event:", newActivity)

    // You could update the activityData state here if it was managed with useState
    // For this demo, we'll just show an alert
    alert(`Event "${event.title}" has been logged successfully!`)
  }

  if (isExpanded) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto">
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold uppercase tracking-wide">LAB ACTIVITY</h2>
            <Button
              variant="outline"
              onClick={() => setIsExpanded(false)}
              className="border-accent text-accent hover:bg-secondary"
            >
              <ChevronUp className="h-4 w-4 mr-2" />
              CLOSE
            </Button>
          </div>

          <Tabs defaultValue="visualization" className="w-full">
            <TabsList className="grid grid-cols-2 w-full bg-secondary mb-6">
              <TabsTrigger
                value="visualization"
                className="data-[state=active]:bg-accent data-[state=active]:text-primary-foreground"
              >
                <Users className="h-4 w-4 mr-2" />
                NETWORK
              </TabsTrigger>
              <TabsTrigger
                value="timeline"
                className="data-[state=active]:bg-accent data-[state=active]:text-primary-foreground"
              >
                <GitCommitIcon className="h-4 w-4 mr-2" />
                TIMELINE
              </TabsTrigger>
            </TabsList>

            <TabsContent value="visualization">
              <div className="bg-card/50 border border-secondary rounded-lg p-6">
                <h3 className="text-sm font-medium uppercase mb-4">CONTRIBUTION NETWORK</h3>
                <RealNetworkGraph labName="Lab" userSummary={buildUserActivitySummary(activities, userProfiles)} />
              </div>
            </TabsContent>

            <TabsContent value="timeline">
              <div className="bg-card/50 border border-secondary rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium uppercase">ACTIVITY TIMELINE</h3>
                  <Button
                    variant="outline"
                    onClick={() => setIsCustomEventModalOpen(true)}
                    className="border-accent text-accent hover:bg-secondary"
                  >
                    LOG CUSTOM EVENT
                  </Button>
                </div>
                <ActivityTimeline activities={activities} userProfiles={userProfiles} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
        {/* Custom Event Dialog */}
        <LogCustomEventDialog
          open={isCustomEventModalOpen}
          onOpenChange={setIsCustomEventModalOpen}
          onSubmit={handleAddCustomEvent}
        />
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-1">
            <GitCommitIcon className="h-4 w-4 text-accent" />
            LAB ACTIVITY
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(true)} className="h-8 gap-1">
            <ChevronDown className="h-4 w-4" />
            <span className="text-xs">EXPAND</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {activities.slice(0, 4).map((activity, index) => {
            const userInfo = userProfiles[activity.performed_by] || { username: "Unknown", initials: "U", profilePic: undefined }
            const key = activity.id || activity.activity_id || activity.created_at || index;
            return (
              <div key={key} className="flex gap-3 pb-4 border-b border-secondary last:border-b-0">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={userInfo.profilePic || "/placeholder.svg"} alt={userInfo.username} />
                  <AvatarFallback>{userInfo.initials}</AvatarFallback>
                </Avatar>
                <div className="space-y-2 min-w-0 flex-1 pr-2">
                  <p className="text-sm break-words">
                    <span className="font-medium">{userInfo.username}</span>{" "}
                    {activity.activity_type === "fileupload" && "uploaded a file"}
                    {activity.activity_type === "filecreated" && "created a file"}
                    {activity.activity_type === "filedelete" && "deleted a file"}
                    {activity.activity_type === "filemoved" && "moved a file"}
                    {activity.activity_type === "fileedited" && "edited a file"}
                    {activity.activity_type === "bulletinposted" && "posted a bulletin"}
                    {activity.activity_type === "bulletinedited" && "edited a bulletin"}
                    {activity.activity_type === "bulletindeleted" && "deleted a bulletin"}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground flex-wrap">
                    <span className="ml-1 break-all">{activity.activity_name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{activity.created_at ? new Date(activity.created_at).toLocaleString() : ""}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
