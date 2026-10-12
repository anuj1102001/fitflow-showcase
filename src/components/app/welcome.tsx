"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Database, MousePointerClick, Sparkles } from "lucide-react";
import { useState } from "react";
import { EASE } from "@/components/motion/kit";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Avatar, Portal } from "@/components/ui/kit";
import { COACH } from "@/lib/seed";
import { useDemo } from "@/lib/store";

const STEPS = [
  {
    icon: <Avatar name={COACH.name} src={COACH.avatar} size={44} />,
    title: `You're signed in as ${COACH.name}`,
    body: "A fictional strength coach in Bengaluru with a year of sample business data: leads, clients, offers and bookings.",
  },
  {
    icon: <MousePointerClick size={22} />,
    title: "Everything is clickable",
    body: "Add and move leads, draft follow-ups, build an offer with AI, book sessions and restyle the storefront. Press ⌘K / Ctrl K to jump anywhere.",
  },
  {
    icon: <Sparkles size={22} />,
    title: "The AI is simulated",
    body: "AI features use templates and the demo's own data. No model is called and no message is ever sent. Outputs are labelled as simulated.",
  },
  {
    icon: <Database size={22} />,
    title: "Your changes stay in this browser",
    body: "Edits are saved locally so you can refresh and continue. Use “Reset” in the top strip to start fresh at any time.",
  },
];

export function Welcome() {
  const seen = useDemo((s) => s.welcomeSeen);
  const dismiss = useDemo((s) => s.dismissWelcome);
  const [step, setStep] = useState(0);
  const last = step === STEPS.length - 1;
  const s = STEPS[step]!;
  return (
    <Portal>
      <AnimatePresence>
        {!seen && (
          <div className="fixed inset-0 z-[95] grid place-items-center p-4">
            <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="welcome-title"
              initial={{ opacity: 0, y: 24, rotateX: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.5, ease: EASE }}
              style={{ transformPerspective: 1200 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-line bg-panel shadow-pop"
            >
              <div className="relative h-28 overflow-hidden border-b border-line">
                <p className="eyebrow absolute bottom-4 left-6">Welcome to the demo · {step + 1}/{STEPS.length}</p>
              </div>
              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25, ease: EASE }}>
                    <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-line bg-panel-2 text-lime-fg">{s.icon}</div>
                    <h2 id="welcome-title" className="text-[21px] font-semibold">
                      {s.title}
                    </h2>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-fg-2">{s.body}</p>
                  </motion.div>
                </AnimatePresence>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex gap-1.5" aria-hidden>
                    {STEPS.map((_, i) => (
                      <span key={i} className={cn("h-1.5 rounded-full transition-all duration-300", i === step ? "w-6 bg-s1" : "w-1.5 bg-line-2")} />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={dismiss}>
                      Skip
                    </Button>
                    <Button size="sm" onClick={() => (last ? dismiss() : setStep(step + 1))}>
                      {last ? "Start exploring" : "Next"} <ArrowRight size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
