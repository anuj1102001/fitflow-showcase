"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowUpDown, CalendarPlus, Columns3, Flame, List, Mail, MessageSquareText, Phone, Plus, Search, Sparkles, Trash2, Trophy, UserPlus, X, BellRing } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type DragEvent } from "react";
import { EASE } from "@/components/motion/kit";
import { Button, buttonClass } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Avatar, Badge, Drawer, Empty, Segmented, type Tone } from "@/components/ui/kit";
import { useToast } from "@/components/ui/toast";
import { pipelineValue } from "@/lib/analytics";
import { ago, dateShort, relDay, rupees, rupeesShort, startOfDay } from "@/lib/format";
import { useDemo } from "@/lib/store";
import { ACTIVE_STAGES, SOURCES, STAGE_LABEL, type Lead, type Source, type Stage } from "@/lib/types";
import { useUI } from "@/lib/ui-store";

export const STAGE_TONE: Record<Stage, Tone> = { new: "lime", contacted: "info", call: "violet", proposal: "warn", won: "ok", lost: "neutral" };
const SOURCE_TONE: Record<Source, Tone> = { Instagram: "neutral", Storefront: "lime", Referral: "ok", YouTube: "bad", WhatsApp: "info" };
const BOARD: Stage[] = [...ACTIVE_STAGES, "won"];
const SORTS = { newest: "Newest first", followup: "Follow-up date", value: "Highest value", fit: "Best fit score" } as const;

