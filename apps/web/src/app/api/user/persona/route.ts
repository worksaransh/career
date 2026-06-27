import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma/prisma";
import { authOptions } from "@/lib/auth/auth";

const personaSchema = z.object({
  persona: z.enum(["STUDENT", "PARENT", "COLLEGE_STUDENT", "GRADUATE", "PROFESSIONAL", "CAREER_SWITCHER"]),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED" } }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { primaryPersona: true },
    });
    return NextResponse.json({ success: true, data: { persona: user?.primaryPersona ?? "STUDENT" } });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR" } }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED" } }, { status: 401 });
    }

    const body = await request.json();
    const validated = personaSchema.parse(body);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { primaryPersona: validated.persona },
    });

    return NextResponse.json({ success: true, data: { persona: validated.persona } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", details: error.flatten().fieldErrors } }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR" } }, { status: 500 });
  }
}
