# FITFLOW AI: case study

*Product strategy, UX, UI and front-end. Portfolio prototype with sample data.*

## Summary

FITFLOW AI is an interactive prototype of a SaaS product for independent fitness coaches. It brings together the workflows that sit between "someone followed me" and "someone pays me": packaging offers, a public storefront, a lead pipeline, follow-ups, bookings, client check-ins and analytics, with AI handling drafting and summarising.

## 1. Problem

Coaches often build an audience before they build a business. Enquiries arrive in DMs, WhatsApp and comments; offers are explained one conversation at a time; follow-ups live in memory; and there's little visibility into which channel or program produces clients. Generic CRMs and site builders cover parts of this but are designed for sales teams or online stores.

> **Note:** this framing comes from desk research and common coach workflows. No interviews or usability tests were run, so everything here is a **hypothesis**, not a validated finding.

## 2. Target user (proto-persona)

**Aarav, 31, strength coach (fictional).** Coaches 15–25 online and hybrid clients, mostly sourced from Instagram. Sells three programs (₹6k–₹25k). Runs the business from his phone between sessions.

Jobs to be done:
- Explain what I offer and what it costs, clearly
- Never let an interested person go cold
- Know who to message and coach today
- See which content and programs bring clients

## 3. Value proposition and scope

"Turn followers into paying clients." Each feature maps to a step of the journey:

| Step | Features |
|---|---|
| Attract | Storefront, Offer Builder |
| Capture | Leads CRM (storefront enquiries land automatically) |
| Follow up | AI follow-ups, Bookings |
| Convert & coach | Clients, Analytics, Assistant |

Cut on purpose: content scheduling, payments, community, chat inbox.

## 4. Key flows

1. **Create an offer:** goal → audience → format → price (guided) → generate → edit → publish → appears on the storefront.
2. **Enquiry to client:** storefront enquiry → lead + notification → AI follow-up → discovery call → proposal → Won → client profile created automatically.
3. **Weekly client care:** filter at-risk clients → review adherence → log a check-in → status recalculates → dashboard insight updates.
4. **Business question:** ask the assistant → answer computed from the same data → link to the filtered analytics view.

## 5. Design decisions

- **Pipeline first.** The CRM opens on a stage board; every card carries its follow-up urgency; a "Due" view lists only what needs action.
- **AI as drafts, never actions.** Every output is editable and clearly labelled "not sent". The coach copies and sends messages themselves.
- **Visible guardrails.** A claims check flags guarantees and medical language; price guidance explains itself.
- **One storefront component, many art directions.** Built with container queries, so it renders correctly full-screen, in a phone frame, in a scaled desktop frame and on the landing page. Themes are token sets.
- **Trustworthy numbers.** One dataset, shared metric functions, definitions next to KPIs, "–" instead of 0% when there's no data, sample data always labelled.
- **CSS 3D over WebGL.** Layered transforms with spring parallax and scroll-linked depth give the requested sense of depth with crisp text, small bundles and a simple reduced-motion fallback.

## 6. UX problems addressed

| Problem | Response |
|---|---|
| Leads lost across channels | One pipeline, a source on every lead, storefront enquiries land automatically |
| Forgotten follow-ups | Follow-up dates, overdue highlighting, a "Due" view and dashboard reminders |
| Blank-page offer writing | Guided builder, price guidance, editable output, claims check |
| Follow-up writer's block | Drafts from goal and stage with tone and channel controls |
| No idea what's working | Source and offer conversion, cohort funnel, monthly comparison |
| Clients quietly dropping off | Check-ins compute on-track / attention / at-risk, surfaced on the dashboard |

## 7. Design system

Near-black surfaces, hairline borders, a three-tier text scale and one lime accent used for action and progress. Bricolage Grotesque for display and numbers, Geist for UI, Geist Mono for labels. One easing curve and one spring preset across all motion. Accessibility: visible focus rings, keyboard-operable menus, palette, drawers and cards, labelled controls, reduced-motion support, and colour never used as the only signal.

## 8. Build

Next.js App Router + TypeScript + Tailwind. A Zustand store persisted to localStorage holds the data and every action. A deterministic generator creates twelve months of leads, clients and bookings dated relative to today, and saved demos are shifted forward on load so they stay current. Analytics are pure functions shared by every screen. AI is deterministic templating over that data. Unit tests cover data consistency and metric maths; a browser interaction test covers the main flows end to end.

## 9. Limitations

No backend, accounts, payments or messaging. AI is simulated. No user research yet. Pricing is a concept. Pipeline drag-and-drop is mouse-only (touch users change stages in the lead panel). Stock photos don't depict the fictional coaches.

## 10. Next steps to validate

1. Five interviews with coaches who sell online, focused on enquiries and follow-ups today.
2. A task-based phone test of the enquiry-to-client flow (time to first follow-up).
3. A 10-second comprehension test on offer cards (what's included, what it costs).
4. Willingness-to-pay conversations before committing to pricing.
