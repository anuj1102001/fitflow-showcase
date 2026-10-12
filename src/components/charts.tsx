"use client";

import { motion, useReducedMotion } from "motion/react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipProps } from "recharts";
import { EASE } from "./motion/kit";
import { num, pct, rupees, rupeesShort } from "@/lib/format";

/** Chart palette: lime leads; the rest are tuned for the dark panel and distinguishable from each other. */
export const SERIES = {
  lime: "rgb(var(--s-1))",
  sky: "rgb(var(--s-2))",
  peach: "rgb(var(--s-3))",
  violet: "rgb(var(--s-4))",
  mint: "rgb(var(--s-5))",
  muted: "rgb(var(--line-2))",
};
export const SOURCE_COLOR: Record<string, string> = { Instagram: SERIES.lime, Storefront: SERIES.sky, Referral: SERIES.mint, YouTube: SERIES.peach, WhatsApp: SERIES.violet };

const axis = { stroke: "rgb(var(--axis))", fontSize: 11, tickLine: false, axisLine: false } as const;

type Fmt = "number" | "rupees" | "pct";
const fmt = (v: number, f: Fmt) => (f === "rupees" ? rupees(v) : f === "pct" ? pct(v) : num(v));

function Tip({ active, payload, label, formats }: TooltipProps<number, string> & { formats: Record<string, Fmt> }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-[150px] rounded-2xl border border-line bg-panel-2/95 px-3.5 py-2.5 shadow-pop backdrop-blur">
      <p className="mb-1.5 text-[12px] font-medium text-fg-3">{label}</p>
      {payload.map((p) => (
        <p key={String(p.dataKey)} className="flex items-center justify-between gap-4 text-[13px]">
          <span className="flex items-center gap-2 text-fg-2">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="tabular font-semibold text-fg">{fmt(Number(p.value), formats[String(p.dataKey)] ?? "number")}</span>
        </p>
      ))}
    </div>
  );
}

export function TrendChart<T extends Record<string, unknown>>({ data, x, series, height = 260, yFormat = "number" }: { data: T[]; x: keyof T & string; series: { key: keyof T & string; name: string; color: string; format?: Fmt; dashed?: boolean }[]; height?: number; yFormat?: Fmt }) {
  const reduce = useReducedMotion();
  const formats = Object.fromEntries(series.map((s) => [s.key, s.format ?? yFormat]));
  return (
    <div style={{ height }} className="-ml-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`g-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.22} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid vertical={false} stroke="rgb(var(--grid))" strokeDasharray="3 4" />
          <XAxis dataKey={x} {...axis} minTickGap={18} tickMargin={8} />
          <YAxis {...axis} width={48} allowDecimals={false} tickFormatter={(v: number) => (yFormat === "rupees" ? rupeesShort(v) : yFormat === "pct" ? pct(v, 0) : num(v))} />
          <Tooltip content={<Tip formats={formats} />} cursor={{ stroke: "rgb(var(--line-2))", strokeWidth: 1 }} />
          {series.map((s) => (
            <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2} strokeDasharray={s.dashed ? "4 4" : undefined} fill={s.dashed ? "transparent" : `url(#g-${s.key})`} isAnimationActive={!reduce} animationDuration={900} activeDot={{ r: 4, strokeWidth: 0, fill: s.color }} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarsChart<T extends Record<string, unknown>>({ data, x, series, height = 240, yFormat = "number", stacked, yMax }: { data: T[]; x: keyof T & string; series: { key: keyof T & string; name: string; color: string }[]; height?: number; yFormat?: Fmt; stacked?: boolean; yMax?: number }) {
  const reduce = useReducedMotion();
  const formats = Object.fromEntries(series.map((s) => [s.key, yFormat]));
  return (
    <div style={{ height }} className="-ml-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
          <CartesianGrid vertical={false} stroke="rgb(var(--grid))" strokeDasharray="3 4" />
          <XAxis dataKey={x} {...axis} tickMargin={8} />
          <YAxis {...axis} width={48} allowDecimals={false} domain={yMax ? [0, yMax] : undefined} ticks={yMax ? [0, yMax / 4, yMax / 2, (yMax * 3) / 4, yMax] : undefined} tickFormatter={(v: number) => (yFormat === "rupees" ? rupeesShort(v) : num(v))} />
          <Tooltip content={<Tip formats={formats} />} cursor={{ fill: "rgb(var(--fg) / .04)" }} />
          {series.map((s, i) => (
            <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} radius={stacked && i < series.length - 1 ? 0 : [6, 6, 0, 0]} maxBarSize={36} stackId={stacked ? "a" : undefined} isAnimationActive={!reduce} animationDuration={800} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Donut({ data, height = 200, format = "number", center }: { data: { name: string; value: number; color: string }[]; height?: number; format?: Fmt; center?: { value: string; label: string } }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<Tip formats={{ value: format }} />} />
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="68%" outerRadius="96%" paddingAngle={2} stroke="none" isAnimationActive={!reduce} animationDuration={900}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {center && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="font-display text-[26px] font-semibold leading-none tabular">{center.value}</p>
            <p className="mt-1 text-[11.5px] text-fg-3">{center.label}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/** Funnel as stepped horizontal bars with step-to-step conversion between them. */
export function FunnelChart({ steps }: { steps: { step: string; count: number; rate: number | null }[] }) {
  const max = Math.max(1, steps[0]?.count ?? 1);
  return (
    <ol className="space-y-2.5">
      {steps.map((s, i) => {
        const prev = steps[i - 1];
        const stepRate = prev && prev.count ? s.count / prev.count : null;
        return (
          <li key={s.step}>
            <div className="mb-1 flex items-baseline justify-between gap-2 text-[13px]">
              <span className="text-fg-2">{s.step}</span>
              <span className="tabular">
                <span className="font-semibold text-fg">{num(s.count)}</span>
                {i > 0 && <span className="ml-2 text-[12px] text-fg-3">{pct(stepRate, 0)} of previous</span>}
              </span>
            </div>
            <div className="h-8 overflow-hidden rounded-xl bg-panel-2">
              <motion.div
                className="h-full rounded-xl"
                style={{ background: `rgb(var(--s-1) / ${1 - i * 0.15})` }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(2, (s.count / max) * 100)}%` }}
                transition={{ duration: 0.9, ease: EASE, delay: i * 0.08 }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
