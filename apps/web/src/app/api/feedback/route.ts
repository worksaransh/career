import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma/prisma";
import { feedbackSchema } from "@career-os/validations";
import { getSession } from "@/lib/session/session";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
    }
    const body = await request.json();
    const validated = feedbackSchema.parse(body);
    await prisma.analyticsEvent.create({
      data: {
        userId: session.user.id,
        event: "recommendation_feedback",
        sessionId: "feedback",
        properties: validated,
      },
    });
    return NextResponse.json({ success: true, data: { recorded: true } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", details: error.flatten().fieldErrors } }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");
    const itemType = searchParams.get("itemType");
    if (!itemId || !itemType) {
      return NextResponse.json({ success: false, error: { code: "MISSING_PARAMS", message: "itemId and itemType required" } }, { status: 400 });
    }
    const events = await prisma.analyticsEvent.findMany({
      where: { event: "recommendation_feedback", properties: { path: ["itemId"], equals: itemId } },
    });
    const ratings = events.map((e) => (e.properties as { rating?: number })?.rating).filter((r): r is number => r != null);
    const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    return NextResponse.json({ success: true, data: { averageRating, totalFeedback: ratings.length } });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
  }
}
