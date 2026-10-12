"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { ArrowRight, CalendarDays, CheckCircle2, ExternalLink, HeartPulse, MessageCircle, Sparkles, Users, Video, Wand2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { SERIES, TrendChart } from "@/components/charts";
import { EASE, Reveal, SPRING, TiltCard } from "@/components/motion/kit";
import { BrowserFrame, PhoneFrame } from "@/components/storefront/frames";
import { StorefrontView, THEME_META } from "@/components/storefront/view";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Avatar, DemoTag, ProgressRing, Segmented, Skeleton } from "@/components/ui/kit";
import { draftOffer, GOALS, priceGuide, type GoalId } from "@/lib/ai";
import { bySource, kpis, RANGES, series, type RangeId } from "@/lib/analytics";
import { pct, rupees, time } from "@/lib/format";
import { MEERA, MEERA_OFFERS } from "@/lib/storefronts";
import { useDemo, useHydrated } from "@/lib/store";
import type { OfferType, StorefrontTheme } from "@/lib/types";
import { SectionIntro } from "./sections";

/* ------------------------------------------------------------------ feature bento */

export function Features() {
  return (
    <section id="features" className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro eyebrow="Features" title="Everything a coach needs to sell, in one place." body="Each tile below is live. Click around, or open the full demo for the real thing." />
        <div className="mt-14 grid gap-4 lg:grid-cols-6">
          <Tile className="lg:col-span-4" icon={<Wand2 size={18} />} title="AI Offer Builder" body="Pick a goal and format; get a clear, priced offer you can edit and publish." href="/app/offers?new=1">
            <OfferMini />
          </Tile>
          <Tile className="lg:col-span-2" icon={<Users size={18} />} title="Lead pipeline" body="Every enquiry, its source and next step." href="/app/leads">
            <PipelineMini />
          </Tile>
          <Tile className="lg:col-span-2" icon={<MessageCircle size={18} />} title="AI follow-ups" body="Personal drafts in your tone. You send them." href="/app/follow-ups">
            <FollowUpMini />
          </Tile>
          <Tile className="lg:col-span-2" icon={<CalendarDays size={18} />} title="Bookings" body="Discovery calls, sessions and check-ins in one calendar." href="/app/bookings">
            <BookingsMini />
          </Tile>
          <Tile className="lg:col-span-2" icon={<HeartPulse size={18} />} title="Client progress" body="Plans, metrics and weekly check-ins that flag who's slipping." href="/app/clients">
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
          <Link href="/app/analytics" className={buttonClass({ variant: "secondary" }, "mt-8")}>
            Open full analytics <ArrowRight size={15} />
          </Link>
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

/* ------------------------------------------------------------------ storefront showcase */

export function StorefrontShowcase() {
  const hydrated = useHydrated();
  const sf = useDemo((s) => s.storefront);
  const offers = useDemo((s) => s.offers);
  const [theme, setTheme] = useState<StorefrontTheme>("forge");
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const ry = useSpring(useTransform(px, [-1, 1], [8, 20]), SPRING);
  const rx = useSpring(useTransform(py, [-1, 1], [8, 2]), SPRING);
  const live = sf.offerIds.map((id) => offers.find((o) => o.id === id)).filter((o): o is NonNullable<typeof o> => !!o && o.status === "live");
  const view = theme === "forge" ? <StorefrontView sf={{ ...sf, theme: "forge" }} offers={live} preview /> : <StorefrontView sf={MEERA} offers={MEERA_OFFERS} preview />;
  const url = theme === "forge" ? "fitflow.demo/s/aarav" : "fitflow.demo/s/meera";

  return (
    <section id="storefronts" className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro eyebrow="Coaching storefronts" title="A page that sells while you coach." body="Every coach gets a fast, mobile-first storefront with programs, pricing, FAQs and an enquiry form that feeds the pipeline. Switch themes to see the same content restyled." />
        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-2" role="tablist" aria-label="Storefront theme">
            {(Object.keys(THEME_META) as StorefrontTheme[]).map((t) => (
              <button key={t} role="tab" aria-selected={theme === t} onClick={() => setTheme(t)} className={cn("flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition", theme === t ? "border-lime-fg/60 bg-lime/[.06]" : "border-line hover:border-line-2")}>
                <span className="flex h-8 w-14 overflow-hidden rounded-lg" aria-hidden>
                  {THEME_META[t].swatches.map((c) => (
                    <span key={c} className="flex-1" style={{ background: c }} />
                  ))}
                </span>
                <span>
                  <span className={cn("block text-[14px] font-semibold", t === "bloom" && "font-[family-name:var(--font-fraunces)] italic")}>
                    {THEME_META[t].name} · {t === "forge" ? "Aarav" : "Meera"}
                  </span>
                  <span className="block text-[12px] text-fg-3">{t === "forge" ? "Strength & fat loss" : "Yoga & mobility"}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
        <div
          ref={stage}
          className="relative mx-auto mt-12 h-[560px] max-w-6xl [perspective:2400px] sm:h-[640px]"
          onPointerMove={(e) => {
            if (reduce || e.pointerType !== "mouse" || !stage.current) return;
            const r = stage.current.getBoundingClientRect();
            px.set(((e.clientX - r.left) / r.width) * 2 - 1);
            py.set(((e.clientY - r.top) / r.height) * 2 - 1);
          }}
          onPointerLeave={() => (px.set(0), py.set(0))}
        >
          {hydrated ? (
            <AnimatePresence mode="wait">
              <motion.div key={theme} className="absolute inset-0" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.55, ease: EASE }}>
                <motion.div className="absolute left-0 top-0 w-full max-md:hidden md:w-[82%]" style={{ rotateY: ry, rotateX: rx, transformOrigin: "left center", transformStyle: "preserve-3d" }}>
                  <BrowserFrame url={url} height={540}>
                    {view}
                  </BrowserFrame>
                </motion.div>
                <motion.div className="absolute bottom-0 left-1/2 -translate-x-1/2 md:left-auto md:right-0 md:translate-x-0" initial={{ y: 40 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.1 }} style={{ transformPerspective: 1600, rotateY: reduce ? 0 : -8 }}>
                  <PhoneFrame height={560} width={280}>
                    {view}
                  </PhoneFrame>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <Skeleton className="h-full rounded-2xl" />
          )}
        </div>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href={theme === "forge" ? "/s/aarav" : "/s/meera"} className={buttonClass({})}>
            <ExternalLink size={15} /> Open {theme === "forge" ? "Aarav's" : "Meera's"} storefront
          </Link>
          <Link href="/app/storefront" className={buttonClass({ variant: "secondary" })}>
            Customise it in the builder
          </Link>
        </div>
        <p className="mt-4 text-center text-[12.5px] text-fg-3">The previews are real pages: scroll inside them. Fictional coaches; photos from Unsplash.</p>
      </div>
    </section>
  );
}
