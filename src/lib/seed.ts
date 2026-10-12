import { addDays, DAY, startOfDay } from "./format";
import { IMAGES } from "./images";
import type { Booking, BookingKind, CheckIn, Client, Draft, Lead, Metric, Note, Notification, Offer, Source, Stage, Storefront } from "./types";

/**
 * Deterministic sample data for the prototype. One fictional coach (Aarav Mehta) with twelve months of
 * leads, offers, clients and bookings. Dates are generated relative to `now` so the demo always looks current.
 * Every person and number here is invented; the UI labels it as sample data.
 */

export function rng(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min,
    pick: <T,>(arr: readonly T[]) => arr[Math.floor(next() * arr.length)]!,
    chance: (p: number) => next() < p,
    weighted: <T,>(items: readonly (readonly [T, number])[]) => {
      const total = items.reduce((s, [, w]) => s + w, 0);
      let r = next() * total;
      for (const [v, w] of items) if ((r -= w) <= 0) return v;
      return items[items.length - 1]![0];
    },
    poisson: (lambda: number) => {
      const L = Math.exp(-lambda);
      let k = 0;
      let p = 1;
      do {
        k++;
        p *= next();
      } while (p > L);
      return k - 1;
    },
  };
}

export const COACH = {
  name: "Aarav Mehta",
  role: "Strength & fat-loss coach",
  city: "Bengaluru",
  email: "aarav@fitflow.demo",
  avatar: IMAGES.coachAaravThumb,
};

const FIRST = ["Priya", "Rohan", "Ananya", "Karthik", "Sneha", "Vikram", "Meghna", "Arjun", "Isha", "Nikhil", "Divya", "Siddharth", "Pooja", "Rahul", "Kavya", "Aditya", "Neha", "Varun", "Tanvi", "Harsh", "Ritika", "Kunal", "Shreya", "Manav", "Aditi", "Yash", "Nandini", "Dev", "Simran", "Akash", "Lavanya", "Omkar", "Zoya", "Farhan", "Bhavna", "Ishaan"];
const LAST = ["Sharma", "Iyer", "Reddy", "Nair", "Kapoor", "Menon", "Gupta", "Rao", "Shetty", "Joshi", "Kulkarni", "Desai", "Bose", "Pillai", "Malhotra", "Verma", "Chopra", "Bhat", "Das", "Khanna", "Patel", "Singh", "Mukherjee", "Agarwal", "Fernandes", "Hegde", "Saxena", "Qureshi"];
const CITIES = ["Bengaluru", "Bengaluru", "Bengaluru", "Mumbai", "Pune", "Hyderabad", "Chennai", "Delhi", "Gurugram", "Kochi", "Mysuru"];

const GOALS: { goal: string; kind: "fat" | "strength" | "return" | "posture" | "endurance" }[] = [
  { goal: "Lose 8 kg before my wedding in March", kind: "fat" },
  { goal: "Get stronger after years at a desk job", kind: "strength" },
  { goal: "Do my first unassisted pull-up", kind: "strength" },
  { goal: "Get back into shape after my baby", kind: "return" },
  { goal: "Fix lower-back stiffness from sitting", kind: "posture" },
  { goal: "Run a 10K without stopping", kind: "endurance" },
  { goal: "Gain lean muscle without a bulky diet", kind: "strength" },
  { goal: "Lose the belly fat I've had since college", kind: "fat" },
  { goal: "Feel more energetic and sleep better", kind: "return" },
  { goal: "Deadlift my bodyweight", kind: "strength" },
  { goal: "Drop two dress sizes and keep it off", kind: "fat" },
  { goal: "Train around a recovering knee", kind: "posture" },
];

