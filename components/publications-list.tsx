"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, FileText, BookOpen, Award, PlusCircle, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { useRole } from "@/contexts/role-context"

interface Author {
  name: string
  affiliation?: string
}

interface Publication {
  id: number
  title: string
  authors: Author[]
  journal?: string
  conference?: string
  year: number
  doi?: string
  url?: string
  abstract?: string
  tags: string[]
  type: "journal" | "conference" | "preprint" | "book"
}

// Sample publications data
const samplePublications: Publication[] = [
  {
    id: 1,
    title: "NEURAL NETWORK ADAPTATIONS IN COGNITIVE LEARNING",
    authors: [
      { name: "Dr. Sarah Johnson", affiliation: "Neuroscience Lab" },
      { name: "Alex Kim", affiliation: "Neuroscience Lab" },
    ],
    journal: "Journal of Neuroscience",
    year: 2023,
    doi: "10.1234/jns.2023.001",
    url: "#",
    abstract:
      "This study explores the adaptations in neural networks during cognitive learning tasks, revealing new patterns of connectivity.",
    tags: ["neuroscience", "cognitive-science", "neural-networks"],
    type: "journal",
  },
  {
    id: 2,
    title: "MAPPING BRAIN ACTIVITY DURING COMPLEX PROBLEM SOLVING",
    authors: [
      { name: "Dr. Sarah Johnson", affiliation: "Neuroscience Lab" },
      { name: "Maria Lopez", affiliation: "Neuroscience Lab" },
    ],
    journal: "Cognitive Science",
    year: 2022,
    doi: "10.1234/cs.2022.042",
    url: "#",
    abstract: "Using fMRI techniques, this research maps brain activity patterns during complex problem-solving tasks.",
    tags: ["brain-mapping", "problem-solving", "fMRI"],
    type: "journal",
  },
  {
    id: 3,
    title: "ADVANCES IN BRAIN-COMPUTER INTERFACE TECHNOLOGIES",
    authors: [
      { name: "Alex Kim", affiliation: "Neuroscience Lab" },
      { name: "Dr. James Wilson", affiliation: "AI Ethics Lab" },
    ],
    conference: "International Conference on Neural Engineering",
    year: 2023,
    url: "#",
    abstract:
      "This paper presents recent advances in brain-computer interface technologies for assistive applications.",
    tags: ["brain-computer-interface", "neural-engineering", "assistive-technology"],
    type: "conference",
  },
]

interface PublicationsListProps {
  publications?: Publication[]
}

const PublicationsList: React.FC<PublicationsListProps> = ({ publications = samplePublications }) => {
  // Use the provided publications or fall back to sample data
  const [displayPublications, setDisplayPublications] = useState(publications || samplePublications)
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [publicationToDelete, setPublicationToDelete] = useState<Publication | null>(null)

  const { currentRole } = useRole()
  const isAdmin = currentRole === "admin"

  const getPublicationIcon = (type: Publication["type"]) => {
    switch (type) {
      case "journal":
        return <FileText className="h-5 w-5 text-accent" />
      case "conference":
        return <Award className="h-5 w-5 text-accent" />
      case "preprint":
        return <FileText className="h-5 w-5 text-accent" />
      case "book":
        return <BookOpen className="h-5 w-5 text-accent" />
      default:
        return <FileText className="h-5 w-5 text-accent" />
    }
  }

  const handleSaveToProfile = () => {
    // In a real app, this would call an API to save the publication to the user's profile
    if (selectedPublication) {
      toast({
        title: "Publication saved",
        description: `${selectedPublication.title} has been saved to your profile.`,
      })
      setSaveDialogOpen(false)
    }
  }

  const handleDeleteClick = (publication: Publication) => {
    setPublicationToDelete(publication)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (publicationToDelete) {
      setDisplayPublications(displayPublications.filter((pub) => pub.id !== publicationToDelete.id))
      toast({
        title: "Publication deleted",
        description: `${publicationToDelete.title} has been deleted successfully.`,
      })
      setDeleteDialogOpen(false)
      setPublicationToDelete(null)
    }
  }

  return (
    <div className="space-y-4">
      {displayPublications.map((publication) => (
        <Card key={publication.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="mt-1">{getPublicationIcon(publication.type)}</div>
              <div className="space-y-2 flex-1">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-accent">{publication.title}</h3>
                  <div className="flex items-center gap-2 ml-2 -mt-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-green-500 hover:bg-green-500/10 hover:text-green-400"
                      onClick={() => {
                        setSelectedPublication(publication)
                        setSaveDialogOpen(true)
                      }}
                      title="Save to profile"
                    >
                      <PlusCircle className="h-5 w-5" />
                    </Button>

                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                        onClick={() => handleDeleteClick(publication)}
                        title="Delete publication"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {publication.authors.map((author) => author.name).join(", ")}
                </p>
                <p className="text-sm">
                  {publication.journal || publication.conference}, {publication.year}
                </p>
                {publication.abstract && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{publication.abstract}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {publication.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag.toUpperCase()}
                    </Badge>
                  ))}
                </div>
                <div className="flex justify-end mt-2">
                  {publication.url && (
                    <Button variant="ghost" size="sm" className="text-accent hover:bg-secondary/80" asChild>
                      <a href={publication.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        VIEW PUBLICATION
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Save to Profile Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save to Profile</DialogTitle>
            <DialogDescription>Do you want to save this publication to your profile?</DialogDescription>
          </DialogHeader>
          {selectedPublication && (
            <div className="flex flex-col gap-3 p-3 bg-secondary/30 rounded-md">
              <div className="flex items-center gap-2">
                {getPublicationIcon(selectedPublication.type)}
                <h3 className="font-medium">{selectedPublication.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedPublication.authors.map((author) => author.name).join(", ")}
              </p>
              <p className="text-sm">
                {selectedPublication.journal || selectedPublication.conference}, {selectedPublication.year}
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedPublication.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <DialogFooter className="flex sm:justify-between mt-4">
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleSaveToProfile}>
              Save to My Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Publication</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this publication? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {publicationToDelete && (
            <div className="flex flex-col gap-3 p-3 my-2 bg-secondary/30 rounded-md">
              <div className="flex items-center gap-2">
                {getPublicationIcon(publicationToDelete.type)}
                <h3 className="font-medium">{publicationToDelete.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {publicationToDelete.authors.map((author) => author.name).join(", ")}
              </p>
              <p className="text-sm">
                {publicationToDelete.journal || publicationToDelete.conference}, {publicationToDelete.year}
              </p>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600 text-white">
              Delete Publication
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default PublicationsList
