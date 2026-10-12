import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Fraunces, Geist, Geist_Mono } from "next/font/google";
import { MotionProvider } from "@/components/motion/kit";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-bricolage", display: "swap" });
const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });
// Serif used only by the "Bloom" storefront theme.
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap", axes: ["SOFT", "opsz"] });

const url = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3200");

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: { default: "FITFLOW AI · The business OS for fitness coaches (product prototype)", template: "%s · FITFLOW AI" },
  description:
    "An interactive SaaS product prototype: AI offer builder, coaching storefronts, lead CRM, follow-up assistant, bookings, client tracking and analytics for fitness coaches. Portfolio project with sample data.",
  applicationName: "FITFLOW AI",
  openGraph: { type: "website", siteName: "FITFLOW AI", locale: "en_IN" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#0a0b0d", width: "device-width", initialScale: 1, colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${geist.variable} ${geistMono.variable} ${fraunces.variable}`}>
      <body>
        <a href="#main" className="sr-only z-[200] rounded-full bg-lime px-4 py-2 font-semibold text-lime-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Skip to content
        </a>
        <MotionProvider>
          <ToastProvider>{children}</ToastProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
