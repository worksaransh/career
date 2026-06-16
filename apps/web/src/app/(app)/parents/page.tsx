import React from "react";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/session/session";
import { prisma } from "@/lib/db/prisma/prisma";
import { getRecommendations } from "@/lib/graph/recommendations";
import { ParentsContent } from "./parents-content";

export const metadata = { title: "Parent Intelligence" };

export default async function ParentsPage() {
  const user = await requireAuth();

  // Check if user has completed the Interest Assessment
  const assessment = await prisma.assessmentResult.findFirst({
    where: { userId: user.id },
  });

  if (!assessment) {
    redirect("/assessments");
  }

  // Retrieve recommendation scores
  const careerRecs = await getRecommendations(user.id, "CAREER");
  const degreeRecs = await getRecommendations(user.id, "DEGREE");
  const collegeRecs = await getRecommendations(user.id, "COLLEGE");

  // Fetch full details of recommended items while maintaining order
  const careerIds = careerRecs.map((r) => r.itemId);
  let careers = await prisma.career.findMany({
    where: {
      id: { in: careerIds },
      isActive: true,
    },
  });
  // Sort according to recommendation rank
  let sortedCareers = careerIds
    .map((id) => careers.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => !!c);

  if (sortedCareers.length === 0) {
    sortedCareers = await prisma.career.findMany({
      where: { isActive: true },
      take: 5,
    });
  }

  const degreeIds = degreeRecs.map((r) => r.itemId);
  let degrees = await prisma.degree.findMany({
    where: {
      id: { in: degreeIds },
      isActive: true,
    },
  });
  let sortedDegrees = degreeIds
    .map((id) => degrees.find((d) => d.id === id))
    .filter((d): d is NonNullable<typeof d> => !!d);

  if (sortedDegrees.length === 0) {
    sortedDegrees = await prisma.degree.findMany({
      where: { isActive: true },
      take: 5,
    });
  }

  const collegeIds = collegeRecs.map((r) => r.itemId);
  let colleges = await prisma.college.findMany({
    where: {
      id: { in: collegeIds },
      isActive: true,
    },
  });
  let sortedColleges = collegeIds
    .map((id) => colleges.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => !!c);

  if (sortedColleges.length === 0) {
    sortedColleges = await prisma.college.findMany({
      where: { isActive: true },
      take: 5,
    });
  }

  // Load user profile & preferences
  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
  });
  const preferences = (profile?.preferences as Record<string, any>) || {};

  // Fetch subscription status
  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const isPremium = subscription?.tier === "PREMIUM" && subscription?.status === "ACTIVE";

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <ParentsContent
        user={user}
        preferences={preferences}
        careers={sortedCareers}
        degrees={sortedDegrees}
        colleges={sortedColleges}
        isPremium={isPremium}
      />
    </div>
  );
}

