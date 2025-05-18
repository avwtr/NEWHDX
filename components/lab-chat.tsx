"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, X, ChevronDown, ChevronUp, Send } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"

// Accept labId as prop
export function LabChat({ labId }: { labId: string }) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [userMap, setUserMap] = useState<Record<string, { username: string; profilePic: string }>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [unreadMessages, setUnreadMessages] = useState(0)

  // Fetch messages for this lab
  useEffect(() => {
    if (!labId) return
    let ignore = false
    async function fetchMessages() {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("id, created_at, from, labId, content")
        .eq("labId", labId)
        .order("created_at", { ascending: true })
      if (!ignore && data) {
        setMessages(data)
        // Fetch user info for all unique senders
        const userIds = Array.from(new Set(data.map((m: any) => m.from)))
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, username, profilePic")
            .in("user_id", userIds)
          const map: Record<string, { username: string; profilePic: string }> = {}
          profiles?.forEach((p: any) => {
            map[p.user_id] = { username: p.username, profilePic: p.profilePic }
          })
          setUserMap(map)
        }
      }
    }
    fetchMessages()
    // Subscribe to new messages
    const sub = supabase
      .channel('chat-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `labId=eq.${labId}` }, payload => {
        setMessages(prev => [...prev, payload.new])
        // Optionally fetch user info for new sender
        const senderId = payload.new.from
        if (!userMap[senderId]) {
          supabase
            .from("profiles")
            .select("user_id, username, profilePic")
            .eq("user_id", senderId)
            .single()
            .then(({ data }) => {
              if (data) setUserMap(prev => ({ ...prev, [data.user_id]: { username: data.username, profilePic: data.profilePic } }))
            })
        }
      })
      .subscribe()
    return () => {
      ignore = true
      supabase.removeChannel(sub)
    }
  }, [labId])

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen])

  // Toggle chat open/closed
  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setIsExpanded(false)
    }
  }

  // Toggle chat expanded/collapsed
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  // Send a new message
  const sendMessage = async () => {
    if (!user || !message.trim()) return
    const { data, error } = await supabase.from("chat_messages").insert({
      from: user.id,
      labId,
      content: message.trim(),
    }).select()
    if (data) {
      setMessages(prev => [...prev, data[0]])
    }
    setMessage("")
  }

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  useEffect(() => {
    if (isOpen) {
      setUnreadMessages(0)
    }
  }, [isOpen])

  if (!user) return null

  return (
    <div className="fixed bottom-8 left-8 z-40 flex flex-col items-end">
      {/* Chat Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={toggleChat}
              className={`rounded-full h-14 w-14 shadow-lg relative ${isOpen ? "bg-secondary hover:bg-secondary/80" : "bg-accent hover:bg-accent/90"}`}
            >
              {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
              {!isOpen && unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadMessages}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">{isOpen ? "Close Chat" : "Open Lab Chat"}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`bg-card border border-secondary rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out mb-4 ${
            isExpanded ? "w-[500px] h-[600px]" : "w-[350px] h-[450px]"
          }`}
        >
          {/* Chat Header */}
          <div className="bg-secondary/50 p-3 flex items-center justify-between border-b border-secondary">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 text-accent mr-2" />
              <h3 className="font-medium">LAB CHAT</h3>
              <Badge className="ml-2 bg-accent text-primary-foreground text-xs">LIVE</Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary" onClick={toggleExpanded}>
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4" style={{ height: isExpanded ? 480 : 300 }}>
            {messages.map((msg) => {
              const sender = userMap[msg.from] || {}
              const date = new Date(msg.created_at)
              const timeString = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              const dayString = date.toLocaleDateString()
              return (
                <div key={msg.id} className="flex items-start gap-2">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src={sender.profilePic || "/placeholder.svg"} alt={sender.username || "User"} />
                    <AvatarFallback>{(sender.username || "U").charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{sender.username || msg.from}</span>
                      <span className="text-xs text-muted-foreground">{dayString} {timeString}</span>
                    </div>
                    <p className="text-sm break-words">{msg.content}</p>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-secondary">
            <div className="flex items-center gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!message.trim()}
                className="bg-accent text-primary-foreground hover:bg-accent/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
