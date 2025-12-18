"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Suspense, useState } from "react";
import SettingsSkeleton from "./SettingsSkeleton";

interface TabItem {
  value: string;
  label: string;
  node: React.ReactNode;
}

export default function SettingsTabsShell({ tabs }: { tabs: TabItem[] }) {
  const [active, setActive] = useState(tabs[0]?.value ?? "");

  return (
    <Tabs value={active} onValueChange={setActive} className="w-full">
      <TabsList className="relative w-full flex justify-start gap-6 bg-transparent rounded-none p-0 border-b border-border">
        {tabs.map((tab) => {
          const selected = active === tab.value;
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="relative py-2 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-muted data-[state=active]:border-0 shadow-none rounded-b-none"
            >
              {tab.label}
              {selected && (
                <motion.div
                  layoutId="underline"
                  className="absolute left-0 right-0 -bottom-px h-0.5 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 26 }}
                />
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          <Suspense fallback={<SettingsSkeleton />}>
           {tabs.find(t => t.value === active)?.node}
          </Suspense>
        </TabsContent>
      ))}
    </Tabs>
  );
}