export const SEED_OFFERS: Offer[] = [
  {
    id: "off_strength",
    title: "12-Week Strength Foundations",
    tagline: "Learn to lift with confidence, one session at a time.",
    description:
      "A 1:1 online program for busy professionals who want to get properly strong. You get a training plan built around your schedule and equipment, weekly video form reviews and a check-in call every Sunday.",
    type: "1:1 online coaching",
    goal: "Build strength",
    audience: "Desk-bound professionals, 25–40",
    price: 14999,
    weeks: 12,
    benefits: ["Personal plan for home or gym equipment", "Weekly form review on video", "Sunday check-in call (30 min)", "Simple, flexible nutrition targets"],
    cta: "Book a free discovery call",
    status: "live",
    createdAt: "",
  },
  {
    id: "off_group",
    title: "Fat-Loss Accelerator: Group",
    tagline: "Eight weeks, a small crew and a plan you can actually follow.",
    description:
      "A small-group program (max 12 people) with three guided workouts a week, a shared accountability chat and a nutrition framework that works with home-cooked Indian food.",
    type: "Small-group program",
    goal: "Lose fat",
    audience: "Beginners restarting their fitness",
    price: 5999,
    weeks: 8,
    benefits: ["3 live group workouts a week", "Accountability group chat", "Indian meal-planning framework", "Progress photos & measurements every 2 weeks"],
    cta: "Join the next batch",
    status: "live",
    createdAt: "",
  },
  {
    id: "off_hybrid",
    title: "Desk-to-Deadlift Hybrid",
    tagline: "In-person technique sessions plus online coaching between them.",
    description:
      "Two in-person sessions a month at our Indiranagar partner gym for technique, plus full online programming and messaging support in between. Ideal if you want hands-on coaching without paying for every session.",
    type: "Hybrid (online + in person)",
    goal: "Build strength",
    audience: "Bengaluru professionals who want hands-on coaching",
    price: 24999,
    weeks: 12,
    benefits: ["2 in-person technique sessions a month", "Full online programming", "Messaging support on weekdays", "Mobility routine for desk workers"],
    cta: "Apply for a spot",
    status: "live",
    createdAt: "",
  },
  {
    id: "off_postnatal",
    title: "Postnatal Strength Reset",
    tagline: "Rebuild your core and strength safely, at your own pace.",
    description:
      "A gentle, progressive 10-week plan for mothers six months or more postpartum, cleared by their doctor to exercise. Short sessions, flexible scheduling and a focus on core and pelvic-floor friendly training.",
    type: "1:1 online coaching",
    goal: "Return to fitness",
    audience: "Mothers 6+ months postpartum",
    price: 11999,
    weeks: 10,
    benefits: ["20–30 minute home sessions", "Core & pelvic-floor friendly progressions", "Fortnightly video check-ins", "Flexible scheduling around naps"],
    cta: "Join the waitlist",
    status: "draft",
    createdAt: "",
  },
];

const CONVERSION: Record<Source, number> = { Referral: 0.42, Storefront: 0.31, WhatsApp: 0.22, YouTube: 0.18, Instagram: 0.15 };

const HUMAN_NOTES = [
  "Works late on weekdays; prefers morning sessions.",
  "Asked whether the plan works with a home dumbbell set.",
  "Vegetarian; wants help with protein targets.",
  "Had a shoulder injury last year, cleared by physio.",
  "Comparing with a local gym membership. Price-sensitive.",
  "Came from the reel about desk posture.",
  "Wants to start after the festival season.",
  "Very motivated; asked for the program PDF.",
];

const LOST_REASONS = ["Went quiet after first message", "Chose a local gym", "Budget", "Timing: wants to start later", "Not the right fit"];

export type SeedState = {
  leads: Lead[];
  offers: Offer[];
  clients: Client[];
  bookings: Booking[];
  drafts: Draft[];
  notifications: Notification[];
  storefront: Storefront;
};

export const DEFAULT_SEED = 99;

