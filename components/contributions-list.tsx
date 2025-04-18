import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckIcon, XIcon, FileIcon, BookOpenIcon } from "lucide-react"

export default function ContributionsList() {
  return (
    <div className="space-y-4">
      <div className="border border-secondary rounded-lg p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-sm font-medium">Neural network optimization algorithm</h3>
              <p className="text-xs text-muted-foreground">Submitted by James Davis, 3 days ago</p>
            </div>
          </div>
          <Badge className="bg-science-ai">Pending Review</Badge>
        </div>
        <p className="text-sm">
          I've developed an improved optimization algorithm for the neural network model that reduces training time by
          approximately 30% while maintaining accuracy.
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileIcon className="h-3 w-3 text-accent" />
          <span>optimize_nn.py</span>
        </div>
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" className="border-accent text-accent hover:bg-secondary">
            <XIcon className="h-4 w-4 mr-1" />
            Decline
          </Button>
          <Button size="sm" className="bg-accent text-primary-foreground hover:bg-accent/90">
            <CheckIcon className="h-4 w-4 mr-1" />
            Accept
          </Button>
        </div>
      </div>

      <div className="border border-secondary rounded-lg p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
              <AvatarFallback>EW</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-sm font-medium">Updated cognitive test protocol</h3>
              <p className="text-xs text-muted-foreground">Submitted by Emma Wilson, 1 day ago</p>
            </div>
          </div>
          <Badge className="bg-science-psychology">Pending Review</Badge>
        </div>
        <p className="text-sm">
          I've updated the cognitive test protocol to include additional measures for working memory and attention based
          on recent literature.
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <BookOpenIcon className="h-3 w-3 text-accent" />
          <span>cognitive_test_protocol_v2.md</span>
        </div>
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" className="border-accent text-accent hover:bg-secondary">
            <XIcon className="h-4 w-4 mr-1" />
            Decline
          </Button>
          <Button size="sm" className="bg-accent text-primary-foreground hover:bg-accent/90">
            <CheckIcon className="h-4 w-4 mr-1" />
            Accept
          </Button>
        </div>
      </div>

      <div className="border border-secondary rounded-lg p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
              <AvatarFallback>ML</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-sm font-medium">fMRI data preprocessing script</h3>
              <p className="text-xs text-muted-foreground">Submitted by Maria Lopez, 5 days ago</p>
            </div>
          </div>
          <Badge className="bg-accent text-primary-foreground">Accepted</Badge>
        </div>
        <p className="text-sm">
          This script improves the preprocessing pipeline for fMRI data by implementing motion correction and spatial
          normalization.
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileIcon className="h-3 w-3 text-accent" />
          <span>preprocess_fmri.py</span>
        </div>
      </div>
    </div>
  )
}
