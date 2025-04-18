"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DocumentEditor } from "@/components/editors/document-editor"
import { CodeEditor } from "@/components/editors/code-editor"
import { TabularDataEditor } from "@/components/editors/tabular-data-editor"
import { Download, Save, Trash2, Edit2, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface FileViewerDialogProps {
  file: {
    id: string
    name: string
    type: string
    size: string
    author: string
    date: string
    content?: string
  }
  isOpen: boolean
  onClose: () => void
  userRole?: string
  onDelete?: (fileId: string) => void
  onSave?: (fileId: string, content: any) => void
}

export function FileViewerDialog({
  file,
  isOpen,
  onClose,
  userRole = "guest",
  onDelete,
  onSave,
}: FileViewerDialogProps) {
  const isAdmin = userRole === "admin"
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // State for different content types
  const [documentContent, setDocumentContent] = useState("")
  const [documentFormat, setDocumentFormat] = useState("markdown")
  const [codeContent, setCodeContent] = useState("")
  const [codeLanguage, setCodeLanguage] = useState("python")
  const [tabularData, setTabularData] = useState<{ columns: string[]; rows: string[][] }>({
    columns: ["Column 1", "Column 2", "Column 3"],
    rows: [
      ["", "", ""],
      ["", "", ""],
    ],
  })

  // Reset editing state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsEditing(false)

      // Initialize content based on file type
      initializeContent()
    }
  }, [isOpen, file])

  const initializeContent = () => {
    // In a real app, you would fetch the actual content from an API
    // For now, we'll generate mock content based on file type

    const fileType = file.type.toLowerCase()

    // Document files
    if (fileType === "md" || fileType === "txt") {
      setDocumentFormat(fileType === "md" ? "markdown" : "plaintext")
      setDocumentContent(
        `# ${file.name}\n\nThis is a sample document content for ${file.name}.\n\nCreated by ${file.author} on ${file.date}.\n\n## Section 1\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nisl nisl aliquet nisl, eget aliquam nisl nisl eget nisl.`,
      )
    }

    // Code files
    else if (["py", "js", "ts", "r"].includes(fileType)) {
      setCodeLanguage(
        fileType === "py" ? "python" : fileType === "js" ? "javascript" : fileType === "ts" ? "javascript" : "r",
      )

      if (fileType === "py") {
        setCodeContent(
          `# ${file.name}
# Author: ${file.author}
# Date: ${file.date}

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

def analyze_data(data_path):
    """
    Analyze the data from the given path
    
    Parameters:
    data_path (str): Path to the data file
    
    Returns:
    dict: Analysis results
    """
    # Load data
    data = pd.read_csv(data_path)
    
    # Perform analysis
    results = {
        "mean": data.mean(),
        "median": data.median(),
        "std": data.std()
    }
    
    return results

if __name__ == "__main__":
    results = analyze_data("data/sample.csv")
    print(results)
`,
        )
      } else if (fileType === "js" || fileType === "ts") {
        setCodeContent(
          `// ${file.name}
// Author: ${file.author}
// Date: ${file.date}

/**
 * Analyzes data from the given source
 * @param {string} dataSource - Path or URL to the data
 * @returns {Object} Analysis results
 */
async function analyzeData(dataSource) {
  try {
    // Fetch data
    const response = await fetch(dataSource);
    const data = await response.json();
    
    // Perform analysis
    const results = {
      count: data.length,
      summary: data.reduce((acc, item) => {
        // Calculate summary statistics
        return acc;
      }, {})
    };
    
    return results;
  } catch (error) {
    console.error("Error analyzing data:", error);
    throw error;
  }
}

// Example usage
analyzeData('/api/data')
  .then(results => console.log(results))
  .catch(error => console.error(error));
`,
        )
      } else {
        setCodeContent(
          `# ${file.name}
# Author: ${file.author}
# Date: ${file.date}

# Load libraries
library(tidyverse)
library(ggplot2)

# Function to analyze data
analyze_data <- function(data_path) {
  # Read data
  data <- read.csv(data_path)
  
  # Perform analysis
  results <- list(
    mean = mean(data$value),
    median = median(data$value),
    sd = sd(data$value)
  )
  
  return(results)
}

# Example usage
results <- analyze_data("data/sample.csv")
print(results)
`,
        )
      }
    }

    // Tabular data files
    else if (["csv", "xlsx", "json"].includes(fileType)) {
      // Generate mock tabular data
      const columns = ["ID", "Name", "Value", "Category", "Date"]
      const rows = []

      for (let i = 1; i <= 10; i++) {
        rows.push([
          `${i}`,
          `Sample ${i}`,
          `${Math.round(Math.random() * 100)}`,
          ["A", "B", "C"][Math.floor(Math.random() * 3)],
          `2023-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`,
        ])
      }

      setTabularData({ columns, rows })
    }
  }

  const handleSave = () => {
    // Determine which content to save based on file type
    const fileType = file.type.toLowerCase()
    let content

    if (fileType === "md" || fileType === "txt") {
      content = documentContent
    } else if (["py", "js", "ts", "r"].includes(fileType)) {
      content = codeContent
    } else if (["csv", "xlsx", "json"].includes(fileType)) {
      content = tabularData
    }

    // Call the onSave callback with the file ID and content
    if (onSave) {
      onSave(file.id, content)
    }

    toast({
      title: "File Saved",
      description: `${file.name} has been saved successfully.`,
    })

    setIsEditing(false)
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(file.id)
    }

    setIsDeleteDialogOpen(false)
    onClose()

    toast({
      title: "File Deleted",
      description: `${file.name} has been deleted.`,
      variant: "destructive",
    })
  }

  const handleDownload = () => {
    // In a real app, this would trigger a file download
    // For now, we'll just show a toast
    toast({
      title: "File Downloaded",
      description: `${file.name} has been downloaded.`,
    })
  }

  const renderFileViewer = () => {
    const fileType = file.type.toLowerCase()

    // Document files
    if (fileType === "md" || fileType === "txt") {
      return (
        <div className="max-h-[60vh] overflow-auto">
          <DocumentEditor
            content={documentContent}
            format={documentFormat}
            onContentChange={setDocumentContent}
            onFormatChange={setDocumentFormat}
            readOnly={!isEditing}
          />
        </div>
      )
    }

    // Code files
    else if (["py", "js", "ts", "r"].includes(fileType)) {
      return (
        <div className="max-h-[60vh] overflow-auto">
          <CodeEditor
            content={codeContent}
            language={codeLanguage}
            onContentChange={setCodeContent}
            onLanguageChange={setCodeLanguage}
            readOnly={!isEditing}
          />
        </div>
      )
    }

    // Tabular data files
    else if (["csv", "xlsx", "json"].includes(fileType)) {
      return (
        <div className="max-h-[60vh] overflow-auto">
          <TabularDataEditor data={tabularData} onChange={setTabularData} readOnly={!isEditing} />
        </div>
      )
    }

    // Other file types
    else {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-secondary/50 p-8 rounded-lg mb-4">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-bold mb-2">{file.name}</h3>
            <p className="text-muted-foreground mb-4">
              {file.size} • Added by {file.author}, {file.date}
            </p>
          </div>
          <p className="text-muted-foreground mb-6">
            This file type cannot be previewed. Please download the file to view its contents.
          </p>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download File
          </Button>
        </div>
      )
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">{file.name}</DialogTitle>
              <div className="flex items-center gap-2">
                {isAdmin && isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                )}
                {isAdmin && !isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-1" /> Edit
                  </Button>
                )}
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-100"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {file.size} • Added by {file.author}, {file.date}
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">{renderFileViewer()}</div>

          <DialogFooter className="mt-4">
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>

              {isAdmin && isEditing && (
                <Button onClick={handleSave} className="bg-accent text-primary-foreground hover:bg-accent/90">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this file?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete <span className="font-bold">{file.name}</span>{" "}
              from the lab materials.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 text-white hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