export function generateSeed(nowMs = Date.now(), seed = DEFAULT_SEED): SeedState {
  const r = rng(seed);
  const now = new Date(nowMs);
  const today = startOfDay(now);
  const iso = (d: Date) => d.toISOString();
  const at = (base: Date, dayOffset: number, hour: number, minute = 0) => {
    const d = addDays(base, dayOffset);
    d.setHours(hour, minute, 0, 0);
    return d;
  };
  const clampPast = (d: Date) => (d.getTime() > nowMs ? new Date(nowMs - r.int(20, 240) * 60_000) : d);

  const offers = SEED_OFFERS.map((o, i) => ({ ...o, createdAt: iso(addDays(today, -340 + i * 70)) }));
  const usedNames = new Set<string>();
  const name = () => {
    for (;;) {
      const n = `${r.pick(FIRST)} ${r.pick(LAST)}`;
      if (!usedNames.has(n)) {
        usedNames.add(n);
        return n;
      }
    }
  };

  const leads: Lead[] = [];
  let n = 0;
  for (let ago = 364; ago >= 0; ago--) {
    const growth = 1 - ago / 365;
    // Volume roughly triples over the year (seasonal bump in Jan) and dips on Sundays.
    const day = addDays(today, -ago);
    const janBump = day.getMonth() === 0 ? 1.35 : 1;
    const lambda = (0.32 + 0.82 * growth) * janBump * (day.getDay() === 0 ? 0.5 : 1);
    const count = r.poisson(lambda);
    for (let k = 0; k < count; k++) {
      const created = at(today, -ago, r.int(7, 22), r.pick([0, 10, 20, 30, 40, 50]));
      if (created.getTime() > nowMs) created.setTime(nowMs - r.int(5, 300) * 60_000);
      const source = r.weighted<Source>([
        ["Instagram", 0.5 - 0.18 * growth],
        ["Storefront", 0.06 + 0.26 * growth],
        ["Referral", 0.14],
        ["YouTube", 0.14 - 0.04 * growth],
        ["WhatsApp", 0.1],
      ]);
      const offer = r.weighted([
        [offers[0]!, 0.45],
        [offers[1]!, 0.37],
        [offers[2]!, 0.18],
      ] as const);
      const g = r.pick(GOALS);
      const fullName = name();
      const [first, last] = fullName.toLowerCase().split(" ");
      const age = (nowMs - created.getTime()) / DAY;
      const notes: Note[] = [{ id: `n${n}_0`, at: iso(created), kind: "system", text: sourceNote(source) }];

      let stage: Stage;
      let reached: number;
      let wonAt: Date | undefined;
      let lostAt: Date | undefined;
      let lastContact: Date | undefined;
      const step = (days: number) => clampPast(new Date(created.getTime() + days * DAY));

      if (age > 34) {
        if (r.chance(CONVERSION[source])) {
          stage = "won";
          reached = 4;
          wonAt = step(r.int(6, 19) + r.next());
        } else {
          stage = "lost";
          reached = r.weighted([
            [0, 0.34],
            [1, 0.31],
            [2, 0.2],
            [3, 0.15],
          ] as const);
          lostAt = step(r.int(4, 20) + r.next());
        }
      } else {
        // Younger leads are still moving through the pipeline.
        const base = age < 2 ? 0 : age < 5 ? r.pick([0, 0, 1]) : age < 11 ? r.pick([1, 1, 2, 0]) : age < 20 ? r.pick([1, 2, 2, 3]) : r.pick([2, 3, 3, 1]);
        reached = base;
        stage = (["new", "contacted", "call", "proposal"] as const)[base]!;
        if (age > 9 && r.chance(CONVERSION[source] * 0.8)) {
          stage = "won";
          reached = 4;
          wonAt = step(Math.min(age - 0.2, r.int(7, 14) + r.next()));
        } else if (age > 8 && r.chance(0.14)) {
          stage = "lost";
          lostAt = step(Math.min(age - 0.1, r.int(5, 12)));
        }
      }
      const transitions: [number, string][] = [
        [1, "Moved to Contacted"],
        [2, "Discovery call booked"],
        [3, `Proposal sent: ${offer.title}`],
      ];
      for (const [i, text] of transitions) {
        if (reached >= i) {
          const t = step(i * r.int(1, 3) + r.next());
          notes.push({ id: `n${n}_${i}`, at: iso(t), kind: "system", text });
          lastContact = t;
        }
      }
      if (wonAt) notes.push({ id: `n${n}_w`, at: iso(wonAt), kind: "system", text: `Won · joined ${offer.title}` });
      const lostReason = lostAt ? r.pick(LOST_REASONS) : undefined;
      if (lostAt) notes.push({ id: `n${n}_l`, at: iso(lostAt), kind: "system", text: `Marked lost · ${lostReason}` });
      if (age < 30 && r.chance(0.55)) notes.push({ id: `n${n}_h`, at: iso(step(Math.min(age, 0.6 + r.next()))), kind: "note", text: r.pick(HUMAN_NOTES) });
      notes.sort((a, b) => a.at.localeCompare(b.at));

      let nextFollowUp: string | undefined;
      if (stage !== "won" && stage !== "lost") {
        // A realistic mix: some overdue, a few due today, the rest coming up.
        const due = r.weighted([
          [-r.int(1, 6), 0.3],
          [0, 0.25],
          [r.int(1, 6), 0.45],
        ] as const);
        nextFollowUp = iso(at(today, due, r.pick([10, 12, 17, 18])));
      }

      leads.push({
        id: `lead_${(n++).toString(36)}`,
        name: fullName,
        email: `${first}.${last}${r.int(1, 99)}@example.com`,
        phone: `+91 9${r.int(100, 999)} ${r.int(10, 99)}${r.int(100, 999)}`,
        city: r.pick(CITIES),
        handle: source === "Instagram" ? `@${first}${r.pick(["fit", "", "_", ".moves", "lifts"])}${r.int(1, 99)}` : undefined,
        source,
        stage,
        reached,
        offerId: offer.id,
        value: offer.price,
        goal: g.goal,
        createdAt: iso(created),
        lastContactAt: lastContact ? iso(lastContact) : undefined,
        nextFollowUp,
        wonAt: wonAt ? iso(wonAt) : undefined,
        lostAt: lostAt ? iso(lostAt) : undefined,
        lostReason,
        fitScore: Math.min(97, Math.round(48 + r.next() * 40 + (source === "Referral" ? 8 : source === "Storefront" ? 5 : 0))),
        notes,
      });
    }
  }
  leads.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  // Clients: everyone won whose program is still running.
  const offerById = new Map(offers.map((o) => [o.id, o]));
  const clients: Client[] = [];
  for (const l of leads) {
    if (!l.wonAt) continue;
    const o = offerById.get(l.offerId)!;
    const start = new Date(Math.min(startOfDay(addDays(l.wonAt, 1)).getTime(), today.getTime()));
    const end = addDays(start, o.weeks * 7);
    if (end.getTime() < nowMs) continue;
    const g = GOALS.find((x) => x.goal === l.goal)!;
    const weeksIn = Math.max(0, Math.floor((nowMs - start.getTime()) / (7 * DAY)));
    const temperament = r.next(); // some clients are steady, some struggle
    const checkIns: CheckIn[] = [];
    for (let w = 1; w <= weeksIn; w++) {
      const base = temperament > 0.32 ? 80 + (temperament - 0.32) * 24 : temperament > 0.14 ? 68 + (temperament - 0.14) * 30 : 50 + temperament * 50;
      const adherence = Math.max(30, Math.min(100, Math.round(base + (r.next() - 0.5) * 12 - (temperament < 0.14 ? w * 1.5 : 0))));
      checkIns.push({
        id: `ci_${l.id}_${w}`,
        date: iso(at(start, w * 7 - 1, 19)),
        adherence,
        mood: (adherence > 85 ? r.pick([4, 5]) : adherence > 70 ? r.pick([3, 4]) : r.pick([2, 3])) as CheckIn["mood"],
        note: checkInNote(adherence, r.next()),
      });
    }
    const recent = checkIns.slice(-2);
    const avg = recent.length ? recent.reduce((s, c) => s + c.adherence, 0) / recent.length : 85;
    const progress = Math.min(1, (nowMs - start.getTime()) / (end.getTime() - start.getTime()));
    clients.push({
      id: `cl_${l.id}`,
      leadId: l.id,
      offerId: l.offerId,
      startDate: iso(start),
      endDate: iso(end),
      status: avg >= 78 ? "on-track" : avg >= 64 ? "attention" : "at-risk",
      plan: planFor(g.kind, o.weeks),
      metrics: metricsFor(g.kind, progress * (avg / 90), r),
      checkIns: checkIns.reverse(),
    });
  }

  // Bookings: discovery calls for leads at the call stage, check-ins for clients, a few past sessions.
  const bookings: Booking[] = [];
  const taken = new Set<string>();
  // Half-hour cells per day; a booking claims every cell it covers so sessions never overlap.
  const slot = (dayOffset: number, prefer: number[], minutes = 30) => {
    const cells = Math.ceil(minutes / 30);
    for (let tries = 0; tries < 40; tries++) {
      const h = r.pick(prefer);
      const m = r.pick([0, 30]);
      const keys = Array.from({ length: cells }, (_, i) => `${dayOffset}-${h * 2 + m / 30 + i}`);
      if (keys.every((k) => !taken.has(k))) {
        keys.forEach((k) => taken.add(k));
        return at(today, dayOffset, h, m);
      }
    }
    return at(today, dayOffset, 21, 0);
  };
  const addBooking = (leadId: string, kind: BookingKind, start: Date, minutes: number, status: Booking["status"], location: string, title: string, notes = "") =>
    bookings.push({ id: `bk_${bookings.length.toString(36)}`, leadId, kind, start: iso(start), minutes, status, location, title, notes });

  for (const l of leads.filter((x) => x.stage === "call")) {
    const d = slot(r.int(0, 6), [8, 9, 12, 13, 17, 18, 19], 20);
    addBooking(l.id, "Discovery call", d, 20, r.chance(0.75) ? "confirmed" : "pending", "Google Meet", `Discovery call: ${l.name.split(" ")[0]}`, `Goal: ${l.goal}`);
  }
  for (const l of leads.filter((x) => x.stage === "proposal").slice(0, 6)) {
    const d = slot(-r.int(1, 9), [9, 12, 17, 18], 20);
    addBooking(l.id, "Discovery call", d, 20, r.chance(0.85) ? "completed" : "no-show", "Google Meet", `Discovery call: ${l.name.split(" ")[0]}`);
  }
  for (const c of clients) {
    const l = leads.find((x) => x.id === c.leadId)!;
    const o = offerById.get(c.offerId)!;
    const first = l.name.split(" ")[0];
    const startDay = Math.max(-6, Math.round((new Date(c.startDate).getTime() - today.getTime()) / DAY));
    const next = Math.max(startDay, r.int(0, 6));
    addBooking(l.id, "Check-in", slot(next, [7, 8, 19, 20]), 30, "confirmed", "Google Meet", `Weekly check-in: ${first}`);
    if (next - 7 >= startDay) addBooking(l.id, "Check-in", slot(next - 7, [7, 8, 19, 20]), 30, r.chance(0.9) ? "completed" : "cancelled", "Google Meet", `Weekly check-in: ${first}`);
    if (o.type.startsWith("Hybrid")) {
      for (const off of [r.int(1, 3), r.int(8, 12) - 7 - 6]) {
        addBooking(l.id, "Coaching session", slot(off, [7, 8, 18], 60), 60, off < 0 ? "completed" : "confirmed", "In person · Indiranagar partner gym", `Technique session: ${first}`, "Focus: hinge pattern and bracing");
      }
    }
  }
  const newest = leads.find((x) => x.stage === "contacted");
  if (newest) addBooking(newest.id, "Assessment", slot(r.int(2, 5), [10, 11], 45), 45, "pending", "Zoom", `Movement assessment: ${newest.name.split(" ")[0]}`);
  bookings.sort((a, b) => a.start.localeCompare(b.start));

  const fresh = leads.filter((l) => nowMs - new Date(l.createdAt).getTime() < 2 * DAY).slice(0, 3);
  const overdue = leads.filter((l) => l.nextFollowUp && new Date(l.nextFollowUp) < today).length;
  const risk = clients.find((c) => c.status === "at-risk");
  const callToday = bookings.find((b) => b.kind === "Discovery call" && startOfDay(b.start).getTime() === today.getTime() && b.status !== "completed");
  const notifications: Notification[] = [
    ...fresh.map((l, i) => ({ id: `nt_l${i}`, at: l.createdAt, title: `New lead: ${l.name}`, body: `${l.source} · "${l.goal}"`, href: `/app/leads?lead=${l.id}`, read: false })),
    ...(callToday ? [{ id: "nt_call", at: iso(new Date(nowMs - 3 * 3_600_000)), title: "Discovery call today", body: `${callToday.title.replace("Discovery call: ", "")} at ${new Date(callToday.start).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}`, href: "/app/bookings", read: false }] : []),
    ...(overdue ? [{ id: "nt_fu", at: iso(new Date(today.getTime() + 8 * 3_600_000)), title: `${overdue} follow-ups are overdue`, body: "Leads go cold fast. Clear these first.", href: "/app/leads?view=followups", read: false }] : []),
    ...(risk ? [{ id: "nt_risk", at: iso(new Date(nowMs - 26 * 3_600_000)), title: `${leads.find((l) => l.id === risk.leadId)!.name} may be slipping`, body: "Adherence below 65% in the last two check-ins.", href: `/app/clients?client=${risk.id}`, read: true }] : []),
  ].sort((a, b) => b.at.localeCompare(a.at));

  const sample = leads.find((l) => l.stage === "proposal") ?? leads[0]!;
  const drafts: Draft[] = [
    {
      id: "dr_seed1",
      leadId: sample.id,
      goal: "Nudge after proposal",
      tone: "Warm",
      channel: "WhatsApp",
      text: `Hi ${sample.name.split(" ")[0]}! Just checking in on the ${offerById.get(sample.offerId)!.title} plan I sent over. Happy to tweak the schedule if weekday evenings are tricky. Want me to hold a spot for the batch starting Monday?`,
      createdAt: iso(new Date(nowMs - 5 * 3_600_000)),
      status: "draft",
    },
  ];

  return { leads, offers, clients, bookings, drafts, notifications, storefront: defaultStorefront(offers) };
}

