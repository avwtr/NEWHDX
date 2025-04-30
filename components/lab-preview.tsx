"use client"

import { Calendar } from "@/components/ui/calendar"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  FileText,
  Database,
  Code,
  FlaskRoundIcon as Flask,
  Users,
  DollarSign,
  Home,
  Upload,
  Folder,
  PlusCircle,
  Search,
  Clock,
  Eye,
  BookOpen,
  Activity,
  Beaker,
  Microscope,
  Zap,
  LineChart,
  Award,
  Brain,
  Atom,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

// Custom color
const CUSTOM_GREEN = "#A0FFDD"

export function LabPreview() {
  const [activeSection, setActiveSection] = useState("home")

  // Sample lab data
  const labData = {
    name: "CHRONOVIROLOGY LAB",
    creator: "time_hacker",
    description:
      "Investigating viral DNA as potential carriers of temporal information and their effects on human perception of time.",
    tags: ["VIROLOGY", "CHRONOBIOLOGY", "PERCEPTION", "GENETICS", "NEUROSCIENCE"],
    stats: {
      files: 24,
      experiments: 5,
      members: 8,
      lastUpdated: "2 hours ago",
    },
    materials: [
      {
        name: "temporal_markers.pdf",
        type: "document",
        icon: <FileText className="h-4 w-4" />,
        description: "Research paper on viral temporal markers",
      },
      {
        name: "perception_data.csv",
        type: "data",
        icon: <Database className="h-4 w-4" />,
        description: "Time perception test results",
      },
      {
        name: "chronoanalysis.py",
        type: "code",
        icon: <Code className="h-4 w-4" />,
        description: "Analysis of chronobiological patterns",
      },
      {
        name: "viral_protocol.md",
        type: "protocol",
        icon: <BookOpen className="h-4 w-4" />,
        description: "Protocol for viral DNA extraction",
      },
      {
        name: "time_analysis.ipynb",
        type: "code",
        icon: <Code className="h-4 w-4" />,
        description: "Jupyter notebook with time dilation data",
      },
      {
        name: "chrono_model.h5",
        type: "data",
        icon: <Database className="h-4 w-4" />,
        description: "Trained chronobiological model",
      },
    ],
    experiments: [
      {
        name: "Viral Chronomarkers in DNA",
        status: "In Progress",
        startDate: "2023-10-15",
        description: "Identifying temporal markers in viral DNA sequences",
      },
      {
        name: "Time Perception Alteration",
        status: "Concluded",
        startDate: "2023-08-01",
        endDate: "2023-09-30",
        description: "Effects of viral proteins on subjective time perception",
      },
      {
        name: "Chronobiological Rhythms",
        status: "In Progress",
        startDate: "2023-09-05",
        description: "Mapping altered circadian rhythms in infected cells",
      },
      {
        name: "Temporal Gene Expression",
        status: "Concluded",
        startDate: "2023-07-10",
        endDate: "2023-08-25",
        description: "Temporal patterns in gene expression post-infection",
      },
    ],
    members: [
      { username: "time_hacker", interests: ["VIROLOGY", "GENETICS"], contributions: 87, actions: 142 },
      { username: "neural_voyager", interests: ["NEUROSCIENCE", "PERCEPTION"], contributions: 63, actions: 98 },
      { username: "gene_chronos", interests: ["GENETICS", "CHRONOBIOLOGY"], contributions: 51, actions: 76 },
      { username: "viral_decoder", interests: ["VIROLOGY", "BIOINFORMATICS"], contributions: 42, actions: 65 },
      { username: "perception_shift", interests: ["PERCEPTION", "PSYCHOLOGY"], contributions: 38, actions: 59 },
      { username: "dna_timekeeper", interests: ["GENETICS", "MOLECULAR BIOLOGY"], contributions: 29, actions: 47 },
      { username: "chrono_explorer", interests: ["CHRONOBIOLOGY", "NEUROSCIENCE"], contributions: 24, actions: 38 },
      { username: "quantum_biologist", interests: ["QUANTUM BIOLOGY", "BIOPHYSICS"], contributions: 18, actions: 31 },
    ],
    funding: {
      total: "$125,000",
      goal: "$150,000",
      donors: 48,
      members: 12,
    },
    activity: [
      { type: "file", user: "time_hacker", action: "uploaded", target: "chrono_model.h5", time: "2 hours ago" },
      {
        type: "experiment",
        user: "neural_voyager",
        action: "updated",
        target: "Viral Chronomarkers in DNA",
        time: "Yesterday",
      },
      { type: "member", user: "quantum_biologist", action: "joined", time: "3 days ago" },
      { type: "funding", user: "gene_chronos", action: "received donation", target: "$500", time: "4 days ago" },
      { type: "file", user: "viral_decoder", action: "modified", target: "chronoanalysis.py", time: "5 days ago" },
      {
        type: "experiment",
        user: "time_hacker",
        action: "concluded",
        target: "Temporal Gene Expression",
        time: "1 week ago",
      },
      {
        type: "file",
        user: "perception_shift",
        action: "commented on",
        target: "temporal_markers.pdf",
        time: "1 week ago",
      },
      { type: "member", user: "dna_timekeeper", action: "invited", target: "chrono_explorer", time: "2 weeks ago" },
    ],
  }

  // Tag colors for science categories
  const getTagColor = (tag: string) => {
    const colors = {
      VIROLOGY: { bg: "#F59E0B30", text: "#F59E0B" },
      CHRONOBIOLOGY: { bg: "#3B82F630", text: "#3B82F6" },
      PERCEPTION: { bg: "#EC489930", text: "#EC4899" },
      GENETICS: { bg: "#10B98130", text: "#10B981" },
      NEUROSCIENCE: { bg: "#8B5CF630", text: "#8B5CF6" },
      PSYCHOLOGY: { bg: "#F4366830", text: "#F43668" },
      BIOINFORMATICS: { bg: "#06B6D430", text: "#06B6D4" },
      "MOLECULAR BIOLOGY": { bg: "#84CC1630", text: "#84CC16" },
      "QUANTUM BIOLOGY": { bg: "#7C3AED30", text: "#7C3AED" },
      BIOPHYSICS: { bg: "#F9731630", text: "#F97316" },
    }

    return colors[tag as keyof typeof colors] || { bg: "#6B728030", text: "#6B7280" }
  }

  // Mobile navigation options
  const navItems = [
    { id: "home", label: "HOME", icon: <Home className="h-4 w-4" /> },
    { id: "materials", label: "LAB MATERIALS", icon: <Folder className="h-4 w-4" /> },
    { id: "experiments", label: "EXPERIMENTS", icon: <Flask className="h-4 w-4" /> },
    { id: "members", label: "MEMBERS", icon: <Users className="h-4 w-4" /> },
    { id: "funding", label: "FUNDING", icon: <DollarSign className="h-4 w-4" /> },
    { id: "activity", label: "ACTIVITY", icon: <Activity className="h-4 w-4" /> },
  ]

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case "home":
        return (
          <div className="space-y-6">
            <div className="p-4 rounded-md border border-gray-800 bg-gray-900">
              <h4 className="font-bold mb-2">About This Lab</h4>
              <p className="text-sm text-gray-400">{labData.description}</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard icon={<Folder />} label="FILES" value={labData.stats.files} />
              <StatCard icon={<Flask />} label="EXPERIMENTS" value={labData.stats.experiments} />
              <StatCard icon={<Users />} label="MEMBERS" value={labData.stats.members} />
              <StatCard icon={<DollarSign />} label="FUNDING" value={labData.funding.total} />
            </div>

            {/* Recent Activity */}
            <div>
              <h4 className="font-bold mb-3">RECENT ACTIVITY</h4>
              <div className="space-y-2">
                {labData.activity.slice(0, 3).map((item, index) => (
                  <ActivityItem
                    key={index}
                    icon={
                      item.type === "file" ? (
                        <FileText className="h-4 w-4" style={{ color: CUSTOM_GREEN }} />
                      ) : item.type === "experiment" ? (
                        <Flask className="h-4 w-4" style={{ color: CUSTOM_GREEN }} />
                      ) : item.type === "member" ? (
                        <Users className="h-4 w-4" style={{ color: CUSTOM_GREEN }} />
                      ) : (
                        <DollarSign className="h-4 w-4" style={{ color: CUSTOM_GREEN }} />
                      )
                    }
                    text={`${item.user} ${item.action} ${item.target || ""}`}
                    time={item.time}
                  />
                ))}
              </div>
            </div>

            {/* Featured Materials */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold">FEATURED MATERIALS</h4>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0"
                  style={{ color: CUSTOM_GREEN }}
                  onClick={() => setActiveSection("materials")}
                >
                  View All
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {labData.materials.slice(0, 2).map((file, index) => (
                  <FileCard key={index} file={file} />
                ))}
              </div>
            </div>
          </div>
        )

      case "materials":
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold">LAB MATERIALS</h4>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-gray-500" />
                  <Input placeholder="Search materials..." className="pl-8 h-9 bg-gray-900 border-gray-800 w-[200px]" />
                </div>
                <Button size="sm" className="h-9" style={{ backgroundColor: CUSTOM_GREEN, color: "#000" }}>
                  <Upload className="h-4 w-4 mr-1" />
                  UPLOAD
                </Button>
                <Button size="sm" variant="outline" className="h-9">
                  <PlusCircle className="h-4 w-4 mr-1" />
                  NEW
                </Button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4">
              <Badge className="cursor-pointer bg-gray-800 hover:bg-gray-700">ALL</Badge>
              <Badge className="cursor-pointer bg-transparent border border-gray-700 text-gray-400 hover:bg-gray-800">
                DOCUMENTS
              </Badge>
              <Badge className="cursor-pointer bg-transparent border border-gray-700 text-gray-400 hover:bg-gray-800">
                DATA
              </Badge>
              <Badge className="cursor-pointer bg-transparent border border-gray-700 text-gray-400 hover:bg-gray-800">
                CODE
              </Badge>
              <Badge className="cursor-pointer bg-transparent border border-gray-700 text-gray-400 hover:bg-gray-800">
                PROTOCOLS
              </Badge>
            </div>

            {/* Materials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {labData.materials.map((file, index) => (
                <FileCard key={index} file={file} />
              ))}
            </div>
          </div>
        )

      case "experiments":
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold">EXPERIMENTS</h4>
              <Button size="sm" variant="outline" className="h-9">
                <PlusCircle className="h-4 w-4 mr-1" />
                NEW EXPERIMENT
              </Button>
            </div>

            <div className="space-y-4">
              {labData.experiments.map((experiment, index) => (
                <div
                  key={index}
                  className="p-4 rounded-md border border-gray-800 bg-gray-900 hover:border-gray-700 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium">{experiment.name}</h5>
                        <Badge
                          style={{
                            backgroundColor: experiment.status === "Concluded" ? "#10B981" : "#3B82F6",
                            color: "white",
                          }}
                        >
                          {experiment.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 mt-2">{experiment.description}</p>
                      {experiment.startDate && (
                        <div className="flex items-center text-xs text-gray-500 mt-3">
                          <Clock className="h-3 w-3 mr-1" />
                          Started: {experiment.startDate}
                          {experiment.endDate && ` • Ended: ${experiment.endDate}`}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant={experiment.status === "Concluded" ? "outline" : "default"}
                      style={
                        experiment.status === "Concluded"
                          ? { borderColor: CUSTOM_GREEN, color: CUSTOM_GREEN }
                          : { backgroundColor: CUSTOM_GREEN, color: "#000" }
                      }
                    >
                      {experiment.status === "Concluded" ? "VIEW RESULTS" : "VIEW"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case "members":
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold">LAB MEMBERS</h4>
              <Button size="sm" variant="outline" className="h-9">
                <PlusCircle className="h-4 w-4 mr-1" />
                INVITE MEMBER
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {labData.members.map((member, index) => (
                <div
                  key={index}
                  className="p-3 rounded-md border border-gray-800 bg-gray-900 hover:border-gray-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-start">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center mr-3 text-sm font-medium flex-shrink-0"
                      style={{ backgroundColor: `${CUSTOM_GREEN}30`, color: CUSTOM_GREEN }}
                    >
                      {member.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-medium truncate">{member.username}</h5>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {member.interests.map((interest, i) => {
                          const color = getTagColor(interest)
                          return (
                            <span
                              key={i}
                              className="inline-block px-1.5 py-0.5 rounded text-xs"
                              style={{ backgroundColor: color.bg, color: color.text }}
                            >
                              {interest}
                            </span>
                          )
                        })}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span>{member.contributions} contributions</span>
                        <span>{member.actions} actions</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case "funding":
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold">LAB FUNDING</h4>
              <Button size="sm" style={{ backgroundColor: CUSTOM_GREEN, color: "#000" }}>
                <DollarSign className="h-4 w-4 mr-1" />
                DONATE
              </Button>
            </div>

            <div className="p-4 rounded-md border border-gray-800 bg-gray-900 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-400">Funding Goal</span>
                <span className="text-sm font-medium">
                  {labData.funding.total} / {labData.funding.goal}
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(Number.parseInt(labData.funding.total.replace(/\$|,/g, "")) / Number.parseInt(labData.funding.goal.replace(/\$|,/g, ""))) * 100}%`,
                    backgroundColor: CUSTOM_GREEN,
                  }}
                ></div>
              </div>
              <div className="flex justify-between mt-4 text-sm">
                <div>
                  <span className="text-gray-400">Donors:</span> {labData.funding.donors}
                </div>
                <div>
                  <span className="text-gray-400">Members:</span> {labData.funding.members}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="font-medium">MEMBERSHIP TIERS</h5>

              {[
                {
                  name: "SUPPORTER",
                  price: "$5/month",
                  benefits: ["Access to lab updates", "Name in acknowledgements"],
                },
                {
                  name: "CONTRIBUTOR",
                  price: "$15/month",
                  benefits: ["All Supporter benefits", "Access to raw data", "Monthly Q&A sessions"],
                },
                {
                  name: "PARTNER",
                  price: "$50/month",
                  benefits: [
                    "All Contributor benefits",
                    "Co-authorship opportunities",
                    "Direct collaboration with researchers",
                  ],
                },
              ].map((tier, index) => (
                <div
                  key={index}
                  className="p-4 rounded-md border border-gray-800 bg-gray-900 hover:border-gray-700 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <h6 className="font-medium">{tier.name}</h6>
                    <span className="font-bold" style={{ color: CUSTOM_GREEN }}>
                      {tier.price}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {tier.benefits.map((benefit, i) => (
                      <li
                        key={i}
                        className="text-sm text-gray-400 flex items-start filter blur-sm hover:blur-none transition-all duration-300"
                      >
                        <span className="mr-2 text-xs" style={{ color: CUSTOM_GREEN }}>
                          •
                        </span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )

      case "activity":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold">LAB ACTIVITY</h4>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-9">
                  <Calendar className="h-4 w-4 mr-1" />
                  LAST 7 DAYS
                </Button>
              </div>
            </div>

            {/* Contribution Graph - Moved to top */}
            <div>
              <h4 className="font-bold mb-4">CONTRIBUTION NETWORK</h4>
              <div className="p-4 rounded-md border border-gray-800 bg-gray-900 h-[300px] relative overflow-hidden">
                {/* Simulated network graph */}
                <div className="absolute inset-0">
                  {/* Central node */}
                  <div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      backgroundColor: `${CUSTOM_GREEN}40`,
                      color: CUSTOM_GREEN,
                      border: `2px solid ${CUSTOM_GREEN}`,
                    }}
                  >
                    LAB
                  </div>

                  {/* Member nodes */}
                  {labData.members.map((member, index) => {
                    // Position nodes in a circle around the center
                    const angle = (index / labData.members.length) * 2 * Math.PI
                    const radius = 120 // Distance from center
                    const x = 50 + 45 * Math.cos(angle)
                    const y = 50 + 45 * Math.sin(angle)

                    return (
                      <div key={index}>
                        {/* Connection line */}
                        <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 1 }}>
                          <line
                            x1="50%"
                            y1="50%"
                            x2={`${x}%`}
                            y2={`${y}%`}
                            stroke={CUSTOM_GREEN}
                            strokeWidth="1"
                            strokeOpacity="0.5"
                          />
                        </svg>

                        {/* Node */}
                        <div
                          className="absolute h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium"
                          style={{
                            top: `${y}%`,
                            left: `${x}%`,
                            transform: "translate(-50%, -50%)",
                            backgroundColor: `${CUSTOM_GREEN}30`,
                            color: CUSTOM_GREEN,
                            border: `1px solid ${CUSTOM_GREEN}`,
                            zIndex: 2,
                          }}
                        >
                          {member.username.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    )
                  })}

                  {/* Activity nodes */}
                  {labData.activity.slice(0, 5).map((activity, index) => {
                    // Position activity nodes randomly
                    const angle = Math.random() * 2 * Math.PI
                    const radius = 20 + Math.random() * 20 // Varying distances
                    const x = 50 + radius * Math.cos(angle)
                    const y = 50 + radius * Math.sin(angle)

                    return (
                      <div key={`activity-${index}`}>
                        {/* Connection line */}
                        <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 1 }}>
                          <line
                            x1="50%"
                            y1="50%"
                            x2={`${x}%`}
                            y2={`${y}%`}
                            stroke={CUSTOM_GREEN}
                            strokeWidth="1"
                            strokeOpacity="0.7"
                          />
                        </svg>

                        {/* Node */}
                        <div
                          className="absolute h-6 w-6 rounded-full flex items-center justify-center"
                          style={{
                            top: `${y}%`,
                            left: `${x}%`,
                            transform: "translate(-50%, -50%)",
                            backgroundColor:
                              activity.type === "file"
                                ? "#3B82F630"
                                : activity.type === "experiment"
                                  ? "#10B98130"
                                  : activity.type === "member"
                                    ? "#8B5CF630"
                                    : "#F59E0B30",
                            color:
                              activity.type === "file"
                                ? "#3B82F6"
                                : activity.type === "experiment"
                                  ? "#10B981"
                                  : activity.type === "member"
                                    ? "#8B5CF6"
                                    : "#F59E0B",
                            border: `1px solid ${
                              activity.type === "file"
                                ? "#3B82F6"
                                : activity.type === "experiment"
                                  ? "#10B981"
                                  : activity.type === "member"
                                    ? "#8B5CF6"
                                    : "#F59E0B"
                            }`,
                            zIndex: 2,
                          }}
                        >
                          {activity.type === "file" ? (
                            <FileText className="h-3 w-3" />
                          ) : activity.type === "experiment" ? (
                            <Flask className="h-3 w-3" />
                          ) : activity.type === "member" ? (
                            <Users className="h-3 w-3" />
                          ) : (
                            <DollarSign className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Legend */}
                <div className="absolute bottom-2 right-2 bg-gray-950 p-2 rounded-md border border-gray-800 text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CUSTOM_GREEN }}></div>
                    <span>Members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#3B82F6" }}></div>
                    <span>Activities</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div>
              <h4 className="font-bold mb-3">ACTIVITY TIMELINE</h4>
              <div className="space-y-3">
                {labData.activity.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${CUSTOM_GREEN}30`, color: CUSTOM_GREEN }}
                    >
                      {item.type === "file" ? (
                        <FileText className="h-4 w-4" />
                      ) : item.type === "experiment" ? (
                        <Flask className="h-4 w-4" />
                      ) : item.type === "member" ? (
                        <Users className="h-4 w-4" />
                      ) : (
                        <DollarSign className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-white">
                        {item.user} {item.action} {item.target}
                      </p>
                      <p className="text-xs text-gray-400">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      default:
        return <div>Select a section from the sidebar</div>
    }
  }

  return (
    <div className="border border-gray-800 rounded-lg bg-gray-950 overflow-hidden">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-800 bg-gray-900">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-bold" style={{ color: CUSTOM_GREEN }}>
              {labData.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs text-gray-400">Created by {labData.creator}</span>
              {labData.tags.slice(0, 3).map((tag, index) => {
                const color = getTagColor(tag)
                return (
                  <Badge
                    key={index}
                    className="text-[10px] sm:text-xs"
                    style={{ backgroundColor: color.bg, color: color.text }}
                  >
                    {tag}
                  </Badge>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="p-2 border-b border-gray-800 bg-gray-950 md:hidden">
        <div className="grid grid-cols-3 gap-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={`flex items-center justify-start gap-2 ${
                activeSection === item.id ? "bg-gray-900 text-white" : "text-gray-400"
              }`}
              onClick={() => setActiveSection(item.id)}
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="w-48 border-r border-gray-800 bg-gray-950 p-2 hidden md:block">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`flex items-center w-full px-3 py-2 text-sm rounded-md ${
                  activeSection === item.id
                    ? "bg-gray-900 text-white"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-900/50"
                }`}
                onClick={() => setActiveSection(item.id)}
              >
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-3 sm:p-4 overflow-x-auto">
          <div className="min-w-[300px]">{renderContent()}</div>
        </div>
      </div>

      {/* Lab Stats Footer */}
      <div className="bg-gray-900 p-2 sm:p-3 border-t border-gray-800">
        <div className="flex flex-col sm:flex-row sm:justify-between text-xs text-gray-400 gap-2 sm:gap-0">
          <div className="flex flex-wrap gap-2">
            <span>{labData.stats.files} Files</span>
            <span>•</span>
            <span>{labData.stats.experiments} Experiments</span>
            <span>•</span>
            <span>{labData.stats.members} Members</span>
          </div>
          <div>Last updated: {labData.stats.lastUpdated}</div>
        </div>
      </div>
    </div>
  )
}

// Helper component for stats
function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="p-3 sm:p-4 rounded-md border border-gray-800 bg-gray-900">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="text-gray-400">{icon}</div>
        <div>
          <div className="text-xs sm:text-sm text-gray-400">{label}</div>
          <div className="text-sm sm:text-base font-bold mt-0.5">{value}</div>
        </div>
      </div>
    </div>
  )
}

function ActivityItem({ icon, text, time }: { icon: React.ReactNode; text: string; time: string }) {
  return (
    <div className="flex items-start gap-3 p-2 rounded bg-gray-900 border border-gray-800">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-sm text-white">{text}</p>
        <p className="text-xs text-gray-400">{time}</p>
      </div>
    </div>
  )
}

function FileCard({ file }: { file: { name: string; type: string; icon: React.ReactNode; description: string } }) {
  return (
    <div className="p-3 rounded-md border border-gray-800 bg-gray-900 hover:border-gray-700 transition-colors cursor-pointer">
      <div className="flex items-start">
        <div
          className="p-2 rounded-md mr-3 flex-shrink-0"
          style={{ backgroundColor: `#A0FFDD20`, color: CUSTOM_GREEN }}
        >
          {file.icon}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-white truncate">{file.name}</p>
            <Badge
              className="text-[10px] flex-shrink-0"
              style={{
                backgroundColor:
                  file.type === "code"
                    ? "#3B82F6"
                    : file.type === "data"
                      ? "#8B5CF6"
                      : file.type === "protocol"
                        ? "#EC4899"
                        : "#10B981",
                color: "white",
              }}
            >
              {file.type.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs text-gray-400 mt-1 truncate">{file.description}</p>
          <div className="flex items-center text-xs text-gray-500 mt-2">
            <Eye className="h-3 w-3 mr-1" />
            12 views
          </div>
        </div>
      </div>
    </div>
  )
}
