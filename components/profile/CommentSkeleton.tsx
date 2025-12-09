import { Skeleton } from "@/components/ui/skeleton";

export function CommentSkeleton() {
  return (
    <div className="py-3">
      {/* Click wrapper */}
      <div className="p-3 rounded-md">
        {/* Top Row: Avatar + user info */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />

          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>

        {/* Post name */}
        <Skeleton className="h-4 w-48 mt-2" />

        {/* Content */}
        <div className="mt-2 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-2 px-3 mt-1">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
  );
}
