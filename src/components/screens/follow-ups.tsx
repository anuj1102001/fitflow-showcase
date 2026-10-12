"use client";

import { AnimatePresence, motion } from "motion/react";
import { AtSign, Check, CheckCheck, Copy, Info, Mail, MessageCircle, RefreshCcw, Save, Search, Send, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { EASE } from "@/components/motion/kit";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Avatar, Badge, DemoTag, Empty, Panel, Segmented } from "@/components/ui/kit";
import { useToast } from "@/components/ui/toast";
import { CHANNELS, draftFollowUp, FOLLOW_UP_GOALS, TONES, type Channel, type FollowUpGoal, type Tone } from "@/lib/ai";
import { ago, firstName, relDay, rupees, uid } from "@/lib/format";
import { useDemo } from "@/lib/store";
import { STAGE_LABEL } from "@/lib/types";
import { STAGE_TONE } from "./leads";

const SUGGESTED: Record<string, FollowUpGoal> = { new: "Reply to a new enquiry", contacted: "Book a discovery call", call: "Thank them after a call", proposal: "Nudge after a proposal" };
const CHANNEL_ICON: Record<Channel, React.ReactNode> = { WhatsApp: <MessageCircle size={13} />, "Instagram DM": <AtSign size={13} />, Email: <Mail size={13} /> };

