"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma/prisma";
import { requireAuth } from "@/lib/session/session";

// Base questions to seed if DailyQuestion is empty
const SEED_DAILY_QUESTIONS = [
  { text: "Do you enjoy solving complex logic puzzles?", options: ["Yes, very much", "Sometimes", "Not really"], category: "Analytical" },
  { text: "Do you like mentoring or helping others solve their problems?", options: ["Yes", "Maybe", "No"], category: "Social" },
  { text: "Do you enjoy creating digital art, drawings, or layouts?", options: ["Strongly Agree", "Agree", "Disagree"], category: "Creative" },
  { text: "Are you interested in coding, scripting, or hardware configurations?", options: ["Yes, definitely", "Curious about it", "Not at all"], category: "Technical" },
  { text: "Do you enjoy managing team activities or organizing events?", options: ["Yes", "Neutral", "No"], category: "Leadership" }
];

// Helper: Get or initialize user engagement profile
export async function getEngagementProfile() {
  const user = await requireAuth();

  let engagement = await prisma.userEngagement.findUnique({
    where: { userId: user.id }
  });

  if (!engagement) {
    engagement = await prisma.userEngagement.create({
      data: {
        userId: user.id,
        currentStreak: 0,
        longestStreak: 0,
        totalXP: 0,
        totalPoints: 0,
        lastActiveAt: new Date(Date.now() - 48 * 60 * 60 * 1000) // 2 days ago
      }
    });
  }

  return engagement;
}

// Track streak daily and reward XP
export async function recordActivityAndGetStreak() {
  const user = await requireAuth();
  
  let engagement = await getEngagementProfile();
  const now = new Date();
  
  const lastActive = new Date(engagement.lastActiveAt);
  const todayStr = now.toISOString().slice(0, 10);
  const lastActiveStr = lastActive.toISOString().slice(0, 10);
  
  if (todayStr === lastActiveStr) {
    // Already active today, return existing status
    return engagement;
  }
  
  // Calculate difference in days
  const diffTime = Math.abs(now.getTime() - lastActive.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let currentStreak = engagement.currentStreak;
  let xpReward = 15; // default login XP
  let pointsReward = 10;
  
  if (diffDays <= 1 || (diffDays === 2 && now.getDate() - lastActive.getDate() === 1)) {
    // Active yesterday, increment streak
    currentStreak += 1;
  } else {
    // Missed a day or more, reset streak
    currentStreak = 1;
  }
  
  const longestStreak = Math.max(currentStreak, engagement.longestStreak);
  
  // Check streak milestone achievements
  const milestonesClaimed = [...engagement.milestonesClaimed];
  const milestones = [
    { key: "7_DAYS", limit: 7, bonusXP: 100, bonusPoints: 100 },
    { key: "30_DAYS", limit: 30, bonusXP: 500, bonusPoints: 500 },
    { key: "100_DAYS", limit: 100, bonusXP: 2000, bonusPoints: 2000 },
    { key: "365_DAYS", limit: 365, bonusXP: 10000, bonusPoints: 10000 }
  ];
  
  milestones.forEach((m) => {
    if (currentStreak >= m.limit && !milestonesClaimed.includes(m.key)) {
      milestonesClaimed.push(m.key);
      xpReward += m.bonusXP;
      pointsReward += m.bonusPoints;
    }
  });

  const updated = await prisma.userEngagement.update({
    where: { id: engagement.id },
    data: {
      currentStreak,
      longestStreak,
      totalXP: engagement.totalXP + xpReward,
      totalPoints: engagement.totalPoints + pointsReward,
      lastActiveAt: now,
      milestonesClaimed
    }
  });

  // Re-verify unlockable badges based on state
  await checkAndUnlockBadges(user.id, updated);
  
  revalidatePath("/dashboard");
  return updated;
}

// Get daily smart question for user
export async function getDailySmartQuestion() {
  const user = await requireAuth();

  // Self-seed questions if empty
  const count = await prisma.dailyQuestion.count();
  if (count === 0) {
    await prisma.dailyQuestion.createMany({
      data: SEED_DAILY_QUESTIONS
    });
  }

  // Find answered questions
  const answered = await prisma.dailyAnswer.findMany({
    where: { userId: user.id },
    select: { questionId: true }
  });
  const answeredIds = answered.map(a => a.questionId);

  // Find first unanswered question
  const question = await prisma.dailyQuestion.findFirst({
    where: {
      id: { notIn: answeredIds }
    }
  });

  return question;
}

// Submit answer for daily question and update profile/XP
export async function submitDailyAnswer(questionId: string, answerText: string) {
  const user = await requireAuth();

  const existing = await prisma.dailyAnswer.findUnique({
    where: {
      userId_questionId: { userId: user.id, questionId }
    }
  });

  if (existing) {
    throw new Error("You have already answered this question.");
  }

  const question = await prisma.dailyQuestion.findUnique({
    where: { id: questionId }
  });

  if (!question) {
    throw new Error("Question not found.");
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create Answer record
    const ans = await tx.dailyAnswer.create({
      data: {
        userId: user.id,
        questionId,
        answer: answerText
      }
    });

    // 2. Update profile interests based on answer mapping
    if (answerText.toLowerCase().includes("yes") || answerText.toLowerCase().includes("agree")) {
      const profile = await tx.userProfile.findUnique({
        where: { userId: user.id }
      });
      if (profile && !profile.interests.includes(question.category)) {
        await tx.userProfile.update({
          where: { userId: user.id },
          data: {
            interests: { push: question.category }
          }
        });
      }
    }

    // 3. Award XP & Points
    const engagement = await tx.userEngagement.findUnique({
      where: { userId: user.id }
    });
    if (engagement) {
      await tx.userEngagement.update({
        where: { id: engagement.id },
        data: {
          totalXP: engagement.totalXP + 30, // +30 XP
          totalPoints: engagement.totalPoints + 20
        }
      });
    }

    return ans;
  });

  revalidatePath("/dashboard");
  revalidatePath("/careers");
  return { success: true, answer: result };
}

