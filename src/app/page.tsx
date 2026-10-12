import { AnalyticsPreview, Features, StorefrontShowcase } from "@/components/landing/demos";
import { Hero, LandingNav } from "@/components/landing/hero";
import { AISection, FaqSection, FinalCta, Footer, Pricing, Problem } from "@/components/landing/sections";
import { Workflow } from "@/components/landing/workflow";

export default function Home() {
  return (
    <>
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
