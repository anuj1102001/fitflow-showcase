"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { EASE, SPRING } from "../motion/kit";
import { initials } from "@/lib/format";
import { cn } from "./cn";

/* ------------------------------------------------------------------ Segmented / tabs */

/** Segmented control with a sliding lime-tinted indicator (shared layout animation). */
export function Segmented<T extends string>({ value, onChange, options, size = "md", className, label }: { value: T; onChange: (v: T) => void; options: readonly { id: T; label: ReactNode; icon?: ReactNode }[]; size?: "sm" | "md"; className?: string; label: string }) {
  const id = useId();
  return (
    <div role="tablist" aria-label={label} className={cn("relative inline-flex items-center gap-0.5 rounded-[10px] border border-line bg-panel-2/70 p-0.5", className)}>
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.id)}
            className={cn("relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg font-medium transition-colors", size === "sm" ? "h-7 px-2.5 text-[12px]" : "h-8 px-3 text-[13px]", active ? "text-fg" : "text-fg-3 hover:text-fg-2")}
          >
            {active && <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-lg border border-line-2 bg-panel shadow-[0_1px_2px_rgb(0_0_0/.06)]" transition={SPRING} />}
            <span className="relative inline-flex items-center gap-1.5">
              {o.icon}
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ Badge */

const TONES = {
  neutral: "border-line bg-panel-2 text-fg-2",
  lime: "border-lime-fg/25 bg-lime/15 text-lime-fg",
  ok: "border-ok/25 bg-ok/10 text-ok",
  warn: "border-warn/25 bg-warn/10 text-warn",
  bad: "border-bad/25 bg-bad/10 text-bad",
  info: "border-info/25 bg-info/10 text-info",
  violet: "border-violet/25 bg-violet/10 text-violet",
} as const;
export type Tone = keyof typeof TONES;

export function Badge({ tone = "neutral", children, className, dot }: { tone?: Tone; children: ReactNode; className?: string; dot?: boolean }) {
  return (
    <span className={cn("inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border px-2 text-[11.5px] font-medium", TONES[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}

/** Small label that marks anything simulated or fictional. */
export function DemoTag({ children = "Sample data", className }: { children?: ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-md border border-dashed border-line-2 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-fg-3", className)}>{children}</span>;
}

/* ------------------------------------------------------------------ Avatar */

const AV = ["#c8f04a", "#8fd6ff", "#ffb38a", "#c9a6ff", "#7fe0b8", "#ffd36e", "#ff9fb5"];
export function Avatar({ name, src, size = 36, className }: { name: string; src?: string; size?: number; className?: string }) {
  const h = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const color = AV[h % AV.length]!;
  if (src) return <img src={src} alt="" width={size} height={size} className={cn("shrink-0 rounded-full object-cover", className)} style={{ width: size, height: size }} />;
  return (
    <span
      aria-hidden
      className={cn("inline-grid shrink-0 place-items-center rounded-full font-display font-semibold", className)}
      style={{ width: size, height: size, fontSize: size * 0.36, background: `color-mix(in srgb, ${color} 18%, rgb(var(--panel-2)))`, color: `color-mix(in srgb, ${color} var(--av-mix), rgb(var(--fg)))`, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color} 30%, transparent)` }}
    >
      {initials(name)}
    </span>
  );
}

/* ------------------------------------------------------------------ Drawer (side panel) */

export function Drawer({ open, onClose, title, subtitle, children, footer, width = 520 }: { open: boolean; onClose: () => void; title: ReactNode; subtitle?: ReactNode; children: ReactNode; footer?: ReactNode; width?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const t = setTimeout(() => ref.current?.querySelector<HTMLElement>("[data-autofocus], button, input, textarea, select")?.focus(), 50);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
      document.body.style.overflow = "";
      prev?.focus?.();
    };
  }, [open, onClose]);
  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[80]">
            <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
            <motion.aside
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-label={typeof title === "string" ? title : undefined}
              className="absolute bottom-0 right-0 top-0 flex w-full flex-col border-l border-line bg-panel shadow-pop"
              style={{ maxWidth: width }}
              initial={{ x: "100%", opacity: 0.6 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.6 }}
              transition={{ duration: 0.42, ease: EASE }}
            >
              <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
                <div className="min-w-0">
                  <div className="truncate text-[18px] font-semibold">{title}</div>
                  {subtitle && <div className="mt-0.5 text-[13px] text-fg-3">{subtitle}</div>}
                </div>
                <button onClick={onClose} aria-label="Close panel" className="icon-btn h-9 w-9">
                  <X size={16} />
                </button>
              </header>
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
              {footer && <footer className="border-t border-line px-5 py-3.5 pb-safe sm:px-6">{footer}</footer>}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}

export function Portal({ children }: { children: ReactNode }) {
  const [el, setEl] = useState<HTMLElement | null>(null);
  useEffect(() => setEl(document.body), []);
  return el ? createPortal(children, el) : null;
}

/* ------------------------------------------------------------------ Menu (dropdown) */

export function Menu({ trigger, children, align = "right", width = 240, label }: { trigger: (p: { open: boolean; toggle: () => void }) => ReactNode; children: (close: () => void) => ReactNode; align?: "left" | "right"; width?: number; label: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label={label}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: EASE }}
            className={cn("absolute top-[calc(100%+6px)] z-[70] origin-top overflow-hidden rounded-xl border border-line bg-panel p-1 shadow-pop", align === "right" ? "right-0" : "left-0")}
            style={{ width }}
          >
            {children(() => setOpen(false))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MenuItem({ icon, children, onClick, danger, hint }: { icon?: ReactNode; children: ReactNode; onClick: () => void; danger?: boolean; hint?: ReactNode }) {
  return (
    <button role="menuitem" onClick={onClick} className={cn("flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13.5px] transition hover:bg-panel-2", danger ? "text-bad" : "text-fg-2 hover:text-fg")}>
      {icon && <span className="text-fg-3">{icon}</span>}
      <span className="flex-1">{children}</span>
      {hint && <span className="text-[11px] text-fg-3">{hint}</span>}
    </button>
  );
}

/* ------------------------------------------------------------------ Data bits */

export function ProgressRing({ value, size = 44, stroke = 4, className, label }: { value: number; size?: number; stroke?: number; className?: string; label?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <svg width={size} height={size} className={cn("-rotate-90", className)} role="img" aria-label={label ?? `${Math.round(v * 100)}%`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--line-2))" strokeWidth={stroke} />
      <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--s-1))" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - v) }} transition={{ duration: 1, ease: EASE }} />
    </svg>
  );
}

export function Bar({ value, tone = "lime", className }: { value: number; tone?: "lime" | "warn" | "bad" | "ok"; className?: string }) {
  const color = { lime: "bg-s1", warn: "bg-warn", bad: "bg-bad", ok: "bg-ok" }[tone];
  return (
    <div className={cn("h-1.5 overflow-hidden rounded-full bg-line", className)}>
      <motion.div className={cn("h-full rounded-full", color)} initial={{ width: 0 }} animate={{ width: `${Math.max(2, Math.min(100, value * 100))}%` }} transition={{ duration: 0.9, ease: EASE }} />
    </div>
  );
}

export function Sparkline({ values, width = 96, height = 28, className }: { values: number[]; width?: number; height?: number; className?: string }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pts = values.map((v, i) => [(i / (values.length - 1)) * width, height - 3 - ((v - min) / (max - min || 1)) * (height - 6)] as const);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return (
    <svg width={width} height={height} className={className} aria-hidden>
      <path d={`${d} L${width},${height} L0,${height} Z`} fill="rgb(var(--s-1) / .1)" />
      <motion.path d={d} fill="none" stroke="rgb(var(--s-1))" strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: EASE }} />
    </svg>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="inline-grid h-5 min-w-5 place-items-center rounded-md border border-line-2 bg-panel-2 px-1 font-mono text-[10.5px] text-fg-3">{children}</kbd>;
}

export function Empty({ icon, title, body, action, className }: { icon: ReactNode; title: string; body: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("relative grid place-items-center overflow-hidden rounded-2xl border border-dashed border-line-2 bg-panel/50 px-6 py-12 text-center", className)}>
      <div className="relative">
        <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-xl border border-line bg-panel text-fg-2">{icon}</div>
        <p className="text-[16px] font-semibold">{title}</p>
        <p className="mx-auto mt-1.5 max-w-sm text-[14px] leading-relaxed text-fg-2">{body}</p>
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} aria-hidden />;
}

/** Native-title tooltip with a styled hover bubble (keyboard focus shows it too). */
export function Tip({ text, children, side = "top" }: { text: string; children: ReactNode; side?: "top" | "bottom" }) {
  return (
    <span className="group/tip relative inline-flex" tabIndex={0} aria-label={text}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 w-max max-w-[240px] -translate-x-1/2 rounded-xl border border-line bg-panel-2 px-3 py-2 text-left text-[12px] font-normal normal-case leading-snug tracking-normal text-fg-2 opacity-0 shadow-pop transition duration-150 group-hover/tip:opacity-100 group-focus/tip:opacity-100",
          side === "top" ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]",
        )}
      >
        {text}
      </span>
    </span>
  );
}

/** Card wrapper with a title row; most dashboard panels use this. */
export function Panel({ title, subtitle, action, children, className, bodyClass, id }: { title?: ReactNode; subtitle?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; bodyClass?: string; id?: string }) {
  return (
    <section id={id} className={cn("card panel-sheen flex min-w-0 flex-col", className)}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 px-5 pt-5 sm:px-6">
          <div className="min-w-0">
            {title && <h2 className="text-[16px] font-semibold tracking-[-0.015em]">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-[13px] text-fg-3">{subtitle}</p>}
          </div>
          {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
        </header>
      )}
      <div className={cn("min-w-0 flex-1 px-5 pb-5 pt-4 sm:px-6", bodyClass)}>{children}</div>
    </section>
  );
}
