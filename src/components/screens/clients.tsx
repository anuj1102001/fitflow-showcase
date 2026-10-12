"use client";

import { AnimatePresence, motion } from "motion/react";
import { CalendarPlus, ClipboardCheck, Frown, HeartPulse, Meh, Search, Smile, SmilePlus, Target, Annoyed } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { BarsChart, SERIES } from "@/components/charts";
import { EASE } from "@/components/motion/kit";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Field, Textarea } from "@/components/ui/field";
import { Avatar, Badge, Bar, DemoTag, Empty, Panel, ProgressRing, Segmented, type Tone } from "@/components/ui/kit";
import { useToast } from "@/components/ui/toast";
import { ago, DAY, dateShort, relDay } from "@/lib/format";
import { useDemo } from "@/lib/store";
import type { CheckIn, Client, ClientStatus } from "@/lib/types";
import { useUI } from "@/lib/ui-store";

const STATUS: Record<ClientStatus, { label: string; tone: Tone }> = {
  "on-track": { label: "On track", tone: "ok" },
  attention: { label: "Needs attention", tone: "warn" },
  "at-risk": { label: "At risk", tone: "bad" },
};
const MOODS = [
  { v: 1, icon: <Frown size={18} />, label: "Rough" },
  { v: 2, icon: <Annoyed size={18} />, label: "Low" },
  { v: 3, icon: <Meh size={18} />, label: "Okay" },
  { v: 4, icon: <Smile size={18} />, label: "Good" },
  { v: 5, icon: <SmilePlus size={18} />, label: "Great" },
] as const;

export function ClientsScreen() {
  const clients = useDemo((s) => s.clients);
  const leads = useDemo((s) => s.leads);
  const offers = useDemo((s) => s.offers);
  const params = useSearchParams();
  const router = useRouter();
  const [filter, setFilter] = useState<ClientStatus | "all">((params.get("status") as ClientStatus) ?? "all");
  const [q, setQ] = useState("");

  const rows = useMemo(
    () =>
      clients
        .map((c) => ({ c, lead: leads.find((l) => l.id === c.leadId), offer: offers.find((o) => o.id === c.offerId) }))
        .filter((r) => r.lead)
        .sort((a, b) => ["at-risk", "attention", "on-track"].indexOf(a.c.status) - ["at-risk", "attention", "on-track"].indexOf(b.c.status) || a.lead!.name.localeCompare(b.lead!.name)),
    [clients, leads, offers],
  );
  const shown = rows.filter((r) => (filter === "all" || r.c.status === filter) && (!q || r.lead!.name.toLowerCase().includes(q.toLowerCase())));
  const selectedId = params.get("client") ?? shown[0]?.c.id;
  const sel = rows.find((r) => r.c.id === selectedId);
  const count = (s: ClientStatus) => rows.filter((r) => r.c.status === s).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="-mx-1 overflow-x-auto px-1 scrollbar-none">
          <Segmented
            label="Filter clients"
            value={filter}
            onChange={setFilter}
            options={[
              { id: "all", label: `All · ${rows.length}` },
              { id: "on-track", label: `On track · ${count("on-track")}` },
              { id: "attention", label: `Attention · ${count("attention")}` },
              { id: "at-risk", label: `At risk · ${count("at-risk")}` },
            ]}
          />
        </div>
        <div className="flex items-center gap-2">
          <DemoTag>Fictional clients</DemoTag>
          <div className="relative w-full md:w-60">
            <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-3" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clients…" aria-label="Search clients" className="h-10 w-full rounded-full border border-line bg-panel pl-9 pr-3 text-[13.5px] placeholder:text-fg-3 focus:border-lime/50 focus:outline-none" />
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <Empty icon={<HeartPulse size={20} />} title="No active clients yet" body="When you mark a lead as Won, a client profile is created here automatically." />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          <ul className="space-y-2 lg:max-h-[calc(100dvh-220px)] lg:overflow-y-auto lg:pr-1">
            {shown.length === 0 && <li className="card-2 p-6 text-center text-[13.5px] text-fg-3">No clients match.</li>}
            {shown.map(({ c, lead, offer }, i) => {
              const elapsed = progressOf(c);
              const last = c.checkIns[0];
              return (
                <motion.li key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i, 10) * 0.03, duration: 0.35, ease: EASE }}>
                  <button
                    onClick={() => router.replace(`/app/clients?client=${c.id}`, { scroll: false })}
                    aria-current={c.id === selectedId}
                    className={cn("flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition", c.id === selectedId ? "border-lime/40 bg-panel shadow-card" : "border-line bg-panel/50 hover:border-line-2 hover:bg-panel")}
                  >
                    <div className="relative">
                      <ProgressRing value={elapsed} size={46} stroke={3} label={`${Math.round(elapsed * 100)}% through program`} />
                      <span className="absolute inset-0 grid place-items-center">
                        <Avatar name={lead!.name} size={34} />
                      </span>
                    </div>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-[14px] font-semibold">{lead!.name}</span>
                        <span className={cn("h-2 w-2 shrink-0 rounded-full", { "on-track": "bg-ok", attention: "bg-warn", "at-risk": "bg-bad" }[c.status])} aria-label={STATUS[c.status].label} />
                      </span>
                      <span className="block truncate text-[12.5px] text-fg-3">{offer?.title}</span>
                      <span className="mt-0.5 block text-[12px] text-fg-3">{last ? `Last check-in ${last.adherence}% · ${ago(last.date)}` : "Starting this week"}</span>
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </ul>
          <AnimatePresence mode="wait">{sel && <ClientDetail key={sel.c.id} client={sel.c} name={sel.lead!.name} goal={sel.lead!.goal} program={sel.offer?.title ?? "Program"} weeks={sel.offer?.weeks ?? 12} />}</AnimatePresence>
        </div>
      )}
    </div>
  );
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const progressOf = (c: Client) => Math.max(0, Math.min(1, (Date.now() - new Date(c.startDate).getTime()) / (new Date(c.endDate).getTime() - new Date(c.startDate).getTime())));

