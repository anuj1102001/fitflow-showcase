/** Domain model for the FITFLOW prototype. Everything lives in the browser (see lib/store.ts). */

export const SOURCES = ["Instagram", "Website", "Referral", "YouTube", "WhatsApp"] as const;
export type Source = (typeof SOURCES)[number];

/** Pipeline stages in order. `reached` on a lead is the index of the furthest active stage it got to. */
export const STAGES = ["new", "contacted", "call", "proposal", "won", "lost"] as const;
export type Stage = (typeof STAGES)[number];
export const ACTIVE_STAGES = ["new", "contacted", "call", "proposal"] as const;
export const STAGE_LABEL: Record<Stage, string> = {
  new: "New",
  contacted: "Contacted",
  call: "Call booked",
  proposal: "Proposal sent",
  won: "Won",
  lost: "Lost",
};

export type Note = { id: string; at: string; text: string; kind: "note" | "system" };

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  handle?: string;
  source: Source;
  stage: Stage;
  /** Furthest stage reached (0 new … 4 won). Lost leads keep the stage they dropped out at. */
  reached: number;
  offerId: string;
  value: number;
  goal: string;
  createdAt: string;
  lastContactAt?: string;
  nextFollowUp?: string;
  wonAt?: string;
  lostAt?: string;
  lostReason?: string;
  fitScore: number;
  notes: Note[];
};

export const OFFER_TYPES = ["1:1 online coaching", "Small-group program", "Hybrid (online + in person)", "Self-paced plan"] as const;
export type OfferType = (typeof OFFER_TYPES)[number];

export type Offer = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  type: OfferType;
  goal: string;
  audience: string;
  price: number;
  weeks: number;
  benefits: string[];
  cta: string;
  status: "live" | "draft";
  createdAt: string;
  aiDrafted?: boolean;
};

export const BOOKING_KINDS = ["Discovery call", "Coaching session", "Check-in", "Assessment"] as const;
export type BookingKind = (typeof BOOKING_KINDS)[number];
export const BOOKING_STATUSES = ["confirmed", "pending", "completed", "cancelled", "no-show"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export type Booking = {
  id: string;
  title: string;
  kind: BookingKind;
  /** Person the session is with: a lead or a client (clients are leads that were won). */
  leadId: string;
  start: string;
  minutes: number;
  status: BookingStatus;
  location: string;
  notes: string;
};

export type ClientStatus = "on-track" | "attention" | "at-risk";
export type Metric = { label: string; unit: string; start: number; current: number; target: number; lowerIsBetter?: boolean };
export type CheckIn = { id: string; date: string; adherence: number; mood: 1 | 2 | 3 | 4 | 5; note: string };

export type Client = {
  id: string;
  leadId: string;
  offerId: string;
  startDate: string;
  endDate: string;
  status: ClientStatus;
  plan: string[];
  metrics: Metric[];
  checkIns: CheckIn[];
};

export type Draft = {
  id: string;
  leadId: string;
  goal: string;
  tone: string;
  channel: string;
  text: string;
  createdAt: string;
  status: "draft" | "marked-sent";
};

export type Notification = { id: string; at: string; title: string; body: string; href: string; read: boolean };


export type ChatMessage = { id: string; role: "user" | "assistant"; text: string; at: string; cards?: { label: string; value: string; href?: string }[] };
