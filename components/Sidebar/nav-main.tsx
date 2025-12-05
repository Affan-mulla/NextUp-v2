"use client";
import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type NavItem = {
  title: string;
  url: string;
  icon?: IconSvgElement;
};

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Explore</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive =
            item.url === "/"
              ? pathname === item.url
              : pathname?.startsWith(item.url);

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={item.title}
                className={
                  "group-data-[active=true]:bg-sidebar-accent group-data-[active=true]:text-sidebar-accent-foreground" /* keep container spacing minimal, anchor handles padding */
                }
              >
                <Link
                  href={item.url}
                  aria-current={isActive ? "page" : undefined}
                  className={`
                  flex w-full items-center p-4 text-sm transition-colors duration-150 relative

                  ${
                    isActive
                      ? `
                      bg-linear-to-b 
                      from-secondary
                      to-sidebar
                      text-sidebar-accent-foreground

                      border border-background

                      shadow-[0_2px_1px_rgba(0,0,0,0.1)]
                      dark:shadow-[0_4px_1px_-2px_rgba(0,0,0,0.3)]

                      backdrop-blur-md
                    `
                                        : `
                      text-muted-foreground
                      hover:bg-foreground/5
                      hover:text-sidebar-accent-foreground
                    `
                  }

                  `}
                >
                  {
                    isActive && (
                      <span className="absolute h-0.5 dark:block hidden bg-linear-to-b from-foreground/20 to-transparent w-full top-0 left-0"></span>
                    )

                  }
                  {item.icon && (
                    <span className="flex-none">
                      <HugeiconsIcon icon={item.icon} size={20} />
                    </span>
                  )}
                  <span className="min-w-0 truncate">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export default React.memo(NavMain);
