import { requireAuth } from "@/lib/session/session";
import { prisma } from "@/lib/db/prisma/prisma";
import { ReportsClient } from "./reports-client";

export const metadata = { title: "Reports" };

export default async function ReportsPage() {
  const user = await requireAuth();
  const results = await prisma.assessmentResult.findMany({
    where: { userId: user.id },
    orderBy: { completedAt: "desc" },
    include: { assessment: true },
  });
  const roadmaps = await prisma.careerRoadmap.findMany({
    where: { userId: user.id },
    orderBy: { generatedAt: "desc" },
    include: { career: true },
  });

  const serializedResults = results.map((r) => ({
    id: r.id,
    completedAt: r.completedAt,
    assessment: { title: r.assessment.title },
  }));
  const serializedRoadmaps = roadmaps.map((rm) => ({
    id: rm.id,
    goalPosition: rm.goalPosition,
    yearsToGoal: rm.yearsToGoal,
    generatedAt: rm.generatedAt,
    career: rm.career ? { title: rm.career.title } : null,
  }));

  return <ReportsClient results={serializedResults} roadmaps={serializedRoadmaps} />;
}
