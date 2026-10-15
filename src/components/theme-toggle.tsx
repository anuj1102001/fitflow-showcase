"use client";

import { motion, useReducedMotion } from "motion/react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/components/ui/cn";
import { useTheme, type ThemePref } from "@/lib/theme";

// One timing family for the whole switch: a quick, settled spring for the thumb and icons,
// while the page itself changes with the 0.8s wave (see globals.css).
const THUMB = { type: "spring", stiffness: 520, damping: 38, mass: 0.7 } as const;
const ICON = { type: "spring", stiffness: 420, damping: 22 } as const;

const OPTIONS: { id: ThemePref; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

/** The new theme spreads from the centre of the control that was pressed. */
const originOf = (e: React.MouseEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

// Sun turns, moon tilts, system pops: a small acknowledgement when an option is chosen.
const ENTER = { light: { rotate: -90, scale: 0.6 }, dark: { rotate: 30, scale: 0.6 }, system: { scale: 0.6 } } as const;

/** Three-way theme switch (Light / Dark / System) with a sliding thumb. */
export function ThemeToggle({ className, size = "md" }: { className?: string; size?: "sm" | "md" }) {
  const { pref, setPref } = useTheme();
  const reduce = useReducedMotion();
  const box = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  return (
    <div role="radiogroup" aria-label="Colour theme" className={cn("inline-flex items-center gap-0.5 rounded-[10px] border border-line bg-panel p-0.5", className)}>
      {OPTIONS.map(({ id, label, icon: Icon }) => {
        const on = pref === id;
        return (
          <motion.button
            key={id}
            role="radio"
            aria-checked={on}
            aria-label={`${label} theme`}
            title={label}
            onClick={(e) => setPref(id, originOf(e))}
            whileTap={reduce ? undefined : { scale: 0.88 }}
            className={cn("relative grid place-items-center rounded-lg transition-colors", box, on ? "text-fg" : "text-fg-3 hover:text-fg-2")}
          >
            {on && <motion.span layoutId={`theme-thumb-${size}`} className="absolute inset-0 rounded-lg bg-panel-2 shadow-[0_1px_2px_rgba(0,0,0,.12)] ring-1 ring-line-2" transition={reduce ? { duration: 0 } : THUMB} />}
            <motion.span key={on ? "on" : "off"} className="relative grid place-items-center" initial={on && !reduce ? ENTER[id] : false} animate={{ rotate: 0, scale: 1 }} transition={ICON}>
              <Icon size={size === "sm" ? 13 : 15} />
            </motion.span>
          </motion.button>
        );
      })}
    </div>
  );
}

/** Single icon button that flips between light and dark (for tight spaces). */
export function ThemeFlip({ className }: { className?: string }) {
  const { theme, setPref } = useTheme();
  const reduce = useReducedMotion();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <motion.button whileTap={reduce ? undefined : { scale: 0.9 }} onClick={(e) => setPref(next, originOf(e))} className={cn("icon-btn", className)} aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`}>
      <motion.span key={theme} initial={reduce ? false : { rotate: -90, opacity: 0, scale: 0.6 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} transition={ICON}>
        {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
      </motion.span>
    </motion.button>
  );
}
