"use client"

import { useState, useEffect, useRef } from "react"

interface TypingAnimationProps {
  staticText: string
  phrases: string[]
  typingSpeed?: number
  deletingSpeed?: number
  delayAfterPhrase?: number
  className?: string
}

export default function TypingAnimation({
  staticText,
  phrases,
  typingSpeed = 100,
  deletingSpeed = 50,
  delayAfterPhrase = 2000,
  className = "",
}: TypingAnimationProps) {
  const [displayText, setDisplayText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Blinking cursor effect
  const [cursorVisible, setCursorVisible] = useState(true)

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev)
    }, 500)

    return () => clearInterval(cursorInterval)
  }, [])

  // Typing animation effect
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    const currentPhrase = phrases[phraseIndex]

    const handleTyping = () => {
      if (isDeleting) {
        // Deleting text
        if (charIndex > 0) {
          setDisplayText(currentPhrase.substring(0, charIndex - 1))
          setCharIndex(charIndex - 1)
          timerRef.current = setTimeout(handleTyping, deletingSpeed)
        } else {
          // Finished deleting, move to next phrase
          setIsDeleting(false)
          setPhraseIndex((phraseIndex + 1) % phrases.length)
          timerRef.current = setTimeout(handleTyping, typingSpeed)
        }
      } else {
        // Typing text
        if (charIndex < currentPhrase.length) {
          setDisplayText(currentPhrase.substring(0, charIndex + 1))
          setCharIndex(charIndex + 1)
          timerRef.current = setTimeout(handleTyping, typingSpeed)
        } else {
          // Finished typing, wait before deleting
          timerRef.current = setTimeout(() => {
            setIsDeleting(true)
            handleTyping()
          }, delayAfterPhrase)
        }
      }
    }

    // Start the typing/deleting process
    timerRef.current = setTimeout(handleTyping, 100)

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [phraseIndex, isDeleting])

  return (
    <h1 className={className}>
      {staticText} <span className="text-green-400">{displayText}</span>
      <span className={`text-green-400 ${cursorVisible ? "opacity-100" : "opacity-0"}`}>|</span>
    </h1>
  )
}
