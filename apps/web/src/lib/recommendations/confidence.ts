// Recommendation Confidence Engine — calculates confidence scores with explanations

export interface ConfidenceResult {
  score: number;
  level: "VERY_LOW" | "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
  factors: ConfidenceFactor[];
  improvements: ConfidenceImprovement[];
}

export interface ConfidenceFactor {
  name: string;
  weight: number;
  score: number;
  contribution: number;
}

export interface ConfidenceImprovement {
  missingField: string;
  label: string;
  potentialGain: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

interface ProfileData {
  interests: string[];
  assessmentsCompleted: number;
  savedCareers: number;
  savedColleges: number;
  educationLevel?: string;
  currentGrade?: string;
  location?: string;
  dateOfBirth?: string;
  preferences?: Record<string, unknown>;
}

export function calculateConfidence(profile: ProfileData): ConfidenceResult {
  const factors: ConfidenceFactor[] = [];

  const interestScore = profile.interests.length >= 5 ? 1 : profile.interests.length / 5;
  factors.push({ name: "Interests defined", weight: 0.2, score: interestScore, contribution: 0 });

  const assessmentScore = Math.min(1, profile.assessmentsCompleted / 3);
  factors.push({ name: "Assessments completed", weight: 0.25, score: assessmentScore, contribution: 0 });

  const engagementScore = Math.min(1, (profile.savedCareers + profile.savedColleges) / 10);
  factors.push({ name: "Platform engagement", weight: 0.15, score: engagementScore, contribution: 0 });

  const educationScore = profile.educationLevel ? 0.8 : 0.2;
  factors.push({ name: "Education level", weight: 0.15, score: educationScore, contribution: 0 });

  const demographicsScore = [profile.currentGrade, profile.location, profile.dateOfBirth].filter(Boolean).length / 3;
  factors.push({ name: "Demographic data", weight: 0.1, score: demographicsScore, contribution: 0 });

  const preferencesScore = profile.preferences && Object.keys(profile.preferences).length > 0 ? 0.7 : 0.3;
  factors.push({ name: "Preferences set", weight: 0.15, score: preferencesScore, contribution: 0 });

  let totalConfidence = 0;
  for (const factor of factors) {
    factor.contribution = factor.score * factor.weight * 100;
    totalConfidence += factor.contribution;
  }

  totalConfidence = Math.round(Math.min(100, Math.max(0, totalConfidence)));

  const improvements: ConfidenceImprovement[] = [];
  if (profile.interests.length < 5) {
    improvements.push({ missingField: "interests", label: "More interests", potentialGain: (5 - profile.interests.length) / 5 * 20, priority: "HIGH" });
  }
  if (profile.assessmentsCompleted < 3) {
    improvements.push({ missingField: "assessments", label: "Complete assessments", potentialGain: (3 - profile.assessmentsCompleted) / 3 * 25, priority: "HIGH" });
  }
  if (!profile.educationLevel) {
    improvements.push({ missingField: "educationLevel", label: "Education level", potentialGain: 15, priority: "MEDIUM" });
  }
  if (!profile.location) {
    improvements.push({ missingField: "location", label: "Your location", potentialGain: 10, priority: "MEDIUM" });
  }
  if (!profile.currentGrade) {
    improvements.push({ missingField: "currentGrade", label: "Class/Grade", potentialGain: 10, priority: "LOW" });
  }

  let level: ConfidenceResult["level"];
  if (totalConfidence >= 80) level = "VERY_HIGH";
  else if (totalConfidence >= 60) level = "HIGH";
  else if (totalConfidence >= 40) level = "MEDIUM";
  else if (totalConfidence >= 20) level = "LOW";
  else level = "VERY_LOW";

  return { score: totalConfidence, level, factors, improvements };
}

export function getConfidenceLabel(level: ConfidenceResult["level"]): string {
  switch (level) {
    case "VERY_HIGH": return "High confidence — recommendations are well-calibrated";
    case "HIGH": return "Good confidence — adding more data will improve accuracy";
    case "MEDIUM": return "Moderate confidence — complete your profile for better results";
    case "LOW": return "Low confidence — assessments will significantly improve recommendations";
    case "VERY_LOW": return "Very low confidence — start with assessments to unlock insights";
  }
}
