import { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface AnimatedCounterProps {
  value: number | string
  label: string
  icon: React.ReactNode
}

export function AnimatedCounter({ value, label, icon }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    if (typeof value === "number") {
      let start = 0
      const end = value
      const duration = 1000 // 1 second
      const startTime = performance.now()

      const updateValue = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        const currentValue = Math.floor(easeOutQuart * end)

        setDisplayValue(currentValue)

        if (progress < 1) {
          requestAnimationFrame(updateValue)
        }
      }

      requestAnimationFrame(updateValue)
    } else {
      setDisplayValue(value)
    }
  }, [value])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-secondary/30 rounded-lg p-4"
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-2xl font-bold">{displayValue}</span>
      </div>
      <span className="text-sm text-muted-foreground">{label}</span>
    </motion.div>
  )
} 