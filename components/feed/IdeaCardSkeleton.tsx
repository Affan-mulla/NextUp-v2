/**
 * Loading skeleton component for Ideas feed
 * Provides smooth shimmer effect for premium UX
 */

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function IdeaCardSkeleton() {
  return (
    <Card className="bg-background py-3 gap-4 border-0 rounded-none">
      {/* Header */}
      <CardHeader className="flex items-center gap-2">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="flex flex-col gap-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-48 md:h-64 w-full rounded-xl" />
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex items-center gap-2">
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-10 w-16 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
      </CardFooter>
    </Card>
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
