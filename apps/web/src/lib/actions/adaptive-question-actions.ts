"use server";

import { prisma } from "@/lib/db/prisma/prisma";
import { requireAuth } from "@/lib/session/session";
import { revalidatePath } from "next/cache";
import { getUserMemory, updateMemoryFromAnswer } from "./memory-actions";

// ─── Get the highest-value next question for the user ────────────

export async function getNextQuestion(context?: string) {
  const user = await requireAuth();
  const memory = await getUserMemory();
  const answeredIds = memory.answeredQuestionIds || [];

  // Build query filters
  const where: Record<string, unknown> = {
    isActive: true,
    id: { notIn: answeredIds },
  };

  // If context provided, prefer context-matched questions first
  if (context) {
    const contextQuestions = await prisma.adaptiveQuestion.findMany({
      where: {
        ...where,
        contextTrigger: { contains: context },
      },
      orderBy: [{ weight: "desc" }, { difficulty: "asc" }],
      take: 1,
    });

    if (contextQuestions.length > 0) {
      // Verify dependencies are met
      const q = contextQuestions[0]!;
      if (q.dependencies.length === 0 || q.dependencies.every((d) => answeredIds.includes(d))) {
        return q;
      }
    }
  }

  // Fallback: get highest-weight unanswered question with satisfied dependencies
  const candidates = await prisma.adaptiveQuestion.findMany({
    where,
    orderBy: [{ weight: "desc" }, { createdAt: "asc" }],
    take: 20,
  });

  // Filter by dependency satisfaction
  const eligible = candidates.filter(
    (q) => q.dependencies.length === 0 || q.dependencies.every((d) => answeredIds.includes(d))
  );

  // Prioritize by category diversity — pick from least-answered category
  if (eligible.length > 0) {
    const categoryCounts: Record<string, number> = {};
    const answers = await prisma.userQuestionAnswer.findMany({
      where: { userId: user.id },
      include: { question: { select: { category: true } } },
    });
    answers.forEach((a) => {
      const cat = a.question.category;
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    // Sort eligible by least-answered category first, then by weight
    eligible.sort((a, b) => {
      const countA = categoryCounts[a.category] || 0;
      const countB = categoryCounts[b.category] || 0;
      if (countA !== countB) return countA - countB; // Least answered first
      return b.weight - a.weight; // Then highest weight
    });

    return eligible[0] || null;
  }

  return null;
}

// ─── Get a contextual question for a specific page ──────────────

export async function getContextualQuestion(page: string) {
  const user = await requireAuth();
  const memory = await getUserMemory();
  const answeredIds = memory.answeredQuestionIds || [];

  const contextMap: Record<string, string[]> = {
    skills: ["page:skills"],
    careers: ["page:careers"],
    colleges: ["page:colleges"],
    roadmap: ["page:roadmap"],
    parents: ["page:parents"],
    simulator: ["page:simulator"],
    dashboard: ["page:dashboard"],
  };

  const triggers = contextMap[page] || [];
  if (triggers.length === 0) return null;

  const question = await prisma.adaptiveQuestion.findFirst({
    where: {
      isActive: true,
      id: { notIn: answeredIds },
      contextTrigger: { in: triggers },
    },
    orderBy: [{ weight: "desc" }],
  });

  // Verify dependencies
  if (question && question.dependencies.length > 0) {
    const depsMet = question.dependencies.every((d) => answeredIds.includes(d));
    if (!depsMet) return null;
  }

  return question;
}

// ─── Submit an answer ───────────────────────────────────────────

export async function submitQuestionAnswer(
  questionId: string,
  answer: string,
  answerData?: Record<string, unknown>,
  context?: string,
  timeToAnswer?: number
) {
  const user = await requireAuth();

  // Check if already answered
  const existing = await prisma.userQuestionAnswer.findUnique({
    where: {
      userId_questionId: { userId: user.id, questionId },
    },
  });

  if (existing) {
    return { success: false, message: "Already answered" };
  }

  // Save the answer
  await prisma.userQuestionAnswer.create({
    data: {
      userId: user.id,
      questionId,
      answer,
      answerData: (answerData || {}) as any,
      context: context || "unknown",
      timeToAnswer: timeToAnswer || null,
    },
  });

  // Update user memory based on the answer
  await updateMemoryFromAnswer(questionId, answer, answerData);

  // Award XP
  const engagement = await prisma.userEngagement.findUnique({
    where: { userId: user.id },
  });
  if (engagement) {
    await prisma.userEngagement.update({
      where: { id: engagement.id },
      data: {
        totalXP: engagement.totalXP + 25,
        totalPoints: engagement.totalPoints + 15,
      },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/careers");
  revalidatePath("/colleges");

  return { success: true, xpEarned: 25 };
}

// ─── Get question progress stats ────────────────────────────────

export async function getQuestionProgress() {
  const user = await requireAuth();

  const totalAnswered = await prisma.userQuestionAnswer.count({
    where: { userId: user.id },
  });

  const totalQuestions = await prisma.adaptiveQuestion.count({
    where: { isActive: true },
  });

  // Category breakdown
  const answers = await prisma.userQuestionAnswer.findMany({
    where: { userId: user.id },
    include: { question: { select: { category: true } } },
  });

  const categoryBreakdown: Record<string, number> = {};
  answers.forEach((a) => {
    const cat = a.question.category;
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
  });

  return {
    totalAnswered,
    totalQuestions,
    percentage: totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0,
    categoryBreakdown,
    targetQuestions: 100, // Organic target over weeks/months
  };
}

// ─── Dynamic confidence score ───────────────────────────────────

export async function getDynamicConfidence() {
  const user = await requireAuth();
  const memory = await getUserMemory();

  let confidence = 20; // Base confidence
  const missing: string[] = [];
  const improvements: { field: string; boost: number }[] = [];

  // Assessment completed
  const hasAssessment = await prisma.assessmentResult.findFirst({
    where: { userId: user.id },
  });
  if (hasAssessment) {
    confidence += 20;
  } else {
    missing.push("Interest Assessment");
    improvements.push({ field: "Interest Assessment", boost: 20 });
  }

  // Education info
  const edu = memory.education as Record<string, unknown>;
  if (edu && edu.level) {
    confidence += 8;
  } else {
    missing.push("Education Level");
    improvements.push({ field: "Education Level", boost: 8 });
  }

  // Marks
  const marks = memory.marks as Record<string, unknown>;
  if (marks && marks.percentage) {
    confidence += 10;
  } else {
    missing.push("Academic Marks");
    improvements.push({ field: "Academic Marks", boost: 10 });
  }

  // Interests (at least 3)
  const interests = (memory.interests as string[]) || [];
  if (interests.length >= 3) {
    confidence += 10;
  } else {
    missing.push("Career Interests");
    improvements.push({ field: "Career Interests", boost: 10 });
  }

  // Budget info
  const budget = memory.budget as Record<string, unknown>;
  if (budget && (budget.educationBudget || budget.familyIncome)) {
    confidence += 10;
  } else {
    missing.push("Budget Information");
    improvements.push({ field: "Budget Information", boost: 10 });
  }

  // Goals
  const goals = memory.goals as Record<string, unknown>;
  if (goals && (goals.shortTerm || goals.longTerm)) {
    confidence += 7;
  } else {
    missing.push("Career Goals");
    improvements.push({ field: "Career Goals", boost: 7 });
  }

  // Personality traits
  const personality = memory.personality as Record<string, unknown>;
  if (personality && Object.keys(personality).length > 0) {
    confidence += 8;
  } else {
    missing.push("Personality Traits");
    improvements.push({ field: "Personality Traits", boost: 8 });
  }

  // Skills
  const skills = memory.skills as Record<string, unknown>;
  if (skills && Object.keys(skills).length > 0) {
    confidence += 7;
  } else {
    missing.push("Skill Proficiencies");
    improvements.push({ field: "Skill Proficiencies", boost: 7 });
  }

  // Bonus from total questions answered
  const totalAnswered = memory.totalQuestionsAnswered || 0;
  confidence += Math.min(10, Math.floor(totalAnswered / 5));

  confidence = Math.min(100, confidence);

  return {
    confidence,
    missing,
    improvements: improvements.sort((a, b) => b.boost - a.boost).slice(0, 3),
    totalAnswered,
    nextMilestone: totalAnswered < 10 ? 10 : totalAnswered < 25 ? 25 : totalAnswered < 50 ? 50 : 100,
  };
}
