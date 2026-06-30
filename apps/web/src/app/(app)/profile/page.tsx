import { requireAuth } from "@/lib/session/session";
import { prisma } from "@/lib/db/prisma/prisma";
import { ProfileClient } from "./profile-client";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireAuth();
  const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
  const assessments = await prisma.assessmentResult.findMany({
    where: { userId: user.id },
    orderBy: { completedAt: "desc" },
    take: 5,
    include: { assessment: true },
  });

  // Fetch or create user memory
  let memory = await prisma.userMemory.findUnique({ where: { userId: user.id } });
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

  const serializedUser = { id: user.id, name: user.name, email: user.email, createdAt: new Date(user.createdAt) };
  const serializedProfile = profile ? {
    bio: profile.bio,
    location: profile.location,
    educationLevel: profile.educationLevel,
    currentGrade: profile.currentGrade,
    dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.toISOString() : null,
    interests: profile.interests,
    preferences: profile.preferences as Record<string, unknown>
  } : null;
  const serializedAssessments = assessments.map((a) => ({
    id: a.id,
    scores: a.scores as Record<string, unknown>,
    completedAt: a.completedAt,
    assessment: { title: a.assessment.title },
  }));

  const serializedMemory = {
    id: memory.id,
    demographics: memory.demographics as Record<string, unknown>,
    education: memory.education as Record<string, unknown>,
    marks: memory.marks as Record<string, unknown>,
    interests: memory.interests as Record<string, unknown> | Array<unknown>,
    goals: memory.goals as Record<string, unknown>,
    personality: memory.personality as Record<string, unknown>,
    skills: memory.skills as Record<string, unknown>,
    budget: memory.budget as Record<string, unknown>,
    lifestyleSignals: memory.lifestyleSignals as Record<string, unknown>,
    profileCompleteness: memory.profileCompleteness,
    careerUpgradeScore: memory.careerUpgradeScore,
    jobReadinessScore: memory.jobReadinessScore,
    portfolioScore: memory.portfolioScore,
  };

  return (
    <ProfileClient
      user={serializedUser}
      profile={serializedProfile}
      assessments={serializedAssessments}
      memory={serializedMemory}
    />
  );
}
