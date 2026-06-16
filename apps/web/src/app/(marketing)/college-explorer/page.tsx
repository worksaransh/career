import type { Metadata } from "next";
import { ExplorerContent } from "@/components/marketing/explorer-content";

export const metadata: Metadata = {
  title: "College Explorer",
  description: "Explore 48,000+ colleges with AI summaries, placement stats, fees, and student fit scores.",
};

export default function CollegeExplorerPage() {
  return (
    <ExplorerContent
      title="College Explorer"
      description="Find and compare colleges that fit your profile"
      type="colleges"
    />
  );
}
