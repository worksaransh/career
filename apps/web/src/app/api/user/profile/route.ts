import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma/prisma";
import { getSession } from "@/lib/session/session";

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 },
      );
    }

    const body = await request.json();
    const {
      name,
      language,
      emailNotifications,
      pushNotifications,
      bio,
      location,
      educationLevel,
      currentGrade,
      dateOfBirth,
      interests,
    } = body;

    // Update user name and language
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (language !== undefined) updateData.language = language;

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: updateData,
      });
    }

    // Update preferences and other fields in UserProfile
    const profileUpdateData: any = {};
    if (bio !== undefined) profileUpdateData.bio = bio;
    if (location !== undefined) profileUpdateData.location = location;
    if (educationLevel !== undefined) profileUpdateData.educationLevel = educationLevel;
    if (currentGrade !== undefined) profileUpdateData.currentGrade = currentGrade;
    if (dateOfBirth !== undefined) {
      profileUpdateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    }
    if (interests !== undefined) profileUpdateData.interests = interests;

    if (emailNotifications !== undefined || pushNotifications !== undefined) {
      const profile = await prisma.userProfile.findUnique({
        where: { userId: session.user.id },
      });
      const currentPreferences = (profile?.preferences as Record<string, any>) || {};
      profileUpdateData.preferences = {
        ...currentPreferences,
        ...(emailNotifications !== undefined ? { emailNotifications } : {}),
        ...(pushNotifications !== undefined ? { pushNotifications } : {}),
      };
    }

    if (Object.keys(profileUpdateData).length > 0) {
      await prisma.userProfile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          bio: bio || null,
          location: location || null,
          educationLevel: educationLevel || null,
          currentGrade: currentGrade || null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          interests: interests || [],
          preferences: profileUpdateData.preferences || {},
        },
        update: profileUpdateData,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to update profile" } },
      { status: 500 },
    );
  }
}
