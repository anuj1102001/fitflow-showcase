"use client";

import { AnimatePresence, motion } from "motion/react";
import { Box, Check, CheckCircle2, Copy, ExternalLink, Monitor, Smartphone } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { EASE, SPRING } from "@/components/motion/kit";
import { BrowserFrame, PhoneFrame } from "@/components/storefront/frames";
import { StorefrontView, THEME_META } from "@/components/storefront/view";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Field, Input, Switch, Textarea } from "@/components/ui/field";
import { Panel, Segmented } from "@/components/ui/kit";
import { useToast } from "@/components/ui/toast";
import { IMAGES } from "@/lib/images";
import { HERO_OPTIONS } from "@/lib/storefronts";
import { useDemo } from "@/lib/store";
import type { StorefrontTheme } from "@/lib/types";

const HEROES = [...HERO_OPTIONS, { id: "yoga", label: "Outdoor yoga", src: IMAGES.coachMeera }];

export function StorefrontScreen() {
  const sf = useDemo((s) => s.storefront);
  const offers = useDemo((s) => s.offers);
  const update = useDemo((s) => s.updateStorefront);
  const toast = useToast();
  const [device, setDevice] = useState<"both" | "desktop" | "mobile">("both");
  const [saved, setSaved] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setSaved(true);
    const t = setTimeout(() => setSaved(false), 1600);
    return () => clearTimeout(t);
  }, [sf]);

  const live = sf.offerIds.map((id) => offers.find((o) => o.id === id)).filter((o): o is NonNullable<typeof o> => !!o && o.status === "live");
  const view = <StorefrontView sf={sf} offers={live} preview />;
  const url = "fitflow.demo/s/aarav";

  return (
    <div className="grid gap-5 xl:grid-cols-[400px_minmax(0,1fr)]">
      {/* Controls */}
      <div className="space-y-5">
        <Panel title="Theme" subtitle="Switch and watch the preview update">
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(THEME_META) as StorefrontTheme[]).map((t) => {
              const m = THEME_META[t];
              const on = sf.theme === t;
              return (
                <button
                  key={t}
                  onClick={() => update({ theme: t, heroImage: t === "bloom" && sf.heroImage === IMAGES.coachAarav ? IMAGES.coachMeera : t === "forge" && sf.heroImage === IMAGES.coachMeera ? IMAGES.coachAarav : sf.heroImage })}
                  aria-pressed={on}
                  className={cn("relative overflow-hidden rounded-2xl border p-3 text-left transition", on ? "border-lime-fg/60 bg-lime/[.06]" : "border-line hover:border-line-2")}
                >
                  <div className="flex h-16 overflow-hidden rounded-xl" aria-hidden>
                    {m.swatches.map((c) => (
                      <span key={c} className="flex-1" style={{ background: c }} />
                    ))}
                  </div>
                  <p className={cn("mt-2.5 text-[14px] font-semibold", t === "bloom" && "font-[family-name:var(--font-fraunces)] italic")}>{m.name}</p>
                  <p className="mt-0.5 text-[12px] leading-snug text-fg-3">{m.blurb}</p>
                  <AnimatePresence>
                    {on && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={SPRING} className="absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-full bg-lime text-lime-ink">
                        <Check size={12} strokeWidth={3} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>
        </Panel>

        <Panel title="Content">
          <div className="space-y-4">
            <Field label="Headline" htmlFor="sf-h" hint={`${sf.headline.length}/70`} error={sf.headline.trim().length < 6 ? "Add a headline (6+ characters)." : undefined}>
              <Input id="sf-h" value={sf.headline} maxLength={70} onChange={(e) => update({ headline: e.target.value })} />
            </Field>
            <Field label="About you" htmlFor="sf-b" hint={`${sf.bio.length}/280`}>
              <Textarea id="sf-b" value={sf.bio} maxLength={280} onChange={(e) => update({ bio: e.target.value })} className="min-h-[110px]" />
            </Field>
            <Field label="Button label" htmlFor="sf-c">
              <Input id="sf-c" value={sf.ctaLabel} maxLength={32} onChange={(e) => update({ ctaLabel: e.target.value })} />
            </Field>
            <div>
              <p className="mb-2 pl-1 text-[13px] font-medium text-fg-2">Hero photo</p>
              <div className="grid grid-cols-5 gap-2">
                {HEROES.map((h) => (
                  <button key={h.id} onClick={() => update({ heroImage: h.src })} aria-pressed={sf.heroImage === h.src} aria-label={h.label} title={h.label} className={cn("relative aspect-square overflow-hidden rounded-xl border-2 transition", sf.heroImage === h.src ? "border-lime-fg" : "border-transparent opacity-70 hover:opacity-100")}>
                    <img src={h.src.replace("w=1400", "w=160")} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
              <p className="mt-2 pl-1 text-[12px] text-fg-3">Photos: Unsplash (demo). Coaches would upload their own.</p>
            </div>
          </div>
        </Panel>

        <Panel title="Sections & programs">
          <div className="space-y-3">
            {[
              { k: "showTestimonials" as const, label: "Client stories", sub: "Fictional in this demo" },
              { k: "showFaq" as const, label: "FAQ", sub: "Common questions" },
            ].map((x) => (
              <div key={x.k} className="flex items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3">
                <div>
                  <p className="text-[14px] font-medium">{x.label}</p>
                  <p className="text-[12px] text-fg-3">{x.sub}</p>
                </div>
                <Switch checked={sf[x.k]} onChange={(v) => update({ [x.k]: v })} label={`Show ${x.label}`} />
              </div>
            ))}
            <p className="pl-1 pt-2 text-[13px] font-medium text-fg-2">Programs shown</p>
            {offers.map((o) => {
              const on = sf.offerIds.includes(o.id);
              const disabled = o.status !== "live";
              return (
                <label key={o.id} className={cn("flex items-center gap-3 rounded-2xl border px-4 py-3 transition", disabled ? "border-dashed border-line opacity-60" : on ? "border-lime-fg/40 bg-lime/[.04]" : "border-line hover:border-line-2")}>
                  <input
                    type="checkbox"
                    disabled={disabled}
                    checked={on && !disabled}
                    onChange={() => update({ offerIds: on ? sf.offerIds.filter((x) => x !== o.id) : [...sf.offerIds, o.id] })}
                    className="h-4 w-4 accent-[rgb(var(--lime))]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium">{o.title}</span>
                    <span className="block text-[12px] text-fg-3">{disabled ? "Draft: publish it in Offer Builder" : `${o.weeks} weeks`}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* Preview */}
      <div className="min-w-0 space-y-4 xl:sticky xl:top-24 xl:self-start">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Segmented
              label="Preview device"
              value={device}
              onChange={setDevice}
              options={[
                { id: "both", label: "3D", icon: <Box size={14} /> },
                { id: "desktop", label: "Desktop", icon: <Monitor size={14} /> },
                { id: "mobile", label: "Mobile", icon: <Smartphone size={14} /> },
              ]}
            />
            <AnimatePresence>
              {saved && (
                <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1 text-[12.5px] text-ok" role="status">
                  <CheckCircle2 size={14} /> Saved
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard?.writeText(`${window.location.origin}/s/aarav`);
                toast({ tone: "success", title: "Link copied", body: "Share it in your Instagram bio." });
              }}
              className={buttonClass({ variant: "secondary", size: "sm" })}
            >
              <Copy size={14} /> Copy link
            </button>
            <Link href="/s/aarav" target="_blank" className={buttonClass({ size: "sm" })}>
              <ExternalLink size={14} /> View live page
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-line bg-[radial-gradient(ellipse_at_top,rgb(var(--lime)/.07),transparent_60%),rgb(var(--panel))] p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {device === "desktop" && (
              <motion.div key="d" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35, ease: EASE }} className="relative">
                <BrowserFrame url={url} height={620}>
                  {view}
                </BrowserFrame>
              </motion.div>
            )}
            {device === "mobile" && (
              <motion.div key="m" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35, ease: EASE }} className="relative flex justify-center py-2">
                <PhoneFrame height={680} width={340}>
                  {view}
                </PhoneFrame>
              </motion.div>
            )}
            {device === "both" && (
              <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="relative h-[640px] [perspective:2200px]">
                <motion.div
                  className="absolute left-0 top-6 w-[88%] [transform-style:preserve-3d]"
                  initial={{ rotateY: 0, rotateX: 0, z: 0 }}
                  animate={{ rotateY: 14, rotateX: 4, z: -60 }}
                  transition={{ duration: 1, ease: EASE }}
                  style={{ transformOrigin: "left center" }}
                >
                  <BrowserFrame url={url} height={520}>
                    {view}
                  </BrowserFrame>
                </motion.div>
                <motion.div
                  className="absolute bottom-0 right-2 sm:right-6"
                  initial={{ y: 60, opacity: 0, rotateY: 0 }}
                  animate={{ y: 0, opacity: 1, rotateY: -10 }}
                  transition={{ duration: 1, ease: EASE, delay: 0.15 }}
                  style={{ transformPerspective: 1600 }}
                >
                  <PhoneFrame height={560} width={280}>
                    {view}
                  </PhoneFrame>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <p className="text-[12.5px] text-fg-3">The previews are live: scroll and click inside them. Enquiries from previews don&apos;t create leads; use “View live page” for that.</p>
      </div>
    </div>
  );
}
