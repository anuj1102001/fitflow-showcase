import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Check, Code2, X } from "lucide-react";
import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { LiquidButton } from "@/components/ui/liquid-button";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Case study",
  description: "How FITFLOW AI was designed: problem framing, target user, information architecture, design system, motion and the trade-offs behind an interactive SaaS prototype.",
};

const SHOTS = [
  { src: "/screens/landing.jpg", cap: "Landing page (light): editorial hero with a product shot that settles flat as you scroll." },
  { src: "/screens/landing-dark.jpg", cap: "The same page in dark mode. Every surface, text and chart colour is a token with a Light and Dark value." },
  { src: "/screens/overview.jpg", cap: "Overview: KPIs, trend, AI insights and the day's work on one screen." },
  { src: "/screens/overview-dark.jpg", cap: "Overview in dark mode." },
  { src: "/screens/leads.jpg", cap: "Lead CRM: drag-and-drop pipeline with source, value and follow-up urgency on every card." },
  { src: "/screens/offer-builder.jpg", cap: "AI Offer Builder: five guided steps, then an editable draft with a live preview." },
  { src: "/screens/storefront-builder.jpg", cap: "Storefront builder: theme, content and sections, previewed on desktop and phone in 3D." },
  { src: "/screens/analytics.jpg", cap: "Analytics: one filter bar drives every chart; each metric is defined on the page." },
  { src: "/screens/storefront-bloom.jpg", cap: "A second storefront theme (Bloom) for a yoga coach: same component, different art direction." },
];

const DECISIONS = [
  {
    t: "Pipeline first, not a contacts list",
    b: "Coaches think in “who do I need to message today”, not in records. The CRM opens on a board grouped by stage, every card shows its follow-up urgency, and a “Due” view lists only what needs action.",
  },
  {
    t: "AI as drafts, never as actions",
    b: "Every AI output lands in an editable field with a clear “not sent” label. Messages are copied and sent by the coach. This keeps the coach's voice and avoids the trust problem of auto-messaging prospective clients.",
  },
  {
    t: "Guardrails visible in the UI",
    b: "Fitness marketing is prone to guarantees and medical claims. The Offer Builder runs a visible claims check and the pricing step explains its suggestion, rather than hiding judgement inside a black box.",
  },
  {
    t: "One storefront component, many art directions",
    b: "Storefronts are built with container queries, so the same component renders correctly full-screen, inside a phone frame, inside a scaled desktop frame and on the landing page. Themes are token sets, not separate templates.",
  },
  {
    t: "Numbers you can trust",
    b: "Every KPI and chart is derived from one dataset through shared functions, metric definitions are shown next to the numbers, rates show “–” rather than 0% when there's no data, and anything sample is labelled as such.",
  },
  {
    t: "CSS 3D + GSAP over WebGL",
    b: "The brief asked for depth and 3D. A WebGL scene would add ~600 KB and still need a fallback. Layered CSS transforms with spring-driven parallax give the same sense of depth, stay crisp for text, and degrade to flat layouts with reduced motion.",
  },
];

const UX = [
  ["Leads lost across DMs and spreadsheets", "One pipeline with a source on every lead and storefront enquiries that land automatically"],
  ["Forgotten follow-ups", "Follow-up dates on every open lead, overdue highlighting, a “Due” view and dashboard reminders"],
  ["Blank-page offer writing", "Guided five-step builder with price guidance, editable output and a claims check"],
  ["Writer's block on follow-up messages", "Drafts from the lead's goal and stage, with tone and channel controls"],
  ["No idea what's working", "Source and offer conversion, a cohort funnel and month-on-month comparison"],
  ["Clients quietly dropping off", "Weekly check-ins compute an on-track / attention / at-risk status that surfaces on the dashboard"],
];

