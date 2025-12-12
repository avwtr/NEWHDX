import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FlaskConical, FileText, Plus, Circle, Video, Loader2 } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { researchAreas } from "@/lib/research-areas"

interface UserExperimentsSectionProps {
  userId: string
  isOwnProfile?: boolean
}

export function UserExperimentsSection({ userId, isOwnProfile = false }: UserExperimentsSectionProps) {
  const [experiments, setExperiments] = useState<any[]>([])
  const [labs, setLabs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createExperimentOpen, setCreateExperimentOpen] = useState(false)
  const [selectedLabId, setSelectedLabId] = useState<string>("")
  const [newExperimentName, setNewExperimentName] = useState("")
  const [newExperimentObjective, setNewExperimentObjective] = useState("")
  const [isCreatingExperiment, setIsCreatingExperiment] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("recent")
  const [expandedExperimentIds, setExpandedExperimentIds] = useState<string[]>([])
  const { toast } = useToast()

  // Helper functions for categories
  const getCategoryBadgeColors = (category: string) => {
    const scienceCategoryColors: Record<string, { bg: string; text: string }> = {
      neuroscience: { bg: "bg-[#9D4EDD]", text: "text-white" },
      ai: { bg: "bg-[#3A86FF]", text: "text-white" },
      biology: { bg: "bg-[#38B000]", text: "text-white" },
      chemistry: { bg: "bg-[#FF5400]", text: "text-white" },
      physics: { bg: "bg-[#FFD60A]", text: "text-black" },
      medicine: { bg: "bg-[#FF0054]", text: "text-white" },
      psychology: { bg: "bg-[#FB5607]", text: "text-white" },
      engineering: { bg: "bg-[#4361EE]", text: "text-white" },
      mathematics: { bg: "bg-[#7209B7]", text: "text-white" },
      environmental: { bg: "bg-[#2DC653]", text: "text-white" },
    }
    return scienceCategoryColors[category] || { bg: "bg-[#6C757D]", text: "text-white" }
  }

  const getCategoryLabel = (category: string) => {
    const area = researchAreas.find(a => a.value === category)
    return area?.label || category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')
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
      const response = await fetch(`/api/experiment-engine/video-segment?experimentId=${experimentId}`);
      if (!response.ok) {
        return null;
      }
      const result = await response.json();
      return result.data?.videoUrl || null;
    } catch (error) {
      console.debug('[Thumbnail] Error getting video segment:', error);
      return null;
    }
  };

  const getConcludedVideoUrl = async (experimentId: string): Promise<string | null> => {
    try {
      const response = await fetch(`/api/experiment-engine/concluded-video?experimentId=${experimentId}`);
      if (!response.ok) {
        return null;
      }
      const result = await response.json();
      return result.data?.videoUrl || null;
    } catch (e) {
      console.debug('[Thumbnail] Error getting concluded video:', e);
      return null;
    }
  };

  useEffect(() => {
    if (!userId) return
    fetchUserExperiments()
  }, [userId])

  const fetchUserExperiments = async () => {
    setLoading(true)
    setError(null)
    try {
      let userLabs: any[] = []
      
      if (isOwnProfile) {
        // For own profile: get all labs the user is associated with
        const { data, error: labsError } = await supabase
          .from('labs')
          .select('labId, labName, profilePic, public_private')
          .or(`createdBy.eq.${userId},labMembers.user.eq.${userId},labAdmins.user.eq.${userId}`)

        if (labsError) throw labsError
        userLabs = data || []
      } else {
        // For other users' profiles: only get public labs
        // First get lab memberships to find which labs the user is in
        const { data: memberships } = await supabase
          .from('labMembers')
          .select('lab_id')
          .eq('user', userId)
        
        const { data: founded } = await supabase
          .from('labs')
          .select('labId')
          .eq('createdBy', userId)
        
        const labIds = [
          ...(memberships || []).map((m: any) => m.lab_id),
          ...(founded || []).map((l: any) => l.labId)
        ].filter(Boolean)
        
        if (labIds.length > 0) {
          const { data, error: labsError } = await supabase
            .from('labs')
            .select('labId, labName, profilePic, public_private')
            .in('labId', labIds)
          
          if (labsError) {
            console.error('Error fetching public labs:', labsError)
            userLabs = []
          } else {
            // Filter to only public labs client-side
            userLabs = (data || []).filter((lab: any) => 
              lab.public_private === 'public' || lab.public_private === null
            )
          }
        }
      }

      const labIds = userLabs?.map(lab => lab.labId) || []
      
      if (labIds.length === 0) {
        setLabs([])
        setExperiments([])
        setLoading(false)
        return
      }

      // Get all experiments from these labs
      const { data: experimentsData, error: experimentsError } = await supabase
        .from('experiments')
        .select('*')
        .in('lab_id', labIds)
        .order('created_at', { ascending: false })

      if (experimentsError) throw experimentsError

      // Fetch public Experiment Engine experiments for this user
      let experimentEngineExps: any[] = []
      try {
        const response = await fetch('/api/experiment-engine/public-experiments');
        if (response.ok) {
          const { data: expEngineData } = await response.json();
          // Filter to only experiments created by this user (or all if own profile)
          experimentEngineExps = (expEngineData || [])
            .filter((exp: any) => isOwnProfile || exp.created_by_user_id === userId)
            .map((exp: any) => ({
              ...exp,
              is_experiment_engine: true,
              id: exp.experiment_id,
              name: exp.experiment_name,
              objective: exp.experiment_objective || '',
              lab_id: exp.lab_id,
              created_at: exp.created_at,
              status: exp.experiment_status,
              closed_status: exp.experiment_status === 'concluded' ? 'CLOSED' : null,
              labName: exp.labName,
              labProfilePic: exp.labProfilePic,
            }));
        }
      } catch (err) {
        console.error('Error fetching Experiment Engine experiments:', err);
      }

      // Fetch categories for all experiments
      const allExperimentIds = [
        ...(experimentsData || []).map((e: any) => e.id),
        ...experimentEngineExps.map((e: any) => e.id)
      ]
      
      let categoriesMap: Record<string, string[]> = {}
      if (allExperimentIds.length > 0) {
        const { data: categoriesData } = await supabase
          .from('labCategories')
          .select('lab_id, category')
          .in('lab_id', labIds)
        
        // Get categories for each lab
        const labCategoriesMap: Record<string, string[]> = {}
        if (categoriesData) {
          categoriesData.forEach((cat: any) => {
            if (!labCategoriesMap[cat.lab_id]) {
              labCategoriesMap[cat.lab_id] = []
            }
            labCategoriesMap[cat.lab_id].push(cat.category)
          })
        }
        
        // Assign categories to experiments based on their lab
        experimentsData?.forEach((exp: any) => {
          categoriesMap[exp.id] = labCategoriesMap[exp.lab_id] || []
        })
        experimentEngineExps.forEach((exp: any) => {
          categoriesMap[exp.id] = labCategoriesMap[exp.lab_id] || []
        })
      }

      // Fetch files for experiments
      let filesMap: Record<string, any[]> = {}
      if (allExperimentIds.length > 0) {
        // Filter to only string IDs that don't start with 'exp_' (Experiment Engine IDs)
        const regularExperimentIds = allExperimentIds.filter(id => 
          typeof id === 'string' && !id.startsWith('exp_')
        )
        
        if (regularExperimentIds.length > 0) {
          const { data: filesData } = await supabase
            .from('experiment_files')
            .select('experiment_id, file_name, storageKey')
            .in('experiment_id', regularExperimentIds)
        
          if (filesData) {
            filesData.forEach((file: any) => {
              if (!filesMap[file.experiment_id]) {
                filesMap[file.experiment_id] = []
              }
              filesMap[file.experiment_id].push({
                id: file.experiment_id + '_' + file.file_name,
                name: file.file_name,
                file_path: file.storageKey
              })
            })
          }
        }
      }

      // Create a map of lab info for easy lookup
      const labMap = userLabs.reduce((acc, lab) => {
        acc[lab.labId] = lab
        return acc
      }, {} as Record<string, any>)

      // Add lab info, categories, and files to each experiment
      const experimentsWithLabInfo = [
        ...(experimentsData?.map(exp => ({
          ...exp,
          labInfo: labMap[exp.lab_id],
          labName: labMap[exp.lab_id]?.labName || '',
          labProfilePic: labMap[exp.lab_id]?.profilePic || '/placeholder.svg',
          categories: categoriesMap[exp.id] || [],
          files: filesMap[exp.id] || [],
          lastUpdated: exp.created_at ? `${Math.round((Date.now() - new Date(exp.created_at).getTime()) / (1000*60*60*24))} days ago` : '',
        })) || []),
        ...experimentEngineExps.map(exp => ({
          ...exp,
          labInfo: labMap[exp.lab_id] || { labName: exp.labName, profilePic: exp.labProfilePic },
          categories: categoriesMap[exp.id] || [],
          files: [],
          lastUpdated: exp.created_at ? `${Math.round((Date.now() - new Date(exp.created_at).getTime()) / (1000*60*60*24))} days ago` : '',
        }))
      ]

      setLabs(userLabs || [])
      setExperiments(experimentsWithLabInfo)
    } catch (error) {
      console.error('Error fetching experiments:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch experiments')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateExperiment = async () => {
    if (!selectedLabId || !newExperimentName || !newExperimentObjective) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsCreatingExperiment(true)
    try {
      const { data, error } = await supabase
        .from("experiments")
        .insert([
          {
            name: newExperimentName,
            objective: newExperimentObjective,
            lab_id: selectedLabId,
            created_by: userId,
            status: "DRAFT",
            created_at: new Date().toISOString(),
          }
        ])
        .select()
        .single()

      if (error) throw error

      // Add lab info to the new experiment
      const labInfo = labs.find(lab => lab.labId === selectedLabId)
      const experimentWithLabInfo = {
        ...data,
        labInfo
      }

      setExperiments(prev => [experimentWithLabInfo, ...prev])

      // Reset form
      setNewExperimentName("")
      setNewExperimentObjective("")
      setSelectedLabId("")
      setCreateExperimentOpen(false)

      toast({
        title: "Experiment Created",
        description: "Your experiment has been created successfully.",
      })
    } catch (error) {
      console.error("Error creating experiment:", error)
      toast({
        title: "Error",
        description: "Failed to create experiment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingExperiment(false)
    }
  }

  const getFilteredAndSortedExperiments = () => {
    let filtered = experiments

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(exp => exp.status === filterStatus)
    }

    // Sort
    if (sortBy === "recent") {
      filtered = [...filtered].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    } else if (sortBy === "name") {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === "lab") {
      filtered = [...filtered].sort((a, b) => 
        (a.labInfo?.labName || "").localeCompare(b.labInfo?.labName || "")
      )
    }

    return filtered
  }

  const ExperimentCard = ({ experiment }: { experiment: any }) => {
    const isExperimentEngine = experiment.is_experiment_engine || experiment.experiment_id?.startsWith('exp_');
    const isClosed = experiment.closed_status === "CLOSED" || (isExperimentEngine && experiment.experiment_status === 'concluded');
    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [isLoadingThumbnail, setIsLoadingThumbnail] = useState(false);
    
    useEffect(() => {
      if (!isExperimentEngine || !experiment.experiment_id) return;
      
      const loadThumbnail = async () => {
        const status = experiment.experiment_status || experiment.status;
        if (status === 'experiment_initiated' || status === 'config_complete') {
          setIsLoadingThumbnail(false);
          return;
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
    
    return (
      <Card key={experiment.id} className="overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4">
            <Link 
              href={isExperimentEngine 
                ? `https://www.experimentengine.ai/experiment-summary?experimentId=${experiment.experiment_id}`
                : (isClosed ? `/experiments/${experiment.id}/conclude` : `/newexperiments/${experiment.id}`)
              }
              onClick={handleClick}
              className="block hover:bg-secondary/50 -m-4 p-4"
            >
              {/* Thumbnail for Experiment Engine experiments */}
              {isExperimentEngine && (
                <div className="mb-3 flex items-center justify-center w-full h-32 bg-secondary/50 rounded overflow-hidden">
                  {isLoadingThumbnail ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : thumbnail ? (
                    <img src={thumbnail} alt={experiment.name} className="w-full h-full object-cover" />
                  ) : (
                    <Video className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
              )}
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  {isClosed ? (
                    <><Circle className="h-3 w-3 text-red-500 fill-red-500" /><span className="text-xs text-red-500 font-bold">CONCLUDED</span></>
                  ) : (
                    <><div className="h-2 w-2 rounded-full bg-green-500 animate-[pulse_2s_ease-in-out_infinite]" /><span className="text-xs text-green-500 font-medium">LIVE</span></>
                  )}
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  {isClosed ? (
                    <span>Concluded</span>
                  ) : (
                    <span>Ongoing</span>
                  )}
                </div>
              </div>
              <div className="mb-1">
                <h3 className="font-semibold text-accent text-lg font-fell italic normal-case">{experiment.name}</h3>
                {isExperimentEngine && (
                  <Badge variant="secondary" className="text-xs normal-case mt-1">EXPERIMENT ENGINE</Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {(expandedExperimentIds.includes(experiment.id) ? experiment.categories : experiment.categories.slice(0, 3)).map((category: string) => {
                  const color = getCategoryBadgeColors(category);
                  return (
                    <Badge key={category} variant={category as any} className="mr-2 mb-2 text-xs normal-case">
                      {getCategoryLabel(category)}
                    </Badge>
                  );
                })}
                {experiment.categories.length > 3 && !expandedExperimentIds.includes(experiment.id) && (
                  <button
                    type="button"
                    className="text-xs text-muted-foreground font-bold ml-1 px-2 py-1 rounded hover:bg-accent cursor-pointer"
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      setExpandedExperimentIds(ids => [...ids, experiment.id]);
                    }}
                    title="View all categories"
                  >
                    ...
                  </button>
                )}
              </div>
              {experiment.objective && <p className="text-sm text-muted-foreground mb-2">{experiment.objective}</p>}
            </Link>
            {/* Files */}
            {Array.isArray(experiment.files) && experiment.files.length > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                {experiment.files.map((file: any) => (
                  <a
                    key={file.id}
                    href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/experiment-files/${file.file_path}`}
                    download
                    className="text-xs underline text-accent"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {file.name}
                  </a>
                ))}
              </div>
            )}
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <img src={experiment.labProfilePic || '/placeholder.svg'} alt={experiment.labName} className="h-5 w-5 rounded-full object-cover border" />
                {experiment.labName}
              </span>
              <span>{experiment.lastUpdated}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return <div className="py-8 text-center">Loading experiments...</div>
  }

  if (error) {
    return <div className="py-8 text-center text-red-500">{error}</div>
  }

  const filteredExperiments = getFilteredAndSortedExperiments()

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="LIVE">Live</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="lab">Lab Name</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isOwnProfile && (
          <Dialog open={createExperimentOpen} onOpenChange={setCreateExperimentOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Experiment
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Experiment</DialogTitle>
              <DialogDescription>
                Create a new experiment in one of your labs
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="lab-select">Lab</Label>
                <Select value={selectedLabId} onValueChange={setSelectedLabId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a lab" />
                  </SelectTrigger>
                  <SelectContent>
                    {labs.map((lab) => (
                      <SelectItem key={lab.labId} value={lab.labId}>
                        {lab.labName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="experiment-name">Experiment Name</Label>
                <Input
                  id="experiment-name"
                  value={newExperimentName}
                  onChange={(e) => setNewExperimentName(e.target.value)}
                  placeholder="Enter experiment name"
                />
              </div>
              <div>
                <Label htmlFor="experiment-objective">Objective</Label>
                <Textarea
                  id="experiment-objective"
                  value={newExperimentObjective}
                  onChange={(e) => setNewExperimentObjective(e.target.value)}
                  placeholder="Describe the experiment objective"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCreateExperimentOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateExperiment}
                  disabled={isCreatingExperiment}
                >
                  {isCreatingExperiment ? "Creating..." : "Create Experiment"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        )}
      </div>

      {filteredExperiments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FlaskConical className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No experiments found</h3>
          <p className="mb-4">
            {experiments.length === 0 
              ? "You don't have any experiments yet. Create your first one to get started!"
              : "No experiments match your current filters."
            }
          </p>
          {experiments.length === 0 && (
            <Button onClick={() => setCreateExperimentOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Experiment
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExperiments.map((experiment) => (
            <ExperimentCard key={experiment.id} experiment={experiment} />
          ))}
        </div>
      )}
    </div>
  )
}

