// Graph-based recommendation engine — traverses entity relationships

import { prisma } from "@/lib/db/prisma/prisma";
import { getCached, setCache } from "./index";
import { jaccardSimilarity, cosineSimilarity, interestSimilarity } from "./similarity";

export interface RecommendationScore {
  itemId: string;
  itemType: "CAREER" | "DEGREE" | "COLLEGE" | "SKILL" | "CERTIFICATION";
  score: number;
  reasons: string[];
  explanation: string;
  confidence: number;
  missingData: string[];
}

export async function getRecommendations(
  userId: string,
  type: "CAREER" | "DEGREE" | "COLLEGE" | "SKILL",
  limit = 10,
): Promise<RecommendationScore[]> {
  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  const savedItems = await prisma.savedItem.findMany({ where: { userId } });

  const userInterests = profile?.interests ?? [];
  const savedCareers = savedItems.filter((s) => s.itemType === "CAREER").map((s) => s.itemId);
  const savedColleges = savedItems.filter((s) => s.itemType === "COLLEGE").map((s) => s.itemId);

  const preferences = (profile?.preferences as Record<string, any>) || {};

  // Progressive profiling parameters
  const userMarks = preferences.marks ? Number(preferences.marks) : null;
  const userBudget = preferences.budget ? Number(preferences.budget) : null;
  const userFamilyIncome = preferences.familyIncome ? Number(preferences.familyIncome) : null;
  const preferredCity = preferences.preferredCity || null;

  // Calculate dynamic confidence score (65% base with assessment, up to 100% with extra fields)
  const hasAssessment = await prisma.assessmentResult.findFirst({ where: { userId } });
  let confidence = hasAssessment ? 65 : 40;
  const missingData: string[] = [];

  if (userMarks !== null) confidence += 10;
  else missingData.push("marks");

  if (userBudget !== null) confidence += 15;
  else missingData.push("budget");

  if (preferredCity !== null) confidence += 10;
  else missingData.push("preferredCity");

  let results: RecommendationScore[] = [];

  switch (type) {
    case "CAREER":
      results = await recommendCareers(
        userInterests,
        savedCareers,
        userId,
        userMarks,
        confidence,
        missingData,
        limit
      );
      break;
    case "DEGREE":
      results = await recommendDegrees(
        userInterests,
        savedCareers,
        savedColleges,
        userBudget,
        confidence,
        missingData,
        limit
      );
      break;
    case "COLLEGE":
      results = await recommendColleges(
        userInterests,
        savedCareers,
        savedColleges,
        userBudget,
        userFamilyIncome,
        preferredCity,
        userMarks,
        confidence,
        missingData,
        limit
      );
      break;
    case "SKILL":
      results = await recommendSkills(
        savedCareers,
        userId,
        confidence,
        missingData,
        limit
      );
      break;
  }

  return results;
}

