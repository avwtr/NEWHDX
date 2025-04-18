import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Beaker, Users, Plus } from "lucide-react"
import Link from "next/link"

export function UserLabsSection() {
  // Mock data - in a real app, this would come from an API
  const foundedLabs = [
    {
      id: "lab-1",
      name: "Genomic Data Analysis Lab",
      description: "Research on novel genomic data analysis techniques",
      members: 8,
      activity: "High",
      lastActive: "2 hours ago",
    },
  ]

  const memberLabs = [
    {
      id: "lab-2",
      name: "Protein Folding Simulation",
      description: "Computational approaches to protein folding prediction",
      members: 12,
      activity: "Medium",
      lastActive: "Yesterday",
    },
    {
      id: "lab-3",
      name: "Neural Network Applications in Biology",
      description: "Applying deep learning to biological problems",
      members: 15,
      activity: "High",
      lastActive: "3 hours ago",
    },
  ]

  const followingLabs = [
    {
      id: "lab-4",
      name: "CRISPR Gene Editing Research",
      description: "Exploring novel applications of CRISPR technology",
      members: 23,
      activity: "Medium",
      lastActive: "2 days ago",
    },
    {
      id: "lab-5",
      name: "Molecular Dynamics Simulation",
      description: "Advanced simulation techniques for molecular interactions",
      members: 9,
      activity: "Low",
      lastActive: "1 week ago",
    },
    {
      id: "lab-6",
      name: "Bioinformatics Tools Development",
      description: "Creating new software tools for bioinformatics research",
      members: 17,
      activity: "High",
      lastActive: "5 hours ago",
    },
  ]

  const renderLabCard = (lab, role) => (
    <Card key={lab.id} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{lab.name}</CardTitle>
            <CardDescription className="mt-1">{lab.description}</CardDescription>
          </div>
          {role === "founded" && <Badge className="bg-primary text-primary-foreground">Founder</Badge>}
          {role === "member" && <Badge variant="secondary">Member</Badge>}
          {role === "following" && <Badge variant="outline">Following</Badge>}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{lab.members} members</span>
          </div>
          <div className="flex items-center">
            <Beaker className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>Activity: {lab.activity}</span>
          </div>
          <div className="text-muted-foreground text-xs">Last active: {lab.lastActive}</div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="ghost" className="ml-auto" size="sm">
          <Link href={`/labs/${lab.id}`}>
            Visit Lab <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )

  return (
    <Tabs defaultValue="founded" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="founded">Founded ({foundedLabs.length})</TabsTrigger>
        <TabsTrigger value="member">Member ({memberLabs.length})</TabsTrigger>
        <TabsTrigger value="following">Following ({followingLabs.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="founded">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-medium">Labs You've Founded</h3>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New Lab
          </Button>
        </div>
        {foundedLabs.map((lab) => renderLabCard(lab, "founded"))}
      </TabsContent>

      <TabsContent value="member">
        <h3 className="text-lg font-medium mb-4">Labs You're a Member Of</h3>
        {memberLabs.map((lab) => renderLabCard(lab, "member"))}
      </TabsContent>

      <TabsContent value="following">
        <h3 className="text-lg font-medium mb-4">Labs You're Following</h3>
        {followingLabs.map((lab) => renderLabCard(lab, "following"))}
      </TabsContent>
    </Tabs>
  )
}
