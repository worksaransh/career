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

  return <ProfileClient user={serializedUser} profile={serializedProfile} assessments={serializedAssessments} />;
}