function ClientDetail({ client, name, goal, program, weeks }: { client: Client; name: string; goal: string; program: string; weeks: number }) {
  const setStatus = useDemo((s) => s.setClientStatus);
  const addCheckIn = useDemo((s) => s.addCheckIn);
  const bookings = useDemo((s) => s.bookings);
  const openBookingForm = useUI((s) => s.openBookingForm);
  const toast = useToast();
  const [adherence, setAdherence] = useState(85);
  const [mood, setMood] = useState<CheckIn["mood"]>(4);
  const [note, setNote] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const week = Math.min(weeks, Math.floor((Date.now() - new Date(client.startDate).getTime()) / (7 * DAY)) + 1);
  const avg = client.checkIns.length ? Math.round(client.checkIns.reduce((a, c) => a + c.adherence, 0) / client.checkIns.length) : null;
  const next = bookings.find((b) => b.leadId === client.leadId && new Date(b.start).getTime() > Date.now() && b.status !== "cancelled");
  const phase = Math.min(client.plan.length - 1, Math.floor(progressOf(client) * client.plan.length));
  const chart = [...client.checkIns].reverse().map((c, i) => ({ label: `W${i + 1}`, adherence: c.adherence }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (note.trim().length < 3) return setErr("Add a short note about the week.");
    setErr(null);
    addCheckIn(client.id, { date: new Date().toISOString(), adherence, mood, note: note.trim() });
    setNote("");
    toast({ tone: "success", title: "Check-in logged", body: `${name.split(" ")[0]}'s status updates from their last two check-ins.` });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: EASE }} className="min-w-0 space-y-5">
      <section className="card relative overflow-hidden p-5 sm:p-6">
        <div className="lime-glow pointer-events-none absolute -right-20 -top-24 h-64 w-64 opacity-50" aria-hidden />
        <div className="relative flex flex-wrap items-start gap-4">
          <Avatar name={name} size={56} />
          <div className="min-w-0 flex-1">
            <h2 className="text-[22px] font-semibold">{name}</h2>
            <p className="text-[13.5px] text-fg-2">
              {program} · {dateShort(client.startDate)} – {dateShort(client.endDate)}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-[13px] text-fg-3">
              <Target size={13} /> {goal}
            </p>
          </div>
          <label className="flex items-center gap-2">
            <span className="sr-only">Status</span>
            <select value={client.status} onChange={(e) => (setStatus(client.id, e.target.value as ClientStatus), toast({ tone: "success", title: "Status updated" }))} className="h-9 rounded-full border border-line bg-panel-2 px-3 text-[13px] focus:outline-none [&>option]:bg-panel">
              {Object.entries(STATUS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
            <Badge tone={STATUS[client.status].tone} dot>
              {STATUS[client.status].label}
            </Badge>
          </label>
        </div>
        <div className="relative mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { k: "Program week", v: `${week} of ${weeks}` },
            { k: "Avg. adherence", v: avg === null ? "–" : `${avg}%` },
            { k: "Check-ins", v: String(client.checkIns.length) },
            { k: "Next session", v: next ? cap(relDay(next.start)) : "None booked" },
          ].map((s) => (
            <div key={s.k} className="rounded-2xl border border-line bg-panel-2/40 px-3.5 py-3">
              <p className="text-[12px] text-fg-3">{s.k}</p>
              <p className="mt-0.5 font-display text-[18px] font-semibold">{s.v}</p>
            </div>
          ))}
        </div>
        <div className="relative mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => openBookingForm({ leadId: client.leadId })}>
            <CalendarPlus size={14} /> Book a session
          </Button>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Progress" subtitle="Start → now → target">
          <ul className="space-y-4">
            {client.metrics.map((m) => {
              const span = m.target - m.start;
              const p = span === 0 ? 1 : (m.current - m.start) / span;
              return (
                <li key={m.label}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-2 text-[13px]">
                    <span className="text-fg-2">{m.label}</span>
                    <span className="tabular">
                      <span className="text-fg-3">{m.start}</span>
                      <span className="mx-1.5 text-fg-3">→</span>
                      <span className="font-semibold">{m.current}</span>
                      <span className="text-fg-3">
                        {" "}
                        / {m.target}
                        {m.unit && ` ${m.unit}`}
                      </span>
                    </span>
                  </div>
                  <Bar value={p} tone={p >= 0.5 ? "lime" : p >= 0.2 ? "ok" : "warn"} />
                </li>
              );
            })}
          </ul>
        </Panel>
        <Panel title="Weekly adherence" subtitle="Share of planned sessions completed">
          {chart.length ? <BarsChart data={chart} x="label" height={190} yMax={100} series={[{ key: "adherence", name: "Adherence %", color: SERIES.lime }]} /> : <p className="py-10 text-center text-[13.5px] text-fg-3">No check-ins yet. Log the first one below.</p>}
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Coaching plan">
          <ol className="space-y-2.5">
            {client.plan.map((p, i) => (
              <li key={p} className={cn("flex gap-3 rounded-2xl border p-3.5 text-[13.5px]", i === phase ? "border-lime/40 bg-lime/[.05]" : "border-line", i < phase && "opacity-60")}>
                <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11.5px] font-semibold", i < phase ? "bg-ok/20 text-ok" : i === phase ? "bg-lime text-lime-ink" : "bg-panel-2 text-fg-3")}>{i + 1}</span>
                <span className="leading-snug">
                  {p}
                  {i === phase && <span className="ml-2 text-[11.5px] font-medium text-lime">Current phase</span>}
                </span>
              </li>
            ))}
          </ol>
        </Panel>
        <Panel title="Log a check-in" subtitle="Quick weekly review">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-[13px]">
                <label htmlFor="adh" className="font-medium text-fg-2">
                  Sessions completed
                </label>
                <span className="font-display text-[16px] font-semibold tabular">{adherence}%</span>
              </div>
              <input id="adh" type="range" min={0} max={100} step={5} value={adherence} onChange={(e) => setAdherence(Number(e.target.value))} className="w-full accent-[rgb(var(--lime))]" />
            </div>
            <div>
              <p className="mb-2 text-[13px] font-medium text-fg-2">How did the week feel?</p>
              <div className="flex gap-2" role="radiogroup" aria-label="Mood">
                {MOODS.map((m) => (
                  <button key={m.v} type="button" role="radio" aria-checked={mood === m.v} aria-label={m.label} onClick={() => setMood(m.v)} className={cn("grid h-10 flex-1 place-items-center rounded-xl border transition", mood === m.v ? "border-lime bg-lime/15 text-lime" : "border-line text-fg-3 hover:border-line-2 hover:text-fg")}>
                    {m.icon}
                  </button>
                ))}
              </div>
            </div>
            <Field label="Note" htmlFor="ci-note" error={err ?? undefined}>
              <Textarea id="ci-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Wins, struggles, anything to adjust…" className="min-h-[76px]" aria-invalid={!!err} />
            </Field>
            <Button type="submit" size="sm">
              <ClipboardCheck size={14} /> Log check-in
            </Button>
          </form>
        </Panel>
      </div>

      <Panel title="Check-in history">
        {client.checkIns.length === 0 ? (
          <p className="py-4 text-[13.5px] text-fg-3">No check-ins yet.</p>
        ) : (
          <ol className="space-y-3">
            {client.checkIns.slice(0, 8).map((c) => (
              <li key={c.id} className="flex gap-3 rounded-2xl border border-line p-3.5">
                <span className={cn("grid h-9 w-12 shrink-0 place-items-center rounded-xl font-display text-[14px] font-semibold tabular", c.adherence >= 80 ? "bg-ok/15 text-ok" : c.adherence >= 65 ? "bg-warn/15 text-warn" : "bg-bad/15 text-bad")}>{c.adherence}%</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] leading-snug">{c.note}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-fg-3">
                    {MOODS.find((m) => m.v === c.mood)?.label} week · {dateShort(c.date)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Panel>
    </motion.div>
  );
}
