"use client";

import { useEffect, useState } from "react";
import { flushSync } from "react-dom";

/** Theme preference: an explicit choice, or follow the operating system. Stored in localStorage. */
export type ThemePref = "light" | "dark" | "system";
export const THEME_KEY = "ff-theme";

/** Runs in <head> before first paint so the page never flashes the wrong theme. */
export const THEME_SCRIPT = `(function(){try{var p=localStorage.getItem("${THEME_KEY}")||"system";var d=p==="dark"||(p==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;

const listeners = new Set<() => void>();

export function readPref(): ThemePref {
  try {
    const p = localStorage.getItem(THEME_KEY);
    return p === "light" || p === "dark" ? p : "system";
  } catch {
    return "system";
  }
}

export function resolve(p: ThemePref): "light" | "dark" {
  if (p !== "system") return p;
  return typeof matchMedia !== "undefined" && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

type Origin = { x: number; y: number };

/**
 * Switch theme. With an origin (the toggle's position), the new theme spreads out from it as a
 * soft-edged wave (View Transitions API: one composited animation, so nothing lags or changes out
 * of step). Reduced motion gets a short crossfade; browsers without View Transitions get a quick
 * colour fade. The choice is saved and applied before first paint on the next visit.
 */
export function setPref(p: ThemePref, origin?: Origin) {
  try {
    localStorage.setItem(THEME_KEY, p);
  } catch {}
  const root = document.documentElement;
  const dark = resolve(p) === "dark";
  const notify = () => flushSync(() => listeners.forEach((l) => l()));
  if (root.classList.contains("dark") === dark) return notify(); // e.g. System → Dark while already dark

  // Apply the new theme in one step; transitions are held off so the "after" picture is final.
  const swap = () => {
    const stop = document.createElement("style");
    stop.textContent = "*,*::before,*::after{transition:none!important}";
    document.head.appendChild(stop);
    root.classList.toggle("dark", dark);
    notify();
    void getComputedStyle(document.body).color;
    requestAnimationFrame(() => requestAnimationFrame(() => stop.remove()));
  };

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> } };
  if (!doc.startViewTransition) {
    // Fallback: a short coordinated colour fade.
    if (reduce) return swap();
    root.classList.add("theme-fade");
    root.classList.toggle("dark", dark);
    notify();
    window.setTimeout(() => root.classList.remove("theme-fade"), 450);
    return;
  }

  const { x, y } = origin ?? { x: innerWidth / 2, y: 0 };
  const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 120;
  root.style.setProperty("--vt-x", `${x}px`);
  root.style.setProperty("--vt-y", `${y}px`);
  root.style.setProperty("--vt-end", `${end}px`);
  root.dataset.themeTransition = reduce ? "fade" : "wave";
  const t = doc.startViewTransition(swap);
  t.finished.finally(() => delete root.dataset.themeTransition);
}

/** Current preference and resolved theme; re-renders on change and when the OS theme flips. */
export function useTheme() {
  const [pref, setP] = useState<ThemePref>("system");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const sync = () => {
      const p = readPref();
      setP(p);
      setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    };
    sync();
    listeners.add(sync);
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onOs = () => {
      if (readPref() === "system") document.documentElement.classList.toggle("dark", mq.matches);
      sync();
    };
    mq.addEventListener("change", onOs);
    return () => {
      listeners.delete(sync);
      mq.removeEventListener("change", onOs);
    };
  }, []);
  return { pref, theme, setPref };
}
