"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function LoadingAnimation() {
  const [isVisible, setIsVisible] = useState(true)
  const [text, setText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const fullText = "HETERODOX"
  const shortText = "HDX"

  useEffect(() => {
    let currentIndex = 0
    let typingInterval: NodeJS.Timeout

    const startTyping = (targetText: string) => {
      typingInterval = setInterval(() => {
        if (currentIndex < targetText.length) {
          setText(targetText.slice(0, currentIndex + 1))
          currentIndex++
        } else {
          clearInterval(typingInterval)
          if (targetText === fullText) {
            setTimeout(() => {
              currentIndex = 0
              startTyping(shortText)
            }, 500)
          } else {
            setTimeout(() => {
              setIsVisible(false)
            }, 1000)
          }
        }
      }, 100)
    }

    startTyping(fullText)

    return () => {
      clearInterval(typingInterval)
    }
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-background z-50"
        >
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.3 }}
            className="text-4xl font-bold tracking-wider text-accent"
          >
            {text}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block ml-0.5"
            >
              |
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 