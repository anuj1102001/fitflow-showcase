import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicStorefront } from "@/components/storefront/public";

const COACHES = {
  aarav: { name: "Aarav Mehta", role: "Strength & fat-loss coach in Bengaluru" },
  meera: { name: "Meera Iyer", role: "Yoga & mobility coach in Pune" },
} as const;

export function generateStaticParams() {
  return Object.keys(COACHES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = COACHES[slug as keyof typeof COACHES];
  if (!c) return {};
  return { title: `${c.name} · ${c.role} (demo storefront)`, description: `Sample coaching storefront built with FITFLOW. ${c.name} is a fictional coach.`, robots: { index: false } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(slug in COACHES)) notFound();
  return <PublicStorefront slug={slug as keyof typeof COACHES} />;
}