export function LeadsScreen() {
  const leads = useDemo((s) => s.leads);
  const offers = useDemo((s) => s.offers);
  const setStage = useDemo((s) => s.setStage);
  const openLeadForm = useUI((s) => s.openLeadForm);
  const toast = useToast();
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();

  const view = (params.get("view") as "board" | "list" | "followups") ?? "board";
  const [q, setQ] = useState("");
  const [source, setSource] = useState<Source | "all">("all");
  const [stage, setStageFilter] = useState<Stage | "open" | "all">((params.get("stage") as Stage) ?? "open");
  const [sort, setSort] = useState<keyof typeof SORTS>("newest");
  const [limit, setLimit] = useState(30);
  const selected = params.get("lead");

  useEffect(() => {
    const st = params.get("stage") as Stage | null;
    if (st) setStageFilter(st);
  }, [params]);

  const setParam = (k: string, v: string | null) => {
    const p = new URLSearchParams(params.toString());
    if (v === null) p.delete(k);
    else p.set(k, v);
    router.replace(`${path}${p.size ? `?${p}` : ""}`, { scroll: false });
  };

  const today = startOfDay(new Date()).getTime();
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = leads.filter((l) => (source === "all" || l.source === source) && (!term || `${l.name} ${l.email} ${l.phone} ${l.goal} ${l.city} ${l.handle ?? ""}`.toLowerCase().includes(term)));
    if (view === "followups") list = list.filter((l) => l.nextFollowUp && new Date(l.nextFollowUp).getTime() < today + 86_400_000 && !["won", "lost"].includes(l.stage));
    else if (view === "list") list = list.filter((l) => (stage === "all" ? true : stage === "open" ? !["won", "lost"].includes(l.stage) : l.stage === stage));
    const by: Record<keyof typeof SORTS, (a: Lead, b: Lead) => number> = {
      newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
      followup: (a, b) => (a.nextFollowUp ?? "9").localeCompare(b.nextFollowUp ?? "9"),
      value: (a, b) => b.value - a.value,
      fit: (a, b) => b.fitScore - a.fitScore,
    };
    return [...list].sort(view === "followups" ? by.followup : by[sort]);
  }, [leads, q, source, view, stage, sort, today]);

  const counts = useMemo(() => Object.fromEntries(BOARD.map((s) => [s, leads.filter((l) => l.stage === s).length])), [leads]);
  const open = leads.filter((l) => !["won", "lost"].includes(l.stage));
  const overdue = open.filter((l) => l.nextFollowUp && new Date(l.nextFollowUp).getTime() < today).length;

  const move = (id: string, to: Stage) => {
    const lead = leads.find((l) => l.id === id);
    if (!lead || lead.stage === to) return;
    const { clientCreated } = setStage(id, to);
    toast({ tone: "success", title: `${lead.name} → ${STAGE_LABEL[to]}`, body: clientCreated ? "Client profile created. Find them under Clients." : undefined });
  };

  return (
    <div className="space-y-5">
      {/* Pipeline summary */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Open leads", value: String(open.length), sub: `${counts.new} new this cycle` },
          { label: "Pipeline value", value: rupeesShort(pipelineValue(leads)), sub: "Sample program fees" },
          { label: "Overdue follow-ups", value: String(overdue), sub: overdue ? "Clear these first" : "All caught up", warn: overdue > 0 },
          { label: "Won (all time)", value: String(counts.won), sub: `${leads.length} leads total` },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: i * 0.05 }} className="card-2 px-4 py-3.5">
            <p className="text-[12.5px] text-fg-3">{s.label}</p>
            <p className={cn("mt-1 font-display text-[22px] font-semibold tabular", s.warn && "text-warn")}>{s.value}</p>
            <p className="text-[12px] text-fg-3">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-3" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, goal, city…" aria-label="Search leads" className="h-10 w-full rounded-full border border-line bg-panel pl-9 pr-9 text-[13.5px] placeholder:text-fg-3 focus:border-lime-fg/50 focus:outline-none focus:ring-4 focus:ring-lime-fg/10" />
            {q && (
              <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-3 hover:text-fg" aria-label="Clear search">
                <X size={14} />
              </button>
            )}
          </div>
          <select value={source} onChange={(e) => setSource(e.target.value as Source | "all")} aria-label="Filter by source" className="h-10 rounded-lg border border-line bg-panel px-3.5 text-[13px] text-fg-2 focus:outline-none [&>option]:bg-panel">
            <option value="all">All sources</option>
            {SOURCES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          {view === "list" && (
            <>
              <select value={stage} onChange={(e) => setStageFilter(e.target.value as Stage | "open" | "all")} aria-label="Filter by stage" className="h-10 rounded-lg border border-line bg-panel px-3.5 text-[13px] text-fg-2 focus:outline-none [&>option]:bg-panel">
                <option value="open">Open leads</option>
                <option value="all">All stages</option>
                {Object.entries(STAGE_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              <label className="relative">
                <ArrowUpDown size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-3" />
                <select value={sort} onChange={(e) => setSort(e.target.value as keyof typeof SORTS)} aria-label="Sort" className="h-10 rounded-full border border-line bg-panel pl-8 pr-3.5 text-[13px] text-fg-2 focus:outline-none [&>option]:bg-panel">
                  {Object.entries(SORTS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Segmented
            label="View"
            value={view}
            onChange={(v) => setParam("view", v === "board" ? null : v)}
            options={[
              { id: "board", label: "Pipeline", icon: <Columns3 size={14} /> },
              { id: "list", label: "List", icon: <List size={14} /> },
              { id: "followups", label: `Due${overdue ? ` · ${overdue}` : ""}`, icon: <BellRing size={14} /> },
            ]}
          />
          <Button size="sm" className="h-10" onClick={openLeadForm}>
            <UserPlus size={15} /> <span className="hidden sm:inline">Add lead</span>
          </Button>
        </div>
      </div>

      {view === "board" ? (
        <Board leads={filtered} onMove={move} onOpen={(id) => setParam("lead", id)} />
      ) : filtered.length === 0 ? (
        <Empty
          icon={view === "followups" ? <BellRing size={20} /> : <Search size={20} />}
          title={view === "followups" ? "No follow-ups due" : "No leads match"}
          body={view === "followups" ? "Nothing is overdue or due today. Nice work." : "Try a different search or clear the filters."}
          action={
            q || source !== "all" ? (
              <Button variant="secondary" size="sm" onClick={() => (setQ(""), setSource("all"))}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <LeadTable leads={filtered.slice(0, limit)} total={filtered.length} onOpen={(id) => setParam("lead", id)} offers={offers} onMore={() => setLimit((l) => l + 30)} followups={view === "followups"} />
      )}

      <LeadDrawer id={selected} onClose={() => setParam("lead", null)} />
    </div>
  );
}

/* ------------------------------------------------------------------ Board */

function Board({ leads, onMove, onOpen }: { leads: Lead[]; onMove: (id: string, to: Stage) => void; onOpen: (id: string) => void }) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<Stage | null>(null);
  const monthAgo = Date.now() - 30 * 86_400_000;
  const cols = BOARD.map((s) => ({
    stage: s,
    items: leads.filter((l) => l.stage === s && (s !== "won" || new Date(l.wonAt ?? 0).getTime() > monthAgo)),
  }));
  const drop = (to: Stage) => (e: DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    setOver(null);
    setDragging(null);
    if (id) onMove(id, to);
  };
  const allow = (s: Stage) => (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (over !== s) setOver(s);
  };

  return (
    <div className="relative">
      <div className="-mx-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        <div className="grid min-w-[1060px] grid-cols-5 gap-3">
          {cols.map((c) => (
            <section
              key={c.stage}
              onDragOver={allow(c.stage)}
              onDragLeave={() => setOver((o) => (o === c.stage ? null : o))}
              onDrop={drop(c.stage)}
              aria-label={`${STAGE_LABEL[c.stage]} column`}
              className={cn("flex min-h-[420px] flex-col rounded-2xl border bg-panel/50 p-2.5 transition-colors", over === c.stage ? "border-lime-fg/50 bg-lime/[.04]" : "border-line")}
            >
              <header className="flex items-center justify-between px-2 pb-2.5 pt-1.5">
                <div className="flex items-center gap-2">
                  <Badge tone={STAGE_TONE[c.stage]} dot>
                    {STAGE_LABEL[c.stage]}
                  </Badge>
                  <span className="text-[12px] tabular text-fg-3">{c.items.length}</span>
                </div>
                <span className="text-[12px] tabular text-fg-3">{rupeesShort(c.items.reduce((a, l) => a + l.value, 0))}</span>
              </header>
              {c.stage === "won" && <p className="px-2 pb-2 text-[11.5px] text-fg-3">Last 30 days</p>}
              <div className="flex flex-1 flex-col gap-2">
                <AnimatePresence initial={false}>
                  {c.items.map((l) => (
                    <motion.div key={l.id} layout layoutId={`card-${l.id}`} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: dragging === l.id ? 0.4 : 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.3, ease: EASE }}>
                      <LeadCard lead={l} onOpen={() => onOpen(l.id)} onDragStart={(e) => (e.dataTransfer.setData("text/plain", l.id), (e.dataTransfer.effectAllowed = "move"), setDragging(l.id))} onDragEnd={() => (setDragging(null), setOver(null))} />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {c.items.length === 0 && <p className="grid flex-1 place-items-center rounded-2xl border border-dashed border-line px-3 py-8 text-center text-[12.5px] text-fg-3">Drop a lead here</p>}
              </div>
            </section>
          ))}
        </div>
      </div>
      {/* "Lost" target appears only while dragging */}
      <AnimatePresence>
        {dragging && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onDragOver={allow("lost")}
            onDragLeave={() => setOver(null)}
            onDrop={drop("lost")}
            className={cn("fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-lg border px-6 py-3.5 text-[13.5px] font-medium shadow-pop backdrop-blur", over === "lost" ? "border-bad/60 bg-bad/20 text-bad" : "border-line-2 bg-panel/95 text-fg-2")}
          >
            <X size={15} /> Drop here to mark as lost
          </motion.div>
        )}
      </AnimatePresence>
      <p className="mt-1 text-[12px] text-fg-3">Tip: drag cards between columns, or open a lead to change its stage (works with keyboard and touch).</p>
    </div>
  );
}

function LeadCard({ lead, onOpen, onDragStart, onDragEnd }: { lead: Lead; onOpen: () => void; onDragStart: (e: DragEvent) => void; onDragEnd: () => void }) {
  const fu = lead.nextFollowUp ? relDay(lead.nextFollowUp) : null;
  const late = fu?.includes("overdue");
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
      role="button"
      tabIndex={0}
      aria-label={`${lead.name}, ${STAGE_LABEL[lead.stage]}. Open details`}
      className="group cursor-grab rounded-2xl border border-line bg-panel p-3.5 shadow-card transition hover:-translate-y-0.5 hover:border-line-2 active:cursor-grabbing"
    >
      <div className="flex items-start gap-2.5">
        <Avatar name={lead.name} size={30} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-semibold">{lead.name}</p>
          <p className="line-clamp-2 text-[12.5px] leading-snug text-fg-3">{lead.goal}</p>
        </div>
        {lead.fitScore >= 85 && (
          <span title={`Fit score ${lead.fitScore}`} className="text-lime-fg">
            <Flame size={14} />
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge tone={SOURCE_TONE[lead.source]} className="h-5 px-2 text-[11px]">
          {lead.source}
        </Badge>
        <span className="text-[12px] font-medium tabular text-fg-2">{rupees(lead.value)}</span>
        {lead.stage === "won" ? (
          <span className="ml-auto flex items-center gap-1 text-[11.5px] text-ok">
            <Trophy size={12} /> {ago(lead.wonAt!)}
          </span>
        ) : (
          fu && <span className={cn("ml-auto text-[11.5px]", late ? "font-medium text-warn" : "text-fg-3")}>{fu}</span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Table */

function LeadTable({ leads, total, onOpen, offers, onMore, followups }: { leads: Lead[]; total: number; onOpen: (id: string) => void; offers: { id: string; title: string }[]; onMore: () => void; followups: boolean }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-line text-[12px] text-fg-3">
              {["Lead", "Stage", "Source", "Interested in", "Value", followups ? "Follow-up" : "Next follow-up", "Added"].map((h) => (
                <th key={h} scope="col" className="px-4 py-3 font-medium first:pl-5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((l, i) => {
              const fu = l.nextFollowUp ? relDay(l.nextFollowUp) : "–";
              return (
                <motion.tr key={l.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i, 12) * 0.02 }} onClick={() => onOpen(l.id)} className="cursor-pointer border-b border-line/70 transition last:border-0 hover:bg-panel-2/60">
                  <td className="px-4 py-3 pl-5">
                    <button className="flex items-center gap-3 text-left" onClick={(e) => (e.stopPropagation(), onOpen(l.id))}>
                      <Avatar name={l.name} size={32} />
                      <span className="min-w-0">
                        <span className="block font-medium">{l.name}</span>
                        <span className="block max-w-[240px] truncate text-[12px] text-fg-3">{l.goal}</span>
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={STAGE_TONE[l.stage]} dot>
                      {STAGE_LABEL[l.stage]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-fg-2">{l.source}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-fg-2">{offers.find((o) => o.id === l.offerId)?.title ?? "–"}</td>
                  <td className="px-4 py-3 tabular">{rupees(l.value)}</td>
                  <td className={cn("px-4 py-3", fu.includes("overdue") ? "font-medium text-warn" : "text-fg-2")}>{fu}</td>
                  <td className="px-4 py-3 text-fg-3">{dateShort(l.createdAt)}</td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-line px-5 py-3 text-[12.5px] text-fg-3">
        <span>
          Showing {leads.length} of {total}
        </span>
        {leads.length < total && (
          <Button variant="secondary" size="sm" onClick={onMore}>
            Show more
          </Button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Drawer */

const LOST_REASONS = ["Went quiet", "Chose another coach or gym", "Budget", "Timing: wants to start later", "Not the right fit"];

function LeadDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const lead = useDemo((s) => s.leads.find((l) => l.id === id));
  const offers = useDemo((s) => s.offers);
  const updateLead = useDemo((s) => s.updateLead);
  const setStage = useDemo((s) => s.setStage);
  const addNote = useDemo((s) => s.addNote);
  const deleteLead = useDemo((s) => s.deleteLead);
  const bookings = useDemo((s) => s.bookings);
  const openBookingForm = useUI((s) => s.openBookingForm);
  const toast = useToast();
  const [form, setForm] = useState<Partial<Lead>>({});
  const [note, setNote] = useState("");
  const [losing, setLosing] = useState(false);
  const [reason, setReason] = useState(LOST_REASONS[0]!);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lead) setForm({ name: lead.name, email: lead.email, phone: lead.phone, city: lead.city, goal: lead.goal, offerId: lead.offerId, nextFollowUp: lead.nextFollowUp });
    setLosing(false);
    setNote("");
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead?.id]);

  if (!id) return <Drawer open={false} onClose={onClose} title="">{null}</Drawer>;
  if (!lead)
    return (
      <Drawer open onClose={onClose} title="Lead not found">
        <Empty icon={<Search size={20} />} title="This lead doesn't exist" body="It may have been deleted, or the demo was reset." />
      </Drawer>
    );

  const dirty = (["name", "email", "phone", "city", "goal", "offerId", "nextFollowUp"] as const).some((k) => (form[k] ?? "") !== (lead[k] ?? ""));
  const save = () => {
    if (!form.name || form.name.trim().length < 2) return setError("Name is required.");
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) return setError("That email doesn't look right.");
    setError(null);
    const offer = offers.find((o) => o.id === form.offerId);
    updateLead(lead.id, { ...form, name: form.name.trim(), value: offer?.price ?? lead.value });
    toast({ tone: "success", title: "Lead updated" });
  };
  const changeStage = (s: Stage) => {
    if (s === "lost") return setLosing(true);
    const { clientCreated } = setStage(lead.id, s);
    toast({ tone: "success", title: `Moved to ${STAGE_LABEL[s]}`, body: clientCreated ? "Client profile created under Clients." : undefined });
  };
  const sessions = bookings.filter((b) => b.leadId === lead.id);
  const fuDate = form.nextFollowUp ? form.nextFollowUp.slice(0, 10) : "";
  const steps: Stage[] = ["new", "contacted", "call", "proposal", "won"];
  const currentIdx = lead.stage === "lost" ? -1 : steps.indexOf(lead.stage);

  return (
    <Drawer
      open
      onClose={onClose}
      width={560}
      title={
        <span className="flex items-center gap-3">
          <Avatar name={lead.name} size={36} />
          <span className="min-w-0">
            <span className="block truncate">{lead.name}</span>
          </span>
        </span>
      }
      subtitle={`${lead.source}${lead.handle ? ` · ${lead.handle}` : ""} · added ${ago(lead.createdAt)} · fit score ${lead.fitScore}`}
      footer={
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-bad hover:bg-bad/10 hover:text-bad"
            onClick={() => {
              if (!confirm(`Delete ${lead.name}? This removes their notes and bookings from the demo.`)) return;
              deleteLead(lead.id);
              onClose();
              toast({ tone: "info", title: "Lead deleted" });
            }}
          >
            <Trash2 size={14} /> Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button size="sm" disabled={!dirty} onClick={save}>
              Save changes
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stage stepper */}
        <section aria-label="Stage">
          <div className="mb-2 flex items-center justify-between">
            <p className="eyebrow">Pipeline stage</p>
            {lead.stage === "lost" ? <Badge>Lost · {lead.lostReason}</Badge> : lead.stage === "won" ? <Badge tone="ok">Client</Badge> : null}
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {steps.map((s, i) => (
              <button
                key={s}
                onClick={() => changeStage(s)}
                aria-pressed={lead.stage === s}
                className={cn(
                  "rounded-xl border px-1.5 py-2 text-[11.5px] font-medium transition",
                  lead.stage === s ? "border-lime-fg bg-lime text-lime-ink" : i <= currentIdx ? "border-lime-fg/30 bg-lime/10 text-lime-fg" : "border-line bg-panel-2/60 text-fg-3 hover:border-line-2 hover:text-fg",
                )}
              >
                {STAGE_LABEL[s]}
              </button>
            ))}
          </div>
          {lead.stage !== "lost" && lead.stage !== "won" && !losing && (
            <button onClick={() => setLosing(true)} className="mt-2 text-[12px] text-fg-3 underline-offset-2 hover:text-fg hover:underline">
              Mark as lost…
            </button>
          )}
          {lead.stage === "lost" && (
            <button onClick={() => changeStage("new")} className="mt-2 text-[12px] text-lime-fg hover:underline">
              Reopen lead
            </button>
          )}
          <AnimatePresence>
            {losing && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="mt-3 flex flex-wrap items-end gap-2 rounded-2xl border border-line bg-panel-2/60 p-3">
                  <Field label="Why was it lost?" htmlFor="lost-reason" className="min-w-[200px] flex-1">
                    <Select id="lost-reason" value={reason} onChange={(e) => setReason(e.target.value)}>
                      {LOST_REASONS.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </Select>
                  </Field>
                  <Button variant="ghost" size="sm" onClick={() => setLosing(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setStage(lead.id, "lost", reason);
                      setLosing(false);
                      toast({ tone: "info", title: `${lead.name} marked as lost`, body: reason });
                    }}
                  >
                    Mark lost
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Quick actions */}
        <section className="grid grid-cols-3 gap-2">
          <Link href={`/app/follow-ups?lead=${lead.id}`} className={buttonClass({ variant: "secondary", size: "sm" }, "h-auto flex-col gap-1 rounded-2xl py-3")}>
            <Sparkles size={16} className="text-lime-fg" /> Draft follow-up
          </Link>
          <button onClick={() => openBookingForm({ leadId: lead.id })} className={buttonClass({ variant: "secondary", size: "sm" }, "h-auto flex-col gap-1 rounded-2xl py-3")}>
            <CalendarPlus size={16} className="text-lime-fg" /> Book a call
          </button>
          <a href={`mailto:${lead.email}`} onClick={(e) => (e.preventDefault(), navigator.clipboard?.writeText(lead.email), toast({ tone: "success", title: "Email copied", body: lead.email }))} className={buttonClass({ variant: "secondary", size: "sm" }, "h-auto flex-col gap-1 rounded-2xl py-3")}>
            <Mail size={16} className="text-lime-fg" /> Copy email
          </a>
        </section>

        {/* Editable details */}
        <section className="space-y-3">
          <p className="eyebrow">Details</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name" htmlFor="ld-name">
              <Input id="ld-name" value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11" />
            </Field>
            <Field label="City" htmlFor="ld-city">
              <Input id="ld-city" value={form.city ?? ""} onChange={(e) => setForm({ ...form, city: e.target.value })} className="h-11" />
            </Field>
            <Field label={<span className="flex items-center gap-1.5"><Mail size={12} /> Email</span>} htmlFor="ld-email">
              <Input id="ld-email" type="email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-11" />
            </Field>
            <Field label={<span className="flex items-center gap-1.5"><Phone size={12} /> Phone</span>} htmlFor="ld-phone">
              <Input id="ld-phone" value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-11" />
            </Field>
            <Field label="Goal" htmlFor="ld-goal" className="sm:col-span-2">
              <Input id="ld-goal" value={form.goal ?? ""} onChange={(e) => setForm({ ...form, goal: e.target.value })} className="h-11" />
            </Field>
            <Field label="Interested in" htmlFor="ld-offer">
              <Select id="ld-offer" value={form.offerId} onChange={(e) => setForm({ ...form, offerId: e.target.value })} className="[&_select]:h-11">
                {offers.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.title} · {rupees(o.price)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Next follow-up" htmlFor="ld-fu" hint={lead.stage === "won" || lead.stage === "lost" ? "Closed leads don't need follow-ups" : undefined}>
              <Input id="ld-fu" type="date" value={fuDate} disabled={lead.stage === "won" || lead.stage === "lost"} onChange={(e) => setForm({ ...form, nextFollowUp: e.target.value ? new Date(`${e.target.value}T10:00`).toISOString() : undefined })} className="h-11" />
            </Field>
          </div>
          {error && (
            <p className="text-[13px] font-medium text-bad" role="alert">
              {error}
            </p>
          )}
        </section>

        {sessions.length > 0 && (
          <section>
            <p className="eyebrow mb-2">Sessions</p>
            <ul className="space-y-1.5">
              {sessions.map((b) => (
                <li key={b.id}>
                  <button onClick={() => openBookingForm({ booking: b })} className="flex w-full items-center justify-between rounded-xl border border-line px-3 py-2 text-left text-[13px] transition hover:border-line-2">
                    <span>
                      {b.kind} · {dateShort(b.start)}
                    </span>
                    <Badge tone={b.status === "completed" ? "ok" : b.status === "confirmed" ? "lime" : b.status === "pending" ? "warn" : "neutral"}>{b.status}</Badge>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Notes & timeline */}
        <section>
          <p className="eyebrow mb-2">Notes & timeline</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!note.trim()) return;
              addNote(lead.id, note.trim());
              setNote("");
              toast({ tone: "success", title: "Note added" });
            }}
            className="mb-4 flex gap-2"
          >
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note (e.g. prefers mornings)…" className="min-h-[46px] flex-1 py-2.5 text-[14px]" rows={1} aria-label="New note" />
            <Button type="submit" size="icon" className="h-[46px] w-[46px] shrink-0" disabled={!note.trim()} aria-label="Add note">
              <Plus size={18} />
            </Button>
          </form>
          <ol className="relative space-y-3 before:absolute before:bottom-1 before:left-[11px] before:top-1 before:w-px before:bg-line">
            {[...lead.notes].reverse().map((n) => (
              <li key={n.id} className="relative flex gap-3">
                <span className={cn("relative z-10 mt-0.5 grid h-[23px] w-[23px] shrink-0 place-items-center rounded-full border bg-panel", n.kind === "note" ? "border-info/40 text-info" : "border-line-2")}>
                  {n.kind === "note" ? <MessageSquareText size={11} /> : <span className="h-1.5 w-1.5 rounded-full bg-s1" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-[13.5px] leading-snug", n.kind === "note" ? "text-fg" : "text-fg-2")}>{n.text}</p>
                  <p className="mt-0.5 text-[11.5px] text-fg-3">{ago(n.at)}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </Drawer>
  );
}
