import { Skeleton } from "@/components/ui/skeleton"

export default function CreateOrganizationLoading() {
  return (
    <div className="container max-w-2xl py-10">
      <div className="mb-8 text-center">
        <Skeleton className="h-10 w-64 mx-auto mb-2" />
        <Skeleton className="h-6 w-96 mx-auto" />
      </div>

      <div className="space-y-6">
        <div className="flex flex-col items-center mb-6">
          <Skeleton className="w-32 h-32 rounded-full mb-4" />
          <Skeleton className="h-10 w-40" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-32 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-5 w-60" />
          <Skeleton className="h-20 w-full" />
        </div>

        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}
