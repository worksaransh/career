"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma/prisma";
import { requireAuth } from "@/lib/session/session";

export async function getAssessmentQuestions() {
  const user = await requireAuth();

  let assess = await prisma.assessment.findFirst({
    where: { type: "INTEREST", isActive: true },
    include: {
      questions: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!assess) {
    assess = await prisma.assessment.findFirst({
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
    });
  }

  if (assess && assess.questions) {
    const persona = user.primaryPersona || "STUDENT";
    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });
    const educationLevel = profile?.educationLevel || "HIGH_SCHOOL";

    assess.questions = assess.questions.filter((q) => {
      const qText = q.text.toLowerCase();

      // Rule 1: Once education is completed, college budget/admission questions should never appear.
      if (
        persona === "PROFESSIONAL" ||
        persona === "CAREER_SWITCHER" ||
        educationLevel === "GRADUATE" ||
        educationLevel === "POSTGRADUATE"
      ) {
        if (
          qText.includes("admission") ||
          qText.includes("college budget") ||
          qText.includes("school budget") ||
          qText.includes("choose science") ||
          qText.includes("class 10") ||
          qText.includes("olympiad")
        ) {
          return false;
        }
      }

      // Rule 2: Professional users should not be asked school-level questions.
      if (persona === "PROFESSIONAL" || persona === "CAREER_SWITCHER") {
        if (
          qText.includes("school") ||
          qText.includes("homework") ||
          qText.includes("parent") ||
          qText.includes("teacher")
        ) {
          return false;
        }
      }

      // Rule 3: Students should not be asked salary questions.
      if (persona === "STUDENT") {
        if (
          qText.includes("salary") ||
          qText.includes("notice period") ||
          qText.includes("current job") ||
          qText.includes("earn")
        ) {
          return false;
        }
      }

      // Rule 4: Parents should never see coding/interview specific technical questions.
      if (persona === "PARENT") {
        if (
          qText.includes("coding") ||
          qText.includes("system design") ||
          qText.includes("git") ||
          qText.includes("full-stack")
        ) {
          return false;
        }
      }

      return true;
    });
  }

  return assess;
}

export async function getLatestAssessmentResult() {
  const user = await requireAuth();

  const result = await prisma.assessmentResult.findFirst({
    where: { userId: user.id },
    orderBy: { completedAt: "desc" },
  });

  return result;
}

export async function submitAssessment(
  assessmentId: string,
  answers: { questionId: string; optionId: string; value: number }[]
) {
  const user = await requireAuth();

  if (!answers || answers.length === 0) {
    throw new Error("No answers provided");
  }

  const questions = await prisma.assessmentQuestion.findMany({
    where: { assessmentId },
  });

  const questionMap = new Map(questions.map((q) => [q.id, q]));

  const categoryTotals: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};

  answers.forEach((ans) => {
    const q = questionMap.get(ans.questionId);
    const category = q?.category || "General";

    categoryTotals[category] = (categoryTotals[category] ?? 0) + ans.value;
    categoryCounts[category] = (categoryCounts[category] ?? 0) + 1;
  });

  const scores: Record<string, number> = {};
  Object.keys(categoryTotals).forEach((cat) => {
    const count = categoryCounts[cat] || 1;
    scores[cat] = Math.round(((categoryTotals[cat] ?? 0) / count) * 20);
  });

  const result = await prisma.$transaction(async (tx) => {
    const res = await tx.assessmentResult.create({
      data: {
        userId: user.id,
        assessmentId,
        type: "INTEREST",
        scores: scores,
        summary: "Assessment completed. Interests profile computed successfully.",
        completedAt: new Date(),
      },
    });

    const answersData = answers.map((ans) => ({
      resultId: res.id,
      questionId: ans.questionId,
      optionId: ans.optionId,
      value: ans.value,
    }));

    await tx.assessmentAnswer.createMany({
      data: answersData,
    });

    // 3. Update User Profile interests with top categories from assessment (score >= 50)
    const topCategories = Object.entries(scores)
      .filter(([_, val]) => typeof val === "number" && val >= 50)
      .map(([cat]) => cat);

    const profile = await tx.userProfile.findUnique({
      where: { userId: user.id },
    });
    if (profile) {
      const uniqueInterests = Array.from(new Set([...profile.interests, ...topCategories]));
      await tx.userProfile.update({
        where: { userId: user.id },
        data: { interests: uniqueInterests },
      });
    }

    // 4. Update UserMemory progress values
    const memory = await tx.userMemory.findUnique({
      where: { userId: user.id },
    });
    if (memory) {
      await tx.userMemory.update({
        where: { userId: user.id },
        data: {
          careerUpgradeScore: Math.min(100, memory.careerUpgradeScore + 8),
          jobReadinessScore: Math.min(100, memory.jobReadinessScore + 10),
          portfolioScore: Math.min(100, memory.portfolioScore + 5),
          totalQuestionsAnswered: memory.totalQuestionsAnswered + answers.length,
          profileCompleteness: Math.min(100, memory.profileCompleteness + 15),
        },
      });
    }

    // 5. Update user onboarding status
    await tx.user.update({
      where: { id: user.id },
      data: {
        onboardingStep: "COMPLETE",
        profileCompleteness: 63,
      },
    });

    return res;
  });

  revalidatePath("/assessments");
  revalidatePath("/dashboard");
  revalidatePath("/careers");

  return { success: true, data: result };
}
