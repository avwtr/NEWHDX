import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function GrantViewLoading() {
  return (
    <div className="container max-w-4xl py-8 px-4">
      <Skeleton className="h-10 w-32 mb-6" />

      <Card className="mb-8">
        <CardHeader className="bg-muted/50 pb-4">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-36" />
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Skeleton className="h-4 w-full mb-3" />
          <Skeleton className="h-4 w-5/6 mb-3" />
          <Skeleton className="h-4 w-4/6 mb-6" />

          <Skeleton className="h-4 w-full mb-3" />
          <Skeleton className="h-4 w-5/6 mb-3" />
          <Skeleton className="h-4 w-4/6 mb-3" />
        </CardContent>
      </Card>

      <Skeleton className="h-7 w-48 mb-2" />
      <Skeleton className="h-5 w-72 mb-6" />

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto py-2 px-1">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="flex-shrink-0 h-10 w-10 rounded-full" />
        ))}
      </div>

      <Card className="mb-6">
        <CardHeader className="bg-muted/50">
          <Skeleton className="h-6 w-5/6 mb-2" />
          <Skeleton className="h-4 w-3/6" />
        </CardHeader>
        <CardContent className="pt-6">
          <Skeleton className="h-[150px] w-full mb-4" />
        </CardContent>
        <div className="px-6 py-4 border-t flex justify-between">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Skeleton className="h-5 w-5 flex-shrink-0" />
            <div className="w-full">
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6 mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
