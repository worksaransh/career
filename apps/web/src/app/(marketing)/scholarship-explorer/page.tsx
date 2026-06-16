import type { Metadata } from "next";
import { ExplorerContent } from "@/components/marketing/explorer-content";

export const metadata: Metadata = {
  title: "Scholarship Explorer",
  description: "Find scholarships that match your profile. 15,000+ scholarships available.",
};

export default function ScholarshipExplorerPage() {
  return (
    <ExplorerContent
      title="Scholarship Explorer"
      description="Discover scholarships to fund your education"
      type="scholarships"
    />
  );
}