// Get/Create daily tasks checklist
export async function getDailyTasks() {
  const user = await requireAuth();
  const todayStr = new Date().toISOString().slice(0, 10);

  let tasks = await prisma.dailyTask.findMany({
    where: { userId: user.id, date: todayStr }
  });

  if (tasks.length === 0) {
    // Generate default task checklist for the day
    const defaultTasks = [
      { title: "Answer today's smart question", description: "Answer the personalized question on dashboard.", xpReward: 15 },
      { title: "Review career recommendations", description: "Check out your matching careers list.", xpReward: 10 },
      { title: "Compare colleges or degrees", description: "Look up university outcomes.", xpReward: 15 },
      { title: "Read daily insight news", description: "Read SQL, AI, or industry update feeds.", xpReward: 10 }
    ];

    await prisma.dailyTask.createMany({
      data: defaultTasks.map(t => ({
        userId: user.id,
        title: t.title,
        description: t.description,
        xpReward: t.xpReward,
        date: todayStr,
        isCompleted: false
      }))
    });

    tasks = await prisma.dailyTask.findMany({
      where: { userId: user.id, date: todayStr }
    });
  }

  return tasks;
}

// Complete daily task and reward XP
export async function completeDailyTask(taskId: string) {
  const user = await requireAuth();

  const task = await prisma.dailyTask.findUnique({
    where: { id: taskId }
  });

  if (!task || task.userId !== user.id) {
    throw new Error("Task not found.");
  }

  if (task.isCompleted) {
    return task;
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedTask = await tx.dailyTask.update({
      where: { id: taskId },
      data: {
        isCompleted: true,
        completedAt: new Date()
      }
    });

    const engagement = await tx.userEngagement.findUnique({
      where: { userId: user.id }
    });

    if (engagement) {
      await tx.userEngagement.update({
        where: { id: engagement.id },
        data: {
          totalXP: engagement.totalXP + task.xpReward,
          totalPoints: engagement.totalPoints + task.xpReward
        }
      });
    }

    return updatedTask;
  });

  revalidatePath("/dashboard");
  return result;
}

// Fetch all badges and unlock criteria
export async function getAchievementBadges() {
  const user = await requireAuth();

  const earned = await prisma.achievementBadge.findMany({
    where: { userId: user.id }
  });
  const earnedTypes = earned.map(e => e.badgeType);

  const badgeTemplates = [
    { type: "EXPLORER", title: "Explorer", description: "Analyze your matched career paths." },
    { type: "FUTURE_PLANNER", title: "Future Planner", description: "Complete the Interest Assessment questionnaire." },
    { type: "SCHOLARSHIP_HUNTER", title: "Scholarship Hunter", description: "Inspect available university scholarships." },
    { type: "CONSISTENCY_CHAMPION", title: "Consistency Champion", description: "Achieve a 7-day daily activity streak." },
    { type: "PARENT_ADVISOR", title: "Parent Advisor", description: "Examine future projections on the Parent Dashboard." },
    { type: "SKILL_BUILDER", title: "Skill Builder", description: "Review required skills in the acquisitions panel." }
  ];

  return badgeTemplates.map(t => ({
    ...t,
    isUnlocked: earnedTypes.includes(t.type),
    unlockedAt: earned.find(e => e.badgeType === t.type)?.unlockedAt || null
  }));
}

