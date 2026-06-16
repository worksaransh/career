// Universal Comparison Engine — side-by-side comparison of careers, colleges, degrees

export interface ComparisonItem {
  id: string;
  type: "CAREER" | "COLLEGE" | "DEGREE";
  title: string;
  attributes: Record<string, ComparisonAttribute>;
}

export interface ComparisonAttribute {
  label: string;
  value: string | number;
  category: string;
  rating?: number;
}

export interface ComparisonResult {
  items: ComparisonItem[];
  winner: string | null;
  summary: string;
  sharedAttributes: Record<string, string | number>;
}

const CAREER_ATTRIBUTES = [
  { key: "salary", label: "Average Salary", category: "Financial" },
  { key: "growthRate", label: "Growth Rate", category: "Market" },
  { key: "demandLevel", label: "Demand Level", category: "Market" },
  { key: "aiRiskLevel", label: "AI Risk", category: "Risk" },
  { key: "satisfaction", label: "Satisfaction", category: "Quality" },
  { key: "workLifeBalance", label: "Work-Life Balance", category: "Quality" },
  { key: "entryBarrier", label: "Entry Difficulty", category: "Accessibility" },
];

const COLLEGE_ATTRIBUTES = [
  { key: "nirfRanking", label: "NIRF Ranking", category: "Ranking" },
  { key: "placementRate", label: "Placement Rate", category: "Outcomes" },
  { key: "avgPackage", label: "Average Package", category: "Financial" },
  { key: "studentRating", label: "Student Rating", category: "Quality" },
  { key: "facultyRatio", label: "Faculty-Student Ratio", category: "Quality" },
  { key: "fees", label: "Annual Fees", category: "Financial" },
];

export function compareItems(items: ComparisonItem[]): ComparisonResult {
  if (items.length < 2) {
    return { items, winner: null, summary: "Add at least 2 items to compare", sharedAttributes: {} };
  }

  const allAttributeKeys = new Set<string>();
  for (const item of items) {
    Object.keys(item.attributes).forEach((k) => allAttributeKeys.add(k));
  }

  const scores: Record<string, number> = {};
  for (const item of items) {
    let score = 0;
    let count = 0;
    for (const [key, attr] of Object.entries(item.attributes)) {
      if (attr.rating != null) {
        score += attr.rating;
        count++;
      }
    }
    scores[item.id] = count > 0 ? score / count : 0;
  }

  const winner = Object.entries(scores).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;

  const sharedAttributes: Record<string, string | number> = {};
  for (const key of allAttributeKeys) {
    const values = items.map((i) => i.attributes[key]?.value);
    const firstVal = values[0];
    if (firstVal !== undefined && values.every((v) => v === firstVal)) {
      sharedAttributes[key] = firstVal!;
    }
  }

  const winnerItem = items.find((i) => i.id === winner);
  const summary = winnerItem
    ? `${winnerItem.title} ranks highest across key metrics`
    : "No clear winner identified";

  return { items, winner, summary, sharedAttributes };
}

export function careerToComparisonItem(career: {
  id: string;
  title: string;
  salaryMid?: number;
  salaryEntry?: number;
  futureGrowthRate?: number;
  demandLevel?: string;
  aiRiskLevel?: string;
  workLifeBalance?: number;
}): ComparisonItem {
  return {
    id: career.id,
    type: "CAREER",
    title: career.title,
    attributes: {
      salary: { label: "Mid-Career Salary", value: `₹${((career.salaryMid ?? 1000000) / 100000).toFixed(1)}L`, category: "Financial", rating: Math.min(10, (career.salaryMid ?? 1000000) / 200000) },
      growthRate: { label: "Growth Rate", value: `${career.futureGrowthRate ?? 8}%`, category: "Market", rating: Math.min(10, (career.futureGrowthRate ?? 8) * 0.8) },
      demandLevel: { label: "Market Demand", value: career.demandLevel ?? "MEDIUM", category: "Market", rating: career.demandLevel === "HIGH" ? 8 : career.demandLevel === "MEDIUM" ? 5 : 2 },
      aiRiskLevel: { label: "AI Disruption Risk", value: career.aiRiskLevel ?? "MEDIUM", category: "Risk", rating: career.aiRiskLevel === "LOW" ? 9 : career.aiRiskLevel === "MEDIUM" ? 5 : 2 },
      entryBarrier: { label: "Entry Difficulty", value: (career.salaryEntry ?? 0) > 700000 ? "High" : (career.salaryEntry ?? 0) > 400000 ? "Medium" : "Low", category: "Accessibility" },
    },
  };
}

export function collegeToComparisonItem(college: {
  id: string;
  name: string;
  nirfRanking?: number;
  placementPercent?: number;
  avgPackage?: number;
  rating?: number;
  fees?: number;
}): ComparisonItem {
  return {
    id: college.id,
    type: "COLLEGE",
    title: college.name,
    attributes: {
      nirfRanking: { label: "NIRF Ranking", value: college.nirfRanking ?? 100, category: "Ranking", rating: college.nirfRanking ? Math.max(1, 10 - college.nirfRanking / 10) : 5 },
      placementRate: { label: "Placement Rate", value: `${college.placementPercent ?? 0}%`, category: "Outcomes", rating: (college.placementPercent ?? 0) / 10 },
      avgPackage: { label: "Average Package", value: `₹${((college.avgPackage ?? 500000) / 100000).toFixed(1)}L`, category: "Financial", rating: Math.min(10, (college.avgPackage ?? 500000) / 100000) },
      studentRating: { label: "Student Rating", value: `${college.rating ?? 0}/5`, category: "Quality", rating: (college.rating ?? 0) * 2 },
      fees: { label: "Annual Fees", value: `₹${((college.fees ?? 200000) / 100000).toFixed(1)}L`, category: "Financial", rating: Math.max(1, college.fees ? 10 - college.fees / 100000 : 5) },
    },
  };
}
