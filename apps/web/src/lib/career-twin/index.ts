// Career Twin — AI-powered digital twin that mirrors a user's profile and evolves

import type { User } from "@prisma/client";

export interface CareerTwin {
  userId: string;
  version: number;
  profileSnapshot: TwinProfileSnapshot;
  predictedPath: PredictedCareerPath[];
  skillGaps: SkillGap[];
  riskProfile: RiskProfile;
  lastSyncedAt: string;
}

export interface TwinProfileSnapshot {
  education: string;
  currentRole: string;
  yearsOfExperience: number;
  topSkills: string[];
  interests: string[];
  careerGoals: string;
  location: string;
  salaryExpectation: number;
}

export interface PredictedCareerPath {
  career: string;
  probability: number;
  timeframe: string;
  requiredSteps: string[];
}

export interface SkillGap {
  skill: string;
  currentLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  requiredLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  importance: "LOW" | "MEDIUM" | "HIGH";
  suggestedResources: string[];
}

export interface RiskProfile {
  overallRisk: "LOW" | "MEDIUM" | "HIGH";
  automationRisk: number;
  marketRisk: number;
  educationGap: number;
  salarySatisfaction: number;
}

export function buildCareerTwin(
  userId: string,
  profile: Partial<TwinProfileSnapshot>,
  previousTwin?: CareerTwin,
): CareerTwin {
  const version = previousTwin ? previousTwin.version + 1 : 1;

  const predictedPath = generatePredictedPaths(profile);
  const skillGaps = identifySkillGaps(profile);
  const riskProfile = assessRiskProfile(profile);

  return {
    userId,
    version,
    profileSnapshot: {
      education: profile.education ?? "",
      currentRole: profile.currentRole ?? "",
      yearsOfExperience: profile.yearsOfExperience ?? 0,
      topSkills: profile.topSkills ?? [],
      interests: profile.interests ?? [],
      careerGoals: profile.careerGoals ?? "",
      location: profile.location ?? "",
      salaryExpectation: profile.salaryExpectation ?? 0,
    },
    predictedPath,
    skillGaps,
    riskProfile,
    lastSyncedAt: new Date().toISOString(),
  };
}

function generatePredictedPaths(profile: Partial<TwinProfileSnapshot>): PredictedCareerPath[] {
  const paths: PredictedCareerPath[] = [];
  const skills = profile.topSkills ?? [];
  const interests = profile.interests ?? [];
  const hasExperience = (profile.yearsOfExperience ?? 0) > 0;
  const isStudent = profile.currentRole === "Student";

  if (skills.includes("Python") || skills.includes("JavaScript")) {
    paths.push({
      career: "Software Engineer",
      probability: hasExperience ? 0.75 : 0.6,
      timeframe: isStudent ? "3-4 years" : hasExperience ? "1-2 years" : "4-5 years",
      requiredSteps: ["Build portfolio projects", "Learn system design", "Practice DSA"],
    });
  }

  if (interests.includes("Technology") && interests.includes("Business")) {
    paths.push({
      career: "Product Manager",
      probability: 0.5,
      timeframe: "3-5 years",
      requiredSteps: ["Gain technical experience", "Develop leadership skills", "Learn product frameworks"],
    });
  }

  if (skills.includes("Data Analysis") || interests.includes("Science")) {
    paths.push({
      career: "Data Scientist",
      probability: 0.55,
      timeframe: isStudent ? "4-5 years" : "2-3 years",
      requiredSteps: ["Master statistics", "Learn ML frameworks", "Build data portfolio"],
    });
  }

  if (isStudent && (skills.includes("Communication") || interests.includes("Business"))) {
    paths.push({
      career: "Management Consultant",
      probability: 0.4,
      timeframe: "5-7 years",
      requiredSteps: ["Get MBA", "Build analytical skills", "Network in consulting"],
    });
  }

  return paths;
}

function identifySkillGaps(profile: Partial<TwinProfileSnapshot>): SkillGap[] {
  const gaps: SkillGap[] = [];
  const skills = profile.topSkills ?? [];

  const highDemandSkills = [
    { skill: "Data Analysis", requiredLevel: "INTERMEDIATE" as const, importance: "HIGH" as const },
    { skill: "Communication", requiredLevel: "ADVANCED" as const, importance: "HIGH" as const },
    { skill: "Leadership", requiredLevel: "INTERMEDIATE" as const, importance: "MEDIUM" as const },
    { skill: "AI Literacy", requiredLevel: "BEGINNER" as const, importance: "HIGH" as const },
  ];

  for (const demand of highDemandSkills) {
    if (!skills.includes(demand.skill)) {
      gaps.push({
        skill: demand.skill,
        currentLevel: "BEGINNER",
        requiredLevel: demand.requiredLevel,
        importance: demand.importance,
        suggestedResources: [
          `Online course: ${demand.skill} Fundamentals`,
          `Practice project using ${demand.skill}`,
          `Certification in ${demand.skill}`,
        ],
      });
    }
  }

  return gaps;
}

function assessRiskProfile(profile: Partial<TwinProfileSnapshot>): RiskProfile {
  const interests = profile.interests ?? [];
  const isStudent = profile.currentRole === "Student";
  const hasExperience = (profile.yearsOfExperience ?? 0) > 0;

  const techInterest = interests.some((i) => ["Technology", "Engineering", "Science"].includes(i));
  const highRiskCareers = !techInterest && !isStudent;

  return {
    overallRisk: highRiskCareers && !hasExperience ? "HIGH" : !hasExperience ? "MEDIUM" : "LOW",
    automationRisk: techInterest ? 20 : isStudent ? 35 : 50,
    marketRisk: techInterest ? 15 : isStudent ? 25 : 40,
    educationGap: isStudent ? 40 : hasExperience ? 10 : 60,
    salarySatisfaction: (profile.salaryExpectation ?? 0) > 500000 ? 70 : 50,
  };
}
