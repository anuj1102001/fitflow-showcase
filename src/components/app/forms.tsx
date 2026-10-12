"use client";

import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { addDays, dateLong, startOfDay, time, uid } from "@/lib/format";
import { useDemo } from "@/lib/store";
import { BOOKING_KINDS, BOOKING_STATUSES, SOURCES, type Booking, type BookingKind, type BookingStatus, type Source } from "@/lib/types";
import { useUI } from "@/lib/ui-store";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[\d\s-]{8,16}$/;

export function LeadForm() {
  const { leadForm, closeLeadForm } = useUI();
  const offers = useDemo((s) => s.offers);
  const addLead = useDemo((s) => s.addLead);
  const toast = useToast();
  const router = useRouter();
  const blank = { name: "", email: "", phone: "", city: "", source: "Instagram" as Source, offerId: offers[0]?.id ?? "", goal: "", note: "" };
  const [v, setV] = useState(blank);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (leadForm) {
      setV({ ...blank, offerId: offers[0]?.id ?? "" });
      setErrors({});
      setTried(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadForm]);

  const validate = (x = v) => {
    const e: Record<string, string> = {};
    if (x.name.trim().length < 2) e.name = "Enter the lead's name.";
    if (!x.email.trim() && !x.phone.trim()) e.email = "Add an email or a phone number so you can follow up.";
    if (x.email.trim() && !EMAIL.test(x.email.trim())) e.email = "That email doesn't look right.";
    if (x.phone.trim() && !PHONE.test(x.phone.trim())) e.phone = "Use digits, spaces or +91.";
    return e;
  };
  const set = (k: keyof typeof v, val: string) => {
    const next = { ...v, [k]: val };
    setV(next);
    if (tried) setErrors(validate(next));
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const lead = addLead(v);
    closeLeadForm();
    toast({ tone: "success", title: "Lead added", body: `${lead.name} is in your pipeline as New.` });
    router.push(`/app/leads?lead=${lead.id}`);
  };

  return (
    <Dialog open={leadForm} onClose={closeLeadForm} title="Add a lead" description="Someone who messaged you, commented or asked about coaching." wide>
      <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="lf-name" error={errors.name} className="sm:col-span-2">
          <Input id="lf-name" value={v.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Priya Sharma" aria-invalid={!!errors.name} autoFocus />
        </Field>
        <Field label="Email" htmlFor="lf-email" error={errors.email}>
          <Input id="lf-email" type="email" value={v.email} onChange={(e) => set("email", e.target.value)} placeholder="name@example.com" aria-invalid={!!errors.email} />
        </Field>
        <Field label="Phone" htmlFor="lf-phone" error={errors.phone} optional>
          <Input id="lf-phone" type="tel" value={v.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98xxx xxxxx" aria-invalid={!!errors.phone} />
        </Field>
        <Field label="Where did they find you?" htmlFor="lf-source">
          <Select id="lf-source" value={v.source} onChange={(e) => set("source", e.target.value)}>
            {SOURCES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="Interested in" htmlFor="lf-offer">
          <Select id="lf-offer" value={v.offerId} onChange={(e) => set("offerId", e.target.value)}>
            {offers.map((o) => (
              <option key={o.id} value={o.id}>
                {o.title}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Their goal" htmlFor="lf-goal" optional className="sm:col-span-2">
          <Input id="lf-goal" value={v.goal} onChange={(e) => set("goal", e.target.value)} placeholder="e.g. Lose 6 kg before my sister's wedding" />
        </Field>
        <Field label="Note" htmlFor="lf-note" optional className="sm:col-span-2">
          <Textarea id="lf-note" value={v.note} onChange={(e) => set("note", e.target.value)} placeholder="Anything worth remembering" className="min-h-[84px]" />
        </Field>
        <div className="flex justify-end gap-2 pt-1 sm:col-span-2">
          <Button variant="ghost" onClick={closeLeadForm}>
            Cancel
          </Button>
          <Button type="submit">Add lead</Button>
        </div>
      </form>
    </Dialog>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");
const toDateInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toTimeInput = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export function BookingForm() {
  const { bookingForm, closeBookingForm } = useUI();
  const leads = useDemo((s) => s.leads);
  const clients = useDemo((s) => s.clients);
  const bookings = useDemo((s) => s.bookings);
  const saveBooking = useDemo((s) => s.saveBooking);
  const deleteBooking = useDemo((s) => s.deleteBooking);
  const toast = useToast();
  const editing = bookingForm.booking;

  const people = useMemo(() => {
    const clientIds = new Set(clients.map((c) => c.leadId));
    const active = leads.filter((l) => clientIds.has(l.id) || ["new", "contacted", "call", "proposal"].includes(l.stage));
    return active.map((l) => ({ id: l.id, label: `${l.name} · ${clientIds.has(l.id) ? "Client" : "Lead"}` })).sort((a, b) => a.label.localeCompare(b.label));
  }, [leads, clients]);

  const initial = () => {
    if (editing) {
      const d = new Date(editing.start);
      return { leadId: editing.leadId, kind: editing.kind, date: toDateInput(d), time: toTimeInput(d), minutes: String(editing.minutes), status: editing.status, location: editing.location, notes: editing.notes };
    }
    const d = bookingForm.start ? new Date(bookingForm.start) : (() => { const x = addDays(startOfDay(new Date()), 1); x.setHours(18, 0); return x; })();
    return { leadId: bookingForm.leadId ?? people[0]?.id ?? "", kind: "Discovery call" as BookingKind, date: toDateInput(d), time: toTimeInput(d), minutes: "20", status: "confirmed" as BookingStatus, location: "Google Meet", notes: "" };
  };
  const [v, setV] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    if (bookingForm.open) {
      setV(initial());
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingForm.open]);

  const start = new Date(`${v.date}T${v.time || "00:00"}`);
  const conflict = useMemo(() => {
    if (!v.date || !v.time || Number.isNaN(start.getTime())) return undefined;
    const s = start.getTime();
    const e = s + Number(v.minutes || 0) * 60_000;
    return bookings.find((b) => b.id !== editing?.id && b.status !== "cancelled" && new Date(b.start).getTime() < e && new Date(b.start).getTime() + b.minutes * 60_000 > s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v.date, v.time, v.minutes, bookings, editing?.id]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!v.leadId) errs.leadId = "Choose who the session is with.";
    if (!v.date) errs.date = "Pick a date.";
    if (!v.time) errs.time = "Pick a time.";
    const mins = Number(v.minutes);
    if (!Number.isFinite(mins) || mins < 10 || mins > 180) errs.minutes = "Between 10 and 180 minutes.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const lead = leads.find((l) => l.id === v.leadId)!;
    const b: Booking = {
      id: editing?.id ?? uid("bk"),
      leadId: v.leadId,
      kind: v.kind,
      title: `${v.kind}: ${lead.name.split(" ")[0]}`,
      start: start.toISOString(),
      minutes: mins,
      status: v.status,
      location: v.location.trim() || "Google Meet",
      notes: v.notes,
    };
    saveBooking(b);
    closeBookingForm();
    toast({ tone: "success", title: editing ? "Booking updated" : "Booking added", body: `${b.title} · ${dateLong(b.start)}, ${time(b.start)}` });
  };

  return (
    <Dialog open={bookingForm.open} onClose={closeBookingForm} title={editing ? "Edit booking" : "New booking"} description="Sample scheduling: nothing is sent to a real calendar." wide>
      <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field label="With" htmlFor="bf-lead" error={errors.leadId} className="sm:col-span-2">
          <Select id="bf-lead" value={v.leadId} onChange={(e) => setV({ ...v, leadId: e.target.value })}>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Type" htmlFor="bf-kind">
          <Select id="bf-kind" value={v.kind} onChange={(e) => {
            const kind = e.target.value as BookingKind;
            setV({ ...v, kind, minutes: { "Discovery call": "20", "Check-in": "30", "Coaching session": "60", Assessment: "45" }[kind] });
          }}>
            {BOOKING_KINDS.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </Select>
        </Field>
        <Field label="Status" htmlFor="bf-status">
          <Select id="bf-status" value={v.status} onChange={(e) => setV({ ...v, status: e.target.value as BookingStatus })}>
            {BOOKING_STATUSES.map((k) => (
              <option key={k} value={k}>
                {k[0]!.toUpperCase() + k.slice(1)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Date" htmlFor="bf-date" error={errors.date}>
          <Input id="bf-date" type="date" value={v.date} onChange={(e) => setV({ ...v, date: e.target.value })} aria-invalid={!!errors.date} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Time" htmlFor="bf-time" error={errors.time}>
            <Input id="bf-time" type="time" step={900} value={v.time} onChange={(e) => setV({ ...v, time: e.target.value })} aria-invalid={!!errors.time} />
          </Field>
          <Field label="Minutes" htmlFor="bf-min" error={errors.minutes}>
            <Input id="bf-min" inputMode="numeric" value={v.minutes} onChange={(e) => setV({ ...v, minutes: e.target.value.replace(/\D/g, "") })} aria-invalid={!!errors.minutes} />
          </Field>
        </div>
        {conflict && (
          <p className="flex items-start gap-2 rounded-2xl border border-warn/25 bg-warn/10 px-3.5 py-2.5 text-[13px] text-warn sm:col-span-2" role="status">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" /> Overlaps with &ldquo;{conflict.title}&rdquo; at {time(conflict.start)}. You can still save it.
          </p>
        )}
        <Field label="Location" htmlFor="bf-loc" className="sm:col-span-2">
          <Input id="bf-loc" value={v.location} onChange={(e) => setV({ ...v, location: e.target.value })} placeholder="Google Meet, Zoom or a gym address" />
        </Field>
        <Field label="Notes" htmlFor="bf-notes" optional className="sm:col-span-2">
          <Textarea id="bf-notes" value={v.notes} onChange={(e) => setV({ ...v, notes: e.target.value })} className="min-h-[72px]" placeholder="Agenda, focus areas…" />
        </Field>
        <div className="flex items-center justify-between gap-2 pt-1 sm:col-span-2">
          {editing ? (
            <Button
              variant="danger"
              onClick={() => {
                deleteBooking(editing.id);
                closeBookingForm();
                toast({ tone: "info", title: "Booking deleted" });
              }}
            >
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={closeBookingForm}>
              Cancel
            </Button>
            <Button type="submit">{editing ? "Save changes" : "Add booking"}</Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
