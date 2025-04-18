"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileIcon, Database, FileText, FileCode, Search, Filter, Grid3X3, List } from "lucide-react"
import Link from "next/link"

export function UserCollections() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")

  // Mock data - in a real app, this would come from an API
  const savedItems = {
    datasets: [
      {
        id: "data-1",
        name: "Human Genome Sequence v2.3",
        type: "dataset",
        format: "FASTA",
        size: "2.1 GB",
        lab: { id: "lab-1", name: "Genomic Data Analysis Lab" },
        dateAdded: "2 weeks ago",
        icon: <Database className="h-4 w-4" />,
      },
      {
        id: "data-2",
        name: "Protein Structure Benchmark",
        type: "dataset",
        format: "PDB",
        size: "450 MB",
        lab: { id: "lab-2", name: "Protein Folding Simulation" },
        dateAdded: "1 month ago",
        icon: <Database className="h-4 w-4" />,
      },
      {
        id: "data-3",
        name: "Neural Network Training Data",
        type: "dataset",
        format: "CSV",
        size: "780 MB",
        lab: { id: "lab-3", name: "Neural Network Applications in Biology" },
        dateAdded: "2 months ago",
        icon: <Database className="h-4 w-4" />,
      },
    ],
    documents: [
      {
        id: "doc-1",
        name: "Sequence Alignment Methodology",
        type: "document",
        format: "PDF",
        size: "2.3 MB",
        lab: { id: "lab-1", name: "Genomic Data Analysis Lab" },
        dateAdded: "3 weeks ago",
        icon: <FileText className="h-4 w-4" />,
      },
      {
        id: "doc-2",
        name: "AlphaFold Implementation Results",
        type: "document",
        format: "PDF",
        size: "5.7 MB",
        lab: { id: "lab-2", name: "Protein Folding Simulation" },
        dateAdded: "1 month ago",
        icon: <FileText className="h-4 w-4" />,
      },
      {
        id: "doc-3",
        name: "Data Preprocessing Pipeline",
        type: "document",
        format: "MD",
        size: "1.2 MB",
        lab: { id: "lab-3", name: "Neural Network Applications in Biology" },
        dateAdded: "6 weeks ago",
        icon: <FileText className="h-4 w-4" />,
      },
      {
        id: "doc-4",
        name: "Transfer Learning Results Discussion",
        type: "document",
        format: "PDF",
        size: "3.8 MB",
        lab: { id: "lab-3", name: "Neural Network Applications in Biology" },
        dateAdded: "2 months ago",
        icon: <FileText className="h-4 w-4" />,
      },
    ],
    code: [
      {
        id: "code-1",
        name: "Genomic Analysis Pipeline",
        type: "code",
        format: "Python",
        size: "1.2 MB",
        lab: { id: "lab-1", name: "Genomic Data Analysis Lab" },
        dateAdded: "1 month ago",
        icon: <FileCode className="h-4 w-4" />,
      },
      {
        id: "code-2",
        name: "Protein Structure Prediction Model",
        type: "code",
        format: "Python",
        size: "2.5 MB",
        lab: { id: "lab-2", name: "Protein Folding Simulation" },
        dateAdded: "2 months ago",
        icon: <FileCode className="h-4 w-4" />,
      },
      {
        id: "code-3",
        name: "CNN Implementation for Protein Classification",
        type: "code",
        format: "Jupyter",
        size: "4.1 MB",
        lab: { id: "lab-3", name: "Neural Network Applications in Biology" },
        dateAdded: "3 months ago",
        icon: <FileCode className="h-4 w-4" />,
      },
    ],
  }

  const getIconForItem = (item) => {
    if (item.icon) return item.icon

    const icons = {
      dataset: <Database className="h-4 w-4" />,
      document: <FileText className="h-4 w-4" />,
      code: <FileCode className="h-4 w-4" />,
    }

    return icons[item.type] || <FileIcon className="h-4 w-4" />
  }

  const renderGridView = (items) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {items.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <div className="bg-muted p-6 flex items-center justify-center">{getIconForItem(item)}</div>
          <CardHeader className="pb-2">
            <CardTitle className="text-base truncate">{item.name}</CardTitle>
            <CardDescription className="text-xs flex justify-between">
              <span>
                {item.format} • {item.size}
              </span>
              <span>{item.dateAdded}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <Link href={`/labs/${item.lab.id}`} className="text-xs text-muted-foreground hover:underline">
                {item.lab.name}
              </Link>
              <Button variant="ghost" size="sm">
                View
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderListView = (items) => (
    <div className="mt-4">
      <div className="bg-muted rounded-md px-4 py-2 grid grid-cols-12 text-xs font-medium">
        <div className="col-span-5">Name</div>
        <div className="col-span-2">Type</div>
        <div className="col-span-2">Size</div>
        <div className="col-span-2">Added</div>
        <div className="col-span-1"></div>
      </div>

      <div className="mt-2 space-y-1">
        {items.map((item) => (
          <div key={item.id} className="grid grid-cols-12 items-center px-4 py-2 hover:bg-muted/50 rounded-md">
            <div className="col-span-5 flex items-center gap-2">
              <span className="p-1 rounded-md bg-muted">{getIconForItem(item)}</span>
              <span className="truncate">{item.name}</span>
            </div>
            <div className="col-span-2 text-sm text-muted-foreground">{item.format}</div>
            <div className="col-span-2 text-sm text-muted-foreground">{item.size}</div>
            <div className="col-span-2 text-sm text-muted-foreground">{item.dateAdded}</div>
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

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">My Collections</h3>
        <div className="flex gap-2">
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search collections..."
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
          {viewMode === "grid"
            ? renderGridView([...savedItems.datasets, ...savedItems.documents, ...savedItems.code])
            : renderListView([...savedItems.datasets, ...savedItems.documents, ...savedItems.code])}
        </TabsContent>

        <TabsContent value="datasets">
          {viewMode === "grid" ? renderGridView(savedItems.datasets) : renderListView(savedItems.datasets)}
        </TabsContent>

        <TabsContent value="documents">
          {viewMode === "grid" ? renderGridView(savedItems.documents) : renderListView(savedItems.documents)}
        </TabsContent>

        <TabsContent value="code">
          {viewMode === "grid" ? renderGridView(savedItems.code) : renderListView(savedItems.code)}
        </TabsContent>
      </Tabs>
    </div>
  )
}
