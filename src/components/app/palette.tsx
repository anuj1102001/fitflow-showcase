"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, CalendarPlus, CornerDownLeft, Search, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { EASE } from "@/components/motion/kit";
import { cn } from "@/components/ui/cn";
import { Avatar, Badge, Portal } from "@/components/ui/kit";
import { useDemo } from "@/lib/store";
import { STAGE_LABEL } from "@/lib/types";
import { useUI } from "@/lib/ui-store";
import { ALL_NAV } from "./nav";

type Item = { id: string; group: string; label: string; hint?: string; icon: React.ReactNode; run: () => void };

/** ⌘K palette: jump to any screen, find a lead, or start a common action. */
export function CommandPalette() {
  const { palette, setPalette, openLeadForm, openBookingForm } = useUI();
  const leads = useDemo((s) => s.leads);
  const router = useRouter();
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (palette) {
      setQ("");
      setI(0);
      setTimeout(() => input.current?.focus(), 30);
    }
  }, [palette]);

  const items = useMemo<Item[]>(() => {
    const go = (href: string) => () => (setPalette(false), router.push(href));
    const term = q.trim().toLowerCase();
    const pages: Item[] = ALL_NAV.map((n) => ({ id: n.href, group: "Go to", label: n.label, hint: n.blurb, icon: <n.icon size={16} />, run: go(n.href) }));
    const actions: Item[] = [
      { id: "a-lead", group: "Actions", label: "Add a lead", icon: <UserPlus size={16} />, run: () => (setPalette(false), openLeadForm()) },
      { id: "a-book", group: "Actions", label: "New booking", icon: <CalendarPlus size={16} />, run: () => (setPalette(false), openBookingForm()) },
      { id: "a-store", group: "Actions", label: "Open my public storefront", icon: <ArrowRight size={16} />, run: () => (setPalette(false), window.open("/s/aarav", "_blank")) },
    ];
    const people: Item[] = term
      ? leads
          .filter((l) => `${l.name} ${l.email} ${l.goal} ${l.source}`.toLowerCase().includes(term))
          .slice(0, 6)
          .map((l) => ({ id: l.id, group: "Leads", label: l.name, hint: `${STAGE_LABEL[l.stage]} · ${l.source}`, icon: <Avatar name={l.name} size={22} />, run: go(`/app/leads?lead=${l.id}`) }))
      : [];
    const match = (x: Item) => !term || `${x.label} ${x.hint ?? ""}`.toLowerCase().includes(term);
    return [...people, ...pages.filter(match), ...actions.filter(match)];
  }, [q, leads, router, setPalette, openLeadForm, openBookingForm]);

  useEffect(() => setI(0), [q]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setI((x) => Math.min(items.length - 1, x + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setI((x) => Math.max(0, x - 1));
    } else if (e.key === "Enter") items[i]?.run();
    else if (e.key === "Escape") setPalette(false);
  };

  let lastGroup = "";
  return (
    <Portal>
      <AnimatePresence>
        {palette && (
          <div className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[12vh]">
            <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-[3px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPalette(false)} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Search"
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-panel shadow-pop"
            >
              <div className="flex items-center gap-3 border-b border-line px-5">
                <Search size={18} className="text-fg-3" />
                <input
                  ref={input}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="Search leads, screens and actions…"
                  className="h-14 flex-1 bg-transparent text-[15px] text-fg placeholder:text-fg-3 focus:outline-none"
                  aria-label="Search"
                  role="combobox"
                  aria-expanded="true"
                  aria-controls="palette-list"
                  aria-activedescendant={items[i] ? `pi-${items[i].id}` : undefined}
                />
                <Badge>Esc</Badge>
              </div>
              <ul id="palette-list" role="listbox" className="max-h-[52vh] overflow-y-auto p-2">
                {items.length === 0 && <li className="px-4 py-10 text-center text-[14px] text-fg-3">No matches for &ldquo;{q}&rdquo;.</li>}
                {items.map((it, idx) => {
                  const header = it.group !== lastGroup ? it.group : null;
                  lastGroup = it.group;
                  return (
                    <li key={it.id} role="presentation">
                      {header && <p className="eyebrow px-3 pb-1.5 pt-3">{header}</p>}
                      <button
                        id={`pi-${it.id}`}
                        role="option"
                        aria-selected={idx === i}
                        onMouseMove={() => setI(idx)}
                        onClick={it.run}
                        className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left", idx === i ? "bg-panel-2 text-fg" : "text-fg-2")}
                      >
                        <span className={cn("grid h-7 w-7 place-items-center rounded-lg", idx === i ? "text-lime-fg" : "text-fg-3")}>{it.icon}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14px] font-medium">{it.label}</span>
                          {it.hint && <span className="block truncate text-[12px] text-fg-3">{it.hint}</span>}
                        </span>
                        {idx === i && <CornerDownLeft size={14} className="text-fg-3" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
