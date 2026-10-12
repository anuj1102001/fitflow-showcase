import { insights, bySource, byOffer } from "./analytics";
import { firstName, pct, rupees } from "./format";
import type { Client, Lead, Offer, OfferType } from "./types";

/**
 * Simulated AI. No model is called: outputs are written from templates and the demo's own data so the
 * prototype works offline and costs nothing. The UI labels every output as simulated.
 * `variant` gives "Regenerate" a different but stable result.
 */

export const GOALS = [
  { id: "fat", label: "Lose fat", hint: "Sustainable fat loss without crash diets" },
  { id: "strength", label: "Build strength", hint: "Get strong on the big lifts" },
  { id: "muscle", label: "Build muscle", hint: "Lean muscle and better shape" },
  { id: "return", label: "Return to fitness", hint: "After a break, injury or pregnancy" },
  { id: "mobility", label: "Move pain-free", hint: "Mobility, posture and back health" },
  { id: "endurance", label: "Run further", hint: "5K, 10K and general endurance" },
] as const;
export type GoalId = (typeof GOALS)[number]["id"];

export const AUDIENCES = [
  { id: "desk", label: "Busy desk workers", short: "Desk Workers" },
  { id: "beginners", label: "Complete beginners", short: "Beginners" },
  { id: "women30", label: "Women 30+", short: "Women 30+" },
  { id: "mothers", label: "New mothers", short: "New Mums" },
  { id: "over40", label: "40+ and restarting", short: "the 40+ Crowd" },
  { id: "students", label: "College students", short: "Students" },
] as const;
export type AudienceId = (typeof AUDIENCES)[number]["id"];

const PER_WEEK: Record<OfferType, [number, number]> = {
  "1:1 online coaching": [950, 1600],
  "Small-group program": [450, 850],
  "Hybrid (online + in person)": [1700, 2600],
  "Self-paced plan": [120, 320],
};

export function priceGuide(type: OfferType, weeks: number, price?: number) {
  const [lo, hi] = PER_WEEK[type];
  const round = (n: number) => Math.round(n / 500) * 500 - 1;
  const low = Math.max(499, round(lo * weeks));
  const high = round(hi * weeks);
  let verdict: "below" | "within" | "above" | null = null;
  if (price && Number.isFinite(price)) verdict = price < low ? "below" : price > high ? "above" : "within";
  return { low, high, verdict };
}

const TITLES: Record<GoalId, ((w: number, a: string) => string)[]> = {
  fat: [(w) => `The ${w}-Week Lean Reset`, (_w, a) => `Fat-Loss Blueprint for ${a}`, (w) => `${w} Weeks to Lighter & Stronger`],
  strength: [(w) => `${w}-Week Strength Foundations`, (_w, a) => `Strong From Scratch: ${a}`, () => `The Barbell Basics Program`],
  muscle: [(w) => `Lean Muscle in ${w} Weeks`, (_w, a) => `Build Your Frame: ${a}`, () => `The Hypertrophy Starter Plan`],
  return: [() => `Comeback Strength`, (_w, a) => `Back in Motion for ${a}`, (w) => `The ${w}-Week Restart`],
  mobility: [() => `Pain-Free Desk Body`, (w) => `${w}-Week Mobility Reset`, (_w, a) => `Move Better: ${a}`],
  endurance: [() => `Couch to Confident 10K`, (w) => `${w}-Week Run Builder`, (_w, a) => `Endurance Made Simple for ${a}`],
};

const PROMISE: Record<GoalId, string> = {
  fat: "lose fat steadily while eating food you actually like",
  strength: "get properly strong on the fundamental lifts",
  muscle: "build lean muscle with training that fits your week",
  return: "rebuild strength and confidence at a pace that respects where you're starting",
  mobility: "move and sit without the stiffness that's been holding you back",
  endurance: "run further and feel good doing it",
};

