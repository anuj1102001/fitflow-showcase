import { claimCheck, goalPhrase, type Channel, type ClientGoal, type FollowUpGoal, type Tone } from "./ai";
import { addDays, DAY, firstName, rupees, startOfDay } from "./format";
import { STAGE_LABEL, type Client, type Lead, type Offer } from "./types";

/**
 * The follow-up engine: sequences (multi-step cadences), the Today queue that says who to message and
 * why, and the explanation shown next to every draft. Pure functions over the demo data, so they're
 * tested in tests/logic.test.ts.
 */

export type SequenceId = "new-enquiry" | "proposal" | "win-back" | "client-rescue";
export type Step = { day: number; goal: FollowUpGoal | ClientGoal; channel: Channel; why: string };
export type Sequence = { id: SequenceId; name: string; audience: "lead" | "client"; trigger: string; stops: string; steps: Step[] };

export const SEQUENCES: Sequence[] = [
  {
    id: "new-enquiry",
    name: "New enquiry",
    audience: "lead",
    trigger: "A new lead arrives from any channel",
    stops: "They reply, book a call or are marked won or lost",
    steps: [
      { day: 0, goal: "Reply to a new enquiry", channel: "WhatsApp", why: "Reply the same day: interest is highest right after they reach out." },
      { day: 2, goal: "Book a discovery call", channel: "WhatsApp", why: "Turn interest into a time on the calendar." },
      { day: 5, goal: "Share something useful", channel: "Instagram DM", why: "Give value before asking again, so the next nudge isn't pushy." },
      { day: 9, goal: "Re-engage a quiet lead", channel: "WhatsApp", why: "A last, easy yes/no question before the lead goes cold." },
    ],
  },
  {
    id: "proposal",
    name: "Proposal follow-through",
    audience: "lead",
    trigger: "A proposal is sent",
    stops: "They reply, or are marked won or lost",
    steps: [
      { day: 1, goal: "Nudge after a proposal", channel: "WhatsApp", why: "Answer questions while the details are fresh." },
      { day: 4, goal: "Nudge after a proposal", channel: "Email", why: "Name the usual blockers (price, timing) and offer a fix." },
      { day: 8, goal: "Re-engage a quiet lead", channel: "WhatsApp", why: "Close the loop politely, with the door left open." },
    ],
  },
  {
    id: "win-back",
    name: "Win back a quiet lead",
    audience: "lead",
    trigger: "No contact for 7+ days",
    stops: "They reply, or after the last step",
    steps: [
      { day: 0, goal: "Re-engage a quiet lead", channel: "WhatsApp", why: "A low-pressure check-in that references their goal." },
      { day: 7, goal: "Share something useful", channel: "Instagram DM", why: "Something genuinely useful, no ask attached." },
    ],
  },
  {
    id: "client-rescue",
    name: "Client rescue",
    audience: "client",
    trigger: "A client's adherence drops below 65%",
    stops: "Their next check-in is back on track",
    steps: [
      { day: 0, goal: "Check in after a tough week", channel: "WhatsApp", why: "Ask what got in the way before changing the plan." },
      { day: 3, goal: "Offer a lighter week", channel: "WhatsApp", why: "Lower the bar so they can rebuild momentum." },
      { day: 7, goal: "Book a reset call", channel: "WhatsApp", why: "If texts haven't worked, a short call usually does." },
    ],
  },
];

export const sequenceById = (id: SequenceId) => SEQUENCES.find((s) => s.id === id)!;

export type EnrollmentStatus = "active" | "paused" | "done" | "stopped";
export type Enrollment = {
  id: string;
  sequenceId: SequenceId;
  /** The person enrolled: a lead id (clients are leads that were won). */
  leadId: string;
  startedAt: string;
  /** Index of the next step to send. */
  step: number;
  status: EnrollmentStatus;
  /** Why it paused or stopped ("Replied", "Marked won"). */
  reason?: string;
  /** When it paused (a reply). Replies older than a few days have been answered already. */
  pausedAt?: string;
  log: { step: number; at: string; channel: Channel }[];
};

/** When step `i` of an enrollment is due (start of that day). */
export function stepDue(e: Pick<Enrollment, "startedAt" | "sequenceId">, i: number) {
  const step = sequenceById(e.sequenceId).steps[i];
  return step ? addDays(startOfDay(e.startedAt), step.day) : null;
}

/** The sequence a lead would naturally go into, given its stage and how long it has been quiet. */
export function suggestSequence(lead: Lead, now = Date.now()): SequenceId | null {
  if (lead.stage === "won" || lead.stage === "lost" || lead.stage === "call") return null;
  if (lead.stage === "proposal") return "proposal";
  const quiet = now - new Date(lead.lastContactAt ?? lead.createdAt).getTime();
  if (lead.stage === "contacted" && quiet > 7 * DAY) return "win-back";
  return "new-enquiry";
}

