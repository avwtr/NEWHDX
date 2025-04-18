"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Maximize2, Minimize2, Plus, Calendar, Users, Edit, Trash } from "lucide-react"
import Link from "next/link"
import { CreateFundDialog } from "@/components/create-fund-dialog"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"

interface LabOverviewTabProps {
  isAdmin: boolean
  expandedTab: string | null
  toggleExpand: (tabName: string) => void
  funds: any[]
  experimentsExpanded: boolean
  setExperimentsExpanded: (value: boolean) => void
  setCreateExperimentDialogOpen: (value: boolean) => void
  liveExperimentsData: any[]
}

export function LabOverviewTab({
  isAdmin,
  expandedTab,
  toggleExpand,
  funds,
  experimentsExpanded,
  setExperimentsExpanded,
  setCreateExperimentDialogOpen,
  liveExperimentsData,
}: LabOverviewTabProps) {
  const [bulletins, setBulletins] = useState([
    {
      id: 1,
      text: "Welcome to our lab! We're excited to have you join our research community.",
      date: new Date(2023, 11, 15),
    },
    {
      id: 2,
      text: "New equipment arriving next week. Training sessions will be scheduled soon.",
      date: new Date(2023, 11, 20),
    },
  ])
  const [isAddingBulletin, setIsAddingBulletin] = useState(false)
  const [newBulletinText, setNewBulletinText] = useState("")
  const [editingBulletinId, setEditingBulletinId] = useState<number | null>(null)
  const [editingText, setEditingText] = useState("")

  const handleAddBulletin = () => {
    if (newBulletinText.trim()) {
      const newBulletin = {
        id: Date.now(),
        text: newBulletinText,
        date: new Date(),
      }
      setBulletins([newBulletin, ...bulletins])
      setNewBulletinText("")
      setIsAddingBulletin(false)
    }
  }

  const handleEditBulletin = (id: number) => {
    const bulletin = bulletins.find((b) => b.id === id)
    if (bulletin) {
      setEditingBulletinId(id)
      setEditingText(bulletin.text)
    }
  }

  const handleSaveEdit = (id: number) => {
    if (editingText.trim()) {
      setBulletins(bulletins.map((bulletin) => (bulletin.id === id ? { ...bulletin, text: editingText } : bulletin)))
      setEditingBulletinId(null)
    }
  }

  const handleDeleteBulletin = (id: number) => {
    setBulletins(bulletins.filter((bulletin) => bulletin.id !== id))
  }

  return (
    <>
      {/* Lab Bulletin Board */}
      <Card className="border-accent/20 mb-6">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-xl">LAB BULLETIN</CardTitle>
          <div className="flex items-center gap-2">
            {isAdmin && !isAddingBulletin && (
              <Button
                variant="outline"
                size="sm"
                className="border-accent text-accent hover:bg-secondary"
                onClick={() => setIsAddingBulletin(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                POST UPDATE
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => toggleExpand("bulletin")} className="h-8 w-8">
              {expandedTab === "bulletin" ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isAdmin && isAddingBulletin && (
            <div className="mb-4 space-y-2">
              <Textarea
                placeholder="Type your bulletin update here..."
                value={newBulletinText}
                onChange={(e) => setNewBulletinText(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingBulletin(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddBulletin}>Post Update</Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {bulletins.map((bulletin) => (
              <div key={bulletin.id} className="p-4 bg-secondary/50 border border-secondary rounded-lg">
                {editingBulletinId === bulletin.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingBulletinId(null)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => handleSaveEdit(bulletin.id)}>
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm whitespace-pre-wrap">{bulletin.text}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-muted-foreground">
                        {bulletin.date.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {isAdmin && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleEditBulletin(bulletin.id)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteBulletin(bulletin.id)}
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Experiments Section */}
      <Card className="border-accent/20">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-xl">LIVE EXPERIMENTS</CardTitle>
          <div className="flex items-center gap-2">
            {/* New experiment button only for admins */}
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="border-accent text-accent hover:bg-secondary"
                onClick={() => setCreateExperimentDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                NEW EXPERIMENT
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => toggleExpand("experiments")} className="h-8 w-8">
              {expandedTab === "experiments" ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(experimentsExpanded
              ? [
                  ...liveExperimentsData,
                  {
                    id: 3,
                    name: "Cognitive Function Assessment",
                    description: "Studying cognitive function in adults using novel assessment techniques",
                    categories: ["psychology", "cognitive-science"],
                    contributors: 4,
                    startDate: "2023-11-10",
                    status: "LIVE",
                  },
                  {
                    id: 4,
                    name: "Brain-Computer Interface Testing",
                    description: "Testing new BCI prototypes for accessibility applications",
                    categories: ["neuroscience", "technology"],
                    contributors: 6,
                    startDate: "2023-12-05",
                    status: "LIVE",
                  },
                  {
                    id: 5,
                    name: "Memory Formation Study",
                    description: "Investigating neural mechanisms of memory formation and recall",
                    categories: ["neuroscience", "memory"],
                    contributors: 3,
                    startDate: "2024-01-20",
                    status: "LIVE",
                  },
                ]
              : liveExperimentsData
            ).map((experiment) => (
              <Card key={experiment.id} className="bg-secondary/50 border-secondary">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <Link href="#" className="hover:underline font-medium text-accent text-lg">
                        {experiment.name}
                      </Link>
                      <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                        {experiment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{experiment.description}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {experiment.categories.map((category: string) => (
                        <Badge key={category} variant="secondary" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Started: {experiment.startDate}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {experiment.contributors} contributors
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-accent hover:bg-secondary"
            onClick={() => setExperimentsExpanded(!experimentsExpanded)}
          >
            {experimentsExpanded ? "SHOW LESS" : "VIEW ALL EXPERIMENTS"}
          </Button>
        </CardFooter>
      </Card>

      {/* Enhanced Funding Goals Section */}
      <Card className="border-accent/20">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-xl">FUNDING GOALS</CardTitle>
          <div className="flex items-center gap-2">
            {/* Create fund button only for admins */}
            {isAdmin && <CreateFundDialog />}
            <Button variant="ghost" size="icon" onClick={() => toggleExpand("funding")} className="h-8 w-8">
              {expandedTab === "funding" ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {funds.map((fund) => (
              <Card key={fund.id} className="bg-secondary/50 border-secondary">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-accent">{fund.name}</h3>
                      <span className="text-sm font-medium">
                        ${fund.currentAmount.toLocaleString()} / ${fund.goalAmount.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{fund.description}</p>
                    <div className="mt-2">
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: `${fund.percentFunded}%` }} />
                      </div>
                      <div className="flex justify-between mt-1">
                        <p className="text-xs text-muted-foreground">{fund.percentFunded}% funded</p>
                        <p className="text-xs text-muted-foreground">{fund.daysRemaining} days remaining</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-accent border-accent/20 hover:bg-accent/10"
                      >
                        CONTRIBUTE
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Link href="/funding" className="w-full">
            <Button variant="ghost" size="sm" className="w-full text-accent hover:bg-secondary">
              VIEW ALL FUNDING GOALS
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </>
  )
}