export function FollowUpsScreen() {
  const leads = useDemo((s) => s.leads);
  const offers = useDemo((s) => s.offers);
  const drafts = useDemo((s) => s.drafts);
  const saveDraft = useDemo((s) => s.saveDraft);
  const markDraftSent = useDemo((s) => s.markDraftSent);
  const deleteDraft = useDemo((s) => s.deleteDraft);
  const params = useSearchParams();
  const router = useRouter();
  const toast = useToast();

  const open = useMemo(() => leads.filter((l) => !["won", "lost"].includes(l.stage)).sort((a, b) => (a.nextFollowUp ?? "9").localeCompare(b.nextFollowUp ?? "9")), [leads]);
  const [q, setQ] = useState("");
  const leadId = params.get("lead") ?? open[0]?.id ?? null;
  const lead = leads.find((l) => l.id === leadId);
  const offer = offers.find((o) => o.id === lead?.offerId);

  const [goal, setGoal] = useState<FollowUpGoal>((params.get("goal") as FollowUpGoal) ?? (lead ? (SUGGESTED[lead.stage] ?? "Re-engage a quiet lead") : "Reply to a new enquiry"));
  const [tone, setTone] = useState<Tone>("Warm");
  const [channel, setChannel] = useState<Channel>("WhatsApp");
  const [variant, setVariant] = useState(0);
  const [text, setText] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pick a sensible goal when the lead changes.
  useEffect(() => {
    if (!lead) return;
    const g = (params.get("goal") as FollowUpGoal | null) ?? (lead.lastContactAt && Date.now() - new Date(lead.lastContactAt).getTime() > 5 * 86_400_000 ? "Re-engage a quiet lead" : (SUGGESTED[lead.stage] ?? "Reply to a new enquiry"));
    setGoal(g);
    setText("");
    setDraftId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead?.id]);
  useEffect(() => () => void (timer.current && clearInterval(timer.current)), []);

  const generate = (v = variant) => {
    if (!lead) return;
    const full = draftFollowUp(lead, offer, goal, tone, channel, v);
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

  const filtered = open.filter((l) => !q || l.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
      {/* Lead picker */}
      <Panel title="Choose a lead" subtitle="Open leads, most urgent first" bodyClass="px-3 pb-3 sm:px-3">
        <div className="relative mb-2 px-2">
          <Search size={14} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-fg-3" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" aria-label="Search leads" className="h-9 w-full rounded-full border border-line bg-panel-2/50 pl-8 pr-3 text-[13px] placeholder:text-fg-3 focus:border-lime/50 focus:outline-none" />
        </div>
        <ul className="max-h-[260px] space-y-0.5 overflow-y-auto xl:max-h-[620px]">
          {filtered.map((l) => {
            const due = l.nextFollowUp ? relDay(l.nextFollowUp) : null;
            return (
              <li key={l.id}>
                <button onClick={() => router.replace(`/app/follow-ups?lead=${l.id}`, { scroll: false })} aria-current={l.id === leadId} className={cn("flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition", l.id === leadId ? "bg-panel-2 ring-1 ring-line-2" : "hover:bg-panel-2/60")}>
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
          <Empty icon={<MessageCircle size={20} />} title="Pick a lead to start" body="Choose someone from the list and FITFLOW will draft a personal follow-up." />
        ) : (
          <>
            <motion.div key={lead.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} className="card flex flex-wrap items-center gap-4 p-5">
              <Avatar name={lead.name} size={46} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/app/leads?lead=${lead.id}`} className="text-[17px] font-semibold hover:underline">
                    {lead.name}
                  </Link>
                  <Badge tone={STAGE_TONE[lead.stage]} dot>
                    {STAGE_LABEL[lead.stage]}
                  </Badge>
                </div>
                <p className="mt-0.5 truncate text-[13.5px] text-fg-2">&ldquo;{lead.goal}&rdquo;</p>
                <p className="mt-1 text-[12.5px] text-fg-3">
                  {lead.source} · interested in {offer?.title ?? "–"} ({rupees(lead.value)}) · last contact {lead.lastContactAt ? ago(lead.lastContactAt) : "never"}
                </p>
              </div>
            </motion.div>

            <section className="card p-5 sm:p-6">
              <div className="space-y-5">
                <div>
                  <p className="mb-2 text-[13px] font-medium text-fg-2">What do you want this message to do?</p>
                  <div className="flex flex-wrap gap-2">
                    {FOLLOW_UP_GOALS.map((g) => (
                      <button key={g} onClick={() => setGoal(g)} aria-pressed={goal === g} className={cn("rounded-full border px-3.5 py-2 text-[13px] font-medium transition", goal === g ? "border-lime bg-lime/15 text-fg" : "border-line bg-panel-2/50 text-fg-2 hover:border-line-2 hover:text-fg")}>
                        {g}
                        {g === SUGGESTED[lead.stage] && <span className="ml-1.5 text-[11px] text-lime">suggested</span>}
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
                      <RefreshCcw size={15} /> Regenerate
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
                      <div className={cn("relative rounded-2xl border bg-panel-2/40 transition", streaming ? "border-lime/40" : "border-line focus-within:border-lime/50")}>
                        <textarea
                          value={text}
                          readOnly={streaming}
                          onChange={(e) => setText(e.target.value)}
                          aria-label="Message draft"
                          className="min-h-[200px] w-full resize-y rounded-2xl bg-transparent px-4 py-3.5 text-[14.5px] leading-relaxed text-fg focus:outline-none"
                        />
                        {streaming && <span className="pointer-events-none absolute bottom-4 right-4 h-4 w-[2px] animate-pulse bg-lime" aria-hidden />}
                      </div>
                      <div className="mt-1.5 flex justify-between px-1 text-[12px] text-fg-3">
                        <span>Edit freely. It&apos;s your voice.</span>
                        <span>{text.length} characters</span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
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
                        <Button variant="secondary" size="sm" disabled={streaming || !text.trim()} onClick={save}>
                          <Save size={14} /> {draftId ? "Update draft" : "Save draft"}
                        </Button>
                        <Button
                          size="sm"
                          disabled={streaming || !text.trim()}
                          onClick={() => {
                            const id = save();
                            if (!id) return;
                            markDraftSent(id);
                            toast({ tone: "success", title: "Logged as sent", body: `Added to ${firstName(lead.name)}'s timeline. Next follow-up in 3 days. (Nothing was actually sent.)` });
                          }}
                        >
                          <CheckCheck size={14} /> I sent it: log it
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
            <p className="flex items-start gap-2 px-1 text-[12.5px] leading-relaxed text-fg-3">
              <Info size={14} className="mt-0.5 shrink-0" /> FITFLOW drafts, you send. In this prototype, messages are written from templates and the lead&apos;s sample data; nothing leaves your browser.
            </p>
          </>
        )}
      </div>

      {/* Drafts */}
      <Panel title="Saved drafts" subtitle={`${drafts.filter((d) => d.status === "draft").length} waiting`}>
        {drafts.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-fg-3">Drafts you save appear here.</p>
        ) : (
          <ul className="space-y-2.5">
            <AnimatePresence initial={false}>
              {drafts.map((d) => {
                const l = leads.find((x) => x.id === d.leadId);
                return (
                  <motion.li key={d.id} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="rounded-2xl border border-line bg-panel-2/40 p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[13.5px] font-semibold">{l?.name ?? "Deleted lead"}</p>
                      {d.status === "marked-sent" ? (
                        <Badge tone="ok">
                          <Check size={11} /> Logged
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
                      {l && (
                        <button
                          onClick={() => {
                            router.replace(`/app/follow-ups?lead=${l.id}`, { scroll: false });
                            setTimeout(() => {
                              setText(d.text);
                              setGoal(d.goal as FollowUpGoal);
                              setTone(d.tone as Tone);
                              setChannel(d.channel as Channel);
                              setDraftId(d.id);
                            }, 30);
                          }}
                          className="rounded-full px-2.5 py-1 text-[12px] font-medium text-lime hover:bg-lime/10"
                        >
                          Open
                        </button>
                      )}
                      <button onClick={() => (deleteDraft(d.id), toast({ tone: "info", title: "Draft deleted" }))} className="ml-auto grid h-7 w-7 place-items-center rounded-full text-fg-3 hover:bg-bad/10 hover:text-bad" aria-label="Delete draft">
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
          <Send size={12} /> &ldquo;Logged&rdquo; means you told FITFLOW you sent it.
        </p>
      </Panel>
    </div>
  );
}

