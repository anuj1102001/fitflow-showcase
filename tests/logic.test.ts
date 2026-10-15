import assert from "node:assert/strict";
import { test } from "node:test";
import { answer, claimCheck, draftClientMessage, draftFollowUp, draftOffer, priceGuide } from "../src/lib/ai";
import { buildQueue, explainDraft, personalSegments, sequenceById } from "../src/lib/sequences";
import { bySource, funnel, kpis, series } from "../src/lib/analytics";
import { generateSeed } from "../src/lib/seed";

const NOW = new Date("2026-10-12T10:00:00+05:30").getTime();
const data = generateSeed(NOW);

test("sample data is deterministic for a given date", () => {
  const again = generateSeed(NOW);
  assert.equal(again.leads.length, data.leads.length);
  assert.deepEqual(again.leads.slice(0, 5).map((l) => l.name), data.leads.slice(0, 5).map((l) => l.name));
});

test("sample data is internally consistent", () => {
  const ids = new Set(data.leads.map((l) => l.id));
  for (const c of data.clients) {
    const lead = data.leads.find((l) => l.id === c.leadId);
    assert.ok(lead, "client has a lead");
    assert.equal(lead!.stage, "won", "clients are won leads");
  }
  for (const b of data.bookings) assert.ok(ids.has(b.leadId), "booking belongs to a known person");
  for (const l of data.leads) {
    assert.ok(new Date(l.createdAt).getTime() <= NOW, "no leads from the future");
    if (l.wonAt) assert.ok(new Date(l.wonAt) >= new Date(l.createdAt), "won after created");
    if (l.stage === "won" || l.stage === "lost") assert.equal(l.nextFollowUp, undefined, "closed leads have no follow-up");
  }
});

test("seeded bookings never overlap", () => {
  const live = data.bookings.filter((b) => b.status !== "cancelled").sort((a, b) => a.start.localeCompare(b.start));
  for (let i = 1; i < live.length; i++) {
    const prevEnd = new Date(live[i - 1]!.start).getTime() + live[i - 1]!.minutes * 60_000;
    assert.ok(new Date(live[i]!.start).getTime() >= prevEnd || new Date(live[i]!.start).getDate() !== new Date(live[i - 1]!.start).getDate(), `overlap at ${live[i]!.start}`);
  }
});

test("KPIs match the time series and funnel", () => {
  const f = { range: "90d" as const, source: "all" as const, now: NOW };
  const k = kpis(data.leads, f);
  const s = series(data.leads, f);
  assert.equal(s.reduce((a, b) => a + b.leads, 0), k.cur.leads);
  assert.equal(s.reduce((a, b) => a + b.revenue, 0), k.cur.revenue);
  const fn = funnel(data.leads, f);
  assert.equal(fn[0]!.count, k.cur.leads);
  for (let i = 1; i < fn.length; i++) assert.ok(fn[i]!.count <= fn[i - 1]!.count, "funnel narrows");
});

test("source breakdown adds up to the total", () => {
  const k = kpis(data.leads, { range: "12m", source: "all", now: NOW });
  const total = bySource(data.leads, { range: "12m", now: NOW }).reduce((a, s) => a + s.leads, 0);
  assert.equal(total, k.cur.leads);
});

test("rates are null, not zero, when there is no data", () => {
  const k = kpis([], { range: "30d", source: "all", now: NOW });
  assert.equal(k.cur.conversion, null);
  assert.equal(k.delta.leads, null);
});

test("offer drafts are complete, vary on regenerate and pass the claims check", () => {
  const input = { goal: "fat" as const, audience: "desk" as const, type: "1:1 online coaching" as const, weeks: 12, price: 14999 };
  const a = draftOffer(input, 0);
  const b = draftOffer(input, 1);
  assert.ok(a.title && a.tagline && a.description && a.cta);
  assert.ok(a.benefits.length >= 3);
  assert.notEqual(a.title, b.title);
  assert.deepEqual(claimCheck(`${a.title} ${a.description} ${a.benefits.join(" ")}`), []);
});

test("claims check flags guarantees and medical language", () => {
  assert.ok(claimCheck("Guaranteed results: lose 10 kg in 30 days").length >= 2);
  assert.ok(claimCheck("This detox will cure your back pain").length >= 2);
});

test("price guide classifies prices", () => {
  const g = priceGuide("Small-group program", 8);
  assert.ok(g.low < g.high);
  assert.equal(priceGuide("Small-group program", 8, 100).verdict, "below");
  assert.equal(priceGuide("Small-group program", 8, g.low + 1).verdict, "within");
  assert.equal(priceGuide("Small-group program", 8, g.high * 3).verdict, "above");
});

test("follow-ups use the lead's first name and never their contact details", () => {
  const lead = data.leads.find((l) => l.stage === "proposal")!;
  const text = draftFollowUp(lead, data.offers[0], "Nudge after a proposal", "Warm", "Email");
  assert.ok(text.includes(lead.name.split(" ")[0]!));
  assert.ok(text.startsWith("Subject:"));
  assert.ok(!text.includes(lead.email) && !text.includes(lead.phone));
});

