"use client"
import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react';
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
            item.url === '/'
              ? pathname === item.url
              : pathname?.startsWith(item.url);

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={item.title}
                className={
                  "px-0 group/menu-item" /* keep container spacing minimal, anchor handles padding */
                }
              >
                <Link
                  href={item.url}
                  aria-current={isActive ? 'page' : undefined}
                  className={
                    `flex w-full  items-center  px-3 py-2 rounded-md text-sm transition-colors duration-150  ` +
                    (isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm dark:border-x-0 dark:border-b-0 border'
                      : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground')
                  }
                >
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
