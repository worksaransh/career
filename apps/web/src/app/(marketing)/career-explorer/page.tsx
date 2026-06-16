import type { Metadata } from "next";
import { ExplorerContent } from "@/components/marketing/explorer-content";

export const metadata: Metadata = {
  title: "Career Explorer",
  description: "Explore 2,500+ careers with AI-powered insights, salary forecasts, and growth projections.",
};

export default function CareerExplorerPage() {
  return (
    <ExplorerContent
      title="Career Explorer"
      description="Discover careers that match your interests and skills"
      type="careers"
    />
  );
}
