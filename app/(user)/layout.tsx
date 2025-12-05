import { AppSidebar } from "@/components/Sidebar/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import { AddCircleHalfDotIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { Suspense } from "react";
import { IdeaFeedSkeleton } from "@/components/feed/IdeaCardSkeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UnifiedSearchBar } from "@/components/search/UnifiedSearchBar";
import { Button } from "@/components/ui/button";

const layout = async ({ children }: { children: React.ReactNode }) => {
  "use cache";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 border-b shrink-0 items-center gap-2 justify-between transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 ">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </div>
          <div className="flex-1 max-w-xl w-full">
            <UnifiedSearchBar />
          </div>

          <div className="mr-4">
            <Link
              href="/idea"
              className="
           "
            >
              <Button
                className="
                relative overflow-hidden
                flex items-center gap-2
                px-6 py-3 rounded-lg
                text-primary-foreground

                bg-gradient-to-b
                from-primary
                to-primary/70

                border border-white/10
                shadow-[0_6px_18px_-6px_rgba(0,0,0,0.45)]
                backdrop-blur-sm

                transition-all duration-300
                hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.6)]
                active:scale-[0.98]
  "
              >
                {/* Icon */}
                <HugeiconsIcon icon={AddCircleHalfDotIcon} className="size-5" />

                {/* Text */}
                <span className="font-medium tracking-tight">Create</span>

                {/* Top glossy highlight */}
                <span
                  className="
                  absolute inset-0
                  pointer-events-none
                  bg-gradient-to-b
                  from-white/10 to-transparent
                  opacity-20
                  rounded-lg
    "
                />
              </Button>
            </Link>
          </div>
        </header>
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <Suspense fallback={<IdeaFeedSkeleton />}>{children}</Suspense>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default layout;
