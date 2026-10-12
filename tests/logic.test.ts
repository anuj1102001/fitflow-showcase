import assert from "node:assert/strict";
import { test } from "node:test";
import { answer, claimCheck, draftFollowUp, draftOffer, priceGuide } from "../src/lib/ai";
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
