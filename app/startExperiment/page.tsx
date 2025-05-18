"use client"

import { useState, useEffect } from "react"
import { CreateExperimentDialog } from "@/components/create-experiment-dialog"
import { useRouter } from "next/navigation"

export default function StartExperimentPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Open the modal automatically when the page loads
    setIsModalOpen(true)
  }, [])

  const handleClose = () => {
    setIsModalOpen(false)
    // Redirect back to the previous page or experiments list
    router.back()
  }

  return (
    <div>
      <CreateExperimentDialog isOpen={isModalOpen} onClose={handleClose} />
    </div>
  )
}
