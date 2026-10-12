import containerQueries from "@tailwindcss/container-queries";
import type { Config } from "tailwindcss";

/**
 * FITFLOW design tokens. Every colour is a CSS variable (src/app/globals.css) so light/dark is a variable swap.
 * Semantic names: bg (page), panel / panel-2 (surfaces), line (hairlines), fg / fg-2 / fg-3 (text tiers),
 * lime (the one accent) and lime-fg (lime used as text, darker in light mode for contrast), plus status hues.
 */
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: v("bg"),
        panel: v("panel"),
        "panel-2": v("panel-2"),
        line: v("line"),
        "line-2": v("line-2"),
        fg: v("fg"),
        "fg-2": v("fg-2"),
        "fg-3": v("fg-3"),
        lime: v("lime"),
        "lime-ink": v("lime-ink"),
        "lime-fg": v("lime-fg"),
        chart: v("chart"),
        ok: v("ok"),
        warn: v("warn"),
        bad: v("bad"),
        info: v("info"),
        violet: v("violet"),
      },
      fontFamily: {
        sans: ["var(--font-geist)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-bricolage)", "var(--font-geist)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      fontSize: { "2xs": ["11px", { lineHeight: "14px" }] },
      borderRadius: { "4xl": "2rem" },
      boxShadow: {
        card: "0 1px 0 rgb(var(--hl) / var(--hl-a)) inset, 0 1px 2px rgb(0 0 0 / calc(.06 * var(--sh-a))), 0 16px 40px -24px rgb(0 0 0 / calc(.35 * var(--sh-a)))",
        pop: "0 24px 60px -20px rgb(0 0 0 / calc(.5 * var(--sh-a))), 0 0 0 1px rgb(var(--line) / 1)",
        glow: "0 0 0 1px rgb(var(--lime) / .5), 0 8px 30px -6px rgb(var(--lime) / .45)",
        ring: "0 0 0 4px rgb(var(--lime) / .18)",
      },
      transitionTimingFunction: { soft: "cubic-bezier(.22,.8,.24,1)" },
      keyframes: {
        rise: { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "none" } },
        fade: { from: { opacity: "0" }, to: { opacity: "1" } },
        sheet: { from: { transform: "translateY(100%)" }, to: { transform: "none" } },
        pop: { from: { opacity: "0", transform: "scale(.97) translateY(6px)" }, to: { opacity: "1", transform: "none" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        pulseDot: { "0%,100%": { opacity: "1" }, "50%": { opacity: ".35" } },
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
      },
      animation: {
        rise: "rise .45s cubic-bezier(.22,.8,.24,1) both",
        fade: "fade .3s ease both",
        sheet: "sheet .38s cubic-bezier(.22,.8,.24,1) both",
        pop: "pop .25s cubic-bezier(.22,.8,.24,1) both",
        shimmer: "shimmer 1.6s infinite",
        "pulse-dot": "pulseDot 1.6s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [containerQueries],
} satisfies Config;
