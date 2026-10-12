"use client";

import { animate, motion, MotionConfig, stagger, useInView, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform, type HTMLMotionProps } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../ui/cn";

/**
 * FITFLOW motion kit (Framer Motion). One easing, a few spring presets and a handful of primitives so
 * every screen moves the same way. Everything honours the OS "reduce motion" setting via MotionConfig.
 */
export const EASE = [0.22, 0.8, 0.24, 1] as const;
export const SPRING = { type: "spring", stiffness: 260, damping: 26, mass: 0.6 } as const;

export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user" transition={{ duration: 0.5, ease: EASE }}>{children}</MotionConfig>;
}

/** Fades and lifts content into place the first time it scrolls into view. */
export function Reveal({ children, className, delay = 0, y = 28 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y, rotateX: 6, transformPerspective: 1200 }} whileInView={{ opacity: 1, y: 0, rotateX: 0 }} viewport={{ once: true, margin: "0px 0px -12% 0px" }} transition={{ duration: 0.8, ease: EASE, delay: delay / 1000 }}>
      {children}
    </motion.div>
  );
}

/** Children appear one after another (each child must be a StaggerItem). */
export function Stagger({ children, className, gap = 0.06, once = true, ...rest }: { children: ReactNode; className?: string; gap?: number; once?: boolean } & HTMLMotionProps<"div">) {
  return (
    <motion.div className={className} initial="hidden" whileInView="show" viewport={{ once, margin: "0px 0px -8% 0px" }} variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }} {...rest}>
      {children}
    </motion.div>
  );
}
export function StaggerItem({ children, className, ...rest }: { children: ReactNode; className?: string } & HTMLMotionProps<"div">) {
  return (
    <motion.div className={className} variants={{ hidden: { opacity: 0, y: 18, scale: 0.985 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: EASE } } }} {...rest}>
      {children}
    </motion.div>
  );
}

/**
 * Page entrance for dashboard routes: the page's top-level sections rise in with a slight 3D tilt, staggered.
 * Works on server-rendered children by animating the DOM after mount.
 */
export function PageTransition({ children, className, routeKey }: { children: ReactNode; className?: string; routeKey: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const root = ref.current;
    if (!root || reduce) return;
    const host = root.querySelector(":scope > main") ?? root;
    const page = [...host.children].find((c) => c.tagName === "DIV");
    const sections = page ? [...page.children].filter((c) => c instanceof HTMLElement) : [];
    if (!sections.length) return;
    const controls = animate(sections, { opacity: [0, 1], y: [22, 0], rotateX: [5, 0], scale: [0.985, 1] }, { duration: 0.6, ease: EASE, delay: stagger(0.055) });
    return () => controls.stop();
  }, [routeKey, reduce]);
  return (
    <div ref={ref} className={cn("[perspective:1600px]", className)}>
      {children}
    </div>
  );
}

/**
 * Card that tilts toward the cursor with spring physics and a soft light sheen. Mouse only; on touch it just
 * presses down slightly when tapped.
 */
export function TiltCard({ children, className, max = 6, lift = 4, sheen = true }: { children: ReactNode; className?: string; max?: number; lift?: number; sheen?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const hover = useMotionValue(0);
  const rx = useSpring(useTransform(my, [0, 1], [max, -max]), SPRING);
  const ry = useSpring(useTransform(mx, [0, 1], [-max, max]), SPRING);
  const z = useSpring(useTransform(hover, [0, 1], [0, -lift]), SPRING);
  const sx = useTransform(mx, (v) => `${v * 100}%`);
  const sy = useTransform(my, (v) => `${v * 100}%`);
  const glow = useMotionTemplate`radial-gradient(420px circle at ${sx} ${sy}, rgba(255,255,255,.07), transparent 45%)`;
  const sheenOpacity = useSpring(hover, SPRING);

  return (
    <motion.div
      ref={ref}
      className={cn("relative h-full [transform-style:preserve-3d]", className)}
      style={{ rotateX: rx, rotateY: ry, y: z, transformPerspective: 900 }}
      whileTap={{ scale: 0.985 }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
        hover.set(1);
      }}
      onPointerLeave={() => {
        mx.set(0.5);
        my.set(0.5);
        hover.set(0);
      }}
    >
      {children}
      {sheen && <motion.span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ background: glow, opacity: sheenOpacity }} />}
    </motion.div>
  );
}

/**
 * Counts a formatted figure up from zero when it scrolls into view ("₹1,84,250", "4.82%", "342").
 * The final text is server-rendered, so it's correct without JS and for screen readers.
 */
export function CountUp({ value, className, duration = 1.1 }: { value: string; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -5% 0px" });
  const reduce = useReducedMotion();
  const [text, setText] = useState(value);
  useEffect(() => {
    const m = value.match(/-?[\d,]*\.?\d+/);
    if (!inView || reduce || !m) return setText(value);
    const raw = m[0];
    const target = Number(raw.replace(/,/g, ""));
    if (!Number.isFinite(target) || target === 0) return setText(value);
    const decimals = raw.includes(".") ? raw.split(".")[1].length : 0;
    const indian = /\d,\d{2},\d{3}/.test(raw) || value.includes("₹");
    const fmt = (n: number) => n.toLocaleString(indian ? "en-IN" : "en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: raw.includes(",") || target >= 1000 });
    const [pre, post] = [value.slice(0, m.index), value.slice((m.index ?? 0) + raw.length)];
    const c = animate(0, target, { duration, ease: EASE, onUpdate: (n) => setText(`${pre}${fmt(n)}${post}`) });
    return () => c.stop();
  }, [inView, reduce, value, duration]);
  return (
    <span ref={ref} className={className} aria-label={value}>
      <span aria-hidden>{text}</span>
    </span>
  );
}

/** A layer that drifts slowly up and down forever (ambient depth). */
export function Float({ children, className, distance = 10, duration = 7, delay = 0 }: { children?: ReactNode; className?: string; distance?: number; duration?: number; delay?: number }) {
  return (
    <motion.div className={className} animate={{ y: [0, -distance, 0] }} transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}>
      {children}
    </motion.div>
  );
}

/** Press/hover feedback for custom clickable surfaces. */
export function Press({ children, className, ...rest }: { children: ReactNode; className?: string } & HTMLMotionProps<"div">) {
  return (
    <motion.div className={className} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} transition={SPRING} {...rest}>
      {children}
    </motion.div>
  );
}
