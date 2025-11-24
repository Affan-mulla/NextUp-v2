"use client";

import { useId, useEffect, useState } from "react";
import { Switch, SwitchWrapper } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Moon01Icon, Sun03Icon } from "@hugeicons/core-free-icons";

const Togglemode = () => {
  const id = useId();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex items-center space-x-2.5">
      <SwitchWrapper className="relative">
        <Switch
          id={id}
          size="md"
          checked={isDark}
          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          aria-label="Toggle color mode"
        />

        <div
          className={`absolute top-1 transition-all duration-300 ${
            isDark ? "left-5" : "left-1"
          }`}
          onClick={() => setTheme(isDark ? "light" : "dark")}
        >
          <AnimatePresence mode="popLayout">
            {isDark ? (
              <motion.div
                key="moon"
                initial={{ opacity: 0, y: 4, rotate: -20 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, y: -4, rotate: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
              >
                <HugeiconsIcon icon={Moon01Icon} />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ opacity: 0, y: -4, rotate: 20 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, y: 4, rotate: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
              >
                <HugeiconsIcon icon={Sun03Icon} className="text-orange-400"   />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SwitchWrapper>
    </div>
  );
};

export default Togglemode;
