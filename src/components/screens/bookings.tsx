"use client";

import { AnimatePresence, motion } from "motion/react";
import { CalendarDays, CalendarPlus, ChevronLeft, ChevronRight, Clock, List, MapPin, Video } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EASE } from "@/components/motion/kit";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Avatar, Badge, DemoTag, Empty, Segmented, type Tone } from "@/components/ui/kit";
import { useToast } from "@/components/ui/toast";
import { addDays, dateLong, DAY, startOfDay, time } from "@/lib/format";
import { useDemo } from "@/lib/store";
import type { Booking, BookingKind, BookingStatus } from "@/lib/types";
import { useUI } from "@/lib/ui-store";

const KIND_STYLE: Record<BookingKind, { bar: string; bg: string; text: string; dot: string }> = {
  "Discovery call": { bar: "bg-s1", bg: "bg-lime/[.12] hover:bg-lime/[.18]", text: "text-lime-fg", dot: "bg-s1" },
  "Check-in": { bar: "bg-info", bg: "bg-info/[.12] hover:bg-info/[.18]", text: "text-info", dot: "bg-info" },
  "Coaching session": { bar: "bg-violet", bg: "bg-violet/[.13] hover:bg-violet/[.2]", text: "text-violet", dot: "bg-violet" },
  Assessment: { bar: "bg-warn", bg: "bg-warn/[.12] hover:bg-warn/[.18]", text: "text-warn", dot: "bg-warn" },
};
export const STATUS_TONE: Record<BookingStatus, Tone> = { confirmed: "lime", pending: "warn", completed: "ok", cancelled: "neutral", "no-show": "bad" };
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7:00–21:00
const ROW = 56;

const mondayOf = (d: Date) => {
  const x = startOfDay(d);
  const day = (x.getDay() + 6) % 7;
  return addDays(x, -day);
};

