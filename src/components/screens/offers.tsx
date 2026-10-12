"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Baby, BookOpen, Check, CheckCircle2, Dumbbell, Eye, Flame, Footprints, GripVertical, HeartPulse, Laptop, Layers, MonitorSmartphone, Pencil, Plus, RefreshCcw, ShieldCheck, Sparkles, StretchHorizontal, Trash2, TriangleAlert, Users, Wand2, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { EASE, SPRING, TiltCard } from "@/components/motion/kit";
import { OfferCardThemed, StorefrontView } from "@/components/storefront/view";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Badge, DemoTag, Empty, Segmented } from "@/components/ui/kit";
import { useToast } from "@/components/ui/toast";
import { AUDIENCES, claimCheck, draftOffer, GOALS, priceGuide, type AudienceId, type GoalId, type OfferDraft } from "@/lib/ai";
import { byOffer } from "@/lib/analytics";
import { pct, rupees, uid } from "@/lib/format";
import { useDemo } from "@/lib/store";
import { OFFER_TYPES, type Offer, type OfferType } from "@/lib/types";

const GOAL_ICON: Record<GoalId, React.ReactNode> = {
  fat: <Flame size={20} />,
  strength: <Dumbbell size={20} />,
  muscle: <HeartPulse size={20} />,
  return: <Baby size={20} />,
  mobility: <StretchHorizontal size={20} />,
  endurance: <Footprints size={20} />,
};
const TYPE_META: Record<OfferType, { icon: React.ReactNode; body: string }> = {
  "1:1 online coaching": { icon: <Laptop size={18} />, body: "Personal plan, weekly check-ins, messaging" },
  "Small-group program": { icon: <Users size={18} />, body: "Live group sessions for a small cohort" },
  "Hybrid (online + in person)": { icon: <Layers size={18} />, body: "In-person technique + online programming" },
  "Self-paced plan": { icon: <BookOpen size={18} />, body: "A plan clients follow on their own" },
};
const STEPS = ["Goal", "Audience", "Format", "Price", "Generate"];

export function OffersScreen() {
  const params = useSearchParams();
  const router = useRouter();
  const editing = params.get("edit");
  const creating = params.get("new") === "1";
  if (creating || editing) return <Builder key={editing ?? "new"} editId={editing} onExit={() => router.replace("/app/offers")} />;
  return <OfferList onNew={() => router.replace("/app/offers?new=1")} onEdit={(id) => router.replace(`/app/offers?edit=${id}`)} />;
}

/* ------------------------------------------------------------------ list */

