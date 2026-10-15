"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, CalendarDays, CheckCircle2, HeartPulse, MessageCircle, Sparkles, Users, Video, Wand2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { SERIES, TrendChart } from "@/components/charts";
import { EASE, Reveal, TiltCard } from "@/components/motion/kit";
import { cn } from "@/components/ui/cn";
import { LiquidButton } from "@/components/ui/liquid-button";
import { Avatar, DemoTag, ProgressRing, Segmented, Skeleton } from "@/components/ui/kit";
import { draftFollowUp, draftOffer, goalPhrase, GOALS, priceGuide, type FollowUpGoal, type GoalId } from "@/lib/ai";
import { bySource, kpis, RANGES, series, type RangeId } from "@/lib/analytics";
import { firstName, pct, rupees, time } from "@/lib/format";
import { useDemo, useHydrated } from "@/lib/store";
import type { OfferType } from "@/lib/types";
import { explainDraft, personalSegments, SEQUENCES } from "@/lib/sequences";
import { SectionIntro } from "./sections";

/* ------------------------------------------------------------------ feature bento */

export function Features() {
  return (
    <section id="features" className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro eyebrow="Features" title="Everything around the follow-up." body="The pipeline feeds the queue, the queue feeds the drafts, and check-ins catch clients before they drift. Each tile below is live." />
        <div className="mt-14 grid gap-4 lg:grid-cols-6">
          <Tile className="lg:col-span-4" icon={<Wand2 size={18} />} title="AI Offer Builder" body="Pick a goal and format; get a clear, priced offer you can edit and publish." href="/app/offers?new=1">
            <OfferMini />
          </Tile>
          <Tile className="lg:col-span-2" icon={<Users size={18} />} title="Lead pipeline" body="Every enquiry, its source and next step." href="/app/leads">
            <PipelineMini />
          </Tile>
          <Tile className="lg:col-span-2" icon={<MessageCircle size={18} />} title="Drafts that explain themselves" body="Personal drafts in your tone, with the reasons shown. You send them." href="/app/follow-ups">
            <FollowUpMini />
          </Tile>
          <Tile className="lg:col-span-2" icon={<CalendarDays size={18} />} title="Bookings" body="Discovery calls, sessions and check-ins in one calendar." href="/app/bookings">
            <BookingsMini />
          </Tile>
          <Tile className="lg:col-span-2" icon={<HeartPulse size={18} />} title="Client retention" body="Weekly check-ins flag who's slipping, and a rescue sequence follows up." href="/app/clients">
            <ClientsMini />
          </Tile>
        </div>
      </div>
    </section>
  );
}

function Tile({ className, icon, title, body, href, children }: { className?: string; icon: React.ReactNode; title: string; body: string; href: string; children: React.ReactNode }) {
  return (
    <Reveal className={cn("min-w-0", className)}>
      <TiltCard max={3} lift={3} className="h-full rounded-2xl">
        <article className="card panel-sheen flex h-full flex-col overflow-hidden p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-grid h-9 w-9 place-items-center rounded-xl border border-line bg-panel-2 text-lime-fg">{icon}</span>
              <h3 className="mt-4 text-[19px] font-semibold">{title}</h3>
              <p className="mt-1 text-[14px] leading-relaxed text-fg-2">{body}</p>
            </div>
            <Link href={href} className="group grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-fg-3 transition hover:border-lime-fg/50 hover:text-lime-fg" aria-label={`Open ${title} in the demo`}>
              <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="mt-5 min-h-0 flex-1">{children}</div>
        </article>
      </TiltCard>
    </Reveal>
  );
}

