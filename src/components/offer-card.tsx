"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { CSSProperties } from "react";
import { cn } from "@/components/ui/cn";
import { rupees } from "@/lib/format";
import type { Offer } from "@/lib/types";

/** The offer as a client sees it in a proposal: dark card, lime accent. */
const CARD: CSSProperties & Record<string, string> = {
  "--sf-surface": "#15171a",
  "--sf-line": "rgba(255,255,255,.09)",
  "--sf-text": "#f2f3ee",
  "--sf-muted": "#a4a89f",
  "--sf-accent": "#c8f04a",
  "--sf-accent-ink": "#0c0e06",
  "--sf-display": "var(--font-bricolage)",
};

export function OfferCard({ offer, highlight, onSelect }: { offer: Offer; highlight?: boolean; onSelect?: () => void }) {
  return (
    <article
      style={CARD}
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-[24px] border bg-[var(--sf-surface)] p-6 text-[var(--sf-text)]",
        highlight ? "border-[color-mix(in_srgb,var(--sf-accent)_60%,transparent)]" : "border-[var(--sf-line)]",
      )}
    >
      <div className="relative flex items-center justify-between gap-2">
        <span className="rounded-full border border-[var(--sf-line)] px-2.5 py-1 text-[11.5px] text-[var(--sf-muted)]">
          {offer.type} · {offer.weeks} wk
        </span>
        {highlight && <span className="rounded-full bg-[var(--sf-accent)] px-2.5 py-1 text-[11px] font-semibold text-[var(--sf-accent-ink)]">Proposal</span>}
      </div>
      <h3 className="relative mt-4 text-[23px] font-bold leading-tight tracking-[-0.02em]">{offer.title || "Untitled offer"}</h3>
      <p className="relative mt-2 text-[14px] leading-relaxed text-[var(--sf-muted)]">{offer.tagline}</p>
      <p className="relative mt-5 flex items-baseline gap-1.5">
        <span className="font-[family-name:var(--sf-display)] text-[32px] font-bold tracking-[-0.02em]">{offer.price ? rupees(offer.price) : "₹–"}</span>
        <span className="text-[13px] text-[var(--sf-muted)]">/ {offer.weeks} weeks</span>
      </p>
      <ul className="relative mt-5 flex-1 space-y-2.5 border-t border-[var(--sf-line)] pt-5">
        {offer.benefits.filter(Boolean).map((b) => (
          <li key={b} className="flex gap-2.5 text-[14px] leading-snug">
            <CheckCircle2 size={17} className="mt-px shrink-0 text-[var(--sf-accent)]" />
            {b}
          </li>
        ))}
      </ul>
      <button onClick={onSelect} className="relative mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--sf-accent)] text-[14px] font-semibold text-[var(--sf-accent-ink)] transition hover:brightness-105">
        {offer.cta || "Get started"} <ArrowRight size={15} />
      </button>
    </article>
  );
}
