"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUploader } from "@/components/file-uploader"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"

export default function SubmitContributionPage() {
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
          <CardTitle>Submit a Contribution</CardTitle>
          <CardDescription>Share your research, code, or improvements with the lab</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="contribution-title">Title</Label>
            <Input id="contribution-title" placeholder="Enter a descriptive title for your contribution" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contribution-type">Contribution Type</Label>
            <Select>
              <SelectTrigger id="contribution-type">
                <SelectValue placeholder="Select contribution type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="analysis">Analysis</SelectItem>
                <SelectItem value="revision">Revision</SelectItem>
                <SelectItem value="models-code">Models/Code</SelectItem>
                <SelectItem value="capsule-materials">Capsule Materials</SelectItem>
                <SelectItem value="data">Data</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="related-experiment">CONTRIBUTION TO AN ONGOING EXPERIMENT? (optional)</Label>
            <Select>
              <SelectTrigger id="related-experiment">
                <SelectValue placeholder="Select an experiment (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bci">
                  Brain-Computer Interface{" "}
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full font-medium">
                    LIVE
                  </span>
                </SelectItem>
                <SelectItem value="neural">
                  Neural Correlates of Decision Making{" "}
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full font-medium">
                    LIVE
                  </span>
                </SelectItem>
                <SelectItem value="cognitive">
                  Cognitive Load Assessment{" "}
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full font-medium">
                    LIVE
                  </span>
                </SelectItem>
                <SelectItem value="none">Not related to a specific experiment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contribution-description">Description</Label>
            <Textarea
              id="contribution-description"
              placeholder="Describe your contribution, its purpose, and how it should be used"
              className="min-h-[150px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Files</Label>
            <FileUploader onChange={handleFileChange} />

            {selectedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Selected Files:</p>
                <ul className="text-sm space-y-1">
                  {selectedFiles.map((file, index) => (
                    <li key={index} className="flex items-center">
                      <span className="text-blue-500 mr-2">•</span>
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button>Submit for Review</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
