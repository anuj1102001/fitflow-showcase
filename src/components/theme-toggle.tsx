"use client";

import { motion } from "motion/react";
import { Monitor, Moon, Sun } from "lucide-react";
import { SPRING } from "@/components/motion/kit";
import { cn } from "@/components/ui/cn";
import { useTheme, type ThemePref } from "@/lib/theme";

const OPTIONS: { id: ThemePref; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

/** Three-way theme switch (Light / Dark / System) with a sliding thumb. */
export function ThemeToggle({ className, size = "md" }: { className?: string; size?: "sm" | "md" }) {
  const { pref, setPref } = useTheme();
  const box = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  return (
    <div role="radiogroup" aria-label="Colour theme" className={cn("inline-flex items-center gap-0.5 rounded-[10px] border border-line bg-panel p-0.5", className)}>
      {OPTIONS.map(({ id, label, icon: Icon }) => {
        const on = pref === id;
        return (
          <button key={id} role="radio" aria-checked={on} aria-label={`${label} theme`} title={label} onClick={() => setPref(id)} className={cn("relative grid place-items-center rounded-lg transition-colors", box, on ? "text-fg" : "text-fg-3 hover:text-fg-2")}>
            {on && <motion.span layoutId={`theme-thumb-${size}`} className="absolute inset-0 rounded-lg bg-panel-2 ring-1 ring-line-2" transition={SPRING} />}
            <Icon size={size === "sm" ? 13 : 15} className="relative" />
          </button>
        );
      })}
    </div>
  );
}

/** Single icon button that flips between light and dark (for tight spaces). */
export function ThemeFlip({ className }: { className?: string }) {
  const { theme, setPref } = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button onClick={() => setPref(next)} className={cn("icon-btn", className)} aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`}>
      <motion.span key={theme} initial={{ rotate: -90, opacity: 0, scale: 0.6 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
        {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
      </motion.span>
    </button>
  );
}
