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
    const { name, language, emailNotifications, pushNotifications } = body;

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

    // Update preferences in UserProfile
    if (emailNotifications !== undefined || pushNotifications !== undefined) {
      const profile = await prisma.userProfile.findUnique({
        where: { userId: session.user.id },
      });

      const currentPreferences = (profile?.preferences as Record<string, any>) || {};
      const newPreferences = {
        ...currentPreferences,
        ...(emailNotifications !== undefined ? { emailNotifications } : {}),
        ...(pushNotifications !== undefined ? { pushNotifications } : {}),
      };

      await prisma.userProfile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          preferences: newPreferences,
        },
        update: {
          preferences: newPreferences,
        },
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
