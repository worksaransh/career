"use server";

import { prisma } from "@/lib/db/prisma/prisma";
import { requireAuth } from "@/lib/session/session";
import { revalidatePath } from "next/cache";

// ─── Get or create UserMemory ────────────────────────────────────

export async function getUserMemory() {
  const user = await requireAuth();

  let memory = await prisma.userMemory.findUnique({
    where: { userId: user.id },
  });

  if (!memory) {
    // Bootstrap from existing profile data
    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });
    const savedItems = await prisma.savedItem.findMany({
      where: { userId: user.id },
    });

    memory = await prisma.userMemory.create({
      data: {
        userId: user.id,
        demographics: {
          name: user.name || "",
          location: profile?.location || "",
        },
        education: {
          level: profile?.educationLevel || "",
          grade: profile?.currentGrade || "",
        },
        interests: profile?.interests || [],
        preferredLanguage: user.language || "en",
        savedCareers: savedItems
          .filter((s) => s.itemType === "CAREER")
          .map((s) => s.itemId),
        savedColleges: savedItems
          .filter((s) => s.itemType === "COLLEGE")
          .map((s) => s.itemId),
        savedSkills: savedItems
          .filter((s) => s.itemType === "SKILL")
          .map((s) => s.itemId),
      },
    });
  }

  return memory;
}

// ─── Update memory from a question answer ────────────────────────

export async function updateMemoryFromAnswer(
  questionId: string,
  answer: string,
  answerData?: Record<string, unknown>
) {
  const user = await requireAuth();
  const memory = await getUserMemory();

  const question = await prisma.adaptiveQuestion.findUnique({
    where: { id: questionId },
  });
  if (!question) return memory;

  const updates: Record<string, unknown> = {};

  // Map answer to memory based on memoryKey
  if (question.memoryKey) {
    const key = question.memoryKey;
    if (key.startsWith("demographics.")) {
      const field = key.replace("demographics.", "");
      const demo = (memory.demographics as Record<string, unknown>) || {};
      demo[field] = answer;
      updates.demographics = demo;
    } else if (key.startsWith("education.")) {
      const field = key.replace("education.", "");
      const edu = (memory.education as Record<string, unknown>) || {};
      edu[field] = answer;
      updates.education = edu;
    } else if (key.startsWith("marks.")) {
      const field = key.replace("marks.", "");
      const marks = (memory.marks as Record<string, unknown>) || {};
      marks[field] = answer;
      updates.marks = marks;
    } else if (key.startsWith("goals.")) {
      const field = key.replace("goals.", "");
      const goals = (memory.goals as Record<string, unknown>) || {};
      goals[field] = answer;
      updates.goals = goals;
    } else if (key.startsWith("budget.")) {
      const field = key.replace("budget.", "");
      const budget = (memory.budget as Record<string, unknown>) || {};
      budget[field] = answer;
      updates.budget = budget;
    } else if (key.startsWith("personality.")) {
      const field = key.replace("personality.", "");
      const personality = (memory.personality as Record<string, unknown>) || {};
      personality[field] = answer;
      updates.personality = personality;
    } else if (key.startsWith("lifestyle.")) {
      const field = key.replace("lifestyle.", "");
      const lifestyle = (memory.lifestyleSignals as Record<string, unknown>) || {};
      lifestyle[field] = answer;
      updates.lifestyleSignals = lifestyle;
    } else if (key === "interests") {
      // For interest questions, add category if positive answer
      const interests = (memory.interests as string[]) || [];
      const isPositive =
        answer.toLowerCase().includes("yes") ||
        answer.toLowerCase().includes("agree") ||
        answer.toLowerCase().includes("strongly agree");
      if (isPositive && !interests.includes(question.category)) {
        updates.interests = [...interests, question.category];
      }
    }
  }

  // Also add positive-answer categories to interests for behavioral inference
  const isPositive =
    answer.toLowerCase().includes("yes") ||
    answer.toLowerCase().includes("agree") ||
    answer.toLowerCase().includes("strongly");
  if (isPositive && question.category) {
    const interests = (memory.interests as string[]) || [];
    if (!interests.includes(question.category)) {
      updates.interests = [...interests, question.category];
    }
  }

  // Update behavior signals based on category
  const signals = (memory.behaviorSignals as Record<string, number>) || {};
  const categoryKey = question.category.toLowerCase().replace(/\s+/g, "_");
  signals[categoryKey] = (signals[categoryKey] || 0) + (isPositive ? 1 : 0);
  updates.behaviorSignals = signals;

  // Track answered question
  const answeredIds = memory.answeredQuestionIds || [];
  if (!answeredIds.includes(questionId)) {
    updates.answeredQuestionIds = [...answeredIds, questionId];
    updates.totalQuestionsAnswered = (memory.totalQuestionsAnswered || 0) + 1;
  }

  // Recalculate profile completeness
  const totalAnswered = ((updates.totalQuestionsAnswered as number) || memory.totalQuestionsAnswered || 0);
  const completeness = Math.min(100, Math.round(totalAnswered * 1.2 + 10));
  updates.profileCompleteness = completeness;

  const updated = await prisma.userMemory.update({
    where: { id: memory.id },
    data: updates,
  });

  // Also update user profile completeness
  await prisma.user.update({
    where: { id: user.id },
    data: { profileCompleteness: completeness },
  });

  revalidatePath("/dashboard");
  return updated;
}