function OfferList({ onNew, onEdit }: { onNew: () => void; onEdit: (id: string) => void }) {
  const offers = useDemo((s) => s.offers);
  const leads = useDemo((s) => s.leads);
  const saveOffer = useDemo((s) => s.saveOffer);
  const deleteOffer = useDemo((s) => s.deleteOffer);
  const toast = useToast();
  const stats = useMemo(() => byOffer(leads, offers, { range: "12m", source: "all" }), [leads, offers]);

  return (
    <div className="space-y-5">
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="card relative overflow-hidden p-6 sm:p-8">
        <div className="grid-lines absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_right,#000,transparent_70%)]" aria-hidden />
        <div className="lime-glow absolute -right-24 -top-24 h-72 w-72" aria-hidden />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <Badge tone="lime">
              <Sparkles size={12} /> AI Offer Builder
            </Badge>
            <h2 className="mt-3 text-[26px] font-semibold leading-tight tracking-[-0.03em] sm:text-[30px]">Turn what you know into an offer people understand.</h2>
            <p className="mt-2 text-[14.5px] leading-relaxed text-fg-2">Answer four quick questions. You&apos;ll get a structured offer with a title, description, benefits and pricing guidance that you can edit and publish to your storefront.</p>
          </div>
          <Button size="lg" onClick={onNew} className="shrink-0">
            <Wand2 size={17} /> Create an offer
          </Button>
        </div>
      </motion.section>

      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[17px] font-semibold">Your offers</h3>
        <DemoTag>Stats: sample data · 12 months</DemoTag>
      </div>

      {offers.length === 0 ? (
        <Empty icon={<Sparkles size={20} />} title="No offers yet" body="Create your first offer with the AI builder. It takes about two minutes." action={<Button onClick={onNew}>Create an offer</Button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {offers.map((o, i) => {
            const st = stats.find((x) => x.id === o.id);
            return (
              <motion.article key={o.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: i * 0.05 }} className="card panel-sheen flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <Badge tone={o.status === "live" ? "ok" : "neutral"} dot>
                    {o.status === "live" ? "Live on storefront" : "Draft"}
                  </Badge>
                  {o.aiDrafted && (
                    <Badge tone="lime">
                      <Sparkles size={11} /> AI-drafted
                    </Badge>
                  )}
                </div>
                <h4 className="mt-3 text-[18px] font-semibold leading-snug">{o.title}</h4>
                <p className="mt-1 line-clamp-2 text-[13.5px] leading-relaxed text-fg-2">{o.tagline}</p>
                <p className="mt-3 text-[13px] text-fg-3">
                  {o.type} · {o.weeks} weeks
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-line bg-panel-2/50 p-3 text-center">
                  <div>
                    <p className="font-display text-[16px] font-semibold tabular">{rupees(o.price)}</p>
                    <p className="text-[11.5px] text-fg-3">Price</p>
                  </div>
                  <div>
                    <p className="font-display text-[16px] font-semibold tabular">{st?.leads ?? 0}</p>
                    <p className="text-[11.5px] text-fg-3">Leads</p>
                  </div>
                  <div>
                    <p className="font-display text-[16px] font-semibold tabular">{pct(st?.conversion ?? null, 0)}</p>
                    <p className="text-[11.5px] text-fg-3">Converted</p>
                  </div>
                </div>
                <div className="mt-auto flex items-center gap-2 pt-4">
                  <Button variant="secondary" size="sm" onClick={() => onEdit(o.id)}>
                    <Pencil size={14} /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      saveOffer({ ...o, status: o.status === "live" ? "draft" : "live" });
                      toast({ tone: "success", title: o.status === "live" ? "Removed from storefront" : "Published to storefront", body: o.title });
                    }}
                  >
                    {o.status === "live" ? "Unpublish" : "Publish"}
                  </Button>
                  <button
                    onClick={() => {
                      if (!confirm(`Delete "${o.title}"?`)) return;
                      deleteOffer(o.id);
                      toast({ tone: "info", title: "Offer deleted" });
                    }}
                    className="ml-auto grid h-9 w-9 place-items-center rounded-full text-fg-3 transition hover:bg-bad/10 hover:text-bad"
                    aria-label={`Delete ${o.title}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </motion.article>
            );
          })}
          <button onClick={onNew} className="group grid min-h-[280px] place-items-center rounded-3xl border border-dashed border-line-2 text-fg-3 transition hover:border-lime/50 hover:text-fg">
            <span className="flex flex-col items-center gap-2 text-[14px] font-medium">
              <span className="grid h-11 w-11 place-items-center rounded-2xl border border-line bg-panel transition group-hover:border-lime/40 group-hover:text-lime">
                <Plus size={20} />
              </span>
              New offer with AI
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ builder */

type BuilderInput = { goal: GoalId | null; audience: AudienceId | null; type: OfferType | null; weeks: number; price: string };

function Builder({ editId, onExit }: { editId: string | null; onExit: () => void }) {
  const existing = useDemo((s) => s.offers.find((o) => o.id === editId));
  const saveOffer = useDemo((s) => s.saveOffer);
  const storefront = useDemo((s) => s.storefront);
  const toast = useToast();
  const [step, setStep] = useState(existing ? 5 : 0);
  const [input, setInput] = useState<BuilderInput>(() =>
    existing ? { goal: guessGoal(existing.goal), audience: guessAudience(existing.audience), type: existing.type, weeks: existing.weeks, price: String(existing.price) } : { goal: null, audience: null, type: null, weeks: 12, price: "" },
  );
  const [draft, setDraft] = useState<OfferDraft | null>(existing ? { title: existing.title, tagline: existing.tagline, description: existing.description, benefits: existing.benefits, cta: existing.cta } : null);
  const [variant, setVariant] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [preview, setPreview] = useState<"card" | "page">("card");

  const price = Number(input.price.replace(/[^\d]/g, ""));
  const guide = input.type ? priceGuide(input.type, input.weeks, price || undefined) : null;
  const canNext = [!!input.goal, !!input.audience, !!input.type, !!price && !priceError, true][Math.min(step, 4)];

  const validatePrice = (v: string) => {
    const n = Number(v.replace(/[^\d]/g, ""));
    if (!v.trim()) return "Enter a price.";
    if (!Number.isFinite(n) || n < 499) return "Minimum ₹499.";
    if (n > 200000) return "Maximum ₹2,00,000 for this demo.";
    return null;
  };

  const generate = (v = variant) => {
    if (!input.goal || !input.audience || !input.type) return;
    setGenerating(true);
    setDraft(null);
    setStep(5);
    setTimeout(() => {
      setDraft(draftOffer({ goal: input.goal!, audience: input.audience!, type: input.type!, weeks: input.weeks, price }, v));
      setGenerating(false);
    }, 2600);
  };

  const save = (status: "live" | "draft") => {
    if (!draft) return;
    if (draft.title.trim().length < 4) return toast({ tone: "error", title: "Add a title", body: "Your offer needs a title of at least 4 characters." });
    if (draft.benefits.filter((b) => b.trim()).length < 2) return toast({ tone: "error", title: "Add at least two benefits" });
    if (price < 499) return toast({ tone: "error", title: "Check the price", body: "Minimum ₹499." });
    const offer: Offer = {
      id: existing?.id ?? uid("off"),
      title: draft.title.trim(),
      tagline: draft.tagline.trim(),
      description: draft.description.trim(),
      benefits: draft.benefits.map((b) => b.trim()).filter(Boolean),
      cta: draft.cta.trim() || "Book a free call",
      type: input.type ?? existing!.type,
      goal: GOALS.find((g) => g.id === input.goal)?.label ?? existing?.goal ?? "Fitness",
      audience: AUDIENCES.find((a) => a.id === input.audience)?.label ?? existing?.audience ?? "",
      price,
      weeks: input.weeks,
      status,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      aiDrafted: existing ? existing.aiDrafted : true,
    };
    saveOffer(offer);
    toast({ tone: "success", title: status === "live" ? "Published to your storefront" : "Saved as draft", body: offer.title });
    onExit();
  };

  const previewOffer: Offer | null = draft ? { id: "preview", ...draft, type: input.type ?? "1:1 online coaching", goal: "", audience: "", price: price || 0, weeks: input.weeks, status: "live", createdAt: "" } : null;
  const warnings = draft ? claimCheck(`${draft.title} ${draft.tagline} ${draft.description} ${draft.benefits.join(" ")}`) : [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={onExit} className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-fg-2 transition hover:text-fg">
          <ArrowLeft size={15} /> All offers
        </button>
        <DemoTag>Simulated AI · no model is called</DemoTag>
      </div>

      {/* Stepper */}
      <ol className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:px-0" aria-label="Progress">
        {STEPS.map((label, i) => {
          const done = i < step || (i === 4 && !!draft);
          const active = i === Math.min(step, 4) && !draft;
          return (
            <li key={label} className="flex shrink-0 items-center gap-2">
              <button
                disabled={i > step && !draft}
                onClick={() => setStep(i)}
                className={cn("flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-medium transition disabled:cursor-not-allowed disabled:opacity-50", active ? "border-lime/50 bg-lime/10 text-fg" : done ? "border-line bg-panel text-fg-2 hover:border-line-2" : "border-line text-fg-3")}
                aria-current={active ? "step" : undefined}
              >
                <span className={cn("grid h-5 w-5 place-items-center rounded-full text-[11px] font-semibold", done ? "bg-lime text-lime-ink" : active ? "bg-fg text-bg" : "bg-panel-2 text-fg-3")}>{done ? <Check size={12} /> : i + 1}</span>
                {label}
              </button>
              {i < STEPS.length - 1 && <span className="h-px w-5 bg-line-2" aria-hidden />}
            </li>
          );
        })}
      </ol>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,440px)]">
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            {step < 5 ? (
              <motion.div key={`s${step}`} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3, ease: EASE }} className="card p-5 sm:p-7">
                {step === 0 && (
                  <StepFrame n={1} title="What result does this offer deliver?" sub="Pick the outcome your clients care about most.">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {GOALS.map((g) => (
                        <ChoiceCard key={g.id} selected={input.goal === g.id} onClick={() => setInput({ ...input, goal: g.id })} icon={GOAL_ICON[g.id]} title={g.label} body={g.hint} />
                      ))}
                    </div>
                  </StepFrame>
                )}
                {step === 1 && (
                  <StepFrame n={2} title="Who is it for?" sub="Specific audiences convert better than “everyone”.">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {AUDIENCES.map((a) => (
                        <ChoiceCard key={a.id} selected={input.audience === a.id} onClick={() => setInput({ ...input, audience: a.id })} title={a.label} compact />
                      ))}
                    </div>
                  </StepFrame>
                )}
                {step === 2 && (
                  <StepFrame n={3} title="How will you deliver it?" sub="Choose a format and program length.">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {OFFER_TYPES.map((t) => (
                        <ChoiceCard key={t} selected={input.type === t} onClick={() => setInput({ ...input, type: t })} icon={TYPE_META[t].icon} title={t} body={TYPE_META[t].body} />
                      ))}
                    </div>
                    <div className="mt-6">
                      <p className="mb-2 text-[13px] font-medium text-fg-2">Program length</p>
                      <div className="-mx-1 overflow-x-auto px-1 scrollbar-none">
                        <Segmented label="Program length in weeks" value={String(input.weeks)} onChange={(v) => setInput({ ...input, weeks: Number(v) })} options={[4, 6, 8, 10, 12, 16].map((w) => ({ id: String(w), label: `${w} wk` }))} />
                      </div>
                    </div>
                  </StepFrame>
                )}
                {step === 3 && input.type && guide && (
                  <StepFrame n={4} title="What will you charge?" sub={`For a ${input.weeks}-week ${input.type.toLowerCase()}.`}>
                    <div className="max-w-sm">
                      <Field label="Price (₹, one-time)" htmlFor="price" error={priceError ?? undefined}>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-display text-[18px] text-fg-3">₹</span>
                          <Input
                            id="price"
                            inputMode="numeric"
                            value={price ? price.toLocaleString("en-IN") : ""}
                            onChange={(e) => {
                              const v = e.target.value.replace(/[^\d]/g, "").slice(0, 7);
                              setInput({ ...input, price: v });
                              setPriceError(v ? validatePrice(v) : null);
                            }}
                            onBlur={() => setPriceError(validatePrice(input.price))}
                            placeholder={guide.low.toLocaleString("en-IN")}
                            className="h-14 pl-9 font-display text-[22px] font-semibold"
                            aria-invalid={!!priceError}
                          />
                        </div>
                      </Field>
                    </div>
                    <PriceGuide low={guide.low} high={guide.high} price={price} verdict={guide.verdict} onUse={(v) => (setInput({ ...input, price: String(v) }), setPriceError(null))} />
                  </StepFrame>
                )}
                {step === 4 && (
                  <StepFrame n={5} title="Ready to draft your offer" sub="Review your answers, then generate.">
                    <dl className="grid gap-2 sm:grid-cols-2">
                      {[
                        ["Goal", GOALS.find((g) => g.id === input.goal)?.label],
                        ["Audience", AUDIENCES.find((a) => a.id === input.audience)?.label],
                        ["Format", `${input.type} · ${input.weeks} weeks`],
                        ["Price", rupees(price)],
                      ].map(([k, v], i) => (
                        <button key={k} onClick={() => setStep(i)} className="group flex items-center justify-between rounded-2xl border border-line bg-panel-2/50 px-4 py-3 text-left transition hover:border-line-2">
                          <span>
                            <dt className="text-[12px] text-fg-3">{k}</dt>
                            <dd className="text-[14.5px] font-medium">{v}</dd>
                          </span>
                          <Pencil size={14} className="text-fg-3 opacity-0 transition group-hover:opacity-100" />
                        </button>
                      ))}
                    </dl>
                    <Button size="lg" className="mt-6 w-full sm:w-auto" onClick={() => generate()}>
                      <Sparkles size={17} /> Generate offer
                    </Button>
                  </StepFrame>
                )}
                <div className="mt-7 flex items-center justify-between border-t border-line pt-5">
                  <Button variant="ghost" onClick={() => (step === 0 ? onExit() : setStep(step - 1))}>
                    <ArrowLeft size={15} /> {step === 0 ? "Cancel" : "Back"}
                  </Button>
                  {step < 4 && (
                    <Button
                      disabled={!canNext}
                      onClick={() => {
                        if (step === 3) {
                          const err = validatePrice(input.price);
                          setPriceError(err);
                          if (err) return;
                        }
                        setStep(step + 1);
                      }}
                    >
                      Continue <ArrowRight size={15} />
                    </Button>
                  )}
                </div>
              </motion.div>
            ) : generating ? (
              <motion.div key="gen" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3, ease: EASE }}>
                <Generating />
              </motion.div>
            ) : draft ? (
              <motion.div key="edit" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.45, ease: EASE }} className="card p-5 sm:p-7">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-[20px] font-semibold">{existing ? "Edit offer" : "Your draft offer"}</h2>
                    <p className="mt-0.5 text-[13.5px] text-fg-3">Everything is editable. Make it sound like you.</p>
                  </div>
                  {input.goal && input.audience && input.type && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        const v = variant + 1;
                        setVariant(v);
                        generate(v);
                      }}
                    >
                      <RefreshCcw size={14} /> Regenerate
                    </Button>
                  )}
                </div>
                <div className="space-y-4">
                  <Field label="Title" htmlFor="o-title" error={draft.title.trim().length < 4 ? "At least 4 characters." : undefined}>
                    <Input id="o-title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="font-display text-[17px] font-semibold" maxLength={70} />
                  </Field>
                  <Field label="Tagline" htmlFor="o-tag" hint={`${draft.tagline.length}/140`}>
                    <Input id="o-tag" value={draft.tagline} onChange={(e) => setDraft({ ...draft, tagline: e.target.value })} maxLength={140} />
                  </Field>
                  <Field label="Description" htmlFor="o-desc">
                    <Textarea id="o-desc" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="min-h-[130px]" />
                  </Field>
                  <div>
                    <p className="mb-1.5 pl-1 text-[13px] font-medium text-fg-2">What&apos;s included</p>
                    <ul className="space-y-2">
                      <AnimatePresence initial={false}>
                        {draft.benefits.map((b, i) => (
                          <motion.li key={i} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2">
                            <GripVertical size={14} className="shrink-0 text-fg-3" aria-hidden />
                            <Input value={b} onChange={(e) => setDraft({ ...draft, benefits: draft.benefits.map((x, j) => (j === i ? e.target.value : x)) })} className="h-11 text-[14px]" aria-label={`Benefit ${i + 1}`} />
                            <button onClick={() => setDraft({ ...draft, benefits: draft.benefits.filter((_, j) => j !== i) })} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-fg-3 transition hover:bg-panel-2 hover:text-bad" aria-label={`Remove benefit ${i + 1}`}>
                              <X size={15} />
                            </button>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>
                    {draft.benefits.length < 6 && (
                      <button onClick={() => setDraft({ ...draft, benefits: [...draft.benefits, ""] })} className="mt-2 inline-flex items-center gap-1.5 pl-6 text-[13px] font-medium text-lime hover:underline">
                        <Plus size={14} /> Add benefit
                      </button>
                    )}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Call to action" htmlFor="o-cta">
                      <Input id="o-cta" value={draft.cta} onChange={(e) => setDraft({ ...draft, cta: e.target.value })} maxLength={36} />
                    </Field>
                    <Field label="Price (₹)" htmlFor="o-price" error={price < 499 ? "Minimum ₹499." : undefined}>
                      <Input id="o-price" inputMode="numeric" value={price ? price.toLocaleString("en-IN") : ""} onChange={(e) => setInput({ ...input, price: e.target.value.replace(/[^\d]/g, "").slice(0, 7) })} />
                    </Field>
                  </div>
                  <div className={cn("flex items-start gap-3 rounded-2xl border px-4 py-3 text-[13px]", warnings.length ? "border-warn/30 bg-warn/10 text-warn" : "border-ok/25 bg-ok/[.07] text-ok")} role="status">
                    {warnings.length ? <TriangleAlert size={16} className="mt-0.5 shrink-0" /> : <ShieldCheck size={16} className="mt-0.5 shrink-0" />}
                    <p>
                      {warnings.length ? (
                        <>Claims check: avoid wording like &ldquo;{warnings.join("”, “")}&rdquo;. Guarantees and medical claims mislead clients.</>
                      ) : (
                        <>Claims check passed: no guaranteed results, medical or “miracle” language.</>
                      )}
                    </p>
                  </div>
                </div>
                <div className="mt-7 flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:justify-end">
                  <Button variant="ghost" onClick={onExit}>
                    Discard
                  </Button>
                  <Button variant="secondary" onClick={() => save("draft")}>
                    Save as draft
                  </Button>
                  <Button onClick={() => save("live")}>
                    <CheckCircle2 size={16} /> Publish to storefront
                  </Button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <aside className="min-w-0 xl:sticky xl:top-24 xl:self-start">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-[13px] font-medium text-fg-2">
              <Eye size={15} /> Live preview
            </p>
            <Segmented label="Preview type" size="sm" value={preview} onChange={setPreview} options={[{ id: "card", label: "Offer card" }, { id: "page", label: "On storefront", icon: <MonitorSmartphone size={13} /> }]} />
          </div>
          {previewOffer && !generating ? (
            preview === "card" ? (
              <motion.div initial={{ opacity: 0, rotateY: -18, y: 20 }} animate={{ opacity: 1, rotateY: 0, y: 0 }} transition={{ duration: 0.8, ease: EASE }} style={{ transformPerspective: 1400 }}>
                <TiltCard max={5} className="rounded-[28px]">
                  <OfferCardThemed offer={previewOffer} theme={storefront.theme} highlight />
                </TiltCard>
              </motion.div>
            ) : (
              <div className="h-[600px] overflow-hidden rounded-[28px] border border-line">
                <div className="h-full overflow-y-auto">
                  <StorefrontView sf={storefront} offers={[previewOffer]} preview />
                </div>
              </div>
            )
          ) : (
            <div className="relative grid h-[440px] place-items-center overflow-hidden rounded-[28px] border border-dashed border-line-2 p-8 text-center">
              <div className="dots dots-fade absolute inset-0" aria-hidden />
              <div className="relative">
                <SkeletonOffer animate={generating} />
                <p className="mt-5 text-[13.5px] text-fg-3">{generating ? "Drafting your offer…" : "Your offer preview appears here once it's generated."}</p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function StepFrame({ n, title, sub, children }: { n: number; title: string; sub: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow">Step {n} of 5</p>
      <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.025em] sm:text-[24px]">{title}</h2>
      <p className="mt-1 text-[14px] text-fg-2">{sub}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function ChoiceCard({ selected, onClick, icon, title, body, compact }: { selected: boolean; onClick: () => void; icon?: React.ReactNode; title: string; body?: string; compact?: boolean }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      aria-pressed={selected}
      className={cn("relative flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors", compact && "items-center py-3.5", selected ? "border-lime/60 bg-lime/[.07]" : "border-line bg-panel-2/40 hover:border-line-2 hover:bg-panel-2")}
    >
      {icon && <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-colors", selected ? "border-lime/40 bg-lime text-lime-ink" : "border-line bg-panel text-fg-2")}>{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-semibold">{title}</span>
        {body && <span className="mt-0.5 block text-[13px] leading-snug text-fg-3">{body}</span>}
      </span>
      <AnimatePresence>
        {selected && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={SPRING} className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-lime text-lime-ink">
            <Check size={12} strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function PriceGuide({ low, high, price, verdict, onUse }: { low: number; high: number; price: number; verdict: "below" | "within" | "above" | null; onUse: (v: number) => void }) {
  const min = Math.round(low * 0.5);
  const max = Math.round(high * 1.5);
  const pos = (v: number) => `${Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100))}%`;
  const mid = Math.round((low + high) / 2 / 500) * 500 - 1;
  return (
    <div className="mt-6 rounded-2xl border border-line bg-panel-2/40 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-[13.5px] font-semibold">
          <Sparkles size={14} className="text-lime" /> Suggested range: {rupees(low)} – {rupees(high)}
        </p>
        <button onClick={() => onUse(mid)} className="text-[12.5px] font-medium text-lime hover:underline">
          Use {rupees(mid)}
        </button>
      </div>
      <div className="relative mt-5 h-2 rounded-full bg-line">
        <div className="absolute inset-y-0 rounded-full bg-lime/40" style={{ left: pos(low), right: `calc(100% - ${pos(high)})` }} />
        {price > 0 && <motion.div className="absolute -top-1.5 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-bg bg-lime shadow-glow" animate={{ left: pos(price) }} transition={SPRING} aria-hidden />}
      </div>
      <p className="mt-4 text-[13px] leading-relaxed text-fg-2">
        {verdict === "below"
          ? "You're below the typical range for this format. Underpricing can signal low value. Consider adding a bonus or raising the price."
          : verdict === "above"
            ? "You're above the typical range. That can work: make the premium obvious with extra access, in-person time or a specialist focus."
            : verdict === "within"
              ? "Nicely within the typical range for this format and length."
              : "Based on typical per-week rates for this format. These are illustrative assumptions in the demo, not market data."}
      </p>
    </div>
  );
}

function Generating() {
  const steps = ["Reading your goal, audience and format", "Structuring the program and what's included", "Writing the title, description and call to action", "Checking for guarantees and medical claims"];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => Math.min(steps.length, x + 1)), 620);
    return () => clearInterval(t);
  }, [steps.length]);
  return (
    <div className="card relative overflow-hidden p-6 sm:p-8" role="status" aria-live="polite">
      <div className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,#000,transparent)]">
        <motion.div className="absolute -left-1/3 top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-lime/[.08] to-transparent" animate={{ x: ["0%", "400%"] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} />
      </div>
      <div className="relative flex items-center gap-3">
        <motion.span className="grid h-11 w-11 place-items-center rounded-2xl bg-lime text-lime-ink" animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.06, 1] }} transition={{ duration: 1.6, repeat: Infinity }}>
          <Sparkles size={20} />
        </motion.span>
        <div>
          <p className="text-[17px] font-semibold">Drafting your offer</p>
          <p className="text-[13px] text-fg-3">Simulated generation · takes a few seconds</p>
        </div>
      </div>
      <ol className="relative mt-7 space-y-3.5">
        {steps.map((s, k) => {
          const done = k < i;
          const active = k === i;
          return (
            <motion.li key={s} initial={{ opacity: 0, x: -8 }} animate={{ opacity: k <= i ? 1 : 0.35, x: 0 }} transition={{ delay: k * 0.08 }} className="flex items-center gap-3 text-[14px]">
              <span className={cn("grid h-6 w-6 place-items-center rounded-full border transition-colors", done ? "border-lime bg-lime text-lime-ink" : active ? "border-lime/60" : "border-line-2")}>
                {done ? <Check size={13} strokeWidth={3} /> : active ? <span className="h-2 w-2 animate-pulse-dot rounded-full bg-lime" /> : null}
              </span>
              <span className={done ? "text-fg" : active ? "text-fg-2" : "text-fg-3"}>{s}</span>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}

function SkeletonOffer({ animate }: { animate: boolean }) {
  return (
    <div className={cn("mx-auto w-64 space-y-3 rounded-3xl border border-line bg-panel p-5 text-left", animate && "animate-pulse")}>
      <div className="h-3 w-20 rounded-full bg-line-2" />
      <div className="h-5 w-48 rounded-full bg-line-2" />
      <div className="h-3 w-full rounded-full bg-line" />
      <div className="h-3 w-5/6 rounded-full bg-line" />
      <div className="space-y-2 pt-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-lime/40" />
            <div className="h-2.5 flex-1 rounded-full bg-line" />
          </div>
        ))}
      </div>
      <div className="h-9 w-full rounded-full bg-lime/30" />
    </div>
  );
}

function guessGoal(goal: string): GoalId {
  const g = goal.toLowerCase();
  if (g.includes("fat")) return "fat";
  if (g.includes("muscle")) return "muscle";
  if (g.includes("return")) return "return";
  if (g.includes("mobil") || g.includes("pain")) return "mobility";
  if (g.includes("run")) return "endurance";
  return "strength";
}
function guessAudience(a: string): AudienceId {
  const x = a.toLowerCase();
  if (x.includes("mother")) return "mothers";
  if (x.includes("beginner")) return "beginners";
  if (x.includes("women")) return "women30";
  if (x.includes("40")) return "over40";
  if (x.includes("student")) return "students";
  return "desk";
}
