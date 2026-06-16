import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma/prisma";
import { experimentCreateSchema } from "@career-os/validations";
import { getSession } from "@/lib/session/session";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
    }
    const body = await request.json();
    const validated = experimentCreateSchema.parse(body);
    const experiment = await prisma.experiment.create({
      data: {
        name: validated.name,
        description: validated.description,
        type: validated.type,
      variants: validated.variants as any,
      targetMetric: validated.targetMetric as any,
        minSampleSize: validated.minSampleSize,
        createdBy: session.user.id,
        status: "DRAFT",
      },
    });
    return NextResponse.json({ success: true, data: experiment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", details: error.flatten().fieldErrors } }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
  }
}

export async function GET() {
  try {
    const experiments = await prisma.experiment.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
    return NextResponse.json({ success: true, data: experiments });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
  }
}
