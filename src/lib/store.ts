"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { addDays, DAY, startOfDay, uid } from "./format";
import { DEFAULT_SEED, generateSeed, type SeedState } from "./seed";
import type { Booking, ChatMessage, CheckIn, Client, ClientStatus, Draft, Lead, Offer, Source, Stage, Storefront } from "./types";

/**
 * The whole prototype runs on this store: sample data plus every edit the visitor makes, saved to
 * localStorage so changes survive a refresh. "Reset demo" regenerates the sample data.
 */

type Data = SeedState & {
  /** When the sample data was generated; on load all dates are moved forward so the demo stays current. */
  anchor: number;
  chat: ChatMessage[];
  welcomeSeen: boolean;
};

type Actions = {
  reset: () => void;
  dismissWelcome: () => void;
  addLead: (input: Pick<Lead, "name" | "email" | "phone" | "city" | "source" | "offerId" | "goal"> & { note?: string; handle?: string }) => Lead;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  setStage: (id: string, stage: Stage, reason?: string) => { clientCreated: boolean };
  addNote: (id: string, text: string) => void;
  deleteLead: (id: string) => void;
  saveOffer: (offer: Offer) => void;
  deleteOffer: (id: string) => void;
  saveBooking: (b: Booking) => void;
  deleteBooking: (id: string) => void;
  addCheckIn: (clientId: string, c: Omit<CheckIn, "id">) => void;
  setClientStatus: (clientId: string, status: ClientStatus) => void;
  saveDraft: (d: Draft) => void;
  markDraftSent: (id: string) => void;
  deleteDraft: (id: string) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  updateStorefront: (patch: Partial<Storefront>) => void;
  submitEnquiry: (input: { name: string; email: string; phone: string; goal: string; offerId: string }) => void;
  pushChat: (m: ChatMessage) => void;
  clearChat: () => void;
};

export type DemoState = Data & Actions;

const fresh = (): Data => ({ ...generateSeed(Date.now(), DEFAULT_SEED), anchor: Date.now(), chat: [], welcomeSeen: false });

const STAGE_INDEX: Record<Stage, number> = { new: 0, contacted: 1, call: 2, proposal: 3, won: 4, lost: -1 };
const now = () => new Date().toISOString();

