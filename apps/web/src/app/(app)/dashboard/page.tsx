import { requireAuth } from "@/lib/session/session";
import { DashboardContent } from "./dashboard-content";
import { prisma } from "@/lib/db/prisma/prisma";
import { getRecommendations } from "@/lib/graph/recommendations";
import { getWeeklyChallenges, getDecisionTimelineEvents } from "@/lib/actions/challenge-actions";
import { getPartners } from "@/lib/actions/accountability-actions";

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

  // Fetch/initialize memory scores
  let memory = await prisma.userMemory.findUnique({
    where: { userId: user.id },
  });
  if (!memory) {
    memory = await prisma.userMemory.create({
      data: {
        userId: user.id,
        careerUpgradeScore: 65,
        jobReadinessScore: 45,
        portfolioScore: 50,
      },
    });
  }

  // Fetch challenges, timeline, partners
  const weeklyChallenges = await getWeeklyChallenges();
  const timelineEvents = await getDecisionTimelineEvents();
  const partners = await getPartners();

  // Fetch community settings
  const whatsappSetting = await prisma.systemSetting.findUnique({
    where: { key: "whatsapp_invite_link" },
  });
  const telegramSetting = await prisma.systemSetting.findUnique({
    where: { key: "telegram_invite_link" },
  });

  const whatsappLink = whatsappSetting?.value ?? "https://chat.whatsapp.com/mock-invite-gps";
  const telegramLink = telegramSetting?.value ?? "https://t.me/mock-invite-gps";

  return (
    <DashboardContent
      user={{ ...user, primaryPersona: user.primaryPersona }}
      latestResult={latestResult}
      recommendedCareersCount={recommendedCareersCount}
      savedCount={savedCount}
      memory={memory}
      initialWeeklyChallenges={weeklyChallenges}
      initialTimelineEvents={timelineEvents}
      initialPartners={partners}
      whatsappLink={whatsappLink}
      telegramLink={telegramLink}
    />
  );
}
