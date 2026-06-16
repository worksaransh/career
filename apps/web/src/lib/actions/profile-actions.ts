"use server";

import { prisma } from "@/lib/db/prisma/prisma";
import { requireAuth } from "@/lib/session/session";
import { revalidatePath } from "next/cache";

export async function updateProfilePreference(key: string, value: any) {
  const user = await requireAuth();

  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id }
  });

  let updatedPrefs: Record<string, any> = {};

  if (!profile) {
    updatedPrefs = { [key]: value };
    await prisma.userProfile.create({
      data: {
        userId: user.id,
        preferences: updatedPrefs
      }
    });
  } else {
    const currentPrefs = (profile.preferences as Record<string, any>) || {};
    updatedPrefs = { ...currentPrefs, [key]: value };

    await prisma.userProfile.update({
      where: { userId: user.id },
      data: {
        preferences: updatedPrefs
      }
    });
  }

  // Recalculate completeness score dynamically
  // Base is 63% (completed onboarding + assessment), additional parameters add to it:
  // - marks: +10%
  // - budget: +10%
  // - familyIncome: +10%
  // - preferredCity: +7%
  let extraCompleteness = 0;
  if (updatedPrefs.marks !== undefined && updatedPrefs.marks !== "") extraCompleteness += 10;
  if (updatedPrefs.budget !== undefined && updatedPrefs.budget !== "") extraCompleteness += 10;
  if (updatedPrefs.familyIncome !== undefined && updatedPrefs.familyIncome !== "") extraCompleteness += 10;
  if (updatedPrefs.preferredCity !== undefined && updatedPrefs.preferredCity !== "") extraCompleteness += 7;

  const baseCompleteness = 63;
  const finalCompleteness = Math.min(100, baseCompleteness + extraCompleteness);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      profileCompleteness: finalCompleteness
    }
  });

  // Revalidate routes
  revalidatePath("/dashboard");
  revalidatePath("/careers");
  revalidatePath("/colleges");
  revalidatePath("/parents");
  revalidatePath("/profile");

  return { success: true, profileCompleteness: finalCompleteness };
}
