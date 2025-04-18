"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, Star, FileText, Database, DollarSign, Download, ThumbsUp, Eye, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Custom color
const CUSTOM_GREEN = "#A0FFDD"

export function ExploreContribute() {
  const [activePane, setActivePane] = useState(0)
  const [searchText, setSearchText] = useState("")
  const [searchComplete, setSearchComplete] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [contributionStep, setContributionStep] = useState(0)
  const [donationAmount, setDonationAmount] = useState(0)
  const [showThankYou, setShowThankYou] = useState(false)

  // Auto-advance panes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activePane < 3) {
        setActivePane(activePane + 1)
      } else {
        setActivePane(0)
      }
    }, 12000) // 12 seconds per pane

    return () => clearTimeout(timer)
  }, [activePane])

  // Typing animation for search - SPED UP
  useEffect(() => {
    if (activePane === 0 && searchText.length < "neuroscience research".length) {
      const timer = setTimeout(() => {
        setSearchText("neuroscience research".substring(0, searchText.length + 1))
        if (searchText.length + 1 === "neuroscience research".length) {
          setTimeout(() => setSearchComplete(true), 300) // Faster completion
        }
      }, 80) // Faster typing (was 150)

      return () => clearTimeout(timer)
    }
  }, [activePane, searchText])

  // Download progress animation
  useEffect(() => {
    if (activePane === 1 && downloadProgress < 100) {
      const timer = setTimeout(() => {
        setDownloadProgress((prev) => Math.min(prev + 5, 100))
      }, 200)

      return () => clearTimeout(timer)
    }
  }, [activePane, downloadProgress])

  // Contribution step animation
  useEffect(() => {
    if (activePane === 2 && contributionStep < 3) {
      const timer = setTimeout(() => {
        setContributionStep((prev) => prev + 1)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [activePane, contributionStep])

  // Donation animation
  useEffect(() => {
    if (activePane === 3 && donationAmount < 25) {
      const timer = setTimeout(() => {
        setDonationAmount((prev) => prev + 1)
        if (donationAmount + 1 === 25) {
          setTimeout(() => setShowThankYou(true), 1000)
        }
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [activePane, donationAmount])

  // Reset animations when pane changes
  useEffect(() => {
    setSearchText("")
    setSearchComplete(false)
    setSelectedCategory(null)
    setDownloadProgress(0)
    setContributionStep(0)
    setDonationAmount(0)
    setShowThankYou(false)
  }, [activePane])

  const renderPane = () => {
    switch (activePane) {
      case 0:
        return (
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">SEARCH FOR RESEARCH</h3>

            <div className="relative mb-4 sm:mb-6">
              <Search className="h-4 sm:h-5 w-4 sm:w-5 absolute left-3 top-2.5 text-gray-500" />
              <div className="pl-10 pr-3 py-2 bg-gray-950 border border-gray-800 rounded-md flex items-center text-sm sm:text-base">
                <span>{searchText}</span>
                <span className="animate-blink ml-0.5">|</span>
              </div>
            </div>

            {searchComplete && (
              <div className="space-y-3 sm:space-y-4 animate-fadeIn">
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                  <Badge
                    className={`cursor-pointer text-xs sm:text-sm ${
                      selectedCategory === "NEUROSCIENCE" ? "bg-science-neuroscience" : "bg-gray-800 hover:bg-gray-700"
                    }`}
                    onClick={() => setSelectedCategory("NEUROSCIENCE")}
                  >
                    NEUROSCIENCE
                  </Badge>
                  <Badge
                    className={`cursor-pointer text-xs sm:text-sm ${
                      selectedCategory === "AI" ? "bg-science-ai" : "bg-gray-800 hover:bg-gray-700"
                    }`}
                    onClick={() => setSelectedCategory("AI")}
                  >
                    AI
                  </Badge>
                  <Badge
                    className={`cursor-pointer text-xs sm:text-sm ${
                      selectedCategory === "BIOLOGY" ? "bg-science-biology" : "bg-gray-800 hover:bg-gray-700"
                    }`}
                    onClick={() => setSelectedCategory("BIOLOGY")}
                  >
                    BIOLOGY
                  </Badge>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      title: "NEURAL CORRELATES OF CONSCIOUSNESS",
                      lab: "CONSCIOUSNESS RESEARCH LAB",
                      description: "Investigating the neural basis of conscious experience",
                      files: 42,
                      stars: 128,
                    },
                    {
                      title: "BRAIN-COMPUTER INTERFACES",
                      lab: "NEURAL ENGINEERING COLLECTIVE",
                      description: "Open-source BCI designs and protocols",
                      files: 36,
                      stars: 95,
                    },
                    {
                      title: "MEMORY FORMATION MECHANISMS",
                      lab: "COGNITIVE NEUROSCIENCE INITIATIVE",
                      description: "Research on memory encoding and retrieval",
                      files: 58,
                      stars: 210,
                    },
                  ].map((result, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border border-gray-800 bg-gray-950 hover:border-gray-700 transition-colors cursor-pointer ${
                        index === 0 ? "ring-2 ring-offset-2 ring-offset-gray-900 ring-green-500" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-white">{result.title}</h4>
                          <p className="text-xs text-gray-400 mt-1">{result.lab}</p>
                          <p className="text-sm text-gray-400 mt-1">{result.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          {result.files} Files
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1" />
                          {result.stars} Stars
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 1:
        return (
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">ACCESS RESEARCH MATERIALS</h3>

            <div className="p-4 rounded-lg border border-gray-800 bg-gray-950 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-white">NEURAL CORRELATES OF CONSCIOUSNESS</h4>
                  <p className="text-xs text-gray-400 mt-1">CONSCIOUSNESS RESEARCH LAB</p>
                </div>
                <Badge className="bg-science-neuroscience">NEUROSCIENCE</Badge>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between p-3 rounded border border-gray-800 bg-gray-900 hover:border-gray-700 transition-colors cursor-pointer">
                  <div className="flex items-center">
                    <Database className="h-4 w-4 mr-2 text-blue-400" />
                    <span>consciousness_eeg_data.csv</span>
                  </div>
                  <Button size="sm" className="h-8" style={{ backgroundColor: CUSTOM_GREEN, color: "#000" }}>
                    <Download className="h-3 w-3 mr-1" />
                    DOWNLOAD
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 rounded border border-gray-800 bg-gray-900 hover:border-gray-700 transition-colors cursor-pointer">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-purple-400" />
                    <span>consciousness_protocol.pdf</span>
                  </div>
                  <Button size="sm" className="h-8" style={{ backgroundColor: CUSTOM_GREEN, color: "#000" }}>
                    <Download className="h-3 w-3 mr-1" />
                    DOWNLOAD
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 rounded border border-gray-800 bg-gray-900 hover:border-gray-700 transition-colors cursor-pointer animate-pulse">
                  <div className="flex items-center">
                    <Database className="h-4 w-4 mr-2 text-green-400" />
                    <span>fmri_consciousness_data.nii</span>
                  </div>
                  <div className="w-24">
                    <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-200 ease-in-out"
                        style={{
                          width: `${downloadProgress}%`,
                          backgroundColor: CUSTOM_GREEN,
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-center mt-1">{downloadProgress}%</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h5 className="font-medium mb-1">OPEN ACCESS</h5>
                <p className="text-xs text-gray-400">
                  All materials are freely available for research and educational purposes.
                  <br />
                  No login required. Download, use, and build upon these resources.
                </p>
              </div>
              <Button variant="outline" style={{ borderColor: CUSTOM_GREEN, color: CUSTOM_GREEN }}>
                SHARE
              </Button>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">CONTRIBUTE YOUR EXPERTISE</h3>

            <div className="p-4 rounded-lg border border-gray-800 bg-gray-950 mb-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-white">CONSCIOUSNESS RESEARCH LAB</h4>
                  <p className="text-xs text-gray-400 mt-1">Contributing to: Neural Correlates of Consciousness</p>
                </div>
                <Badge className="bg-science-neuroscience">NEUROSCIENCE</Badge>
              </div>

              <div className="space-y-4">
                {/* Contribution Type */}
                <div>
                  <label className="block text-sm font-medium mb-1">Contribution Type</label>
                  <div className="flex flex-wrap gap-2">
                    {["Protocol Update", "Data Analysis", "Code", "Literature Review", "Experiment Design"].map(
                      (type, i) => (
                        <Badge
                          key={i}
                          className={`cursor-pointer ${contributionStep >= 1 && i === 0 ? "bg-green-700" : "bg-gray-800"}`}
                        >
                          {type}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <div className="bg-gray-900 border border-gray-800 rounded-md p-2 text-sm">
                    {contributionStep >= 1 ? "Updated EEG Protocol for Consciousness Studies" : ""}
                    {contributionStep < 1 && <span className="animate-blink">|</span>}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <div className="bg-gray-900 border border-gray-800 rounded-md p-2 h-20 text-sm">
                    {contributionStep >= 2
                      ? "This protocol update improves signal-to-noise ratio by modifying the electrode placement and filtering parameters. Based on our recent findings, this should increase detection of consciousness markers by approximately 15%."
                      : ""}
                    {contributionStep < 2 && <span className="animate-blink">|</span>}
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium mb-1">Attachments</label>
                  {contributionStep >= 3 ? (
                    <div className="bg-gray-900 border border-gray-800 rounded-md p-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-purple-400" />
                        <span className="text-sm">improved_eeg_protocol_v2.pdf</span>
                      </div>
                      <Badge className="bg-green-900/50 text-green-400">Uploaded</Badge>
                    </div>
                  ) : (
                    <div className="border border-dashed border-gray-700 rounded-md p-4 text-center">
                      <Upload className="h-5 w-5 mx-auto mb-2 text-gray-500" />
                      <p className="text-sm text-gray-500">Drag files here or click to upload</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Section */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                <p>Your contribution will be reviewed by lab members.</p>
                <p>Average review time: 2-3 days</p>
              </div>
              <Button
                className={contributionStep >= 3 ? "animate-pulse" : ""}
                style={{ backgroundColor: CUSTOM_GREEN, color: "#000" }}
              >
                {contributionStep >= 3 ? "Submit Contribution" : "Continue"}
              </Button>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">SUPPORT RESEARCH</h3>

            <div className="p-4 rounded-lg border border-gray-800 bg-gray-950 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-white">CONSCIOUSNESS RESEARCH LAB</h4>
                  <p className="text-xs text-gray-400 mt-1">Investigating the neural basis of conscious experience</p>
                </div>
                <Badge className="bg-science-neuroscience">NEUROSCIENCE</Badge>
              </div>

              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">Funding Goal</span>
                  <span className="text-sm font-medium">$75,000 / $100,000</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: "75%",
                      backgroundColor: CUSTOM_GREEN,
                    }}
                  ></div>
                </div>
              </div>

              <div className="text-center mb-4">
                <h5 className="font-medium mb-2">YOUR DONATION</h5>
                <div className="text-4xl font-bold" style={{ color: CUSTOM_GREEN }}>
                  ${donationAmount}
                </div>
              </div>

              {showThankYou ? (
                <div className="animate-fadeIn text-center">
                  <div className="inline-block p-2 rounded-full bg-green-900/30 mb-3">
                    <ThumbsUp className="h-6 w-6 text-green-400" />
                  </div>
                  <h5 className="font-medium text-green-400 mb-2">Thank You For Your Support!</h5>
                  <p className="text-sm text-gray-300">
                    Your donation helps advance our understanding of consciousness.
                  </p>
                </div>
              ) : (
                <div className="flex justify-center">
                  <Button className="w-full" style={{ backgroundColor: CUSTOM_GREEN, color: "#000" }}>
                    <DollarSign className="h-4 w-4 mr-1" />
                    DONATE
                  </Button>
                </div>
              )}
            </div>

            <div className="text-center text-sm text-gray-400">
              <p>Supporters receive regular updates on research progress.</p>
              <p className="mt-1">100% of donations go directly to equipment and researcher support.</p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Pane Navigation */}
      <div className="flex justify-center gap-1.5 sm:gap-2">
        {[0, 1, 2, 3].map((pane) => (
          <button
            key={pane}
            className={`h-1.5 sm:h-2 rounded-full transition-all ${
              activePane === pane ? "w-6 sm:w-8 bg-green-500" : "w-1.5 sm:w-2 bg-gray-700"
            }`}
            onClick={() => setActivePane(pane)}
          />
        ))}
      </div>

      {/* Pane Title */}
      <div className="text-center px-4 sm:px-0">
        <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: CUSTOM_GREEN }}>
          {activePane === 0
            ? "DISCOVER FASCINATING OPEN SCIENCE"
            : activePane === 1
              ? "ACCESS OPEN SOURCE MATERIALS"
              : activePane === 2
                ? "CONTRIBUTE TO LABS"
                : "FUND SCIENCE DIRECTLY"}
        </h2>
        <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto">
          {activePane === 0
            ? "Subscribe, or donate to fascinating labs."
            : activePane === 1
              ? "Download and use open data, protocols, docs, and code from labs on the platform."
              : activePane === 2
                ? "Make meaningful contributions to advance science."
                : "Help fund important research through direct-to-lab funding."}
        </p>
      </div>

      {/* Content Pane */}
      <div className="transition-opacity duration-500 ease-in-out px-4 sm:px-0">
        <div className="bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-800 min-h-[400px] overflow-x-auto">
          <div className="min-w-[300px]">{renderPane()}</div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between px-4 sm:px-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActivePane((activePane - 1 + 4) % 4)}
          style={{ borderColor: CUSTOM_GREEN, color: CUSTOM_GREEN }}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActivePane((activePane + 1) % 4)}
          style={{ borderColor: CUSTOM_GREEN, color: CUSTOM_GREEN }}
        >
          Next
        </Button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
      `}</style>
    </div>
  )
}

function FileCard({ file }: { file: { name: string; type: string; icon: React.ReactNode } }) {
  return (
    <div className="p-3 rounded-md border border-gray-800 bg-gray-900">
      <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
        <div
          className="p-2 rounded-md flex-shrink-0 w-fit"
          style={{ backgroundColor: `${CUSTOM_GREEN}20`, color: CUSTOM_GREEN }}
        >
          {file.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs sm:text-sm font-medium text-white break-all">{file.name}</p>
            <Badge
              className="text-[10px] sm:text-xs flex-shrink-0"
              style={{ backgroundColor: `${CUSTOM_GREEN}30`, color: CUSTOM_GREEN }}
            >
              {file.type}
            </Badge>
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center text-[10px] sm:text-xs text-gray-400">
              <Eye className="h-3 w-3 mr-1" />
              12 views
            </div>
            <Button size="sm" variant="outline" className="h-6 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3">
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
