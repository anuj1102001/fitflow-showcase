"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, BarChart3, Bot, CalendarCheck, Eraser, HeartPulse, Info, MessageSquareText, Sparkles, TrendingUp, Wand2 } from "lucide-react";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { EASE } from "@/components/motion/kit";

import { Avatar, DemoTag, Panel } from "@/components/ui/kit";
import { answer, SUGGESTED_PROMPTS } from "@/lib/ai";
import { uid } from "@/lib/format";
import { COACH } from "@/lib/seed";
import { useDemo } from "@/lib/store";
import type { ChatMessage } from "@/lib/types";

const PROMPT_ICON = [<BarChart3 key="a" size={16} />, <CalendarCheck key="b" size={16} />, <Wand2 key="c" size={16} />, <MessageSquareText key="d" size={16} />, <TrendingUp key="e" size={16} />, <HeartPulse key="f" size={16} />];

export function AssistantScreen() {
  const chat = useDemo((s) => s.chat);
  const pushChat = useDemo((s) => s.pushChat);
  const clearChat = useDemo((s) => s.clearChat);
  const leads = useDemo((s) => s.leads);
  const clients = useDemo((s) => s.clients);
  const offers = useDemo((s) => s.offers);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [streaming, setStreaming] = useState<{ id: string; full: string; shown: number; cards?: ChatMessage["cards"] } | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chat.length, streaming?.shown, thinking]);

  const ask = (q: string) => {
    const text = q.trim();
    if (!text || thinking || streaming) return;
    pushChat({ id: uid("m"), role: "user", text, at: new Date().toISOString() });
    setInput("");
    setThinking(true);
    const a = answer(text, { leads, clients, offers });
    const id = uid("m");
    timers.current.push(
      setTimeout(() => {
        setThinking(false);
        let shown = 0;
        const step = () => {
          shown = Math.min(a.text.length, shown + 6 + Math.floor(Math.random() * 6));
          setStreaming({ id, full: a.text, shown, cards: a.cards });
          if (shown < a.text.length) timers.current.push(setTimeout(step, 16));
          else {
            pushChat({ id, role: "assistant", text: a.text, at: new Date().toISOString(), cards: a.cards });
            setStreaming(null);
          }
        };
        step();
      }, 700),
    );
  };

  const busy = thinking || !!streaming;
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
      <section className="card flex min-h-[calc(100dvh-200px)] flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          {chat.length === 0 && !busy ? (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="mx-auto max-w-2xl py-6 text-center sm:py-10">
              <div className="relative mx-auto grid h-16 w-16 place-items-center">
                <motion.div className="relative grid h-16 w-16 place-items-center rounded-xl bg-lime text-lime-ink" animate={{ rotate: [0, -6, 6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
                  <Sparkles size={28} />
                </motion.div>
              </div>
              <h2 className="mt-6 text-[26px] font-semibold tracking-[-0.03em]">Ask about your coaching business</h2>
              <p className="mx-auto mt-2 max-w-md text-[14.5px] leading-relaxed text-fg-2">I read the same sample data as your dashboard: leads, sources, offers, clients and bookings. Try a question below.</p>
              <div className="mt-8 grid gap-2.5 text-left sm:grid-cols-2">
                {SUGGESTED_PROMPTS.map((p, i) => (
                  <motion.button key={p} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05, duration: 0.4, ease: EASE }} whileHover={{ y: -2 }} onClick={() => ask(p)} className="flex items-center gap-3 rounded-2xl border border-line bg-panel-2/40 p-3.5 text-left text-[13.5px] font-medium text-fg-2 transition-colors hover:border-lime-fg/40 hover:text-fg">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-line bg-panel text-lime-fg">{PROMPT_ICON[i]}</span>
                    {p}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-6">
              {chat.map((m) => (
                <Message key={m.id} m={m} />
              ))}
              {thinking && (
                <div className="flex gap-3" role="status" aria-label="Assistant is thinking">
                  <BotAvatar />
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-line bg-panel-2/60 px-4 py-3.5">
                    {[0, 1, 2].map((i) => (
                      <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-s1" animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />
                    ))}
                  </div>
                </div>
              )}
              {streaming && <Message m={{ id: streaming.id, role: "assistant", text: streaming.full.slice(0, streaming.shown), at: "" }} live />}
              <div ref={end} />
            </div>
          )}
        </div>

        <div className="border-t border-line bg-panel/80 p-3 backdrop-blur sm:p-4">
          {chat.length > 0 && (
            <div className="mx-auto mb-2.5 flex max-w-3xl gap-2 overflow-x-auto pb-1 scrollbar-none">
              {SUGGESTED_PROMPTS.map((p) => (
                <button key={p} onClick={() => ask(p)} disabled={busy} className="shrink-0 rounded-md border border-line px-3 py-1.5 text-[12px] text-fg-2 transition hover:border-line-2 hover:text-fg disabled:opacity-50">
                  {p}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="mx-auto flex max-w-3xl items-end gap-2 rounded-xl border border-line bg-panel-2/50 p-1.5 pl-4 transition focus-within:border-lime-fg/50"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  ask(input);
                }
              }}
              rows={1}
              maxLength={300}
              placeholder="Ask about leads, offers, clients or trends…"
              aria-label="Ask the assistant"
              className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent py-2.5 text-[14.5px] placeholder:text-fg-3 focus:outline-none"
            />
            <button type="submit" disabled={!input.trim() || busy} aria-label="Send" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lime text-lime-ink transition hover:brightness-105 disabled:opacity-40">
              <ArrowUp size={18} />
            </button>
          </form>
          <p className="mx-auto mt-2 max-w-3xl text-center text-[11.5px] text-fg-3">Simulated assistant: answers are computed from the demo&apos;s sample data with rules. No AI model is called.</p>
        </div>
      </section>

      <aside className="space-y-5">
        <Panel title="What I can see" subtitle="Same data as your dashboard">
          <dl className="space-y-2.5 text-[13.5px]">
            {[
              ["Leads", leads.length],
              ["Open pipeline", leads.filter((l) => !["won", "lost"].includes(l.stage)).length],
              ["Active clients", clients.length],
              ["Offers", offers.length],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <dt className="text-fg-2">{k}</dt>
                <dd className="font-semibold tabular">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4">
            <DemoTag>Sample data</DemoTag>
          </div>
        </Panel>
        <Panel title="Good to know">
          <ul className="space-y-2.5 text-[13px] leading-relaxed text-fg-2">
            <li className="flex gap-2">
              <Info size={14} className="mt-0.5 shrink-0 text-fg-3" /> In a production version this would call an LLM with your data as context. Here it&apos;s deterministic so the demo works offline and for free.
            </li>
            <li className="flex gap-2">
              <Info size={14} className="mt-0.5 shrink-0 text-fg-3" /> Answers include links that jump to the right screen.
            </li>
          </ul>
          {chat.length > 0 && (
            <button onClick={clearChat} disabled={busy} className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-fg-3 transition hover:text-fg disabled:opacity-50">
              <Eraser size={14} /> Clear conversation
            </button>
          )}
        </Panel>
      </aside>
    </div>
  );
}

function BotAvatar() {
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-lime text-lime-ink">
      <Bot size={16} />
    </span>
  );
}

function Message({ m, live }: { m: ChatMessage; live?: boolean }) {
  if (m.role === "user")
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }} className="flex justify-end gap-3">
        <p className="max-w-[80%] rounded-2xl rounded-tr-md bg-lime/[.13] px-4 py-3 text-[14.5px] leading-relaxed text-fg">{m.text}</p>
        <Avatar name={COACH.name} src={COACH.avatar} size={32} />
      </motion.div>
    );
  return (
    <div className="flex gap-3">
      <BotAvatar />
      <div className="min-w-0 max-w-[88%]">
        <div className="prose-chat rounded-2xl rounded-tl-md border border-line bg-panel-2/40 px-4 py-3.5 text-[14.5px] leading-relaxed text-fg-2">
          <Markdown text={m.text} />
          {live && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-s1" aria-hidden />}
        </div>
        <AnimatePresence>
          {!live && m.cards && m.cards.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-2.5 flex flex-wrap gap-2">
              {m.cards.map((c) =>
                c.href ? (
                  <Link key={c.label} href={c.href} className="inline-flex items-center gap-2 rounded-md border border-line bg-panel px-3.5 py-1.5 text-[12.5px] transition hover:border-lime-fg/40">
                    <span className="text-fg-2">{c.label}</span>
                    <span className="font-semibold text-lime-fg">{c.value}</span>
                  </Link>
                ) : (
                  <span key={c.label} className="rounded-md border border-line px-3.5 py-1.5 text-[12.5px]">
                    {c.label}: {c.value}
                  </span>
                ),
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Tiny renderer for the assistant's answers: paragraphs, • bullets, numbered lists, > quotes and **bold**. */
function Markdown({ text }: { text: string }) {
  const blocks = text.split("\n");
  const out: ReactNode[] = [];
  blocks.forEach((line, i) => {
    if (!line.trim()) return out.push(<div key={i} className="h-2" />);
    if (line.startsWith("> ")) return out.push(<blockquote key={i} className="my-1 border-l-2 border-lime-fg/60 bg-panel/60 py-2 pl-3 pr-2 text-fg">{inline(line.slice(2))}</blockquote>);
    if (line.startsWith("• ")) return out.push(<p key={i} className="flex gap-2 pl-1"><span className="text-lime-fg">•</span><span>{inline(line.slice(2))}</span></p>);
    const num = line.match(/^(\d+)\. (.*)$/);
    if (num) return out.push(<p key={i} className="flex gap-2 pl-1"><span className="font-semibold tabular text-lime-fg">{num[1]}.</span><span>{inline(num[2]!)}</span></p>);
    out.push(<p key={i}>{inline(line)}</p>);
  });
  return <div className="space-y-1">{out}</div>;
}
function inline(s: string) {
  return s.split(/(\*\*[^*]+\*\*)/g).map((part, i) => (part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part}</Fragment>));
}

