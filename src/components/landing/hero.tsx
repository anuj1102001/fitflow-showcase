"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { ArrowRight, BarChart3, CalendarDays, Check, HeartPulse, LayoutDashboard, Menu, MessageSquareText, Sparkles, Store, Users, X } from "lucide-react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useEffect, useMemo, useRef, useState } from "react";
import { EASE, SPRING } from "@/components/motion/kit";
import { buttonClass } from "@/components/ui/button";
import { LiquidButton } from "@/components/ui/liquid-button";
import { NeuralNoise } from "./neural-noise";
import { cn } from "@/components/ui/cn";
import { Avatar } from "@/components/ui/kit";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { kpis, series } from "@/lib/analytics";
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
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-300", scrolled ? "border-b border-line bg-bg/85 backdrop-blur-xl" : "border-b border-transparent")}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="FITFLOW AI home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Sections">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-[14px] text-fg-2 transition hover:bg-panel-2 hover:text-fg">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden sm:inline-flex" />
          <Link href="/case-study" className={buttonClass({ variant: "ghost", size: "sm" }, "hidden md:inline-flex")}>
            Case study
          </Link>
          <LiquidButton href="/app" size="sm">
            Live demo <ArrowRight size={14} />
          </LiquidButton>
          <button onClick={() => setOpen(!open)} className="icon-btn h-9 w-9 lg:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
            {open ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: EASE }} className="overflow-hidden border-b border-line bg-bg/95 backdrop-blur-xl lg:hidden" aria-label="Sections">
            <div className="grid gap-1 px-4 pb-5 pt-2">
              {[...LINKS, { href: "/case-study", label: "Case study" }].map((l) => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-[16px] font-medium text-fg-2 transition hover:bg-panel hover:text-fg">
                  {l.label}
                </a>
              ))}
              <div className="mt-2 flex items-center justify-between rounded-lg border border-line px-3 py-2.5">
                <span className="text-[14px] text-fg-2">Appearance</span>
                <ThemeToggle />
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

