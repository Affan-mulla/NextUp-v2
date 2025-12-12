"use client";

import Account from "@/components/Settings/Account";
import Billing from "@/components/Settings/Billing";
import GeneralSettingsForm from "@/components/Settings/GeneralSettingsForm";

import Privacy from "@/components/Settings/Privacy";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useState } from "react";

const settingsTabs = [
  { value: "general", label: "General" },
  { value: "account", label: "Account" },
  { value: "privacy", label: "Privacy" },
  { value: "billing", label: "Billing" },
];

const tabsContent = [
  { value: "general", content: <GeneralSettingsForm /> },
  { value: "privacy", content: <Privacy /> },
  { value: "account", content: <Account /> },
  { value: "billing", content: <Billing /> },
]

export default function SettingsPage() {
  const [active, setActive] = useState("general");

  return (
    <div className="w-full mt-6">
      <Tabs value={active} onValueChange={setActive} className="w-full">
        <TabsList
          className="relative w-full flex justify-start gap-6 bg-transparent p-0 border-b border-border"
        >
          {settingsTabs.map((tab) => {
            const selected = active === tab.value;

            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="relative py-2 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:border-0  shadow-none"
              >
                {tab.label}

                {/* Sliding underline */}
                {selected && (
                  <motion.div
                    layoutId="underline"
                    className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 26 }}
                  />
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Content */}
        {tabsContent.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
