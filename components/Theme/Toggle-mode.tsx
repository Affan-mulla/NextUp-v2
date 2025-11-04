"use client";
import { useId, useEffect, useState } from "react";
import { Switch, SwitchIndicator, SwitchWrapper } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const Togglemode = () => {
  const id = useId();
  const { resolvedTheme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";
  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center space-x-2.5">
        <SwitchWrapper>
          <Switch
            id={id}
            size="lg"
            checked={isDark}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            aria-label="Toggle color mode"
          />
          <SwitchIndicator state="off">
            <Sun className="h-4 w-4 text-orange-500 " />
          </SwitchIndicator>
          <SwitchIndicator state="on">
            <Moon className="h-4 w-4 text-neutral-900" />
          </SwitchIndicator>
        </SwitchWrapper>
      </div>
    </div>
  );
};

export default Togglemode;
