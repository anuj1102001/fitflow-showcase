"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, CheckCircle2, ChevronDown, MapPin, MessageCircle, Quote, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { EASE } from "@/components/motion/kit";
import { cn } from "@/components/ui/cn";
import { rupees } from "@/lib/format";
import { AARAV_FAQ, AARAV_TESTIMONIALS, MEERA_FAQ, MEERA_TESTIMONIALS, type Faq, type Testimonial } from "@/lib/storefronts";
import type { Offer, Storefront, StorefrontTheme } from "@/lib/types";

/**
 * A coach's public page, in one of two themes. It is laid out with container queries, so the same component
 * renders correctly full-screen, inside the builder's phone/desktop frames and in the landing-page showcase.
 */

const THEMES: Record<StorefrontTheme, CSSProperties & Record<string, string>> = {
  forge: {
    "--sf-bg": "#0b0c0e",
    "--sf-surface": "#15171a",
    "--sf-surface-2": "#1d2024",
    "--sf-line": "rgba(255,255,255,.09)",
    "--sf-text": "#f2f3ee",
    "--sf-muted": "#a4a89f",
    "--sf-accent": "#c8f04a",
    "--sf-accent-ink": "#0c0e06",
    "--sf-display": "var(--font-bricolage)",
    "--sf-radius": "18px",
  },
  bloom: {
    "--sf-bg": "#f6f1ea",
    "--sf-surface": "#fffaf4",
    "--sf-surface-2": "#efe6da",
    "--sf-line": "rgba(70,45,25,.13)",
    "--sf-text": "#2a211b",
    "--sf-muted": "#6f6053",
    "--sf-accent": "#b9583a",
    "--sf-accent-ink": "#fffaf4",
    "--sf-display": "var(--font-fraunces)",
    "--sf-radius": "28px",
  },
};

export const THEME_META: Record<StorefrontTheme, { name: string; blurb: string; swatches: string[] }> = {
  forge: { name: "Forge", blurb: "Dark, bold and athletic. Built for strength and performance coaches.", swatches: ["#0b0c0e", "#1d2024", "#c8f04a", "#f2f3ee"] },
  bloom: { name: "Bloom", blurb: "Warm, light and calm. Suits yoga, mobility and wellness coaches.", swatches: ["#f6f1ea", "#efe6da", "#b9583a", "#2a211b"] },
};

