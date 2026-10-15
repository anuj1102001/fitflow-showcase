"use client";

import { AnimatePresence, motion, useInView, useScroll, useTransform } from "motion/react";
import { ArrowRight, AtSign, Check, ChevronDown, FileSpreadsheet, Lightbulb, Megaphone, MessageCircle, NotebookPen, ShieldCheck, Sparkles, Users, Wand2, BarChart3, Ban, Eye, HandHeart } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { EASE, Reveal, Stagger, StaggerItem } from "@/components/motion/kit";
import { buttonClass } from "@/components/ui/button";
import { LiquidButton } from "@/components/ui/liquid-button";
import { cn } from "@/components/ui/cn";
import { Logo } from "@/components/ui/logo";
import { img } from "@/lib/images";

export function SectionIntro({ eyebrow, title, body, center = false, className }: { eyebrow: string; title: React.ReactNode; body?: React.ReactNode; center?: boolean; className?: string }) {
  return (
    <Reveal className={cn(center ? "mx-auto max-w-3xl text-center" : "max-w-3xl", className)} y={16}>
      <p className="text-[13px] font-medium text-fg-3">{eyebrow}</p>
      <h2 className="mt-3 text-balance text-[32px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[44px]">{title}</h2>
      {body && <p className={cn("mt-4 text-balance text-[16.5px] leading-relaxed text-fg-2 sm:text-[17px]", center ? "mx-auto max-w-2xl" : "max-w-2xl")}>{body}</p>}
    </Reveal>
  );
}

/* ------------------------------------------------------------------ problem */

const SCATTER = [
  { icon: <AtSign size={14} />, label: "Instagram DM", text: "Hey! How much is your coaching?", x: -150, y: -70, r: -8 },
  { icon: <MessageCircle size={14} />, label: "WhatsApp", text: "Can we start after Diwali?", x: 140, y: -95, r: 7 },
  { icon: <FileSpreadsheet size={14} />, label: "leads_final_v3.xlsx", text: "Row 48: follow up???", x: -120, y: 85, r: 5 },
  { icon: <NotebookPen size={14} />, label: "Notes app", text: "Priya: call Thu? or Fri", x: 160, y: 70, r: -6 },
  { icon: <Megaphone size={14} />, label: "Comment", text: "Price pls 🙏", x: 10, y: -150, r: 3 },
];

