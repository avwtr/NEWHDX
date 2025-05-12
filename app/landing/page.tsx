"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  FileText,
  FlaskRoundIcon as Flask,
  Microscope,
  Zap,
  Database,
  Brain,
  Atom,
  LineChart,
  Users,
  Award,
  LogIn,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import FloatingScientists from "@/components/floating-scientists"
import { HDXLogo } from "@/components/hdx-logo"
import { ToggleTabs } from "@/components/toggle-tabs"
import { CreateLab } from "@/components/create-lab"
import { ExploreContribute } from "@/components/explore-contribute"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"

// Custom color
const CUSTOM_GREEN = "#A0FFDD"

// Force dynamic rendering
export const dynamic = "force-dynamic"

// Activity log animation component
function AnimatedActivityLogs() {
  type LogEntry = {
    id: number
    time: string
    event: string
    icon: React.ReactElement
    isNew?: boolean
  }

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 1,
      time: "Just now",
      event: "Experiment created: Neural quantum coupling",
      icon: <Flask className="h-4 w-4" style={{ color: CUSTOM_GREEN }} />,
    },
    {
      id: 2,
      time: "2m ago",
      event: "New data uploaded: Consciousness wave patterns",
      icon: <FileText className="h-4 w-4" style={{ color: CUSTOM_GREEN }} />,
    },
    {
      id: 3,
      time: "5m ago",
      event: "Protocol published: Quantum EEG methodology",
      icon: <Microscope className="h-4 w-4" style={{ color: CUSTOM_GREEN }} />,
    },
    {
      id: 4,
      time: "10m ago",
      event: "Funding goal reached: $125,000",
      icon: <Zap className="h-4 w-4" style={{ color: CUSTOM_GREEN }} />,
    },
  ])

  const [removedLogIds, setRemovedLogIds] = useState<number[]>([])
  const nextIdRef = useRef(5)

  // All possible log types
  const logTypes = [
    { event: "New member joined: Dr. Sarah Chen", icon: <Users className="h-4 w-4" style={{ color: CUSTOM_GREEN }} /> },
    {
      event: "Experiment updated: Quantum field measurements",
      icon: <Flask className="h-4 w-4" style={{ color: CUSTOM_GREEN }} />,
    },
    {
      event: "Data analysis completed: Neural patterns",
      icon: <LineChart className="h-4 w-4" style={{ color: CUSTOM_GREEN }} />,
    },
    {
      event: "New dataset uploaded: Particle interactions",
      icon: <Database className="h-4 w-4" style={{ color: CUSTOM_GREEN }} />,
    },
    {
      event: "Protocol shared: Advanced imaging technique",
      icon: <Microscope className="h-4 w-4" style={{ color: CUSTOM_GREEN }} />,
    },
    {
      event: "Publication submitted: Quantum Biology",
      icon: <FileText className="h-4 w-4" style={{ color: CUSTOM_GREEN }} />,
    },
    {
      event: "Grant awarded: $50,000 for research",
      icon: <Award className="h-4 w-4" style={{ color: CUSTOM_GREEN }} />,
    },
    {
      event: "Experiment results: Positive correlation found",
      icon: <Brain className="h-4 w-4" style={{ color: CUSTOM_GREEN }} />,
    },
    {
      event: "New hypothesis formulated: Quantum consciousness",
      icon: <Atom className="h-4 w-4" style={{ color: CUSTOM_GREEN }} />,
    },
  ]

  useEffect(() => {
    // Add new log every 3 seconds
    const interval = setInterval(() => {
      const randomLogType = logTypes[Math.floor(Math.random() * logTypes.length)]
      const newLog = {
        id: nextIdRef.current,
        time: "Just now",
        event: randomLogType.event,
        icon: randomLogType.icon,
        isNew: true,
      }

      nextIdRef.current += 1

      // Update existing logs' times
      const updatedLogs = logs.map((log) => {
        if (log.time === "Just now") return { ...log, time: "1m ago" }
        if (log.time === "1m ago") return { ...log, time: "2m ago" }
        if (log.time === "2m ago") return { ...log, time: "5m ago" }
        if (log.time === "5m ago") return { ...log, time: "10m ago" }
        if (log.time === "10m ago") return { ...log, time: "15m ago" }
        return log
      })

      // Add new log at the top
      setLogs([newLog, ...updatedLogs])

      // Schedule removal of oldest log
      setTimeout(() => {
        setLogs((prevLogs) => {
          const oldestLog = prevLogs[prevLogs.length - 1]
          if (oldestLog) {
            setRemovedLogIds((prev) => [...prev, oldestLog.id])
            return prevLogs.slice(0, -1)
          }
          return prevLogs
        })
      }, 500)
    }, 3000)

    return () => clearInterval(interval)
  }, [logs])

  return (
    <div className="space-y-3 relative">
      {logs.map((log, index) => (
        <div
          key={log.id}
          className={`flex items-start gap-3 p-2 rounded bg-opacity-5 transition-all duration-500 ${
            log.isNew ? "animate-slideIn" : ""
          }`}
          style={{
            opacity: removedLogIds.includes(log.id) ? 0 : 1,
            transform: removedLogIds.includes(log.id) ? "translateY(20px)" : "translateY(0)",
            border: `1px solid ${CUSTOM_GREEN}20`,
            backgroundColor: `${CUSTOM_GREEN}05`,
          }}
        >
          <div className="mt-0.5">{log.icon}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{log.event}</p>
            <p className="text-xs text-gray-400">{log.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// Simpler typing animation component directly in the landing page
function DynamicTagline() {
  const [text, setText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [loopNum, setLoopNum] = useState(0)
  const [typingSpeed, setTypingSpeed] = useState(150)

  const phrases = ["LIMITS", "GATEKEEPERS", "CREDENTIALISM", "CLOSED-SOURCES"]

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % phrases.length
      const fullText = phrases[i]

      setText(isDeleting ? fullText.substring(0, text.length - 1) : fullText.substring(0, text.length + 1))

      setTypingSpeed(isDeleting ? 50 : 150)

      if (!isDeleting && text === fullText) {
        // Finished typing, wait before deleting
        setTimeout(() => setIsDeleting(true), 2000)
      } else if (isDeleting && text === "") {
        // Finished deleting, move to next phrase
        setIsDeleting(false)
        setLoopNum(loopNum + 1)
      }
    }

    const timer = setTimeout(handleTyping, typingSpeed)
    return () => clearTimeout(timer)
  }, [text, isDeleting, loopNum, typingSpeed, phrases])

  return (
    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
      SCIENCE WITHOUT
      <div style={{ color: CUSTOM_GREEN }}>
        {text}
        <span className="animate-blink">|</span>
      </div>
    </h1>
  )
}

// For button width
const BUTTON_MAX_WIDTH = "max-w-3xl"

export default function LandingPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("create")
  const { user, signOut } = useAuth()
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      (async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('user_id', user.id)
          .single();
        if (data && data.username) {
          setUsername(data.username);
        } else if (user.user_metadata?.name) {
          setUsername(user.user_metadata.name);
        } else {
          setUsername('User');
        }
      })();
    } else {
      setUsername(null);
    }
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with Logo */}
      <header className="fixed top-0 left-0 w-full z-50 p-4 md:p-6 bg-black/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <HDXLogo />
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="text-foreground mr-2">Hi, {username}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:bg-secondary hover:text-accent"
                  onClick={() => router.push("/profile")}
                >
                  Profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                >
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-foreground hover:bg-secondary hover:text-accent">
                    <LogIn className="h-4 w-4 mr-2" />
                    Log In
                  </Button>
                </Link>
                <Button
                  size="sm"
                  style={{ backgroundColor: CUSTOM_GREEN, color: "#000" }}
                  onClick={() => router.push("/signup")}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-black text-white pt-28 pb-20 px-4 md:px-6 lg:px-8">
        {/* Floating Scientists Background - Positioned as first child for proper layering */}
        <FloatingScientists />

        {/* Green gradient overlay */}
        <div className="absolute inset-0 z-[1] opacity-30 pointer-events-none">
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{ background: `radial-gradient(circle at 30% 30%, ${CUSTOM_GREEN}30, transparent 70%)` }}
          ></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
              <DynamicTagline />

              <h2 className="text-lg sm:text-xl md:text-2xl font-medium text-gray-300">
                Create your own lab, contribute to an open-source community, discover fascinating research
              </h2>

              <div className="flex flex-col gap-4 pt-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  {user ? (
                    <div className={`flex justify-center ${BUTTON_MAX_WIDTH} w-full`}>
                      <Button
                        size="lg"
                        className={`w-full px-8 py-5 text-2xl font-bold flex items-center justify-center gap-3 shadow-lg hover:scale-[1.03] transition-transform ${BUTTON_MAX_WIDTH}`}
                        onClick={() => router.push("/explore")}
                        style={{ backgroundColor: "#1A2252", color: CUSTOM_GREEN }}
                      >
                        <Globe className="h-7 w-7" style={{ color: CUSTOM_GREEN }} />
                        <span className="ml-2">EXPLORE</span>
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button
                        size="lg"
                        variant="outline"
                        className="hover:bg-green-950 w-full sm:w-auto"
                        onClick={() => router.push("/signup")}
                        style={{ borderColor: CUSTOM_GREEN, color: CUSTOM_GREEN }}
                      >
                        Create Account
                      </Button>
                      <Button
                        size="lg"
                        variant="ghost"
                        className="w-full sm:w-auto"
                        onClick={() => router.push("/explore")}
                      >
                        EXPLORE
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 relative w-full max-w-md mx-auto md:mx-0 mt-10 md:mt-0">
              <div
                className="relative bg-black/80 rounded-lg p-4 sm:p-6 backdrop-blur-sm"
                style={{ border: `1px solid ${CUSTOM_GREEN}50` }}
              >
                <div
                  className="absolute -top-3 -left-3 h-6 w-6 border-t border-l"
                  style={{ borderColor: CUSTOM_GREEN }}
                ></div>
                <div
                  className="absolute -bottom-3 -right-3 h-6 w-6 border-b border-r"
                  style={{ borderColor: CUSTOM_GREEN }}
                ></div>

                {/* Stylized Lab Preview */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm sm:text-base" style={{ color: CUSTOM_GREEN }}>
                      QUANTUM CONSCIOUSNESS LAB
                    </h3>
                    <Badge
                      className="border text-xs"
                      style={{
                        backgroundColor: `${CUSTOM_GREEN}20`,
                        color: CUSTOM_GREEN,
                        borderColor: `${CUSTOM_GREEN}50`,
                      }}
                    >
                      ACTIVE
                    </Badge>
                  </div>

                  {/* Timeline Events - Animated */}
                  <div className="h-[200px] sm:h-[240px] overflow-hidden relative mt-4 sm:mt-6">
                    <AnimatedActivityLogs />
                  </div>
                </div>
              </div>

              {/* Stylized Green Line */}
              <div
                className="absolute -bottom-10 left-0 right-0 h-1"
                style={{ background: `linear-gradient(to right, transparent, ${CUSTOM_GREEN}, transparent)` }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* Toggle Tabs Section */}
      <section id="create-lab-section" className="py-12 sm:py-16 px-4 md:px-6 lg:px-8 bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <ToggleTabs
            tabs={[
              { id: "create", label: "CREATE YOUR OWN LAB" },
              { id: "explore", label: "EXPLORE AND CONTRIBUTE" },
            ]}
            defaultTabId="create"
            onChange={setActiveTab}
            className="mb-8"
          />

          <div id="explore-section">{activeTab === "create" ? <CreateLab /> : <ExploreContribute />}</div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 sm:py-16 px-4 md:px-6 lg:px-8 bg-black text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            LET'S GET TO A PROSPEROUS FUTURE OF SCIENCE.
          </h2>
          <h3 className="text-lg sm:text-xl md:text-2xl font-medium text-gray-400 mb-6 sm:mb-8 leading-tight">
            ONE THAT IS RADICAL, OPEN AND DECENTRALIZED.
          </h3>
          <div className="flex justify-center">
            {user ? (
              <div className={`flex justify-center ${BUTTON_MAX_WIDTH} w-full`}>
                <Button
                  size="lg"
                  className={`w-full px-8 py-5 text-2xl font-bold flex items-center justify-center gap-3 shadow-lg hover:scale-[1.03] transition-transform ${BUTTON_MAX_WIDTH}`}
                  style={{ backgroundColor: "#1A2252", color: CUSTOM_GREEN }}
                  onClick={() => router.push("/explore")}
                >
                  <Globe className="h-7 w-7" style={{ color: CUSTOM_GREEN }} />
                  <span className="ml-2">EXPLORE</span>
                </Button>
              </div>
            ) : (
              <>
                <Button
                  size="lg"
                  variant="outline"
                  className="hover:bg-green-950 w-full sm:w-auto mr-3"
                  onClick={() => router.push("/signup")}
                  style={{ borderColor: CUSTOM_GREEN, color: CUSTOM_GREEN }}
                >
                  Create Account
                </Button>
                <Button
                  size="lg"
                  className="hover:bg-opacity-90 w-full sm:w-auto"
                  style={{ backgroundColor: CUSTOM_GREEN, color: "#000" }}
                  onClick={() => router.push("/explore")}
                >
                  EXPLORE
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