export type TaskKind = "step" | "reply" | "overdue" | "client";
export type Task = {
  id: string;
  kind: TaskKind;
  leadId: string;
  clientId?: string;
  enrollmentId?: string;
  stepIndex?: number;
  goal: FollowUpGoal | ClientGoal;
  channel: Channel;
  due: string;
  daysOverdue: number;
  /** Plain-language reason this person is in today's queue. */
  why: string;
  priority: number;
};

const LEAD_GOAL: Record<string, FollowUpGoal> = { new: "Reply to a new enquiry", contacted: "Book a discovery call", call: "Thank them after a call", proposal: "Nudge after a proposal" };

/**
 * Today's queue: due sequence steps, people who replied and are waiting on you, overdue leads that aren't
 * in a sequence, and clients who are slipping. Highest priority first.
 */
export function buildQueue(data: { leads: Lead[]; clients: Client[]; enrollments: Enrollment[] }, now = Date.now()): Task[] {
  const endOfToday = addDays(startOfDay(now), 1).getTime() - 1;
  const today = startOfDay(now).getTime();
  const overdueBy = (d: Date | string) => Math.max(0, Math.round((today - startOfDay(d).getTime()) / DAY));
  const leadById = new Map(data.leads.map((l) => [l.id, l]));
  const tasks: Task[] = [];
  const covered = new Set<string>();

  for (const e of data.enrollments) {
    const lead = leadById.get(e.leadId);
    if (!lead) continue;
    if (e.status === "active") covered.add(e.leadId);
    if (e.status !== "active") continue;
    const seq = sequenceById(e.sequenceId);
    const step = seq.steps[e.step];
    const due = stepDue(e, e.step);
    if (!step || !due || due.getTime() > endOfToday) continue;
    const late = overdueBy(due);
    const client = seq.audience === "client" ? data.clients.find((c) => c.leadId === lead.id) : undefined;
    tasks.push({
      id: `t_${e.id}_${e.step}`,
      kind: "step",
      leadId: lead.id,
      clientId: client?.id,
      enrollmentId: e.id,
      stepIndex: e.step,
      goal: step.goal,
      channel: step.channel,
      due: due.toISOString(),
      daysOverdue: late,
      why: `${seq.name} · step ${e.step + 1} of ${seq.steps.length}${late ? ` · ${late} day${late > 1 ? "s" : ""} late` : ""}`,
      priority: (seq.audience === "client" ? 70 : e.sequenceId === "proposal" ? 80 : e.step === 0 ? 85 : 60) + Math.min(late, 6) * 4 + Math.min(lead.value / 2000, 10),
    });
  }

  for (const lead of data.leads) {
    if (lead.stage === "won" || lead.stage === "lost" || covered.has(lead.id)) continue;
    if (!lead.nextFollowUp || new Date(lead.nextFollowUp).getTime() > endOfToday) continue;
    const replied = data.enrollments.some((e) => e.leadId === lead.id && e.status === "paused" && e.reason === "Replied" && !!e.pausedAt && now - new Date(e.pausedAt).getTime() < 3 * DAY);
    const late = overdueBy(lead.nextFollowUp);
    tasks.push({
      id: `t_${lead.id}_${replied ? "reply" : "due"}`,
      kind: replied ? "reply" : "overdue",
      leadId: lead.id,
      goal: replied ? "Book a discovery call" : (LEAD_GOAL[lead.stage] ?? "Re-engage a quiet lead"),
      channel: "WhatsApp",
      due: new Date(lead.nextFollowUp).toISOString(),
      daysOverdue: late,
      why: replied ? "Replied to your sequence · waiting on you" : `Follow-up ${late ? `${late} day${late > 1 ? "s" : ""} overdue` : "due today"} · not in a sequence`,
      // Someone who replied is always first: a person waiting on you beats any scheduled step.
      priority: (replied ? 200 : 55) + Math.min(late, 6) * 4 + Math.min(lead.value / 2000, 10),
    });
  }

  for (const c of data.clients) {
    const lead = leadById.get(c.leadId);
    if (!lead || covered.has(lead.id) || c.status === "on-track") continue;
    const last = c.checkIns[0];
    tasks.push({
      id: `t_${c.id}_client`,
      kind: "client",
      leadId: lead.id,
      clientId: c.id,
      goal: "Check in after a tough week",
      channel: "WhatsApp",
      due: new Date(today).toISOString(),
      daysOverdue: 0,
      why: `${c.status === "at-risk" ? "At risk" : "Needs attention"}${last ? ` · ${last.adherence}% adherence at the last check-in` : ""}`,
      priority: c.status === "at-risk" ? 88 : 62,
    });
  }

  return tasks.sort((a, b) => b.priority - a.priority);
}