export function BookingsScreen() {
  const bookings = useDemo((s) => s.bookings);
  const leads = useDemo((s) => s.leads);
  const saveBooking = useDemo((s) => s.saveBooking);
  const openBookingForm = useUI((s) => s.openBookingForm);
  const toast = useToast();
  const [view, setView] = useState<"week" | "agenda">("week");
  const [week, setWeek] = useState(() => mondayOf(new Date()));
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (window.matchMedia("(max-width: 767px)").matches) setView("agenda");
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const days = Array.from({ length: 7 }, (_, i) => addDays(week, i));
  const inWeek = useMemo(() => bookings.filter((b) => new Date(b.start) >= week && new Date(b.start) < addDays(week, 7)), [bookings, week]);
  const active = inWeek.filter((b) => b.status !== "cancelled");
  const hours = active.reduce((a, b) => a + b.minutes, 0) / 60;
  const name = (id: string) => leads.find((l) => l.id === id)?.name ?? "Unknown";
  const setStatus = (b: Booking, status: BookingStatus) => {
    saveBooking({ ...b, status });
    toast({ tone: "success", title: `Marked ${status}`, body: b.title });
  };
  const thisWeek = mondayOf(new Date()).getTime() === week.getTime();

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-full border border-line bg-panel p-1">
            <button onClick={() => setWeek(addDays(week, -7))} className="grid h-8 w-8 place-items-center rounded-full text-fg-2 transition hover:bg-panel-2 hover:text-fg" aria-label="Previous week">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setWeek(mondayOf(new Date()))} disabled={thisWeek} className="h-8 rounded-lg px-3 text-[13px] font-medium text-fg-2 transition hover:bg-panel-2 hover:text-fg disabled:text-fg-3 disabled:hover:bg-transparent">
              Today
            </button>
            <button onClick={() => setWeek(addDays(week, 7))} className="grid h-8 w-8 place-items-center rounded-full text-fg-2 transition hover:bg-panel-2 hover:text-fg" aria-label="Next week">
              <ChevronRight size={16} />
            </button>
          </div>
          <h2 className="text-[18px] font-semibold">
            {days[0]!.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – {days[6]!.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </h2>
          <DemoTag>Sample calendar</DemoTag>
        </div>
        <div className="flex items-center gap-2">
          <Segmented label="Calendar view" value={view} onChange={setView} options={[{ id: "week", label: "Week", icon: <CalendarDays size={14} /> }, { id: "agenda", label: "Agenda", icon: <List size={14} /> }]} />
          <Button size="sm" className="h-10" onClick={() => openBookingForm()}>
            <CalendarPlus size={15} /> <span className="hidden sm:inline">New booking</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Sessions this week", value: String(active.length) },
          { label: "Discovery calls", value: String(active.filter((b) => b.kind === "Discovery call").length) },
          { label: "Coaching hours", value: hours.toFixed(1) },
          { label: "Pending confirmation", value: String(inWeek.filter((b) => b.status === "pending").length) },
        ].map((s) => (
          <div key={s.label} className="card-2 px-4 py-3.5">
            <p className="text-[12.5px] text-fg-3">{s.label}</p>
            <p className="mt-1 font-display text-[22px] font-semibold tabular">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 text-[12px] text-fg-3">
        {(Object.keys(KIND_STYLE) as BookingKind[]).map((k) => (
          <span key={k} className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", KIND_STYLE[k].dot)} /> {k}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full border border-dashed border-fg-3" /> Pending
        </span>
      </div>

      <AnimatePresence mode="wait">
        {view === "week" ? (
          <motion.div key={`w${week.getTime()}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3, ease: EASE }} className="card overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[860px]">
                <div className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))] border-b border-line">
                  <div />
                  {days.map((d) => {
                    const today = startOfDay(new Date()).getTime() === d.getTime();
                    return (
                      <div key={d.toISOString()} className="border-l border-line px-3 py-3 text-center">
                        <p className="text-[11.5px] uppercase tracking-wider text-fg-3">{d.toLocaleDateString("en-IN", { weekday: "short" })}</p>
                        <p className={cn("mx-auto mt-1 grid h-8 w-8 place-items-center rounded-full font-display text-[16px] font-semibold", today && "bg-lime text-lime-ink")}>{d.getDate()}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="relative grid max-h-[620px] grid-cols-[60px_repeat(7,minmax(0,1fr))] overflow-y-auto">
                  <div>
                    {HOURS.map((h) => (
                      <div key={h} style={{ height: ROW }} className="pr-2 pt-1 text-right text-[11px] text-fg-3">
                        {h === 12 ? "12 pm" : h > 12 ? `${h - 12} pm` : `${h} am`}
                      </div>
                    ))}
                  </div>
                  {days.map((d) => {
                    const items = inWeek.filter((b) => startOfDay(b.start).getTime() === d.getTime());
                    const today = startOfDay(new Date()).getTime() === d.getTime();
                    const nowTop = ((now - d.getTime()) / 3_600_000 - HOURS[0]!) * ROW;
                    return (
                      <div key={d.toISOString()} className={cn("relative border-l border-line", today && "bg-lime/[.025]")}>
                        {HOURS.map((h) => (
                          <button
                            key={h}
                            style={{ height: ROW }}
                            onClick={() => {
                              const s = new Date(d);
                              s.setHours(h, 0, 0, 0);
                              openBookingForm({ start: s.toISOString() });
                            }}
                            className="group block w-full border-b border-line/60 text-left transition hover:bg-panel-2/60"
                            aria-label={`New booking ${dateLong(d)} at ${h}:00`}
                          >
                            <span className="hidden pl-2 text-[11px] text-fg-3 group-hover:inline">+ Book</span>
                          </button>
                        ))}
                        {today && nowTop > 0 && nowTop < HOURS.length * ROW && (
                          <div className="pointer-events-none absolute inset-x-0 z-20 flex items-center" style={{ top: nowTop }}>
                            <span className="-ml-1 h-2 w-2 rounded-full bg-bad" />
                            <span className="h-px flex-1 bg-bad" />
                          </div>
                        )}
                        {withLanes(items).map(({ b, lane, lanes }, i) => {
                          const s = new Date(b.start);
                          const top = (s.getHours() + s.getMinutes() / 60 - HOURS[0]!) * ROW;
                          const h = Math.max(26, (b.minutes / 60) * ROW - 3);
                          const st = KIND_STYLE[b.kind];
                          return (
                            <motion.button
                              key={b.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.05 + i * 0.04, duration: 0.3, ease: EASE }}
                              onClick={() => openBookingForm({ booking: b })}
                              style={{ top: top + 1, height: h, left: `calc(${(lane / lanes) * 100}% + 3px)`, width: `calc(${100 / lanes}% - 6px)` }}
                              className={cn(
                                "absolute z-10 overflow-hidden rounded-lg px-2 py-1 text-left transition",
                                st.bg,
                                b.status === "pending" && "border border-dashed border-fg-3/60",
                                b.status === "cancelled" && "opacity-40 line-through",
                                (b.status === "completed" || b.status === "no-show") && "opacity-60",
                              )}
                              title={`${b.title} · ${time(b.start)} · ${b.status}`}
                            >
                              <span className={cn("absolute inset-y-1 left-0 w-[3px] rounded-r-full", st.bar)} />
                              <span className={cn("block truncate pl-1 text-[11.5px] font-semibold", st.text)}>{name(b.leadId)}</span>
                              {h > 34 && (
                                <span className="block truncate pl-1 text-[10.5px] text-fg-2">
                                  {time(b.start)} · {b.kind}
                                </span>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="agenda" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: EASE }}>
            <Agenda bookings={bookings} name={name} onOpen={(b) => openBookingForm({ booking: b })} onStatus={setStatus} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Side-by-side columns for overlapping sessions (classic calendar lane layout). */
function withLanes(items: Booking[]) {
  const sorted = [...items].sort((a, b) => a.start.localeCompare(b.start));
  const out: { b: Booking; lane: number; lanes: number }[] = [];
  let cluster: { b: Booking; lane: number }[] = [];
  let clusterEnd = 0;
  const flush = () => {
    const n = Math.max(1, ...cluster.map((c) => c.lane + 1));
    cluster.forEach((c) => out.push({ ...c, lanes: n }));
    cluster = [];
  };
  for (const b of sorted) {
    const s = new Date(b.start).getTime();
    const e = s + b.minutes * 60_000;
    if (cluster.length && s >= clusterEnd) flush();
    const used = new Set(cluster.filter((c) => new Date(c.b.start).getTime() + c.b.minutes * 60_000 > s).map((c) => c.lane));
    let lane = 0;
    while (used.has(lane)) lane++;
    cluster.push({ b, lane });
    clusterEnd = Math.max(clusterEnd, e);
  }
  flush();
  return out;
}

function Agenda({ bookings, name, onOpen, onStatus }: { bookings: Booking[]; name: (id: string) => string; onOpen: (b: Booking) => void; onStatus: (b: Booking, s: BookingStatus) => void }) {
  const [past, setPast] = useState(false);
  const today = startOfDay(new Date()).getTime();
  const list = bookings.filter((b) => (past ? new Date(b.start).getTime() < today && new Date(b.start).getTime() > today - 14 * DAY : new Date(b.start).getTime() >= today && new Date(b.start).getTime() < today + 21 * DAY));
  const groups = new Map<number, Booking[]>();
  for (const b of past ? [...list].reverse() : list) {
    const k = startOfDay(b.start).getTime();
    groups.set(k, [...(groups.get(k) ?? []), b]);
  }
  return (
    <div className="space-y-4">
      <Segmented label="Agenda range" size="sm" value={past ? "past" : "upcoming"} onChange={(v) => setPast(v === "past")} options={[{ id: "upcoming", label: "Next 3 weeks" }, { id: "past", label: "Past 2 weeks" }]} />
      {groups.size === 0 && <Empty icon={<CalendarDays size={20} />} title="Nothing scheduled" body="Book a discovery call from a lead, or use New booking." />}
      {[...groups.entries()].map(([day, items]) => (
        <section key={day} className="card overflow-hidden">
          <header className="flex items-center justify-between border-b border-line px-5 py-3">
            <p className="text-[14px] font-semibold">{day === today ? "Today" : day === today + DAY ? "Tomorrow" : dateLong(new Date(day))}</p>
            <span className="text-[12px] text-fg-3">{items.length} session{items.length > 1 ? "s" : ""}</span>
          </header>
          <ul className="divide-y divide-line/70">
            {items.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5 transition hover:bg-panel-2/40">
                <div className="w-[68px] shrink-0">
                  <p className="font-display text-[15px] font-semibold">{time(b.start)}</p>
                  <p className="flex items-center gap-1 text-[11.5px] text-fg-3">
                    <Clock size={11} /> {b.minutes}m
                  </p>
                </div>
                <span className={cn("h-10 w-[3px] shrink-0 rounded-full", KIND_STYLE[b.kind].bar)} />
                <button onClick={() => onOpen(b)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <Avatar name={name(b.leadId)} size={34} />
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-medium">{name(b.leadId)}</span>
                    <span className="flex items-center gap-1.5 truncate text-[12.5px] text-fg-3">
                      {b.location.startsWith("In person") ? <MapPin size={12} /> : <Video size={12} />} {b.kind} · {b.location}
                    </span>
                  </span>
                </button>
                <div className="flex items-center gap-2">
                  <Badge tone={STATUS_TONE[b.status]}>{b.status}</Badge>
                  {past && b.status === "confirmed" && (
                    <>
                      <button onClick={() => onStatus(b, "completed")} className="rounded-md px-2.5 py-1 text-[12px] font-medium text-ok hover:bg-ok/10">
                        Completed
                      </button>
                      <button onClick={() => onStatus(b, "no-show")} className="rounded-md px-2.5 py-1 text-[12px] font-medium text-bad hover:bg-bad/10">
                        No-show
                      </button>
                    </>
                  )}
                  {!past && b.status === "pending" && (
                    <button onClick={() => onStatus(b, "confirmed")} className="rounded-md px-2.5 py-1 text-[12px] font-medium text-lime-fg hover:bg-lime/10">
                      Confirm
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
