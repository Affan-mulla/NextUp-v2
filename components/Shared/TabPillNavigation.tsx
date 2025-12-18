"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface TabItem {
  value: string;
  label: string;
}

interface TabPillNavigationProps {
  tabs: TabItem[];
  active: string;
  onChange: (value: string) => void;
  className?: string;
  columns?: number; // optional → auto from tabs length
}

export default function TabPillNavigation({
  tabs,
  active,
  onChange,
  className = "",
  columns
}: TabPillNavigationProps) {
  const [hoverTab, setHoverTab] = useState<number | null>(null);

  const glassSpring = {
    type: "spring",
    stiffness: 420,
    damping: 30,
    mass: 0.3,
  } as const;

  const activeSpring = {
    type: "spring",
    stiffness: 440,
    damping: 30,
  } as const;

  const gridCols = columns ?? tabs.length;

  return (
    <div className={`relative h-13 rounded-full p-2 mb-4 ${className}`}>
      {/* OUTER SHELL */}
      <div
        className="absolute inset-0 rounded-full 
        bg-gradient-to-b from-secondary to-secondary/90
        dark:bg-gradient-to-b dark:from-sidebar dark:to-sidebar/80
        dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
      />

      <div
        className="absolute inset-[3px] rounded-full
        bg-gradient-to-b from-card to-card/90
        shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)]
        dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
      />

      {/* FULL GLASS when NOT hovering */}
      {hoverTab === null && (
        <motion.div
          layoutId="glass"
          transition={glassSpring}
          className="absolute inset-1.5 rounded-full 
          bg-foreground/5 dark:bg-foreground/10 
          backdrop-blur-sm border border-border/40
          dark:shadow-[0_6px_18px_rgba(0,0,0,0.35)] z-10"
        />
      )}

      {/* TAB BUTTONS */}
      <div
        className={`relative z-20 grid h-full`}
        style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
      >
        {tabs.map((tab, i) => {
          const isActive = active === tab.value;
          const isHover = hoverTab === i;

          return (
            <button
              key={tab.value}
              onPointerEnter={() => setHoverTab(i)}
              onPointerLeave={() => setHoverTab(null)}
              onClick={() => onChange(tab.value)}
              aria-pressed={isActive}
              className="relative flex items-center justify-center cursor-pointer select-none"
            >
              {/* hover pill */}
              {isHover && (
                <motion.div
                  layoutId="glass"
                  transition={glassSpring}
                  className="absolute inset-y-0 inset-x-1 rounded-full 
                  bg-foreground/5 dark:bg-foreground/10
                  backdrop-blur-sm border border-border/40 
                  dark:shadow-[0_6px_18px_rgba(0,0,0,0.35)] z-10"
                />
              )}

              {/* active pill */}
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  transition={activeSpring}
                  className="absolute inset-0 rounded-full 
                  bg-gradient-to-b from-primary/90 to-primary
                  dark:from-primary/80 dark:to-primary/90
                  border border-border/40 z-20"
                >
                  <div className="absolute inset-0 bg-linear-to-b from-neutral-50/20 via-neutral-100/10 to-transparent rounded-2xl" />
                </motion.div>
              )}

              <span
                className={`relative z-30 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
