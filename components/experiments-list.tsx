"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, PlusCircle, Trash2, Clock, BeakerIcon, Calendar } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { useRoleContext } from "@/contexts/role-context"
import Link from "next/link"
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
import { supabase } from "@/lib/supabase"

interface Contributor {
  id: string
  name: string
  avatar?: string
  initials: string
}

interface ExperimentFile {
  id: string
  name: string
  type: string
  addedBy: string
  date: string
}

interface Experiment {
  id: number
  name: string
  description: string
  objective: string
  status: "LIVE" | "CONCLUDED"
  startDate: string
  endDate?: string
  categories: string[]
  contributors: Contributor[]
  files: ExperimentFile[]
  results?: string
}

interface ExperimentsListProps {
  labId: string
  experiments?: Experiment[]
}

// Function to generate a unique color for each category
const generateColorForCategory = (category: string) => {
  let hash = 0
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash)
  }
  let color = "#"
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    color += ("00" + value.toString(16)).substr(-2)
  }
  return color
}

export const ExperimentsList: React.FC<ExperimentsListProps> = ({ labId, experiments }) => {
  const [displayExperiments, setDisplayExperiments] = useState<Experiment[]>([])
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [experimentToDelete, setExperimentToDelete] = useState<Experiment | null>(null)
  const { currentRole } = useRoleContext()
  const isAdmin = currentRole === "admin"

  useEffect(() => {
    async function fetchExperiments() {
      if (!labId) return
      const { data, error } = await supabase
        .from("experiments")
        .select("*")
        .eq("lab_id", labId)
        .order("startDate", { ascending: false })
      if (error) {
        setDisplayExperiments([])
        return
      }
      setDisplayExperiments(data || [])
    }
    fetchExperiments()
  }, [labId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  const handleSaveToProfile = () => {
    // In a real app, this would call an API to save the experiment to the user's profile
    if (selectedExperiment) {
      toast({
        title: "Experiment saved",
        description: `${selectedExperiment.name} has been saved to your profile.`,
      })
      setSaveDialogOpen(false)
    }
  }

  const handleDeleteExperiment = () => {
    if (experimentToDelete) {
      // Filter out the experiment to delete
      const updatedExperiments = displayExperiments.filter((exp) => exp.id !== experimentToDelete.id)
      setDisplayExperiments(updatedExperiments)

      // Show success toast
      toast({
        title: "Experiment deleted",
        description: `${experimentToDelete.name} has been deleted successfully.`,
      })
      setDeleteDialogOpen(false)
      setExperimentToDelete(null)
    }
  }

  const openDeleteDialog = (experiment: Experiment) => {
    setExperimentToDelete(experiment)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {displayExperiments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No experiments found for this lab.</p>
        </div>
      ) : (
        displayExperiments.map((experiment) => (
          <Card key={experiment.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Link href={`/experiments/view?id=${experiment.id}`} className="font-medium text-lg text-accent">
                    {experiment.name}
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                      onClick={() => openDeleteDialog(experiment)}
                      title="Delete experiment"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-green-500 hover:bg-green-500/10 hover:text-green-400"
                    onClick={() => {
                      setSelectedExperiment(experiment)
                      setSaveDialogOpen(true)
                    }}
                    title="Save to profile"
                  >
                    <PlusCircle className="h-5 w-5" />
                  </Button>
                  <Badge className={experiment.status === "LIVE" ? "bg-green-600" : "bg-blue-600"}>
                    {experiment.status}
                  </Badge>
                </div>
              </div>

              <p className="text-sm mb-3">{experiment.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <h4 className="text-sm font-medium mb-2">OBJECTIVE</h4>
                  <p className="text-sm text-muted-foreground">{experiment.objective}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">TIMELINE</h4>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Started: {formatDate(experiment.startDate)}</span>
                  </div>
                  {experiment.endDate && (
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span>Concluded: {formatDate(experiment.endDate)}</span>
                    </div>
                  )}
                  {!experiment.endDate && (
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Ongoing</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {experiment.categories.map((category, index) => {
                  const categoryColor = generateColorForCategory(category)
                  return (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs"
                      style={{ backgroundColor: categoryColor, color: "white", borderColor: categoryColor }}
                    >
                      {category.toUpperCase()}
                    </Badge>
                  )
                })}
              </div>

              <div className="mb-3">
                <h4 className="text-sm font-medium mb-2">CONTRIBUTORS</h4>
                <div className="flex -space-x-2">
                  {experiment.contributors.map((contributor) => (
                    <Avatar key={contributor.id} className="h-8 w-8 border-2 border-background">
                      <AvatarImage src={contributor.avatar || "/placeholder.svg"} alt={contributor.name} />
                      <AvatarFallback>{contributor.initials}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>

              {experiment.results && (
                <div>
                  <h4 className="text-sm font-medium mb-2">RESULTS</h4>
                  <p className="text-sm text-muted-foreground">{experiment.results}</p>
                </div>
              )}

              <div className="flex justify-end mt-4">
                <Button className="bg-accent text-primary-foreground hover:bg-accent/90" asChild>
                  <Link href={`/experiments/view?id=${experiment.id}`}>
                    {experiment.status === "LIVE" ? "VIEW EXPERIMENT" : "VIEW RESULTS"}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Save to Profile Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save to Profile</DialogTitle>
            <DialogDescription>Do you want to save this experiment to your profile?</DialogDescription>
          </DialogHeader>
          {selectedExperiment && (
            <div className="flex flex-col gap-3 p-3 bg-secondary/30 rounded-md">
              <div className="flex items-center gap-2">
                <BeakerIcon className="h-5 w-5 text-accent" />
                <h3 className="font-medium">{selectedExperiment.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{selectedExperiment.description}</p>
              <div className="flex flex-wrap gap-2">
                {selectedExperiment.categories.map((category, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {category.toUpperCase()}
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

      {/* Delete Experiment Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Experiment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this experiment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {experimentToDelete && (
            <div className="flex flex-col gap-3 p-3 my-2 bg-secondary/30 rounded-md">
              <div className="flex items-center gap-2">
                <BeakerIcon className="h-5 w-5 text-accent" />
                <h3 className="font-medium">{experimentToDelete.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{experimentToDelete.description}</p>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteExperiment} className="bg-red-500 hover:bg-red-600 text-white">
              Delete Experiment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ExperimentsList
