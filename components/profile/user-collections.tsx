"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileIcon, Database, FileText, FileCode, Download } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/components/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileViewerDialog, downloadFile } from "@/components/file-viewer-dialog"

export function UserCollections() {
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [files, setFiles] = useState<any[]>([])
  const { user } = useAuth();
  const [labMap, setLabMap] = useState<Record<string, any>>({})
  const [viewerFile, setViewerFile] = useState<any | null>(null)

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true)
    setError(null)
    supabase
      .from("saved_files")
      .select("file_id, labId, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(async ({ data, error }) => {
        if (error) {
          setError(error.message)
          setFiles([])
          setLoading(false)
          return
        }
        const savedRows = data || [];
        const fileIds = savedRows.map((row: any) => String(row.file_id)).filter(Boolean);
        if (!fileIds.length) {
          setFiles([])
          setLoading(false)
          return;
        }
        // Fetch files by string IDs
        const { data: fileRows, error: fileError } = await supabase
          .from("files")
          .select("*")
          .in("id", fileIds)
        if (fileError) {
          setError(fileError.message)
          setFiles([])
          setLoading(false)
          return
        }
        // Merge by string comparison
        const files = savedRows.map((row: any) => {
          const file = (fileRows || []).find((f: any) => String(f.id) === String(row.file_id))
          return file ? { ...file, savedAt: row.created_at, labId: row.labId } : null
        }).filter(Boolean)
        setFiles(files)
        // Batch fetch labs for all unique labIds
        const uniqueLabIds = Array.from(new Set(files.map((f: any) => f.labId).filter(Boolean)))
        let labMap: Record<string, any> = {}
        if (uniqueLabIds.length) {
          const { data: labs } = await supabase
            .from("labs")
            .select("labId, labName, profilePic")
            .in("labId", uniqueLabIds)
          if (labs) {
            labs.forEach((lab: any) => {
              labMap[lab.labId] = { name: lab.labName, profilePic: lab.profilePic }
            })
          }
        }
        setLabMap(labMap)
        setLoading(false)
      })
  }, [user?.id])

  // Helper to get icon for file type
  const getIconForFile = (file: any) => {
    const type = (file.fileType || file.type || "").toLowerCase()
    if (["csv", "xlsx", "json", "fits"].includes(type)) return <Database className="h-4 w-4" />
    if (["pdf", "md", "txt", "doc", "docx"].includes(type)) return <FileText className="h-4 w-4" />
    if (["py", "js", "ts", "r", "c", "cpp", "java", "php", "rb", "go", "rust"].includes(type)) return <FileCode className="h-4 w-4" />
    return <FileIcon className="h-4 w-4" />
  }

  // Filter files by search query
  const filteredFiles = files.filter((file) => {
    const q = searchQuery.toLowerCase()
    return (
      (file.name || file.title || file.filename || "").toLowerCase().includes(q) ||
      (file.description || "").toLowerCase().includes(q) ||
      (file.fileType || file.type || "").toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div className="flex items-center mb-4">
        <input
          type="text"
          placeholder="Search saved files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border rounded px-3 py-2 w-full max-w-md"
        />
      </div>
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-8">No saved files found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredFiles.map((file) => {
            const lab = labMap[file.labId] || {}
            return (
              <Card key={file.id} className="overflow-hidden">
                <div className="bg-muted p-6 flex items-center justify-center">{getIconForFile(file)}</div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base truncate mb-2">{file.name || file.title || file.filename}</CardTitle>
                  <CardDescription className="text-xs flex justify-between mb-2">
                    <span>
                      {(file.fileType || file.type || "").toUpperCase()} {file.fileSize ? `• ${file.fileSize}` : ""}
                    </span>
                    <span>{file.savedAt ? new Date(file.savedAt).toLocaleDateString() : ""}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 pb-2">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={lab.profilePic || "/placeholder.svg?height=40&width=40"} alt={lab.name || "Lab"} />
                      <AvatarFallback>{(lab.name || "L").charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground truncate max-w-[120px]">{lab.name || "Unknown Lab"}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex-1" />
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setViewerFile(file)}>
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => { try { await downloadFile(file); } catch (e) { alert('Download failed'); } }}
                        title="Download file"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
      {/* File Viewer Dialog Overlay */}
      {viewerFile && (
        <FileViewerDialog
          file={viewerFile}
          isOpen={!!viewerFile}
          onClose={() => setViewerFile(null)}
          userRole="user"
          labId={viewerFile.labId}
        />
      )}
    </div>
  )
}
