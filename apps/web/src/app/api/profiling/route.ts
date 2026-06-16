import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma/prisma";
import { calculateProfileProgress, PROFILE_FIELDS, getProfileCompletionMessage } from "@/lib/profiling";
import { getSession } from "@/lib/session/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { profile: true } });
    const profileFields: Record<string, unknown> = {
      NAME: user?.name,
      EMAIL: user?.email,
      PHONE: user?.phone,
      LOCATION: user?.profile?.location,
      EDUCATION_LEVEL: user?.profile?.educationLevel,
      INTERESTS: user?.profile?.interests,
    };
    const progress = calculateProfileProgress(profileFields);
    return NextResponse.json({
      success: true,
      data: {
        progress,
        message: getProfileCompletionMessage(progress.percentage),
        fields: PROFILE_FIELDS,
        currentValues: profileFields,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
  }
}
