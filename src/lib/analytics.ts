import { addDays, DAY, monthShort, startOfDay } from "./format";
import { SOURCES, type Client, type Lead, type Offer, type Source } from "./types";

/**
 * Pure analytics over the demo data. Every chart and KPI goes through here so the dashboard, analytics
 * page and assistant always agree. Definitions are shown in the UI (METRICS).
 */

export const RANGES = [
  { id: "7d", label: "7 days", days: 7 },
  { id: "30d", label: "30 days", days: 30 },
  { id: "90d", label: "90 days", days: 90 },
  { id: "12m", label: "12 months", days: 365 },
] as const;
export type RangeId = (typeof RANGES)[number]["id"];

export const METRICS = {
  leads: "People who enquired or were added as a lead in the period.",
  qualified: "Leads from the period who reached a discovery call or further.",
  conversion: "Clients won in the period ÷ leads created in the period.",
  revenue: "Program fees from clients won in the period (sample data, not real income).",
} as const;

type Filter = { range: RangeId; source: Source | "all"; now?: number };
export type Bucket = { key: string; label: string; leads: number; qualified: number; won: number; revenue: number };

const ms = (d?: string) => (d ? new Date(d).getTime() : NaN);

export function rangeBounds(range: RangeId, now = Date.now()) {
  const days = RANGES.find((r) => r.id === range)!.days;
  const end = now;
  const start = startOfDay(addDays(new Date(now), -(days - 1))).getTime();
  const prevStart = start - days * DAY;
  return { start, end, prevStart, days };
}

export function kpis(leads: Lead[], f: Filter) {
  const now = f.now ?? Date.now();
  const { start, end, prevStart } = rangeBounds(f.range, now);
  const pool = f.source === "all" ? leads : leads.filter((l) => l.source === f.source);
  const calc = (a: number, b: number) => {
    const created = pool.filter((l) => ms(l.createdAt) >= a && ms(l.createdAt) <= b);
    const won = pool.filter((l) => ms(l.wonAt) >= a && ms(l.wonAt) <= b);
    return {
      leads: created.length,
      qualified: created.filter((l) => l.reached >= 2).length,
      won: won.length,
      revenue: won.reduce((s, l) => s + l.value, 0),
      conversion: created.length ? won.length / created.length : null,
    };
  };
  const cur = calc(start, end);
  const prev = calc(prevStart, start - 1);
  const delta = (a: number | null, b: number | null) => (a === null || b === null || b === 0 ? null : (a - b) / b);
  return {
    cur,
    prev,
    delta: {
      leads: delta(cur.leads, prev.leads),
      qualified: delta(cur.qualified, prev.qualified),
      won: delta(cur.won, prev.won),
      revenue: delta(cur.revenue, prev.revenue),
      conversion: cur.conversion !== null && prev.conversion !== null ? cur.conversion - prev.conversion : null,
    },
  };
}

/** Time series: daily for 7 days, 3-day buckets for 30 days, weekly for 90 days, monthly for 12 months. */
export function series(leads: Lead[], f: Filter): Bucket[] {
  const now = f.now ?? Date.now();
  const { start, days } = rangeBounds(f.range, now);
  const pool = f.source === "all" ? leads : leads.filter((l) => l.source === f.source);
  const buckets: (Bucket & { from: number; to: number })[] = [];
  if (f.range === "12m") {
    const d = new Date(now);
    for (let i = 11; i >= 0; i--) {
      const from = new Date(d.getFullYear(), d.getMonth() - i, 1).getTime();
      const to = new Date(d.getFullYear(), d.getMonth() - i + 1, 1).getTime() - 1;
      buckets.push({ key: `m${i}`, label: monthShort(new Date(from)), from, to, leads: 0, qualified: 0, won: 0, revenue: 0 });
    }
  } else {
    const step = f.range === "90d" ? 7 : f.range === "30d" ? 3 : 1;
    for (let t = start; t <= now; t += step * DAY) {
      const from = t;
      const to = Math.min(t + step * DAY - 1, now);
      const label = new Date(from).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      buckets.push({ key: String(from), label, from, to, leads: 0, qualified: 0, won: 0, revenue: 0 });
    }
    void days;
  }
  for (const l of pool) {
    const c = ms(l.createdAt);
    const b = buckets.find((x) => c >= x.from && c <= x.to);
    if (b) {
      b.leads++;
      if (l.reached >= 2) b.qualified++;
    }
    const w = ms(l.wonAt);
    const bw = Number.isFinite(w) ? buckets.find((x) => w >= x.from && w <= x.to) : undefined;
    if (bw) {
      bw.won++;
      bw.revenue += l.value;
    }
  }
  return buckets.map(({ from: _f, to: _t, ...b }) => b);
}

