  "use client";

  import * as React from "react";
  import { cn } from "@/lib/utils";
  import { Settings, CreditCard, FileText, LogOut, User } from "lucide-react";
  import Image from "next/image";
  import Link from "next/link";
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
  import Gemini from "@/components/kokonutui/gemini";
  import { authClient } from "@/lib/auth/auth-client";
  import { useRouter } from "next/navigation";
  import { toast } from "sonner";
  import { Spinner } from "@/components/ui/spinner";
  import {
    useUser,
    useUserActions,
    useIsHydrated,
    useIsLoading,
  } from "@/lib/store/user-store";
  import { Skeleton } from "@/components/ui/skeleton";
  import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
  import Togglemode from "../Theme/Toggle-mode";
  import { HugeiconsIcon } from "@hugeicons/react";
  import { Sun02FreeIcons } from "@hugeicons/core-free-icons";
  import { useSidebar } from "../ui/sidebar";

  interface MenuItem {
    label: string;
    value?: string;
    href: string;
    icon: React.ReactNode;
    external?: boolean;
  }

  export function NavUser() {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = React.useState(false);
    const [isOpen, setIsOpen] = React.useState(false);
    const { isMobile, open } = useSidebar();

    // Get user from Zustand store
    const user = useUser();
    const { clearUser } = useUserActions();
    const isHydrated = useIsHydrated();
    const isLoading = useIsLoading();

    // Show loading skeleton while hydrating
    if (!isHydrated || isLoading) {
      return (
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      );
    }

    // Show nothing if no user after hydration
    if (!user) {
      return null;
    }

    const menuItems: MenuItem[] = [
      {
        label: "Profile",
        href: `/u/${user.name}`,
        icon: <User className="w-4 h-4" />,
      },
      {
        label: "Model",
        value: "Gemini 2.0 Flash",
        href: "#",
        icon: <Gemini className="w-4 h-4" />,
      },
      {
        label: "Subscription",
        value: "PRO",
        href: "#",
        icon: <CreditCard className="w-4 h-4" />,
      },
      {
        label: "Settings",
        href: "/settings",
        icon: <Settings className="w-4 h-4" />,
      },
    ];

    const handleSignOut = async () => {
      setIsLoggingOut(true);
      try {
        const res = await authClient.signOut();
        if (res && (res as any).error) {
          toast.error(
            `Logout failed: ${(res as any).error.message || "Unknown error"}`
          );
        } else {
          clearUser();
          toast.success("Logged out");
          router.push("/auth/sign-in");
        }
      } catch (err) {
        console.error(err);
        toast.error("Logout failed");
      } finally {
        setIsLoggingOut(false);
      }
    };
    

    return (
      <div className="relative">
        <DropdownMenu onOpenChange={setIsOpen}>
          <div className="group relative">
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex items-center justify-between p-3 rounded-2xl bg-background border border-border hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-background/80 hover:shadow-sm transition-all duration-200 focus:outline-none w-full",
                  !open && !isMobile && "p-0"
                )}
              >
                {open && (
                  <div className="text-left">
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
                      {user.name}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 tracking-tight leading-tight">
                      {user.email}
                    </div>
                  </div>
                )}

                <div className="relative">
                  <div className=" rounded-full bg-linear-to-br from-purple-500 via-pink-500 to-orange-400 p-0.5">
                    <div className="w-full h-full rounded-full overflow-hidden bg-background">
                      <Avatar>
                        <AvatarFallback>
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                        <AvatarImage src={user.avatar} />
                      </Avatar>
                    </div>
                  </div>
                </div>
              </button>
            </DropdownMenuTrigger>

            {open && (
              <div
                className={cn(
                  "absolute -right-3 top-1/2 -translate-y-1/2 transition-all duration-200",
                  isOpen ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                )}
              >
                <svg
                  width="12"
                  height="24"
                  viewBox="0 0 12 24"
                  fill="none"
                  className={cn(
                    "transition-all duration-200",
                    isOpen
                      ? "text-blue-500 dark:text-blue-400 scale-110"
                      : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                  )}
                  aria-hidden="true"
                >
                  <path
                    d="M2 4C6 8 6 16 2 20"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </div>
            )}

            <DropdownMenuContent
              align="end"
              sideOffset={4}
              className="w-64 p-2 bg-background/60 backdrop-blur-sm border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl shadow-xl shadow-zinc-900/5 dark:shadow-zinc-950/20 
                      data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-top-right"
            >
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <DropdownMenuItem key={item.label} asChild>
                    <Link
                      href={item.href}
                      className="flex items-center p-3 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60 rounded-xl transition-all duration-200 cursor-pointer group hover:shadow-sm border border-transparent hover:border-zinc-200/50 dark:hover:border-zinc-700/50"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {item.icon}
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight whitespace-nowrap group-hover:text-zinc-950 dark:group-hover:text-zinc-50 transition-colors">
                          {item.label}
                        </span>
                      </div>
                      <div className="shrink-0 ml-auto">
                        {item.value && (
                          <span
                            className={cn(
                              "text-xs font-medium rounded-md py-1 px-2 tracking-tight",
                              item.label === "Model"
                                ? "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10 border border-blue-500/10"
                                : "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-500/10 border border-purple-500/10"
                            )}
                          >
                            {item.value}
                          </span>
                        )}
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </div>

              <DropdownMenuSeparator className=" bg-linear-to-r from-transparent via-zinc-200 to-transparent dark:via-zinc-800" />

              <DropdownMenuItem asChild onClick={(e) => e.preventDefault()}>
                <div className="flex items-center  hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60 rounded-xl transition-all duration-200 cursor-pointer group hover:shadow-sm border border-transparent hover:border-zinc-200/50 dark:hover:border-zinc-700/50">
                  <div className="flex items-center gap-2 flex-1">
                    <HugeiconsIcon icon={Sun02FreeIcons} />
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight whitespace-nowrap  transition-colors">
                      Theme
                    </span>
                  </div>
                  <Togglemode />
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator className=" bg-linear-to-r from-transparent via-zinc-200 to-transparent dark:via-zinc-800" />

              <DropdownMenuItem asChild>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="w-full  flex items-center gap-3 p-3 duration-200 bg-red-500/10 rounded-xl hover:bg-red-500/20 cursor-pointer border border-transparent hover:border-red-500/30 hover:shadow-sm transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <>
                      <Spinner className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-red-500">
                        Signing out...
                      </span>
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4 text-red-500 group-hover:text-red-600" />
                      <span className="text-sm font-medium text-red-500 group-hover:text-red-600">
                        Sign Out
                      </span>
                    </>
                  )}
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </div>
        </DropdownMenu>
      </div>
    );
  }
