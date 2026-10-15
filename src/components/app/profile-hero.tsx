"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/components/ui/cn";

/**
 * Opening section of the Live Demo: the coach's own profile photo, full-bleed under the top bar,
 * with the greeting on top. It is limited to this section: as you scroll, the photo eases back
 * and fades while the greeting lifts away, and the dashboard takes over.
 *
 * Image order: the storefront profile photo (editable in the Storefront builder), then the small
 * avatar, then a branded backdrop with initials, so it never shows a broken image.
 */
export function ProfileHero({ photo, avatar, initials, children, aside }: { photo?: string; avatar?: string; initials: string; children: React.ReactNode; aside?: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const sources = [photo, avatar].filter(Boolean) as string[];
  const [failed, setFailed] = useState(0);
  const src = sources[failed];

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1.04, 1.16]);
  const imageY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 90]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.25]);
  const contentY = useTransform(scrollYProgress, [0, 0.6], reduce ? [0, 0] : [0, -40]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  return (
    <section
      ref={ref}
      aria-label="Welcome"
      className="relative -mx-4 -mt-5 flex min-h-[64dvh] items-end overflow-hidden sm:-mx-6 lg:-mx-8 lg:min-h-[min(calc(100dvh-7.5rem),760px)]"
    >
      <motion.div aria-hidden className="absolute inset-0" style={{ scale, y: imageY, opacity: imageOpacity }}>
        {src ? (
          <img key={src} src={src} alt="" fetchPriority="high" onError={() => setFailed((n) => n + 1)} className="h-full w-full object-cover object-[50%_30%]" />
        ) : (
          <div className="grid h-full w-full place-items-center bg-[radial-gradient(ellipse_at_30%_20%,rgb(var(--lime)/.35),transparent_55%),linear-gradient(160deg,#1b2410,#0a0b0d)]">
            <span className="text-[22vw] font-bold leading-none tracking-[-0.06em] text-white/10 lg:text-[16vw]">{initials}</span>
          </div>
        )}
      </motion.div>
      {/* Contrast: darker toward the text at the bottom-left, then dissolving into the page background */}
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,7,8,.78)_0%,rgba(6,7,8,.45)_45%,rgba(6,7,8,.1)_100%)]" />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_15%_85%,rgba(6,7,8,.55),transparent_70%)]" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[16%] bg-[linear-gradient(180deg,transparent,rgb(var(--bg)))]" />

      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="theme-dark relative z-10 w-full px-4 pb-16 pt-24 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl text-white [text-shadow:0_1px_18px_rgba(0,0,0,.35)]">{children}</div>
          {aside && <div className="shrink-0">{aside}</div>}
        </div>
      </motion.div>

      <motion.div aria-hidden style={{ opacity: cueOpacity }} className={cn("absolute bottom-3 left-1/2 z-10 hidden -translate-x-1/2 text-fg-3 sm:block", !reduce && "animate-bounce")}>
        <ChevronDown size={18} />
      </motion.div>
    </section>
  );
}
