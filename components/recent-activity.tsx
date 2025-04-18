import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileIcon, BookOpenIcon, MessageSquareIcon } from "lucide-react"

export default function RecentActivity() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
              <AvatarFallback>AK</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium">Alex Kim</span> uploaded a new dataset
              </p>
              <div className="flex items-center text-xs text-muted-foreground">
                <FileIcon className="h-3 w-3 mr-1 text-accent" />
                <span>cognitive_test_results.csv</span>
              </div>
              <p className="text-xs text-muted-foreground">3 days ago</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
              <AvatarFallback>SJ</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium">Dr. Sarah Johnson</span> updated documentation
              </p>
              <div className="flex items-center text-xs text-muted-foreground">
                <BookOpenIcon className="h-3 w-3 mr-1 text-accent" />
                <span>fMRI Data Collection Protocol</span>
              </div>
              <p className="text-xs text-muted-foreground">2 days ago</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
              <AvatarFallback>ML</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium">Maria Lopez</span> commented on a contribution
              </p>
              <div className="flex items-center text-xs text-muted-foreground">
                <MessageSquareIcon className="h-3 w-3 mr-1 text-accent" />
                <span>Neural network optimization algorithm</span>
              </div>
              <p className="text-xs text-muted-foreground">1 day ago</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
              <AvatarFallback>SJ</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium">Dr. Sarah Johnson</span> uploaded a new file
              </p>
              <div className="flex items-center text-xs text-muted-foreground">
                <FileIcon className="h-3 w-3 mr-1 text-accent" />
                <span>fMRI_analysis_pipeline.py</span>
              </div>
              <p className="text-xs text-muted-foreground">1 day ago</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
