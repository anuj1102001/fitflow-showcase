# FITFLOW AI: the follow-up engine for fitness influencers and creators (product prototype)

An interactive SaaS product prototype for fitness influencers and creators who coach their followers, built around one job: never letting an interested lead or a slipping client go quiet. A Today queue says who to message and why, sequences schedule every next step and pause when someone replies, and every draft shows its reasoning. The creator always sends the message.

> **Portfolio project.** A fictional fitness creator, sample data, simulated AI. There is no backend, no accounts, no payments and no messages are ever sent. Everything runs in the browser.

**Live demo: [fitflow-showcase.vercel.app](https://fitflow-showcase.vercel.app)** · [Case study](https://fitflow-showcase.vercel.app/case-study) · [Figma file](https://www.figma.com/design/tplM1llRbk13QxwC9bzAxU) · [Narrated walkthrough (1:39)](https://fitflow-showcase.vercel.app/walkthrough.mp4)

![Landing page](public/screens/landing.jpg)

## My role

I picked the problem and the users: fitness influencers and creators who sell coaching to their followers online. A lot of them run their whole business from Instagram DMs, WhatsApp and spreadsheets, so leads and follow-ups get lost. I decided what FITFLOW should do and what it shouldn't: no payments, no real data, everything clearly marked as sample, and the AI only writes drafts, it never sends anything on its own.

I reviewed every version of the design. When the first version looked too much like an AI-made template, I pushed it toward a cleaner, Figma-based product design, added light and dark mode, and asked for proper scroll animations with GSAP.

I built it with [Claude Code](https://claude.com/claude-code), an AI coding agent. I gave the direction and checked every step; the agent wrote most of the code, the Figma file and the tests. Ask me about any decision on this page and I'll walk you through it.

## Try it

| | |
|---|---|
| Landing page | [fitflow-showcase.vercel.app](https://fitflow-showcase.vercel.app) |
| Live demo (dashboard) | [/app](https://fitflow-showcase.vercel.app/app) |
| Sequences | [/app/sequences](https://fitflow-showcase.vercel.app/app/sequences) |
| Case study | [/case-study](https://fitflow-showcase.vercel.app/case-study) |
| Walkthrough video | [walkthrough.mp4](https://fitflow-showcase.vercel.app/walkthrough.mp4) (narrated, captioned) |
| Figma file | [FITFLOW AI — Product Design](https://www.figma.com/design/tplM1llRbk13QxwC9bzAxU) |

Things worth clicking: open the top task in Today and read “Why this draft”, log a sequence step and watch the next one get scheduled, mark a lead as replied and see their sequence pause, start the rescue sequence for an at-risk client, ask the assistant “What should I improve this week?”. Press <kbd>Ctrl/⌘ K</kbd> anywhere in the app.

## Product overview

**Target user:** fitness influencers and creators, including coaches and personal trainers with a social following, who sell coaching online or in person and currently run their business from Instagram DMs, WhatsApp and spreadsheets.

**Problem (design hypotheses):** interested people rarely say no; they go quiet when nobody checks back in. Follow-ups live in memory, copy-pasted templates get ignored, replies get buried, and clients drift after a tough week.

**Value proposition:** *Every lead followed up. Every client kept.* FITFLOW runs one loop (capture → prioritise → follow up → retain). Version 2 dropped the storefront builder from version 1 to focus on that loop.

| Feature | What it does |
|---|---|
| Today | Ranked queue of who to message and why (replies, due sequence steps, overdue leads, slipping clients) with Draft / Replied / Tomorrow actions, then KPIs, trend, pipeline and insights |
| Sequences | Four cadences (New enquiry, Proposal follow-through, Win back, Client rescue) with the reason for each step, enrolled people, pause/stop/resume and sample reply rates |
| AI Offer Builder | 5-step guided flow (goal, audience, format, price with guidance) → simulated generation → editable draft with claims check → proposal card preview → publish |
| Leads CRM | Drag-and-drop pipeline, list view with sort/filter/search, “Due” view, editable lead panel with stage stepper, notes and timeline |
| Compose | Opened from Today with the sequence step pre-set, or directly: goal, tone, channel → streamed draft → “Why this draft” (signals used + checks) and a highlighted preview → edit, copy, log the step |
| Bookings | Week calendar with overlap lanes and click-to-book, agenda view, create/edit with conflict warnings, status updates |
| Clients | Program progress, metrics, adherence chart, coaching plan phases, check-in logging that recalculates status |
| Analytics | Range and source filters (in the URL) driving KPIs, acquisition and revenue charts, cohort funnel, source and offer performance, monthly comparison, metric definitions |
| Assistant | Suggested prompts and free text; answers computed from the same data, with links to the relevant screen |

## Design system

- **Themes:** light and dark, following the OS by default with a Light / Dark / System toggle (saved in localStorage, applied before first paint). Every colour is a CSS variable in `src/app/globals.css`, mirrored 1:1 by the `color/*` variables in the Figma file.
- **Colour:** warm-neutral surfaces, hairline borders, a three-tier text scale and one lime accent (`#C8F04A`) reserved for primary actions and selection; data colours are separate tokens validated per theme.
- **Type:** Geist throughout (display to caption, tabular numbers), Geist Mono for code-like labels; Fraunces for occasional editorial accents.
- **Components:** `src/components/ui` (buttons, fields, segmented controls, badges, drawer, menu, dialog, toast, tooltip, progress ring, sparkline, empty states, skeletons) and `src/components/charts.tsx`.
- **Motion:** one easing curve and one spring preset (`src/components/motion/kit.tsx`). Staggered entrances, sliding tab indicators, counting numbers, chart draw-ins, drawer/modal transitions and an AI generation sequence. Respects `prefers-reduced-motion`.
- **Page-wide shader:** one fixed WebGL layer behind the whole landing page, hero to footer, held at its green palette. Full strength in the hero, calmer behind body content; capped at 30 fps, rendered below device resolution and paused in background tabs.
- **Theme switch:** the new theme spreads from the toggle as a soft-edged wave (View Transitions API, one composited animation), with a spring-loaded toggle thumb. Reduced motion gets a short crossfade; browsers without View Transitions get a quick colour fade.
- **Live Demo opening:** the overview opens on the coach's own profile photo , with a contrast gradient that dissolves into the dashboard as you scroll.
- **Buttons:** main calls to action use a liquid-metal rim (Paper Design's shader, after johuniq's Liquid Metal Button on 21st.dev) tinted with the FITFLOW palette.
- **Brand mark:** a six-pack abs symbol on the lime tile, used in the nav, sidebar, favicon and share image.
- **Scroll choreography (GSAP):** SplitText masked headline reveal and a pinned, scroll-scrubbed “How it works” sequence (ScrollTrigger with snapping) that swaps live product visuals per step.
- **3D:** restrained CSS 3D transforms with spring parallax (hero product shot, offer preview). WebGL was deliberately not used; see the case study.

## Tech stack

Figma (variables, styles, components) · Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 3 (with container queries) · GSAP + ScrollTrigger + SplitText · Motion (Framer Motion) · Recharts · Zustand (persisted to localStorage) · NumberFlow · Lucide icons. Photography from Unsplash.

## Project structure

```
src/app/                 routes: landing, /app/* (dashboard), /case-study
src/components/landing/  landing sections, 3D hero, live feature demos
src/components/app/      app shell, sidebar, palette, forms, welcome tour
src/components/screens/  one file per dashboard screen
src/lib/seed.ts          deterministic sample-data generator (dates relative to today)
src/lib/store.ts         Zustand store: data + every action, persisted to localStorage
src/lib/analytics.ts     pure metric functions shared by all screens
src/lib/ai.ts            simulated AI: offer drafts, follow-ups, client check-ins, assistant answers, claims check
src/lib/sequences.ts     the follow-up engine: sequences, the Today queue, draft explanations
tests/                   unit tests (logic) and an interaction test (browser)
scripts/screenshots.mjs  regenerates public/screens
scripts/walkthrough.mjs  records public/walkthrough.mp4 (narration: scripts/narration.json, voiceover.mjs)
```

## Run locally

```bash
npm install
npm run dev          # http://localhost:3200
```

```bash
npm run check        # typecheck + lint + unit tests
npm run build        # production build (all routes are static)
npm run test:e2e     # interaction test against a running server (needs Chrome; set CHROME_PATH)
node scripts/screenshots.mjs   # refresh portfolio screenshots
node scripts/voiceover.mjs     # narration clips (needs Python + edge-tts, and ffmpeg via FFMPEG_PATH)
node scripts/walkthrough.mjs   # record the narrated walkthrough against a running build
```

The walkthrough voice is synthetic (Microsoft Edge neural voice “Andrew” via edge-tts).

No environment variables or API keys are needed.

## Deploy

Every route is pre-rendered, so any static-capable host works. On Vercel: import the repo (framework: Next.js, default settings) or run `npx vercel --prod`. No services, databases or secrets are required.

## Limitations (honest list)

- No backend: data is fictional and lives in the visitor's browser; “Reset” regenerates it.
- AI is simulated with templates over the sample data; no model is called.
- No user research or usability testing yet; problem statements and persona are hypotheses.
- Pricing is a packaging concept; nothing is for sale and no payments exist.
- Pipeline drag-and-drop uses native HTML drag events (mouse); on touch, stages change from the lead panel.
- People in the Unsplash photos are not the fictional coaches named in the demo.

See [`/case-study`](src/app/case-study/page.tsx) and [docs/CASE_STUDY.md](docs/CASE_STUDY.md) for the design rationale.
