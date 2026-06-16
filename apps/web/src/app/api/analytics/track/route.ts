import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma/prisma";
import { getSession } from "@/lib/session/session";

const trackEventSchema = z.object({
  event: z.string().min(1).max(100),
  properties: z.record(z.unknown()).optional(),
  sessionId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();
    const validated = trackEventSchema.parse(body);

    await prisma.analyticsEvent.create({
      data: {
        userId: session?.user?.id ?? null,
        event: validated.event,
        sessionId: validated.sessionId ?? "anonymous",
        properties: (validated.properties ?? {}) as object,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input" } }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  }
}
