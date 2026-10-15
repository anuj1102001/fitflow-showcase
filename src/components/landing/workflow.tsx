"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CalendarCheck, Check, ListChecks, MessageCircle, Reply, Sparkles, UserCheck, Users } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/components/ui/cn";
import { Avatar } from "@/components/ui/kit";
import { SectionIntro } from "./sections";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const STEPS = [
  { k: "Capture", icon: Users, t: "Every enquiry lands in one pipeline", b: "Instagram, WhatsApp, your website or a referral: each lead gets a source, a stage and joins the right sequence." },
  { k: "Prioritise", icon: ListChecks, t: "Today tells you who to message", b: "Due sequence steps, people who replied, overdue leads and slipping clients, ranked so the urgent ones come first." },
  { k: "Follow up", icon: MessageCircle, t: "Drafts that show their reasoning", b: "Each draft says what it used and which checks it passed. You edit it and send it yourself; nothing goes out automatically." },
  { k: "Retain", icon: UserCheck, t: "Catch clients before they drift", b: "Weekly check-ins flag falling adherence, and a rescue sequence follows up with a lighter week or a reset call." },
];

/**
 * "How it works": on desktop the section pins and scroll scrubs through the four steps (GSAP ScrollTrigger),
 * swapping the product visual on the right. On small screens or with reduced motion it's a plain list.
 */
export function Workflow() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const panels = gsap.utils.toArray<HTMLElement>("[data-panel]");
        gsap.set(panels.slice(1), { autoAlpha: 0, yPercent: 8, scale: 0.97 });
        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: "[data-stage]",
            start: "top 14%",
            end: () => `+=${window.innerHeight * 2.4}`,
            pin: true,
            scrub: 0.6,
            snap: { snapTo: [0, 1 / 3, 2 / 3, 1], duration: 0.4, ease: "power1.inOut" },
            onUpdate: (self) => setActive(Math.min(3, Math.round(self.progress * 3))),
          },
        });
        tl.to("[data-progress]", { scaleY: 1, ease: "none", duration: 3 }, 0);
        panels.forEach((p, i) => {
          if (i === 0) return;
          tl.to(panels[i - 1]!, { autoAlpha: 0, yPercent: -8, scale: 0.97, duration: 0.5 }, i - 0.5).to(p, { autoAlpha: 1, yPercent: 0, scale: 1, duration: 0.5 }, i - 0.35);
        });
        return () => setActive(0);
      });
    },
    { scope: root },
  );

  return (
    <section id="workflow" ref={root} className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro eyebrow="How it works" title="From audience to paying client, in one flow." body="FITFLOW follows the path a follower takes to become a client, with the right tool at each step." />
        <div data-stage className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
          <ol className="relative space-y-3 lg:space-y-2">
            <div className="absolute bottom-6 left-[19px] top-6 hidden w-px bg-line lg:block" aria-hidden>
              <div data-progress className="h-full w-full origin-top scale-y-0 bg-fg" />
            </div>
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const on = active === i;
              return (
                <li key={s.k} className={cn("relative flex gap-4 rounded-xl p-3 transition-colors duration-300 lg:p-4", on ? "lg:bg-panel lg:shadow-card lg:ring-1 lg:ring-line" : "")}>
                  <span className={cn("relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-[10px] border transition-colors duration-300", on ? "border-fg bg-fg text-bg" : "border-line bg-panel text-fg-2")}>
                    <Icon size={18} />
                  </span>
                  <div>
                    <p className="text-[12.5px] font-medium text-fg-3">
                      {String(i + 1).padStart(2, "0")} · {s.k}
                    </p>
                    <h3 className="mt-1 text-[18px] font-semibold leading-snug">{s.t}</h3>
                    <p className={cn("mt-1.5 text-[14.5px] leading-relaxed text-fg-2 transition-opacity duration-300", !on && "lg:opacity-60")}>{s.b}</p>
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="relative hidden min-h-[440px] lg:block">
            <Panel i={0}>
              <PipelineVisual />
            </Panel>
            <Panel i={1}>
              <TodayVisual />
            </Panel>
            <Panel i={2}>
              <MessageVisual />
            </Panel>
            <Panel i={3}>
              <ClientVisual />
            </Panel>
          </div>
        </div>
      </div>
    </section>
  );
}

