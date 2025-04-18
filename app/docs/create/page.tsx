"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeftIcon, EyeIcon, PencilIcon } from "lucide-react"
import Link from "next/link"

export default function CreateDocPage() {
  const [content, setContent] = useState("")
  const [title, setTitle] = useState("")

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href="/" className="flex items-center text-sm hover:underline">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Lab Home
        </Link>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader className="pb-4">
          <div className="space-y-2">
            <CardTitle>Create New Documentation</CardTitle>
            <Input
              placeholder="Document Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-bold"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="edit" className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="edit">
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview">
                <EyeIcon className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit">
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => setContent(content + "# ")}>
                    H1
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setContent(content + "## ")}>
                    H2
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setContent(content + "### ")}>
                    H3
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setContent(content + "**Bold**")}>
                    Bold
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setContent(content + "*Italic*")}>
                    Italic
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setContent(content + "- ")}>
                    List
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setContent(content + "1. ")}>
                    Numbered
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setContent(content + "[Link](url)")}>
                    Link
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setContent(content + "```\ncode\n```")}>
                    Code
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setContent(content + "![Alt text](image-url)")}>
                    Image
                  </Button>
                </div>

                <Label htmlFor="content" className="sr-only">
                  Content
                </Label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full min-h-[400px] p-4 border rounded-md font-mono text-sm resize-y"
                  placeholder="Write your documentation here using Markdown..."
                />

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Markdown supported</span>
                  <Link href="#" className="underline">
                    Markdown Guide
                  </Link>
                </div>
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
        <CardFooter className="flex justify-between">
          <Button variant="outline">Save as Draft</Button>
          <div className="space-x-2">
            <Button variant="outline">Cancel</Button>
            <Button>Publish</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
