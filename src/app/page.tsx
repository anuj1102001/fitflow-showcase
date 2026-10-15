import { AnalyticsPreview, Features, StorefrontShowcase } from "@/components/landing/demos";
import { Hero, LandingNav } from "@/components/landing/hero";
import { NeuralNoise } from "@/components/landing/neural-noise";
import { AISection, FaqSection, FinalCta, Footer, Pricing, Problem } from "@/components/landing/sections";
import { Workflow } from "@/components/landing/workflow";

export default function Home() {
  return (
    <>
      {/* One shader layer behind the whole page, hero to footer */}
      <NeuralNoise />
      <LandingNav />
      <main id="main" className="overflow-x-clip">
        <Hero />
        <Problem />
        <Workflow />
        <Features />
        <AnalyticsPreview />
        <AISection />
        <StorefrontShowcase />
        <Pricing />
        <FaqSection />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
