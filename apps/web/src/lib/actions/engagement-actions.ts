"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma/prisma";
import { requireAuth } from "@/lib/session/session";

// Base questions to seed if DailyQuestion is empty or generic
const SEED_DAILY_QUESTIONS = [
  // School Student
  { text: "Are you planning to choose Science (PCM/PCB), Commerce, or Arts in Class 11/12?", options: JSON.stringify(["Science PCM", "Science PCB", "Commerce", "Arts/Humanities"]), category: "Analytical" },
  { text: "Do you enjoy participating in Olympiads, spelling bees, or science exhibitions?", options: JSON.stringify(["Yes, frequently", "Sometimes", "Never"]), category: "Analytical" },
  { text: "Which subject do you score the highest in?", options: JSON.stringify(["Mathematics/Science", "Languages/Arts", "Social Studies", "Computer Science"]), category: "Analytical" },

  // College Student
  { text: "Have you started building a portfolio or GitHub profile for your projects?", options: JSON.stringify(["Yes, it is active", "Started but not complete", "Not yet"]), category: "Technical" },
  { text: "What is your current CGPA level?", options: JSON.stringify(["9.0+ Excellent", "8.0 - 9.0 Good", "7.0 - 8.0 Average", "Below 7.0"]), category: "Technical" },
  { text: "Are you aiming for on-campus placements or off-campus jobs?", options: JSON.stringify(["On-Campus Placements", "Off-Campus Jobs", "Higher Studies", "Entrepreneurship"]), category: "Leadership" },

  // Working Professional
  { text: "How confident are you with System Design, Backend, or Frontend architectures?", options: JSON.stringify(["Very confident", "Moderately confident", "Beginner level", "N/A"]), category: "Professional" },
  { text: "Have you managed client budgets or led teams of 5+ developers/associates?", options: JSON.stringify(["Yes, extensively", "A few times", "Never"]), category: "Leadership" },
  { text: "What is your primary reason for wanting to switch companies?", options: JSON.stringify(["Higher Salary", "Better Work Culture", "Role/Tech Upgrade", "Remote Flexibility"]), category: "Professional" },

  // Career Switcher
  { text: "How much time per week are you currently dedicating to learn your target role skills?", options: JSON.stringify(["10+ Hours", "5-10 Hours", "Less than 5 Hours", "Not started yet"]), category: "Professional" },
  { text: "What is your risk appetite for transitioning into a new domain?", options: JSON.stringify(["High (quit & learn)", "Medium (switch gradually)", "Low (need offer first)"]), category: "Professional" },

  // Parent
  { text: "What is your target total college budget limit for your child's higher education?", options: JSON.stringify(["Under ₹5L", "₹5L - ₹15L", "₹15L - ₹30L", "₹30L+ / International"]), category: "Parental" },
  { text: "Would you support your child pursuing unconventional career paths (e.g. design, esports)?", options: JSON.stringify(["Yes, fully", "With some guidance", "Prefer traditional paths"]), category: "Parental" }
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
    return engagement;
  }
  
  const diffTime = Math.abs(now.getTime() - lastActive.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let currentStreak = engagement.currentStreak;
  let xpReward = 15;
  let pointsReward = 10;
  
  if (diffDays <= 1 || (diffDays === 2 && now.getDate() - lastActive.getDate() === 1)) {
    currentStreak += 1;
  } else {
    currentStreak = 1;
  }
  
  const longestStreak = Math.max(currentStreak, engagement.longestStreak);
  
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

  await checkAndUnlockBadges(user.id, updated);
  
  revalidatePath("/dashboard");
  return updated;
}

// Get daily smart question for user
export async function getDailySmartQuestion() {
  const user = await requireAuth();

  // Clear generic questions if any and re-seed to make sure options are JSON-stringified arrays
  const count = await prisma.dailyQuestion.count();
  if (count <= 5) {
    await prisma.dailyQuestion.deleteMany({});
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

  const persona = user.primaryPersona ?? "STUDENT";
  
  // Map persona to preferred daily question categories
  const personaCategories: Record<string, string[]> = {
    PARENT: ["Parental", "Leadership"],
    PROFESSIONAL: ["Professional", "Leadership"],
    CAREER_SWITCHER: ["Professional", "Technical", "Analytical"],
    STUDENT: ["Analytical", "Creative"],
    COLLEGE_STUDENT: ["Technical", "Analytical", "Leadership"],
  };
  
  const preferredCategories = personaCategories[persona] ?? ["Analytical", "Technical"];

  // Find first unanswered question that matches preferred categories
  let question = await prisma.dailyQuestion.findFirst({
    where: {
      id: { notIn: answeredIds },
      category: { in: preferredCategories }
    }
  });

  if (!question) {
    // Fallback to any unanswered question
    question = await prisma.dailyQuestion.findFirst({
      where: {
        id: { notIn: answeredIds }
      }
    });
  }

  // Ensure options are parsed if stored as JSON string
  if (question && typeof question.options === "string") {
    try {
      question.options = JSON.parse(question.options);
    } catch (e) {}
  }

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
          totalXP: engagement.totalXP + 30,
          totalPoints: engagement.totalPoints + 20
        }
      });
    }

    // 4. Update UserMemory progressive profiling counters and score dynamics
    const memory = await tx.userMemory.findUnique({
      where: { userId: user.id }
    });
    if (memory) {
      const nextUpgrade = Math.min(100, memory.careerUpgradeScore + 1);
      const nextReadiness = Math.min(100, memory.jobReadinessScore + 2);
      const nextPortfolio = Math.min(100, memory.portfolioScore + 1);
      const nextQuestionsCount = memory.totalQuestionsAnswered + 1;
      const nextCompleteness = Math.min(100, memory.profileCompleteness + 1);

      await tx.userMemory.update({
        where: { userId: user.id },
        data: {
          careerUpgradeScore: nextUpgrade,
          jobReadinessScore: nextReadiness,
          portfolioScore: nextPortfolio,
          totalQuestionsAnswered: nextQuestionsCount,
          profileCompleteness: nextCompleteness
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