// ─── Track behavior signals ─────────────────────────────────────

export async function trackBehaviorSignal(
  signal: { type: "page_view" | "search" | "save"; page?: string; query?: string; itemType?: string; itemId?: string }
) {
  const user = await requireAuth();
  const memory = await getUserMemory();

  const signals = (memory.behaviorSignals as Record<string, number>) || {};
  const history = (memory.browsingHistory as Array<{ page: string; at: string }>) || [];

  if (signal.type === "page_view" && signal.page) {
    // Infer interests from page views
    const page = signal.page.toLowerCase();
    if (page.includes("skill") || page.includes("python") || page.includes("coding")) {
      signals.technical = (signals.technical || 0) + 1;
    }
    if (page.includes("marketing") || page.includes("ads") || page.includes("meta")) {
      signals.marketing = (signals.marketing || 0) + 1;
    }
    if (page.includes("design") || page.includes("creative")) {
      signals.creative = (signals.creative || 0) + 1;
    }
    if (page.includes("mba") || page.includes("business") || page.includes("leadership")) {
      signals.leadership = (signals.leadership || 0) + 1;
    }

    // Keep last 50 page views
    history.push({ page: signal.page, at: new Date().toISOString() });
    if (history.length > 50) history.shift();
  }

  if (signal.type === "search" && signal.query) {
    const q = signal.query.toLowerCase();
    if (q.includes("python") || q.includes("code") || q.includes("developer")) {
      signals.technical = (signals.technical || 0) + 2;
    }
    if (q.includes("marketing") || q.includes("ads")) {
      signals.marketing = (signals.marketing || 0) + 2;
    }
  }

  if (signal.type === "save") {
    const updates: Record<string, unknown> = { behaviorSignals: signals };
    if (signal.itemType === "CAREER" && signal.itemId) {
      const saved = memory.savedCareers || [];
      if (!saved.includes(signal.itemId)) {
        updates.savedCareers = [...saved, signal.itemId];
      }
    }
    if (signal.itemType === "COLLEGE" && signal.itemId) {
      const saved = memory.savedColleges || [];
      if (!saved.includes(signal.itemId)) {
        updates.savedColleges = [...saved, signal.itemId];
      }
    }

    await prisma.userMemory.update({
      where: { id: memory.id },
      data: updates,
    });
    return;
  }

  await prisma.userMemory.update({
    where: { id: memory.id },
    data: {
      behaviorSignals: signals,
      browsingHistory: history,
    },
  });
}

// ─── Memory completeness ────────────────────────────────────────

export async function getMemoryCompleteness() {
  const memory = await getUserMemory();

  const fields = [
    { key: "demographics", check: () => {
      const d = memory.demographics as Record<string, unknown>;
      return d && d.location;
    }},
    { key: "education", check: () => {
      const e = memory.education as Record<string, unknown>;
      return e && e.level;
    }},
    { key: "marks", check: () => {
      const m = memory.marks as Record<string, unknown>;
      return m && m.percentage;
    }},
    { key: "interests", check: () => {
      const i = memory.interests as string[];
      return i && i.length > 0;
    }},
    { key: "goals", check: () => {
      const g = memory.goals as Record<string, unknown>;
      return g && (g.shortTerm || g.longTerm);
    }},
    { key: "budget", check: () => {
      const b = memory.budget as Record<string, unknown>;
      return b && (b.educationBudget || b.familyIncome);
    }},
    { key: "personality", check: () => {
      const p = memory.personality as Record<string, unknown>;
      return p && Object.keys(p).length > 0;
    }},
    { key: "skills", check: () => {
      const s = memory.skills as Record<string, unknown>;
      return s && Object.keys(s).length > 0;
    }},
  ];

  const completed = fields.filter((f) => f.check()).map((f) => f.key);
  const missing = fields.filter((f) => !f.check()).map((f) => f.key);
  const percentage = Math.round((completed.length / fields.length) * 100);

  return {
    completed,
    missing,
    percentage,
    totalAnswered: memory.totalQuestionsAnswered || 0,
  };
}

// ─── Privacy: export + delete ───────────────────────────────────

export async function exportUserData() {
  const user = await requireAuth();
  const memory = await getUserMemory();
  const answers = await prisma.userQuestionAnswer.findMany({
    where: { userId: user.id },
    include: { question: true },
  });
  const proficiencies = await prisma.skillProficiency.findMany({
    where: { userId: user.id },
  });

  return {
    user: { id: user.id, name: user.name, email: user.email },
    memory,
    answers: answers.map((a) => ({
      question: a.question.text,
      answer: a.answer,
      answeredAt: a.createdAt,
    })),
    skillProficiencies: proficiencies,
    exportedAt: new Date().toISOString(),
  };
}

export async function deleteUserMemory() {
  const user = await requireAuth();

  await prisma.$transaction([
    prisma.userQuestionAnswer.deleteMany({ where: { userId: user.id } }),
    prisma.skillProficiency.deleteMany({ where: { userId: user.id } }),
    prisma.userMemory.deleteMany({ where: { userId: user.id } }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/privacy-center");
  return { success: true };
}
