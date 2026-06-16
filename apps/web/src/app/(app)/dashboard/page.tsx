import { requireAuth } from "@/lib/session/session";
import { DashboardContent } from "./dashboard-content";
import { prisma } from "@/lib/db/prisma/prisma";
import { getRecommendations } from "@/lib/graph/recommendations";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await requireAuth();

  const latestResult = await prisma.assessmentResult.findFirst({
    where: { userId: user.id },
  });

  let recommendedCareersCount = 0;
  if (latestResult) {
    const recs = await getRecommendations(user.id, "CAREER");
    recommendedCareersCount = recs.length;
  }

  const savedCount = await prisma.savedItem.count({
    where: { userId: user.id },
  });

  return (
    <DashboardContent
      user={user}
      latestResult={latestResult}
      recommendedCareersCount={recommendedCareersCount}
      savedCount={savedCount}
    />
  );
}
