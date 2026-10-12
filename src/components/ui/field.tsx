import { ChevronDown } from "lucide-react";
import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "./cn";

const control =
  "w-full rounded-[10px] border border-line bg-panel px-3.5 text-[15px] text-fg placeholder:text-fg-3 transition duration-200 ease-soft hover:border-line-2 focus:border-fg/40 focus:shadow-ring focus:outline-none disabled:opacity-60 aria-[invalid=true]:border-bad/70";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...p }, ref) {
  return <input ref={ref} className={cn(control, "h-11", className)} {...p} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...p }, ref) {
  return <textarea ref={ref} className={cn(control, "min-h-[112px] py-3 leading-relaxed", className)} {...p} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, children, ...p }, ref) {
  return (
    <div className={cn("relative", className)}>
      <select ref={ref} className={cn(control, "h-11 appearance-none pr-10 [&>option]:bg-panel")} {...p}>
        {children}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-fg-3" aria-hidden />
    </div>
  );
});

export function Field({ label, htmlFor, hint, error, children, className, optional }: { label: ReactNode; htmlFor?: string; hint?: ReactNode; error?: string; children: ReactNode; className?: string; optional?: boolean }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="flex items-baseline justify-between gap-2 pl-1 text-[13px] font-medium text-fg-2">
        <span>{label}</span>
        {optional && <span className="text-[12px] font-normal text-fg-3">Optional</span>}
      </label>
      {children}
      {error ? (
        <p className="pl-1 text-[13px] font-medium text-bad" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="pl-1 text-[13px] text-fg-3">{hint}</p>
      ) : null}
    </div>
  );
}

export function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn("relative h-7 w-12 shrink-0 rounded-full border transition-colors duration-200 disabled:opacity-50", checked ? "border-lime-fg bg-lime" : "border-line-2 bg-panel-2")}
    >
      <span className={cn("absolute top-[3px] h-5 w-5 rounded-full shadow transition-transform duration-200 ease-soft", checked ? "translate-x-[23px] bg-lime-ink" : "translate-x-[3px] bg-fg-3")} />
    </button>
  );
}

/** Pill toggle used for multi-select choices (services, niches). */
export function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn("min-h-10 rounded-lg border px-3.5 py-2 text-[13px] font-medium transition", selected ? "border-fg/50 bg-panel-2 text-fg" : "border-line bg-panel-2/60 text-fg-2 hover:border-line-2 hover:text-fg")}
    >
      {children}
    </button>
  );
}
