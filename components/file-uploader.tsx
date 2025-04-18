"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { UploadIcon } from "lucide-react"

interface FileUploaderProps {
  onChange: (files: File[]) => void
}

export function FileUploader({ onChange }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files)
      onChange(filesArray)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files)
      onChange(filesArray)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div
      className={`border-2 border-dashed rounded-md p-6 text-center ${
        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className="rounded-full bg-primary/10 p-3">
          <UploadIcon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-sm font-medium">Drag and drop your files here</h3>
        <p className="text-xs text-muted-foreground">or</p>
        <Button type="button" variant="outline" size="sm" onClick={handleButtonClick}>
          Browse Files
        </Button>
        <p className="text-xs text-muted-foreground mt-2">Supports all file types up to 50MB</p>
      </div>
    </div>
  )
}
