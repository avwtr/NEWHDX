"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FolderIcon,
  FileIcon,
  FileTextIcon,
  FileSpreadsheetIcon,
  FileJsonIcon,
  FileCodeIcon,
  FileIcon as FilePdfIcon,
  Edit2,
  Check,
  X,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"

interface FileProps {
  name: string
  type: string
  size: string
  author: string
  date: string
}

interface CollapsibleFolderProps {
  name: string
  count: number
  lastUpdated: string
  files: FileProps[]
}

export default function CollapsibleFolder({ name, count, lastUpdated, files }: CollapsibleFolderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [folderName, setFolderName] = useState(name)
  const [isRenamingFolder, setIsRenamingFolder] = useState(false)
  const [renamingFileIndex, setRenamingFileIndex] = useState<number | null>(null)
  const [fileNames, setFileNames] = useState<string[]>(files.map((file) => file.name))
  const [tempName, setTempName] = useState("")

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "csv":
      case "xlsx":
        return <FileSpreadsheetIcon className="h-5 w-5 mr-2 text-accent" />
      case "json":
        return <FileJsonIcon className="h-5 w-5 mr-2 text-accent" />
      case "py":
      case "js":
      case "ts":
        return <FileCodeIcon className="h-5 w-5 mr-2 text-accent" />
      case "pdf":
        return <FilePdfIcon className="h-5 w-5 mr-2 text-accent" />
      case "md":
      case "txt":
        return <FileTextIcon className="h-5 w-5 mr-2 text-accent" />
      default:
        return <FileIcon className="h-5 w-5 mr-2 text-accent" />
    }
  }

  const startRenamingFolder = () => {
    setTempName(folderName)
    setIsRenamingFolder(true)
  }

  const saveRenamedFolder = () => {
    if (tempName.trim()) {
      setFolderName(tempName)
    }
    setIsRenamingFolder(false)
  }

  const cancelRenamingFolder = () => {
    setIsRenamingFolder(false)
  }

  const startRenamingFile = (index: number) => {
    setTempName(fileNames[index])
    setRenamingFileIndex(index)
  }

  const saveRenamedFile = () => {
    if (renamingFileIndex !== null && tempName.trim()) {
      const newFileNames = [...fileNames]
      newFileNames[renamingFileIndex] = tempName
      setFileNames(newFileNames)
    }
    setRenamingFileIndex(null)
  }

  const cancelRenamingFile = () => {
    setRenamingFileIndex(null)
  }

  return (
    <div className="border border-secondary rounded-md overflow-hidden">
      <div className={`flex items-center p-3 hover:bg-secondary/50 ${isOpen ? "bg-secondary" : ""}`}>
        <div className="flex items-center flex-1">
          <FolderIcon className="h-5 w-5 mr-2 text-accent" />
          <div className="flex-1">
            {isRenamingFolder ? (
              <div className="flex items-center gap-2">
                <Input value={tempName} onChange={(e) => setTempName(e.target.value)} className="h-7 py-1" autoFocus />
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={saveRenamedFolder}>
                  <Check className="h-4 w-4 text-green-500" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelRenamingFolder}>
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center">
                <h3 className="text-sm font-medium">{folderName}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-2 text-muted-foreground hover:text-accent"
                  onClick={(e) => {
                    e.stopPropagation()
                    startRenamingFolder()
                  }}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {count} files, last updated {lastUpdated}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-accent hover:bg-secondary/80 ml-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-secondary"
          >
            <div className="p-2 space-y-1">
              {files.map((file, index) => (
                <div key={index} className="flex items-center p-2 hover:bg-secondary/70 rounded-md">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    {renamingFileIndex === index ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          className="h-7 py-1"
                          autoFocus
                        />
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={saveRenamedFile}>
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelRenamingFile}>
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <h4 className="text-sm font-medium truncate">{fileNames[index]}</h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-2 text-muted-foreground hover:text-accent"
                          onClick={() => startRenamingFile(index)}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {file.size} • Added by {file.author}, {file.date}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-accent hover:bg-secondary/80">
                    DOWNLOAD
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
