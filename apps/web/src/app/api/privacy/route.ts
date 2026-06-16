import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma/prisma";
import { consentUpdateSchema } from "@career-os/validations";
import { getSession } from "@/lib/session/session";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
    }
    const body = await request.json();
    const action = body.action;
    if (action === "update-consent") {
      const validated = consentUpdateSchema.parse(body);
      await prisma.consentRecord.create({
        data: {
          userId: session.user.id,
          type: validated.type,
          granted: validated.granted,
          ip: request.headers.get("x-forwarded-for") ?? undefined,
          userAgent: request.headers.get("user-agent") ?? undefined,
        },
      });
      return NextResponse.json({ success: true, data: { updated: true } });
    }
    if (action === "export-data") {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { profile: true, consentRecords: true, analyticsEvents: { take: 100 }, savedItems: true, assessments: { include: { assessment: true } }, notifications: { take: 50 } },
      });
      return NextResponse.json({ success: true, data: user });
    }
    if (action === "delete-data") {
      await prisma.$transaction([
        prisma.notification.deleteMany({ where: { userId: session.user.id } }),
        prisma.savedItem.deleteMany({ where: { userId: session.user.id } }),
        prisma.assessmentAnswer.deleteMany({ where: { result: { userId: session.user.id } } }),
        prisma.assessmentResult.deleteMany({ where: { userId: session.user.id } }),
        prisma.analyticsEvent.deleteMany({ where: { userId: session.user.id } }),
        prisma.consentRecord.deleteMany({ where: { userId: session.user.id } }),
        prisma.userSession.deleteMany({ where: { userId: session.user.id } }),
        prisma.auditLog.deleteMany({ where: { userId: session.user.id } }),
        prisma.careerTwinSnapshot.deleteMany({ where: { userId: session.user.id } }),
        prisma.referral.deleteMany({ where: { referrerId: session.user.id } }),
      ]);
      return NextResponse.json({ success: true, data: { deleted: true } });
    }
    return NextResponse.json({ success: false, error: { code: "INVALID_ACTION", message: "Unknown action" } }, { status: 400 });
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
    const records = await prisma.consentRecord.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    const settings = records.reduce(
      (acc, r) => {
        acc[r.type as string] = r.granted;
        return acc;
      },
      {} as Record<string, boolean>,
    );
    return NextResponse.json({ success: true, data: { settings, logs: records } });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
  }
}
