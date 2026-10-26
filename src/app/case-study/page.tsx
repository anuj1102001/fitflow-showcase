import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Check, Code2, X } from "lucide-react";
import Link from "next/link";
import { LiquidButton } from "@/components/ui/liquid-button";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Case study",
  description: "How FITFLOW AI was designed: why it focuses on follow-up, the Today queue, sequences that pause on reply, drafts that explain themselves, and the trade-offs behind an interactive SaaS prototype.",
};

const SHOTS = [
  { src: "/screens/landing.jpg", cap: "Landing page: the promise in one line, with the product shot settling flat as you scroll." },
  { src: "/screens/engine.jpg", cap: "The follow-up engine on the landing page: click a sequence step to see the real draft it produces, with its reasoning." },
  { src: "/screens/today.jpg", cap: "Today, the app's home: who to message and why, ranked. Replies first, then due sequence steps, overdue leads and slipping clients." },
  { src: "/screens/compose.jpg", cap: "Compose: the draft, what it used, the checks it passed, and a preview with the personalised parts highlighted." },
  { src: "/screens/sequences.jpg", cap: "Sequences: four cadences with the reason for every step, the people in each, and sample reply rates." },
  { src: "/screens/today-dark.jpg", cap: "Today in dark mode. Every colour is a token with a Light and Dark value." },
  { src: "/screens/clients.jpg", cap: "Clients: weekly check-ins compute a status; slipping clients get a check-in draft or the rescue sequence." },
  { src: "/screens/leads.jpg", cap: "Lead pipeline: stage, source, value and follow-up urgency on every card." },
  { src: "/screens/analytics.jpg", cap: "Analytics: one filter bar drives every chart; each metric is defined on the page." },
];

const DECISIONS = [
  {
    t: "A queue, not a dashboard",
    b: "Coaches think in “who do I message today”, not in charts. The app opens on Today: a ranked list where every row says why it's there. The numbers are still one scroll away, but they're no longer the first thing.",
  },
  {
    t: "It decides who and when; you decide what's sent",
    b: "Sequences never send anything. Each step lands in Today as a draft on its day, and the coach sends it from their own WhatsApp, Instagram or email. Auto-messaging prospective clients is a trust problem, and it would sound like everyone else.",
  },
  {
    t: "Drafts that show their reasoning",
    b: "Every draft lists what it used (their name, their own words, the program they asked about, their last check-in), highlights those parts in a preview, and shows the checks it passed: no guarantees or medical claims, one easy question, short enough for a phone.",
  },
  {
    t: "A reply beats any schedule",
    b: "When someone replies, one click pauses their sequence and puts them at the top of Today. Someone waiting on you always outranks a scheduled step, so the next message is a human one.",
  },
  {
    t: "Retention is follow-up too",
    b: "The same engine runs for clients: falling adherence in weekly check-ins flags them, and a three-step rescue sequence offers a lighter week, then a reset call, before they quietly cancel.",
  },
  {
    t: "Numbers you can trust",
    b: "Every count comes from one dataset through shared, tested functions. Rates show “–” rather than 0% when there's no data, and a sequence shows no reply rate until at least three people have had a step.",
  },
];

