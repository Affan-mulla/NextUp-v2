"use client"

import * as React from "react";
import { AudioWaveform, Command, Frame, GalleryVerticalEnd, Map, PieChart } from "lucide-react";

import { NavMain } from "@/components/Sidebar/nav-main";
import { NavUser } from "@/components/Sidebar/nav-user";
import { TeamSwitcher } from "@/components/Sidebar/team-switcher";

import { Home03Icon, RankingIcon, Rocket01Icon, Settings03Icon } from '@hugeicons/core-free-icons';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Suspense } from "react";

// This is sample data.
const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Feed",
      url: "/",
      icon: Home03Icon,
      isActive: true,
    },
    {
      title: "Leaderboard",
      url: "/leaderboard",
      icon: RankingIcon,
    },
    {
      title: "Launch",
      url: "/launch",
      icon: Rocket01Icon,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings03Icon,
    },
  ]
}

export const AppSidebar = React.memo(function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" aria-label="Main navigation" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <Suspense fallback={<div>Loading...</div>}>
        <NavMain items={data.navMain} />
        </Suspense>
      </SidebarContent>
      <SidebarFooter>
        <Suspense fallback={<div>Loading...</div>}>
          <NavUser />
        </Suspense>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
});

AppSidebar.displayName = 'AppSidebar';