export function defaultStorefront(offers: Offer[]): Storefront {
  return {
    slug: "aarav",
    coachName: COACH.name,
    role: COACH.role,
    city: COACH.city,
    headline: "Get strong, lose the fat, keep your desk job.",
    bio: "I coach busy professionals in Bengaluru and online to lift with confidence. No crash diets, no 2-hour workouts: just progressive training, simple nutrition and a coach who checks in every week.",
    theme: "forge",
    heroImage: IMAGES.coachAarav,
    offerIds: offers.filter((o) => o.status === "live").map((o) => o.id),
    showTestimonials: true,
    showFaq: true,
    ctaLabel: "Book a free discovery call",
    stats: [
      { label: "Years coaching", value: "7" },
      { label: "Sessions a week", value: "3–4" },
      { label: "Check-in", value: "Weekly" },
    ],
  };
}

function sourceNote(s: Source) {
  return {
    Instagram: "Lead created from an Instagram DM",
    Storefront: "Enquiry submitted on your storefront",
    Referral: "Referred by an existing client",
    YouTube: "Came from a YouTube video description link",
    WhatsApp: "Messaged on WhatsApp Business",
  }[s];
}

function checkInNote(adherence: number, x: number) {
  if (adherence >= 88) return x > 0.5 ? "Hit every session. Squat felt smooth at the new weight." : "Great week. Slept better and protein was on target most days.";
  if (adherence >= 75) return x > 0.5 ? "Missed one session (work travel) but stayed on nutrition." : "Good week overall. Lower back a bit tight after deadlifts.";
  if (adherence >= 60) return x > 0.5 ? "Busy week at work. Got 2 of 4 sessions in." : "Struggled with evening snacking; energy was low.";
  return x > 0.5 ? "Skipped most sessions. Feeling unmotivated, needs a call." : "Travelled all week, no training. Wants an easier plan.";
}

