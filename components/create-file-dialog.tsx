"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileSpreadsheetIcon, FileCodeIcon, FileTextIcon, Save, Download, Tag } from "lucide-react"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DocumentEditor } from "@/components/editors/document-editor"
import { TabularDataEditor } from "@/components/editors/tabular-data-editor"
import { CodeEditor } from "@/components/editors/code-editor"

interface CreateFileDialogProps {
  onClose: () => void
}

export function CreateFileDialog({ onClose }: CreateFileDialogProps) {
  const [step, setStep] = useState<"select" | "edit">("select")
  const [selectedFileType, setSelectedFileType] = useState<string | null>(null)
  const [fileName, setFileName] = useState("")
  const [fileDescription, setFileDescription] = useState("")
  const [folder, setFolder] = useState("root")
  const [documentTag, setDocumentTag] = useState("")

  // Document editor state
  const [documentContent, setDocumentContent] = useState("")
  const [documentFormat, setDocumentFormat] = useState("markdown")

  // Code editor state
  const [codeContent, setCodeContent] = useState("")
  const [codeLanguage, setCodeLanguage] = useState("python")

  // Tabular data editor state
  const [tabularData, setTabularData] = useState<{ columns: string[]; rows: string[][] }>({
    columns: ["Column 1", "Column 2", "Column 3"],
    rows: [
      ["", "", ""],
      ["", "", ""],
    ],
  })

  // File type options
  const fileTypeOptions = [
    {
      id: "tabular",
      name: "Tabular Data",
      description: "Create spreadsheet-like data with rows and columns",
      icon: FileSpreadsheetIcon,
      formats: ["CSV", "XLSX", "JSON"],
      tag: "DATASET",
    },
    {
      id: "code",
      name: "Code File",
      description: "Write code with syntax highlighting",
      icon: FileCodeIcon,
      formats: ["Python", "JavaScript", "R"],
      tag: "CODE",
    },
    {
      id: "document",
      name: "Document",
      description: "Create text documents and research notes",
      icon: FileTextIcon,
      formats: ["Markdown", "Plain Text", "HTML"],
      needsTag: true,
    },
  ]

  const handleClose = () => {
    onClose()
  }

  const handleFileTypeSelect = (typeId: string) => {
    setSelectedFileType(typeId)
    setStep("edit")

    // Set default tag for tabular and code files
    const selectedType = fileTypeOptions.find((option) => option.id === typeId)
    if (selectedType && selectedType.tag) {
      setDocumentTag(selectedType.tag)
    } else {
      setDocumentTag("")
    }
  }

  const handleSave = () => {
    // Here you would save the file to the HDX platform
    console.log("Saving file:", {
      type: selectedFileType,
      name: fileName,
      description: fileDescription,
      folder,
      tag: documentTag,
      content:
        selectedFileType === "document" ? documentContent : selectedFileType === "code" ? codeContent : tabularData,
    })

    // Show success message or notification
    alert("File saved successfully!")
    handleClose()
  }

  const selectedOption = selectedFileType ? fileTypeOptions.find((option) => option.id === selectedFileType) : null
  const showTagSelector = selectedOption?.needsTag

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent
        className={`${step === "edit" ? "sm:max-w-[900px]" : "sm:max-w-[600px]"} max-h-[90vh] overflow-y-auto`}
      >
        {step === "select" ? (
          <>
            <DialogHeader>
              <DialogTitle>Create New File</DialogTitle>
              <DialogDescription>Choose a file type to create</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
              {fileTypeOptions.map((option) => (
                <Card
                  key={option.id}
                  className="cursor-pointer hover:border-accent transition-colors"
                  onClick={() => handleFileTypeSelect(option.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <option.icon className="h-8 w-8 text-accent" />
                    </div>
                    <CardTitle className="text-lg">{option.name}</CardTitle>
                    <CardDescription>{option.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-0 text-xs text-muted-foreground">
                    Formats: {option.formats.join(", ")}
                    {option.tag && (
                      <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full">{option.tag}</span>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>
                  {selectedFileType === "tabular"
                    ? "Create Tabular Data"
                    : selectedFileType === "code"
                      ? "Create Code File"
                      : "Create Document"}
                </DialogTitle>
                <Button variant="outline" size="sm" onClick={() => setStep("select")} className="text-xs">
                  Change Type
                </Button>
              </div>
              <DialogDescription>
                {selectedFileType === "tabular"
                  ? "Create and edit tabular data with rows and columns"
                  : selectedFileType === "code"
                    ? "Write code with syntax highlighting"
                    : "Create and format text documents"}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="filename">File Name</Label>
                  <Input
                    id="filename"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder={
                      selectedFileType === "tabular"
                        ? "data_collection.csv"
                        : selectedFileType === "code"
                          ? "analysis_script.py"
                          : "protocol.md"
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="folder">Save to Folder</Label>
                  <Select value={folder} onValueChange={setFolder}>
                    <SelectTrigger id="folder">
                      <SelectValue placeholder="Select folder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="root">Root (Lab Repository)</SelectItem>
                      <SelectItem value="datasets">DATASETS</SelectItem>
                      <SelectItem value="models">MODELS</SelectItem>
                      <SelectItem value="protocols">PROTOCOLS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {showTagSelector && (
                <div className="space-y-2">
                  <Label htmlFor="document-tag" className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    Document Tag
                  </Label>
                  <Select value={documentTag} onValueChange={setDocumentTag}>
                    <SelectTrigger id="document-tag">
                      <SelectValue placeholder="Select a tag for this document" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PROTOCOL">PROTOCOL</SelectItem>
                      <SelectItem value="LINK">LINK</SelectItem>
                      <SelectItem value="OUTLINE">OUTLINE</SelectItem>
                      <SelectItem value="DOCUMENTATION">DOCUMENTATION</SelectItem>
                      <SelectItem value="ESSAY">ESSAY</SelectItem>
                      <SelectItem value="README">README</SelectItem>
                      <SelectItem value="NOTES">NOTES</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Select a tag to categorize this document</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={fileDescription}
                  onChange={(e) => setFileDescription(e.target.value)}
                  placeholder="Brief description of this file"
                />
              </div>

              {/* File Type Specific Editors */}
              <div className="border rounded-md overflow-hidden">
                {selectedFileType === "tabular" && <TabularDataEditor data={tabularData} onChange={setTabularData} />}
                {selectedFileType === "code" && (
                  <CodeEditor
                    content={codeContent}
                    language={codeLanguage}
                    onContentChange={setCodeContent}
                    onLanguageChange={setCodeLanguage}
                  />
                )}
                {selectedFileType === "document" && (
                  <DocumentEditor
                    content={documentContent}
                    format={documentFormat}
                    onContentChange={setDocumentContent}
                    onFormatChange={setDocumentFormat}
                  />
                )}
              </div>
            </div>

            <DialogFooter className="flex justify-between mt-4">
              <div>
                <Button variant="outline" onClick={handleClose} className="mr-2">
                  Cancel
                </Button>
              </div>
              <div>
                <Button variant="outline" className="mr-2 border-accent text-accent hover:bg-secondary">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button onClick={handleSave} className="bg-accent text-primary-foreground hover:bg-accent/90">
                  <Save className="h-4 w-4 mr-2" />
                  Save to HDX
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
