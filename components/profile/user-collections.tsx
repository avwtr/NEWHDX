"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileIcon, Database, FileText, FileCode, Search, Filter, Grid3X3, List } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/components/auth-provider"

export function UserCollections() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [files, setFiles] = useState<any[]>([])
  const { user } = useAuth();

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
        // Cast all file_ids to string
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
        setLoading(false)
      })
  }, [user?.id])

  // Group files by type for tabs
  const datasets = files.filter(f => ["csv", "xlsx", "json", "fits"].includes((f.fileType || "").toLowerCase()))
  const documents = files.filter(f => ["pdf", "md", "txt", "doc", "docx"].includes((f.fileType || "").toLowerCase()))
  const code = files.filter(f => ["py", "js", "ts", "r", "c", "cpp", "java", "php", "rb", "go", "rust"].includes((f.fileType || "").toLowerCase()))
  const all = files

  const getIconForFile = (file: any) => {
    const type = (file.fileType || "").toLowerCase()
    if (["csv", "xlsx", "json", "fits"].includes(type)) return <Database className="h-4 w-4" />
    if (["pdf", "md", "txt", "doc", "docx"].includes(type)) return <FileText className="h-4 w-4" />
    if (["py", "js", "ts", "r", "c", "cpp", "java", "php", "rb", "go", "rust"].includes(type)) return <FileCode className="h-4 w-4" />
    return <FileIcon className="h-4 w-4" />
  }

  const renderGridView = (items: any[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {items.map((file) => (
        <Card key={file.id} className="overflow-hidden">
          <div className="bg-muted p-6 flex items-center justify-center">{getIconForFile(file)}</div>
          <CardHeader className="pb-2">
            <CardTitle className="text-base truncate">{file.filename}</CardTitle>
            <CardDescription className="text-xs flex justify-between">
              <span>
                {file.fileType?.toUpperCase()} • {file.fileSize}
              </span>
              <span>{file.savedAt ? new Date(file.savedAt).toLocaleDateString() : ""}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {file.labId ? <Link href={`/labs/${file.labId}`}>Lab</Link> : ""}
              </span>
              <Button variant="ghost" size="sm">
                View
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderListView = (items: any[]) => (
    <div className="mt-4">
      <div className="bg-muted rounded-md px-4 py-2 grid grid-cols-12 text-xs font-medium">
        <div className="col-span-5">Name</div>
        <div className="col-span-2">Type</div>
        <div className="col-span-2">Size</div>
        <div className="col-span-2">Saved</div>
        <div className="col-span-1"></div>
      </div>
      <div className="mt-2 space-y-1">
        {items.map((file) => (
          <div key={file.id} className="grid grid-cols-12 items-center px-4 py-2 hover:bg-muted/50 rounded-md">
            <div className="col-span-5 flex items-center gap-2">
              <span className="p-1 rounded-md bg-muted">{getIconForFile(file)}</span>
              <span className="truncate">{file.filename}</span>
            </div>
            <div className="col-span-2 text-sm text-muted-foreground">{file.fileType?.toUpperCase()}</div>
            <div className="col-span-2 text-sm text-muted-foreground">{file.fileSize}</div>
            <div className="col-span-2 text-sm text-muted-foreground">{file.savedAt ? new Date(file.savedAt).toLocaleDateString() : ""}</div>
            <div className="col-span-1 text-right">
              <Button variant="ghost" size="sm">
                View
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  if (loading) return <div className="py-8 text-center">Loading saved files...</div>
  if (error) return <div className="py-8 text-center text-red-500">{error}</div>
  if (!files.length) return <div className="py-8 text-center text-muted-foreground">No saved files found.</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Saved Stuff</h3>
        <div className="flex gap-2">
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}> <Grid3X3 className="h-4 w-4" /> </Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}> <List className="h-4 w-4" /> </Button>
        </div>
      </div>
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search saved files..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="datasets">Datasets</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {viewMode === "grid" ? renderGridView(all) : renderListView(all)}
        </TabsContent>
        <TabsContent value="datasets">
          {viewMode === "grid" ? renderGridView(datasets) : renderListView(datasets)}
        </TabsContent>
        <TabsContent value="documents">
          {viewMode === "grid" ? renderGridView(documents) : renderListView(documents)}
        </TabsContent>
        <TabsContent value="code">
          {viewMode === "grid" ? renderGridView(code) : renderListView(code)}
        </TabsContent>
      </Tabs>
    </div>
  )
}
