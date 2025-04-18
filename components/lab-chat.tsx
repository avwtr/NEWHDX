"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, X, ChevronDown, ChevronUp, Send, Paperclip, Smile, Users } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Sample chat messages
const sampleMessages = [
  {
    id: 1,
    sender: {
      id: 1,
      name: "Dr. Sarah Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "SJ",
    },
    content:
      "I've uploaded the latest fMRI data to the datasets folder. Can someone take a look at the preprocessing results?",
    timestamp: "10:32 AM",
  },
  {
    id: 2,
    sender: {
      id: 2,
      name: "Alex Kim",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "AK",
    },
    content: "I'll review it this afternoon. Did you use the new motion correction algorithm?",
    timestamp: "10:45 AM",
  },
  {
    id: 3,
    sender: {
      id: 1,
      name: "Dr. Sarah Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "SJ",
    },
    content:
      "Yes, I implemented the algorithm we discussed last week. It seems to be working well, but I'd like your opinion on the results.",
    timestamp: "10:48 AM",
  },
  {
    id: 4,
    sender: {
      id: 3,
      name: "Maria Lopez",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "ML",
    },
    content:
      "I can help with the statistical analysis once the preprocessing is complete. When do you think you'll be done, Alex?",
    timestamp: "11:05 AM",
  },
  {
    id: 5,
    sender: {
      id: 2,
      name: "Alex Kim",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "AK",
    },
    content: "I should be done by 3 PM today. I'll ping everyone when it's ready for the next step.",
    timestamp: "11:10 AM",
  },
]

// Sample online users
const onlineUsers = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "SJ",
    status: "online",
  },
  {
    id: 2,
    name: "Alex Kim",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "AK",
    status: "online",
  },
  {
    id: 3,
    name: "Maria Lopez",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "ML",
    status: "online",
  },
  {
    id: 4,
    name: "Robert Chen",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "RC",
    status: "away",
  },
]

export function LabChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState(sampleMessages)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [unreadMessages, setUnreadMessages] = useState(2)

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

  // Toggle members list
  const toggleMembers = () => {
    setShowMembers(!showMembers)
  }

  // Send a new message
  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: {
          id: 1,
          name: "Dr. Sarah Johnson",
          avatar: "/placeholder.svg?height=40&width=40",
          initials: "SJ",
        },
        content: message,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages([...messages, newMessage])
      setMessage("")
    }
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
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary" onClick={toggleMembers}>
                <Users className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary" onClick={toggleExpanded}>
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex h-[calc(100%-110px)]">
            {/* Chat Messages */}
            <div className={`flex-1 flex flex-col ${showMembers ? "hidden md:flex" : "flex"}`}>
              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-2">
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src={msg.sender.avatar} alt={msg.sender.name} />
                      <AvatarFallback>{msg.sender.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{msg.sender.name}</span>
                        <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                      </div>
                      <p className="text-sm break-words">{msg.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Members List (Shown when toggled) */}
            <div className={`w-[200px] border-l border-secondary overflow-y-auto ${showMembers ? "block" : "hidden"}`}>
              <div className="p-3 border-b border-secondary">
                <h4 className="text-xs font-medium uppercase">Online Members</h4>
              </div>
              <div className="p-2">
                {onlineUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-2 p-2 hover:bg-secondary/30 rounded-md">
                    <div className="relative">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.initials}</AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border border-card ${
                          user.status === "online" ? "bg-green-500" : "bg-yellow-500"
                        }`}
                      />
                    </div>
                    <span className="text-sm truncate">{user.name}</span>
                  </div>
                ))}
              </div>
            </div>
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-secondary">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Attach File</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-secondary">
                      <Smile className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Add Emoji</TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
