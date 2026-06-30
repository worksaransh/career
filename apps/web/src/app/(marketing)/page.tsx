import { HeroSection } from "@/components/marketing/hero";
import { FeaturesSection } from "@/components/marketing/features-section";
import { PlaygroundSection } from "@/components/marketing/playground-section";
import { StatsSection } from "@/components/marketing/stats-section";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { prisma } from "@/lib/db/prisma/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let cmsContent: any[] = [];
  try {
    // Query active CMSContent entries for the home section
    cmsContent = await prisma.cMSContent.findMany({
      where: { isActive: true, section: "home" },
    });
  } catch (err) {
    console.error("Failed to query CMSContent, falling back to defaults:", err);
  }

  const getCMSValue = (key: string, fallback: string) => {
    const item = cmsContent.find((c) => c.key === key);
    return item ? item.value : fallback;
  };

  const title = getCMSValue("hero-title", "Your Personal AI|Career Operating System");
  const subtitle = getCMSValue("hero-subtitle", "Increase your lifetime earnings with our AI-powered growth ecosystem. Get personalized skill roadmaps, ROI-backed college options, and direct path mapping to high-paying careers.");
  const ctaText = getCMSValue("hero-cta", "Launch Your Career OS");

  return (
    <>
      <HeroSection title={title} subtitle={subtitle} ctaText={ctaText} />
      <FeaturesSection />
      <PlaygroundSection />
      <StatsSection />
      <TestimonialsSection />
      <PricingSection />
      <CtaSection />
      <FaqSection />
    </>
  );
}
