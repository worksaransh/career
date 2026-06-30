import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { prisma } from "@/lib/db/prisma/prisma";
import { authOptions } from "@/lib/auth/auth";

const completeSchema = z.object({
  persona: z.string().optional(),
  onboardingData: z.record(z.any()).optional(),
  goal: z.string().optional(),
  interests: z.array(z.string()).optional(),
  education: z.string().optional(),
  parsedResumeData: z.any().optional(),
  resumeFilename: z.string().optional(),
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

    const onboardingData = validated.onboardingData || {};
    const persona = validated.persona || onboardingData.persona || "STUDENT";
    const parsedResume = validated.parsedResumeData;
    const filename = validated.resumeFilename || "resume.pdf";

    // Deduce profile levels
    const interests = onboardingData.interests || onboardingData.skills || validated.interests || [];
    const educationLevel = onboardingData.educationLevel || onboardingData.degree || validated.education || null;
    const location = onboardingData.preferredLocation || onboardingData.preferredCity || onboardingData.location || null;
    const completeness = 85; // Detailed multi-field onboarding yields high completeness

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          onboardingStep: "COMPLETE",
          profileCompleteness: completeness,
          primaryPersona: persona,
        },
      }),
      prisma.userProfile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          interests: interests,
          educationLevel: educationLevel,
          location: location,
          preferences: onboardingData,
        },
        update: {
          interests: interests ? { set: interests } : undefined,
          educationLevel: educationLevel ?? undefined,
          location: location ?? undefined,
          preferences: onboardingData,
        },
      }),
      prisma.userMemory.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          education: {
            level: educationLevel,
            institution: onboardingData.college || onboardingData.board || null,
            grade: onboardingData.cgpa || onboardingData.marks || null,
          },
          goals: {
            careerGoal: onboardingData.careerGoal || onboardingData.placementGoal || onboardingData.futureGoal || null,
            targetRole: onboardingData.targetRole || null,
          },
          skills: onboardingData.skills || {},
          budget: {
            educationBudget: onboardingData.budget || null,
          },
          careerUpgradeScore: persona === "PROFESSIONAL" ? 70 : 65,
          jobReadinessScore: persona === "PROFESSIONAL" ? 60 : 45,
          portfolioScore: onboardingData.resumeUploaded ? 65 : 50,
          profileCompleteness: completeness,
        },
        update: {
          education: {
            level: educationLevel,
            institution: onboardingData.college || onboardingData.board || null,
            grade: onboardingData.cgpa || onboardingData.marks || null,
          },
          goals: {
            careerGoal: onboardingData.careerGoal || onboardingData.placementGoal || onboardingData.futureGoal || null,
            targetRole: onboardingData.targetRole || null,
          },
          skills: onboardingData.skills || {},
          budget: {
            educationBudget: onboardingData.budget || null,
          },
          profileCompleteness: completeness,
        },
      }),
    ]);

    if (parsedResume) {
      await prisma.vaultDocument.create({
        data: {
          userId: session.user.id,
          title: filename,
          type: "RESUME",
          fileUrl: "/uploads/" + filename,
          parsedContent: parsedResume as any,
          confidenceScore: parsedResume.confidenceScore || 85,
        }
      });

      const allSkills: string[] = [];
      if (parsedResume.skills) {
        Object.keys(parsedResume.skills).forEach((cat) => {
          const list = parsedResume.skills[cat];
          if (Array.isArray(list)) {
            list.forEach((s) => allSkills.push(s));
          }
        });
      }

      for (const skill of allSkills.slice(0, 15)) {
        await prisma.skillProficiency.upsert({
          where: {
            userId_skillName: {
              userId: session.user.id,
              skillName: skill,
            }
          },
          create: {
            userId: session.user.id,
            skillName: skill,
            selfRated: 70,
            confidence: 50,
            verified: false,
            evidence: [
              { source: "RESUME", name: filename, timestamp: new Date().toISOString() }
            ] as any
          },
          update: {
            evidence: [
              { source: "RESUME", name: filename, timestamp: new Date().toISOString() }
            ] as any
          }
        });
      }
    }

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
