"use client";

import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { cn } from "./cn";

type Toast = { id: number; tone: "success" | "error" | "info"; title: string; body?: string };
const Ctx = createContext<(t: Omit<Toast, "id">) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((all) => [...all.slice(-3), { ...t, id }]);
    setTimeout(() => setToasts((all) => all.filter((x) => x.id !== id)), t.tone === "error" ? 6500 : 3500);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6" aria-live="polite" role="status">
        {toasts.map((t) => (
          <div key={t.id} className={cn("pointer-events-auto flex w-full max-w-sm animate-pop items-start gap-3 rounded-2xl border bg-panel px-4 py-3.5 shadow-pop", t.tone === "error" ? "border-bad/30" : "border-line")}>
            {t.tone === "error" ? <AlertTriangle size={18} className="mt-0.5 shrink-0 text-bad" aria-hidden /> : <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-lime-fg" aria-hidden />}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.body && <p className="mt-0.5 text-[13px] text-fg-2">{t.body}</p>}
            </div>
            <button aria-label="Dismiss" onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))} className="text-fg-3 transition hover:text-fg">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
