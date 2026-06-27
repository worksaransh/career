import { ExplorerPageClient } from "../explorer-client";

export const metadata = { title: "Explore Colleges — Career GPS AI", description: "Browse top colleges and universities in India. Compare rankings, fees, and career placement stats." };

export default function CollegesExplorerPage() {
  return <ExplorerPageClient type="COLLEGE" />;
}
