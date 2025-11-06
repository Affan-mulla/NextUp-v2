"use client"

import {
  BadgeCheck,
  ChevronsUpDown,
  CreditCard,
  Sparkles,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { LogoutSquare01Icon, Notification01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { authClient } from "@/lib/auth/auth-client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { useUser, useUserActions, useIsHydrated } from "@/lib/store/user-store"
import { Skeleton } from "@/components/ui/skeleton"

export function NavUser() {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  
  // Get user from Zustand store
  const user = useUser()
  const { clearUser } = useUserActions()
  const isHydrated = useIsHydrated()
  
  // Show loading skeleton while hydrating
  if (!isHydrated) {
    return (
      <SidebarMenu className="bg-accent rounded-md dark:border-x-0 dark:border-b-0 border-2 border-border box-border dark:shadow">
        <SidebarMenuItem>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }
  
  // Show nothing if no user after hydration
  if (!user) {
    return null
  }

  return (
    <SidebarMenu className="bg-accent rounded-md dark:border-x-0 dark:border-b-0 border-2 border-border   box-border dark:shadow ">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
            <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
               <HugeiconsIcon icon={Notification01Icon} />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                setIsLoggingOut(true)
                try {
                  const res = await authClient.signOut()
                  // authClient.signOut may return { error }
                  if (res && (res as any).error) {
                    toast.error(`Logout failed: ${(res as any).error.message || 'Unknown error'}`)
                  } else {
                    // Clear user from Zustand store
                    clearUser()
                    toast.success('Logged out')
                    // redirect to sign-in page
                    router.push('/auth/sign-in')
                  }
                } catch (err) {
                  console.error(err)
                  toast.error('Logout failed')
                } finally {
                  setIsLoggingOut(false)
                }
              }}
            >
              {isLoggingOut ? (
                <span className="flex items-center gap-2">
                  <Spinner />
                  Signing out...
                </span>
              ) : (
                <>
                  <HugeiconsIcon icon={LogoutSquare01Icon} />
                  Log out
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}