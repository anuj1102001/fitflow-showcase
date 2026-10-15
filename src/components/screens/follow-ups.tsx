"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, CheckCheck, CircleAlert, CircleCheck, Copy, Info, ListChecks, MessageCircle, RefreshCcw, Repeat, Reply, Save, Search, Send, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { EASE } from "@/components/motion/kit";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Avatar, Badge, DemoTag, Empty, Panel, Segmented } from "@/components/ui/kit";
import { useToast } from "@/components/ui/toast";
import { CHANNELS, CLIENT_GOALS, draftClientMessage, draftFollowUp, FOLLOW_UP_GOALS, goalPhrase, TONES, type Channel, type ClientGoal, type FollowUpGoal, type Tone } from "@/lib/ai";
import { ago, dateShort, firstName, relDay, rupees, uid } from "@/lib/format";
import { explainDraft, personalSegments, sequenceById, stepDue, suggestSequence } from "@/lib/sequences";
import { useDemo } from "@/lib/store";
import { STAGE_LABEL } from "@/lib/types";
import { STAGE_TONE } from "./leads";
import { CHANNEL_ICON } from "./today";

const SUGGESTED: Record<string, FollowUpGoal> = { new: "Reply to a new enquiry", contacted: "Book a discovery call", call: "Thank them after a call", proposal: "Nudge after a proposal" };
type Goal = FollowUpGoal | ClientGoal;

/**
 * Compose: a draft for one person that shows its reasoning. Opened from Today (with the sequence step,
 * goal and channel pre-set) or directly. FITFLOW drafts; the coach edits and sends it themselves.
 */
