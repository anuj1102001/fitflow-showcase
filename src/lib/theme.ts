"use client";

import { useEffect, useState } from "react";

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

export function setPref(p: ThemePref) {
  try {
    localStorage.setItem(THEME_KEY, p);
  } catch {}
  const root = document.documentElement;
  root.classList.add("theming");
  root.classList.toggle("dark", resolve(p) === "dark");
  window.setTimeout(() => root.classList.remove("theming"), 320);
  listeners.forEach((l) => l());
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
