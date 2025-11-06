import { AppSidebar } from "@/components/Sidebar/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SessionProvider } from "@/components/providers/session-provider";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AddCircleHalfDotIcon,
  AddSquareIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

const layout = async({ children }: { children: React.ReactNode }) => {
  "use cache";
  // Enable debug logging in development mode
  const isDev = process.env.NODE_ENV === "development";

  return (
    <SessionProvider debug={isDev}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 border-b shrink-0 items-center gap-2 justify-between transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
            </div>
            <div className="mr-4">
              <Link
                href="/idea"
                className="relative flex items-center gap-2 rounded-lg border border-border
             bg-gradient-to-br from-primary/10 via-primary/5 to-transparent
             backdrop-blur-md md:px-5 md:py-2 p-2 text-sm font-medium text-foreground
             transition-all duration-300 overflow-hidden group
             shadow-sm 
             shadow-foreground/10 dark:shadow-primary/20  hover:shadow-foreground/20 dark:hover:shadow-primary/20
           "
              >
                <HugeiconsIcon
                  icon={AddCircleHalfDotIcon}
                  size={20}
                  className="text-primary transition-transform duration-600 ease-in-out group-hover:rotate-360 z-10"
                />
                <p className="hidden md:block">Create</p>
              </Link>
            </div>
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </SessionProvider>
  );
};

export default layout;
