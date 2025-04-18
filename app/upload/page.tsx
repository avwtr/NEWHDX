"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUploader } from "@/components/file-uploader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeftIcon, FileIcon, FolderIcon } from "lucide-react"
import Link from "next/link"

export default function UploadPage() {
  const [fileType, setFileType] = useState("file")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleFileChange = (files: File[]) => {
    setSelectedFiles(files)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href="/" className="flex items-center text-sm hover:underline">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Lab Home
        </Link>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Upload to Lab Repository</CardTitle>
          <CardDescription>Share your research data, code, or documentation with the lab</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="file" onValueChange={setFileType} className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="file">
                <FileIcon className="h-4 w-4 mr-2" />
                File Upload
              </TabsTrigger>
              <TabsTrigger value="folder">
                <FolderIcon className="h-4 w-4 mr-2" />
                Create Folder
              </TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file-title">Title</Label>
                  <Input id="file-title" placeholder="Enter a descriptive title for your file" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file-description">Description</Label>
                  <Textarea
                    id="file-description"
                    placeholder="Describe what this file contains and how it should be used"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file-category">Category</Label>
                  <Select>
                    <SelectTrigger id="file-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dataset">Dataset</SelectItem>
                      <SelectItem value="code">Code</SelectItem>
                      <SelectItem value="protocol">Protocol</SelectItem>
                      <SelectItem value="results">Results</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>File</Label>
                  <FileUploader onChange={handleFileChange} />

                  {selectedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">Selected Files:</p>
                      <ul className="text-sm space-y-1">
                        {selectedFiles.map((file, index) => (
                          <li key={index} className="flex items-center">
                            <FileIcon className="h-4 w-4 mr-2 text-blue-500" />
                            {file.name} ({(file.size / 1024).toFixed(1)} KB)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="folder" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="folder-name">Folder Name</Label>
                  <Input id="folder-name" placeholder="Enter a name for your new folder" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="folder-description">Description</Label>
                  <Textarea
                    id="folder-description"
                    placeholder="Describe what this folder will contain"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="folder-parent">Parent Folder</Label>
                  <Select defaultValue="root">
                    <SelectTrigger id="folder-parent">
                      <SelectValue placeholder="Select parent folder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="root">Root (Lab Repository)</SelectItem>
                      <SelectItem value="datasets">Datasets</SelectItem>
                      <SelectItem value="models">Models</SelectItem>
                      <SelectItem value="protocols">Protocols</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel</Button>
          <Button>{fileType === "file" ? "Upload File" : "Create Folder"}</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