gsap.registerPlugin(SplitText, useGSAP);

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  // Headline words rise out of a mask, one after another (GSAP SplitText).
  useGSAP(
    () => {
      if (!title.current || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const split = SplitText.create(title.current.querySelectorAll("[data-split]"), { type: "words", mask: "words", wordsClass: "hw" });
      // Masks are padded (see globals.css) so tall glyphs aren't clipped; the split is removed once the reveal ends.
      gsap.from(split.words, { yPercent: 115, duration: 0.9, ease: "power4.out", stagger: 0.06, delay: 0.05, onComplete: () => split.revert() });
      return () => split.revert();
    },
    { scope: ref },
  );
  const fade = (d: number) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, ease: EASE, delay: d } });
  return (
    <section ref={ref} className="relative overflow-hidden pb-12 pt-28 sm:pt-32 lg:pb-24 lg:pt-36">
      <NeuralNoise />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="relative isolate lg:col-span-7">
            {/* Soft backing so the shader never fights the text */}
            <div aria-hidden className="pointer-events-none absolute -inset-x-10 -inset-y-8 -z-10 rounded-[40px] bg-bg/60 blur-2xl dark:bg-bg/70" />
            <motion.p {...fade(0)} className="flex items-center gap-2 text-[13px] font-medium text-fg-3">
              <span className="h-1.5 w-1.5 rounded-full bg-s1" aria-hidden />
              Product prototype · the business OS for fitness coaches
            </motion.p>
            <h1 ref={title} className="mt-5 text-balance text-[44px] font-semibold leading-[1.02] tracking-[-0.04em] sm:text-[60px] lg:text-[72px]">
              <span data-split>Turn followers into</span>{" "}
              <span className="relative whitespace-nowrap">
                <motion.span aria-hidden className="absolute inset-x-[-0.08em] bottom-[0.02em] top-[0.1em] -z-0 origin-left rounded-[6px] bg-lime" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, ease: EASE, delay: 0.1 }} />
                <span data-split className="relative text-lime-ink">paying clients.</span>
              </span>
            </h1>
          </div>
          <div className="relative isolate lg:col-span-5 lg:pb-2">
            <div aria-hidden className="pointer-events-none absolute -inset-x-10 -inset-y-8 -z-10 rounded-[40px] bg-bg/60 blur-2xl dark:bg-bg/70" />
            <motion.p {...fade(0.15)} className="max-w-xl text-[17px] leading-relaxed text-fg-2">
              FITFLOW packages your coaching into clear offers, gives you a storefront that sells, and keeps every lead, follow-up and client in one calm workspace. AI drafts the busywork; you stay in control.
            </motion.p>
            <motion.div {...fade(0.25)} className="mt-7 flex flex-col gap-2.5 sm:flex-row">
              <LiquidButton href="/app">
                Explore the live demo <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
              </LiquidButton>
              <LiquidButton href="/s/aarav" variant="secondary">
                See a coach storefront
              </LiquidButton>
            </motion.div>
            <motion.ul {...fade(0.35)} className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-fg-3">
              {["No sign-up", "Fictional coach & sample data", "Runs in your browser"].map((x) => (
                <li key={x} className="flex items-center gap-1.5">
                  <Check size={13} className="text-lime-fg" /> {x}
                </li>
              ))}
            </motion.ul>
          </div>
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
  // A gentle tilt that settles flat as you scroll; pointer adds a little parallax on desktop.
  const baseX = useTransform(scrollYProgress, [0, 0.5], [reduce ? 0 : 9, 0]);
  const tiltX = useSpring(useTransform(py, [-1, 1], [2, -2]), SPRING);
  const tiltY = useSpring(useTransform(px, [-1, 1], [-3, 3]), SPRING);
  const rotateX = useTransform(() => baseX.get() + tiltX.get());
  const depth = useTransform(scrollYProgress, [0, 0.5], [1, 0.4]);

  return (
    <div
      ref={stage}
      className="relative mt-14 [perspective:2200px] sm:mt-16"
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse" || !stage.current) return;
        const r = stage.current.getBoundingClientRect();
        px.set(((e.clientX - r.left) / r.width) * 2 - 1);
        py.set(((e.clientY - r.top) / r.height) * 2 - 1);
      }}
      onPointerLeave={() => (px.set(0), py.set(0))}
    >
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}>
        <motion.div style={{ rotateX, rotateY: tiltY, transformStyle: "preserve-3d", transformOrigin: "50% 0%" }} className="relative">
          <DashboardMock />
          <Layer z={90} depth={depth} className="-right-4 top-[14%] w-[250px] max-md:hidden xl:-right-10">
            <LeadToast />
          </Layer>
          <Layer z={120} depth={depth} className="-left-4 bottom-[10%] w-[260px] max-md:hidden xl:-left-10">
            <OfferChip />
          </Layer>
        </motion.div>
      </motion.div>
    </div>
  );
}

