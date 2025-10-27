"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, PlusCircle, Trash2, Clock, FlaskConical, Calendar, Circle } from "lucide-react"
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
import { differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns"

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
  closed_status?: "CLOSED" | null
  startDate: string
  endDate?: string
  categories: string[]
  contributors: Contributor[]
  files: ExperimentFile[]
  results?: string
  created_at: string
}

interface ExperimentsListProps {
  labId: string
  experiments?: Experiment[]
}

// Add this CSS animation at the top of the file, after the imports
const pulseAnimation = `
@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
}
`

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

// Add this custom hook after the imports
const useRunningTime = (startDate: string) => {
  const [runningTime, setRunningTime] = useState("")

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(startDate)
      const now = new Date()
      const diff = now.getTime() - start.getTime()

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      const milliseconds = Math.floor(diff % 1000)

      if (days > 0) {
        setRunningTime(`${days}d ${hours}h ${minutes}m`)
      } else if (hours > 0) {
        setRunningTime(`${hours}h ${minutes}m ${seconds}s`)
      } else if (minutes > 0) {
        setRunningTime(`${minutes}m ${seconds}s`)
      } else if (seconds > 0) {
        setRunningTime(`${seconds}s ${milliseconds}ms`)
      } else {
        setRunningTime(`${milliseconds}ms`)
      }
    }

    calculateTime()
    // Update every 100ms for smooth millisecond updates
    const interval = setInterval(calculateTime, 100)

    return () => clearInterval(interval)
  }, [startDate])

  return runningTime
}

function getElapsedString(date: string | Date) {
  if (!date) return "-";
  const now = new Date();
  const end = typeof date === 'string' ? new Date(date) : date;
  let years = differenceInYears(now, end);
  let months = differenceInMonths(now, end) % 12;
  let days = differenceInDays(now, end) % 30;
  let hours = differenceInHours(now, end) % 24;
  let minutes = differenceInMinutes(now, end) % 60;
  let parts = [];
  if (years) parts.push(`${years}y`);
  if (months) parts.push(`${months}mo`);
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (parts.length === 0) parts.push("just now");
  return parts.join(" ") + " ago";
}

// Add new ExperimentCard component
export const ExperimentCard: React.FC<{ experiment: any }> = ({ experiment }) => {
  const runningTime = useRunningTime(experiment.created_at)
  const isClosed = experiment.closed_status === "CLOSED";
  return (
    <Link
      href={isClosed ? `/experiments/${experiment.id}/conclude` : `/newexperiments/${experiment.id}`}
      className="block"
    >
      <Card className="overflow-hidden relative hover:bg-secondary/50 transition-colors cursor-pointer">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {isClosed ? (
            <div className="flex items-center gap-1.5">
              <Circle className="h-3 w-3 text-red-500 fill-red-500" />
              <span className="text-xs text-red-500 font-bold">CONCLUDED</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-[pulse_2s_ease-in-out_infinite]" />
              <span className="text-xs text-green-500 font-medium">LIVE</span>
            </div>
          )}
        </div>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <h3 className="text-accent font-semibold text-lg hover:underline font-fell italic">
              {experiment.name}
            </h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {experiment.categories?.map((category: string) => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
          <div className="text-xs text-muted-foreground text-right">
            {isClosed ? (
              <span>Concluded {getElapsedString(experiment.end_date)}</span>
            ) : experiment.endDate ? (
              <span>Ends: {experiment.endDate}</span>
            ) : (
              <span>Ongoing</span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-2">{experiment.objective}</p>
          <div className="flex justify-between items-end">
            {isClosed ? (
              <>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-red-100 text-red-600 border-red-200">
                    {experiment.conclusion_tag ? experiment.conclusion_tag.replace(/-/g, ' ').toUpperCase() : "CONCLUDED"}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Closed</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Running for {runningTime}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export const ExperimentsList: React.FC<ExperimentsListProps> = ({ labId, experiments }) => {
  const [displayExperiments, setDisplayExperiments] = useState<any[]>(experiments || [])
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [experimentToDelete, setExperimentToDelete] = useState<Experiment | null>(null)
  const { currentRole } = useRoleContext()
  const isAdmin = currentRole === "admin"

  useEffect(() => {
    if (experiments) {
      // Sort experiments: live first, then by creation date
      const sortedExperiments = [...experiments].sort((a, b) => {
        // If a is live and b is not, a comes first
        if (a.closed_status !== "CLOSED" && b.closed_status === "CLOSED") return -1;
        // If b is live and a is not, b comes first
        if (b.closed_status !== "CLOSED" && a.closed_status === "CLOSED") return 1;
        // If both are live or both are closed, sort by creation date
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setDisplayExperiments(sortedExperiments);
      return;
    }
    // Only fetch if experiments prop is not provided
    if (!labId) return;
    const fetchExperiments = async () => {
      const { data, error } = await supabase
        .from("experiments")
        .select("*")
        .eq("lab_id", labId)
        .order("created_at", { ascending: false });
      if (error) {
        setDisplayExperiments([]);
        return;
      }
      // Sort fetched experiments: live first, then by creation date
      const sortedExperiments = (data || []).sort((a, b) => {
        if (a.closed_status !== "CLOSED" && b.closed_status === "CLOSED") return -1;
        if (b.closed_status !== "CLOSED" && a.closed_status === "CLOSED") return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setDisplayExperiments(sortedExperiments);
    };
    fetchExperiments();
  }, [labId, experiments]);

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
      <style>{pulseAnimation}</style>
      {displayExperiments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No experiments found for this lab.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {displayExperiments.map((experiment) => (
            <ExperimentCard key={experiment.id} experiment={experiment} />
          ))}
        </div>
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
                <FlaskConical className="h-5 w-5 text-accent" />
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
                <FlaskConical className="h-5 w-5 text-accent" />
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
