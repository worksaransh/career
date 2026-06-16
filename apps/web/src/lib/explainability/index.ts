// AI Explainability Layer — every recommendation includes why, factors, risks, alternatives

export interface RecommendationExplanation {
  recommendationId: string;
  type: "CAREER" | "DEGREE" | "COLLEGE" | "SKILL";
  title: string;
  whyRecommended: string;
  factorsConsidered: FactorConsidered[];
  strengths: string[];
  potentialRisks: string[];
  alternativeOptions: string[];
  confidenceScore: number;
  assumptions: string[];
  generatedAt: string;
}

export interface FactorConsidered {
  name: string;
  importance: "HIGH" | "MEDIUM" | "LOW";
  value: string;
  impact: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
}

export function generateCareerExplanation(
  career: { id: string; title: string; requiredSkills: string[]; aiRiskLevel: string; demandLevel: string; futureGrowthRate: number; salaryRange?: { entry: number; mid: number; senior: number }; salaryMid?: number; salaryEntry?: number; alternativeCareers?: string[] },
  matchPercentage: number,
  userInterests: string[],
  confidence: number,
): RecommendationExplanation {
  const factors: FactorConsidered[] = [];

  const interestMatch = career.requiredSkills.filter((s) =>
    userInterests.some((i) => s.toLowerCase().includes(i.toLowerCase())),
  ).length / Math.max(career.requiredSkills.length, 1);

  factors.push({
    name: "Interest Alignment",
    importance: "HIGH",
    value: `${Math.round(interestMatch * 100)}% match with your interests`,
    impact: interestMatch > 0.5 ? "POSITIVE" : "NEUTRAL",
  });

  factors.push({
    name: "AI Disruption Risk",
    importance: "HIGH",
    value: career.aiRiskLevel === "LOW" ? "Low risk — future-proof" : `${career.aiRiskLevel} risk`,
    impact: career.aiRiskLevel === "LOW" ? "POSITIVE" : career.aiRiskLevel === "HIGH" ? "NEGATIVE" : "NEUTRAL",
  });

  factors.push({
    name: "Market Demand",
    importance: "HIGH",
    value: `${career.demandLevel} demand with ${career.futureGrowthRate}% growth`,
    impact: career.demandLevel === "HIGH" ? "POSITIVE" : "NEUTRAL",
  });

  const midSalary = career.salaryRange?.mid ?? career.salaryMid ?? 0;
  factors.push({
    name: "Salary Potential",
    importance: "MEDIUM",
    value: `₹${(midSalary / 100000).toFixed(1)}L mid-career`,
    impact: midSalary > 1000000 ? "POSITIVE" : "NEUTRAL",
  });

  const similarCareers = career.alternativeCareers?.slice(0, 3) ?? [];

  const midSalary2 = career.salaryRange?.mid ?? career.salaryMid ?? 0;
  const entrySalary = career.salaryRange?.entry ?? career.salaryEntry ?? 0;
  const strengths: string[] = [];
  if (career.demandLevel === "HIGH") strengths.push("Strong market demand with positive growth outlook");
  if (career.aiRiskLevel === "LOW") strengths.push("Low automation risk — career is AI-resistant");
  if (midSalary2 > 1500000) strengths.push("Above-average earning potential");
  if (interestMatch > 0.5) strengths.push("Aligns well with your demonstrated interests");

  const risks: string[] = [];
  if (career.aiRiskLevel === "HIGH") risks.push("High automation risk over the next decade");
  if (career.demandLevel === "LOW") risks.push("Limited market demand — consider specialization");
  if (entrySalary < 500000) risks.push("Entry-level salaries may be lower than average");

  const assumptions: string[] = [
    "Based on current market trends and projections",
    "Your interests are self-reported and may evolve",
    "Salary ranges are estimates and vary by location and company",
  ];

  return {
    recommendationId: career.id,
    type: "CAREER",
    title: career.title,
    whyRecommended: `We recommend ${career.title} because it aligns with your ${userInterests.length > 0 ? "interests" : "profile"} and has ${career.demandLevel.toLowerCase()} market demand with ${career.aiRiskLevel.toLowerCase()} AI disruption risk.`,
    factorsConsidered: factors,
    strengths,
    potentialRisks: risks,
    alternativeOptions: similarCareers,
    confidenceScore: confidence,
    assumptions,
    generatedAt: new Date().toISOString(),
  };
}

export function generateCollegeExplanation(college: {
  name: string;
  rating: number;
  placementPercent: number;
  avgPackage: number;
  ranking: number;
  riskAdjustedScore: number;
}): RecommendationExplanation {
  const factors: FactorConsidered[] = [
    { name: "Placement Record", importance: "HIGH", value: `${college.placementPercent}% placement rate`, impact: college.placementPercent > 80 ? "POSITIVE" : "NEUTRAL" },
    { name: "Average Package", importance: "HIGH", value: `₹${(college.avgPackage / 100000).toFixed(1)}L average`, impact: college.avgPackage > 800000 ? "POSITIVE" : "NEUTRAL" },
    { name: "Ranking", importance: "MEDIUM", value: `Ranked #${college.ranking}`, impact: college.ranking < 100 ? "POSITIVE" : "NEUTRAL" },
    { name: "Student Rating", importance: "MEDIUM", value: `${college.rating}/5 rating`, impact: college.rating >= 4 ? "POSITIVE" : "NEUTRAL" },
  ];

  return {
    recommendationId: college.name,
    type: "COLLEGE",
    title: college.name,
    whyRecommended: `Recommended based on ${college.placementPercent}% placement rate and strong ROI metrics.`,
    factorsConsidered: factors,
    strengths: college.placementPercent > 80 ? ["Excellent placement track record"] : [],
    potentialRisks: college.placementPercent < 70 ? ["Below-average placement rate"] : [],
    alternativeOptions: [],
    confidenceScore: Math.round(college.riskAdjustedScore),
    assumptions: ["Placement data based on recent years", "Fees may vary by program"],
    generatedAt: new Date().toISOString(),
  };
}
