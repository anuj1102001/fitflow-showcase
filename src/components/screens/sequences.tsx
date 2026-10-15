"use client";

import { motion } from "motion/react";
import { Info, Play, Square, UserPlus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { EASE } from "@/components/motion/kit";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Avatar, Badge, DemoTag } from "@/components/ui/kit";
import { useToast } from "@/components/ui/toast";
import { dateShort, firstName, pct } from "@/lib/format";
import { SEQUENCES, sequenceStats, stepDue, suggestSequence, type Enrollment, type Sequence } from "@/lib/sequences";
import { useDemo } from "@/lib/store";
import { CHANNEL_ICON } from "./today";

const STATUS: Record<Enrollment["status"], { label: string; tone: "lime" | "info" | "neutral" | "warn" }> = {
  active: { label: "Active", tone: "info" },
  paused: { label: "Paused", tone: "lime" },
  done: { label: "Finished", tone: "neutral" },
  stopped: { label: "Stopped", tone: "warn" },
};

/**
 * Sequences: multi-step follow-up cadences. Steps never send on their own; each one lands in Today on the
 * day it's due, as a draft for the coach to review.
 */
export function SequencesScreen() {
  const enrollments = useDemo((s) => s.enrollments);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className="text-[26px] font-semibold tracking-[-0.03em]">Sequences</h2>
          <p className="mt-1 text-[14.5px] leading-relaxed text-fg-2">Follow-up cadences that keep every lead warm without you remembering who&apos;s due. Each step lands in <Link href="/app#today" className="font-medium text-lime-fg hover:underline">Today</Link> as a draft on the day it&apos;s due, and a sequence pauses the moment someone replies.</p>
        </div>
        <DemoTag />
      </div>
      <p className="flex items-start gap-2 rounded-2xl border border-line bg-panel-2/40 px-4 py-3 text-[13px] leading-relaxed text-fg-2">
        <Info size={15} className="mt-0.5 shrink-0 text-lime-fg" /> Nothing is sent automatically. FITFLOW decides <em>who</em> and <em>when</em>; you read every message and send it yourself on WhatsApp, Instagram or email.
      </p>
      <div className="grid gap-5 xl:grid-cols-2">
        {SEQUENCES.map((seq, i) => (
          <SequenceCard key={seq.id} seq={seq} enrollments={enrollments.filter((e) => e.sequenceId === seq.id)} index={i} />
        ))}
      </div>
    </div>
  );
}