export function Problem() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "center 45%"] });
  const summaryOpacity = useTransform(scrollYProgress, [0.75, 1], [0, 1]);
  const summaryY = useTransform(scrollYProgress, [0.75, 1], [20, 0]);
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
        <div>
          <SectionIntro
            center={false}
            eyebrow="The problem"
            title={
              <>
                Coaching is the easy part. <span className="text-fg-3">The follow-up isn&apos;t.</span>
              </>
            }
            body="Independent coaches run sales from DMs, spreadsheets and memory. Interested people rarely say no; they go quiet when nobody checks back in, and clients drift the same way after a tough week."
          />
          <Stagger className="mt-9 space-y-3" gap={0.08}>
            {[
              { t: "Follow-ups get forgotten", b: "A “let me think about it” turns into silence when nobody checks back in." },
              { t: "Leads are scattered", b: "Enquiries arrive across Instagram, WhatsApp, comments and referrals, with no single list or next step." },
              { t: "Templates sound like templates", b: "Copy-pasted messages ignore what the person actually said, so they get ignored back." },
              { t: "Clients drift quietly", b: "A missed week becomes a missed month, and the first sign is a cancelled renewal." },
            ].map((p) => (
              <StaggerItem key={p.t} className="flex gap-4 rounded-2xl border border-line bg-panel/60 p-4">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-bad/80" aria-hidden />
                <div>
                  <p className="text-[15px] font-semibold">{p.t}</p>
                  <p className="mt-0.5 text-[14px] leading-relaxed text-fg-2">{p.b}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <p className="mt-6 text-[12.5px] text-fg-3">Design hypotheses from desk research and common coach workflows. Not validated with user research.</p>
        </div>

        {/* Scatter → order: scroll-linked */}
        <div ref={ref} className="relative mx-auto h-[460px] w-full max-w-[520px]">
          <div className="absolute inset-0 overflow-hidden rounded-2xl border border-line">
            <img src={img("coachingSession", 1100)} alt="A coach working with a client in the gym" className="h-full w-full object-cover opacity-35" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-b from-bg/40 via-bg/70 to-bg" />
          </div>
          {SCATTER.map((s, i) => (
            <ScatterCard key={s.label} s={s} i={i} progress={scrollYProgress} />
          ))}
          <motion.div style={{ opacity: summaryOpacity, y: summaryY }} className="absolute inset-x-6 bottom-6 flex items-center gap-3 rounded-2xl border border-lime-fg/40 bg-panel p-3.5 backdrop-blur">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-lime text-lime-ink">
              <Users size={17} />
            </span>
            <div>
              <p className="text-[13.5px] font-semibold">5 enquiries → 1 pipeline</p>
              <p className="text-[12px] text-fg-3">Every lead, source and follow-up date in one place</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ScatterCard({ s, i, progress }: { s: (typeof SCATTER)[number]; i: number; progress: ReturnType<typeof useScroll>["scrollYProgress"] }) {
  const x = useTransform(progress, [0, 0.8], [s.x, 0]);
  const y = useTransform(progress, [0, 0.8], [s.y, -140 + i * 54]);
  const rotate = useTransform(progress, [0, 0.8], [s.r, 0]);
  const scale = useTransform(progress, [0, 0.8], [1, 0.96]);
  return (
    <motion.div style={{ x, y, rotate, scale }} className="absolute left-1/2 top-1/2 -ml-[150px] -mt-6 w-[300px]">
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-panel px-3.5 py-3 shadow-[0_20px_50px_-20px_rgba(0,0,0,.9)] backdrop-blur">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line bg-panel-2 text-fg-2">{s.icon}</span>
        <div className="min-w-0">
          <p className="text-[11px] text-fg-3">{s.label}</p>
          <p className="truncate text-[13px] text-fg">{s.text}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ AI */

export function AISection() {
  return (
    <section id="ai" className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro eyebrow="AI capabilities" title={<>AI that handles the busywork, <span className="text-fg-3">not the coaching.</span></>} body="Three focused assistants, each tied to a real moment in a coach's week. Every output is an editable draft." />
        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {[
            { icon: <Wand2 size={20} />, t: "Offer drafting", b: "Turns a goal, audience, format and price into a titled, structured offer with benefits, a call to action and pricing guidance.", demo: ["Goal: Build strength", "Audience: Desk workers", "→ “12-Week Strength Foundations”"] },
            { icon: <MessageCircle size={20} />, t: "Follow-up writing", b: "Drafts a personal message from the lead's goal, stage and last contact, in your tone, for WhatsApp, Instagram or email.", demo: ["Stage: Proposal sent · 4 days quiet", "Tone: Warm", "→ “Just checking in on the plan…”"] },
            { icon: <Lightbulb size={20} />, t: "Business insights", b: "Answers plain-English questions about sources, offers, clients and trends, with links straight to the screen that matters.", demo: ["“Which source converts best?”", "→ Compares conversion by channel", "→ Links to the analytics view"] },
          ].map((c, i) => (
            <Reveal key={c.t} delay={i * 80}>
              <article className="card panel-sheen group h-full p-6 transition hover:border-line-2 sm:p-7">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-lime text-lime-ink">{c.icon}</span>
                <h3 className="mt-5 text-[21px] font-semibold">{c.t}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-fg-2">{c.b}</p>
                <div className="mt-6 space-y-1.5 rounded-2xl border border-line bg-panel-2/50 p-4 font-mono text-[12px]">
                  {c.demo.map((d, j) => (
                    <p key={d} className={j === c.demo.length - 1 || d.startsWith("→") ? "text-lime-fg" : "text-fg-3"}>
                      {d}
                    </p>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-4">
          <div className="grid gap-4 rounded-2xl border border-line bg-panel/50 p-6 sm:grid-cols-2 sm:p-7 lg:grid-cols-4">
            {[
              { icon: <ShieldCheck size={18} />, t: "Claims check", b: "Flags guarantees, medical and “miracle” language before anything is published." },
              { icon: <Eye size={18} />, t: "Human in the loop", b: "Every output is a draft you can edit. Nothing is published or sent automatically." },
              { icon: <Ban size={18} />, t: "No auto-messaging", b: "FITFLOW drafts; you send from your own WhatsApp, Instagram or email." },
              { icon: <HandHeart size={18} />, t: "Minimal data", b: "Designed to share only what a draft needs: first name, goal and stage, never contact details." },
            ].map((g) => (
              <div key={g.t} className="flex gap-3">
                <span className="mt-0.5 text-lime-fg">{g.icon}</span>
                <div>
                  <p className="text-[14.5px] font-semibold">{g.t}</p>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-fg-2">{g.b}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
        <p className="mt-4 text-center text-[12.5px] text-fg-3">In this prototype, AI outputs are simulated with templates and sample data so the demo works offline without a paid model.</p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ pricing */

const PLANS = [
  { name: "Starter", price: "₹0", per: "forever", blurb: "For coaches testing the waters.", features: ["Lead pipeline up to 50 leads", "Today queue", "1 sequence", "10 AI drafts a month"] },
  { name: "Pro", price: "₹999", per: "per month", blurb: "For coaches growing a client base.", features: ["Unlimited leads & clients", "All sequences, including Client rescue", "200 AI drafts a month", "Bookings & client check-ins", "Full analytics & insights"], featured: true },
  { name: "Studio", price: "₹2,499", per: "per month", blurb: "For small teams and studios.", features: ["Everything in Pro", "Up to 5 coach seats", "Shared pipeline & assignments", "Priority support"] },
];

export function Pricing() {
  const [yearly, setYearly] = useState(false);
  return (
    <section id="pricing" className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro center eyebrow="Pricing concept" title="Simple plans that grow with you." body="Illustrative pricing to show how the product could be packaged. This is a portfolio prototype: nothing here is for sale." />
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-full border border-line bg-panel p-1 text-[13px]" role="tablist" aria-label="Billing period">
            {["Monthly", "Yearly"].map((p) => {
              const on = (p === "Yearly") === yearly;
              return (
                <button key={p} role="tab" aria-selected={on} onClick={() => setYearly(p === "Yearly")} className={cn("relative rounded-md px-4 py-1.5 font-medium transition-colors", on ? "text-lime-ink" : "text-fg-2 hover:text-fg")}>
                  {on && <motion.span layoutId="billing" className="absolute inset-0 rounded-full bg-lime" transition={{ type: "spring", stiffness: 300, damping: 28 }} />}
                  <span className="relative">
                    {p}
                    {p === "Yearly" && <span className={cn("ml-1.5 text-[11px]", on ? "text-lime-ink/70" : "text-lime-fg")}>2 months free</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="mx-auto mt-10 grid max-w-5xl gap-4 lg:grid-cols-3">
          {PLANS.map((p, i) => {
            const monthly = Number(p.price.replace(/[^\d]/g, ""));
            const shown = yearly && monthly ? `₹${Math.round((monthly * 10) / 12).toLocaleString("en-IN")}` : p.price;
            return (
              <Reveal key={p.name} delay={i * 80}>
                <article className={cn("relative flex h-full flex-col rounded-2xl border p-7", p.featured ? "border-fg/70 bg-panel shadow-pop" : "border-line bg-panel")}>
                  {p.featured && <span className="absolute -top-3 left-7 rounded-md bg-lime px-3 py-1 text-[11.5px] font-semibold text-lime-ink">Most popular</span>}
                  <h3 className="text-[19px] font-semibold">{p.name}</h3>
                  <p className="mt-1 text-[14px] text-fg-3">{p.blurb}</p>
                  <p className="mt-6 flex items-baseline gap-1.5">
                    <AnimatePresence mode="wait">
                      <motion.span key={shown} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="font-display text-[44px] font-semibold tracking-[-0.04em]">
                        {shown}
                      </motion.span>
                    </AnimatePresence>
                    <span className="text-[14px] text-fg-3">{monthly ? (yearly ? "/mo, billed yearly" : "/month") : p.per}</span>
                  </p>
                  <ul className="mt-6 flex-1 space-y-3 border-t border-line pt-6">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-2.5 text-[14.5px]">
                        <Check size={17} className="mt-0.5 shrink-0 text-lime-fg" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {p.featured ? (
                    <LiquidButton href="/app" className="mt-8 w-full">
                      Try it in the demo
                    </LiquidButton>
                  ) : (
                    <Link href="/app" className={buttonClass({ variant: "secondary" }, "mt-8 w-full")}>
                      Try it in the demo
                    </Link>
                  )}
                </article>
              </Reveal>
            );
          })}
        </div>
        <p className="mt-6 text-center text-[12.5px] text-fg-3">Concept pricing only. No payments are processed anywhere in this prototype.</p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ FAQ */

const FAQ = [
  { q: "Is FITFLOW a real product?", a: "It's a product design and front-end prototype built as a portfolio project. Everything you see works in your browser with a fictional coach and sample data, but there are no real accounts, payments or messages." },
  { q: "Who is it designed for?", a: "Independent fitness coaches, personal trainers and fitness creators who sell coaching online or in person, and currently manage leads through DMs, WhatsApp and spreadsheets." },
  { q: "Does the AI actually run?", a: "No. AI features are simulated with templates and the demo's own data, so the prototype works offline at no cost. The case study explains how a production version would use a language model with guardrails." },
  { q: "Will my changes be saved?", a: "Yes, in your browser's local storage, so you can refresh and continue. Use “Reset” in the demo to load fresh sample data. Nothing is sent to a server." },
  { q: "Does FITFLOW send messages for me?", a: "No, by design. It decides who to follow up and when, and drafts the message with its reasoning shown. You read it, edit it and send it yourself on WhatsApp, Instagram or email, then tell FITFLOW you sent it." },
  { q: "What happens when someone replies?", a: "Mark them as replied and their sequence pauses straight away. They move to the top of Today so your next message is a personal one, not the next automated step." },
  { q: "Does it work on mobile?", a: "Yes. The landing page and the whole app are responsive. Coaches live on their phones, so Today and the composer are designed to work one-handed." },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
        <SectionIntro center={false} eyebrow="FAQ" title="Questions, answered honestly." body={<>Something else? Read the <Link href="/case-study" className="link">case study</Link> for the design rationale and limitations.</>} />
        <Reveal>
          <div className="divide-y divide-line rounded-2xl border border-line bg-panel">
            {FAQ.map((f, i) => (
              <div key={f.q}>
                <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-[16px] font-medium transition hover:text-fg">
                  {f.q}
                  <ChevronDown size={18} className={cn("shrink-0 text-fg-3 transition-transform duration-300", open === i && "rotate-180 text-lime-fg")} />
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }} className="overflow-hidden">
                      <p className="px-6 pb-5 text-[15px] leading-relaxed text-fg-2">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ final CTA + footer */

export function FinalCta() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <motion.div ref={ref} initial={{ opacity: 0, y: 40, rotateX: 12 }} animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}} transition={{ duration: 1, ease: EASE }} style={{ transformPerspective: 1600 }} className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl border border-line">
        <img src={img("barbellBack", 1800)} alt="" className="absolute inset-0 h-full w-full object-cover object-[50%_35%] opacity-40" loading="lazy" />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgb(var(--bg))_25%,rgb(var(--bg)/.7)_60%,rgb(var(--bg)/.3))]" />
        <div className="relative px-6 py-16 sm:px-14 sm:py-24">
          <p className="text-[13px] font-medium text-fg-2">Try it now</p>
          <h2 className="mt-4 max-w-2xl text-balance text-[38px] font-semibold leading-[1.02] tracking-[-0.04em] sm:text-[52px]">See the whole workflow in 60 seconds.</h2>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-fg-2">Clear today&apos;s queue, open a draft that explains itself, mark a reply and watch the sequence pause. No sign-up needed.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <LiquidButton href="/app">
              Open the live demo <ArrowRight size={17} />
            </LiquidButton>
            <LiquidButton href="/case-study" variant="secondary">
              <BarChart3 size={16} /> Read the case study
            </LiquidButton>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export function Footer() {
  const cols = [
    { h: "Follow-up", l: [["Today", "/app"], ["Sequences", "/app/sequences"], ["Compose", "/app/follow-ups"], ["Clients", "/app/clients"]] },
    { h: "Business", l: [["Leads CRM", "/app/leads"], ["Offer Builder", "/app/offers"], ["Analytics", "/app/analytics"], ["Assistant", "/app/assistant"]] },
    { h: "Project", l: [["Case study", "/case-study"], ["How it works", "/#workflow"], ["FAQ", "/#faq"]] },
  ];
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-fg-3">A product design and front-end prototype: the follow-up engine for fitness coaches. Fictional people, sample data, simulated AI.</p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-md border border-dashed border-line-2 px-3 py-1 text-[12px] text-fg-3">
            <Sparkles size={12} className="text-lime-fg" /> Portfolio project · not a commercial service
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <p className="text-[13px] font-semibold">{c.h}</p>
            <ul className="mt-4 space-y-2.5">
              {c.l.map(([label, href]) => (
                <li key={href}>
                  <Link href={href!} className="text-[14px] text-fg-3 transition hover:text-fg">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-[12.5px] text-fg-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} FITFLOW AI prototype</span>
          <span>
            Photography from{" "}
            <a href="https://unsplash.com/license" target="_blank" rel="noreferrer" className="underline-offset-2 hover:text-fg hover:underline">
              Unsplash
            </a>
            . People pictured are not the fictional coaches named in the demo.
          </span>
        </div>
      </div>
    </footer>
  );
}
