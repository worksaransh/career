"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma/prisma";
import { requireAuth } from "@/lib/session/session";
import { recalculateScores } from "./vault-actions";

// Helper: Get start of the current week (Monday)
function getStartOfWeek() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// Get or generate weekly challenges for user
export async function getWeeklyChallenges() {
  const user = await requireAuth();
  const startOfWeek = getStartOfWeek();

  let challenges = await prisma.weeklyChallenge.findMany({
    where: {
      userId: user.id,
      weekStartDate: startOfWeek,
    },
  });

  if (challenges.length === 0) {
    // Generate 3 personalized weekly challenges
    const challengeTemplates = [
      { title: "Learn 5 Advanced Excel Formulas", description: "Learn VLOOKUP, INDEX-MATCH, SUMIFS, and XLOOKUP formatting rules.", xpReward: 50, scoreImpact: 5 },
      { title: "Complete 1 SQL Join Exercise", description: "Write and execute INNER/LEFT join queries on database schema sets.", xpReward: 50, scoreImpact: 4 },
      { title: "Refine LinkedIn Headline and Summary", description: "Optimize your headline with current interests and goals for searchability.", xpReward: 40, scoreImpact: 3 },
      { title: "Research and Compare 3 Target Colleges", description: "Compare average placement packages, tuition rates, and campus ROI statistics.", xpReward: 40, scoreImpact: 3 },
      { title: "Practice Verbal Communication for 15m", description: "Record yourself explaining a project or walking through your elevator pitch.", xpReward: 50, scoreImpact: 5 },
    ];

    // Pick 3 random templates
    const shuffled = [...challengeTemplates].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    await prisma.weeklyChallenge.createMany({
      data: selected.map((c) => ({
        userId: user.id,
        title: c.title,
        description: c.description,
        xpReward: c.xpReward,
        scoreImpact: c.scoreImpact,
        weekStartDate: startOfWeek,
        isCompleted: false,
      })),
    });

    challenges = await prisma.weeklyChallenge.findMany({
      where: {
        userId: user.id,
        weekStartDate: startOfWeek,
      },
    });
  }

  return challenges;
}

// Complete weekly challenge
export async function completeWeeklyChallenge(id: string) {
  const user = await requireAuth();

  const challenge = await prisma.weeklyChallenge.findUnique({
    where: { id, userId: user.id },
  });

  if (!challenge || challenge.isCompleted) {
    return { success: false, message: "Challenge already completed or invalid" };
  }

  await prisma.$transaction(async (tx) => {
    // 1. Complete challenge
    await tx.weeklyChallenge.update({
      where: { id },
      data: {
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    // 2. Award XP & Points
    const engagement = await tx.userEngagement.findUnique({
      where: { userId: user.id },
    });
    if (engagement) {
      await tx.userEngagement.update({
        where: { id: engagement.id },
        data: {
          totalXP: engagement.totalXP + challenge.xpReward,
          totalPoints: engagement.totalPoints + challenge.xpReward,
        },
      });
    }
  });

  // 3. Recalculate scores (updates Upgrade score based on completion counts)
  await recalculateScores(user.id);

  revalidatePath("/dashboard");
  return { success: true };
}

// Get past reflections
export async function getWeeklyReflections() {
  const user = await requireAuth();
  return prisma.weeklyReflection.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

// Submit a weekly reflection
export async function submitWeeklyReflection(answers: {
  learned: string;
  challenges: string;
  achievement: string;
  goalsNextWeek: string;
  projectsBuilt: string;
  jobsApplied: string;
}) {
  const user = await requireAuth();

  const reflection = await prisma.weeklyReflection.create({
    data: {
      userId: user.id,
      learned: answers.learned,
      challenges: answers.challenges,
      achievement: answers.achievement,
      goalsNextWeek: answers.goalsNextWeek,
      projectsBuilt: answers.projectsBuilt,
      jobsApplied: answers.jobsApplied,
    },
  });

  // Award XP for reflection completion
  const engagement = await prisma.userEngagement.findUnique({
    where: { userId: user.id },
  });
  if (engagement) {
    await prisma.userEngagement.update({
      where: { id: engagement.id },
      data: {
        totalXP: engagement.totalXP + 60, // +60 XP for reflection
        totalPoints: engagement.totalPoints + 40,
      },
    });
  }

  // Create Decision Timeline Event
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonth = months[new Date().getMonth()];
  const currentYear = new Date().getFullYear();

  await prisma.decisionTimelineEvent.create({
    data: {
      userId: user.id,
      month: `${currentMonth} ${currentYear}`,
      activity: `Completed weekly reflection highlighting learning: "${answers.learned.slice(0, 50)}..."`,
      impact: `Synchronized details to Career Twin & updated scores`,
    },
  });

  // Recalculate scores and sync Twin
  await recalculateScores(user.id);

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return { success: true, reflection };
}

// Get decision timeline events
export async function getDecisionTimelineEvents() {
  const user = await requireAuth();

  // Self-seed timeline if empty so user has illustrative starting timeline
  const count = await prisma.decisionTimelineEvent.count({
    where: { userId: user.id },
  });

  if (count === 0) {
    const initialEvents = [
      { month: "January 2026", activity: "Completed onboarding profile setup and registered interests.", impact: "Unlocked Career Match engine" },
      { month: "February 2026", activity: "Completed Technical & Analytical Interest Assessment.", impact: "AI identified strong Software Engineer alignment" },
    ];
    await prisma.decisionTimelineEvent.createMany({
      data: initialEvents.map((e) => ({
        userId: user.id,
        month: e.month,
        activity: e.activity,
        impact: e.impact,
      })),
    });
  }

  return prisma.decisionTimelineEvent.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });
}