const UX = [
  ["Follow-ups get forgotten", "Today ranks who's due; sequences schedule every next step so nothing relies on memory"],
  ["Replies get buried under scheduled messages", "Mark a reply and the sequence pauses; they jump to the top of Today"],
  ["Templates sound like templates", "Drafts built from the lead's own words and stage, with the personal parts highlighted"],
  ["Not knowing if a draft is safe to send", "Visible checks for guarantees, medical claims, length and a clear question"],
  ["Leads scattered across DMs and spreadsheets", "One pipeline with a source, stage and sequence on every lead"],
  ["Clients quietly dropping off", "Check-ins compute a status; slipping clients get a rescue sequence"],
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
        <h1 className="mt-4 text-balance text-[40px] font-semibold leading-[1.02] tracking-[-0.04em] sm:text-[60px]">FITFLOW AI: the follow-up engine for fitness influencers and creators</h1>
        <p className="mt-6 max-w-3xl text-[18px] leading-relaxed text-fg-2">
          An interactive SaaS prototype for fitness influencers and creators who coach their followers, built around one job: never letting an interested lead or a slipping client go quiet. A Today queue says who to message and why, sequences schedule every next step and pause on reply, and every draft shows its reasoning.
        </p>
        <dl className="mt-10 grid gap-4 rounded-2xl border border-line bg-panel p-6 sm:grid-cols-4">
          {[
            ["Role", "Product owner & design lead"],
            ["Scope", "Landing page, 9-screen app, follow-up engine"],
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
            I picked the problem and the users: fitness influencers and creators who sell coaching to their followers online. A lot of them run their whole business from Instagram DMs, WhatsApp and spreadsheets, so leads and follow-ups get lost. I decided what FITFLOW should do and what it shouldn&apos;t: no payments, no real data, everything clearly marked as sample, and the AI only writes drafts, it never sends anything on its own.
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
            <span>A narrated walkthrough of the main flows (1:39, synthetic voice).</span>
            <a href="https://github.com/anuj1102001/fitflow-showcase" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-medium text-fg hover:underline">
              <Code2 size={15} /> View the code on GitHub
            </a>
          </figcaption>
        </figure>

        <Section n="01" title="The problem">
          <p>
            Many fitness influencers and creators build an audience on Instagram or YouTube long before they build a business. Enquiries arrive as DMs, WhatsApp messages and comments; offers are explained one conversation at a time (“DM me for price”); follow-ups live in memory; and there is little visibility into which channel or program actually produces clients.
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
            <strong>“Every lead followed up. Every client kept.”</strong> FITFLOW runs one loop: <em>capture</em> every enquiry in a pipeline, <em>prioritise</em> who to message today, <em>follow up</em> with drafts that explain themselves, and <em>retain</em> clients with check-ins and a rescue sequence. Offers, bookings and analytics stay, as support for that loop.
          </p>
          <div className="grid gap-3 sm:grid-cols-4">
            {["Capture: lead pipeline", "Prioritise: Today queue", "Follow up: sequences + explained drafts", "Retain: check-ins + client rescue"].map((x) => (
              <div key={x} className="rounded-2xl border border-line bg-panel-2/50 p-4 text-[14px]">
                {x}
              </div>
            ))}
          </div>
          <Callout>
            <strong>Version 2 refocus.</strong> The first version was a broad “business OS” with a storefront builder and two public coach pages. It overlapped with another project of mine, a creator storefront, and tried to do too much. Version 2 cut the storefront and rebuilt the product around the moment coaches actually lose clients: the follow-up.
          </Callout>
        </Section>

        <Section n="04" title="Key flows">
          <ol className="space-y-3">
            {[
              ["Work through today", "Today → top task (a due sequence step) → Draft → read “Why this draft” and the checks → edit → send from WhatsApp → “I sent it: log step” → next step scheduled, back to Today."],
              ["A lead replies", "Today → “Replied” on their row → sequence paused → they move to the top as “waiting on you” → personal reply → book a discovery call."],
              ["Enquiry to client", "New lead → added to the New enquiry sequence → four steps over nine days, paused on reply → discovery call → proposal sequence → Won → client profile created."],
              ["Rescue a slipping client", "Check-in logs low adherence → status turns at-risk → appears in Today → draft a check-in or start Client rescue → lighter week → reset call."],
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
          <p>Warm-neutral surfaces in light mode, charcoal in dark, hairline borders, a three-step text hierarchy and one lime accent kept for primary actions and selection. Every colour is a token with a Light and a Dark value, so a theme switch is a token swap.</p>
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
              <p>Kept for editorial accents.</p>
            </Card>
            <Card title="Components">Buttons (4 variants × 4 sizes), inputs with inline validation, segmented controls with a shared sliding indicator, badges by tone, drawers, menus, dialogs, toasts, command palette, empty states and skeletons.</Card>
            <Card title="Motion">Motion (Framer) for UI micro-interactions: one easing curve, one spring. GSAP for scroll choreography: a SplitText headline reveal and a pinned, scrubbed “How it works” sequence. Everything respects “reduce motion”.</Card>
          </div>
        </Section>

        <Section n="09" title="Figma file">
          <p>
            The design system and key screens live in a Figma file that mirrors the code: colour variables with Light and Dark values (bound to every fill and stroke), a text-style ramp, spacing and radius variables, elevation styles, components with variants (Button, Badge, Text field, Nav item, Stat tile, Lead card) and screens built from those components in both themes.
          </p>
          <LiquidButton href="https://www.figma.com/design/tplM1llRbk13QxwC9bzAxU" target="_blank" variant="secondary">
            Open the Figma file <ArrowRight size={15} />
          </LiquidButton>
        </Section>

        <Section n="10" title="Build">
          <p>
            Next.js App Router with TypeScript and Tailwind. All state lives in a small Zustand store persisted to localStorage, seeded by a deterministic generator (twelve months of leads, clients and bookings, dated relative to today). Analytics and the follow-up engine (sequences, the Today queue, draft explanations) are pure functions shared across screens and covered by 17 unit tests; 13 end-to-end flows run in headless Chrome. AI features are deterministic templates over that data, so the demo runs offline at no cost. Charts use Recharts. Motion handles UI micro-interactions and GSAP (ScrollTrigger, SplitText) the scroll choreography. The theme is applied before first paint and switches instantly.
          </p>
        </Section>

        <Section n="11" title="Limitations">
          <ul className="space-y-2.5">
            {[
              "No backend: no accounts, real data, email or payments. Everything is fictional and stays in the browser.",
              "AI is simulated with templates. A production version would call a language model with the same guardrails and structured outputs.",
              "No user research or usability testing yet. All problem statements, personas and the follow-up focus are hypotheses.",
              "Reply rates and other sequence numbers come from generated sample data, not real outcomes.",
              "Nothing is sent: coaches copy each draft into their own app. A production version would need WhatsApp Business and Instagram integrations, with consent and opt-out handling.",
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
            <li>1. Five interviews with fitness creators who sell coaching online, focused on how enquiries and follow-ups are handled today.</li>
            <li>2. A task-based test of Today on a phone: can a coach clear five follow-ups in under five minutes, and do they trust the drafts enough to send them?</li>
            <li>3. Does “Why this draft” change behaviour? Compare edits and send rates with and without the explanation panel.</li>
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
            <LiquidButton href="https://github.com/anuj1102001/fitflow-showcase" target="_blank" variant="secondary">
              <Code2 size={15} /> Code
            </LiquidButton>
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
