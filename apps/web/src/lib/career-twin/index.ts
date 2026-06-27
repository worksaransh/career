// Career Twin — AI-powered digital twin that mirrors a user's profile and evolves

import { env } from "@/env";
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

export async function buildCareerTwin(
  userId: string,
  profile: Partial<TwinProfileSnapshot>,
  previousTwin?: CareerTwin,
): Promise<CareerTwin> {
  const version = previousTwin ? previousTwin.version + 1 : 1;

  const profileSnapshot: TwinProfileSnapshot = {
    education: profile.education ?? "Not Provided",
    currentRole: profile.currentRole ?? "Explorer",
    yearsOfExperience: profile.yearsOfExperience ?? 0,
    topSkills: profile.topSkills ?? [],
    interests: profile.interests ?? [],
    careerGoals: profile.careerGoals ?? "Exploring Options",
    location: profile.location ?? "Remote",
    salaryExpectation: profile.salaryExpectation ?? 600000,
  };

  let predictedPath: PredictedCareerPath[] = [];
  let skillGaps: SkillGap[] = [];
  let riskProfile: RiskProfile | null = null;

  const apiKey = process.env.OPENAI_API_KEY || env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      console.log(`[AI Twin] Querying OpenAI LLM for user ${userId}...`);
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `You are the core AI intelligence engine of Career GPS AI. Given the user's profile details, generate:
1. predictedPath (3 items): careers the user is suited for, with probability (0.0 to 1.0), timeframe (e.g. "1-2 years"), and a list of requiredSteps.
2. skillGaps (3-4 items): missing in-demand skills they should learn, specifying currentLevel (BEGINNER/INTERMEDIATE/ADVANCED), requiredLevel (BEGINNER/INTERMEDIATE/ADVANCED/EXPERT), importance (LOW/MEDIUM/HIGH), and a list of 2-3 specific suggestedResources.
3. riskProfile: overallRisk (LOW/MEDIUM/HIGH), and numeric percentage scores (0-100) for automationRisk, marketRisk, educationGap, and salarySatisfaction.

You MUST respond strictly in valid JSON format using the exact schema:
{
  "predictedPath": [
    {
      "career": "string",
      "probability": number,
      "timeframe": "string",
      "requiredSteps": ["string"]
    }
  ],
  "skillGaps": [
    {
      "skill": "string",
      "currentLevel": "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
      "requiredLevel": "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT",
      "importance": "LOW" | "MEDIUM" | "HIGH",
      "suggestedResources": ["string"]
    }
  ],
  "riskProfile": {
    "overallRisk": "LOW" | "MEDIUM" | "HIGH",
    "automationRisk": number,
    "marketRisk": number,
    "educationGap": number,
    "salarySatisfaction": number
  }
}`
            },
            {
              role: "user",
              content: JSON.stringify(profileSnapshot)
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API responded with status ${response.status}`);
      }

      const resultData = await response.json();
      const aiResponse = JSON.parse(resultData.choices[0]?.message?.content ?? "{}");

      if (aiResponse.predictedPath && aiResponse.skillGaps && aiResponse.riskProfile) {
        predictedPath = aiResponse.predictedPath;
        skillGaps = aiResponse.skillGaps;
        riskProfile = aiResponse.riskProfile;
      } else {
        throw new Error("Invalid schema structure returned from OpenAI");
      }
    } catch (err) {
      console.error("[AI Twin] Failed to fetch from OpenAI, falling back to local heuristics:", err);
    }
  } else {
    console.warn("[AI Twin] OpenAI API Key is missing. Falling back to rule-based heuristics.");
  }

  // Fallback to heuristics if AI generation failed or wasn't run
  if (predictedPath.length === 0) {
    predictedPath = generatePredictedPaths(profileSnapshot);
  }
  if (skillGaps.length === 0) {
    skillGaps = identifySkillGaps(profileSnapshot);
  }
  if (!riskProfile) {
    riskProfile = assessRiskProfile(profileSnapshot);
  }

  return {
    userId,
    version,
    profileSnapshot,
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
