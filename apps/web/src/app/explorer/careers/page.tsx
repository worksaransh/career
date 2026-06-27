import { ExplorerPageClient } from "../explorer-client";

export const metadata = { title: "Explore Careers — Career GPS AI", description: "Browse career paths in India. Compare salaries, growth rates, and find your perfect career match." };

export default function CareersExplorerPage() {
  return <ExplorerPageClient type="CAREER" />;
}

