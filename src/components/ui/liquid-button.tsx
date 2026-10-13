"use client";

import { LiquidMetal } from "@paper-design/shaders-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/components/ui/cn";
import { useTheme } from "@/lib/theme";

/**
 * Pill button with an animated liquid-metal rim (Paper Design's liquid metal shader, after the
 * 21st.dev "Liquid Metal Button"), recoloured with FITFLOW's tokens:
 * - primary: lime-tinted metal around a lime fill, for the main call to action
 * - secondary: neutral chrome around the panel colour
 * The shader speeds up on hover and surges on click; it stands still with reduced motion.
 * Shaders need real colours, not CSS variables, so the palette is picked per theme here.
 */
const METAL = {
  primary: {
    light: { colorBack: "#58720f", colorTint: "#c8f04a" },
    dark: { colorBack: "#4d6410", colorTint: "#d9ff5c" },
  },
  secondary: {
    light: { colorBack: "#a9aaa3", colorTint: "#ffffff" },
    dark: { colorBack: "#3b3e43", colorTint: "#d8dad3" },
  },
} as const;

const FILL = {
  primary: "bg-[linear-gradient(180deg,#d7f878_0%,#c8f04a_55%,#b7e036_100%)] text-lime-ink shadow-[inset_0_1px_0_rgba(255,255,255,.55)]",
  secondary: "bg-panel text-fg shadow-[inset_0_1px_0_rgba(255,255,255,.06)]",
} as const;

// A static metal gradient behind the shader: shown while it loads or if WebGL is unavailable.
const FALLBACK = {
  primary: "bg-[conic-gradient(from_200deg,#4d6410,#d9ff5c,#7d9a1a,#eaffa3,#4d6410)]",
  secondary: "bg-[conic-gradient(from_200deg,#8a8c86,#f2f3ee,#9c9e97,#ffffff,#8a8c86)] dark:bg-[conic-gradient(from_200deg,#2a2c30,#9a9d96,#33363b,#c9cbc4,#2a2c30)]",
} as const;

const SIZE = { md: "h-12 text-[15px]", sm: "h-10 text-[14px]" } as const;
const PAD = { md: "px-6", sm: "px-4" } as const;

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof METAL;
  size?: keyof typeof SIZE;
  className?: string;
  target?: string;
};

export function LiquidButton({ href, children, variant = "primary", size = "md", className, target }: Props) {
  const { theme } = useTheme();
  const [speed, setSpeed] = useState(0.6);
  const [pressed, setPressed] = useState(false);
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const [still, setStill] = useState(false);
  const hover = useRef(false);
  const nextId = useRef(0);

  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStill(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setSpeed(2.4);
    window.setTimeout(() => setSpeed(hover.current ? 1.2 : 0.6), 300);
    const r = e.currentTarget.getBoundingClientRect();
    const ripple = { x: e.clientX - r.left, y: e.clientY - r.top, id: nextId.current++ };
    setRipples((rs) => [...rs, ripple]);
    window.setTimeout(() => setRipples((rs) => rs.filter((x) => x.id !== ripple.id)), 600);
  };

  return (
    <Link
      href={href}
      target={target}
      rel={target === "_blank" ? "noreferrer" : undefined}
      onClick={onClick}
      onMouseEnter={() => ((hover.current = true), setSpeed(1.2))}
      onMouseLeave={() => ((hover.current = false), setSpeed(0.6), setPressed(false))}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      className={cn(
        "group relative isolate inline-flex select-none items-center rounded-full p-[2.5px] font-semibold outline-none transition-[transform,box-shadow] duration-150 ease-out focus-visible:ring-4 focus-visible:ring-fg/15",
        "shadow-[0_1px_2px_rgba(0,0,0,.18),0_6px_14px_-6px_rgba(0,0,0,.25)] hover:shadow-[0_1px_2px_rgba(0,0,0,.2),0_10px_22px_-8px_rgba(0,0,0,.32)]",
        pressed && "translate-y-px scale-[0.98]",
        SIZE[size],
        className,
      )}
    >
      <span aria-hidden className={cn("absolute inset-0 -z-10 overflow-hidden rounded-full", FALLBACK[variant])}>
        <LiquidMetal
          {...METAL[variant][theme]}
          shape="circle"
          scale={8}
          repetition={4}
          softness={0.5}
          shiftRed={0.3}
          shiftBlue={0.3}
          distortion={0}
          contour={0}
          angle={45}
          offsetX={0.1}
          offsetY={-0.1}
          speed={still ? 0 : speed}
          maxPixelCount={400_000}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
      </span>
      <span className={cn("relative flex h-full w-full items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full", PAD[size], FILL[variant])}>
        {children}
        {ripples.map((r) => (
          <span
            key={r.id}
            aria-hidden
            className="pointer-events-none absolute h-5 w-5 animate-[lm-ripple_.6s_ease-out] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.55)_0%,rgba(255,255,255,0)_70%)]"
            style={{ left: r.x, top: r.y }}
          />
        ))}
      </span>
    </Link>
  );
}
