import React from "react";
import { requireAuth } from "@/lib/session/session";
import { prisma } from "@/lib/db/prisma/prisma";
import { MentorClient } from "./mentor-client";

export const metadata = { title: "AI Mentor" };

export default async function MentorPage() {
  const user = await requireAuth();

  // Fetch subscription status
  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const isPremium = (subscription?.tier === "PREMIUM" || subscription?.tier === "UNIVERSITY") && subscription?.status === "ACTIVE";

  // Fetch recommended careers for context in chat
  const assessment = await prisma.assessmentResult.findFirst({
    where: { userId: user.id },
  });

  let recommendedCareers: string[] = [];
  if (assessment) {
    const careers = await prisma.career.findMany({
      where: { isActive: true },
      take: 3,
    });
    recommendedCareers = careers.map(c => c.title);
  }

  return (
    <MentorClient
      userId={user.id}
      userName={user.name || "Student"}
      isPremium={isPremium}
      recommendedCareers={recommendedCareers}
    />
  );
}