function Panel({ i, children }: { i: number; children: React.ReactNode }) {
  return (
    <div data-panel={i} className="absolute inset-0 rounded-2xl border border-line bg-panel p-6 shadow-card">
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-[12.5px] font-medium text-fg-3">{children}</p>;
}

function TodayVisual() {
  const rows = [
    ["Kabir M.", "Replied", "Replied to your sequence · waiting on you", "bg-lime/25 text-lime-fg"],
    ["Rhea K.", "Client", "At risk · 58% adherence last week", "bg-violet-500/15 text-violet-500"],
    ["Priya S.", "Sequence", "New enquiry · step 2 of 4 · 1 day late", "bg-sky-500/15 text-sky-600"],
    ["Tara M.", "Sequence", "Proposal follow-through · step 1 of 3", "bg-sky-500/15 text-sky-600"],
  ];
  return (
    <div className="flex h-full flex-col">
      <Label>Today · 4 people to message</Label>
      <ul className="divide-y divide-line rounded-xl border border-line">
        {rows.map(([n, k, w, cls]) => (
          <li key={n} className="flex items-center gap-3 px-3 py-2.5">
            <Avatar name={n} size={28} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-[13px] font-semibold">
                {n} <span className={cn("rounded-full px-2 py-0.5 text-[10.5px] font-medium", cls)}>{k}</span>
              </p>
              <p className="truncate text-[11.5px] text-fg-3">{w}</p>
            </div>
            <span className="rounded-lg bg-lime px-2.5 py-1 text-[11.5px] font-semibold text-lime-ink">Draft</span>
          </li>
        ))}
      </ul>
      <p className="mt-auto flex items-center gap-1.5 pt-4 text-[12.5px] text-fg-3">
        <Reply size={13} /> Replies jump to the top; sequences pause automatically.
      </p>
    </div>
  );
}

function PipelineVisual() {
  const cols = [
    { h: "New", items: ["Priya S.", "Kabir M."] },
    { h: "Contacted", items: ["Rhea K."] },
    { h: "Call booked", items: ["Sameer P.", "Tara M."] },
  ];
  return (
    <div className="flex h-full flex-col">
      <Label>Leads · Pipeline</Label>
      <div className="grid flex-1 grid-cols-3 gap-3">
        {cols.map((c, i) => (
          <div key={c.h} className="rounded-xl border border-line bg-panel-2/50 p-2.5">
            <p className="mb-2 px-1 text-[12px] font-medium text-fg-2">
              {c.h} <span className="text-fg-3">{c.items.length}</span>
            </p>
            <div className="space-y-2">
              {c.items.map((n, j) => (
                <div key={n} className={cn("rounded-lg border bg-panel p-2.5", i === 0 && j === 0 ? "border-fg/60 shadow-card" : "border-line")}>
                  <div className="flex items-center gap-2">
                    <Avatar name={n} size={22} />
                    <span className="text-[12.5px] font-medium">{n}</span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-fg-3">{["Instagram", "Website", "Referral", "WhatsApp", "Website"][(i * 2 + j) % 5]} · ₹14,999</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MessageVisual() {
  return (
    <div className="flex h-full flex-col">
      <Label>Follow-ups · Draft for Priya</Label>
      <div className="flex flex-wrap gap-2">
        {["Reply to a new enquiry", "Warm", "WhatsApp"].map((x) => (
          <span key={x} className="rounded-md border border-line bg-panel-2 px-2.5 py-1 text-[12px] font-medium text-fg-2">
            {x}
          </span>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-line bg-panel-2/50 p-4 text-[14.5px] leading-relaxed">
        Hi <mark className="rounded-sm bg-lime/30 px-0.5 text-inherit">Priya</mark>! Thanks for reaching out about <mark className="rounded-sm bg-lime/30 px-0.5 text-inherit">your goal to lose 8 kg before your wedding</mark>. Could you tell me a little about your current routine? Then I can suggest the right next step.
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5 text-[11.5px] text-fg-2">
        {["Used: their name", "Used: their own words", "No guarantees", "Ends with a question"].map((x) => (
          <span key={x} className="rounded-full border border-line px-2 py-0.5">
            {x}
          </span>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-between pt-4">
        <span className="flex items-center gap-1.5 text-[12.5px] text-fg-3">
          <Sparkles size={13} /> Draft · never sent automatically
        </span>
        <span className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-fg px-3 text-[12.5px] font-semibold text-bg">
          <Check size={13} /> Copy
        </span>
      </div>
    </div>
  );
}

function ClientVisual() {
  const weeks = [72, 80, 86, 78, 91, 88];
  return (
    <div className="flex h-full flex-col">
      <Label>Clients · Rhea K.</Label>
      <div className="grid grid-cols-3 gap-3">
        {[
          ["Program week", "6 of 12"],
          ["Adherence", "83%"],
          ["Status", "On track"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-line p-3">
            <p className="text-[11.5px] text-fg-3">{k}</p>
            <p className="mt-1 text-[17px] font-semibold">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-1 items-end gap-2 rounded-xl border border-line p-4">
        {weeks.map((w, i) => (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <div className="w-full rounded-t-[4px] bg-s1" style={{ height: `${w * 0.85}%`, opacity: 0.45 + i * 0.1 }} />
            <span className="text-[10.5px] text-fg-3">W{i + 1}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[12.5px] text-fg-3">
        <CalendarCheck size={13} /> Next check-in Sunday, 7 pm
      </p>
    </div>
  );
}
