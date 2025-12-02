"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, PlusCircle, Trash2, Clock, FlaskConical, Calendar, Circle, ExternalLink, Video, Loader2 } from "lucide-react"
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
  id: number | string
  experiment_id?: string
  name: string
  experiment_name?: string
  description: string
  objective: string
  experiment_objective?: string
  status: "LIVE" | "CONCLUDED"
  experiment_status?: string
  closed_status?: "CLOSED" | null
  startDate: string
  endDate?: string
  categories?: string[]
  contributors: Contributor[]
  files: ExperimentFile[]
  results?: string
  created_at: string
  updated_at?: string
  is_experiment_engine?: boolean
  feed_type?: string
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

// Thumbnail generation functions for Experiment Engine
const generateVideoThumbnail = async (videoUrl: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    
    const timeout = setTimeout(() => {
      resolve(null);
    }, 10000);
    
    video.onloadedmetadata = () => {
      const seekTime = Math.min(1, video.duration * 0.1);
      video.currentTime = seekTime;
    };
    
    video.onseeked = () => {
      clearTimeout(timeout);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(null);
        return;
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
      resolve(thumbnail);
    };
    
    video.onerror = () => {
      clearTimeout(timeout);
      resolve(null);
    };
    
    video.src = videoUrl;
  });
};

const getFirstVideoSegment = async (experimentId: string): Promise<string | null> => {
  try {
    // Use API route to bypass RLS and authentication issues
    const response = await fetch(`/api/experiment-engine/video-segment?experimentId=${experimentId}`);
    if (!response.ok) {
      return null;
    }
    const { data } = await response.json();
    return data?.videoUrl || null;
  } catch (error) {
    console.error('[Thumbnail] Error getting video segment:', error);
    return null;
  }
};

const getConcludedVideoUrl = async (experimentId: string): Promise<string | null> => {
  try {
    // Use API route to bypass RLS
    const response = await fetch(`/api/experiment-engine/concluded-video?experimentId=${experimentId}`);
    if (!response.ok) {
      return null;
    }
    const { data } = await response.json();
    return data?.videoUrl || null;
  } catch (e) {
    console.error('[Thumbnail] Error getting concluded video:', e);
    return null;
  }
};

