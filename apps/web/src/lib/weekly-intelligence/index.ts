// Dynamic Weekly Intelligence — personalized weekly insights and nudges

import type { User } from "@prisma/client";

export interface WeeklyIntelligence {
  userId: string;
  weekStart: string;
  weekEnd: string;
  title: string;
  summary: string;
  insights: Insight[];
  nudge: Nudge | null;
  trendingCareers: TrendingCareer[];
  recommendedActions: RecommendedAction[];
  quote: MotivationalQuote;
}

export interface Insight {
  type: "PROFILE" | "MARKET" | "SKILL" | "APPLICATION" | "GROWTH";
  message: string;
  severity: "INFO" | "SUCCESS" | "WARNING";
}

export interface Nudge {
  message: string;
  action: string;
  actionUrl: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
}

export interface TrendingCareer {
  title: string;
  trend: "UP" | "DOWN" | "NEW";
  percentageChange: number;
  reason: string;
}

export interface RecommendedAction {
  id: string;
  title: string;
  description: string;
  effort: "LOW" | "MEDIUM" | "HIGH";
  impact: "LOW" | "MEDIUM" | "HIGH";
  category: "LEARN" | "APPLY" | "NETWORK" | "RESEARCH";
}

export interface MotivationalQuote {
  text: string;
  author: string;
}

const QUOTES: MotivationalQuote[] = [
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Your career is a marathon, not a sprint. Keep learning, keep growing.", author: "Unknown" },
  { text: "The best time to start was yesterday. The next best time is now.", author: "Unknown" },
  { text: "Skill is the new currency. Invest wisely.", author: "Unknown" },
  { text: "Don't find a job, build a career that matters.", author: "Unknown" },
  { text: "Every expert was once a beginner.", author: "Unknown" },
];

export function generateWeeklyIntelligence(userId: string, profile: Partial<User>): WeeklyIntelligence {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const insights: Insight[] = [];
  const trending: TrendingCareer[] = [];
  const actions: RecommendedAction[] = [];

  const profileComplete = (profile as any).profileComplete ?? false;
  if (!profileComplete) {
    insights.push({ type: "PROFILE", message: "Complete your profile to unlock personalized recommendations", severity: "WARNING" });
  } else {
    insights.push({ type: "PROFILE", message: "Your profile is complete — getting the best recommendations!", severity: "SUCCESS" });
  }

  trending.push(
    { title: "AI/ML Engineer", trend: "UP", percentageChange: 35, reason: "AI boom driving demand" },
    { title: "Data Analyst", trend: "UP", percentageChange: 22, reason: "Data-driven decisions across industries" },
    { title: "Cybersecurity Analyst", trend: "UP", percentageChange: 28, reason: "Rising security threats" },
  );

  actions.push(
    { id: "1", title: "Explore AI/ML Career Path", description: "Learn about the skills needed for AI/ML roles", effort: "LOW", impact: "HIGH", category: "RESEARCH" },
    { id: "2", title: "Update Your Skills", description: "Add your latest skills for better matching", effort: "LOW", impact: "MEDIUM", category: "LEARN" },
    { id: "3", title: "Compare Career Options", description: "Use the comparison tool to evaluate paths", effort: "MEDIUM", impact: "HIGH", category: "RESEARCH" },
  );

  const priority: "LOW" | "MEDIUM" | "HIGH" = profileComplete ? "MEDIUM" : "HIGH";
  const nudge: Nudge = {
    message: profileComplete ? "New AI/ML careers trending this week — explore now!" : "Complete your profile to get started",
    action: profileComplete ? "Explore Trends" : "Complete Profile",
    actionUrl: profileComplete ? "/explore" : "/profile",
    priority,
  };

  return {
    userId,
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    title: `Your Weekly Career Intel — ${weekStart.toLocaleDateString("en-IN", { month: "long", day: "numeric" })}`,
    summary: profileComplete
      ? "This week we've spotted growing demand in AI/ML and cybersecurity roles. Your profile is in great shape!"
      : "We've prepared insights based on market trends. Complete your profile to see what fits you best.",
    insights,
    nudge,
    trendingCareers: trending,
    recommendedActions: actions,
    quote: QUOTES[Math.floor(Math.random() * QUOTES.length)] ?? QUOTES[0]!,
  };
}
