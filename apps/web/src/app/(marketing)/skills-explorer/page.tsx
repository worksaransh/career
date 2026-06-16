import type { Metadata } from "next";
import { ExplorerContent } from "@/components/marketing/explorer-content";

export const metadata: Metadata = {
  title: "Skills Explorer",
  description: "Discover in-demand skills, certifications, and learning paths for your career.",
};

export default function SkillsExplorerPage() {
  return (
    <ExplorerContent
      title="Skills Explorer"
      description="Build the skills that matter for your future career"
      type="skills"
    />
  );
}