export const FUNNEL_STEPS = ["Leads", "Contacted", "Call booked", "Proposal sent", "Won"] as const;

/** Cohort funnel: of the leads created in the period, how many reached each stage (so far). */
export function funnel(leads: Lead[], f: Filter) {
  const now = f.now ?? Date.now();
  const { start, end } = rangeBounds(f.range, now);
  const pool = leads.filter((l) => (f.source === "all" || l.source === f.source) && ms(l.createdAt) >= start && ms(l.createdAt) <= end);
  return FUNNEL_STEPS.map((step, i) => {
    const count = pool.filter((l) => l.reached >= i).length;
    return { step, count, rate: pool.length ? count / pool.length : null };
  });
}

export function bySource(leads: Lead[], f: Omit<Filter, "source">) {
  const now = f.now ?? Date.now();
  const { start, end } = rangeBounds(f.range, now);
  return SOURCES.map((source) => {
    const created = leads.filter((l) => l.source === source && ms(l.createdAt) >= start && ms(l.createdAt) <= end);
    const won = leads.filter((l) => l.source === source && ms(l.wonAt) >= start && ms(l.wonAt) <= end);
    return { source, leads: created.length, won: won.length, revenue: won.reduce((s, l) => s + l.value, 0), conversion: created.length ? won.length / created.length : null };
  }).sort((a, b) => b.leads - a.leads);
}

export function byOffer(leads: Lead[], offers: Offer[], f: Filter) {
  const now = f.now ?? Date.now();
  const { start, end } = rangeBounds(f.range, now);
  const pool = f.source === "all" ? leads : leads.filter((l) => l.source === f.source);
  return offers
    .map((o) => {
      const created = pool.filter((l) => l.offerId === o.id && ms(l.createdAt) >= start && ms(l.createdAt) <= end);
      const won = pool.filter((l) => l.offerId === o.id && ms(l.wonAt) >= start && ms(l.wonAt) <= end);
      return { id: o.id, title: o.title, price: o.price, status: o.status, leads: created.length, won: won.length, revenue: won.reduce((s, l) => s + l.value, 0), conversion: created.length ? won.length / created.length : null };
    })
    .sort((a, b) => b.revenue - a.revenue || b.leads - a.leads);
}

/** Last six calendar months side by side (independent of the range filter). */
export function monthly(leads: Lead[], source: Source | "all", now = Date.now()) {
  return series(leads, { range: "12m", source, now }).slice(-6);
}

/** Things worth acting on, computed from the data (shown as "AI insights" and used by the assistant). */
export function insights(leads: Lead[], clients: Client[], offers: Offer[], now = Date.now()) {
  const today = startOfDay(new Date(now)).getTime();
  const active = leads.filter((l) => !["won", "lost"].includes(l.stage));
  const overdue = active.filter((l) => l.nextFollowUp && ms(l.nextFollowUp) < today);
  const dueToday = active.filter((l) => l.nextFollowUp && ms(l.nextFollowUp) >= today && ms(l.nextFollowUp) < today + DAY);
  const staleProposals = active.filter((l) => l.stage === "proposal" && now - ms(l.lastContactAt ?? l.createdAt) > 3 * DAY);
  const sources90 = bySource(leads, { range: "90d", now }).filter((s) => s.leads >= 6);
  const bestSource = [...sources90].sort((a, b) => (b.conversion ?? 0) - (a.conversion ?? 0))[0];
  const topVolume = [...sources90].sort((a, b) => b.leads - a.leads)[0];
  const atRisk = clients.filter((c) => c.status === "at-risk");
  const attention = clients.filter((c) => c.status === "attention");
  const offers90 = byOffer(leads, offers, { range: "90d", source: "all", now });
  const bestOffer = offers90[0];
  const m = monthly(leads, "all", now);
  const thisMonth = m[m.length - 1]!;
  const lastMonth = m[m.length - 2]!;
  return { active, overdue, dueToday, staleProposals, bestSource, topVolume, atRisk, attention, bestOffer, thisMonth, lastMonth, sources90 };
}

export function pipelineValue(leads: Lead[]) {
  return leads.filter((l) => ["new", "contacted", "call", "proposal"].includes(l.stage)).reduce((s, l) => s + l.value, 0);
}
