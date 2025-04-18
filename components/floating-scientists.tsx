"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

interface Scientist {
  id: number
  x: number
  y: number
  speedX: number
  speedY: number
  size: number
  rotation: number
  rotationSpeed: number
  opacity: number
  image: string
}

export default function FloatingScientists() {
  const [scientists, setScientists] = useState<Scientist[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const initializedRef = useRef(false)

  // Initialize scientists
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    if (!containerRef.current) return

    const containerWidth = containerRef.current.clientWidth
    const containerHeight = containerRef.current.clientHeight

    // Create scientists with random positions and properties
    const newScientists: Scientist[] = []
    const scientistImages = [
      "/images/scientists/scientist1.png",
      "/images/scientists/scientist2.png",
      "/images/scientists/scientist3.png",
      "/images/scientists/scientist4.png",
      "/images/scientists/scientist5.png",
    ]

    for (let i = 0; i < 12; i++) {
      const size = Math.floor(Math.random() * 40) + 60 // 60-100px
      newScientists.push({
        id: i,
        x: Math.random() * (containerWidth - size),
        y: Math.random() * (containerHeight - size),
        speedX: (Math.random() - 0.5) * 1.5,
        speedY: (Math.random() - 0.5) * 1.5,
        size,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.3 + 0.4, // 0.4-0.7
        image: scientistImages[i % scientistImages.length],
      })
    }

    setScientists(newScientists)

    // Start animation
    startAnimation()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Animation function
  const startAnimation = () => {
    if (!containerRef.current) return

    const animate = () => {
      if (!containerRef.current) return

      const containerWidth = containerRef.current.clientWidth
      const containerHeight = containerRef.current.clientHeight

      setScientists((prevScientists) =>
        prevScientists.map((scientist) => {
          let { x, y, speedX, speedY, rotation, rotationSpeed } = scientist

          // Update position
          x += speedX
          y += speedY

          // Boundary check
          if (x <= 0 || x >= containerWidth - scientist.size) {
            speedX = -speedX * (0.9 + Math.random() * 0.2)
            x = x <= 0 ? 0 : containerWidth - scientist.size
          }

          if (y <= 0 || y >= containerHeight - scientist.size) {
            speedY = -speedY * (0.9 + Math.random() * 0.2)
            y = y <= 0 ? 0 : containerHeight - scientist.size
          }

          // Random direction changes
          if (Math.random() < 0.01) {
            speedX += (Math.random() - 0.5) * 0.5
            speedY += (Math.random() - 0.5) * 0.5

            // Limit max speed
            const maxSpeed = 2
            const speed = Math.sqrt(speedX * speedX + speedY * speedY)
            if (speed > maxSpeed) {
              speedX = (speedX / speed) * maxSpeed
              speedY = (speedY / speed) * maxSpeed
            }
          }

          // Update rotation
          rotation += rotationSpeed

          return {
            ...scientist,
            x,
            y,
            speedX,
            speedY,
            rotation,
          }
        }),
      )

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none z-0"
      style={{ background: "rgba(0,0,0,0.7)" }}
    >
      {scientists.map((scientist) => (
        <div
          key={scientist.id}
          className="absolute rounded-full overflow-hidden transition-transform duration-[2000ms] ease-linear"
          style={{
            width: `${scientist.size}px`,
            height: `${scientist.size}px`,
            left: `${scientist.x}px`,
            top: `${scientist.y}px`,
            transform: `rotate(${scientist.rotation}deg)`,
            opacity: scientist.opacity,
            border: "2px solid rgba(0, 255, 85, 0.3)",
            boxShadow: "0 0 10px rgba(0, 255, 85, 0.2)",
            filter: "grayscale(0.7) brightness(1.1) contrast(1.1)",
            mixBlendMode: "screen",
          }}
        >
          <Image
            src={scientist.image || "/placeholder.svg"}
            alt="Historical scientist"
            width={scientist.size}
            height={scientist.size}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  )
}
