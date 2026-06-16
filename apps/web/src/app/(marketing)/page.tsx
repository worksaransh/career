import { HeroSection } from "@/components/marketing/hero";
import { FeaturesSection } from "@/components/marketing/features-section";
import { StatsSection } from "@/components/marketing/stats-section";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { prisma } from "@/lib/db/prisma/prisma";

export default async function HomePage() {
  // Query active CMSContent entries for the home section
  const cmsContent = await prisma.cMSContent.findMany({
    where: { isActive: true, section: "home" },
  });

  const getCMSValue = (key: string, fallback: string) => {
    const item = cmsContent.find((c) => c.key === key);
    return item ? item.value : fallback;
  };

  const title = getCMSValue("hero-title", "See Your Future|Before You Decide");
  const subtitle = getCMSValue("hero-subtitle", "Stop guessing. Our AI analyzes your interests, skills, and goals to create a personalized career roadmap — from college to your dream job.");
  const ctaText = getCMSValue("hero-cta", "Discover Your Future");

  return (
    <>
      <HeroSection title={title} subtitle={subtitle} ctaText={ctaText} />
      <FeaturesSection />
      <StatsSection />
      <TestimonialsSection />
      <PricingSection />
      <CtaSection />
      <FaqSection />
    </>
  );
}
