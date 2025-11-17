/**
 * Loading skeleton component for Ideas feed
 * Provides smooth shimmer effect for premium UX
 */

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function IdeaCardSkeleton() {
  return (
    <div className="p-2">
      <Card className="bg-background border-border shadow-md rounded-2xl">
        {/* Header */}
        <CardHeader className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="flex flex-col gap-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-48 md:h-64 w-full rounded-xl" />
        </CardContent>

        {/* Footer */}
        <CardFooter className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-9 w-9" />
          </div>
          <Skeleton className="h-9 w-20 rounded-md" />
        </CardFooter>
      </Card>
    </div>
  );
}

export function IdeaFeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <IdeaCardSkeleton key={i} />
      ))}
    </>
  );
}
