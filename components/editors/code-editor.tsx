"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Prism from "prismjs"

// Import Prism core styles
import "prismjs/themes/prism-tomorrow.css"
// Import language support
import "prismjs/components/prism-python"
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-r"

interface CodeEditorProps {
  content: string
  language: string
  onContentChange: (content: string) => void
  onLanguageChange: (language: string) => void
  readOnly?: boolean
}

export function CodeEditor({
  content,
  language,
  onContentChange,
  onLanguageChange,
  readOnly = false,
}: CodeEditorProps) {
  const [view, setView] = useState<"edit" | "preview">(readOnly ? "preview" : "edit")

  // Apply syntax highlighting when content, language, or view changes
  useEffect(() => {
    if (view === "preview") {
      Prism.highlightAll()
    }
  }, [content, language, view])

  // Map our language values to Prism's language classes
  const getPrismLanguage = (lang: string) => {
    switch (lang) {
      case "python":
        return "language-python"
      case "javascript":
        return "language-javascript"
      case "r":
        return "language-r"
      default:
        return "language-plaintext"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Label htmlFor="language">Programming Language</Label>
          <Select value={language} onValueChange={onLanguageChange} disabled={readOnly}>
            <SelectTrigger id="language" className="w-[180px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="r">R</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={view} onValueChange={(v) => setView(v as "edit" | "preview")}>
          <TabsList>
            {!readOnly && <TabsTrigger value="edit">Edit</TabsTrigger>}
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="border rounded-md overflow-hidden">
        {view === "edit" && !readOnly ? (
          <textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            className="w-full h-[350px] p-4 font-mono text-sm bg-background text-foreground resize-none focus:outline-none"
            placeholder={`// Write your ${language} code here`}
            readOnly={readOnly}
          />
        ) : (
          <div className="w-full h-[350px] p-4 font-mono text-sm bg-background text-foreground overflow-auto">
            <pre className="m-0">
              <code className={getPrismLanguage(language)}>{content}</code>
            </pre>
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        {language === "python" && "Python 3.x syntax highlighting"}
        {language === "javascript" && "JavaScript (ES6+) syntax highlighting"}
        {language === "r" && "R syntax highlighting"}
      </div>
    </div>
  )
}
