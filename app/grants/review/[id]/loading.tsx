import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function GrantReviewLoading() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-10 w-2/3 mb-4" />

        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-40" />
        </div>

        <div className="flex gap-2 mb-4">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-64" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  )
}
