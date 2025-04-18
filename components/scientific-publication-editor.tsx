"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, FileText, Image, LinkIcon, Table, Code, Save, X, Plus } from "lucide-react"

type LabMaterial = {
  id: string
  name: string
  type: "experiment" | "dataset" | "document" | "image"
  selected: boolean
}

export function ScientificPublicationEditor() {
  const [title, setTitle] = useState("")
  const [authors, setAuthors] = useState("")
  const [abstract, setAbstract] = useState("")
  const [content, setContent] = useState("")
  const [activeTab, setActiveTab] = useState("edit")
  const [labMaterials, setLabMaterials] = useState<LabMaterial[]>([
    { id: "1", name: "Experiment: Protein Synthesis", type: "experiment", selected: false },
    { id: "2", name: "Dataset: Gene Expression Results", type: "dataset", selected: false },
    { id: "3", name: "Microscope Images (Series A)", type: "image", selected: false },
    { id: "4", name: "Literature Review Document", type: "document", selected: false },
    { id: "5", name: "Experiment: Cell Culture Growth", type: "experiment", selected: false },
  ])

  const handleMaterialToggle = (id: string) => {
    setLabMaterials(
      labMaterials.map((material) => (material.id === id ? { ...material, selected: !material.selected } : material)),
    )
  }

  const selectedMaterials = labMaterials.filter((material) => material.selected)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "experiment":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "dataset":
        return <Table className="h-4 w-4 text-green-500" />
      case "document":
        return <FileText className="h-4 w-4 text-amber-500" />
      case "image":
        return <Image className="h-4 w-4 text-purple-500" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Create Scientific Publication</h1>
        <div className="flex gap-2">
          <Button variant="outline">Cancel</Button>
          <Button variant="outline">
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button>Publish</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publication Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter publication title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="authors">Authors</Label>
                <Input
                  id="authors"
                  value={authors}
                  onChange={(e) => setAuthors(e.target.value)}
                  placeholder="Enter author names (separated by commas)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="abstract">Abstract</Label>
                <textarea
                  id="abstract"
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  className="w-full min-h-[100px] p-2 border rounded-md resize-y"
                  placeholder="Write a brief abstract of your publication"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="edit" className="space-y-4">
                  <div className="bg-muted/50 p-2 rounded-md flex flex-wrap gap-2">
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4 mr-2" /> Heading
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Image className="h-4 w-4 mr-2" /> Image
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Table className="h-4 w-4 mr-2" /> Table
                    </Button>
                    <Button variant="ghost" size="sm">
                      <LinkIcon className="h-4 w-4 mr-2" /> Link
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Code className="h-4 w-4 mr-2" /> Code
                    </Button>
                  </div>

                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full min-h-[400px] p-4 border rounded-md font-mono text-sm resize-y"
                    placeholder="Write your publication content here using Markdown..."
                  />

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Markdown supported</span>
                  </div>
                </TabsContent>

                <TabsContent value="preview">
                  <div className="border rounded-md p-6 min-h-[400px] prose max-w-none">
                    {content ? (
                      <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, "<br>") }} />
                    ) : (
                      <div className="text-muted-foreground italic">
                        Preview will appear here. Start writing in the Edit tab.
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attached Lab Materials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedMaterials.length > 0 ? (
                  <div className="space-y-2">
                    {selectedMaterials.map((material) => (
                      <div key={material.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(material.type)}
                          <span className="text-sm">{material.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMaterialToggle(material.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No materials attached</p>
                    <p className="text-sm">Select materials from the list below</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Lab Materials</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {labMaterials.map((material) => (
                    <div key={material.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={`material-${material.id}`}
                        checked={material.selected}
                        onCheckedChange={() => handleMaterialToggle(material.id)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor={`material-${material.id}`}
                          className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {getTypeIcon(material.type)}
                          {material.name}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="mt-4">
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Browse More Materials
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publication Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox id="peer-review" />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="peer-review"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Submit for peer review
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Your publication will be reviewed by peers before publishing
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox id="public" defaultChecked />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="public"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Make publication public
                    </label>
                    <p className="text-sm text-muted-foreground">Your publication will be visible to all lab members</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