export function FollowUpsScreen() {
  const leads = useDemo((s) => s.leads);
  const offers = useDemo((s) => s.offers);
  const clients = useDemo((s) => s.clients);
  const drafts = useDemo((s) => s.drafts);
  const enrollments = useDemo((s) => s.enrollments);
  const saveDraft = useDemo((s) => s.saveDraft);
  const markDraftSent = useDemo((s) => s.markDraftSent);
  const deleteDraft = useDemo((s) => s.deleteDraft);
  const logStep = useDemo((s) => s.logStep);
  const enroll = useDemo((s) => s.enroll);
  const markReplied = useDemo((s) => s.markReplied);
  const params = useSearchParams();
  const router = useRouter();
  const toast = useToast();

  const open = useMemo(() => leads.filter((l) => !["won", "lost"].includes(l.stage)).sort((a, b) => (a.nextFollowUp ?? "9").localeCompare(b.nextFollowUp ?? "9")), [leads]);
  const [q, setQ] = useState("");
  const client = clients.find((c) => c.id === params.get("client"));
  const leadId = client?.leadId ?? params.get("lead") ?? open[0]?.id ?? null;
  const lead = leads.find((l) => l.id === leadId);
  const offer = offers.find((o) => o.id === (client?.offerId ?? lead?.offerId));
  const active = enrollments.find((e) => e.leadId === leadId && e.status === "active");
  const fromStep = active && active.id === params.get("enrollment") ? active : undefined;
  const seq = active ? sequenceById(active.sequenceId) : undefined;
  const goals: readonly Goal[] = client ? CLIENT_GOALS : FOLLOW_UP_GOALS;

  const pickGoal = (): Goal => {
    const g = params.get("goal") as Goal | null;
    if (g && goals.includes(g)) return g;
    if (client) return "Check in after a tough week";
    if (!lead) return "Reply to a new enquiry";
    return lead.lastContactAt && Date.now() - new Date(lead.lastContactAt).getTime() > 5 * 86_400_000 ? "Re-engage a quiet lead" : (SUGGESTED[lead.stage] ?? "Reply to a new enquiry");
  };
  const [goal, setGoal] = useState<Goal>(pickGoal);
  const [tone, setTone] = useState<Tone>("Warm");
  const [channel, setChannel] = useState<Channel>(((params.get("channel") as Channel) ?? "WhatsApp") as Channel);
  const [variant, setVariant] = useState(0);
  const [text, setText] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset the composer when the person changes.
  useEffect(() => {
    setGoal(pickGoal());
    const c = params.get("channel") as Channel | null;
    if (c && CHANNELS.includes(c)) setChannel(c);
    setText("");
    setDraftId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId, client?.id, params.get("enrollment")]);
  useEffect(() => () => void (timer.current && clearInterval(timer.current)), []);

  const write = (v: number) => {
    if (!lead) return "";
    if (client) return draftClientMessage(lead, client, offer, goal as ClientGoal, tone, channel, v);
    return draftFollowUp(lead, offer, goal as FollowUpGoal, tone, channel, v);
  };

  const generate = (v = variant) => {
    if (!lead) return;
    const full = write(v);
    if (timer.current) clearInterval(timer.current);
    setStreaming(true);
    setDraftId(null);
    setText("");
    let i = 0;
    timer.current = setInterval(() => {
      i = Math.min(full.length, i + 3 + Math.floor(Math.random() * 3));
      setText(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(timer.current!);
        setStreaming(false);
      }
    }, 18);
  };

  const save = () => {
    if (!lead || !text.trim()) return;
    const id = draftId ?? uid("dr");
    saveDraft({ id, leadId: lead.id, goal, tone, channel, text: text.trim(), createdAt: new Date().toISOString(), status: "draft" });
    setDraftId(id);
    toast({ tone: "success", title: "Draft saved", body: `For ${lead.name}` });
    return id;
  };

  const sent = () => {
    if (!lead || !text.trim()) return;
    if (fromStep && seq) {
      logStep(fromStep.id, { channel, text: text.trim() });
      const next = seq.steps[fromStep.step + 1];
      const due = next ? stepDue(fromStep, fromStep.step + 1) : null;
      toast({ tone: "success", title: `Step ${fromStep.step + 1} logged`, body: next && due ? `Next: ${next.goal.toLowerCase()} on ${dateShort(due)}. (Nothing was actually sent.)` : `${seq.name} finished for ${firstName(lead.name)}.` });
      router.push("/app#today");
      return;
    }
    const id = save();
    if (!id) return;
    markDraftSent(id);
    toast({ tone: "success", title: "Logged as sent", body: `Added to ${firstName(lead.name)}'s timeline. (Nothing was actually sent.)` });
  };

  const why = useMemo(() => (lead && text && !streaming ? explainDraft({ lead, offer, client, goal, tone, channel, text }) : null), [lead, offer, client, goal, tone, channel, text, streaming]);
  const marks = lead ? [firstName(lead.name), client ? "" : goalPhrase(lead), offer?.title ?? "", client?.checkIns[0] ? `${client.checkIns[0].adherence}% of sessions` : ""] : [];
  const suggestion = lead && !client && !active ? suggestSequence(lead) : null;
  const filtered = open.filter((l) => !q || l.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_300px]">
      {/* Person picker */}
      <Panel title="Choose a lead" subtitle="Open leads, most urgent first" bodyClass="px-3 pb-3 sm:px-3">
        <div className="relative mb-2 px-2">
          <Search size={14} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-fg-3" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" aria-label="Search leads" className="h-9 w-full rounded-full border border-line bg-panel-2/50 pl-8 pr-3 text-[13px] placeholder:text-fg-3 focus:border-lime-fg/50 focus:outline-none" />
        </div>
        <ul className="max-h-[260px] space-y-0.5 overflow-y-auto xl:max-h-[640px]">
          {filtered.map((l) => {
            const due = l.nextFollowUp ? relDay(l.nextFollowUp) : null;
            return (
              <li key={l.id}>
                <button onClick={() => router.replace(`/app/follow-ups?lead=${l.id}`, { scroll: false })} aria-current={l.id === leadId && !client} className={cn("flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition", l.id === leadId && !client ? "bg-panel-2 ring-1 ring-line-2" : "hover:bg-panel-2/60")}>
                  <Avatar name={l.name} size={30} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-medium">{l.name}</span>
                    <span className={cn("block truncate text-[12px]", due?.includes("overdue") ? "text-warn" : "text-fg-3")}>
                      {STAGE_LABEL[l.stage]}
                      {due ? ` · ${due}` : ""}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
          {filtered.length === 0 && <li className="px-3 py-6 text-center text-[13px] text-fg-3">No matching open leads.</li>}
        </ul>
      </Panel>

      {/* Composer */}
      <div className="min-w-0 space-y-5">
        {!lead ? (
          <Empty icon={<MessageCircle size={20} />} title="Pick someone to start" body="Choose a lead from the list, or open a follow-up from Today." />
        ) : (
          <>
            <motion.div key={lead.id + (client?.id ?? "")} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} className="card p-5">
              <div className="flex flex-wrap items-center gap-4">
                <Avatar name={lead.name} size={46} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={client ? `/app/clients?client=${client.id}` : `/app/leads?lead=${lead.id}`} className="text-[17px] font-semibold hover:underline">
                      {lead.name}
                    </Link>
                    {client ? (
                      <Badge tone={client.status === "at-risk" ? "bad" : client.status === "attention" ? "warn" : "ok"} dot>
                        Client · {client.status === "at-risk" ? "at risk" : client.status === "attention" ? "needs attention" : "on track"}
                      </Badge>
                    ) : (
                      <Badge tone={STAGE_TONE[lead.stage]} dot>
                        {STAGE_LABEL[lead.stage]}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-[13.5px] text-fg-2">{client?.checkIns[0] ? `Last check-in: “${client.checkIns[0].note}”` : `“${lead.goal}”`}</p>
                  <p className="mt-1 text-[12.5px] text-fg-3">
                    {client ? `${offer?.title ?? "Program"} · ${client.checkIns[0]?.adherence ?? "–"}% adherence last week` : `${lead.source} · ${offer?.title ?? "–"} (${rupees(lead.value)}) · last contact ${lead.lastContactAt ? ago(lead.lastContactAt) : "never"}`}
                  </p>
                </div>
              </div>
              {/* sequence context */}
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3 text-[12.5px]">
                <Repeat size={14} className="text-fg-3" />
                {active && seq ? (
                  <>
                    <span className="text-fg-2">
                      <b className="font-medium text-fg">{seq.name}</b> · step {active.step + 1} of {seq.steps.length}
                      {fromStep ? ` · ${seq.steps[active.step]?.why}` : ""}
                    </span>
                    {seq.audience === "lead" && (
                      <button onClick={() => (markReplied(lead.id), toast({ tone: "success", title: `${firstName(lead.name)} replied`, body: "Sequence paused." }))} className="ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium text-lime-fg hover:bg-lime/10">
                        <Reply size={13} /> They replied
                      </button>
                    )}
                  </>
                ) : suggestion || client ? (
                  <>
                    <span className="text-fg-3">Not in a sequence.</span>
                    <button
                      onClick={() => {
                        const id = client ? "client-rescue" : suggestion!;
                        enroll(lead.id, id);
                        toast({ tone: "success", title: `Added to ${sequenceById(id).name}`, body: "The first step is in Today." });
                      }}
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium text-lime-fg hover:bg-lime/10"
                    >
                      Add to {sequenceById(client ? "client-rescue" : suggestion!).name}
                    </button>
                  </>
                ) : (
                  <span className="text-fg-3">Not in a sequence.</span>
                )}
              </div>
            </motion.div>

            <section className="card p-5 sm:p-6">
              <div className="space-y-5">
                <div>
                  <p className="mb-2 text-[13px] font-medium text-fg-2">What do you want this message to do?</p>
                  <div className="flex flex-wrap gap-2">
                    {goals.map((g) => (
                      <button key={g} onClick={() => setGoal(g)} aria-pressed={goal === g} className={cn("rounded-lg border px-3.5 py-2 text-[13px] font-medium transition", goal === g ? "border-lime-fg bg-lime/15 text-fg" : "border-line bg-panel-2/50 text-fg-2 hover:border-line-2 hover:text-fg")}>
                        {g}
                        {fromStep && g === seq?.steps[fromStep.step]?.goal ? <span className="ml-1.5 text-[11px] text-lime-fg">this step</span> : !client && g === SUGGESTED[lead.stage] && !fromStep ? <span className="ml-1.5 text-[11px] text-lime-fg">suggested</span> : null}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-5">
                  <div>
                    <p className="mb-2 text-[13px] font-medium text-fg-2">Tone</p>
                    <Segmented label="Tone" value={tone} onChange={setTone} options={TONES.map((t) => ({ id: t, label: t }))} />
                  </div>
                  <div>
                    <p className="mb-2 text-[13px] font-medium text-fg-2">Channel</p>
                    <Segmented label="Channel" value={channel} onChange={setChannel} options={CHANNELS.map((c) => ({ id: c, label: c, icon: CHANNEL_ICON[c] }))} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => generate()} loading={streaming}>
                    <Sparkles size={16} /> {text ? "Write again with these settings" : "Draft message"}
                  </Button>
                  {text && !streaming && (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        const v = variant + 1;
                        setVariant(v);
                        generate(v);
                      }}
                    >
                      <RefreshCcw size={15} /> Another version
                    </Button>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {(text || streaming) && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35, ease: EASE }} className="overflow-hidden">
                    <div className="mt-6 border-t border-line pt-5">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="flex items-center gap-2 text-[13px] font-medium text-fg-2">
                          {CHANNEL_ICON[channel]} {channel} draft for {firstName(lead.name)}
                        </p>
                        <DemoTag>Draft · not sent</DemoTag>
                      </div>
                      <div className={cn("relative rounded-2xl border bg-panel-2/40 transition", streaming ? "border-lime-fg/40" : "border-line focus-within:border-lime-fg/50")}>
                        <textarea value={text} readOnly={streaming} onChange={(e) => setText(e.target.value)} aria-label="Message draft" className="min-h-[170px] w-full resize-y rounded-2xl bg-transparent px-4 py-3.5 text-[14.5px] leading-relaxed text-fg focus:outline-none" />
                        {streaming && <span className="pointer-events-none absolute bottom-4 right-4 h-4 w-[2px] animate-pulse bg-s1" aria-hidden />}
                      </div>
                      <div className="mt-1.5 flex justify-between px-1 text-[12px] text-fg-3">
                        <span>Edit freely. It&apos;s your voice.</span>
                        <span>{text.length} characters</span>
                      </div>

                      {why && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} className="mt-5 grid gap-4 lg:grid-cols-2">
                          <div className="rounded-2xl border border-line p-4">
                            <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-fg-2">
                              <Info size={14} className="text-lime-fg" /> Why this draft
                            </p>
                            <ul className="mt-3 space-y-2.5">
                              {why.used.map((u) => (
                                <li key={u.label} className="text-[12.5px] leading-relaxed">
                                  <b className="font-medium text-fg">{u.label}.</b> <span className="text-fg-2">{u.detail}</span>
                                </li>
                              ))}
                            </ul>
                            <p className="mt-3 flex items-center gap-1.5 border-t border-line pt-3 text-[12.5px] font-semibold text-fg-2">
                              <ListChecks size={14} className="text-lime-fg" /> Checks
                            </p>
                            <ul className="mt-2 space-y-1.5">
                              {why.checks.map((c) => (
                                <li key={c.label} className={cn("flex items-start gap-1.5 text-[12.5px]", c.ok ? "text-fg-2" : "text-warn")}>
                                  {c.ok ? <CircleCheck size={14} className="mt-px shrink-0 text-ok" /> : <CircleAlert size={14} className="mt-px shrink-0" />} {c.label}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="rounded-2xl border border-line bg-[#0b141a] p-4 text-[#e9edef]">
                            <p className="text-[11px] uppercase tracking-wider text-white/45">How {firstName(lead.name)} sees it</p>
                            <div className="mt-3 ml-auto max-w-[92%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-[#005c4b] px-3.5 py-2.5 text-[13.5px] leading-relaxed">
                              {personalSegments(text, marks).map((p, i) =>
                                p.mark ? (
                                  <mark key={i} className="rounded-sm bg-[#c8f04a]/25 px-0.5 text-inherit underline decoration-[#c8f04a] decoration-2 underline-offset-2">
                                    {p.text}
                                  </mark>
                                ) : (
                                  <span key={i}>{p.text}</span>
                                ),
                              )}
                            </div>
                            <p className="mt-3 text-[11.5px] text-white/50">Highlighted: the parts written for {firstName(lead.name)} specifically.</p>
                          </div>
                        </motion.div>
                      )}

                      <div className="mt-5 flex flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={streaming}
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(text);
                              toast({ tone: "success", title: "Copied to clipboard", body: `Paste it into ${channel}.` });
                            } catch {
                              toast({ tone: "error", title: "Couldn't copy", body: "Your browser blocked clipboard access. Select the text and copy it manually." });
                            }
                          }}
                        >
                          <Copy size={14} /> Copy
                        </Button>
                        {!fromStep && (
                          <Button variant="secondary" size="sm" disabled={streaming || !text.trim()} onClick={save}>
                            <Save size={14} /> {draftId ? "Update draft" : "Save draft"}
                          </Button>
                        )}
                        <Button size="sm" disabled={streaming || !text.trim()} onClick={sent}>
                          <CheckCheck size={14} /> {fromStep ? `I sent it: log step ${fromStep.step + 1}` : "I sent it: log it"}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
            <p className="flex items-start gap-2 px-1 text-[12.5px] leading-relaxed text-fg-3">
              <Info size={14} className="mt-0.5 shrink-0" /> FITFLOW drafts, you send. In this prototype, messages are written from templates and the sample data; nothing leaves your browser.
            </p>
          </>
        )}
      </div>

      {/* Drafts and history */}
      <Panel title="Drafts & sent" subtitle={`${drafts.filter((d) => d.status === "draft").length} waiting`}>
        {drafts.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-fg-3">Drafts you save appear here.</p>
        ) : (
          <ul className="max-h-[640px] space-y-2.5 overflow-y-auto">
            <AnimatePresence initial={false}>
              {drafts.slice(0, 20).map((d) => {
                const l = leads.find((x) => x.id === d.leadId);
                return (
                  <motion.li key={d.id} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="rounded-2xl border border-line bg-panel-2/40 p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[13.5px] font-semibold">{l?.name ?? "Deleted lead"}</p>
                      {d.status === "marked-sent" ? (
                        <Badge tone="ok">
                          <Check size={11} /> Sent
                        </Badge>
                      ) : (
                        <Badge>Draft</Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-[12px] text-fg-3">
                      {d.goal} · {d.channel} · {ago(d.createdAt)}
                    </p>
                    <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-fg-2">{d.text}</p>
                    <div className="mt-2.5 flex items-center gap-1">
                      {l && d.status === "draft" && (
                        <button
                          onClick={() => {
                            router.replace(`/app/follow-ups?lead=${l.id}`, { scroll: false });
                            setTimeout(() => {
                              setText(d.text);
                              setGoal(d.goal as Goal);
                              setTone(d.tone as Tone);
                              setChannel(d.channel as Channel);
                              setDraftId(d.id);
                            }, 30);
                          }}
                          className="rounded-md px-2.5 py-1 text-[12px] font-medium text-lime-fg hover:bg-lime/10"
                        >
                          Open
                        </button>
                      )}
                      <button onClick={() => (deleteDraft(d.id), toast({ tone: "info", title: "Removed" }))} className="ml-auto grid h-7 w-7 place-items-center rounded-full text-fg-3 hover:bg-bad/10 hover:text-bad" aria-label="Delete draft">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
        <p className="mt-4 flex items-center gap-1.5 text-[12px] text-fg-3">
          <Send size={12} /> &ldquo;Sent&rdquo; means you told FITFLOW you sent it.
        </p>
      </Panel>
    </div>
  );
}
