import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { prisma } from "@/lib/db/prisma/prisma";
import { authOptions } from "@/lib/auth/auth";

const completeSchema = z.object({
  persona: z.string().optional(),
  goal: z.string().optional(),
  interests: z.array(z.string()).optional(),
  education: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 },
      );
    }

    const body = await request.json();
    const validated = completeSchema.parse(body);

    const updateData: Record<string, unknown> = {
      onboardingStep: "COMPLETE",
      profileCompleteness: 25,
    };

    if (validated.goal) updateData.goal = validated.goal;
    if (validated.education) updateData.educationLevel = validated.education;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          onboardingStep: "COMPLETE",
          profileCompleteness: 25,
          primaryPersona: (validated.persona as string) ?? undefined,
        },
      }),
      prisma.userProfile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          interests: validated.interests ?? [],
          educationLevel: validated.education ?? null,
          preferences: { onboardingGoal: validated.goal },
        },
        update: {
          interests: validated.interests ? { set: validated.interests } : undefined,
          educationLevel: validated.education ?? undefined,
          preferences: validated.goal ? { onboardingGoal: validated.goal } : undefined,
        },
      }),
    ]);

    return NextResponse.json({ success: true, data: { onboardingStep: "COMPLETE" } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input" } },
        { status: 400 },
      );
    }
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status: 500 },
    );
  }
}
