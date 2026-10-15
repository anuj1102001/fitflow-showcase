import { cn } from "./cn";

// Left column of a six-pack; the right column is its mirror image. The top row arches up toward the
// centre like the rib line and the bottom row tapers into the V, so it reads as abs even at 16px.
const ABS = [
  "M15 7.3C15 6.6 14.4 6.1 13.7 6.2L9.9 6.9C8.9 7.1 8.2 7.9 8.2 8.9V9.7C8.2 10.6 8.9 11.4 9.8 11.4H13.8C14.5 11.4 15 10.9 15 10.2Z",
  "M15 14.2C15 13.5 14.5 13 13.8 13H9.9C8.9 13 8.3 13.8 8.4 14.8L8.6 16.3C8.7 17.3 9.4 18 10.3 18H13.8C14.5 18 15 17.5 15 16.8Z",
  "M15 20.8C15 20.1 14.5 19.6 13.8 19.6H10.4C9.4 19.6 8.8 20.4 9 21.4L9.5 23.2C9.9 24.8 11.2 25.9 12.9 26.1L13.7 26.2C14.4 26.3 15 25.7 15 25Z",
];

/** Mark: six-pack abs on a lime tile. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-8 w-8 shrink-0", className)} aria-hidden>
      <rect width="32" height="32" rx="9" fill="rgb(var(--lime))" />
      <g fill="rgb(var(--lime-ink))">
        {ABS.map((d) => (
          <path key={d} d={d} />
        ))}
        <g transform="matrix(-1 0 0 1 32 0)">
          {ABS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      </g>
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
