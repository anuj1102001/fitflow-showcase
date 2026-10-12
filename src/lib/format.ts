/** Formatting helpers. Money is whole rupees, shown with Indian digit grouping. */

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
export const rupees = (n: number) => inr.format(Math.round(n));

/** ₹5.4L / ₹82K / ₹950 for chart axes and tight spaces. */
export function rupeesShort(n: number) {
  const a = Math.abs(n);
  if (a >= 1e7) return `₹${trim(n / 1e7)}Cr`;
  if (a >= 1e5) return `₹${trim(n / 1e5)}L`;
  if (a >= 1e3) return `₹${trim(n / 1e3)}K`;
  return `₹${Math.round(n)}`;
}
const trim = (n: number) => (Math.abs(n) >= 100 ? Math.round(n).toString() : n.toFixed(1).replace(/\.0$/, ""));

export const num = (n: number) => n.toLocaleString("en-IN");
export const pct = (n: number | null, digits = 1) => (n === null || !Number.isFinite(n) ? "–" : `${(n * 100).toFixed(digits).replace(/\.0$/, "")}%`);

export const DAY = 86_400_000;
export const startOfDay = (d: Date | string | number) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
export const addDays = (d: Date | string, n: number) => new Date(new Date(d).getTime() + n * DAY);
export const daysBetween = (a: Date | string, b: Date | string) => Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY);

const dShort = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });
const dLong = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short" });
const tFmt = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
const mFmt = new Intl.DateTimeFormat("en-IN", { month: "short" });
export const dateShort = (d: string | Date) => dShort.format(new Date(d));
export const dateLong = (d: string | Date) => dLong.format(new Date(d));
export const time = (d: string | Date) => tFmt.format(new Date(d)).replace(" ", " ").toLowerCase();
export const monthShort = (d: string | Date) => mFmt.format(new Date(d));

/** "just now", "3h ago", "yesterday", "4 days ago", else a date. */
export function ago(d: string | Date, now = Date.now()) {
  const ms = now - new Date(d).getTime();
  if (ms < 0) return relFuture(d, now);
  const m = Math.floor(ms / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = daysBetween(d, new Date(now));
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return dateShort(d);
}

/** "today", "tomorrow", "in 3 days", "overdue by 2 days". */
export function relDay(d: string | Date, now = Date.now()) {
  const diff = daysBetween(new Date(now), d);
  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  if (diff === -1) return "yesterday";
  if (diff < 0) return `${-diff} days overdue`;
  if (diff < 7) return `in ${diff} days`;
  return dateShort(d);
}
const relFuture = (d: string | Date, now: number) => relDay(d, now);

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;

export const uid = (prefix = "id") => `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`;
