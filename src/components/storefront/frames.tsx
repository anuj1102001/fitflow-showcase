"use client";

import { Lock, RotateCw } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/components/ui/cn";

/**
 * Renders children at a fixed "design" width (e.g. 1280px desktop) and scales them to fit the frame, so a
 * real, scrollable, clickable page can be shown as a thumbnail without changing its responsive layout.
 */
export function ScaledFrame({ designWidth, children, className, label, height }: { designWidth: number; children: ReactNode; className?: string; label: string; height?: number }) {
  const outer = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = outer.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e!.contentRect.width, h: e!.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const scale = size.w ? size.w / designWidth : 0;
  return (
    <div ref={outer} className={cn("relative overflow-hidden", className)} style={height ? { height } : undefined} role="region" aria-label={label}>
      {scale > 0 && (
        <div className="absolute left-0 top-0 origin-top-left overflow-y-auto overflow-x-hidden overscroll-contain scrollbar-none" style={{ width: designWidth, height: size.h / scale, transform: `scale(${scale})` }}>
          {children}
        </div>
      )}
    </div>
  );
}

export function BrowserFrame({ url, children, className, height = 520 }: { url: string; children: ReactNode; className?: string; height?: number }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-white/10 bg-[#16181b] shadow-[0_40px_90px_-30px_rgba(0,0,0,.85)]", className)}>
      <div className="flex h-9 items-center gap-3 border-b border-white/[.06] bg-[#1b1d21] px-3.5">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
        </div>
        <div className="mx-auto flex h-6 max-w-[60%] flex-1 items-center justify-center gap-1.5 truncate rounded-md bg-black/30 px-3 text-[11px] text-[#9a9e97]">
          <Lock size={10} /> <span className="truncate">{url}</span>
        </div>
        <RotateCw size={12} className="text-[#6b6f68]" aria-hidden />
      </div>
      <ScaledFrame designWidth={1280} label={`Desktop preview of ${url}`} height={height}>
        {children}
      </ScaledFrame>
    </div>
  );
}

export function PhoneFrame({ children, className, height = 640, width = 320 }: { children: ReactNode; className?: string; height?: number; width?: number }) {
  return (
    <div className={cn("relative shrink-0 rounded-[46px] border border-white/10 bg-[#0e0f11] p-[10px] shadow-[0_40px_90px_-30px_rgba(0,0,0,.9),inset_0_0_0_1px_rgba(255,255,255,.04)]", className)} style={{ width, height }}>
      <div className="absolute left-1/2 top-[18px] z-30 h-[22px] w-[92px] -translate-x-1/2 rounded-full bg-black" aria-hidden />
      <div className="h-full overflow-hidden rounded-[36px]">
        <ScaledFrame designWidth={375} label="Mobile preview" className="h-full">
          {children}
        </ScaledFrame>
      </div>
    </div>
  );
}
