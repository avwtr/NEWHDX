import { BookOpenIcon, FileIcon, UsersIcon, GitForkIcon } from "lucide-react"

export default function LabStats() {
  return (
    <div className="grid grid-cols-2 gap-2 pt-2">
      <div className="flex flex-col items-center p-2 bg-secondary rounded-md">
        <div className="flex items-center">
          <FileIcon className="h-4 w-4 mr-1 text-accent" />
          <span className="text-sm font-medium">Files</span>
        </div>
        <span className="text-lg font-bold">124</span>
      </div>

      <div className="flex flex-col items-center p-2 bg-secondary rounded-md">
        <div className="flex items-center">
          <BookOpenIcon className="h-4 w-4 mr-1 text-accent" />
          <span className="text-sm font-medium">Docs</span>
        </div>
        <span className="text-lg font-bold">36</span>
      </div>

      <div className="flex flex-col items-center p-2 bg-secondary rounded-md">
        <div className="flex items-center">
          <UsersIcon className="h-4 w-4 mr-1 text-accent" />
          <span className="text-sm font-medium">Members</span>
        </div>
        <span className="text-lg font-bold">18</span>
      </div>

      <div className="flex flex-col items-center p-2 bg-secondary rounded-md">
        <div className="flex items-center">
          <GitForkIcon className="h-4 w-4 mr-1 text-accent" />
          <span className="text-sm font-medium">Forks</span>
        </div>
        <span className="text-lg font-bold">7</span>
      </div>
    </div>
  )
}
