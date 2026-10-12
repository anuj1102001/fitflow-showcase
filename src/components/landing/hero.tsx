"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { ArrowRight, BarChart3, CalendarDays, HeartPulse, LayoutDashboard, Menu, MessageSquareText, Sparkles, Store, Users, X, TrendingUp, Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { EASE, SPRING } from "@/components/motion/kit";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Avatar } from "@/components/ui/kit";
import { Logo } from "@/components/ui/logo";
import { bySource, kpis, series } from "@/lib/analytics";
import { pct, rupees, rupeesShort } from "@/lib/format";
import { COACH } from "@/lib/seed";
import { useDemo, useHydrated } from "@/lib/store";

const LINKS = [
  { href: "#workflow", label: "Workflow" },
  { href: "#features", label: "Features" },
  { href: "#ai", label: "AI" },
  { href: "#storefronts", label: "Storefronts" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-300", scrolled ? "border-b border-line bg-bg/75 backdrop-blur-xl" : "border-b border-transparent")}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-[72px] lg:px-8">
        <Link href="/" aria-label="FITFLOW AI home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Sections">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="rounded-full px-3.5 py-2 text-[14px] text-fg-2 transition hover:bg-panel hover:text-fg">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/case-study" className={buttonClass({ variant: "ghost", size: "sm" }, "hidden sm:inline-flex")}>
            Case study
          </Link>
          <Link href="/app" className={buttonClass({ size: "sm" })}>
            Live demo <ArrowRight size={14} />
          </Link>
          <button onClick={() => setOpen(!open)} className="icon-btn lg:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: EASE }} className="overflow-hidden border-b border-line bg-bg/95 backdrop-blur-xl lg:hidden" aria-label="Sections">
            <div className="grid gap-1 px-4 pb-5 pt-2">
              {[...LINKS, { href: "/case-study", label: "Case study" }].map((l) => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 text-[16px] font-medium text-fg-2 transition hover:bg-panel hover:text-fg">
                  {l.label}
                </a>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  return (
    <section ref={ref} className="relative overflow-hidden pb-10 pt-28 sm:pt-32 lg:pb-24 lg:pt-36">
      {/* Atmosphere */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="grid-lines absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,#000,transparent)]" />
        <div className="lime-glow absolute left-1/2 top-[38%] h-[620px] w-[1100px] -translate-x-1/2 opacity-70" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="inline-flex items-center gap-2 rounded-full border border-line bg-panel/70 py-1.5 pl-1.5 pr-4 text-[12.5px] text-fg-2 backdrop-blur">
            <span className="rounded-full bg-lime px-2 py-0.5 text-[11px] font-semibold text-lime-ink">New</span>
            The business OS for fitness coaches · product prototype
          </motion.p>
          <h1 className="mt-6 text-balance text-[44px] font-semibold leading-[0.98] tracking-[-0.045em] sm:text-[64px] lg:text-[84px]">
            {["Turn", "followers", "into"].map((w, i) => (
              <motion.span key={w} className="mr-[0.22em] inline-block" initial={{ opacity: 0, y: 26, rotateX: 40 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.08 + i * 0.07 }} style={{ transformPerspective: 800 }}>
                {w}
              </motion.span>
            ))}
            <motion.span className="relative inline-block text-lime" initial={{ opacity: 0, y: 26, rotateX: 40 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.32 }} style={{ transformPerspective: 800 }}>
              paying clients.
              <motion.svg viewBox="0 0 300 12" className="absolute -bottom-2 left-0 h-3 w-full" preserveAspectRatio="none" aria-hidden>
                <motion.path d="M2 9 C 80 2, 200 2, 298 7" fill="none" stroke="rgb(var(--lime))" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: EASE, delay: 0.8 }} />
              </motion.svg>
            </motion.span>
          </h1>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.4 }} className="mx-auto mt-7 max-w-2xl text-balance text-[17px] leading-relaxed text-fg-2 sm:text-[19px]">
            FITFLOW packages your coaching into clear offers, gives you a storefront that converts, and keeps every lead, follow-up and client in one calm workspace, with AI handling the busywork.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.5 }} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/app" className={buttonClass({ size: "lg" }, "group h-[52px] px-7 text-[15.5px]")}>
              Explore the live demo <ArrowRight size={17} className="transition group-hover:translate-x-0.5" />
            </Link>
            <Link href="/s/aarav" className={buttonClass({ variant: "secondary", size: "lg" }, "h-[52px] px-7 text-[15.5px]")}>
              <Play size={15} className="fill-current" /> See a coach storefront
            </Link>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-5 text-[13px] text-fg-3">
            No sign-up · fictional coach & sample data · runs entirely in your browser
          </motion.p>
        </div>
        <HeroStage sectionRef={ref} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 3D stage */

