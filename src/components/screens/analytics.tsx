"use client";

import { BadgeIndianRupee, Info, RotateCcw, Target, TrendingUp, Users } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { BarsChart, Donut, FunnelChart, SERIES, SOURCE_COLOR, TrendChart } from "@/components/charts";
import { StatTile } from "@/components/app/stat";
import { cn } from "@/components/ui/cn";
import { Badge, DemoTag, Panel, Segmented } from "@/components/ui/kit";
import { byOffer, bySource, funnel, kpis, METRICS, monthly, RANGES, series, type RangeId } from "@/lib/analytics";
import { num, pct, rupees } from "@/lib/format";
import { useDemo } from "@/lib/store";
import { SOURCES, type Source } from "@/lib/types";

export function AnalyticsScreen() {
  const leads = useDemo((s) => s.leads);
  const offers = useDemo((s) => s.offers);
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const range = (RANGES.some((r) => r.id === params.get("range")) ? params.get("range") : "90d") as RangeId;
  const sourceParam = params.get("source");
  const source: Source | "all" = (SOURCES as readonly string[]).includes(sourceParam ?? "") ? (sourceParam as Source) : "all";
  const [monthMetric, setMonthMetric] = useState<"leads" | "revenue">("leads");

  const set = (k: string, v: string | null) => {
    const p = new URLSearchParams(params.toString());
    if (v === null) p.delete(k);
    else p.set(k, v);
    router.replace(`${path}${p.size ? `?${p}` : ""}`, { scroll: false });
  };
  const f = { range, source };
  const k = useMemo(() => kpis(leads, f), [leads, range, source]); // eslint-disable-line react-hooks/exhaustive-deps
  const s = useMemo(() => series(leads, f), [leads, range, source]); // eslint-disable-line react-hooks/exhaustive-deps
  const fn = useMemo(() => funnel(leads, f), [leads, range, source]); // eslint-disable-line react-hooks/exhaustive-deps
  const src = useMemo(() => bySource(leads, { range }), [leads, range]);
  const off = useMemo(() => byOffer(leads, offers, f), [leads, offers, range, source]); // eslint-disable-line react-hooks/exhaustive-deps
  const mon = useMemo(() => monthly(leads, source), [leads, source]);
  const rangeLabel = RANGES.find((r) => r.id === range)!.label;
  const totalSrc = src.reduce((a, x) => a + x.leads, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Segmented label="Date range" value={range} onChange={(v) => set("range", v === "90d" ? null : v)} options={RANGES.map((r) => ({ id: r.id, label: r.label }))} />
          <select value={source} onChange={(e) => set("source", e.target.value === "all" ? null : e.target.value)} aria-label="Lead source" className="h-10 rounded-lg border border-line bg-panel px-3.5 text-[13px] text-fg-2 focus:outline-none [&>option]:bg-panel">
            <option value="all">All sources</option>
            {SOURCES.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          {(range !== "90d" || source !== "all") && (
            <button onClick={() => router.replace(path, { scroll: false })} className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-[13px] text-fg-3 transition hover:text-fg">
              <RotateCcw size={13} /> Reset
            </button>
          )}
        </div>
        <DemoTag>Illustrative sample data · not real business results</DemoTag>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile index={0} label="Leads" icon={<Users size={14} />} value={k.cur.leads} delta={k.delta.leads} info={METRICS.leads} />
        <StatTile index={1} label="Qualified leads" icon={<Target size={14} />} value={k.cur.qualified} delta={k.delta.qualified} info={METRICS.qualified} />
        <StatTile index={2} label="Conversion rate" icon={<TrendingUp size={14} />} value={k.cur.conversion} format="pct" delta={k.delta.conversion} deltaKind="points" info={METRICS.conversion} />
        <StatTile index={3} accent label="Revenue (sample)" icon={<BadgeIndianRupee size={14} />} value={k.cur.revenue} format="rupees" delta={k.delta.revenue} info={METRICS.revenue} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Lead acquisition" subtitle={`New and qualified leads · ${rangeLabel}${source !== "all" ? ` · ${source}` : ""}`}>
          <TrendChart data={s} x="label" series={[{ key: "leads", name: "Leads", color: SERIES.lime }, { key: "qualified", name: "Qualified", color: SERIES.sky }]} />
        </Panel>
        <Panel title="Revenue trend" subtitle={`Program fees from clients won · ${rangeLabel}`}>
          <BarsChart data={s} x="label" yFormat="rupees" series={[{ key: "revenue", name: "Revenue", color: SERIES.lime }]} height={260} />
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <Panel title="Conversion funnel" subtitle={`Leads created in the last ${rangeLabel.toLowerCase()} and how far they got`} action={<Badge tone="lime">{pct(fn[4]?.rate ?? null)} overall</Badge>}>
          <FunnelChart steps={fn} />
          <p className="mt-4 flex items-start gap-1.5 text-[12px] leading-relaxed text-fg-3">
            <Info size={13} className="mt-0.5 shrink-0" /> Recent leads may still be moving through the pipeline, so short ranges understate final conversion.
          </p>
        </Panel>

        <Panel title="Lead sources" subtitle={`Share of leads and how each converts · ${rangeLabel}`}>
          <div className="grid items-center gap-5 sm:grid-cols-[200px_minmax(0,1fr)]">
            <Donut data={src.filter((x) => x.leads > 0).map((x) => ({ name: x.source, value: x.leads, color: SOURCE_COLOR[x.source]! }))} center={{ value: num(totalSrc), label: "leads" }} />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[340px] text-[13px]">
                <thead>
                  <tr className="text-left text-[11.5px] text-fg-3">
                    <th className="pb-2 font-medium">Source</th>
                    <th className="pb-2 text-right font-medium">Leads</th>
                    <th className="pb-2 text-right font-medium">Won</th>
                    <th className="pb-2 text-right font-medium">Conv.</th>
                    <th className="pb-2 text-right font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {src.map((x) => {
                    const best = x.conversion !== null && x.conversion === Math.max(...src.filter((y) => y.leads >= 5).map((y) => y.conversion ?? 0));
                    return (
                      <tr key={x.source} onClick={() => set("source", source === x.source ? null : x.source)} className={cn("cursor-pointer border-t border-line/70 transition hover:bg-panel-2/50", source === x.source && "bg-lime/[.05]")}>
                        <td className="py-2.5">
                          <span className="flex items-center gap-2 font-medium">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ background: SOURCE_COLOR[x.source] }} />
                            {x.source}
                          </span>
                        </td>
                        <td className="py-2.5 text-right tabular">{x.leads}</td>
                        <td className="py-2.5 text-right tabular">{x.won}</td>
                        <td className={cn("py-2.5 text-right tabular", best && "font-semibold text-lime-fg")}>{pct(x.conversion, 0)}</td>
                        <td className="py-2.5 text-right tabular text-fg-2">{rupees(x.revenue)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="mt-2 text-[11.5px] text-fg-3">Click a row to filter the whole page by that source.</p>
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Offer performance" subtitle={`${rangeLabel}${source !== "all" ? ` · ${source}` : ""}`}>
          <ul className="space-y-3.5">
            {off.map((o) => {
              const max = Math.max(1, ...off.map((x) => x.revenue));
              return (
                <li key={o.id}>
                  <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 text-[13px]">
                    <span className="flex items-center gap-2 font-medium">
                      {o.title}
                      {o.status === "draft" && <Badge className="h-5 text-[10.5px]">Draft</Badge>}
                    </span>
                    <span className="tabular text-fg-3">
                      {o.leads} leads · {o.won} won · <span className="text-fg-2">{pct(o.conversion, 0)}</span> · <span className="font-semibold text-fg">{rupees(o.revenue)}</span>
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-line">
                    <div className="h-full rounded-full bg-gradient-to-r from-lime/70 to-lime transition-[width] duration-700 ease-soft" style={{ width: `${(o.revenue / max) * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
        <Panel
          title="Monthly comparison"
          subtitle={`Last six calendar months${source !== "all" ? ` · ${source}` : ""}`}
          action={<Segmented label="Monthly metric" size="sm" value={monthMetric} onChange={setMonthMetric} options={[{ id: "leads", label: "Leads & won" }, { id: "revenue", label: "Revenue" }]} />}
        >
          {monthMetric === "leads" ? (
            <BarsChart data={mon} x="label" height={240} series={[{ key: "leads", name: "Leads", color: SERIES.lime }, { key: "won", name: "Clients won", color: SERIES.sky }]} />
          ) : (
            <BarsChart data={mon} x="label" height={240} yFormat="rupees" series={[{ key: "revenue", name: "Revenue", color: SERIES.lime }]} />
          )}
        </Panel>
      </div>

      <section className="card-2 p-5">
        <p className="mb-3 text-[13px] font-semibold">How these numbers are calculated</p>
        <dl className="grid gap-3 text-[13px] sm:grid-cols-2">
          {Object.entries(METRICS).map(([k, v]) => (
            <div key={k}>
              <dt className="font-medium capitalize text-fg-2">{k === "revenue" ? "Revenue (sample)" : k}</dt>
              <dd className="text-fg-3">{v}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
