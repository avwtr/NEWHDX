import { Skeleton } from "@/components/ui/skeleton"

export default function OrganizationProfileLoading() {
  return (
    <div className="container max-w-3xl py-10 flex flex-col items-center">
      <Skeleton className="w-40 h-40 rounded-full mb-6" />
      <Skeleton className="h-10 w-64 mb-2" />

      <div className="flex justify-center gap-2 mb-6">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
      </div>

      <Skeleton className="w-full h-40 mb-8 rounded-lg" />

      <Skeleton className="h-8 w-40 mb-4" />

      <div className="w-full space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="w-full h-20 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
