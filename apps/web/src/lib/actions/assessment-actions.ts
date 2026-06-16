"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma/prisma";
import { requireAuth } from "@/lib/session/session";

export async function getAssessmentQuestions() {
  await requireAuth();

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