function OfferMini() {
  const [goal, setGoal] = useState<GoalId>("strength");
  const [type, setType] = useState<OfferType>("1:1 online coaching");
  const weeks = type === "Small-group program" ? 8 : 12;
  const d = useMemo(() => draftOffer({ goal, audience: "desk", type, weeks, price: 0 }), [goal, type, weeks]);
  const g = priceGuide(type, weeks);
  return (
    <div className="grid items-start gap-4 md:grid-cols-[1fr_1.1fr]">
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-[12px] font-medium text-fg-3">Goal</p>
          <div className="flex flex-wrap gap-1.5">
            {GOALS.map((x) => (
              <button key={x.id} onClick={() => setGoal(x.id)} aria-pressed={goal === x.id} className={cn("rounded-md border px-3 py-1.5 text-[12.5px] font-medium transition", goal === x.id ? "border-lime-fg bg-lime/15 text-fg" : "border-line text-fg-2 hover:border-line-2")}>
                {x.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-[12px] font-medium text-fg-3">Format</p>
          <div className="flex flex-wrap gap-1.5">
            {(["1:1 online coaching", "Small-group program", "Hybrid (online + in person)"] as OfferType[]).map((t) => (
              <button key={t} onClick={() => setType(t)} aria-pressed={type === t} className={cn("rounded-md border px-3 py-1.5 text-[12.5px] font-medium transition", type === t ? "border-lime-fg bg-lime/15 text-fg" : "border-line text-fg-2 hover:border-line-2")}>
                {t.replace(" (online + in person)", "")}
              </button>
            ))}
          </div>
        </div>
        <p className="rounded-2xl border border-line bg-panel-2/50 p-3.5 text-[12.5px] leading-relaxed text-fg-2">
          <Sparkles size={13} className="mr-1.5 inline text-lime-fg" />
          Suggested price for {weeks} weeks: <span className="font-semibold text-fg">{rupees(g.low)} – {rupees(g.high)}</span>
        </p>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={d.title} initial={{ opacity: 0, rotateY: -12, x: 16 }} animate={{ opacity: 1, rotateY: 0, x: 0 }} exit={{ opacity: 0, rotateY: 10, x: -12 }} transition={{ duration: 0.45, ease: EASE }} style={{ transformPerspective: 1000 }} className="flex flex-col rounded-xl border border-lime-fg/30 bg-panel p-5">
          <span className="w-fit rounded-md border border-line px-2.5 py-1 text-[11px] text-fg-3">
            {type} · {weeks} wk
          </span>
          <p className="mt-3 font-display text-[21px] font-bold leading-tight">{d.title}</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-fg-2">{d.tagline}</p>
          <ul className="mt-4 space-y-2 border-t border-line pt-4">
            {d.benefits.slice(0, 3).map((b) => (
              <li key={b} className="flex gap-2 text-[12.5px]">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-lime-fg" /> {b}
              </li>
            ))}
          </ul>
          <span className="mt-4 rounded-full bg-lime py-2 text-center text-[12.5px] font-semibold text-lime-ink">{d.cta}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const PIPE = [
  ["Rhea K.", "Sameer P.", "Anita D."],
  ["Kabir S."],
  ["Tara M."],
];
function PipelineMini() {
  const [cols, setCols] = useState(PIPE);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => {
      setCols((c) => {
        const next = c.map((x) => [...x]);
        // Move one card forward each tick; recycle when the last column fills.
        if (next[0]!.length) next[1]!.push(next[0]!.shift()!);
        else if (next[1]!.length) next[2]!.push(next[1]!.shift()!);
        else return PIPE;
        if (next[2]!.length > 3) next[2]!.shift();
        return next;
      });
    }, 2200);
    return () => clearInterval(t);
  }, [reduce]);
  return (
    <div className="grid h-full grid-cols-3 gap-2">
      {["New", "Call booked", "Won"].map((h, i) => (
        <div key={h} className="rounded-2xl border border-line bg-panel-2/40 p-2">
          <p className="mb-2 px-1 text-[10.5px] font-medium text-fg-3">{h}</p>
          <div className="space-y-1.5">
            <AnimatePresence initial={false}>
              {cols[i]!.map((n) => (
                <motion.div key={n} layout layoutId={`pm-${n}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.45, ease: EASE }} className={cn("flex items-center gap-1.5 rounded-lg border px-1.5 py-1.5", i === 2 ? "border-lime-fg/30 bg-lime/[.07]" : "border-line bg-panel")}>
                  <Avatar name={n} size={18} />
                  <span className="truncate text-[11px] font-medium">{n}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
}

const FU = "Hi Rhea! Just checking in on the 12-Week Strength plan I sent. Happy to move sessions to mornings if evenings are tricky. Want me to hold a spot for Monday?";
function FollowUpMini() {
  const [n, setN] = useState(0);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reduce) return setN(FU.length);
    let i = 0;
    let pause = 0;
    const t = setInterval(() => {
      if (i >= FU.length) {
        if (++pause > 60) {
          i = 0;
          pause = 0;
        }
      } else i += 2;
      setN(i);
    }, 40);
    return () => clearInterval(t);
  }, [reduce]);
  return (
    <div ref={ref} className="flex h-full flex-col justify-end">
      <div className="flex items-center gap-2 text-[11.5px] text-fg-3">
        <span className="rounded-md border border-line px-2 py-0.5">Nudge after proposal</span>
        <span className="rounded-md border border-line px-2 py-0.5">Warm</span>
        <span className="rounded-md border border-line px-2 py-0.5">WhatsApp</span>
      </div>
      <div className="mt-3 min-h-[118px] rounded-2xl rounded-bl-md border border-line bg-panel-2 p-3.5 text-[13px] leading-relaxed text-fg">
        {FU.slice(0, n)}
        {n < FU.length && <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse bg-s1" />}
      </div>
      <p className="mt-2 text-[11px] text-fg-3">Draft · never sent automatically</p>
    </div>
  );
}

function BookingsMini() {
  const hydrated = useHydrated();
  const bookings = useDemo((s) => s.bookings);
  const leads = useDemo((s) => s.leads);
  const items = hydrated ? bookings.filter((b) => new Date(b.start).getTime() > Date.now() && b.status !== "cancelled").slice(0, 4) : [];
  const color = { "Discovery call": "bg-s1", "Check-in": "bg-info", "Coaching session": "bg-violet", Assessment: "bg-warn" } as const;
  return (
    <ul className="space-y-1.5">
      {!hydrated && [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-11" />)}
      {items.map((b, i) => (
        <motion.li key={b.id} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex items-center gap-3 rounded-xl border border-line bg-panel-2/40 px-3 py-2">
          <span className={cn("h-7 w-[3px] rounded-full", color[b.kind])} />
          <span className="w-16 shrink-0 text-[12px] font-semibold tabular">{time(b.start)}</span>
          <span className="min-w-0 flex-1 truncate text-[12.5px]">{leads.find((l) => l.id === b.leadId)?.name}</span>
          <span className="hidden items-center gap-1 text-[11px] text-fg-3 sm:flex">
            <Video size={11} /> {b.kind}
          </span>
        </motion.li>
      ))}
    </ul>
  );
}

function ClientsMini() {
  const hydrated = useHydrated();
  const clients = useDemo((s) => s.clients);
  const leads = useDemo((s) => s.leads);
  const pick = hydrated ? [...clients].sort((a, b) => a.status.localeCompare(b.status)).slice(0, 3) : [];
  return (
    <div className="grid grid-cols-3 gap-2">
      {!hydrated && [0, 1, 2].map((i) => <Skeleton key={i} className="h-[132px]" />)}
      {pick.map((c) => {
        const l = leads.find((x) => x.id === c.leadId);
        const adherence = (c.checkIns[0]?.adherence ?? 80) / 100;
        return (
          <div key={c.id} className="flex flex-col items-center rounded-2xl border border-line bg-panel-2/40 p-3 text-center">
            <div className="relative">
              <ProgressRing value={adherence} size={56} stroke={4} />
              <span className="absolute inset-0 grid place-items-center font-display text-[13px] font-semibold">{Math.round(adherence * 100)}%</span>
            </div>
            <p className="mt-2 w-full truncate text-[12px] font-semibold">{l?.name.split(" ")[0]}</p>
            <p className={cn("text-[10.5px]", c.status === "on-track" ? "text-ok" : c.status === "attention" ? "text-warn" : "text-bad")}>{c.status === "on-track" ? "On track" : c.status === "attention" ? "Attention" : "At risk"}</p>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ analytics preview */

export function AnalyticsPreview() {
  const hydrated = useHydrated();
  const leads = useDemo((s) => s.leads);
  const [range, setRange] = useState<RangeId>("12m");
  const k = useMemo(() => kpis(leads, { range, source: "all" }), [leads, range]);
  const s = useMemo(() => series(leads, { range, source: "all" }), [leads, range]);
  const src = useMemo(() => bySource(leads, { range }), [leads, range]);
  const maxSrc = Math.max(1, ...src.map((x) => x.leads));
  return (
    <section id="analytics" className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[.85fr_1.15fr] lg:px-8">
        <div>
          <SectionIntro center={false} eyebrow="Analytics" title="Know what's working. Do more of it." body="See where clients come from, how leads move through your pipeline and which programs sell, with every metric defined in plain language." />
          <ul className="mt-8 space-y-3 text-[15px]">
            {["Lead acquisition and revenue trends", "A cohort funnel from first message to client", "Conversion by source and by offer", "Filters that update every chart at once"].map((x) => (
              <li key={x} className="flex gap-3">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-lime-fg" /> {x}
              </li>
            ))}
          </ul>
          <LiquidButton href="/app/analytics" className="mt-8">
            Open full analytics <ArrowRight size={15} />
          </LiquidButton>
        </div>
        <Reveal>
          <div className="card relative overflow-hidden p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <p className="text-[15px] font-semibold">Performance</p>
                <DemoTag />
              </div>
              <Segmented label="Preview range" size="sm" value={range} onChange={setRange} options={RANGES.map((r) => ({ id: r.id, label: r.label.replace(" days", "d").replace(" months", "m") }))} />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                ["Leads", hydrated ? String(k.cur.leads) : "–"],
                ["Conversion", hydrated ? pct(k.cur.conversion) : "–"],
                ["Revenue", hydrated ? rupees(k.cur.revenue) : "–"],
              ].map(([l, v]) => (
                <div key={l} className="rounded-2xl border border-line bg-panel-2/40 p-3.5">
                  <p className="text-[12px] text-fg-3">{l}</p>
                  <AnimatePresence mode="wait">
                    <motion.p key={v} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="mt-1 truncate font-display text-[20px] font-semibold tabular sm:text-[24px]">
                      {v}
                    </motion.p>
                  </AnimatePresence>
                </div>
              ))}
            </div>
            <div className="mt-5">{hydrated ? <TrendChart data={s} x="label" height={220} series={[{ key: "leads", name: "Leads", color: SERIES.lime }, { key: "won", name: "Clients won", color: SERIES.sky }]} /> : <Skeleton className="h-[220px]" />}</div>
            <div className="mt-5 grid gap-2 border-t border-line pt-5 sm:grid-cols-2">
              {src.slice(0, 4).map((x) => (
                <div key={x.source}>
                  <div className="flex justify-between text-[12.5px]">
                    <span className="text-fg-2">{x.source}</span>
                    <span className="tabular text-fg-3">
                      {x.leads} · {pct(x.conversion, 0)} conv.
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-line">
                    <motion.div className="h-full rounded-full bg-s1" initial={{ width: 0 }} whileInView={{ width: `${(x.leads / maxSrc) * 100}%` }} viewport={{ once: false }} transition={{ duration: 0.8, ease: EASE }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ sequence showcase */

/**
 * The follow-up engine, live: pick a step of the New enquiry sequence and see the draft it would
 * produce for a real sample lead, with the reasoning and checks beside it.
 */
export function SequenceShowcase() {
  const hydrated = useHydrated();
  const leads = useDemo((s) => s.leads);
  const offers = useDemo((s) => s.offers);
  const [i, setI] = useState(0);
  const seq = SEQUENCES[0]!;
  const lead = useMemo(() => leads.find((l) => l.stage === "new" && /^(lose|get|build|run|feel|improve)/i.test(l.goal)) ?? leads.find((l) => l.stage === "new") ?? leads[0], [leads]);
  const offer = offers.find((o) => o.id === lead?.offerId);
  const step = seq.steps[i]!;
  const text = lead ? draftFollowUp(lead, offer, step.goal as FollowUpGoal, "Warm", step.channel, 0) : "";
  const why = lead ? explainDraft({ lead, offer, goal: step.goal, tone: "Warm", channel: step.channel, text }) : null;
  const segs = lead ? personalSegments(text, [firstName(lead.name), goalPhrase(lead), offer?.title ?? ""]) : [];

  return (
    <section id="engine" className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro eyebrow="The follow-up engine" title="It decides who and when. You decide what's sent." body="A new enquiry goes into a four-step sequence. Each step lands in Today on its day as a draft that shows its reasoning, and the sequence pauses the moment they reply. Click a step." />
        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <Reveal>
            <ol className="relative grid gap-3" aria-label="New enquiry sequence">
              <span aria-hidden className="absolute bottom-6 left-[23px] top-6 w-px bg-line" />
              {seq.steps.map((st, k) => (
                <li key={k} className="relative">
                  <button onClick={() => setI(k)} aria-pressed={i === k} className={cn("grid w-full grid-cols-[48px_1fr] items-center gap-3 rounded-2xl border p-3 text-left transition", i === k ? "border-lime-fg/60 bg-lime/10" : "border-line bg-panel/70 hover:border-line-2")}>
                    <span className={cn("z-[1] grid h-12 w-12 place-items-center rounded-full border font-mono text-[12px]", i === k ? "border-lime-fg bg-lime text-lime-ink" : "border-line bg-panel text-fg-2")}>D{st.day}</span>
                    <span>
                      <span className="block text-[14.5px] font-semibold">{st.goal}</span>
                      <span className="mt-0.5 block text-[12.5px] leading-relaxed text-fg-3">{st.why}</span>
                    </span>
                  </button>
                </li>
              ))}
              <li className="relative grid grid-cols-[48px_1fr] items-center gap-3 p-3">
                <span className="z-[1] grid h-12 w-12 place-items-center rounded-full border border-dashed border-line-2 bg-bg text-[11px] text-fg-3">reply</span>
                <span className="text-[13px] leading-relaxed text-fg-2">They reply → the sequence pauses and they jump to the top of Today, so the next message is a human one.</span>
              </li>
            </ol>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="card overflow-hidden p-0">
              <div className="flex items-center justify-between gap-2 border-b border-line px-5 py-3">
                <p className="text-[13px] font-medium text-fg-2">
                  Step {i + 1} for {hydrated && lead ? lead.name : "a sample lead"} · {step.channel}
                </p>
                <DemoTag>Simulated AI</DemoTag>
              </div>
              <div className="grid gap-0 md:grid-cols-[1.05fr_1fr]">
                <div className="bg-[#0b141a] p-5 text-[#e9edef]">
                  <AnimatePresence mode="wait">
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease: EASE }} className="ml-auto max-w-[95%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-[#005c4b] px-3.5 py-2.5 text-[13.5px] leading-relaxed">
                      {hydrated ? (
                        segs.map((p, k) =>
                          p.mark ? (
                            <mark key={k} className="rounded-sm bg-[#c8f04a]/25 px-0.5 text-inherit underline decoration-[#c8f04a] decoration-2 underline-offset-2">
                              {p.text}
                            </mark>
                          ) : (
                            <span key={k}>{p.text}</span>
                          ),
                        )
                      ) : (
                        <Skeleton className="h-24 w-full" />
                      )}
                    </motion.div>
                  </AnimatePresence>
                  <p className="mt-3 text-[11.5px] text-white/50">Highlighted: written for this lead specifically.</p>
                </div>
                <div className="p-5">
                  <p className="text-[12.5px] font-semibold text-fg-2">Why this draft</p>
                  <ul className="mt-2 space-y-2">
                    {hydrated &&
                      why?.used.slice(0, 4).map((u) => (
                        <li key={u.label} className="text-[12.5px] leading-relaxed">
                          <b className="font-medium">{u.label}.</b> <span className="text-fg-2">{u.detail}</span>
                        </li>
                      ))}
                  </ul>
                  <ul className="mt-3 space-y-1.5 border-t border-line pt-3">
                    {hydrated &&
                      why?.checks.map((c) => (
                        <li key={c.label} className="flex items-start gap-1.5 text-[12.5px] text-fg-2">
                          <CheckCircle2 size={14} className={cn("mt-px shrink-0", c.ok ? "text-ok" : "text-warn")} /> {c.label}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <LiquidButton href="/app#today">
                Open Today in the demo <ArrowRight size={16} />
              </LiquidButton>
              <LiquidButton href="/app/sequences" variant="secondary">
                See all sequences
              </LiquidButton>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