export default function CaseStudy() {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-[14px] text-fg-2 transition hover:text-fg">
            <ArrowLeft size={15} /> <Logo compact />
          </Link>
          <LiquidButton href="/app" size="sm">
            Open live demo <ArrowRight size={14} />
          </LiquidButton>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-5xl px-4 pb-24 pt-14 sm:px-6 sm:pt-20">
        <p className="eyebrow">Case study · product design & front-end</p>
        <h1 className="mt-4 text-balance text-[40px] font-semibold leading-[1.02] tracking-[-0.04em] sm:text-[60px]">FITFLOW AI: a business OS for fitness coaches</h1>
        <p className="mt-6 max-w-3xl text-[18px] leading-relaxed text-fg-2">
          An interactive SaaS prototype that helps independent fitness coaches turn an online audience into paying clients: offers, a storefront, a lead pipeline, AI-drafted follow-ups, bookings, client tracking and analytics in one workspace.
        </p>
        <dl className="mt-10 grid gap-4 rounded-2xl border border-line bg-panel p-6 sm:grid-cols-4">
          {[
            ["Role", "Product owner & design lead"],
            ["Scope", "Landing page, 9-screen app, 2 storefronts"],
            ["Stack", "Figma, Next.js, TypeScript, Tailwind, GSAP, Motion"],
            ["Type", "Portfolio prototype with sample data"],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-[12.5px] text-fg-3">{k}</dt>
              <dd className="mt-1 text-[14.5px] font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 rounded-2xl border border-line bg-panel-2/50 p-6">
          <p className="text-[16px] font-semibold">My role</p>
          <p className="mt-2 text-[15px] leading-relaxed text-fg-2">
            I picked the problem and the users: fitness coaches who sell coaching online. A lot of them run their whole business from Instagram DMs, WhatsApp and spreadsheets, so leads and follow-ups get lost. I decided what FITFLOW should do and what it shouldn&apos;t: no payments, no real data, everything clearly marked as sample, and the AI only writes drafts, it never sends anything on its own.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-fg-2">
            I reviewed every version of the design. When the first version looked too much like an AI-made template, I pushed it toward a cleaner, Figma-based product design, added light and dark mode, and asked for proper scroll animations with GSAP.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-fg-2">
            I built it with Claude Code, an AI coding agent. I gave the direction and checked every step; the agent wrote most of the code, the Figma file and the tests. Ask me about any decision on this page and I&apos;ll walk you through it.
          </p>
        </div>

        <figure className="mt-10">
          <video src="/walkthrough.mp4" poster="/screens/landing.jpg" controls playsInline preload="none" className="w-full rounded-2xl border border-line bg-panel" />
          <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[14px] text-fg-3">
            <span>A narrated walkthrough of the main flows (1:45, synthetic voice).</span>
            <a href="https://github.com/anuj1102001/fitflow-showcase" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-medium text-fg hover:underline">
              <Code2 size={15} /> View the code on GitHub
            </a>
          </figcaption>
        </figure>

        <Section n="01" title="The problem">
          <p>
            Many fitness coaches build an audience on Instagram or YouTube long before they build a business. Enquiries arrive as DMs, WhatsApp messages and comments; offers are explained one conversation at a time (“DM me for price”); follow-ups live in memory; and there is little visibility into which channel or program actually produces clients.
          </p>
          <p>Generic CRMs and website builders cover pieces of this, but they are built for sales teams or online stores, not for one person selling a 12-week coaching program from their phone.</p>
          <Callout>
            <strong>Honesty note:</strong> the problem framing comes from desk research and common coach workflows. I did not run user interviews or usability tests for this prototype, so the points below are <em>design hypotheses</em>, not validated findings.
          </Callout>
        </Section>

        <Section n="02" title="Target user (proto-persona)">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card title="Aarav, 31, strength coach (fictional)">
              Coaches 15–25 online and hybrid clients from Bengaluru. Gets most enquiries through Instagram. Sells three programs between ₹6k and ₹25k. Works from his phone between sessions.
            </Card>
            <Card title="Jobs to be done">
              <ul className="space-y-1.5">
                <li>• Explain what I offer and what it costs, clearly</li>
                <li>• Never let an interested person go cold</li>
                <li>• Know who to message and coach today</li>
                <li>• See which content and programs bring clients</li>
              </ul>
            </Card>
          </div>
        </Section>

        <Section n="03" title="Value proposition & product scope">
          <p>
            <strong>“Turn followers into paying clients.”</strong> FITFLOW follows the path a follower takes: <em>attract</em> with a storefront, <em>capture</em> every enquiry in a pipeline, <em>follow up</em> with AI-drafted messages, and <em>convert & coach</em> with plans and check-ins. I kept scope to eight features that each map to one step of that journey, and cut anything that didn&apos;t (content scheduling, payments, community).
          </p>
          <div className="grid gap-3 sm:grid-cols-4">
            {["Attract: storefront + offer builder", "Capture: lead CRM", "Follow up: AI drafts + bookings", "Convert: clients + analytics + assistant"].map((x) => (
              <div key={x} className="rounded-2xl border border-line bg-panel-2/50 p-4 text-[14px]">
                {x}
              </div>
            ))}
          </div>
        </Section>

        <Section n="04" title="Key flows">
          <ol className="space-y-3">
            {[
              ["Create and publish an offer", "Offer Builder → goal → audience → format → price (with guidance) → generate → edit → publish → appears on the storefront."],
              ["Enquiry to client", "Storefront enquiry → new lead + notification → draft follow-up → book discovery call → move to Proposal → Won → client profile created."],
              ["Weekly client care", "Clients → at-risk filter → review adherence chart → log check-in → status recalculates → dashboard insight updates."],
              ["Answer a business question", "Assistant → “Which lead source is performing best?” → answer computed from the same data → link to filtered analytics."],
            ].map(([t, b], i) => (
              <li key={t} className="flex gap-4 rounded-2xl border border-line bg-panel p-5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-lime font-mono text-[12px] font-bold text-lime-ink">{i + 1}</span>
                <div>
                  <p className="font-semibold">{t}</p>
                  <p className="mt-1 text-[14.5px] text-fg-2">{b}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section n="05" title="Screens">
          <div className="space-y-8">
            {SHOTS.map((s) => (
              <figure key={s.src}>
                <img src={s.src} alt={s.cap} loading="lazy" className="w-full rounded-2xl border border-line" />
                <figcaption className="mt-3 text-[14px] text-fg-3">{s.cap}</figcaption>
              </figure>
            ))}
          </div>
        </Section>

        <Section n="06" title="Design decisions">
          <div className="grid gap-4 sm:grid-cols-2">
            {DECISIONS.map((d) => (
              <Card key={d.t} title={d.t}>
                {d.b}
              </Card>
            ))}
          </div>
        </Section>

        <Section n="07" title="UX problems addressed">
          <div className="overflow-hidden rounded-2xl border border-line">
            {UX.map(([p, s], i) => (
              <div key={p} className={`grid gap-2 p-5 sm:grid-cols-2 sm:gap-6 ${i ? "border-t border-line" : ""}`}>
                <p className="flex gap-2 text-[14.5px] text-fg-2">
                  <X size={16} className="mt-0.5 shrink-0 text-bad" /> {p}
                </p>
                <p className="flex gap-2 text-[14.5px]">
                  <Check size={16} className="mt-0.5 shrink-0 text-lime-fg" /> {s}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section n="08" title="Design system">
          <p>Warm-neutral surfaces in light mode, charcoal in dark, hairline borders, a three-step text hierarchy and one lime accent kept for primary actions and selection. Every colour is a token with a Light and a Dark value, so a theme switch (or a storefront theme) is a token swap.</p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {[
              ["bg", "#F6F6F3", "#0A0B0D"],
              ["panel", "#FFFFFF", "#121417"],
              ["panel-2", "#F1F1ED", "#1A1C20"],
              ["line", "#E4E4DE", "#25282D"],
              ["fg", "#141512", "#F2F3EE"],
              ["lime", "#C8F04A", "#C8F04A"],
            ].map(([n, l, d]) => (
              <div key={n}>
                <div className="flex h-16 overflow-hidden rounded-2xl border border-line">
                  <div className="flex-1" style={{ background: l }} />
                  <div className="flex-1" style={{ background: d }} />
                </div>
                <p className="mt-2 text-[13px] font-medium">{n}</p>
                <p className="font-mono text-[11.5px] text-fg-3">
                  {l} / {d}
                </p>
              </div>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card title="Type">
              <p className="text-[26px] font-semibold tracking-[-0.03em]">Geist</p>
              <p className="mt-1">Everything from display to captions, with tabular numbers.</p>
              <p className="mt-3 font-mono text-[13px]">Geist Mono</p>
              <p>Code-like labels.</p>
              <p className="mt-3 text-[17px]" style={{ fontFamily: "var(--font-fraunces)" }}>Fraunces</p>
              <p>Only the Bloom storefront theme.</p>
            </Card>
            <Card title="Components">Buttons (4 variants × 4 sizes), inputs with inline validation, segmented controls with a shared sliding indicator, badges by tone, drawers, menus, dialogs, toasts, command palette, empty states and skeletons.</Card>
            <Card title="Motion">Motion (Framer) for UI micro-interactions: one easing curve, one spring. GSAP for scroll choreography: a SplitText headline reveal and a pinned, scrubbed “How it works” sequence. Everything respects “reduce motion”.</Card>
          </div>
        </Section>

        <Section n="09" title="Figma file">
          <p>
            The design system and key screens live in a Figma file that mirrors the code: colour variables with Light and Dark values (bound to every fill and stroke), a text-style ramp, spacing and radius variables, elevation styles, components with variants (Button, Badge, Text field, Nav item, Stat tile, Lead card) and screens built from those components in both themes.
          </p>
          <a href="https://www.figma.com/design/tplM1llRbk13QxwC9bzAxU" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-[10px] border border-line bg-panel px-4 py-2.5 text-[14px] font-semibold text-fg transition hover:border-line-2">
            Open the Figma file <ArrowRight size={15} />
          </a>
        </Section>

        <Section n="10" title="Build">
          <p>
            Next.js App Router with TypeScript and Tailwind. All state lives in a small Zustand store persisted to localStorage, seeded by a deterministic generator (twelve months of leads, clients and bookings, dated relative to today). Analytics are pure functions shared by the dashboard, analytics page and assistant. AI features are deterministic templates over that data, so the demo runs offline at no cost. Charts use Recharts. Motion handles UI micro-interactions and GSAP (ScrollTrigger, SplitText) the scroll choreography. The theme is applied before first paint and switches instantly.
          </p>
        </Section>

        <Section n="11" title="Limitations">
          <ul className="space-y-2.5">
            {[
              "No backend: no accounts, real data, email or payments. Everything is fictional and stays in the browser.",
              "AI is simulated with templates. A production version would call a language model with the same guardrails and structured outputs.",
              "No user research or usability testing yet. All problem statements and personas are hypotheses.",
              "Pricing is a concept for packaging, not a validated price point.",
              "Drag-and-drop on the pipeline uses native HTML drag events (desktop). On touch devices, stages are changed from the lead panel.",
              "Photos are Unsplash images; the people pictured are not the fictional coaches.",
            ].map((x) => (
              <li key={x} className="flex gap-2.5 text-[15px] text-fg-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-fg-3" /> {x}
              </li>
            ))}
          </ul>
        </Section>

        <Section n="12" title="What I'd validate next">
          <ol className="space-y-2.5 text-[15px] text-fg-2">
            <li>1. Five interviews with coaches who sell online, focused on how enquiries and follow-ups are handled today.</li>
            <li>2. A task-based test of the enquiry-to-client flow on a phone, measuring time to first follow-up.</li>
            <li>3. A comprehension test of offer cards: can a prospect say what&apos;s included and what it costs in 10 seconds?</li>
            <li>4. Willingness-to-pay conversations before committing to the pricing concept.</li>
          </ol>
        </Section>

        <div className="mt-20 flex flex-col items-start gap-3 rounded-2xl border border-line bg-panel p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[20px] font-semibold">See it for yourself</p>
            <p className="mt-1 text-fg-2">Every screen above is live and clickable.</p>
          </div>
          <div className="flex gap-2">
            <LiquidButton href="/app">
              Open the demo <ArrowRight size={15} />
            </LiquidButton>
            <a href="https://github.com/anuj1102001/fitflow-showcase" target="_blank" rel="noreferrer" className={buttonClass({ variant: "secondary" })}>
              <Code2 size={15} /> Code
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-20">
      <p className="font-mono text-[12px] text-lime-fg">{n}</p>
      <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.03em] sm:text-[34px]">{title}</h2>
      <div className="mt-6 space-y-5 text-[16px] leading-relaxed text-fg-2 [&_strong]:text-fg">{children}</div>
    </section>
  );
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-6">
      <p className="text-[16px] font-semibold text-fg">{title}</p>
      <div className="mt-2 text-[14.5px] leading-relaxed text-fg-2">{children}</div>
    </div>
  );
}
function Callout({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl border border-warn/25 bg-warn/[.07] px-5 py-4 text-[14.5px] text-fg-2">{children}</p>;
}
