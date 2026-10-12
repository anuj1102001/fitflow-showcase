"use client";

import { ArrowLeft, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import { MEERA, MEERA_OFFERS } from "@/lib/storefronts";
import { useDemo, useHydrated } from "@/lib/store";
import { StorefrontView } from "./view";

/** Public storefront page. Aarav's reads the demo store (so builder edits show up); Meera's is a fixed sample. */
export function PublicStorefront({ slug }: { slug: "aarav" | "meera" }) {
  const hydrated = useHydrated();
  const sf = useDemo((s) => s.storefront);
  const offers = useDemo((s) => s.offers);
  const submitEnquiry = useDemo((s) => s.submitEnquiry);
  const toast = useToast();

  if (slug === "aarav" && !hydrated) return <div className="min-h-dvh bg-[#0b0c0e]" aria-busy="true" />;
  const live = slug === "aarav" ? sf.offerIds.map((id) => offers.find((o) => o.id === id)).filter((o): o is NonNullable<typeof o> => !!o && o.status === "live") : MEERA_OFFERS;

  return (
    <div className="relative min-h-dvh">
      <StorefrontView
        sf={slug === "aarav" ? sf : MEERA}
        offers={live}
        preview={slug === "meera"}
        onEnquire={(v) => {
          submitEnquiry(v);
          toast({ tone: "success", title: "New lead in the dashboard", body: `${v.name} was added to Aarav's pipeline.` });
        }}
      />
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-[#121417]/90 p-1 pl-3 text-[12.5px] text-[#c9ccc4] shadow-[0_20px_50px_-15px_rgba(0,0,0,.6)] backdrop-blur-xl">
          <span className="mr-1 hidden sm:inline">Demo storefront · fictional coach</span>
          <Link href="/" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium text-[#f2f3ee] transition hover:bg-white/10">
            <ArrowLeft size={13} /> FITFLOW
          </Link>
          {slug === "aarav" && (
            <Link href="/app/storefront" className="inline-flex items-center gap-1.5 rounded-full bg-[#c8f04a] px-3 py-1.5 font-semibold text-[#0c0e06] transition hover:brightness-105">
              <LayoutDashboard size={13} /> Edit in dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
