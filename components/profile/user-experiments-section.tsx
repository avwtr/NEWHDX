import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, FlaskConical, Calendar, Users, FileText, Plus } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UserExperimentsSectionProps {
  userId: string
}

export function UserExperimentsSection({ userId }: UserExperimentsSectionProps) {
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
  const { toast } = useToast()

  useEffect(() => {
    if (!userId) return
    fetchUserExperiments()
  }, [userId])

  const fetchUserExperiments = async () => {
    setLoading(true)
    setError(null)
    try {
      // First get all labs the user is associated with
      const { data: userLabs, error: labsError } = await supabase
        .from('labs')
        .select('labId, labName, profilePic')
        .or(`createdBy.eq.${userId},labMembers.user.eq.${userId},labAdmins.user.eq.${userId}`)

      if (labsError) throw labsError

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

      // Create a map of lab info for easy lookup
      const labMap = userLabs.reduce((acc, lab) => {
        acc[lab.labId] = lab
        return acc
      }, {} as Record<string, any>)

      // Add lab info to each experiment
      const experimentsWithLabInfo = experimentsData?.map(exp => ({
        ...exp,
        labInfo: labMap[exp.lab_id]
      })) || []

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

  const renderExperimentCard = (experiment: any) => {
    const labInfo = experiment.labInfo
    const statusColors = {
      DRAFT: "bg-gray-100 text-gray-800",
      LIVE: "bg-green-100 text-green-800",
      COMPLETED: "bg-blue-100 text-blue-800",
      CANCELLED: "bg-red-100 text-red-800"
    }

    return (
      <Card key={experiment.id} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">{experiment.name}</CardTitle>
              <CardDescription className="mb-3">{experiment.objective}</CardDescription>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(experiment.created_at).toLocaleDateString()}
                </div>
                {labInfo && (
                  <div className="flex items-center gap-2">
                    <Image
                      src={labInfo.profilePic || "/science-lab-setup.png"}
                      alt={labInfo.labName}
                      width={16}
                      height={16}
                      className="rounded"
                    />
                    <span>{labInfo.labName}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                className={statusColors[experiment.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}
              >
                {experiment.status || "DRAFT"}
              </Badge>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/newexperiments/${experiment.id}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
    )
  }

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
        <div className="space-y-4">
          {filteredExperiments.map((experiment) => renderExperimentCard(experiment))}
        </div>
      )}
    </div>
  )
}

