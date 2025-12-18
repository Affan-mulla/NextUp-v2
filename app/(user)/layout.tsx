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
            <Link href="/idea">
              <Button className="" variant={"default"}>
                {/* Icon */}
                <HugeiconsIcon
                  icon={AddCircleHalfDotIcon}
                  className="size-5"
                  strokeWidth={2}
                />
                {/* Text */}
                <span className="font-medium sm:block hidden">Create</span>
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
