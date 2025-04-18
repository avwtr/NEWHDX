"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ExternalLink, Download, Users, BookOpen, BarChart, Plus } from "lucide-react"

export function UserPublications() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOption, setSortOption] = useState("newest")

  // Mock data for publications
  const publications = [
    {
      id: "pub-1",
      title: "Novel Approaches to Protein Structure Prediction Using Deep Learning",
      journal: "Journal of Computational Biology",
      date: "March 2023",
      authors: ["Alex Johnson", "Maria Rodriguez", "David Chen"],
      doi: "10.1234/jcb.2023.0123",
      citations: 12,
      views: 345,
      type: "journal",
      abstract:
        "This paper presents a novel deep learning approach for predicting protein structures with higher accuracy than existing methods. By combining convolutional neural networks with attention mechanisms, we achieve state-of-the-art results on benchmark datasets.",
      keywords: ["Protein Structure", "Deep Learning", "Neural Networks", "Computational Biology"],
    },
    {
      id: "pub-2",
      title: "Genomic Data Analysis Pipeline for Rare Disease Identification",
      journal: "Bioinformatics",
      date: "November 2022",
      authors: ["Alex Johnson", "Sarah Williams", "Robert Brown", "Jennifer Lee"],
      doi: "10.1234/bioinf.2022.0456",
      citations: 8,
      views: 289,
      type: "journal",
      abstract:
        "We present a comprehensive pipeline for analyzing genomic data to identify rare diseases. Our approach combines variant calling, filtering, and machine learning classification to prioritize potential disease-causing variants.",
      keywords: ["Genomics", "Rare Diseases", "Variant Calling", "Machine Learning"],
    },
    {
      id: "pub-3",
      title: "Machine Learning Applications in Drug Discovery: A Systematic Review",
      journal: "Proceedings of the International Conference on Bioinformatics",
      date: "July 2022",
      authors: ["Alex Johnson", "Michael Smith"],
      doi: "10.1234/icb.2022.789",
      citations: 15,
      views: 412,
      type: "conference",
      abstract:
        "This systematic review examines the current state of machine learning applications in drug discovery. We analyze over 200 papers published in the last five years and identify key trends, challenges, and opportunities in this rapidly evolving field.",
      keywords: ["Drug Discovery", "Machine Learning", "Systematic Review", "Computational Chemistry"],
    },
    {
      id: "pub-4",
      title: "Improving Neural Network Training for Biological Sequence Analysis",
      journal: "bioRxiv",
      date: "February 2023",
      authors: ["Alex Johnson", "Lisa Garcia", "Thomas Wilson"],
      doi: "10.1101/2023.02.15.123456",
      citations: 3,
      views: 178,
      type: "preprint",
      abstract:
        "Training neural networks on biological sequence data presents unique challenges. In this preprint, we propose several techniques to improve training stability and performance, including specialized data augmentation methods and architecture modifications.",
      keywords: ["Neural Networks", "Biological Sequences", "Training Methods", "Data Augmentation"],
    },
  ]

  // Filter publications based on search query
  const filteredPublications = publications.filter(
    (pub) =>
      pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pub.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pub.keywords.some((keyword) => keyword.toLowerCase().includes(searchQuery.toLowerCase())) ||
      pub.authors.some((author) => author.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Sort publications based on selected option
  const sortedPublications = [...filteredPublications].sort((a, b) => {
    switch (sortOption) {
      case "newest":
        return new Date(b.date) - new Date(a.date)
      case "oldest":
        return new Date(a.date) - new Date(b.date)
      case "citations":
        return b.citations - a.citations
      case "views":
        return b.views - a.views
      default:
        return 0
    }
  })

  const renderPublicationCard = (publication) => (
    <Card key={publication.id} className="mb-6">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{publication.title}</CardTitle>
            <CardDescription className="mt-1">
              {publication.journal} • {publication.date}
            </CardDescription>
          </div>
          <Badge
            variant={
              publication.type === "journal" ? "default" : publication.type === "conference" ? "secondary" : "outline"
            }
          >
            {publication.type === "journal"
              ? "Journal Article"
              : publication.type === "conference"
                ? "Conference Paper"
                : "Preprint"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm mb-4">
          <span className="font-medium">Authors: </span>
          {publication.authors.join(", ")}
        </div>

        <div className="text-sm mb-4">{publication.abstract}</div>

        <div className="flex flex-wrap gap-2 mb-4">
          {publication.keywords.map((keyword, index) => (
            <Badge key={index} variant="outline">
              {keyword}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <BookOpen className="h-4 w-4 mr-1" />
            <span>DOI: {publication.doi}</span>
          </div>
          <div className="flex items-center">
            <BarChart className="h-4 w-4 mr-1" />
            <span>{publication.citations} citations</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{publication.views} views</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          PDF
        </Button>
        <Button variant="outline" size="sm">
          <ExternalLink className="mr-2 h-4 w-4" />
          View Online
        </Button>
      </CardFooter>
    </Card>
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">My Publications ({publications.length})</h3>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Publication
        </Button>
      </div>

      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search publications..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select defaultValue="newest" onValueChange={(value) => setSortOption(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="citations">Most Cited</SelectItem>
            <SelectItem value="views">Most Viewed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4">
        {sortedPublications.length > 0 ? (
          sortedPublications.map((publication) => renderPublicationCard(publication))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery
              ? "No publications match your search criteria."
              : "No publications found. Add your first publication to showcase your research."}
          </div>
        )}
      </div>
    </div>
  )
}
