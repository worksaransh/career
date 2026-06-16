import type { Metadata } from "next";
import { PricingSection } from "@/components/marketing/pricing-section";
import { AnimatedContainer } from "@/components/ui/animated-container";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for Career OS. Start free, upgrade when you're ready.",
};

export default function PricingPage() {
  return (
    <div className="pt-24">
      <PricingSection />
    </div>
  );
}
