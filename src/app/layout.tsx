import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { MotionProvider } from "@/components/motion/kit";
import { ToastProvider } from "@/components/ui/toast";
import { THEME_SCRIPT } from "@/lib/theme";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });
// Serif kept for editorial accents.
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap", axes: ["SOFT", "opsz"] });

const url = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3200");

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: { default: "FITFLOW AI · The follow-up engine for fitness influencers and creators (product prototype)", template: "%s · FITFLOW AI" },
  description:
    "An interactive SaaS product prototype: the follow-up engine for fitness influencers and creators. A Today queue, follow-up sequences that pause on reply, drafts that explain themselves and client retention check-ins. Portfolio project with sample data.",
  applicationName: "FITFLOW AI",
  openGraph: { type: "website", siteName: "FITFLOW AI", locale: "en_IN" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f6f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0c0e" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${geistMono.variable} ${fraunces.variable}`}>
      <head>
        {/* Applies the saved light/dark choice before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <a href="#main" className="sr-only z-[200] rounded-lg bg-lime px-4 py-2 font-semibold text-lime-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Skip to content
        </a>
        <MotionProvider>
          <ToastProvider>{children}</ToastProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