function planFor(kind: string, weeks: number) {
  const third = Math.round(weeks / 3);
  if (kind === "fat")
    return [`Weeks 1–${third}: build the habit (3 sessions, 8k steps)`, `Weeks ${third + 1}–${third * 2}: progressive full-body strength`, `Weeks ${third * 2 + 1}–${weeks}: conditioning finishers + maintenance plan`];
  if (kind === "endurance") return [`Weeks 1–${third}: run-walk base + strength twice a week`, `Weeks ${third + 1}–${third * 2}: tempo runs, single-leg strength`, `Weeks ${third * 2 + 1}–${weeks}: 10K build and taper`];
  if (kind === "posture" || kind === "return")
    return [`Weeks 1–${third}: mobility, core and movement quality`, `Weeks ${third + 1}–${third * 2}: foundational strength (goblet squat, hinge, rows)`, `Weeks ${third * 2 + 1}–${weeks}: loaded progressions and independence`];
  return [`Weeks 1–${third}: technique on the big lifts`, `Weeks ${third + 1}–${third * 2}: linear progression, 3 sessions a week`, `Weeks ${third * 2 + 1}–${weeks}: heavier singles and a test week`];
}

function metricsFor(kind: string, progress: number, r: ReturnType<typeof rng>): Metric[] {
  const lerp = (a: number, b: number, t: number, dp = 1) => {
    const f = 10 ** dp;
    return Math.round((a + (b - a) * Math.max(0, Math.min(1, t))) * f) / f;
  };
  if (kind === "fat") {
    const w = r.int(72, 94);
    const waist = r.int(86, 102);
    return [
      { label: "Body weight", unit: "kg", start: w, current: lerp(w, w - 7, progress), target: w - 7, lowerIsBetter: true },
      { label: "Waist", unit: "cm", start: waist, current: lerp(waist, waist - 8, progress, 0), target: waist - 8, lowerIsBetter: true },
      { label: "Avg. daily steps", unit: "k", start: 4.2, current: lerp(4.2, 9, progress * 1.1), target: 9 },
    ];
  }
  if (kind === "endurance") {
    return [
      { label: "Continuous run", unit: "km", start: 2, current: lerp(2, 10, progress), target: 10 },
      { label: "Resting heart rate", unit: "bpm", start: 74, current: lerp(74, 64, progress, 0), target: 64, lowerIsBetter: true },
      { label: "Weekly sessions", unit: "", start: 1, current: lerp(1, 4, progress * 1.2, 0), target: 4 },
    ];
  }
  if (kind === "posture" || kind === "return") {
    return [
      { label: "Pain-free plank", unit: "s", start: 20, current: lerp(20, 90, progress, 0), target: 90 },
      { label: "Goblet squat", unit: "kg", start: 6, current: lerp(6, 20, progress, 0), target: 20 },
      { label: "Back stiffness (1–10)", unit: "", start: 7, current: lerp(7, 2, progress, 0), target: 2, lowerIsBetter: true },
    ];
  }
  const sq = r.int(30, 50);
  return [
    { label: "Back squat", unit: "kg", start: sq, current: lerp(sq, sq + 35, progress, 0), target: sq + 35 },
    { label: "Deadlift", unit: "kg", start: sq + 10, current: lerp(sq + 10, sq + 55, progress, 0), target: sq + 55 },
    { label: "Pull-ups", unit: "reps", start: 0, current: lerp(0, 5, progress, 0), target: 5 },
  ];
}