function SequenceCard({ seq, enrollments, index }: { seq: Sequence; enrollments: Enrollment[]; index: number }) {
  const leads = useDemo((s) => s.leads);
  const clients = useDemo((s) => s.clients);
  const allEnrollments = useDemo((s) => s.enrollments);
  const enroll = useDemo((s) => s.enroll);
  const setStatus = useDemo((s) => s.setEnrollmentStatus);
  const toast = useToast();
  const [show, setShow] = useState<"live" | "all">("live");
  const stats = sequenceStats(seq.id, allEnrollments);
  const byId = useMemo(() => new Map(leads.map((l) => [l.id, l])), [leads]);
  const rows = enrollments.filter((e) => show === "all" || e.status === "active" || e.status === "paused").sort((a, b) => (a.status === "active" ? 0 : 1) - (b.status === "active" ? 0 : 1));

  // People who would fit this sequence but aren't in any active one.
  const busy = new Set(allEnrollments.filter((e) => e.status === "active").map((e) => e.leadId));
  const candidates =
    seq.audience === "client"
      ? clients.filter((c) => c.status !== "on-track" && !busy.has(c.leadId)).map((c) => byId.get(c.leadId)!).filter(Boolean)
      : leads.filter((l) => !busy.has(l.id) && suggestSequence(l) === seq.id);

  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: index * 0.06 }} className="card flex flex-col p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2">
            <span className="text-[17px] font-semibold">{seq.name}</span>
            <Badge tone={seq.audience === "client" ? "violet" : "neutral"}>{seq.audience === "client" ? "Retention" : "Sales"}</Badge>
          </p>
          <p className="mt-1 text-[13px] text-fg-3">
            Starts when: {seq.trigger.toLowerCase()} · Stops when: {seq.stops.toLowerCase()}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-[22px] font-semibold tabular">{stats.enrolled}</p>
          <p className="text-[12px] text-fg-3">in progress</p>
        </div>
      </div>

      {/* the cadence */}
      <ol className="relative mt-5 grid gap-3" aria-label={`${seq.name} steps`}>
        <span aria-hidden className="absolute bottom-3 left-[19px] top-3 w-px bg-line" />
        {seq.steps.map((st, i) => (
          <li key={i} className="relative grid grid-cols-[40px_1fr] gap-3">
            <span className="z-[1] grid h-10 w-10 place-items-center rounded-full border border-line bg-panel font-mono text-[11px] text-fg-2">D{st.day}</span>
            <div className="rounded-2xl border border-line bg-panel-2/40 px-3.5 py-2.5">
              <p className="flex flex-wrap items-center gap-2 text-[13.5px] font-medium">
                {st.goal}
                <span className="flex items-center gap-1 text-[12px] font-normal text-fg-3">
                  {CHANNEL_ICON[st.channel]} {st.channel}
                </span>
              </p>
              <p className="mt-0.5 text-[12.5px] leading-relaxed text-fg-3">{st.why}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
        {[
          ["Enrolled ever", String(stats.total)],
          ["Replied or won", String(stats.replied)],
          ["Reply rate", pct(stats.replyRate, 0)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-line px-2 py-2">
            <p className="font-display text-[17px] font-semibold tabular">{v}</p>
            <p className="text-[11.5px] text-fg-3">{k}</p>
          </div>
        ))}
      </div>
      <p className="mt-1.5 text-right text-[11px] text-fg-3">Sample data</p>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-4">
        <p className="text-[13px] font-medium text-fg-2">People</p>
        <div className="flex gap-1 text-[12px]">
          {(["live", "all"] as const).map((k) => (
            <button key={k} onClick={() => setShow(k)} aria-pressed={show === k} className={cn("rounded-full px-2.5 py-1 transition", show === k ? "bg-panel-2 text-fg" : "text-fg-3 hover:text-fg")}>
              {k === "live" ? "In progress" : "All"}
            </button>
          ))}
        </div>
      </div>
      <ul className="mt-2 max-h-[260px] space-y-1 overflow-y-auto">
        {rows.length === 0 && <li className="py-4 text-center text-[13px] text-fg-3">No one in this sequence right now.</li>}
        {rows.map((e) => {
          const lead = byId.get(e.leadId);
          if (!lead) return null;
          const due = e.status === "active" ? stepDue(e, e.step) : null;
          return (
            <li key={e.id} className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-panel-2/50">
              <Avatar name={lead.name} size={28} />
              <div className="min-w-0 flex-1">
                <Link href={`/app/leads?lead=${lead.id}`} className="block truncate text-[13px] font-medium hover:underline">
                  {lead.name}
                </Link>
                <p className="truncate text-[12px] text-fg-3">
                  {e.status === "active" ? `Step ${e.step + 1} of ${seq.steps.length}${due ? ` · ${dateShort(due)}` : ""}` : (e.reason ?? STATUS[e.status].label)}
                </p>
              </div>
              <Badge tone={STATUS[e.status].tone}>{STATUS[e.status].label}</Badge>
              {e.status === "active" && (
                <button onClick={() => (setStatus(e.id, "stopped"), toast({ tone: "info", title: "Sequence stopped", body: lead.name }))} className="grid h-7 w-7 place-items-center rounded-full text-fg-3 hover:bg-panel-2 hover:text-fg" aria-label={`Stop ${lead.name}'s sequence`} title="Stop">
                  <Square size={12} />
                </button>
              )}
              {(e.status === "paused" || e.status === "stopped") && (
                <button onClick={() => (setStatus(e.id, "active"), toast({ tone: "success", title: "Sequence resumed", body: lead.name }))} className="grid h-7 w-7 place-items-center rounded-full text-fg-3 hover:bg-panel-2 hover:text-fg" aria-label={`Resume ${lead.name}'s sequence`} title="Resume">
                  <Play size={12} />
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {candidates.length > 0 && (
        <div className="mt-4 rounded-2xl border border-dashed border-line-2 p-3">
          <p className="text-[12.5px] text-fg-2">
            {candidates.length} {candidates.length === 1 ? "person fits" : "people fit"} this sequence but {candidates.length === 1 ? "isn't" : "aren't"} in one yet.
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {candidates.slice(0, 3).map((l) => (
              <Button
                key={l.id}
                variant="secondary"
                size="sm"
                onClick={() => {
                  enroll(l.id, seq.id);
                  toast({ tone: "success", title: `${firstName(l.name)} added to ${seq.name}`, body: "The first step is in Today." });
                }}
              >
                <UserPlus size={13} /> {firstName(l.name)}
              </Button>
            ))}
          </div>
        </div>
      )}
    </motion.section>
  );
}
