"use server";

import { prisma } from "@/lib/db/prisma/prisma";
import { requireAuth } from "@/lib/session/session";
import { revalidatePath } from "next/cache";
import { getUserMemory, updateMemoryFromAnswer } from "./memory-actions";

// Verification Questions Dictionary for imported skills
const VERIFICATION_QUESTIONS: Record<string, Array<{
  text: string;
  type: string;
  category: string;
  options: Array<{ id: string; text: string }>;
  correctAnswer: string;
}>> = {
  python: [
    {
      text: "Based on Python in your resume: Which of the following is used to handle exceptions in Python?",
      type: "MCQ",
      category: "Technical",
      options: [
        { id: "A", text: "try...except" },
        { id: "B", text: "try...catch" },
        { id: "C", text: "do...catch" },
        { id: "D", text: "throw...catch" }
      ],
      correctAnswer: "A"
    }
  ],
  excel: [
    {
      text: "Based on Excel in your resume: Which formula is best suited to retrieve data from a specific column in another table?",
      type: "MCQ",
      category: "Technical",
      options: [
        { id: "A", text: "XLOOKUP or VLOOKUP" },
        { id: "B", text: "INDEX without MATCH" },
        { id: "C", text: "HLOOKUP only" },
        { id: "D", text: "FILTER only" }
      ],
      correctAnswer: "A"
    }
  ],
  sql: [
    {
      text: "Based on SQL in your resume: Which clause is used to filter query results aggregated by a GROUP BY clause?",
      type: "MCQ",
      category: "Technical",
      options: [
        { id: "A", text: "HAVING" },
        { id: "B", text: "WHERE" },
        { id: "C", text: "LIMIT" },
        { id: "D", text: "SORT BY" }
      ],
      correctAnswer: "A"
    }
  ],
  react: [
    {
      text: "Based on React/JavaScript in your resume: Which hook would you use to perform side effects in a functional component?",
      type: "MCQ",
      category: "Technical",
      options: [
        { id: "A", text: "useEffect" },
        { id: "B", text: "useState" },
        { id: "C", text: "useContext" },
        { id: "D", text: "useReducer" }
      ],
      correctAnswer: "A"
    }
  ],
  leadership: [
    {
      text: "Based on Leadership in your resume: A key developer disagrees with the technical roadmap. How do you resolve this?",
      type: "MCQ",
      category: "Leadership",
      options: [
        { id: "A", text: "Schedule a 1-to-1 to understand their concerns and seek alignment." },
        { id: "B", text: "Overrule their opinion and demand compliance." },
        { id: "C", text: "Reassign the developer to a different project." },
        { id: "D", text: "Let the team vote without discussing the merits." }
      ],
      correctAnswer: "A"
    }
  ]
};

// ─── Get the highest-value next question for the user ────────────

export async function getNextQuestion(context?: string) {
  const user = await requireAuth();
  const memory = await getUserMemory();
  const answeredIds = memory.answeredQuestionIds || [];

  // 1. Dynamic Skill Verification Priority
  const unverifiedSkills = await prisma.skillProficiency.findMany({
    where: { userId: user.id, verified: false },
    take: 5
  });

  for (const skillProf of unverifiedSkills) {
    const nameKey = skillProf.skillName.toLowerCase();
    const qList = VERIFICATION_QUESTIONS[nameKey];
    if (qList && qList[0]) {
      const virtualId = `verify:${skillProf.skillName}:0`;
      const answered = answeredIds.includes(virtualId);
      if (!answered) {
        return {
          id: virtualId,
          text: qList[0].text,
          type: qList[0].type,
          options: qList[0].options as any,
          category: qList[0].category,
          subcategory: "Verification",
          difficulty: "MEDIUM",
          weight: 0.9,
          dependencies: [],
          contextTrigger: "verify",
          memoryKey: `skills.${skillProf.skillName}`,
          language: "en",
          isActive: true
        };
      }
    }
  }

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

  // Handle Virtual Skill Verification questions
  if (questionId.startsWith("verify:")) {
    const parts = questionId.split(":");
    const skillName = parts[1];
    if (!skillName) {
      return { success: false, message: "Invalid skill verification question ID" };
    }
    const nameKey = skillName.toLowerCase();
    const qList = VERIFICATION_QUESTIONS[nameKey];
    if (!qList || !qList[0]) {
      return { success: false, message: "No verification questions found for this skill" };
    }
    
    const firstQ = qList[0];
    const opt = firstQ.options.find(o => o.id === firstQ.correctAnswer);
    const isCorrect = answer.toUpperCase().trim() === firstQ.correctAnswer || 
                      answer.toLowerCase().trim() === (opt?.text?.toLowerCase() || "");

    if (isCorrect) {
      await prisma.skillProficiency.update({
        where: {
          userId_skillName: {
            userId: user.id,
            skillName,
          }
        },
        data: {
          verified: true,
          confidence: 95,
          inferred: 85,
        }
      });
    }

    // Save answer
    await prisma.userQuestionAnswer.create({
      data: {
        userId: user.id,
        questionId,
        answer,
        answerData: { isCorrect, verifiedSkill: skillName } as any,
        context: "skill_verification",
        timeToAnswer: timeToAnswer || null,
      }
    });

    // Update answered list in user memory
    const memory = await getUserMemory();
    const answeredIds = memory.answeredQuestionIds || [];
    if (!answeredIds.includes(questionId)) {
      await prisma.userMemory.update({
        where: { id: memory.id },
        data: {
          answeredQuestionIds: [...answeredIds, questionId],
          totalQuestionsAnswered: (memory.totalQuestionsAnswered || 0) + 1,
        }
      });
    }

    // Award XP
    const engagement = await prisma.userEngagement.findUnique({
      where: { userId: user.id },
    });
    if (engagement) {
      await prisma.userEngagement.update({
        where: { id: engagement.id },
        data: {
          totalXP: engagement.totalXP + 35, // Premium verification XP
          totalPoints: engagement.totalPoints + 20,
        },
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/vault");
    return { success: true, xpEarned: 35 };
  }

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
