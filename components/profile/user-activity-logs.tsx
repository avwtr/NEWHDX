import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Beaker, FileText, Database, MessageSquare, GitBranch, Calendar, Filter } from "lucide-react"
import Link from "next/link"

export function UserActivityLogs() {
  // Mock activity data - in a real app, this would come from an API
  const activities = [
    {
      id: "act-1",
      type: "file_upload",
      lab: { id: "lab-1", name: "Genomic Data Analysis Lab" },
      description: "Uploaded dataset 'Human Genome Sequence v2.3'",
      timestamp: "2 hours ago",
      icon: <Database className="h-4 w-4" />,
    },
    {
      id: "act-2",
      type: "documentation",
      lab: { id: "lab-1", name: "Genomic Data Analysis Lab" },
      description: "Updated documentation on sequence alignment methodology",
      timestamp: "Yesterday",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      id: "act-3",
      type: "comment",
      lab: { id: "lab-2", name: "Protein Folding Simulation" },
      description: "Commented on 'AlphaFold Implementation Results'",
      timestamp: "2 days ago",
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      id: "act-4",
      type: "fork",
      lab: { id: "lab-3", name: "Neural Network Applications in Biology" },
      description: "Forked experiment 'CNN for Protein Classification'",
      timestamp: "3 days ago",
      icon: <GitBranch className="h-4 w-4" />,
    },
    {
      id: "act-5",
      type: "file_upload",
      lab: { id: "lab-2", name: "Protein Folding Simulation" },
      description: "Uploaded dataset 'Protein Structure Benchmark'",
      timestamp: "4 days ago",
      icon: <Database className="h-4 w-4" />,
    },
    {
      id: "act-6",
      type: "documentation",
      lab: { id: "lab-3", name: "Neural Network Applications in Biology" },
      description: "Created documentation for data preprocessing pipeline",
      timestamp: "1 week ago",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      id: "act-7",
      type: "experiment",
      lab: { id: "lab-1", name: "Genomic Data Analysis Lab" },
      description: "Started new experiment 'Comparative Genomics Analysis'",
      timestamp: "1 week ago",
      icon: <Beaker className="h-4 w-4" />,
    },
    {
      id: "act-8",
      type: "comment",
      lab: { id: "lab-3", name: "Neural Network Applications in Biology" },
      description: "Commented on 'Transfer Learning Results Discussion'",
      timestamp: "2 weeks ago",
      icon: <MessageSquare className="h-4 w-4" />,
    },
  ]

  const getActivityTypeColor = (type) => {
    const types = {
      file_upload: "bg-blue-100 text-blue-800",
      documentation: "bg-purple-100 text-purple-800",
      comment: "bg-green-100 text-green-800",
      fork: "bg-amber-100 text-amber-800",
      experiment: "bg-red-100 text-red-800",
    }
    return types[type] || "bg-gray-100 text-gray-800"
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Recent Activity</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Date Range
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Activity Timeline</CardTitle>
          <CardDescription>Your recent contributions and interactions across all labs</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="relative pl-6 border-l">
              {activities.map((activity, index) => (
                <div key={activity.id} className="mb-6 relative">
                  {/* Timeline dot */}
                  <div className="absolute w-3 h-3 bg-primary rounded-full -left-[25px] top-1.5 border-4 border-background"></div>

                  <div className="flex flex-col">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`p-1.5 rounded-full ${getActivityTypeColor(activity.type)}`}>
                          {activity.icon}
                        </span>
                        <Link href={`/labs/${activity.lab.id}`} className="font-medium hover:underline">
                          {activity.lab.name}
                        </Link>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                    </div>

                    <p className="mt-1 ml-8">{activity.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
