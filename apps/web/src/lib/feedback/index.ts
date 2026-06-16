// AI Feedback Loop — collect user feedback on recommendations

import { prisma } from "@/lib/db/prisma/prisma";

export type FeedbackRating = 1 | 2 | 3 | 4 | 5;

export type FeedbackReason =
  | "IRRELEVANT"
  | "NOT_INTERESTED"
  | "ALREADY_KNOWN"
  | "TOO_EXPENSIVE"
  | "LOCATION"
  | "SALARY"
  | "AI_RISK"
  | "PERFECT_MATCH"
  | "EXCEEDS_EXPECTATIONS"
  | "OTHER";

export interface RecommendationFeedback {
  id?: string;
  userId: string;
  itemId: string;
  itemType: "CAREER" | "DEGREE" | "COLLEGE" | "SKILL" | "CERTIFICATION";
  rating: FeedbackRating;
  reason?: FeedbackReason;
  comment?: string;
  createdAt?: Date;
}

export async function submitFeedback(feedback: RecommendationFeedback): Promise<void> {
  await prisma.analyticsEvent.create({
    data: {
      userId: feedback.userId,
      event: "recommendation_feedback",
      sessionId: "feedback",
      properties: {
        itemId: feedback.itemId,
        itemType: feedback.itemType,
        rating: feedback.rating,
        reason: feedback.reason,
        feedback: feedback.comment,
      },
    },
  });
}

export async function getFeedbackStats(
  itemId: string,
  itemType: string,
): Promise<{ averageRating: number; totalFeedback: number; distribution: Record<number, number> }> {
  const events = await prisma.analyticsEvent.findMany({
    where: {
      event: "recommendation_feedback",
      properties: { path: ["itemId"], equals: itemId },
    },
  });

  const ratings = events
    .map((e) => (e.properties as { rating?: number })?.rating)
    .filter((r): r is number => r != null);

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of ratings) {
    distribution[r] = (distribution[r] ?? 0) + 1;
  }

  const averageRating = ratings.length > 0
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length
    : 0;

  return { averageRating, totalFeedback: ratings.length, distribution };
}

export async function getAdminFeedbackDashboard() {
  const events = await prisma.analyticsEvent.findMany({
    where: { event: "recommendation_feedback" },
    orderBy: { timestamp: "desc" },
    take: 100,
  });

  const totalFeedback = events.length;
  const averageRating = events
    .map((e) => (e.properties as { rating?: number })?.rating ?? 0)
    .reduce((a, b) => a + b, 0) / Math.max(totalFeedback, 1);

  const itemTypeBreakdown = events.reduce(
    (acc, e) => {
      const type = (e.properties as { itemType?: string })?.itemType ?? "unknown";
      acc[type] = (acc[type] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return { totalFeedback, averageRating: Math.round(averageRating * 10) / 10, itemTypeBreakdown, recentFeedback: events.slice(0, 20) };
}
