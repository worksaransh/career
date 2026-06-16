import type { Metadata } from "next";
import { FeaturesSection } from "@/components/marketing/features-section";
import { CtaSection } from "@/components/marketing/cta-section";

export const metadata: Metadata = {
  title: "Features",
  description: "Explore all features of Career OS — AI career matching, salary forecasting, college explorer, and more.",
};

export default function FeaturesPage() {
  return (
    <div className="pt-24">
      <FeaturesSection />
      <CtaSection />
    </div>
  );
}