function HeroStage({ sectionRef }: { sectionRef: React.RefObject<HTMLElement | null> }) {
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  // The composition starts tilted and settles flat as you scroll into it.
  const baseX = useTransform(scrollYProgress, [0, 0.55], [reduce ? 0 : 20, 0]);
  const baseScale = useTransform(scrollYProgress, [0, 0.55], [0.94, 1]);
  const tiltX = useSpring(useTransform(py, [-1, 1], [5, -5]), SPRING);
  const tiltY = useSpring(useTransform(px, [-1, 1], [-7, 7]), SPRING);
  const rotateX = useTransform(() => baseX.get() + tiltX.get());
  const depth = useTransform(scrollYProgress, [0, 0.55], [1, 0.35]);

  return (
    <div
      ref={stage}
      className="relative mx-auto mt-14 max-w-6xl [perspective:2400px] sm:mt-20"
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse" || !stage.current) return;
        const r = stage.current.getBoundingClientRect();
        px.set(((e.clientX - r.left) / r.width) * 2 - 1);
        py.set(((e.clientY - r.top) / r.height) * 2 - 1);
      }}
      onPointerLeave={() => (px.set(0), py.set(0))}
    >
      {/* Floor: a lit grid plane the dashboard floats above */}
      <div className="pointer-events-none absolute inset-x-[-10%] bottom-[-18%] h-[60%] [transform:rotateX(78deg)] [transform-origin:bottom] max-sm:hidden" aria-hidden>
        <div className="grid-lines h-full w-full opacity-80 [mask-image:radial-gradient(ellipse_at_center,#000_10%,transparent_65%)]" />
      </div>
      <motion.div initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: EASE, delay: 0.35 }}>
        <motion.div style={{ rotateX, rotateY: tiltY, scale: baseScale, transformStyle: "preserve-3d" }} className="relative">
          <div style={{ transform: "translateZ(0px)" }} className="relative">
            <DashboardMock />
          </div>
          <Layer z={140} depth={depth} className="-right-3 top-[9%] w-[250px] max-md:hidden lg:-right-10">
            <LeadToast />
          </Layer>
          <Layer z={200} depth={depth} className="-left-4 bottom-[12%] w-[270px] max-md:hidden lg:-left-14">
            <OfferChip />
          </Layer>
          <Layer z={110} depth={depth} className="-right-6 bottom-[-6%] max-lg:hidden lg:-right-16">
            <PhoneMini />
          </Layer>
          <Layer z={170} depth={depth} className="left-[36%] top-[30%] max-md:hidden">
            <InsightChip />
          </Layer>
        </motion.div>
      </motion.div>
      <div className="pointer-events-none absolute inset-x-0 -bottom-8 h-24 bg-gradient-to-t from-bg to-transparent" aria-hidden />
    </div>
  );
}