const TYPE_BENEFITS: Record<OfferType, string[]> = {
  "1:1 online coaching": ["A plan written for your schedule and equipment", "Weekly 1:1 check-in call", "Form feedback on your training videos", "Messaging support on weekdays"],
  "Small-group program": ["Live group sessions three times a week", "A small cohort (max 12) for accountability", "Group chat with your coach", "Session recordings if you miss one"],
  "Hybrid (online + in person)": ["In-person technique sessions twice a month", "Full online programming in between", "Weekly check-in and plan adjustments", "Messaging support on weekdays"],
  "Self-paced plan": ["Week-by-week training plan with video demos", "Printable habit and progress tracker", "Lifetime access to plan updates", "Monthly live Q&A with your coach"],
};

const GOAL_BENEFITS: Record<GoalId, string[]> = {
  fat: ["Flexible nutrition targets built around Indian home food", "Step and sleep habits that make fat loss easier"],
  strength: ["Progressive strength plan for squat, hinge, push and pull", "Clear technique cues for every key lift"],
  muscle: ["Progressive hypertrophy plan with clear rep targets", "Simple protein targets, vegetarian-friendly"],
  return: ["Gentle progressions that build week on week", "Core-focused sessions that fit into short windows"],
  mobility: ["Daily 10-minute mobility routine for desk days", "Strength work that supports your back and hips"],
  endurance: ["Run-walk plan that builds without overload", "Strength sessions that keep injuries away"],
};

const CTA: Record<OfferType, string[]> = {
  "1:1 online coaching": ["Book a free discovery call", "Apply for coaching", "Start with a free consult"],
  "Small-group program": ["Join the next batch", "Reserve your spot", "Get on the batch list"],
  "Hybrid (online + in person)": ["Apply for a spot", "Book a free assessment", "Talk to me about hybrid coaching"],
  "Self-paced plan": ["Get the plan", "Start today", "Download the program"],
};

export type OfferInput = { goal: GoalId; audience: AudienceId; type: OfferType; price: number; weeks: number };
export type OfferDraft = { title: string; tagline: string; description: string; benefits: string[]; cta: string };

export function draftOffer(input: OfferInput, variant = 0): OfferDraft {
  const a = AUDIENCES.find((x) => x.id === input.audience)!;
  const titles = TITLES[input.goal];
  const v = Math.abs(variant) % 3;
  const title = titles[v % titles.length]!(input.weeks, a.short);
  const who = a.label.toLowerCase();
  const tagline = [
    `A ${input.weeks}-week program for ${who} who want to ${PROMISE[input.goal]}.`,
    `For ${who}: ${input.weeks} weeks to ${PROMISE[input.goal]}.`,
    `Coaching that fits real life, built for ${who}.`,
  ][v]!;
  const format = {
    "1:1 online coaching": "personal 1:1 online coaching",
    "Small-group program": "a small-group program",
    "Hybrid (online + in person)": "hybrid coaching (online plus in-person sessions)",
    "Self-paced plan": "a self-paced plan you can follow anywhere",
  }[input.type];
  const description = [
    `This is ${format} for ${who} who want to ${PROMISE[input.goal]}. Over ${input.weeks} weeks you'll follow a clear, progressive plan, get regular feedback and know exactly what to do each week. No extreme diets, no two-hour workouts.`,
    `Built for ${who}, this ${input.weeks}-week program is ${format}. We start with where you are today, set realistic targets together and adjust the plan as you progress, so it keeps working when life gets busy.`,
    `If you've tried to ${PROMISE[input.goal]} on your own and lost momentum, this is the structure you've been missing: ${format}, ${input.weeks} weeks long, with a coach in your corner.`,
  ][v]!;
  const benefits = [...TYPE_BENEFITS[input.type].slice(0, 2 + (v % 2)), ...GOAL_BENEFITS[input.goal]].slice(0, 4);
  const cta = CTA[input.type][v]!;
  return { title, tagline, description, benefits, cta };
}

/** Phrases we never want in fitness marketing copy (guarantees, medical claims). */
const RISKY = [/guarantee/i, /\bcure/i, /lose \d+ ?kg in/i, /100%/i, /\bdetox/i, /\bmiracle/i, /no exercise/i];
export function claimCheck(text: string) {
  return RISKY.filter((r) => r.test(text)).map((r) => r.source.replace(/\\b|\\|\/i/g, ""));
}

/* ------------------------------------------------------------------ follow-ups */

