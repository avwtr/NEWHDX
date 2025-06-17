"use client"

import { useState, useEffect } from "react"
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
import { FileSpreadsheetIcon, FileCodeIcon, FileTextIcon, Save, Download, Tag, Link as LinkIcon } from "lucide-react"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DocumentEditor } from "@/components/editors/document-editor"
import { TabularDataEditor } from "@/components/editors/tabular-data-editor"
import { CodeEditor } from "@/components/editors/code-editor"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/components/auth-provider"

interface CreateFileDialogProps {
  labId: string;
  onClose: () => void;
  onFileCreated?: () => void;
}

export function CreateFileDialog({ labId, onClose, onFileCreated }: CreateFileDialogProps) {
  const [step, setStep] = useState<"select" | "edit">("select")
  const [selectedFileType, setSelectedFileType] = useState<string | null>(null)
  const [fileName, setFileName] = useState("")
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

  const [folders, setFolders] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const { user } = useAuth()

  const [linkUrl, setLinkUrl] = useState("")
  const [linkCaption, setLinkCaption] = useState("")

  useEffect(() => {
    async function fetchFolders() {
      const { data, error } = await supabase
        .from("files")
        .select("folder")
        .eq("labID", labId)
      if (!error && data) {
        const folderNames = Array.from(new Set(data.map((f: any) => f.folder).filter((f: string) => f && f !== "root")))
        setFolders(folderNames)
      }
    }
    if (labId) fetchFolders()
  }, [labId])

  function tabularToCSV(data: { columns: string[]; rows: string[][] }) {
    const header = data.columns.join(",")
    const rows = data.rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n")
    return header + "\n" + rows
  }

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
    {
      id: "link",
      name: "Link",
      description: "Save a URL or reference to an external resource",
      icon: LinkIcon,
      formats: ["URL"],
      tag: "LINK",
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

  const handleSave = async () => {
    setIsSaving(true)
    try {
      let fileContent = ""
      let extension = "txt"
      let fileType = "text"
      let fullFileName = fileName
      if (selectedFileType === "tabular") {
        fileContent = tabularToCSV(tabularData)
        extension = "csv"
        fileType = "csv"
        // Validate fileName: must not be empty or just an extension
        const baseName = fileName.replace(new RegExp(`\\.${extension}$`), "").trim();
        if (!baseName || baseName.startsWith(".")) {
          alert("Please enter a valid file name (not just an extension).");
          setIsSaving(false);
          return;
        }
        fullFileName = fileName.endsWith(`.${extension}`) ? fileName : `${fileName}.${extension}`
      } else if (selectedFileType === "code") {
        fileContent = codeContent
        extension = codeLanguage === "python" ? "py" : codeLanguage === "javascript" ? "js" : codeLanguage === "r" ? "r" : "txt"
        fileType = extension
        const baseName = fileName.replace(new RegExp(`\\.${extension}$`), "").trim();
        if (!baseName || baseName.startsWith(".")) {
          alert("Please enter a valid file name (not just an extension).");
          setIsSaving(false);
          return;
        }
        fullFileName = fileName.endsWith(`.${extension}`) ? fileName : `${fileName}.${extension}`
      } else if (selectedFileType === "document") {
        fileContent = documentContent
        extension = documentFormat === "markdown" ? "md" : documentFormat === "html" ? "html" : "txt"
        fileType = extension
        const baseName = fileName.replace(new RegExp(`\\.${extension}$`), "").trim();
        if (!baseName || baseName.startsWith(".")) {
          alert("Please enter a valid file name (not just an extension).");
          setIsSaving(false);
          return;
        }
        fullFileName = fileName.endsWith(`.${extension}`) ? fileName : `${fileName}.${extension}`
      } else if (selectedFileType === "link") {
        fileContent = linkUrl
        extension = "url"
        fileType = "link"
        // Validate linkUrl
        if (!linkUrl || !/^https?:\/\//.test(linkUrl)) {
          alert("Please enter a valid URL (must start with http:// or https://)");
          setIsSaving(false);
          return;
        }
        if (!linkCaption.trim()) {
          alert("Please enter a caption for the link.");
          setIsSaving(false);
          return;
        }
        fullFileName = linkCaption.trim();
      }
      // Always use Blob to get the correct file size
      const encoder = new TextEncoder();
      const fileUint8 = encoder.encode(fileContent);
      const blob = new Blob([fileUint8], { type: "text/plain" });
      const fileSizeKB = `${(blob.size / 1024).toFixed(1)} KB`;
      // 1. Insert DB row
      const { data: inserted, error: dbError } = await supabase.from("files").insert([
        {
          fileType: fileType,
          filename: fullFileName,
          fileSize: `${blob.size} B`,
          labID: labId,
          folder: folder,
          initiallycreatedBy: user?.id || null,
          lastUpdatedBy: user?.id || null,
          lastUpdated: new Date().toISOString(),
          fileTag: documentTag || selectedFileType,
          storageKey: selectedFileType === "link" ? linkUrl : null,
        },
      ]).select()
      if (dbError || !inserted || !inserted[0]?.id) throw dbError || new Error("Failed to insert file record")
      const fileId = inserted[0].id
      // 2. Upload to storage (skip for link)
      let storageKey = null;
      if (selectedFileType !== "link") {
        storageKey = folder && folder !== "root"
          ? `${labId}/${folder}/${fullFileName}`
          : `${labId}/${fullFileName}`;
        const { error: uploadError } = await supabase.storage.from("labmaterials").upload(storageKey, blob)
        if (uploadError) {
          await supabase.from("files").delete().eq("id", fileId)
          throw uploadError
        }
        // 3. Update DB row with storageKey
        await supabase.from("files").update({ storageKey }).eq("id", fileId)
      }
      // Add activity log
      await supabase.from("activity").insert([
        {
          activity_id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
          activity_name: `File Created: ${fullFileName} in ${folder === "root" ? "ROOT" : folder.toUpperCase()}`,
          activity_type: "filecreated",
          performed_by: user?.id || null,
          lab_from: labId
        }
      ]);
      if (onFileCreated) onFileCreated();
      alert("File created and saved to HDX!")
      handleClose()
    } catch (error) {
      alert("Error creating file: " + (error instanceof Error ? error.message : JSON.stringify(error)))
    } finally {
      setIsSaving(false)
    }
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
                      : selectedFileType === "link"
                        ? "Create Link"
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
                    : selectedFileType === "link"
                      ? "Enter a URL or reference"
                      : "Create and format text documents"}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-4">
              {/* File Name and Description fields - only show if not link */}
              {selectedFileType !== "link" && (
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
                        {folders.map((folder) => (
                          <SelectItem key={folder} value={folder}>{folder.toUpperCase()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              {/* Description field - only show if not link */}
              {selectedFileType !== "link" && (
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="Brief description of this file"
                  />
                </div>
              )}
              {/* For link: only show URL and caption, and folder selector */}
              {selectedFileType === "link" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="link-caption">Caption</Label>
                      <Input
                        id="link-caption"
                        value={linkCaption}
                        onChange={(e) => setLinkCaption(e.target.value)}
                        placeholder="e.g. Research Paper on Quantum Physics"
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
                          {folders.map((folder) => (
                            <SelectItem key={folder} value={folder}>{folder.toUpperCase()}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2 p-4">
                    <Label htmlFor="link-url">Link URL</Label>
                    <Input
                      id="link-url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://example.com/resource"
                      type="url"
                    />
                  </div>
                </>
              )}

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
                <Button onClick={handleSave} className="bg-accent text-primary-foreground hover:bg-accent/90" disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save to HDX"}
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