function Layer({ z, depth, className, children }: { z: number; depth: MotionValue<number>; className?: string; children: React.ReactNode }) {
  const tz = useTransform(depth, (d) => `translateZ(${z * d}px)`);
  return (
    <motion.div className={cn("absolute", className)} style={{ transform: tz, transformStyle: "preserve-3d" }}>
      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6 + z / 60, repeat: Infinity, ease: "easeInOut" }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

/** A faithful miniature of the real dashboard, drawn from the same sample data. */
function DashboardMock() {
  const hydrated = useHydrated();
  const leads = useDemo((s) => s.leads);
  const k = useMemo(() => kpis(leads, { range: "30d", source: "all" }), [leads]);
  const s = useMemo(() => series(leads, { range: "12m", source: "all" }), [leads]);
  const max = Math.max(1, ...s.map((b) => b.leads));
  const nav = [LayoutDashboard, Users, MessageSquareText, CalendarDays, HeartPulse, Sparkles, Store, BarChart3];
  return (
    <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[#0d0e10] shadow-[0_60px_140px_-40px_rgba(0,0,0,.9),0_0_0_1px_rgba(255,255,255,.03),0_-1px_0_rgba(255,255,255,.08)_inset] sm:rounded-[28px]">
      <div className="flex h-9 items-center gap-2 border-b border-white/[.06] px-4" aria-hidden>
        <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
        <span className="mx-auto rounded-md bg-white/[.04] px-6 py-0.5 text-[10.5px] text-fg-3">app.fitflow.demo</span>
      </div>
      <div className="flex">
        <div className="hidden w-14 shrink-0 flex-col items-center gap-3 border-r border-white/[.06] py-4 sm:flex" aria-hidden>
          {nav.map((I, i) => (
            <span key={i} className={cn("grid h-8 w-8 place-items-center rounded-lg", i === 0 ? "bg-lime/15 text-lime" : "text-fg-3")}>
              <I size={15} />
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10.5px] text-fg-3 sm:text-[11px]">Overview · last 30 days</p>
              <p className="font-display text-[15px] font-semibold sm:text-[19px]">Aarav&apos;s coaching business</p>
            </div>
            <Avatar name={COACH.name} src={COACH.avatar} size={30} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-5 sm:grid-cols-4 sm:gap-3">
            {[
              { l: "Leads", v: hydrated ? String(k.cur.leads) : "–", d: k.delta.leads },
              { l: "Qualified", v: hydrated ? String(k.cur.qualified) : "–", d: k.delta.qualified },
              { l: "Conversion", v: hydrated ? pct(k.cur.conversion) : "–", d: null },
              { l: "Revenue", v: hydrated ? rupeesShort(k.cur.revenue) : "–", d: k.delta.revenue, accent: true },
            ].map((x) => (
              <div key={x.l} className={cn("rounded-xl border bg-white/[.02] p-2.5 sm:rounded-2xl sm:p-3.5", x.accent ? "border-lime/30" : "border-white/[.07]")}>
                <p className="text-[10px] text-fg-3 sm:text-[11px]">{x.l}</p>
                <p className="mt-1 font-display text-[17px] font-semibold tabular sm:text-[24px]">{x.v}</p>
                {x.d !== null && hydrated && <p className="text-[9.5px] text-ok sm:text-[10.5px]">↗ +{Math.round((x.d ?? 0) * 100)}%</p>}
              </div>
            ))}
          </div>
          <div className="mt-3 grid gap-3 sm:mt-4 sm:grid-cols-[1.7fr_1fr]">
            <div className="rounded-xl border border-white/[.07] bg-white/[.02] p-3 sm:rounded-2xl sm:p-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-fg-2 sm:text-[12px]">Leads per month</p>
                <span className="text-[10px] text-fg-3">12 months</span>
              </div>
              <div className="mt-3 flex h-[86px] items-end gap-1.5 sm:h-[124px] sm:gap-2" aria-hidden>
                {s.map((b, i) => (
                  <motion.div key={b.key} className={cn("flex-1 rounded-t-[4px]", i === s.length - 1 ? "bg-lime" : "bg-lime/35")} initial={{ height: 0 }} animate={{ height: hydrated ? `${(b.leads / max) * 100}%` : "8%" }} transition={{ duration: 0.9, ease: EASE, delay: 0.8 + i * 0.04 }} />
                ))}
              </div>
            </div>
            <div className="hidden rounded-2xl border border-white/[.07] bg-white/[.02] p-4 sm:block">
              <p className="text-[12px] font-medium text-fg-2">Pipeline</p>
              <div className="mt-3 space-y-2.5">
                {(["new", "contacted", "call", "proposal"] as const).map((st, i) => {
                  const n = hydrated ? leads.filter((l) => l.stage === st).length : 0;
                  return (
                    <div key={st}>
                      <div className="flex justify-between text-[10.5px] text-fg-3">
                        <span className="capitalize">{st === "call" ? "Call booked" : st}</span>
                        <span className="tabular">{n}</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-white/[.06]">
                        <motion.div className="h-full rounded-full bg-lime" style={{ opacity: 1 - i * 0.18 }} initial={{ width: 0 }} animate={{ width: `${Math.min(100, n * 8)}%` }} transition={{ duration: 0.9, ease: EASE, delay: 1 + i * 0.08 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeadToast() {
  const leads = useDemo((s) => s.leads);
  const hydrated = useHydrated();
  const l = hydrated ? leads[0] : undefined;
  return (
    <div className="rounded-2xl border border-white/10 bg-[#16181b]/95 p-3.5 shadow-[0_30px_60px_-20px_rgba(0,0,0,.8)] backdrop-blur">
      <div className="flex items-center gap-2.5">
        <span className="relative">
          <Avatar name={l?.name ?? "Priya Sharma"} size={34} />
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#16181b] bg-lime" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[12.5px] font-semibold">New lead · {l?.name.split(" ")[0] ?? "Priya"}</p>
          <p className="truncate text-[11px] text-fg-3">via {l?.source ?? "Instagram"} · just now</p>
        </div>
      </div>
      <p className="mt-2.5 line-clamp-2 rounded-xl bg-white/[.04] px-3 py-2 text-[11.5px] leading-snug text-fg-2">&ldquo;{l?.goal ?? "Lose 8 kg before my wedding in March"}&rdquo;</p>
    </div>
  );
}

function OfferChip() {
  return (
    <div className="rounded-2xl border border-lime/30 bg-[#121410]/95 p-4 shadow-[0_30px_60px_-20px_rgba(0,0,0,.8),0_0_40px_-12px_rgb(200_240_74/.35)] backdrop-blur">
      <p className="flex items-center gap-1.5 text-[11px] font-medium text-lime">
        <Sparkles size={12} /> AI offer drafted
      </p>
      <p className="mt-1.5 font-display text-[15px] font-semibold leading-tight">12-Week Strength Foundations</p>
      <div className="mt-2.5 flex items-center justify-between">
        <span className="font-display text-[18px] font-semibold">{rupees(14999)}</span>
        <span className="rounded-full bg-ok/15 px-2 py-0.5 text-[10px] font-medium text-ok">Claims check ✓</span>
      </div>
    </div>
  );
}

function InsightChip() {
  const hydrated = useHydrated();
  const leads = useDemo((s) => s.leads);
  const best = useMemo(() => [...bySource(leads, { range: "90d" })].filter((x) => x.leads >= 6).sort((a, b) => (b.conversion ?? 0) - (a.conversion ?? 0))[0], [leads]);
  return (
    <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-[#16181b]/95 py-2 pl-2 pr-4 shadow-[0_20px_50px_-15px_rgba(0,0,0,.8)] backdrop-blur">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-lime text-lime-ink">
        <TrendingUp size={14} />
      </span>
      <span className="text-[12px]">
        <span className="font-semibold">{hydrated && best ? `${best.source} leads convert best` : "Insights from your data"}</span> <span className="text-fg-3">· last 90 days</span>
      </span>
    </div>
  );
}

function PhoneMini() {
  return (
    <div className="w-[170px] rounded-[30px] border border-white/10 bg-[#0b0c0e] p-1.5 shadow-[0_40px_80px_-25px_rgba(0,0,0,.9)]">
      <div className="overflow-hidden rounded-[24px]">
        <div className="relative h-[200px]">
          <img src={COACH.avatar.replace("w=120", "w=400").replace("h=120", "h=520")} alt="" className="absolute inset-0 h-full w-full object-cover opacity-75" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e] via-[#0b0c0e]/40 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-[8px] uppercase tracking-wider text-fg-3">Strength coach · Bengaluru</p>
            <p className="mt-0.5 font-display text-[15px] font-bold uppercase leading-[0.95]">Get strong. Keep your desk job.</p>
          </div>
        </div>
        <div className="space-y-1.5 bg-[#0b0c0e] p-3">
          <div className="rounded-xl border border-white/[.08] bg-white/[.03] p-2.5">
            <p className="text-[9.5px] font-semibold">12-Week Strength</p>
            <p className="font-display text-[12px] font-bold">₹14,999</p>
          </div>
          <div className="h-7 rounded-full bg-lime text-center text-[10px] font-semibold leading-7 text-lime-ink">Book a free call</div>
        </div>
      </div>
    </div>
  );
}
