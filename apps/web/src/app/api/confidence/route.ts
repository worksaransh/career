import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma/prisma";
import { calculateConfidence } from "@/lib/recommendations/confidence";
import { getSession } from "@/lib/session/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { profile: true, assessments: true } });
    const interests = user?.profile?.interests ?? [];
    const assessmentsCompleted = (user?.assessments?.length ?? 0) > 0;
    const score = calculateConfidence({
      interests,
      assessmentsCompleted: assessmentsCompleted ? 1 : 0,
      savedCareers: 0,
      savedColleges: 0,
      educationLevel: user?.profile?.educationLevel ?? undefined,
      currentGrade: user?.profile?.currentGrade ?? undefined,
      location: user?.profile?.location ?? undefined,
      dateOfBirth: user?.profile?.dateOfBirth?.toISOString(),
      preferences: (user?.profile?.preferences ?? {}) as Record<string, unknown>,
    });
    return NextResponse.json({ success: true, data: score });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
  }
}