export const FOLLOW_UP_GOALS = ["Reply to a new enquiry", "Book a discovery call", "Nudge after a proposal", "Re-engage a quiet lead", "Thank them after a call"] as const;
export const TONES = ["Warm", "Professional", "Energetic"] as const;
export const CHANNELS = ["WhatsApp", "Instagram DM", "Email"] as const;
export type FollowUpGoal = (typeof FOLLOW_UP_GOALS)[number];
export type Tone = (typeof TONES)[number];
export type Channel = (typeof CHANNELS)[number];

export function draftFollowUp(lead: Lead, offer: Offer | undefined, goal: FollowUpGoal, tone: Tone, channel: Channel, variant = 0) {
  const name = firstName(lead.name);
  // Goals are written in the lead's voice ("Lose the belly fat I've had…"); turn them into "your goal to …".
  const raw = lead.goal.charAt(0).toLowerCase() + lead.goal.slice(1);
  const you = raw.replace(/\bI've\b/g, "you've").replace(/\bI'm\b/g, "you're").replace(/\bmy\b/g, "your").replace(/\bI\b/g, "you");
  const g = /^(lose|get|do|run|gain|feel|deadlift|drop|train|fix|build|move|improve)\b/.test(you) ? `your goal to ${you}` : `your goal (“${lead.goal}”)`;
  const program = offer?.title ?? "my coaching program";
  const hi = { Warm: `Hi ${name}!`, Professional: `Hi ${name},`, Energetic: `Hey ${name}! 👋` }[tone];
  const v = Math.abs(variant) % 2;
  const body: Record<FollowUpGoal, [string, string]> = {
    "Reply to a new enquiry": [
      `Thanks for reaching out about ${g}. It's something I help people with a lot. Could you tell me a little about your current routine and what's got in the way so far? Then I can suggest the right next step.`,
      `Great to hear from you! I'd love to help with ${g}. First, I want to understand where you're starting from. What does a typical week of training (or not training!) look like for you right now?`,
    ],
    "Book a discovery call": [
      `Would a quick 20-minute call this week work? We'll talk through ${g} and I'll tell you honestly whether ${program} is the right fit. I have slots on Thursday evening or Saturday morning.`,
      `The easiest next step is a free 20-minute discovery call. No pressure, just a chat about your goal and what's realistic. Want me to send you a couple of times that work this week?`,
    ],
    "Nudge after a proposal": [
      `Just checking in on the ${program} details I shared. Happy to answer any questions or adjust the schedule if weekday evenings are tricky. Would you like me to hold a spot for the next start date?`,
      `Wanted to follow up on ${program}. I know it's a decision worth thinking about! If price or timing is the sticking point, tell me and I'll see what I can do.`,
    ],
    "Re-engage a quiet lead": [
      `It's been a little while since we spoke about ${g}. No worries if the timing wasn't right! If you're still thinking about it, I'm opening a few spots next month and wanted you to hear first.`,
      `Hope you've been well! I came across your message about ${g} and wondered how it's going. If it'd help, I can share a simple 2-week starter routine, no strings attached.`,
    ],
    "Thank them after a call": [
      `Thanks for the chat today. I really enjoyed hearing about your goals. As promised, I'll send over the ${program} details in a moment. Take your time, and message me with any questions.`,
      `Great talking with you! Quick recap: we'll work on ${g}, starting with three sessions a week. I'll share the ${program} plan and next steps shortly.`,
    ],
  };
  const sign = { Warm: "Cheers,\nAarav", Professional: "Best regards,\nAarav Mehta", Energetic: "Let's go! 💪\nAarav" }[tone];
  let text = `${hi} ${body[goal][v]}`;
  if (tone === "Energetic") text = text.replace(/\.$/, "!");
  if (channel === "Email") {
    const subject = {
      "Reply to a new enquiry": "Your coaching enquiry",
      "Book a discovery call": "Quick call about your goals?",
      "Nudge after a proposal": `Any questions about ${program}?`,
      "Re-engage a quiet lead": "Still thinking about your fitness goal?",
      "Thank them after a call": "Thanks for today, plus next steps",
    }[goal];
    text = `Subject: ${subject}\n\n${hi}\n\n${body[goal][v]}\n\n${sign}`;
  } else if (channel === "Instagram DM") {
    text = text.replace(/ Would a quick 20-minute call/, " Fancy a quick 20-min call");
  }
  return text;
}

/* ------------------------------------------------------------------ assistant */

export const SUGGESTED_PROMPTS = [
  "Which lead source is performing best?",
  "What should I improve this week?",
  "Help me improve my coaching offer.",
  "Draft a follow-up for inactive leads.",
  "How does this month compare to last month?",
  "Which clients need attention?",
];

export type Answer = { text: string; cards?: { label: string; value: string; href?: string }[] };

export function answer(question: string, data: { leads: Lead[]; clients: Client[]; offers: Offer[] }, now = Date.now()): Answer {
  const q = question.toLowerCase();
  const ins = insights(data.leads, data.clients, data.offers, now);
  const nameOf = (id: string) => data.leads.find((l) => l.id === id)?.name ?? "A client";

  if (/source|channel|instagram|where.*(leads|clients) come|best.*lead/.test(q)) {
    const rows = bySource(data.leads, { range: "90d", now }).filter((s) => s.leads > 0);
    const best = ins.bestSource;
    const vol = ins.topVolume;
    const lines = rows.map((s) => `• **${s.source}**: ${s.leads} leads, ${s.won} won (${pct(s.conversion, 0)})`).join("\n");
    return {
      text:
        `Over the last 90 days:\n\n${lines}\n\n` +
        (best && vol && best.source !== vol.source
          ? `**${vol.source}** brings the most leads, but **${best.source}** converts best at ${pct(best.conversion, 0)}. Each ${best.source} lead is worth roughly ${(best.conversion! / Math.max(0.01, vol.conversion ?? 0.01)).toFixed(1)}× an ${vol.source} lead.\n\n**Suggestion:** keep ${vol.source} for reach, but put the storefront link in every post and ask your happiest clients for one referral each this month.`
          : `**${best?.source ?? "Referral"}** leads the way on both volume and conversion. Keep doing what's working there.`),
      cards: rows.slice(0, 3).map((s) => ({ label: s.source, value: `${pct(s.conversion, 0)} conv.`, href: `/app/analytics?source=${s.source}` })),
    };
  }

  if (/improve|this week|focus|priorit|to.?do|what should/.test(q) && !/offer/.test(q)) {
    const items: string[] = [];
    if (ins.overdue.length) items.push(`**Clear ${ins.overdue.length} overdue follow-ups**, starting with ${ins.overdue.slice(0, 3).map((l) => firstName(l.name)).join(", ")}. Replies drop sharply after a few days of silence.`);
    if (ins.staleProposals.length) items.push(`**Nudge ${ins.staleProposals.length} open proposals** (${rupees(ins.staleProposals.reduce((s, l) => s + l.value, 0))} in sample pipeline value) that haven't heard from you in 3+ days.`);
    if (ins.atRisk.length) items.push(`**Call ${ins.atRisk.map((c) => firstName(nameOf(c.leadId))).join(" and ")}.** Adherence has dropped below 65% in recent check-ins.`);
    if (ins.bestSource) items.push(`**Lean into ${ins.bestSource.source}.** It converts at ${pct(ins.bestSource.conversion, 0)}, your best rate over 90 days.`);
    return {
      text: `Here's where I'd spend your time this week:\n\n${items.map((x, i) => `${i + 1}. ${x}`).join("\n")}\n\nDo these in order: the first two protect revenue that's already in motion.`,
      cards: [
        { label: "Overdue follow-ups", value: String(ins.overdue.length), href: "/app/leads?view=followups" },
        { label: "Open proposals", value: String(data.leads.filter((l) => l.stage === "proposal").length), href: "/app/leads?stage=proposal" },
        { label: "Clients at risk", value: String(ins.atRisk.length), href: "/app/clients" },
      ],
    };
  }

  if (/offer|program|package|pric/.test(q)) {
    const rows = byOffer(data.leads, data.offers, { range: "90d", source: "all", now }).filter((o) => o.leads > 0);
    const best = [...rows].sort((a, b) => (b.conversion ?? 0) - (a.conversion ?? 0))[0];
    const worst = [...rows].sort((a, b) => (a.conversion ?? 0) - (b.conversion ?? 0))[0];
    const draft = data.offers.find((o) => o.status === "draft");
    return {
      text:
        `Offer performance, last 90 days:\n\n${rows.map((o) => `• **${o.title}** (${rupees(o.price)}): ${o.leads} leads → ${o.won} clients (${pct(o.conversion, 0)})`).join("\n")}\n\n` +
        (best && worst && best.id !== worst.id
          ? `**${worst.title}** converts lowest. Three things to try:\n1. Lead with the outcome in the title, not the format.\n2. Add a payment option split over two months to lower the first step.\n3. Add one concrete detail to the description (e.g. "3 sessions a week, 45 minutes each").\n\n`
          : "") +
        (draft ? `You also have **${draft.title}** sitting in drafts. Publishing it gives storefront visitors another way in.` : "Open the AI Offer Builder to test a new angle in a couple of minutes."),
      cards: [{ label: "Open Offer Builder", value: "→", href: "/app/offers" }],
    };
  }

  if (/inactive|quiet|cold|follow.?up|re-?engage|ghost/.test(q)) {
    const quiet = ins.active.filter((l) => now - new Date(l.lastContactAt ?? l.createdAt).getTime() > 4 * 86_400_000);
    const sample = quiet[0];
    return {
      text:
        `${quiet.length} active leads haven't heard from you in 4+ days. Here's a draft you can adapt:\n\n` +
        `> Hi ${sample ? firstName(sample.name) : "there"}! It's been a little while since we spoke about your goal. No worries if the timing wasn't right. I'm opening a few spots next month and wanted you to hear first. Want me to send the details?\n\n` +
        `Keep it short, reference their goal, and give them an easy yes/no question. You can personalise one per lead in **Follow-ups**.`,
      cards: quiet.slice(0, 3).map((l) => ({ label: l.name, value: "Draft →", href: `/app/follow-ups?lead=${l.id}&goal=Re-engage%20a%20quiet%20lead` })),
    };
  }

  if (/month|revenue|compare|growth|trend/.test(q)) {
    const t = ins.thisMonth;
    const l = ins.lastMonth;
    const ch = (a: number, b: number) => (b ? `${a >= b ? "+" : ""}${Math.round(((a - b) / b) * 100)}%` : "n/a");
    return {
      text: `**${t.label}** (so far) vs **${l.label}**:\n\n• Leads: ${t.leads} vs ${l.leads} (${ch(t.leads, l.leads)})\n• Clients won: ${t.won} vs ${l.won}\n• Sample revenue: ${rupees(t.revenue)} vs ${rupees(l.revenue)}\n\nThe month isn't over, so compare pace rather than totals. ${t.leads >= l.leads * 0.6 ? "You're on track to match or beat last month on leads." : "Lead flow is slower than last month. A storefront post or story this week would help."}`,
      cards: [{ label: "Open analytics", value: "→", href: "/app/analytics?range=12m" }],
    };
  }

  if (/client|risk|attention|adherence|slipping/.test(q)) {
    const list = [...ins.atRisk, ...ins.attention];
    return {
      text: list.length
        ? `${list.length} clients need attention:\n\n${list.map((c) => `• **${nameOf(c.leadId)}**: ${c.status === "at-risk" ? "at risk" : "needs attention"}, last check-in adherence ${c.checkIns[0]?.adherence ?? "–"}%`).join("\n")}\n\nA short voice note or a call usually works better than a text here. Ask what got in the way and offer a lighter week.`
        : "Every client is on track. Nice work. Consider asking two of them for a testimonial this week.",
      cards: list.slice(0, 3).map((c) => ({ label: nameOf(c.leadId), value: "Open →", href: `/app/clients?client=${c.id}` })),
    };
  }

  return {
    text: `I can answer questions about this demo's sample data: lead sources, your pipeline, offers, clients and month-on-month trends. Try one of these:\n\n${SUGGESTED_PROMPTS.slice(0, 4).map((p) => `• ${p}`).join("\n")}`,
  };
}
