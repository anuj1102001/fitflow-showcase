import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ComponentProps } from "react";
import { cn } from "./cn";

const variants = {
  primary: "bg-lime text-lime-ink hover:brightness-[1.04] shadow-[0_1px_0_rgba(255,255,255,.4)_inset,0_1px_2px_rgb(0_0_0/.12)]",
  secondary: "border border-line bg-panel text-fg shadow-[0_1px_2px_rgb(0_0_0/.04)] hover:border-line-2 hover:bg-panel-2",
  ghost: "text-fg-2 hover:bg-panel-2 hover:text-fg",
  inverse: "bg-fg text-bg hover:opacity-90",
  danger: "border border-bad/30 bg-bad/10 text-bad hover:bg-bad/15",
};
const sizes = {
  sm: "h-9 px-3 text-[13px] gap-1.5",
  md: "h-11 px-5 text-[14px] gap-2",
  lg: "h-12 px-6 text-[15px] gap-2",
  icon: "h-10 w-10",
};
export type ButtonVariant = keyof typeof variants;
type Common = { variant?: ButtonVariant; size?: keyof typeof sizes };

export const buttonClass = ({ variant = "primary", size = "md" }: Common = {}, extra?: string) =>
  cn(
    "inline-flex select-none items-center justify-center whitespace-nowrap rounded-[10px] font-semibold tracking-[-0.005em] transition duration-200 ease-soft active:scale-[.97] disabled:pointer-events-none disabled:opacity-45",
    variants[variant],
    sizes[size],
    extra,
  );

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & Common & { loading?: boolean }>(function Button(
  { variant, size, loading, className, children, disabled, type = "button", ...props },
  ref,
) {
  return (
    <button ref={ref} type={type} disabled={disabled || loading} aria-busy={loading || undefined} className={buttonClass({ variant, size }, className)} {...props}>
      {loading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />}
      {children}
    </button>
  );
});

export function ButtonLink({ variant, size, className, ...props }: ComponentProps<typeof Link> & Common) {
  return <Link className={buttonClass({ variant, size }, className)} {...props} />;
}
