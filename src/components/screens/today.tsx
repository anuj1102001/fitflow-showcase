"use client";

import { AnimatePresence, motion } from "motion/react";
import { AtSign, CalendarClock, Clock, Mail, MessageCircle, PartyPopper, Reply, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { EASE } from "@/components/motion/kit";
import { Button, ButtonLink } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Avatar, Badge, Empty, Panel, type Tone } from "@/components/ui/kit";
import { useToast } from "@/components/ui/toast";
import type { Channel } from "@/lib/ai";
import { dateShort, firstName, rupees } from "@/lib/format";
import { buildQueue, sequenceById, upcoming, type Task, type TaskKind } from "@/lib/sequences";
import { useDemo } from "@/lib/store";

const KIND: Record<TaskKind, { label: string; tone: Tone }> = {
  reply: { label: "Replied", tone: "lime" },
  step: { label: "Sequence", tone: "info" },
  overdue: { label: "Overdue", tone: "warn" },
  client: { label: "Client", tone: "violet" },
};

export const CHANNEL_ICON: Record<Channel, React.ReactNode> = { WhatsApp: <MessageCircle size={13} />, "Instagram DM": <AtSign size={13} />, Email: <Mail size={13} /> };

/** Link into the composer with everything it needs to draft this task. */
export function taskHref(t: Task) {
  const q = new URLSearchParams({ lead: t.leadId, goal: t.goal, channel: t.channel });
  if (t.enrollmentId) q.set("enrollment", t.enrollmentId);
  if (t.clientId) q.set("client", t.clientId);
  return `/app/follow-ups?${q.toString()}`;
}

/**
 * The heart of the product: who to message today and why, in priority order. Each row opens a draft that
 * explains itself; nothing is ever sent automatically.
 */
export function TodayQueue() {
  const leads = useDemo((s) => s.leads);
  const clients = useDemo((s) => s.clients);
  const enrollments = useDemo((s) => s.enrollments);
  const markReplied = useDemo((s) => s.markReplied);
  const snooze = useDemo((s) => s.snooze);
  const toast = useToast();
  const tasks = useMemo(() => buildQueue({ leads, clients, enrollments }), [leads, clients, enrollments]);
  const soon = useMemo(() => upcoming(enrollments), [enrollments]);
  const byId = useMemo(() => new Map(leads.map((l) => [l.id, l])), [leads]);
  const counts = (k: TaskKind) => tasks.filter((t) => t.kind === k).length;

  return (
    <Panel
      id="today"
      title={
        <span className="flex items-center gap-2">
          <Sparkles size={16} className="text-lime-fg" /> Today&apos;s follow-ups
        </span>
      }
      subtitle={tasks.length ? `${tasks.length} people to message, most urgent first` : "Nothing due today"}
      action={
        <Link href="/app/sequences" className="text-[12.5px] font-medium text-lime-fg hover:underline">
          Sequences
        </Link>
      }
    >
      {tasks.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {(["reply", "step", "overdue", "client"] as const).map((k) =>
            counts(k) ? (
              <Badge key={k} tone={KIND[k].tone} dot>
                {counts(k)} {k === "reply" ? "replied" : k === "step" ? "sequence steps" : k === "overdue" ? "overdue" : "clients slipping"}
              </Badge>
            ) : null,
          )}
        </div>
      )}

      {tasks.length === 0 ? (
        <Empty icon={<PartyPopper size={20} />} title="All caught up" body="Every lead and client has heard from you. New sequence steps appear here on the day they're due." />
      ) : (
        <ul className="divide-y divide-line">
          <AnimatePresence initial={false}>
            {tasks.slice(0, 8).map((t, i) => {
              const lead = byId.get(t.leadId);
              if (!lead) return null;
              return (
                <motion.li
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE, delay: Math.min(i, 6) * 0.03 } }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.25 } }}
                  className="flex flex-wrap items-center gap-3 py-3 sm:flex-nowrap"
                >
                  <Avatar name={lead.name} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2">
                      <Link href={`/app/leads?lead=${lead.id}`} className="truncate text-[14px] font-semibold hover:underline">
                        {lead.name}
                      </Link>
                      <Badge tone={KIND[t.kind].tone}>{KIND[t.kind].label}</Badge>
                    </p>
                    <p className={cn("mt-0.5 truncate text-[12.5px]", t.daysOverdue ? "text-warn" : "text-fg-3")}>{t.why}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 truncate text-[12.5px] text-fg-2">
                      {CHANNEL_ICON[t.channel]} {t.goal}
                      {t.kind !== "client" && <span className="text-fg-3">· {rupees(lead.value)}</span>}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {t.kind === "step" && sequenceById(enrollments.find((e) => e.id === t.enrollmentId)?.sequenceId ?? "new-enquiry").audience === "lead" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          markReplied(lead.id);
                          toast({ tone: "success", title: `${firstName(lead.name)} replied`, body: "Sequence paused. They're now at the top of your list." });
                        }}
                        title="They replied: pause the sequence"
                      >
                        <Reply size={14} /> <span className="hidden sm:inline">Replied</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        snooze(lead.id);
                        toast({ tone: "info", title: "Moved to tomorrow", body: lead.name });
                      }}
                      title="Snooze until tomorrow"
                    >
                      <Clock size={14} /> <span className="hidden sm:inline">Tomorrow</span>
                    </Button>
                    <ButtonLink href={taskHref(t)} size="sm">
                      Draft
                    </ButtonLink>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
      {tasks.length > 8 && <p className="mt-2 text-[12.5px] text-fg-3">+ {tasks.length - 8} more lower-priority follow-ups.</p>}

      {soon.length > 0 && (
        <div className="mt-4 border-t border-line pt-4">
          <p className="mb-2 flex items-center gap-1.5 text-[12.5px] font-medium text-fg-2">
            <CalendarClock size={14} /> Coming up this week
          </p>
          <ul className="flex flex-wrap gap-2">
            {soon.slice(0, 6).map(({ e, due }) => {
              const lead = byId.get(e.leadId);
              const step = sequenceById(e.sequenceId).steps[e.step];
              return lead && step ? (
                <li key={e.id} className="rounded-xl border border-line bg-panel-2/40 px-3 py-1.5 text-[12px] text-fg-2">
                  <b className="font-medium text-fg">{dateShort(due)}</b> · {firstName(lead.name)} · {step.goal.toLowerCase()}
                </li>
              ) : null;
            })}
            {soon.length > 6 && <li className="px-1 py-1.5 text-[12px] text-fg-3">+{soon.length - 6} more</li>}
          </ul>
        </div>
      )}
    </Panel>
  );
}
