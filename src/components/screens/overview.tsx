"use client";

import { motion } from "motion/react";
import { ArrowRight, BadgeIndianRupee, CalendarClock, CheckCircle2, Clock, MessageSquareText, Sparkles, Target, TrendingUp, Users, Video } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { SERIES, TrendChart } from "@/components/charts";
import { ProfileHero } from "@/components/app/profile-hero";
import { StatTile } from "@/components/app/stat";
import { EASE } from "@/components/motion/kit";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Avatar, Badge, DemoTag, Panel, Segmented } from "@/components/ui/kit";
import { insights, kpis, METRICS, pipelineValue, RANGES, series, type RangeId } from "@/lib/analytics";
import { ago, dateLong, firstName, pct, relDay, rupees, startOfDay, time } from "@/lib/format";
import { COACH } from "@/lib/seed";
import { IMAGES } from "@/lib/images";
import { buildQueue } from "@/lib/sequences";
import { TodayQueue } from "./today";
import { useDemo } from "@/lib/store";
import { STAGE_LABEL } from "@/lib/types";
import { useUI } from "@/lib/ui-store";

export function OverviewScreen() {
  const { leads, clients, offers, bookings, drafts, enrollments } = useDemo();
  const queue = useMemo(() => buildQueue({ leads, clients, enrollments }), [leads, clients, enrollments]);
  const openBookingForm = useUI((s) => s.openBookingForm);
  const [range, setRange] = useState<RangeId>("30d");
  const [metric, setMetric] = useState<"leads" | "revenue">("leads");
  const now = Date.now();

  const k = useMemo(() => kpis(leads, { range, source: "all" }), [leads, range]);
  const s = useMemo(() => series(leads, { range, source: "all" }), [leads, range]);
  const ins = useMemo(() => insights(leads, clients, offers), [leads, clients, offers]);
  const upcoming = bookings.filter((b) => new Date(b.start).getTime() + b.minutes * 60_000 >= now && b.status !== "cancelled").slice(0, 5);
  const activity = useMemo(
    () =>
      leads
        .flatMap((l) => l.notes.map((n) => ({ ...n, lead: l })))
        .filter((n) => new Date(n.at).getTime() <= now)
        .sort((a, b) => b.at.localeCompare(a.at))
        .slice(0, 7),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [leads],
  );
  const followUps = [...ins.overdue, ...ins.dueToday].sort((a, b) => (a.nextFollowUp ?? "").localeCompare(b.nextFollowUp ?? "")).slice(0, 5);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const todays = bookings.filter((b) => startOfDay(b.start).getTime() === startOfDay(new Date()).getTime() && b.status !== "cancelled");

  return (
    <div className="space-y-5">
      <ProfileHero
        photo={IMAGES.coachAarav}
        avatar={COACH.avatar}
        initials={COACH.name.split(" ").map((w) => w[0]).join("")}
        aside={
          <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-black/35 p-1.5 backdrop-blur-md">
            <DemoTag />
            <Segmented label="Date range" value={range} onChange={setRange} options={RANGES.map((r) => ({ id: r.id, label: r.label.replace(" days", "d").replace(" months", "m") }))} size="sm" />
          </div>
        }
      >
        <p className="text-[13px] font-medium text-white/75">{dateLong(new Date())}</p>
        <h2 className="mt-2 text-balance text-[40px] font-semibold leading-[1.02] tracking-[-0.04em] sm:text-[56px] lg:text-[64px]">
          {greeting}, {firstName(COACH.name)}.
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-white/85 sm:text-[16px]">
          {queue.length} {queue.length === 1 ? "person" : "people"} to follow up today · {todays.length ? `${todays.length} session${todays.length > 1 ? "s" : ""}` : "no sessions"} · {rupees(pipelineValue(leads))} in open pipeline
        </p>
      </ProfileHero>

      <TodayQueue />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile index={0} label="Total leads" icon={<Users size={14} />} value={k.cur.leads} delta={k.delta.leads} spark={s.map((b) => b.leads)} info={METRICS.leads} />
        <StatTile index={1} label="Qualified leads" icon={<Target size={14} />} value={k.cur.qualified} delta={k.delta.qualified} spark={s.map((b) => b.qualified)} info={METRICS.qualified} />
        <StatTile index={2} label="Conversion rate" icon={<TrendingUp size={14} />} value={k.cur.conversion} format="pct" delta={k.delta.conversion} deltaKind="points" info={METRICS.conversion} />
        <StatTile index={3} accent label="Revenue (sample)" icon={<BadgeIndianRupee size={14} />} value={k.cur.revenue} format="rupees" delta={k.delta.revenue} spark={s.map((b) => b.revenue)} info={METRICS.revenue} />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Performance"
          subtitle={metric === "leads" ? "New leads and clients won" : "Program fees from clients won (sample)"}
          action={<Segmented label="Chart metric" value={metric} onChange={setMetric} size="sm" options={[{ id: "leads", label: "Leads" }, { id: "revenue", label: "Revenue" }]} />}
        >
          {metric === "leads" ? (
            <TrendChart data={s} x="label" series={[{ key: "leads", name: "Leads", color: SERIES.lime }, { key: "won", name: "Clients won", color: SERIES.sky }]} />
          ) : (
            <TrendChart data={s} x="label" yFormat="rupees" series={[{ key: "revenue", name: "Revenue", color: SERIES.lime }]} />
          )}
          <div className="mt-5 border-t border-line pt-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[13px] font-medium text-fg-2">Open pipeline</p>
              <Link href="/app/leads" className="text-[12.5px] font-medium text-lime-fg hover:underline">
                Open board
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(["new", "contacted", "call", "proposal"] as const).map((st, i) => {
                const items = leads.filter((l) => l.stage === st);
                const total = leads.filter((l) => ["new", "contacted", "call", "proposal"].includes(l.stage)).length || 1;
                return (
                  <Link key={st} href={`/app/leads?view=list&stage=${st}`} className="group rounded-2xl border border-line bg-panel-2/40 p-3 transition hover:border-line-2 hover:bg-panel-2">
                    <p className="text-[12px] text-fg-3">{STAGE_LABEL[st]}</p>
                    <p className="mt-0.5 flex items-baseline gap-1.5">
                      <span className="font-display text-[20px] font-semibold tabular">{items.length}</span>
                      <span className="text-[12px] tabular text-fg-3">{rupees(items.reduce((a, l) => a + l.value, 0))}</span>
                    </p>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
                      <motion.div className="h-full rounded-full bg-s1" style={{ opacity: 1 - i * 0.18 }} initial={{ width: 0 }} animate={{ width: `${(items.length / total) * 100}%` }} transition={{ duration: 0.9, ease: EASE, delay: 0.2 + i * 0.06 }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </Panel>

        <Panel
          title={
            <span className="flex items-center gap-2">
              <Sparkles size={16} className="text-lime-fg" /> AI insights
            </span>
          }
          subtitle="Simulated from your sample data"
          action={
            <Link href="/app/assistant" className="text-[12.5px] font-medium text-lime-fg hover:underline">
              Ask more
            </Link>
          }
        >
          <ul className="space-y-2.5">
            {[
              ins.overdue.length > 0 && {
                tone: "warn" as const,
                title: `${ins.overdue.length} follow-ups are overdue`,
                body: `${ins.overdue.length > 2 ? `${ins.overdue.slice(0, 2).map((l) => firstName(l.name)).join(", ")} and ${ins.overdue.length - 2} more` : ins.overdue.map((l) => firstName(l.name)).join(" and ")} ${ins.overdue.length === 1 ? "is" : "are"} waiting to hear from you.`,
                href: "/app/leads?view=followups",
                cta: "Review",
              },
              ins.bestSource && {
                tone: "lime" as const,
                title: `${ins.bestSource.source} converts best`,
                body: `${pct(ins.bestSource.conversion, 0)} of ${ins.bestSource.source} leads became clients in the last 90 days${ins.topVolume && ins.topVolume.source !== ins.bestSource.source ? `, vs ${pct(ins.topVolume.conversion, 0)} for ${ins.topVolume.source}` : ""}.`,
                href: `/app/analytics?range=90d`,
                cta: "See sources",
              },
              ins.atRisk.length > 0 && {
                tone: "bad" as const,
                title: `${ins.atRisk.length} client${ins.atRisk.length > 1 ? "s" : ""} may be slipping`,
                body: "Adherence fell below 65% in recent check-ins. A quick call now protects renewals.",
                href: "/app/clients?status=at-risk",
                cta: "Open",
              },
              ins.staleProposals.length > 0 && {
                tone: "info" as const,
                title: `${ins.staleProposals.length} proposals are going quiet`,
                body: `${rupees(ins.staleProposals.reduce((a, l) => a + l.value, 0))} of sample pipeline hasn't been followed up in 3+ days.`,
                href: "/app/leads?stage=proposal",
                cta: "Nudge",
              },
            ]
              .filter(Boolean)
              .slice(0, 4)
              .map((x, i) => {
                const it = x as { tone: "warn" | "lime" | "bad" | "info"; title: string; body: string; href: string; cta: string };
                const dot = { warn: "bg-warn", lime: "bg-s1", bad: "bg-bad", info: "bg-info" }[it.tone];
                return (
                  <motion.li key={it.title} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.15 + i * 0.08 }}>
                    <Link href={it.href} className="group block rounded-2xl border border-line bg-panel-2/50 p-3.5 transition hover:border-line-2 hover:bg-panel-2">
                      <p className="flex items-center gap-2 text-[13.5px] font-semibold">
                        <span className={cn("h-1.5 w-1.5 rounded-full", dot)} aria-hidden />
                        {it.title}
                      </p>
                      <p className="mt-1 text-[13px] leading-relaxed text-fg-2">{it.body}</p>
                      <p className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-medium text-lime-fg">
                        {it.cta} <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
                      </p>
                    </Link>
                  </motion.li>
                );
              })}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <Panel
          title="Upcoming sessions"
          subtitle="Next on your calendar"
          action={
            <button onClick={() => openBookingForm()} className="text-[12.5px] font-medium text-lime-fg hover:underline">
              + Add
            </button>
          }
        >
          <ul className="space-y-1">
            {upcoming.map((b) => {
              const lead = leads.find((l) => l.id === b.leadId);
              return (
                <li key={b.id}>
                  <button onClick={() => openBookingForm({ booking: b })} className="flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition hover:bg-panel-2">
                    <div className="grid w-12 shrink-0 text-center">
                      <span className="text-[11px] uppercase tracking-wider text-fg-3">{relDay(b.start) === "today" ? "Today" : new Date(b.start).toLocaleDateString("en-IN", { weekday: "short" })}</span>
                      <span className="font-display text-[15px] font-semibold leading-tight">
                        {time(b.start).replace(/ ?(am|pm)/, "")}
                        <span className="ml-0.5 text-[10px] font-medium text-fg-3">{time(b.start).match(/am|pm/)?.[0]}</span>
                      </span>
                    </div>
                    <span className={cn("h-9 w-[3px] rounded-full", b.kind === "Discovery call" ? "bg-s1" : b.kind === "Check-in" ? "bg-info" : "bg-violet")} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium">{lead?.name ?? b.title}</p>
                      <p className="flex items-center gap-1.5 truncate text-[12.5px] text-fg-3">
                        {b.location.startsWith("In person") ? <Clock size={12} /> : <Video size={12} />} {b.kind} · {b.minutes} min
                      </p>
                    </div>
                    {b.status === "pending" && <Badge tone="warn">Pending</Badge>}
                  </button>
                </li>
              );
            })}
          </ul>
          <Link href="/app/bookings" className={buttonClass({ variant: "secondary", size: "sm" }, "mt-3 w-full")}>
            <CalendarClock size={15} /> Open calendar
          </Link>
        </Panel>

        <Panel title="Follow-ups due" subtitle="Overdue and due today" action={<Badge tone={ins.overdue.length ? "warn" : "ok"}>{ins.overdue.length + ins.dueToday.length}</Badge>}>
          {followUps.length === 0 ? (
            <p className="flex items-center gap-2 py-6 text-[14px] text-fg-2">
              <CheckCircle2 size={16} className="text-ok" /> All caught up.
            </p>
          ) : (
            <ul className="space-y-1">
              {followUps.map((l) => (
                <li key={l.id} className="flex items-center gap-3 rounded-2xl px-2 py-2.5 transition hover:bg-panel-2">
                  <Avatar name={l.name} size={34} />
                  <Link href={`/app/leads?lead=${l.id}`} className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium">{l.name}</p>
                    <p className={cn("truncate text-[12.5px]", relDay(l.nextFollowUp!).includes("overdue") ? "text-warn" : "text-fg-3")}>
                      {STAGE_LABEL[l.stage]} · {relDay(l.nextFollowUp!)}
                    </p>
                  </Link>
                  <Link href={`/app/follow-ups?lead=${l.id}`} className={buttonClass({ variant: "secondary", size: "sm" }, "h-8 px-3 text-[12px]")} aria-label={`Draft a follow-up for ${l.name}`}>
                    <Sparkles size={13} /> Draft
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {drafts.length > 0 && (
            <Link href="/app/follow-ups" className="mt-3 flex items-center gap-2 rounded-2xl border border-line px-3.5 py-2.5 text-[13px] text-fg-2 transition hover:border-line-2">
              <MessageSquareText size={14} className="text-lime-fg" />
              {drafts.filter((d) => d.status === "draft").length} saved draft{drafts.filter((d) => d.status === "draft").length === 1 ? "" : "s"} · last {ago(drafts[0]!.createdAt)}
              <ArrowRight size={13} className="ml-auto" />
            </Link>
          )}
        </Panel>

        <Panel title="Recent activity" subtitle="Across all leads" className="lg:col-span-2 xl:col-span-1">
          <ol className="relative space-y-3.5 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-line">
            {activity.map((a) => (
              <li key={a.id + a.lead.id} className="relative flex gap-3">
                <span className={cn("relative z-10 mt-0.5 grid h-[31px] w-[31px] shrink-0 place-items-center rounded-full border bg-panel", a.kind === "note" ? "border-info/30 text-info" : "border-line-2 text-fg-3")}>
                  {a.kind === "note" ? <MessageSquareText size={13} /> : <span className="h-1.5 w-1.5 rounded-full bg-s1" />}
                </span>
                <Link href={`/app/leads?lead=${a.lead.id}`} className="min-w-0 flex-1 rounded-xl transition hover:opacity-80">
                  <p className="text-[13.5px] leading-snug">
                    <span className="font-medium">{a.lead.name}</span> <span className="text-fg-2">· {a.text}</span>
                  </p>
                  <p className="mt-0.5 text-[12px] text-fg-3">{ago(a.at)}</p>
                </Link>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </div>
  );
}
