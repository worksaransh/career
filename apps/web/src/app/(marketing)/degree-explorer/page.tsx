import type { Metadata } from "next";
import { ExplorerContent } from "@/components/marketing/explorer-content";

export const metadata: Metadata = {
  title: "Degree Explorer",
  description: "Compare degree programs by ROI, cost, duration, and career outcomes.",
};

export default function DegreeExplorerPage() {
  return (
    <ExplorerContent
      title="Degree Explorer"
      description="Find the perfect degree for your career goals"
      type="degrees"
    />
  );
}