function Layer({ z, depth, className, children }: { z: number; depth: MotionValue<number>; className?: string; children: React.ReactNode }) {
  const tz = useTransform(depth, (d) => `translateZ(${z * d}px)`);
  return (
    <motion.div className={cn("absolute", className)} style={{ transform: tz, transformStyle: "preserve-3d" }}>
      {children}
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
    <div className="overflow-hidden rounded-xl border border-line bg-panel shadow-[0_1px_2px_rgb(0_0_0/.06),0_32px_80px_-32px_rgb(0_0_0/calc(.25*var(--sh-a)))] sm:rounded-2xl">
      <div className="flex h-9 items-center gap-2 border-b border-line px-4" aria-hidden>
        <span className="h-2.5 w-2.5 rounded-full bg-line-2" />
        <span className="h-2.5 w-2.5 rounded-full bg-line-2" />
        <span className="h-2.5 w-2.5 rounded-full bg-line-2" />
        <span className="mx-auto rounded-md bg-panel-2 px-6 py-0.5 text-[10.5px] text-fg-3">app.fitflow.demo</span>
      </div>
      <div className="flex">
        <div className="hidden w-14 shrink-0 flex-col items-center gap-3 border-r border-line py-4 sm:flex" aria-hidden>
          {nav.map((I, i) => (
            <span key={i} className={cn("grid h-8 w-8 place-items-center rounded-lg", i === 0 ? "bg-lime/15 text-lime-fg" : "text-fg-3")}>
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
              <div key={x.l} className={cn("rounded-xl border bg-panel-2/40 p-2.5 sm:rounded-2xl sm:p-3.5", x.accent ? "border-lime-fg/30" : "border-line")}>
                <p className="text-[10px] text-fg-3 sm:text-[11px]">{x.l}</p>
                <p className="mt-1 font-display text-[17px] font-semibold tabular sm:text-[24px]">{x.v}</p>
                {x.d !== null && hydrated && <p className={cn("text-[9.5px] sm:text-[10.5px]", x.d >= 0 ? "text-ok" : "text-bad")}>{x.d >= 0 ? "↗ +" : "↘ "}{Math.round(x.d * 100)}%</p>}
              </div>
            ))}
          </div>
          <div className="mt-3 grid gap-3 sm:mt-4 sm:grid-cols-[1.7fr_1fr]">
            <div className="rounded-xl border border-line bg-panel-2/40 p-3 sm:rounded-2xl sm:p-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-fg-2 sm:text-[12px]">Leads per month</p>
                <span className="text-[10px] text-fg-3">12 months</span>
              </div>
              <div className="mt-3 flex h-[86px] items-end gap-1.5 sm:h-[124px] sm:gap-2" aria-hidden>
                {s.map((b, i) => (
                  <motion.div key={b.key} className={cn("flex-1 rounded-t-[4px]", i === s.length - 1 ? "bg-s1" : "bg-s1/35")} initial={{ height: 0 }} animate={{ height: hydrated ? `${(b.leads / max) * 100}%` : "8%" }} transition={{ duration: 0.9, ease: EASE, delay: 0.8 + i * 0.04 }} />
                ))}
              </div>
            </div>
            <div className="hidden rounded-2xl border border-line bg-panel-2/40 p-4 sm:block">
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
                      <div className="mt-1 h-1.5 rounded-full bg-line">
                        <motion.div className="h-full rounded-full bg-s1" style={{ opacity: 1 - i * 0.18 }} initial={{ width: 0 }} animate={{ width: `${Math.min(100, n * 8)}%` }} transition={{ duration: 0.9, ease: EASE, delay: 1 + i * 0.08 }} />
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
    <div className="rounded-2xl border border-line bg-panel p-3.5 shadow-pop">
      <div className="flex items-center gap-2.5">
        <span className="relative">
          <Avatar name={l?.name ?? "Priya Sharma"} size={34} />
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-panel bg-s1" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[12.5px] font-semibold">New lead · {l?.name.split(" ")[0] ?? "Priya"}</p>
          <p className="truncate text-[11px] text-fg-3">via {l?.source ?? "Instagram"} · just now</p>
        </div>
      </div>
      <p className="mt-2.5 line-clamp-2 rounded-xl bg-panel-2 px-3 py-2 text-[11.5px] leading-snug text-fg-2">&ldquo;{l?.goal ?? "Lose 8 kg before my wedding in March"}&rdquo;</p>
    </div>
  );
}

function OfferChip() {
  return (
    <div className="rounded-2xl border border-lime-fg/30 bg-panel p-4 shadow-pop">
      <p className="flex items-center gap-1.5 text-[11px] font-medium text-lime-fg">
        <Sparkles size={12} /> AI offer drafted
      </p>
      <p className="mt-1.5 font-display text-[15px] font-semibold leading-tight">12-Week Strength Foundations</p>
      <div className="mt-2.5 flex items-center justify-between">
        <span className="font-display text-[18px] font-semibold">{rupees(14999)}</span>
        <span className="rounded-md bg-ok/15 px-2 py-0.5 text-[10px] font-medium text-ok">Claims check ✓</span>
      </div>
    </div>
  );
}