export const useDemo = create<DemoState>()(
  persist(
    (set, get) => ({
      ...fresh(),
      reset: () => set({ ...fresh(), welcomeSeen: true }),
      dismissWelcome: () => set({ welcomeSeen: true }),

      addLead: (input) => {
        const offer = get().offers.find((o) => o.id === input.offerId) ?? get().offers[0]!;
        const lead: Lead = {
          id: uid("lead"),
          name: input.name.trim(),
          email: input.email.trim(),
          phone: input.phone.trim(),
          city: input.city.trim() || "Bengaluru",
          handle: input.handle,
          source: input.source,
          stage: "new",
          reached: 0,
          offerId: offer.id,
          value: offer.price,
          goal: input.goal.trim() || "Not shared yet",
          createdAt: now(),
          nextFollowUp: addDays(startOfDay(new Date()), 1).toISOString(),
          fitScore: 60 + Math.round(Math.random() * 25),
          notes: [
            { id: uid("n"), at: now(), kind: "system", text: "Lead added manually" },
            ...(input.note?.trim() ? [{ id: uid("n"), at: now(), kind: "note" as const, text: input.note.trim() }] : []),
          ],
        };
        set((s) => ({ leads: [lead, ...s.leads] }));
        return lead;
      },

      updateLead: (id, patch) => set((s) => ({ leads: s.leads.map((l) => (l.id === id ? { ...l, ...patch } : l)) })),

      setStage: (id, stage, reason) => {
        const s = get();
        const lead = s.leads.find((l) => l.id === id);
        if (!lead || lead.stage === stage) return { clientCreated: false };
        const t = now();
        const idx = STAGE_INDEX[stage];
        const patch: Partial<Lead> = { stage, reached: idx >= 0 ? Math.max(lead.reached, idx) : lead.reached };
        if (stage === "won") patch.wonAt = t;
        if (stage === "lost") {
          patch.lostAt = t;
          patch.lostReason = reason ?? "Not the right fit";
        }
        if (stage === "won" || stage === "lost") patch.nextFollowUp = undefined;
        if (idx >= 1) patch.lastContactAt = t;
        const text = stage === "lost" ? `Marked lost · ${patch.lostReason}` : stage === "won" ? "Won · client profile created" : `Moved to ${stageName(stage)}`;
        const notes = [...lead.notes, { id: uid("n"), at: t, kind: "system" as const, text }];
        let clientCreated = false;
        let clients = s.clients;
        if (stage === "won" && !s.clients.some((c) => c.leadId === id)) {
          const offer = s.offers.find((o) => o.id === lead.offerId) ?? s.offers[0]!;
          const start = startOfDay(new Date());
          const client: Client = {
            id: uid("cl"),
            leadId: id,
            offerId: offer.id,
            startDate: start.toISOString(),
            endDate: addDays(start, offer.weeks * 7).toISOString(),
            status: "on-track",
            plan: [`Week 1: onboarding call, baseline measurements and movement screen`, `Weeks 2–${Math.round(offer.weeks / 2)}: ${offer.goal.toLowerCase()} foundations`, `Weeks ${Math.round(offer.weeks / 2) + 1}–${offer.weeks}: progression and a plan for after the program`],
            metrics: [
              { label: "Sessions completed", unit: "", start: 0, current: 0, target: offer.weeks * 3 },
              { label: "Weekly check-ins", unit: "", start: 0, current: 0, target: offer.weeks },
            ],
            checkIns: [],
          };
          clients = [client, ...s.clients];
          clientCreated = true;
        }
        set({ leads: s.leads.map((l) => (l.id === id ? { ...l, ...patch, notes } : l)), clients });
        return { clientCreated };
      },

      addNote: (id, text) =>
        set((s) => ({ leads: s.leads.map((l) => (l.id === id ? { ...l, notes: [...l.notes, { id: uid("n"), at: now(), kind: "note", text }] } : l)) })),

      deleteLead: (id) =>
        set((s) => ({
          leads: s.leads.filter((l) => l.id !== id),
          clients: s.clients.filter((c) => c.leadId !== id),
          bookings: s.bookings.filter((b) => b.leadId !== id),
          drafts: s.drafts.filter((d) => d.leadId !== id),
        })),

      saveOffer: (offer) =>
        set((s) => {
          const exists = s.offers.some((o) => o.id === offer.id);
          const offers = exists ? s.offers.map((o) => (o.id === offer.id ? offer : o)) : [offer, ...s.offers];
          // Publishing adds the offer to the storefront; unpublishing removes it.
          const ids = s.storefront.offerIds.filter((id) => id !== offer.id);
          const offerIds = offer.status === "live" ? [...ids, offer.id] : ids;
          return { offers, storefront: { ...s.storefront, offerIds } };
        }),
      deleteOffer: (id) => set((s) => ({ offers: s.offers.filter((o) => o.id !== id), storefront: { ...s.storefront, offerIds: s.storefront.offerIds.filter((x) => x !== id) } })),

      saveBooking: (b) =>
        set((s) => {
          const exists = s.bookings.some((x) => x.id === b.id);
          const bookings = (exists ? s.bookings.map((x) => (x.id === b.id ? b : x)) : [...s.bookings, b]).sort((a, c) => a.start.localeCompare(c.start));
          // Booking a discovery call moves a lead forward, like it would in the real product.
          let leads = s.leads;
          const lead = s.leads.find((l) => l.id === b.leadId);
          if (!exists && b.kind === "Discovery call" && lead && STAGE_INDEX[lead.stage] >= 0 && STAGE_INDEX[lead.stage] < 2) {
            leads = s.leads.map((l) => (l.id === lead.id ? { ...l, stage: "call", reached: Math.max(l.reached, 2), notes: [...l.notes, { id: uid("n"), at: now(), kind: "system", text: "Discovery call booked" }] } : l));
          }
          return { bookings, leads };
        }),
      deleteBooking: (id) => set((s) => ({ bookings: s.bookings.filter((b) => b.id !== id) })),

      addCheckIn: (clientId, c) =>
        set((s) => ({
          clients: s.clients.map((cl) => {
            if (cl.id !== clientId) return cl;
            const checkIns = [{ ...c, id: uid("ci") }, ...cl.checkIns];
            const recent = checkIns.slice(0, 2);
            const avg = recent.reduce((a, x) => a + x.adherence, 0) / recent.length;
            return { ...cl, checkIns, status: avg >= 78 ? "on-track" : avg >= 64 ? "attention" : "at-risk" };
          }),
        })),
      setClientStatus: (clientId, status) => set((s) => ({ clients: s.clients.map((c) => (c.id === clientId ? { ...c, status } : c)) })),

      saveDraft: (d) => set((s) => ({ drafts: s.drafts.some((x) => x.id === d.id) ? s.drafts.map((x) => (x.id === d.id ? d : x)) : [d, ...s.drafts] })),
      markDraftSent: (id) =>
        set((s) => {
          const d = s.drafts.find((x) => x.id === id);
          if (!d) return {};
          const t = now();
          return {
            drafts: s.drafts.map((x) => (x.id === id ? { ...x, status: "marked-sent" } : x)),
            leads: s.leads.map((l) =>
              l.id === d.leadId
                ? {
                    ...l,
                    stage: l.stage === "new" ? "contacted" : l.stage,
                    reached: Math.max(l.reached, l.stage === "new" ? 1 : l.reached),
                    lastContactAt: t,
                    nextFollowUp: addDays(startOfDay(new Date()), 3).toISOString(),
                    notes: [...l.notes, { id: uid("n"), at: t, kind: "system", text: `Follow-up marked as sent (${d.channel}): "${d.text.slice(0, 80)}${d.text.length > 80 ? "…" : ""}"` }],
                  }
                : l,
            ),
          };
        }),
      deleteDraft: (id) => set((s) => ({ drafts: s.drafts.filter((d) => d.id !== id) })),

      markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      markRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),

      updateStorefront: (patch) => set((s) => ({ storefront: { ...s.storefront, ...patch } })),

      submitEnquiry: (input) => {
        const s = get();
        const offer = s.offers.find((o) => o.id === input.offerId) ?? s.offers[0]!;
        const t = now();
        const lead: Lead = {
          id: uid("lead"),
          name: input.name.trim(),
          email: input.email.trim(),
          phone: input.phone.trim(),
          city: "Bengaluru",
          source: "Storefront" satisfies Source,
          stage: "new",
          reached: 0,
          offerId: offer.id,
          value: offer.price,
          goal: input.goal.trim() || "Not shared yet",
          createdAt: t,
          nextFollowUp: t,
          fitScore: 78,
          notes: [{ id: uid("n"), at: t, kind: "system", text: `Enquiry submitted on your storefront for ${offer.title}` }],
        };
        set({
          leads: [lead, ...s.leads],
          notifications: [{ id: uid("nt"), at: t, title: `New lead: ${lead.name}`, body: `Storefront · "${lead.goal}"`, href: `/app/leads?lead=${lead.id}`, read: false }, ...s.notifications],
        });
      },

      pushChat: (m) => set((s) => ({ chat: [...s.chat, m].slice(-60) })),
      clearChat: () => set({ chat: [] }),
    }),
    {
      name: "fitflow-demo",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => {
        const { reset: _r, ...rest } = s;
        return Object.fromEntries(Object.entries(rest).filter(([, v]) => typeof v !== "function")) as Partial<DemoState>;
      },
      // Keep saved demos current: move every date forward by the whole days since the data was generated.
      merge: (persisted, current) => {
        const p = persisted as Data | undefined;
        if (!p || !p.anchor) return current;
        const days = Math.floor((Date.now() - p.anchor) / DAY);
        const shifted = days > 0 ? (shiftDates(p, days * DAY) as Data) : p;
        return { ...current, ...shifted, anchor: p.anchor + Math.max(0, days) * DAY };
      },
    },
  ),
);

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
function shiftDates(v: unknown, ms: number): unknown {
  if (typeof v === "string") return ISO.test(v) ? new Date(new Date(v).getTime() + ms).toISOString() : v;
  if (Array.isArray(v)) return v.map((x) => shiftDates(x, ms));
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shiftDates(x, ms)]));
  return v;
}

const stageName = (s: Stage) => ({ new: "New", contacted: "Contacted", call: "Call booked", proposal: "Proposal sent", won: "Won", lost: "Lost" })[s];

/**
 * True once the browser has loaded the saved demo. Components that read the store render a skeleton until
 * then, so server HTML never disagrees with what's in the visitor's localStorage.
 */
export function useHydrated() {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  return ok;
}

export const leadById = (s: DemoState, id: string | null | undefined) => (id ? s.leads.find((l) => l.id === id) : undefined);
export const offerById = (s: DemoState, id: string | null | undefined) => (id ? s.offers.find((o) => o.id === id) : undefined);
