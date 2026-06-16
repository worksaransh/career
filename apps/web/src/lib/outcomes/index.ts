// Outcome Intelligence Engine — track and predict real-world outcomes

export interface CareerOutcome {
  careerId: string;
  careerTitle: string;
  placementRate: number;
  averageSalary: number;
  medianSalary: number;
  topPercentileSalary: number;
  employmentRate: number;
  averageYearsToStability: number;
  satisfactionScore: number;
  dataPoints: number;
  lastUpdated: string;
}

export interface OutcomePrediction {
  careerTitle: string;
  predictedSalary5yr: number;
  predictedSalary10yr: number;
  predictedDemand: "GROWING" | "STABLE" | "DECLINING";
  confidence: number;
  factors: OutcomeFactor[];
}

export interface OutcomeFactor {
  name: string;
  impact: number;
  direction: "POSITIVE" | "NEGATIVE";
  description: string;
}

const OUTCOMES_DATABASE: Record<string, CareerOutcome> = {
  "Software Engineer": {
    careerId: "software-engineer",
    careerTitle: "Software Engineer",
    placementRate: 0.92,
    averageSalary: 1800000,
    medianSalary: 1500000,
    topPercentileSalary: 5000000,
    employmentRate: 0.96,
    averageYearsToStability: 2,
    satisfactionScore: 4.1,
    dataPoints: 15000,
    lastUpdated: "2024-09-01",
  },
  "Data Scientist": {
    careerId: "data-scientist",
    careerTitle: "Data Scientist",
    placementRate: 0.88,
    averageSalary: 2200000,
    medianSalary: 1800000,
    topPercentileSalary: 6000000,
    employmentRate: 0.94,
    averageYearsToStability: 3,
    satisfactionScore: 4.3,
    dataPoints: 8000,
    lastUpdated: "2024-09-01",
  },
  "Product Manager": {
    careerId: "product-manager",
    careerTitle: "Product Manager",
    placementRate: 0.85,
    averageSalary: 2500000,
    medianSalary: 2000000,
    topPercentileSalary: 7000000,
    employmentRate: 0.92,
    averageYearsToStability: 4,
    satisfactionScore: 4.0,
    dataPoints: 6000,
    lastUpdated: "2024-09-01",
  },
  "Management Consultant": {
    careerId: "management-consultant",
    careerTitle: "Management Consultant",
    placementRate: 0.82,
    averageSalary: 2000000,
    medianSalary: 1600000,
    topPercentileSalary: 5500000,
    employmentRate: 0.9,
    averageYearsToStability: 3,
    satisfactionScore: 3.8,
    dataPoints: 5000,
    lastUpdated: "2024-09-01",
  },
  "UI/UX Designer": {
    careerId: "ux-designer",
    careerTitle: "UI/UX Designer",
    placementRate: 0.87,
    averageSalary: 1400000,
    medianSalary: 1200000,
    topPercentileSalary: 3800000,
    employmentRate: 0.93,
    averageYearsToStability: 2,
    satisfactionScore: 4.4,
    dataPoints: 4000,
    lastUpdated: "2024-09-01",
  },
};

export function getOutcomesForCareer(careerTitle: string): CareerOutcome | null {
  return OUTCOMES_DATABASE[careerTitle] ?? null;
}

export function predictOutcomes(careerTitle: string): OutcomePrediction | null {
  const outcome = OUTCOMES_DATABASE[careerTitle];
  if (!outcome) return null;

  const growthRate = careerTitle === "Data Scientist" ? 0.15
    : careerTitle === "Software Engineer" ? 0.10
    : careerTitle === "Product Manager" ? 0.12
    : 0.08;

  const predictedSalary5yr = Math.round(outcome.averageSalary * Math.pow(1 + growthRate, 5));
  const predictedSalary10yr = Math.round(outcome.averageSalary * Math.pow(1 + growthRate, 10));

  const factors: OutcomeFactor[] = [
    {
      name: "AI Automation Impact",
      impact: outcome.employmentRate > 0.92 ? 15 : 30,
      direction: "NEGATIVE",
      description: outcome.employmentRate > 0.92 ? "Low automation risk" : "Moderate automation risk",
    },
    {
      name: "Market Demand Trend",
      impact: growthRate > 0.10 ? 25 : 15,
      direction: "POSITIVE",
      description: growthRate > 0.10 ? "High demand growth" : "Steady demand",
    },
    {
      name: "Historical Placement",
      impact: Math.round(outcome.placementRate * 30),
      direction: "POSITIVE",
      description: `${Math.round(outcome.placementRate * 100)}% placement rate indicates strong outcomes`,
    },
    {
      name: "Salary Growth Trajectory",
      impact: 20,
      direction: "POSITIVE",
      description: `Average salary of ₹${(outcome.averageSalary / 100000).toFixed(1)}L with room for growth`,
    },
  ];

  const confidence = Math.min(
    0.95,
    0.6 + (outcome.dataPoints / 20000) * 0.3 + (outcome.employmentRate * 0.1),
  );

  const demandTrend: "GROWING" | "STABLE" | "DECLINING" =
    growthRate > 0.12 ? "GROWING" : growthRate > 0.05 ? "STABLE" : "DECLINING";

  return {
    careerTitle,
    predictedSalary5yr,
    predictedSalary10yr,
    predictedDemand: demandTrend,
    confidence: Math.round(confidence * 100),
    factors,
  };
}

export function compareOutcomes(careers: string[]): Record<string, CareerOutcome | null> {
  return careers.reduce(
    (acc, title) => {
      acc[title] = getOutcomesForCareer(title);
      return acc;
    },
    {} as Record<string, CareerOutcome | null>,
  );
}