test("assistant answers are grounded in the data", () => {
  const a = answer("Which lead source is performing best?", data, NOW);
  const rows = bySource(data.leads, { range: "90d", now: NOW }).filter((r) => r.leads > 0);
  for (const r of rows) assert.ok(a.text.includes(`**${r.source}**: ${r.leads} leads`), `mentions ${r.source}`);
  assert.ok(answer("hello there", data, NOW).text.includes("Try one of these"));
});

/* ------------------------------------------------------------------ follow-up engine */

test("seeded sequences are consistent with the leads they follow", () => {
  const byId = new Map(data.leads.map((l) => [l.id, l]));
  for (const e of data.enrollments) {
    const lead = byId.get(e.leadId);
    assert.ok(lead, "enrollment belongs to a known person");
    const seq = sequenceById(e.sequenceId);
    assert.ok(e.step >= 0 && e.step <= seq.steps.length, "step in range");
    assert.equal(e.log.length, e.step, "one log entry per sent step");
    if (seq.audience === "lead" && e.status === "active") assert.ok(!["won", "lost"].includes(lead!.stage), "closed leads are not in an active sales sequence");
  }
  const active = data.enrollments.filter((e) => e.status === "active");
  assert.equal(new Set(active.map((e) => e.leadId)).size, active.length, "at most one active sequence per person");
});

test("today's queue is sorted, has no duplicates and explains every item", () => {
  const q = buildQueue(data, NOW);
  assert.ok(q.length > 0, "sample data produces work for today");
  for (let i = 1; i < q.length; i++) assert.ok(q[i - 1]!.priority >= q[i]!.priority, "sorted by priority");
  assert.equal(new Set(q.map((t) => t.leadId)).size, q.length, "one task per person");
  for (const t of q) assert.ok(t.why.length > 5, "every task says why");
  const endOfToday = new Date(NOW);
  endOfToday.setHours(23, 59, 59, 999);
  for (const t of q) assert.ok(new Date(t.due).getTime() <= endOfToday.getTime(), "nothing from the future");
});

test("a replied lead jumps to the top of the queue as a reply task", () => {
  const e = data.enrollments.find((x) => x.status === "active" && sequenceById(x.sequenceId).audience === "lead")!;
  const enrollments = data.enrollments.map((x) => (x.id === e.id ? { ...x, status: "paused" as const, reason: "Replied", pausedAt: new Date(NOW).toISOString() } : x));
  const leads = data.leads.map((l) => (l.id === e.leadId ? { ...l, nextFollowUp: new Date(NOW).toISOString() } : l));
  const q = buildQueue({ leads, clients: data.clients, enrollments }, NOW);
  const t = q.find((x) => x.leadId === e.leadId);
  assert.equal(t?.kind, "reply");
  assert.equal(q[0]!.kind, "reply", "replies come first");
});

test("draft explanations name what was used and pass the guardrails", () => {
  const lead = data.leads.find((l) => l.stage === "new")!;
  const offer = data.offers.find((o) => o.id === lead.offerId);
  const text = draftFollowUp(lead, offer, "Reply to a new enquiry", "Warm", "WhatsApp");
  const why = explainDraft({ lead, offer, goal: "Reply to a new enquiry", tone: "Warm", channel: "WhatsApp", text }, NOW);
  assert.ok(why.used.some((u) => u.label === "Their name"), "uses the name");
  assert.ok(why.checks.every((c) => c.ok), "all checks pass: " + why.checks.filter((c) => !c.ok).map((c) => c.label).join(", "));
  const risky = explainDraft({ lead, offer, goal: "x", tone: "Warm", channel: "WhatsApp", text: "Guaranteed results, lose 10kg in a month" }, NOW);
  assert.ok(risky.checks.some((c) => !c.ok), "risky copy is flagged");
});

test("personalised segments rebuild the original text", () => {
  const text = "Hi Priya! About your goal to lose 8 kg, here's a plan.";
  const segs = personalSegments(text, ["Priya", "your goal to lose 8 kg"]);
  assert.equal(segs.map((s) => s.text).join(""), text);
  assert.deepEqual(segs.filter((s) => s.mark).map((s) => s.text), ["Priya", "your goal to lose 8 kg"]);
});

test("client messages reference the latest check-in", () => {
  const client = data.clients.find((c) => c.checkIns.length)!;
  const lead = data.leads.find((l) => l.id === client.leadId)!;
  const text = draftClientMessage(lead, client, undefined, "Check in after a tough week", "Warm", "WhatsApp");
  assert.ok(text.includes(`${client.checkIns[0]!.adherence}%`), "mentions adherence");
  assert.equal(claimCheck(text).length, 0);
});
