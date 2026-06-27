import { ExplorerPageClient } from "../explorer-client";

export const metadata = { title: "Explore Degrees — Career GPS AI", description: "Browse undergraduate and postgraduate degree courses. Compare duration, curriculum, and matching careers." };

export default function DegreesExplorerPage() {
  return <ExplorerPageClient type="DEGREE" />;
}
