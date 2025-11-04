import { AppSidebar } from "@/components/Sidebar/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { SessionProvider } from "@/components/providers/session-provider"

const layout = ({children} : {children: React.ReactNode}) => {
  // Enable debug logging in development mode
  const isDev = process.env.NODE_ENV === 'development';
  
  return (
    <SessionProvider debug={isDev}>
      <SidebarProvider>
        <AppSidebar/>
        <SidebarInset>
          <header className="flex h-16 border-b shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
            </div>
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </SessionProvider>
  )
}

export default layout