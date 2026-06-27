import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma/prisma";
import { careerTwinSyncSchema } from "@career-os/validations";
import { buildCareerTwin } from "@/lib/career-twin";
import { getSession } from "@/lib/session/session";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
    }
    const body = await request.json();
    const validated = careerTwinSyncSchema.parse(body);
    const previousSnapshot = await prisma.careerTwinSnapshot.findFirst({
      where: { userId: session.user.id },
      orderBy: { version: "desc" },
    });
    const previousTwin = previousSnapshot ? {
      version: previousSnapshot.version,
      profileSnapshot: previousSnapshot.profileSnapshot as any,
      predictedPath: previousSnapshot.predictedPath as any,
      skillGaps: previousSnapshot.skillGaps as any,
      riskProfile: previousSnapshot.riskProfile as any,
      userId: session.user.id,
      lastSyncedAt: previousSnapshot.syncedAt.toISOString(),
    } : undefined;
    const twin = await buildCareerTwin(session.user.id, validated.profileSnapshot, previousTwin as any);
    await prisma.careerTwinSnapshot.create({
      data: {
        userId: session.user.id,
        version: twin.version,
        profileSnapshot: twin.profileSnapshot as any,
        predictedPath: twin.predictedPath as any,
        skillGaps: twin.skillGaps as any,
        riskProfile: twin.riskProfile as any,
      },
    });
    return NextResponse.json({ success: true, data: twin });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", details: error.flatten().fieldErrors } }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
    }
    const snapshot = await prisma.careerTwinSnapshot.findFirst({
      where: { userId: session.user.id },
      orderBy: { version: "desc" },
    });
    if (!snapshot) {
      return NextResponse.json({ success: true, data: null });
    }
    return NextResponse.json({
      success: true,
      data: {
        userId: snapshot.userId,
        version: snapshot.version,
        profileSnapshot: snapshot.profileSnapshot,
        predictedPath: snapshot.predictedPath,
        skillGaps: snapshot.skillGaps,
        riskProfile: snapshot.riskProfile,
        lastSyncedAt: snapshot.syncedAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
  }
}