// Internal badge verification engine
async function checkAndUnlockBadges(userId: string, engagement: any) {
  const latestResult = await prisma.assessmentResult.findFirst({
    where: { userId }
  });

  const checkUnlock = async (type: string, title: string, desc: string, condition: boolean) => {
    if (condition) {
      const exists = await prisma.achievementBadge.findUnique({
        where: { userId_badgeType: { userId, badgeType: type } }
      });
      if (!exists) {
        await prisma.achievementBadge.create({
          data: { userId, badgeType: type, title, description: desc }
        });
      }
    }
  };

  // 1. Future Planner
  await checkUnlock("FUTURE_PLANNER", "Future Planner", "Completed Interest Assessment", latestResult !== null);
  // 2. Consistency Champion
  await checkUnlock("CONSISTENCY_CHAMPION", "Consistency Champion", "Maintained a 7-day daily activity streak", engagement.currentStreak >= 7);
  // 3. Explorer
  await checkUnlock("EXPLORER", "Explorer", "Viewed recommended career pathways", latestResult !== null);
}

// Simulate Referral signup unlock
export async function processReferral(referralCode: string) {
  const user = await requireAuth();
  
  if (!referralCode.trim()) return { success: false, message: "Invalid referral code" };

  const engagement = await getEngagementProfile();
  
  await prisma.userEngagement.update({
    where: { id: engagement.id },
    data: {
      totalXP: engagement.totalXP + 100, // +100 XP for referral signup
      totalPoints: engagement.totalPoints + 50
    }
  });

  revalidatePath("/dashboard");
  return { success: true, message: "Referral applied successfully! 100 XP earned." };
}

// Curator for static daily career news based on saved profile settings
export async function getDailyCareerNews() {
  const user = await requireAuth();
  
  const newsItems = [
    { title: "AI developments reshape software engineering pathways", industry: "Technology", link: "https://www.google.com/search?q=ai+trends+in+software+development" },
    { title: "Global demand surge for Certified Data Architects", industry: "Data Science", link: "https://www.google.com/search?q=data+architect+hiring+updates" },
    { title: "New government MCM scholarships open for university students", industry: "Education", link: "https://www.google.com/search?q=latest+scholarship+announcements" },
    { title: "Startups look to recruit remote product strategy specialists", industry: "Business", link: "https://www.google.com/search?q=product+manager+startup+news" }
  ];

  return newsItems;
}

// Fetch dynamic engagement insights
export async function getDailyInsights() {
  return [
    { text: "Students like you who learned Python increased average starting salary potential by 15%." },
    { text: "This week's highest-growth career path in the database is Data Scientist (+28%)." }
  ];
}

// Admin Actions: Daily Question Management
export async function listDailyQuestions() {
  await requireAuth();
  return prisma.dailyQuestion.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export async function createDailyQuestion(text: string, options: string[], category: string) {
  await requireAuth();
  const newQ = await prisma.dailyQuestion.create({
    data: {
      text,
      options,
      category
    }
  });
  revalidatePath("/admin/settings/engagement");
  revalidatePath("/dashboard");
  return newQ;
}

export async function deleteDailyQuestion(id: string) {
  await requireAuth();
  await prisma.dailyQuestion.delete({
    where: { id }
  });
  revalidatePath("/admin/settings/engagement");
  revalidatePath("/dashboard");
  return { success: true };
}

// Admin Actions: Hiring Company Management
export async function listHiringCompanies() {
  return prisma.hiringCompany.findMany({
    orderBy: { name: "asc" }
  });
}

export async function createHiringCompany(name: string, logoUrl: string, careers: string[]) {
  await requireAuth();
  const company = await prisma.hiringCompany.create({
    data: {
      name,
      logoUrl,
      careers
    }
  });
  revalidatePath("/admin/settings/engagement");
  revalidatePath("/parents");
  return company;
}

export async function deleteHiringCompany(id: string) {
  await requireAuth();
  await prisma.hiringCompany.delete({
    where: { id }
  });
  revalidatePath("/admin/settings/engagement");
  revalidatePath("/parents");
  return { success: true };
}

// Admin Actions: XP Rules & Milestones Settings
export async function getEngagementSettings() {
  const keys = [
    "xp_login_reward",
    "xp_question_reward",
    "xp_task_reward",
    "xp_streak_7",
    "xp_streak_30",
    "xp_streak_100",
    "xp_streak_365"
  ];
  
  const settings = await prisma.systemSetting.findMany({
    where: {
      key: { in: keys }
    }
  });
  
  const defaults: Record<string, string> = {
    xp_login_reward: "15",
    xp_question_reward: "30",
    xp_task_reward: "10",
    xp_streak_7: "100",
    xp_streak_30: "500",
    xp_streak_100: "2000",
    xp_streak_365: "10000"
  };
  
  const result: Record<string, string> = { ...defaults };
  settings.forEach(s => {
    result[s.key] = s.value;
  });
  
  return result;
}

export async function updateEngagementSettings(settingsMap: Record<string, string>) {
  await requireAuth();
  const operations = Object.entries(settingsMap).map(([key, value]) => {
    return prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { 
        key, 
        value, 
        description: `Engagement configuration setting: ${key}`,
        category: "ENGAGEMENT"
      }
    });
  });
  
  await prisma.$transaction(operations);
  revalidatePath("/admin/settings/engagement");
  revalidatePath("/dashboard");
  return { success: true };
}

