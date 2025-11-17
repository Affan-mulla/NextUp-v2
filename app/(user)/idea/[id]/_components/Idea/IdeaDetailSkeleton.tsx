import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { MoreHorizontalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import BackButton from "@/components/Shared/BackButton";

export function IdeaDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          {/* Left side: back + user/product */}
          <div className="flex items-center gap-3">
            <BackButton />

            {/* User Detail Skeleton */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </div>

          {/* Right side: voting and options */}
          <div className="flex items-center gap-2">
            {/* Votes skeleton */}
            <Skeleton className="h-10 w-20 rounded-full" />
            
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-muted transition-colors"
              aria-label="More options"
              disabled
            >
              <HugeiconsIcon icon={MoreHorizontalIcon} />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <main className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
          {/* Title Skeleton */}
          <div className="mb-6 space-y-3">
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-9 w-1/2" />
          </div>

          {/* Description Skeleton */}
          <div className="w-full space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <div className="pt-4">
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </main>
      </div>
    </div>
  );
}