/** Steps due in the next `days` days (not today), for the "coming up" strip. */
export function upcoming(enrollments: Enrollment[], now = Date.now(), days = 7) {
  const from = addDays(startOfDay(now), 1).getTime();
  const to = addDays(startOfDay(now), days + 1).getTime();
  return enrollments
    .filter((e) => e.status === "active")
    .map((e) => ({ e, due: stepDue(e, e.step) }))
    .filter((x): x is { e: Enrollment; due: Date } => !!x.due && x.due.getTime() >= from && x.due.getTime() < to)
    .sort((a, b) => a.due.getTime() - b.due.getTime());
}

/** Reply rate and outcome counts for a sequence (sample data). */
export function sequenceStats(id: SequenceId, enrollments: Enrollment[]) {
  const mine = enrollments.filter((e) => e.sequenceId === id);
  const replied = mine.filter((e) => e.reason === "Replied" || e.reason === "Marked won").length;
  const started = mine.filter((e) => e.log.length > 0).length;
  // Too few to tell: no rate until at least three people have had a step.
  return { enrolled: mine.filter((e) => e.status === "active").length, total: mine.length, replied, replyRate: started >= 3 ? replied / started : null };
}

export type Signal = { label: string; detail: string };

/**
 * Why a draft says what it says: the facts it used, the rules it followed and the checks it passed.
 * Shown beside every draft so the coach can trust (or correct) it before sending.
 */
export function explainDraft(input: { lead: Lead; offer?: Offer; client?: Client; goal: string; tone: Tone; channel: Channel; text: string }, now = Date.now()) {
  const { lead, offer, client, goal, tone, channel, text } = input;
  const used: Signal[] = [];
  const t = text.toLowerCase();
  const name = firstName(lead.name);
  if (t.includes(name.toLowerCase())) used.push({ label: "Their name", detail: `Opens with ${name}, not a template greeting.` });
  if (!client && t.includes(goalPhrase(lead).toLowerCase().slice(0, 24))) used.push({ label: "Their own words", detail: `Reflects the goal they shared: “${lead.goal}”.` });
  if (offer && t.includes(offer.title.toLowerCase())) used.push({ label: "The program they asked about", detail: `${offer.title} (${rupees(offer.price)}).` });
  if (client?.checkIns[0] && t.includes(`${client.checkIns[0].adherence}%`)) used.push({ label: "Their last check-in", detail: `${client.checkIns[0].adherence}% of sessions: “${client.checkIns[0].note}”` });
  const quietDays = Math.round((now - new Date(lead.lastContactAt ?? lead.createdAt).getTime()) / DAY);
  used.push({ label: "Where they are", detail: client ? `Client since ${new Date(client.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}. Goal: ${goal.toLowerCase()}.` : `${STAGE_LABEL[lead.stage]}, last contact ${quietDays <= 0 ? "today" : `${quietDays} day${quietDays > 1 ? "s" : ""} ago`}. Goal: ${goal.toLowerCase()}.` });
  used.push({ label: "Channel & tone", detail: channel === "Email" ? `Email, so it has a subject line and a sign-off. ${tone} tone.` : `${channel}, so it stays short (${text.length} characters) and conversational. ${tone} tone.` });

  const risky = claimCheck(text);
  const checks = [
    { ok: risky.length === 0, label: risky.length ? `Flagged: ${risky.join(", ")}` : "No guarantees, cures or crash-diet promises" },
    { ok: /\?/.test(text), label: /\?/.test(text) ? "Ends with one easy question" : "No question: add one so it's easy to reply" },
    { ok: channel === "Email" || text.length <= 420, label: channel === "Email" || text.length <= 420 ? "Short enough to read on a phone" : "Long for a chat message: consider trimming" },
    { ok: true, label: "A draft, not a send: you review and send it yourself" },
  ];
  return { used, checks };
}

/** Splits a draft into plain and personalised segments, for highlighting in the preview. */
export function personalSegments(text: string, phrases: string[]) {
  const marks = phrases.filter((p) => p && p.length > 2);
  if (!marks.length) return [{ text, mark: false }];
  const esc = marks.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).sort((a, b) => b.length - a.length);
  const re = new RegExp(`(${esc.join("|")})`, "gi");
  return text.split(re).filter(Boolean).map((part) => ({ text: part, mark: marks.some((m) => m.toLowerCase() === part.toLowerCase()) }));
}
