import { ExplorerPageClient } from "../explorer-client";

export const metadata = { title: "Explore Skills — Career GPS AI", description: "Browse in-demand technical, functional, and soft skills. Find matching career paths and resources." };

export default function SkillsExplorerPage() {
  return <ExplorerPageClient type="SKILL" />;
}
