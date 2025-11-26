"use client";

import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";
import { motion } from "framer-motion";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import { AddSquareIcon } from "@hugeicons/core-free-icons";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string;
    logo: React.ElementType;
    plan: string;
  }[];
}) {
  const [activeTeam, setActiveTeam] = React.useState(teams[0]);

  if (!activeTeam) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <AddProductButton />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function AddProductButton() {
  const { open } = useSidebar();
  return (
    <motion.div
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 350, damping: 18 }}
      className={cn("dark:border-foreground/20 border-primary/20 border-4 rounded-[12px] drop-shadow-xl  drop-shadow-secondary" , !open && "border-2"
  )}>
      <Button
        className="
          w-full border-2 dark:border-foreground/30 border-background/20 px-3 py-2 
          transition-all duration-200"
          size={`${open ? "default" : "icon-sm"}`}
      >
        <motion.div>
          <HugeiconsIcon icon={AddSquareIcon} className={cn("size-6", !open && "size-5")} />
        </motion.div>

        {open && (
          <div className="grid flex-1 text-left text-sm leading-tight truncate font-medium">
            Add Product
          </div>
        )}
      </Button>
    </motion.div>
  );
}

// <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <SidebarMenuButton
//               size="lg"
//               className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
//             >
//               <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
//                 <activeTeam.logo className="size-4" />
//               </div>
//               <div className="grid flex-1 text-left text-sm leading-tight">
//                 <span className="truncate font-medium">{activeTeam.name}</span>
//                 <span className="truncate text-xs">{activeTeam.plan}</span>
//               </div>
//               <ChevronsUpDown className="ml-auto" />
//             </SidebarMenuButton>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent
//             className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
//             align="start"
//             side={isMobile ? "bottom" : "right"}
//             sideOffset={4}
//           >
//             <DropdownMenuLabel className="text-muted-foreground text-xs">
//               Teams
//             </DropdownMenuLabel>
//             {teams.map((team, index) => (
//               <DropdownMenuItem
//                 key={team.name}
//                 onClick={() => setActiveTeam(team)}
//                 className="gap-2 p-2"
//               >
//                 <div className="flex size-6 items-center justify-center rounded-md border">
//                   <team.logo className="size-3.5 shrink-0" />
//                 </div>
//                 {team.name}
//                 <DropdownMenuShortcut>⌘{index +  1}</DropdownMenuShortcut>
//               </DropdownMenuItem>
//             ))}
//             <DropdownMenuSeparator />
//             <DropdownMenuItem className="gap-2 p-2">
//               <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
//                 <Plus className="size-4" />
//               </div>
//               <div className="text-muted-foreground font-medium">Add team</div>
//             </DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