async function recommendCareers(
  interests: string[],
  savedCareers: string[],
  userId: string,
  userMarks: number | null,
  confidence: number,
  missingData: string[],
  limit: number,
): Promise<RecommendationScore[]> {
  const assessmentResults = await prisma.assessmentResult.findMany({
    where: { userId },
    orderBy: { completedAt: "desc" },
    take: 1,
  });

  const topScores = assessmentResults[0]?.scores as Record<string, number> | undefined;
  const careers = await prisma.career.findMany({ where: { isActive: true } });

  return careers
    .filter((c) => !savedCareers.includes(c.id))
    .map((career) => {
      const careerSkills = career.requiredSkills;
      const interestScore = interests.length > 0 ? interestSimilarity(interests, careerSkills) : 0.3;

      const aiRiskScore = career.aiRiskLevel === "LOW" ? 1 : career.aiRiskLevel === "MEDIUM" ? 0.5 : 0.1;
      const demandScore = career.demandLevel === "HIGH" ? 1 : career.demandLevel === "MEDIUM" ? 0.6 : 0.3;

      let categoryScore = 0.4;
      if (topScores) {
        categoryScore = Object.entries(topScores).reduce((acc, [k, v]) => {
          const match = careerSkills.some((s) => s.toLowerCase().includes(k.toLowerCase()));
          return acc + (match ? v / 5 : 0);
        }, 0) / Math.max(Object.keys(topScores).length, 1);
      }

      // If user marks are high, boost complex analytical/engineering careers
      let marksBoost = 0;
      if (userMarks && userMarks > 85 && (career.title.toLowerCase().includes("engineer") || career.title.toLowerCase().includes("scientist"))) {
        marksBoost = 0.15;
      }

      const score = Math.min(1.0, interestScore * 0.25 + aiRiskScore * 0.2 + demandScore * 0.2 + categoryScore * 0.2 + marksBoost);
      const reasons: string[] = [];
      if (interestScore > 0.5) reasons.push("Strong alignment with interests");
      if (aiRiskScore > 0.7) reasons.push("Highly resilient to AI automation");
      if (demandScore > 0.7) reasons.push("Exponential hiring demand");
      if (marksBoost > 0) reasons.push("Matches academic performance benchmarks");

      return {
        itemId: career.id,
        itemType: "CAREER" as const,
        score,
        reasons: reasons.slice(0, 3),
        explanation: reasons.slice(0, 2).join(". ") || "Based on market opportunities and profile alignment",
        confidence,
        missingData
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

async function recommendDegrees(
  interests: string[],
  savedCareers: string[],
  savedColleges: string[],
  userBudget: number | null,
  confidence: number,
  missingData: string[],
  limit: number,
): Promise<RecommendationScore[]> {
  const degrees = await prisma.degree.findMany({ where: { isActive: true } });
  const careers = savedCareers.length > 0
    ? await prisma.career.findMany({ where: { id: { in: savedCareers } } })
    : [];

  return degrees
    .map((degree) => {
      const interestMatch = degree.requiredSubjects.length > 0
        ? jaccardSimilarity(interests, degree.requiredSubjects)
        : 0.3;

      const careerAlign = careers.length > 0
        ? careers.reduce((acc, c) => {
            const match = c.recommendedDegrees.some((d) => degree.name.toLowerCase().includes(d.toLowerCase()));
            return acc + (match ? 1 : 0);
          }, 0) / careers.length
        : 0.4;

      const roiScore = Math.min(1, (degree.riskAdjustedScore ?? 50) / 100);
      const aiResilience = (degree.aiResilience ?? 50) / 100;

      // Budget constraints match (4 years total tuition)
      let budgetScore = 0;
      if (userBudget !== null) {
        const totalTuition = degree.costTuition * 4;
        if (totalTuition <= userBudget * 4) budgetScore = 0.2;
        else if (totalTuition > userBudget * 6) budgetScore = -0.2;
      }

      const score = Math.max(0.0, Math.min(1.0, interestMatch * 0.2 + careerAlign * 0.25 + roiScore * 0.2 + aiResilience * 0.15 + budgetScore));
      const reasons: string[] = [];
      if (interestMatch > 0.4) reasons.push("Matches subject profile preferences");
      if (careerAlign > 0.5) reasons.push("Pre-requisite for saved career goals");
      if (roiScore > 0.6) reasons.push("High risk-adjusted financial ROI");
      if (budgetScore > 0) reasons.push("Affordable within target education budget");

      return {
        itemId: degree.id,
        itemType: "DEGREE" as const,
        score,
        reasons: reasons.slice(0, 3),
        explanation: reasons.slice(0, 2).join(". ") || "Standard matching outcome",
        confidence,
        missingData
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

async function recommendColleges(
  interests: string[],
  savedCareers: string[],
  savedColleges: string[],
  userBudget: number | null,
  userFamilyIncome: number | null,
  preferredCity: string | null,
  userMarks: number | null,
  confidence: number,
  missingData: string[],
  limit: number,
): Promise<RecommendationScore[]> {
  const colleges = await prisma.college.findMany({ 
    where: { isActive: true },
    include: { scholarships: true }
  });

  return colleges
    .filter((c) => !savedColleges.includes(c.id))
    .map((college) => {
      const rankScore = Math.max(0, 1 - (college.ranking ?? 500) / 1000);
      const placementScore = (college.placementPercent ?? 0) / 100;
      const ratingScore = (college.rating ?? 0) / 5;

      // Budget check
      let budgetScore = 0.15;
      if (userBudget !== null) {
        if (college.feesTotal <= userBudget) budgetScore = 0.3;
        else if (college.feesTotal > userBudget * 1.5) budgetScore = -0.3;
      }

      // Location match
      let locationScore = 0;
      if (preferredCity && college.location.toLowerCase().includes(preferredCity.toLowerCase())) {
        locationScore = 0.25;
      }

      // Marks admission probability match
      let marksScore = 0;
      if (userMarks !== null) {
        if (userMarks >= 90 && college.ranking <= 100) {
          marksScore = 0.2; // High probability of admission to elite college
        } else if (userMarks < 75 && college.ranking < 50) {
          marksScore = -0.25; // Elite ranking is out of range for moderate marks
        }
      }

      // Family Income scholarship check
      let scholarshipScore = 0;
      if (userFamilyIncome !== null && userFamilyIncome < 600000 && college.scholarships.length > 0) {
        scholarshipScore = 0.2; // Low income matching with active scholarships
      }

      const score = Math.max(0.0, Math.min(1.0, rankScore * 0.15 + placementScore * 0.2 + ratingScore * 0.1 + budgetScore + locationScore + marksScore + scholarshipScore));
      
      const reasons: string[] = [];
      if (placementScore > 0.8) reasons.push("Premium placement metrics");
      if (locationScore > 0) reasons.push("Located in preferred study city");
      if (marksScore > 0) reasons.push("High compatibility with academic score");
      if (scholarshipScore > 0) reasons.push("Offers income-based financial aid");

      return {
        itemId: college.id,
        itemType: "COLLEGE" as const,
        score,
        reasons: reasons.slice(0, 3),
        explanation: reasons.slice(0, 2).join(". ") || "Highly matched institutional profile",
        confidence,
        missingData
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

async function recommendSkills(
  savedCareers: string[],
  userId: string,
  confidence: number,
  missingData: string[],
  limit: number,
): Promise<RecommendationScore[]> {
  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  const allSkills = await prisma.skill.findMany();
  const userSkills = profile?.interests ?? [];

  if (savedCareers.length > 0) {
    const careers = await prisma.career.findMany({ where: { id: { in: savedCareers } } });
    const careerSkills = careers.flatMap((c) => c.requiredSkills);

    return allSkills
      .filter((s) => !userSkills.includes(s.name))
      .map((skill) => {
        const careerMatch = careerSkills.some((cs) => cs.toLowerCase() === skill.name.toLowerCase()) ? 1 : 0;
        const demandScore = skill.demand === "HIGH" ? 1 : skill.demand === "MEDIUM" ? 0.6 : 0.2;
        const score = careerMatch * 0.6 + demandScore * 0.4;

        return {
          itemId: skill.id,
          itemType: "SKILL" as const,
          score,
          reasons: careerMatch ? ["Required for saved careers"] : ["Highly demanded skill"],
          explanation: careerMatch ? "Required for target professions in your bookmarks" : "High industry demand",
          confidence,
          missingData
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  return allSkills
    .filter((s) => !userSkills.includes(s.name))
    .map((skill) => ({
      itemId: skill.id,
      itemType: "SKILL" as const,
      score: skill.demand === "HIGH" ? 0.8 : 0.5,
      reasons: ["Trending industry demand skill"],
      explanation: "This skill is expanding across multiple job markets",
      confidence,
      missingData
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