// Add new ExperimentCard component
export const ExperimentCard: React.FC<{ experiment: any }> = ({ experiment }) => {
  const runningTime = useRunningTime(experiment.created_at)
  const isClosed = experiment.closed_status === "CLOSED";
  const isExperimentEngine = experiment.is_experiment_engine || experiment.experiment_id?.startsWith('exp_');
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isLoadingThumbnail, setIsLoadingThumbnail] = useState(false);
  
  // Determine status for Experiment Engine experiments
  const getExperimentEngineStatus = () => {
    if (!isExperimentEngine) return null;
    const status = experiment.experiment_status || experiment.status;
    if (status === 'concluded') return 'CONCLUDED';
    if (status === 'in_progress') return 'LIVE';
    if (status === 'config_complete') return 'READY';
    if (status === 'experiment_initiated') return 'INITIATED';
    return 'UNKNOWN';
  };
  
  const experimentEngineStatus = getExperimentEngineStatus();
  const isExperimentEngineClosed = isExperimentEngine && experimentEngineStatus === 'CONCLUDED';
  
  // Load thumbnail for Experiment Engine experiments (optional - fails gracefully)
  useEffect(() => {
    if (!isExperimentEngine || !experiment.experiment_id) return;
    
    const loadThumbnail = async () => {
      const status = experiment.experiment_status || experiment.status;
      if (status === 'experiment_initiated' || status === 'config_complete') {
        return; // No video content yet
      }
      
      setIsLoadingThumbnail(true);
      try {
        const videoUrl = status === 'concluded'
          ? await getConcludedVideoUrl(experiment.experiment_id)
          : await getFirstVideoSegment(experiment.experiment_id);
        
        if (videoUrl) {
          const thumb = await generateVideoThumbnail(videoUrl);
          if (thumb) {
            setThumbnail(thumb);
          }
        }
      } catch (error) {
        // Silently fail - thumbnails are optional
        console.debug('[Thumbnail] Could not load thumbnail:', error);
      } finally {
        setIsLoadingThumbnail(false);
      }
    };
    
    loadThumbnail();
  }, [isExperimentEngine, experiment.experiment_id, experiment.experiment_status]);
  
  const handleClick = (e: React.MouseEvent) => {
    if (isExperimentEngine) {
      e.preventDefault();
      window.open(`https://www.experimentengine.ai/experiment-summary?experimentId=${experiment.experiment_id}`, '_blank');
    }
  };
  
  const cardContent = (
    <Card className="overflow-hidden relative hover:bg-secondary/50 transition-all duration-200 cursor-pointer border-border/50 hover:border-border">
      <div className="flex gap-4 p-4">
        {/* Small thumbnail for Experiment Engine experiments */}
        {isExperimentEngine && (
          <div className="relative w-24 h-16 flex-shrink-0 bg-secondary/30 rounded overflow-hidden border border-border">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt="Experiment thumbnail"
                className="w-full h-full object-cover"
              />
            ) : isLoadingThumbnail ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Video className="h-5 w-5 text-muted-foreground/50" />
              </div>
            )}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          {/* Status badge - top right */}
          <div className="absolute top-3 right-3 z-10">
            {isExperimentEngineClosed || isClosed ? (
              <div className="flex items-center gap-1.5 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md border border-red-500/30">
                <Circle className="h-2.5 w-2.5 text-red-500 fill-red-500" />
                <span className="text-xs text-red-500 font-semibold">CONCLUDED</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md border border-green-500/30">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-[pulse_2s_ease-in-out_infinite]" />
                <span className="text-xs text-green-500 font-semibold">
                  {isExperimentEngine ? experimentEngineStatus : "LIVE"}
                </span>
              </div>
            )}
          </div>
          
          <div className="space-y-2 pr-16">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-accent font-semibold text-lg font-fell italic truncate">
                  {experiment.name || experiment.experiment_name}
                </h3>
                {/* Experiment Engine badge - below title */}
                {isExperimentEngine && (
                  <div className="mt-1.5">
                    <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 text-[10px] px-2 py-0.5 font-medium">
                      EXPERIMENT ENGINE
                    </Badge>
                  </div>
                )}
              </div>
              {isExperimentEngine && (
                <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
              )}
            </div>
            
            {/* Categories - only for non-Experiment Engine experiments */}
            {!isExperimentEngine && experiment.categories && experiment.categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {experiment.categories.map((category: string) => (
                  <Badge key={category} variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-sm text-foreground/80 line-clamp-2 mb-3">
              {experiment.objective || experiment.experiment_objective || 'No description available'}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {isExperimentEngineClosed || isClosed ? (
                    <>Closed {getElapsedString(experiment.updated_at || experiment.end_date)}</>
                  ) : (
                    <>Running for {runningTime}</>
                  )}
                </span>
              </div>
              
              {isExperimentEngineClosed || isClosed ? (
                <div className="flex items-center gap-2">
                  {experiment.conclusion_tag && (
                    <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 text-[10px]">
                      {experiment.conclusion_tag.replace(/-/g, ' ').toUpperCase()}
                    </Badge>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
  
  if (isExperimentEngine) {
    return (
      <div onClick={handleClick} className="block">
        {cardContent}
      </div>
    );
  }
  
  return (
    <Link
      href={isClosed ? `/experiments/${experiment.id}/conclude` : `/newexperiments/${experiment.id}`}
      className="block"
    >
      {cardContent}
    </Link>
  );
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
    async function fetchAllExperiments() {
      if (!labId) return;
      
      // Fetch regular experiments
      const { data: regularExps, error: regularError } = await supabase
        .from("experiments")
        .select("*")
        .eq("lab_id", labId)
        .order("created_at", { ascending: false });
      
      if (regularError) {
        console.error("Error fetching regular experiments:", regularError);
      }
      
      const regularExperiments = (regularExps || []).map((exp: any) => ({
        ...exp,
        is_experiment_engine: false
      }));
      
      // Fetch Experiment Engine experiments via API route (bypasses RLS)
      let experimentEngineExps: any[] = [];
      try {
        const response = await fetch(`/api/experiment-engine/experiments-with-config?labId=${labId}`)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error("Error fetching Experiment Engine experiments:", errorData)
        } else {
          const { data: experiments } = await response.json()
          console.log(`[ExperimentsList] Found ${experiments?.length || 0} Experiment Engine experiments for lab ${labId}`)
          experimentEngineExps = experiments || []
        }
      } catch (err) {
        console.error("Error fetching Experiment Engine experiments:", err);
      }
      
      // Merge and sort: live first, then by creation date
      const allExperiments = [...regularExperiments, ...experimentEngineExps].sort((a, b) => {
        const aClosed = a.closed_status === "CLOSED" || (a.is_experiment_engine && a.experiment_status === 'concluded');
        const bClosed = b.closed_status === "CLOSED" || (b.is_experiment_engine && b.experiment_status === 'concluded');
        
        // If a is live and b is not, a comes first
        if (!aClosed && bClosed) return -1;
        // If b is live and a is not, b comes first
        if (aClosed && !bClosed) return 1;
        // If both are live or both are closed, sort by creation date
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      setDisplayExperiments(allExperiments);
    }
    
    if (experiments) {
      // If experiments prop is provided, use it but mark Experiment Engine ones
      const sortedExperiments = [...experiments].map(exp => ({
        ...exp,
        is_experiment_engine: exp.experiment_id?.startsWith('exp_') || false
      })).sort((a, b) => {
        const aClosed = a.closed_status === "CLOSED" || (a.is_experiment_engine && a.experiment_status === 'concluded');
        const bClosed = b.closed_status === "CLOSED" || (b.is_experiment_engine && b.experiment_status === 'concluded');
        
        if (!aClosed && bClosed) return -1;
        if (aClosed && !bClosed) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setDisplayExperiments(sortedExperiments);
      return;
    }
    
    // Only fetch if experiments prop is not provided
    fetchAllExperiments();
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
        <div className="grid gap-6">
          {displayExperiments.map((experiment) => (
            <ExperimentCard key={experiment.id || experiment.experiment_id} experiment={experiment} />
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
              {selectedExperiment.categories && selectedExperiment.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedExperiment.categories.map((category, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {category.toUpperCase()}
                    </Badge>
                  ))}
                </div>
              )}
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
