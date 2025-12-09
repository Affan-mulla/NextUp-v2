import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="flex container justify-center relative">
      <div className="container px-4 py-8 max-w-4xl mx-4">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar */}
          <Skeleton className="h-24 w-24 rounded-full ring-2 ring-border" />

          {/* Main info */}
          <div className="flex flex-col flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-5 w-32 mb-4" />
                
                {/* Join Date */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>

              {/* Action Button */}
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>

        {/* Stats (mobile only) */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 lg:hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="flex justify-center items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-12" />
              </div>
              <Skeleton className="h-4 w-16 mx-auto mt-1" />
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="py-3">
              <div className="p-3 rounded-md">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-4 w-48 mt-2" />
                <div className="mt-2 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 mt-1">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Profile Card Skeleton (desktop sidebar) */}
      <div className="hidden lg:block sticky top-20 h-fit w-80 mt-8">
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    </div>
  );
}
