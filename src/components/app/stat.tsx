"use client";

import NumberFlow, { type Format } from "@number-flow/react";
import { ArrowDownRight, ArrowUpRight, Info } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { EASE } from "@/components/motion/kit";
import { cn } from "@/components/ui/cn";
import { Sparkline, Tip } from "@/components/ui/kit";

export function StatTile({
  label,
  value,
  format = "number",
  delta,
  deltaKind = "relative",
  spark,
  info,
  icon,
  index = 0,
  accent,
}: {
  label: string;
  value: number | null;
  format?: "number" | "rupees" | "pct";
  delta: number | null;
  deltaKind?: "relative" | "points";
  spark?: number[];
  info?: string;
  icon?: ReactNode;
  index?: number;
  accent?: boolean;
}) {
  const up = delta !== null && delta >= 0;
  const deltaText = delta === null ? "No prior data" : deltaKind === "points" ? `${up ? "+" : ""}${(delta * 100).toFixed(1)} pts` : `${up ? "+" : ""}${Math.round(delta * 100)}%`;
  const opts: Format =
    format === "rupees" ? { style: "currency", currency: "INR", maximumFractionDigits: 0 } : format === "pct" ? { style: "percent", maximumFractionDigits: 1, minimumFractionDigits: 1 } : { maximumFractionDigits: 0 };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: index * 0.06 }}
      style={{ transformPerspective: 1000 }}
      whileHover={{ y: -3 }}
      className={cn("card panel-sheen group relative overflow-hidden p-5", accent && "border-lime/25")}
    >
      {accent && <div className="lime-glow pointer-events-none absolute -right-16 -top-20 h-48 w-48 opacity-60" aria-hidden />}
      <div className="relative flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[13px] font-medium text-fg-2">
          {icon && <span className="text-fg-3">{icon}</span>}
          {label}
          {info && (
            <Tip text={info}>
              <Info size={13} className="text-fg-3 transition hover:text-fg-2" />
            </Tip>
          )}
        </p>
      </div>
      <div className="relative mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-[30px] font-semibold leading-none tracking-[-0.03em] tabular">
            {value === null ? "–" : <NumberFlow value={value} format={opts} locales="en-IN" />}
          </p>
          <p className={cn("mt-2 inline-flex items-center gap-1 text-[12.5px] font-medium", delta === null ? "text-fg-3" : up ? "text-ok" : "text-bad")}>
            {delta !== null && (up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />)}
            {deltaText}
            <span className="font-normal text-fg-3">vs previous</span>
          </p>
        </div>
        {spark && <Sparkline values={spark} width={88} height={34} className="shrink-0 opacity-90" />}
      </div>
    </motion.div>
  );
}