export function StorefrontView({
  sf,
  offers,
  preview,
  onEnquire,
  testimonials,
  faq,
}: {
  sf: Storefront;
  offers: Offer[];
  /** Inside the builder/landing frames: the enquiry form shows a preview note instead of creating a lead. */
  preview?: boolean;
  onEnquire?: (v: { name: string; email: string; phone: string; goal: string; offerId: string }) => void;
  testimonials?: Testimonial[];
  faq?: Faq[];
}) {
  const t = sf.theme;
  const forge = t === "forge";
  const tm = testimonials ?? (forge ? AARAV_TESTIMONIALS : MEERA_TESTIMONIALS);
  const fq = faq ?? (forge ? AARAV_FAQ : MEERA_FAQ);
  const root = useRef<HTMLDivElement>(null);
  const scrollTo = (id: string) => root.current?.querySelector(`#sf-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div ref={root} className="sf-root @container min-h-full bg-[var(--sf-bg)] font-sans text-[var(--sf-text)]" style={THEMES[t]}>
      {/* Nav */}
      <nav className={cn("sticky top-0 z-20 border-b border-[var(--sf-line)] backdrop-blur-md", forge ? "bg-[#0b0c0e]/80" : "bg-[#f6f1ea]/85")}>
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-5 @3xl:h-16 @3xl:px-8">
          <span className={cn("truncate text-[16px] font-semibold tracking-tight @3xl:text-[18px]", !forge && "italic")} style={{ fontFamily: "var(--sf-display)" }}>
            {sf.coachName}
          </span>
          <div className="flex items-center gap-1 @3xl:gap-2">
            <button onClick={() => scrollTo("programs")} className="hidden rounded-full px-3 py-1.5 text-[13px] text-[var(--sf-muted)] transition hover:text-[var(--sf-text)] @2xl:block">
              Programs
            </button>
            {sf.showFaq && (
              <button onClick={() => scrollTo("faq")} className="hidden rounded-full px-3 py-1.5 text-[13px] text-[var(--sf-muted)] transition hover:text-[var(--sf-text)] @2xl:block">
                FAQ
              </button>
            )}
            <button onClick={() => scrollTo("enquire")} className="rounded-full bg-[var(--sf-accent)] px-3.5 py-2 text-[12.5px] font-semibold text-[var(--sf-accent-ink)] transition hover:brightness-105 @3xl:px-4 @3xl:text-[13px]">
              {forge ? "Get started" : "Book a consult"}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      {forge ? (
        <header className="relative overflow-hidden">
          <img src={sf.heroImage} alt={`${sf.coachName} coaching a client`} className="absolute inset-0 h-full w-full object-cover object-[60%_30%] opacity-70" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#0b0c0e_10%,rgba(11,12,14,.75)_45%,rgba(11,12,14,.2)),linear-gradient(0deg,#0b0c0e,transparent_45%)]" />
          <div className="relative mx-auto max-w-6xl px-5 pb-12 pt-16 @3xl:px-8 @3xl:pb-20 @3xl:pt-28">
            <p className="inline-flex items-center gap-2 rounded-full border border-[var(--sf-line)] bg-black/30 px-3 py-1 text-[12px] text-[var(--sf-muted)] backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--sf-accent)]" /> {sf.role} · <MapPin size={11} /> {sf.city}
            </p>
            <h1 className="mt-5 max-w-[14ch] text-[38px] font-bold uppercase leading-[0.95] tracking-[-0.035em] @lg:text-[48px] @3xl:text-[68px] @5xl:text-[80px]">{sf.headline}</h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[var(--sf-muted)] @3xl:text-[17px]">{sf.bio}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button onClick={() => scrollTo("enquire")} className="inline-flex h-12 items-center gap-2 rounded-full bg-[var(--sf-accent)] px-6 text-[14.5px] font-semibold text-[var(--sf-accent-ink)] shadow-[0_10px_30px_-10px_var(--sf-accent)] transition hover:brightness-105">
                {sf.ctaLabel} <ArrowRight size={16} />
              </button>
              <button onClick={() => scrollTo("programs")} className="inline-flex h-12 items-center rounded-full border border-[var(--sf-line)] px-6 text-[14.5px] font-medium transition hover:bg-white/5">
                See programs
              </button>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-[var(--sf-line)] pt-6">
              {sf.stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-[11.5px] uppercase tracking-wider text-[var(--sf-muted)]">{s.label}</dt>
                  <dd className="mt-1 font-[family-name:var(--sf-display)] text-[22px] font-bold @3xl:text-[26px]">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </header>
      ) : (
        <header className="mx-auto grid max-w-6xl items-center gap-8 px-5 pb-12 pt-10 @3xl:grid-cols-[1.1fr_.9fr] @3xl:gap-12 @3xl:px-8 @3xl:pb-20 @3xl:pt-16">
          <div>
            <p className="inline-flex items-center gap-2 text-[12.5px] font-medium uppercase tracking-[0.16em] text-[var(--sf-accent)]">
              {sf.role} · {sf.city}
            </p>
            <h1 className="mt-4 text-[38px] font-medium leading-[1.04] tracking-[-0.02em] @lg:text-[46px] @3xl:text-[58px] @5xl:text-[66px]">{sf.headline}</h1>
            <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-[var(--sf-muted)] @3xl:text-[17px]">{sf.bio}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button onClick={() => scrollTo("enquire")} className="inline-flex h-12 items-center gap-2 rounded-full bg-[var(--sf-accent)] px-6 text-[14.5px] font-semibold text-[var(--sf-accent-ink)] transition hover:brightness-110">
                {sf.ctaLabel} <ArrowRight size={16} />
              </button>
              <button onClick={() => scrollTo("programs")} className="inline-flex h-12 items-center rounded-full border border-[var(--sf-line)] px-6 text-[14.5px] font-medium transition hover:bg-black/[.03]">
                Explore programs
              </button>
            </div>
            <dl className="mt-9 flex flex-wrap gap-x-8 gap-y-3">
              {sf.stats.map((s) => (
                <div key={s.label}>
                  <dd className="font-[family-name:var(--sf-display)] text-[24px] font-medium italic">{s.value}</dd>
                  <dt className="text-[12.5px] text-[var(--sf-muted)]">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-3 rounded-t-[999px] rounded-b-[36px] border border-[var(--sf-line)]" aria-hidden />
            <img src={sf.heroImage} alt={`${sf.coachName} leading a session`} className="relative aspect-[4/5] w-full rounded-b-[32px] rounded-t-[999px] object-cover" />
            <div className="absolute -bottom-4 -left-2 rounded-2xl border border-[var(--sf-line)] bg-[var(--sf-surface)] px-4 py-3 shadow-[0_18px_40px_-20px_rgba(70,45,25,.45)] @3xl:-left-8">
              <p className="text-[12px] text-[var(--sf-muted)]">Next batch starts</p>
              <p className="font-[family-name:var(--sf-display)] text-[17px] font-medium italic">Monday, 7 am</p>
            </div>
          </div>
        </header>
      )}

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 py-12 @3xl:px-8 @3xl:py-16">
        <SectionHead forge={forge} eyebrow="How it works" title={forge ? "Three steps. No guesswork." : "A gentle, guided start"} />
        <ol className="mt-8 grid gap-3 @3xl:grid-cols-3">
          {[
            ["Free discovery call", "20 minutes to understand your goal, schedule and history."],
            ["Your personal plan", "A program built for your week, equipment and starting point."],
            ["Weekly check-ins", "Progress reviews and adjustments so the plan keeps working."],
          ].map(([h, b], i) => (
            <li key={h} className="rounded-[var(--sf-radius)] border border-[var(--sf-line)] bg-[var(--sf-surface)] p-5">
              <span className={cn("grid h-9 w-9 place-items-center rounded-full text-[14px] font-bold", forge ? "bg-[var(--sf-accent)] text-[var(--sf-accent-ink)]" : "border border-[var(--sf-accent)] font-[family-name:var(--sf-display)] italic text-[var(--sf-accent)]")}>{i + 1}</span>
              <h3 className="mt-4 text-[18px] font-semibold">{h}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--sf-muted)]">{b}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Programs */}
      <section id="sf-programs" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-12 @3xl:px-8 @3xl:py-16">
        <SectionHead forge={forge} eyebrow="Programs" title={forge ? "Pick your program" : "Ways to work with me"} />
        {offers.length === 0 ? (
          <p className="mt-8 rounded-[var(--sf-radius)] border border-dashed border-[var(--sf-line)] p-8 text-center text-[14px] text-[var(--sf-muted)]">No programs published yet.</p>
        ) : (
          <div className={cn("mt-8 grid gap-4", offers.length > 1 && "@3xl:grid-cols-2 @5xl:grid-cols-3")}>
            {offers.map((o, i) => (
              <OfferCardThemed key={o.id} offer={o} theme={t} highlight={offers.length > 1 && i === 0} onSelect={() => scrollTo("enquire")} />
            ))}
          </div>
        )}
      </section>

      {/* Testimonials */}
      {sf.showTestimonials && (
        <section className="mx-auto max-w-6xl px-5 py-12 @3xl:px-8 @3xl:py-16">
          <SectionHead forge={forge} eyebrow="Client stories" title={forge ? "What clients say" : "Kind words"} note="Fictional testimonials for this demo" />
          <div className="mt-8 grid gap-4 @3xl:grid-cols-3">
            {tm.map((x) => (
              <figure key={x.name} className="flex flex-col rounded-[var(--sf-radius)] border border-[var(--sf-line)] bg-[var(--sf-surface)] p-5">
                <Quote size={20} className="text-[var(--sf-accent)]" />
                <blockquote className={cn("mt-3 flex-1 text-[15px] leading-relaxed", !forge && "font-[family-name:var(--sf-display)] text-[16.5px] italic")}>&ldquo;{x.quote}&rdquo;</blockquote>
                <figcaption className="mt-4 border-t border-[var(--sf-line)] pt-3 text-[13px]">
                  <span className="font-semibold">{x.name}</span>
                  <span className="block text-[var(--sf-muted)]">{x.detail}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {sf.showFaq && (
        <section id="sf-faq" className="mx-auto max-w-3xl scroll-mt-16 px-5 py-12 @3xl:px-8 @3xl:py-16">
          <SectionHead forge={forge} eyebrow="FAQ" title="Questions, answered" center />
          <div className="mt-8 divide-y divide-[var(--sf-line)] rounded-[var(--sf-radius)] border border-[var(--sf-line)] bg-[var(--sf-surface)]">
            {fq.map((f) => (
              <Accordion key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </section>
      )}

      {/* Enquiry */}
      <section id="sf-enquire" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-12 @3xl:px-8 @3xl:py-16">
        <div className={cn("grid gap-8 overflow-hidden rounded-[calc(var(--sf-radius)+8px)] border border-[var(--sf-line)] p-6 @3xl:grid-cols-[.9fr_1.1fr] @3xl:p-10", forge ? "bg-[var(--sf-surface)]" : "bg-[var(--sf-surface-2)]")}>
          <div>
            <h2 className={cn("text-[30px] leading-tight tracking-[-0.025em] @3xl:text-[40px]", forge ? "font-bold uppercase" : "font-medium")}>{forge ? "Ready to start?" : "Let's talk about your goals"}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--sf-muted)]">Tell me a little about yourself. I reply personally within a day, usually with a time for a free 20-minute call.</p>
            <ul className="mt-6 space-y-2.5 text-[14px]">
              {["No-pressure discovery call", "Personal plan, not a template", "Cancel or pause anytime"].map((x) => (
                <li key={x} className="flex items-center gap-2.5">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--sf-accent)] text-[var(--sf-accent-ink)]">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <EnquiryForm offers={offers} preview={preview} onEnquire={onEnquire} forge={forge} />
        </div>
      </section>

      <footer className="border-t border-[var(--sf-line)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-6 text-[12.5px] text-[var(--sf-muted)] @3xl:flex-row @3xl:px-8">
          <span>
            © {sf.coachName} · {sf.city}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles size={12} /> Storefront by FITFLOW · demo page with fictional coach
          </span>
        </div>
      </footer>
    </div>
  );
}

function SectionHead({ eyebrow, title, forge, center, note }: { eyebrow: string; title: string; forge: boolean; center?: boolean; note?: string }) {
  return (
    <div className={cn(center && "text-center")}>
      <p className={cn("text-[12px] font-semibold uppercase tracking-[0.18em]", forge ? "text-[var(--sf-accent)]" : "text-[var(--sf-accent)]")}>{eyebrow}</p>
      <h2 className={cn("mt-2 text-[28px] leading-tight tracking-[-0.025em] @3xl:text-[38px]", forge ? "font-bold uppercase" : "font-medium")}>{title}</h2>
      {note && <p className="mt-2 inline-block rounded-md border border-dashed border-[var(--sf-line)] px-2 py-0.5 text-[11px] uppercase tracking-wider text-[var(--sf-muted)]">{note}</p>}
    </div>
  );
}

function Accordion({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-medium">
        {q}
        <ChevronDown size={18} className={cn("shrink-0 text-[var(--sf-muted)] transition-transform duration-300", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }} className="overflow-hidden">
            <p className="px-5 pb-4 text-[14.5px] leading-relaxed text-[var(--sf-muted)]">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function OfferCardThemed({ offer, theme, highlight, onSelect }: { offer: Offer; theme: StorefrontTheme; highlight?: boolean; onSelect?: () => void }) {
  const forge = theme === "forge";
  return (
    <article
      style={THEMES[theme]}
      className={cn(
        "sf-root relative flex h-full flex-col overflow-hidden rounded-[calc(var(--sf-radius)+6px)] border p-6 text-[var(--sf-text)]",
        highlight ? "border-[color-mix(in_srgb,var(--sf-accent)_60%,transparent)]" : "border-[var(--sf-line)]",
        forge ? "bg-[var(--sf-surface)]" : "bg-[var(--sf-surface)]",
      )}
    >
      {forge && highlight && <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[var(--sf-accent)] opacity-[.12] blur-3xl" aria-hidden />}
      <div className="relative flex items-center justify-between gap-2">
        <span className="rounded-full border border-[var(--sf-line)] px-2.5 py-1 text-[11.5px] text-[var(--sf-muted)]">
          {offer.type} · {offer.weeks} wk
        </span>
        {highlight && <span className="rounded-full bg-[var(--sf-accent)] px-2.5 py-1 text-[11px] font-semibold text-[var(--sf-accent-ink)]">Most popular</span>}
      </div>
      <h3 className={cn("relative mt-4 text-[23px] leading-tight tracking-[-0.02em]", forge ? "font-bold" : "font-medium")}>{offer.title || "Untitled offer"}</h3>
      <p className="relative mt-2 text-[14px] leading-relaxed text-[var(--sf-muted)]">{offer.tagline}</p>
      <p className="relative mt-5 flex items-baseline gap-1.5">
        <span className={cn("font-[family-name:var(--sf-display)] text-[32px] tracking-[-0.02em]", forge ? "font-bold" : "font-medium")}>{offer.price ? rupees(offer.price) : "₹–"}</span>
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
      <button onClick={onSelect} className={cn("relative mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full text-[14px] font-semibold transition", highlight || !forge ? "bg-[var(--sf-accent)] text-[var(--sf-accent-ink)] hover:brightness-105" : "border border-[var(--sf-line)] hover:bg-white/5")}>
        {offer.cta || "Get started"} <ArrowRight size={15} />
      </button>
    </article>
  );
}

function EnquiryForm({ offers, preview, onEnquire, forge }: { offers: Offer[]; preview?: boolean; onEnquire?: (v: { name: string; email: string; phone: string; goal: string; offerId: string }) => void; forge: boolean }) {
  const [v, setV] = useState({ name: "", email: "", phone: "", goal: "", offerId: offers[0]?.id ?? "", consent: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  useEffect(() => setV((x) => ({ ...x, offerId: offers.some((o) => o.id === x.offerId) ? x.offerId : (offers[0]?.id ?? "") })), [offers]);

  const field = "w-full rounded-[14px] border border-[var(--sf-line)] bg-[var(--sf-bg)] px-4 text-[14.5px] text-[var(--sf-text)] placeholder:text-[color-mix(in_srgb,var(--sf-muted)_75%,transparent)] transition focus:border-[var(--sf-accent)] focus:outline-none focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--sf-accent)_18%,transparent)] aria-[invalid=true]:border-[#e5534b]";
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (v.name.trim().length < 2) err.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) err.email = "Please enter a valid email.";
    if (v.phone && !/^\+?[\d\s-]{8,16}$/.test(v.phone)) err.phone = "Please check the number.";
    if (!v.consent) err.consent = "Please confirm so the coach can contact you.";
    setErrors(err);
    if (Object.keys(err).length) return;
    setState("sending");
    setTimeout(() => {
      if (!preview) onEnquire?.(v);
      setState("done");
    }, 900);
  };
  if (state === "done")
    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: EASE }} className="grid place-items-center rounded-[var(--sf-radius)] border border-[var(--sf-line)] bg-[var(--sf-bg)] p-8 text-center" role="status">
        <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }} className="grid h-14 w-14 place-items-center rounded-full bg-[var(--sf-accent)] text-[var(--sf-accent-ink)]">
          <Check size={26} strokeWidth={3} />
        </motion.span>
        <h3 className="mt-4 text-[22px] font-semibold">Thanks, {v.name.split(" ")[0]}!</h3>
        <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-[var(--sf-muted)]">
          {preview ? "This is a preview, so no enquiry was created." : "Your enquiry was sent. (Demo: it now appears as a new lead in the coach's dashboard. No email was sent.)"}
        </p>
        <button onClick={() => (setState("idle"), setV({ ...v, name: "", email: "", phone: "", goal: "", consent: false }))} className="mt-5 text-[13px] font-medium text-[var(--sf-accent)] underline-offset-4 hover:underline">
          Send another
        </button>
      </motion.div>
    );
  return (
    <form onSubmit={submit} noValidate className="grid gap-3 @lg:grid-cols-2">
      <Labeled label="Name" error={errors.name}>
        <input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} className={cn(field, "h-12")} placeholder="Your name" aria-invalid={!!errors.name} aria-label="Name" />
      </Labeled>
      <Labeled label="Email" error={errors.email}>
        <input type="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} className={cn(field, "h-12")} placeholder="you@example.com" aria-invalid={!!errors.email} aria-label="Email" />
      </Labeled>
      <Labeled label="Phone (optional)" error={errors.phone}>
        <input type="tel" value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} className={cn(field, "h-12")} placeholder="+91" aria-invalid={!!errors.phone} aria-label="Phone" />
      </Labeled>
      <Labeled label="Program">
        <select value={v.offerId} onChange={(e) => setV({ ...v, offerId: e.target.value })} className={cn(field, "h-12 appearance-none")} aria-label="Program">
          {offers.map((o) => (
            <option key={o.id} value={o.id}>
              {o.title}
            </option>
          ))}
        </select>
      </Labeled>
      <Labeled label="Your goal" className="@lg:col-span-2">
        <textarea value={v.goal} onChange={(e) => setV({ ...v, goal: e.target.value })} className={cn(field, "min-h-[92px] py-3")} placeholder="What would you like to achieve?" aria-label="Your goal" />
      </Labeled>
      <label className="flex items-start gap-2.5 text-[13px] leading-snug text-[var(--sf-muted)] @lg:col-span-2">
        <input type="checkbox" checked={v.consent} onChange={(e) => setV({ ...v, consent: e.target.checked })} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--sf-accent)]" />
        <span>
          I agree to be contacted about coaching by email or phone.
          {errors.consent && <span className="mt-1 block font-medium text-[#e5534b]">{errors.consent}</span>}
        </span>
      </label>
      <button type="submit" disabled={state === "sending"} className={cn("inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--sf-accent)] text-[15px] font-semibold text-[var(--sf-accent-ink)] transition hover:brightness-105 disabled:opacity-70 @lg:col-span-2", forge && "uppercase tracking-wide")}>
        {state === "sending" ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" /> : <MessageCircle size={16} />}
        {state === "sending" ? "Sending…" : "Send enquiry"}
      </button>
      {preview && <p className="text-center text-[12px] text-[var(--sf-muted)] @lg:col-span-2">Preview: submitting won&apos;t create a lead.</p>}
    </form>
  );
}

function Labeled({ label, error, children, className }: { label: string; error?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <span className="mb-1.5 block pl-1 text-[12.5px] font-medium text-[var(--sf-muted)]">{label}</span>
      {children}
      {error && (
        <span role="alert" className="mt-1 block pl-1 text-[12.5px] font-medium text-[#e5534b]">
          {error}
        </span>
      )}
    </div>
  );
}
