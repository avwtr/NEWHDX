"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bold, Italic, List, ListOrdered, Link, Heading1, Heading2, Heading3, Quote } from "lucide-react"

interface DocumentEditorProps {
  content: string
  format: string
  onContentChange: (content: string) => void
  onFormatChange: (format: string) => void
  readOnly?: boolean
}

export function DocumentEditor({
  content,
  format,
  onContentChange,
  onFormatChange,
  readOnly = false,
}: DocumentEditorProps) {
  const [view, setView] = useState<"edit" | "preview">(readOnly ? "preview" : "edit")

  const insertFormatting = (type: string) => {
    if (readOnly) return

    let newContent = content
    const textarea = document.getElementById("document-editor") as HTMLTextAreaElement

    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)

    switch (type) {
      case "bold":
        if (format === "markdown") {
          newContent = content.substring(0, start) + `**${selectedText}**` + content.substring(end)
        } else if (format === "html") {
          newContent = content.substring(0, start) + `<strong>${selectedText}</strong>` + content.substring(end)
        } else {
          newContent = content.substring(0, start) + `${selectedText.toUpperCase()}` + content.substring(end)
        }
        break
      case "italic":
        if (format === "markdown") {
          newContent = content.substring(0, start) + `*${selectedText}*` + content.substring(end)
        } else if (format === "html") {
          newContent = content.substring(0, start) + `<em>${selectedText}</em>` + content.substring(end)
        } else {
          newContent = content.substring(0, start) + `_${selectedText}_` + content.substring(end)
        }
        break
      case "h1":
        if (format === "markdown") {
          newContent = content.substring(0, start) + `# ${selectedText}` + content.substring(end)
        } else if (format === "html") {
          newContent = content.substring(0, start) + `<h1>${selectedText}</h1>` + content.substring(end)
        } else {
          newContent = content.substring(0, start) + `${selectedText.toUpperCase()}` + content.substring(end)
        }
        break
      case "h2":
        if (format === "markdown") {
          newContent = content.substring(0, start) + `## ${selectedText}` + content.substring(end)
        } else if (format === "html") {
          newContent = content.substring(0, start) + `<h2>${selectedText}</h2>` + content.substring(end)
        } else {
          newContent = content.substring(0, start) + `${selectedText.toUpperCase()}` + content.substring(end)
        }
        break
      case "h3":
        if (format === "markdown") {
          newContent = content.substring(0, start) + `### ${selectedText}` + content.substring(end)
        } else if (format === "html") {
          newContent = content.substring(0, start) + `<h3>${selectedText}</h3>` + content.substring(end)
        } else {
          newContent = content.substring(0, start) + `${selectedText.toUpperCase()}` + content.substring(end)
        }
        break
      case "list":
        if (format === "markdown") {
          newContent = content.substring(0, start) + `- ${selectedText}` + content.substring(end)
        } else if (format === "html") {
          newContent = content.substring(0, start) + `<ul><li>${selectedText}</li></ul>` + content.substring(end)
        } else {
          newContent = content.substring(0, start) + `- ${selectedText}` + content.substring(end)
        }
        break
      case "ordered-list":
        if (format === "markdown") {
          newContent = content.substring(0, start) + `1. ${selectedText}` + content.substring(end)
        } else if (format === "html") {
          newContent = content.substring(0, start) + `<ol><li>${selectedText}</li></ol>` + content.substring(end)
        } else {
          newContent = content.substring(0, start) + `1. ${selectedText}` + content.substring(end)
        }
        break
      case "link":
        if (format === "markdown") {
          newContent = content.substring(0, start) + `[${selectedText}](url)` + content.substring(end)
        } else if (format === "html") {
          newContent = content.substring(0, start) + `<a href="url">${selectedText}</a>` + content.substring(end)
        } else {
          newContent = content.substring(0, start) + `${selectedText} (url)` + content.substring(end)
        }
        break
      case "quote":
        if (format === "markdown") {
          newContent = content.substring(0, start) + `> ${selectedText}` + content.substring(end)
        } else if (format === "html") {
          newContent = content.substring(0, start) + `<blockquote>${selectedText}</blockquote>` + content.substring(end)
        } else {
          newContent = content.substring(0, start) + `"${selectedText}"` + content.substring(end)
        }
        break
    }

    onContentChange(newContent)

    // Set focus back to textarea and update cursor position
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + newContent.length - content.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  // Simple preview renderer
  const renderPreview = () => {
    if (format === "markdown") {
      // Very basic markdown rendering
      const html = content
        .replace(/^# (.*$)/gm, "<h1>$1</h1>")
        .replace(/^## (.*$)/gm, "<h2>$1</h2>")
        .replace(/^### (.*$)/gm, "<h3>$1</h3>")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/\[(.*?)\]$$(.*?)$$/g, '<a href="$2">$1</a>')
        .replace(/^> (.*$)/gm, "<blockquote>$1</blockquote>")
        .replace(/^- (.*$)/gm, "<ul><li>$1</li></ul>")
        .replace(/^(\d+)\. (.*$)/gm, "<ol><li>$2</li></ol>")

      return html.replace(/\n/g, "<br>")
    } else if (format === "html") {
      return content
    } else {
      // Plain text
      return content.replace(/\n/g, "<br>")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Label htmlFor="format">Document Format</Label>
          <Select value={format} onValueChange={onFormatChange} disabled={readOnly}>
            <SelectTrigger id="format" className="w-[180px]">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="markdown">Markdown</SelectItem>
              <SelectItem value="html">HTML</SelectItem>
              <SelectItem value="plaintext">Plain Text</SelectItem>
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

      {view === "edit" && !readOnly && (
        <div className="flex flex-wrap gap-2 mb-2">
          <Button variant="outline" size="sm" onClick={() => insertFormatting("bold")}>
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => insertFormatting("italic")}>
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => insertFormatting("h1")}>
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => insertFormatting("h2")}>
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => insertFormatting("h3")}>
            <Heading3 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => insertFormatting("list")}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => insertFormatting("ordered-list")}>
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => insertFormatting("link")}>
            <Link className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => insertFormatting("quote")}>
            <Quote className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="border rounded-md overflow-hidden">
        {view === "edit" && !readOnly ? (
          <textarea
            id="document-editor"
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            className="w-full h-[350px] p-4 font-mono text-sm resize-none focus:outline-none bg-background text-foreground"
            placeholder={
              format === "markdown"
                ? "# Start writing in Markdown"
                : format === "html"
                  ? "<h1>Start writing in HTML</h1>"
                  : "Start writing..."
            }
            readOnly={readOnly}
          />
        ) : (
          <div
            className="w-full h-[350px] p-4 overflow-auto prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: renderPreview() }}
          />
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        {format === "markdown" && "Markdown formatting supported"}
        {format === "html" && "HTML formatting supported"}
        {format === "plaintext" && "Plain text document"}
      </div>
    </div>
  )
}
