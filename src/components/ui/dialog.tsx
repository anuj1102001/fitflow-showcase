"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "./cn";

/**
 * Accessible modal on the native <dialog> element (focus trap + Esc handled by the browser).
 * Phones get a bottom sheet with a grab handle; larger screens a centred card.
 */
export function Dialog({ open, onClose, title, description, children, className, wide }: { open: boolean; onClose: () => void; title: string; description?: ReactNode; children: ReactNode; className?: string; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className={cn(
        "mb-0 mt-auto max-h-[92dvh] w-full max-w-full overflow-y-auto rounded-t-[28px] border border-line bg-panel p-0 text-fg shadow-pop backdrop:bg-black/60 backdrop:backdrop-blur-[2px] open:animate-sheet",
        "sm:m-auto sm:w-[calc(100%-2rem)] sm:rounded-[28px] sm:open:animate-pop",
        wide ? "sm:max-w-2xl" : "sm:max-w-md",
        className,
      )}
    >
      {open && (
        <div className="p-5 pb-safe sm:p-6">
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line-2 sm:hidden" aria-hidden />
          <div className="mb-5 flex items-start justify-between gap-4 border-b border-line pb-4">
            <div>
              <h2 className="text-[19px] font-semibold">{title}</h2>
              {description && <p className="mt-1 text-[14px] leading-relaxed text-fg-2">{description}</p>}
            </div>
            <button onClick={onClose} aria-label="Close" className="icon-btn h-9 w-9">
              <X size={16} />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
