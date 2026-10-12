import { cn } from "./cn";

/** Mark: two offset chevrons (forward motion, "flow") on a lime tile. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-8 w-8 shrink-0", className)} aria-hidden>
      <rect width="32" height="32" rx="9" fill="rgb(var(--lime))" />
      <path d="M9 10.5 14.5 16 9 21.5" stroke="rgb(var(--lime-ink))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M16.5 10.5 22 16l-5.5 5.5" stroke="rgb(var(--lime-ink))" strokeOpacity=".45" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 font-display font-bold tracking-[-0.03em] text-fg", className)}>
      <LogoMark />
      {!compact && (
        <span className="text-[18px] leading-none">
          FITFLOW
          <span className="ml-1.5 rounded-md bg-fg/10 px-1.5 py-0.5 align-[2px] font-mono text-[10px] font-semibold tracking-wider text-fg-2">AI</span>
        </span>
      )}
    </span>
  );
}
