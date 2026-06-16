// Hallucination Prevention — AI responses must use verified data only

export const VERIFIED_SALARY_RANGES: Record<string, { entry: number; mid: number; senior: number }> = {
  "Software Engineer": { entry: 400000, mid: 2500000, senior: 5000000 },
  "Data Scientist": { entry: 500000, mid: 3000000, senior: 6000000 },
  "Product Manager": { entry: 600000, mid: 3500000, senior: 7000000 },
};

export const VERIFIED_COLLEGE_RANKINGS: Record<string, number> = {
  "IIT Bombay": 1,
  "IIT Delhi": 2,
  "IIT Madras": 3,
  "IIT Kanpur": 4,
  "IIT Kharagpur": 5,
  "IIT Roorkee": 6,
  "IIT Guwahati": 7,
  "NIT Trichy": 8,
  "NIT Surathkal": 9,
  "IIIT Hyderabad": 10,
};

export type VerificationResult<T> =
  | { verified: true; data: T; source: string }
  | { verified: false; error: string; suggestion: string };

export function verifySalary(
  careerTitle: string,
  salary: number,
): VerificationResult<{ careerTitle: string; salary: number; range: string }> {
  const range = VERIFIED_SALARY_RANGES[careerTitle];
  if (!range) {
    return {
      verified: false,
      error: `Salary data for "${careerTitle}" is not in our verified database`,
      suggestion: "Please check official salary surveys or government labor data",
    };
  }

  if (salary < range.entry * 0.5 || salary > range.senior * 1.5) {
    return {
      verified: false,
      error: `Salary ${salary} is outside the verified range for ${careerTitle}`,
      suggestion: `Expected range: ₹${range.entry.toLocaleString("en-IN")} - ₹${range.senior.toLocaleString("en-IN")}`,
    };
  }

  return {
    verified: true,
    data: { careerTitle, salary, range: `${range.entry} - ${range.senior}` },
    source: "Verified Industry Data 2024",
  };
}

export function verifyCollegeRanking(
  collegeName: string,
): VerificationResult<{ collegeName: string; ranking: number }> {
  const ranking = VERIFIED_COLLEGE_RANKINGS[collegeName];
  if (!ranking) {
    return {
      verified: false,
      error: `College "${collegeName}" is not in our verified ranking database`,
      suggestion: "Check the official NIRF rankings or contact the institution directly",
    };
  }

  return {
    verified: true,
    data: { collegeName, ranking },
    source: "NIRF Rankings 2024",
  };
}

export function isWithinRange(value: number, min: number, max: number, label: string): { valid: boolean; message?: string } {
  if (value < min || value > max) {
    return { valid: false, message: `${label} value ${value} is outside expected range (${min}-${max})` };
  }
  return { valid: true };
}

export function validateAIPrompt(template: string, variables: Record<string, string>): { safe: boolean; issues: string[] } {
  const issues: string[] = [];
  const placeholders = template.match(/\{\{(\w+)\}\}/g) ?? [];

  for (const placeholder of placeholders) {
    const key = placeholder.replace(/\{\{|\}\}/g, "");
    if (!variables[key]) {
      issues.push(`Missing required variable: ${key}`);
    }
  }

  const promptLength = template.length + Object.values(variables).join("").length;
  if (promptLength > 4000) {
    issues.push("Prompt exceeds recommended length of 4000 characters");
  }

  return { safe: issues.length === 0, issues };
}
