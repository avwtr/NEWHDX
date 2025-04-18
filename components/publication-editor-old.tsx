"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { FileIcon, FolderIcon, ImageIcon, LinkIcon, ListIcon, TableIcon } from "lucide-react"
import Link from "next/link"

type LabMaterial = {
  id: string
  name: string
  type: "file" | "folder"
  selected?: boolean
}

export function PublicationEditor() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [materials, setMaterials] = useState<LabMaterial[]>([
    { id: "1", name: "Experiment Data.xlsx", type: "file" },
    { id: "2", name: "Research Notes", type: "folder" },
    { id: "3", name: "Microscope Images", type: "folder" },
    { id: "4", name: "Literature Review.docx", type: "file" },
    { id: "5", name: "Results Graph.png", type: "file" },
    { id: "6", name: "Methodology.pdf", type: "file" },
  ])

  const toggleMaterialSelection = (id: string) => {
    setMaterials(
      materials.map((material) => (material.id === id ? { ...material, selected: !material.selected } : material)),
    )
  }

  const selectedMaterials = materials.filter((material) => material.selected)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Create Scientific Publication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Publication Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter publication title..."
              />
            </div>

            <Tabs defaultValue="edit">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="space-y-4">
                <div className="flex items-center gap-2 border rounded-md p-1">
                  <Button variant="ghost" size="sm">
                    <ListIcon className="h-4 w-4 mr-1" /> List
                  </Button>
                  <Button variant="ghost" size="sm">
                    <TableIcon className="h-4 w-4 mr-1" /> Table
                  </Button>
                  <Button variant="ghost" size="sm">
                    <LinkIcon className="h-4 w-4 mr-1" /> Link
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ImageIcon className="h-4 w-4 mr-1" /> Image
                  </Button>
                </div>

                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full min-h-[400px] p-4 border rounded-md font-mono text-sm resize-y"
                  placeholder="Write your publication content here..."
                />

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Markdown supported</span>
                  <Link href="#" className="underline">
                    Formatting Guide
                  </Link>
                </div>
              </TabsContent>

              <TabsContent value="preview">
                <div className="border rounded-md p-6 min-h-[400px] prose max-w-none">
                  {title && <h1>{title}</h1>}
                  {content ? (
                    <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, "<br>") }} />
                  ) : (
                    <div className="text-muted-foreground italic">
                      Preview will appear here. Start writing in the Edit tab.
                    </div>
                  )}

                  {selectedMaterials.length > 0 && (
                    <>
                      <h2>Attached Materials</h2>
                      <ul>
                        {selectedMaterials.map((material) => (
                          <li key={material.id}>{material.name}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Save as Draft</Button>
            <div className="space-x-2">
              <Button variant="outline">Cancel</Button>
              <Button>Publish</Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Attach Lab Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">Select files or folders to attach to your publication</div>

              <Separator />

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {materials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted cursor-pointer"
                      onClick={() => toggleMaterialSelection(material.id)}
                    >
                      <Checkbox
                        id={`material-${material.id}`}
                        checked={material.selected}
                        onCheckedChange={() => toggleMaterialSelection(material.id)}
                      />
                      {material.type === "file" ? (
                        <FileIcon className="h-4 w-4 text-blue-500" />
                      ) : (
                        <FolderIcon className="h-4 w-4 text-yellow-500" />
                      )}
                      <Label htmlFor={`material-${material.id}`} className="flex-1 cursor-pointer">
                        {material.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <Separator />

              <div className="text-sm">
                <span className="font-medium">{selectedMaterials.length}</span> items selected
              </div>

              <Button className="w-full" variant="outline">
                Browse More Materials
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
