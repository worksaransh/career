// Progressive Profiling Engine — collect user data incrementally over time

export type ProfileAttribute =
  | "NAME"
  | "EMAIL"
  | "PHONE"
  | "LOCATION"
  | "EDUCATION"
  | "WORK_EXPERIENCE"
  | "CURRENT_ROLE"
  | "SKILLS"
  | "INTERESTS"
  | "CAREER_GOALS"
  | "SALARY_EXPECTATION"
  | "WILLING_TO_RELOCATE"
  | "EDUCATION_LEVEL"
  | "BUDGET"
  | "PARENT_OCCUPATION"
  | "DISABILITY_STATUS"
  | "GENDER"
  | "DOB";

export interface ProfileField {
  key: ProfileAttribute;
  label: string;
  type: "text" | "select" | "multiselect" | "number" | "date" | "email" | "tel" | "boolean";
  options?: string[];
  priority: number;
  required: boolean;
  dependsOn?: ProfileAttribute[];
  section: "BASIC" | "EDUCATION" | "CAREER" | "PREFERENCES" | "DEMOGRAPHICS";
}

export interface ProfileProgress {
  completedFields: number;
  totalFields: number;
  percentage: number;
  nextField: ProfileField | null;
  sections: Record<string, { completed: number; total: number }>;
}

export const PROFILE_FIELDS: ProfileField[] = [
  { key: "NAME", label: "Full Name", type: "text", priority: 1, required: true, section: "BASIC" },
  { key: "EMAIL", label: "Email Address", type: "email", priority: 2, required: true, section: "BASIC" },
  { key: "PHONE", label: "Phone Number", type: "tel", priority: 3, required: false, section: "BASIC" },
  { key: "LOCATION", label: "Your City", type: "text", priority: 4, required: false, section: "BASIC" },
  { key: "EDUCATION_LEVEL", label: "Current Education Level", type: "select", options: ["Class 10", "Class 12", "Undergraduate", "Graduate", "Postgraduate", "PhD"], priority: 5, required: true, section: "EDUCATION" },
  { key: "EDUCATION", label: "Institution Name", type: "text", priority: 6, required: false, dependsOn: ["EDUCATION_LEVEL"], section: "EDUCATION" },
  { key: "CURRENT_ROLE", label: "Current Role", type: "select", options: ["Student", "Employed", "Unemployed", "Freelancer", "Entrepreneur"], priority: 7, required: true, section: "CAREER" },
  { key: "WORK_EXPERIENCE", label: "Years of Experience", type: "number", priority: 8, required: false, dependsOn: ["CURRENT_ROLE"], section: "CAREER" },
  { key: "SKILLS", label: "Your Skills", type: "multiselect", options: ["Python", "JavaScript", "Data Analysis", "Communication", "Leadership", "Design", "Finance", "Marketing"], priority: 9, required: false, section: "CAREER" },
  { key: "INTERESTS", label: "Career Interests", type: "multiselect", options: ["Technology", "Healthcare", "Finance", "Education", "Arts", "Engineering", "Science", "Business"], priority: 10, required: true, section: "CAREER" },
  { key: "CAREER_GOALS", label: "Career Goals", type: "text", priority: 11, required: false, section: "CAREER" },
  { key: "SALARY_EXPECTATION", label: "Salary Expectation (LPA)", type: "number", priority: 12, required: false, section: "PREFERENCES" },
  { key: "WILLING_TO_RELOCATE", label: "Willing to Relocate?", type: "boolean", priority: 13, required: false, section: "PREFERENCES" },
  { key: "BUDGET", label: "Education Budget (₹)", type: "number", priority: 14, required: false, section: "PREFERENCES" },
  { key: "DOB", label: "Date of Birth", type: "date", priority: 15, required: false, section: "DEMOGRAPHICS" },
  { key: "GENDER", label: "Gender", type: "select", options: ["Male", "Female", "Non-binary", "Prefer not to say"], priority: 16, required: false, section: "DEMOGRAPHICS" },
  { key: "PARENT_OCCUPATION", label: "Parent/Guardian Occupation", type: "text", priority: 17, required: false, section: "DEMOGRAPHICS" },
  { key: "DISABILITY_STATUS", label: "Disability Status", type: "select", options: ["None", "Physical", "Visual", "Hearing", "Learning", "Multiple", "Prefer not to say"], priority: 18, required: false, section: "DEMOGRAPHICS" },
];

export function calculateProfileProgress(profile: Partial<Record<ProfileAttribute, unknown>>): ProfileProgress {
  const requiredFields = PROFILE_FIELDS.filter((f) => f.required);
  const completedRequired = requiredFields.filter((f) => {
    const val = profile[f.key];
    return val !== undefined && val !== null && val !== "";
  });

  const totalRequired = requiredFields.length;
  const percentage = totalRequired > 0 ? Math.round((completedRequired.length / totalRequired) * 100) : 0;

  const nextField = PROFILE_FIELDS
    .filter((f) => {
      const val = profile[f.key];
      const isMissing = val === undefined || val === null || val === "";
      const depsMet = !f.dependsOn || f.dependsOn.every((dep) => {
        const depVal = profile[dep];
        return depVal !== undefined && depVal !== null && depVal !== "";
      });
      return isMissing && depsMet;
    })
    .sort((a, b) => a.priority - b.priority)[0] ?? null;

  const sections = PROFILE_FIELDS.reduce(
    (acc, f) => {
      const section = f.section;
      if (!acc[section]) acc[section] = { completed: 0, total: 0 };
      acc[section].total++;
      const val = profile[f.key];
      if (val !== undefined && val !== null && val !== "") acc[section].completed++;
      return acc;
    },
    {} as Record<string, { completed: number; total: number }>,
  );

  return {
    completedFields: completedRequired.length,
    totalFields: totalRequired,
    percentage,
    nextField,
    sections,
  };
}

export function getProfileCompletionMessage(percentage: number): string {
  if (percentage < 30) return "Let's start building your profile — just a few details needed";
  if (percentage < 50) return "Great start! A few more details will improve your recommendations";
  if (percentage < 75) return "You're more than halfway there! Almost ready for personalized insights";
  if (percentage < 100) return "Almost complete! One last step for the best recommendations";
  return "Your profile is complete! You're getting the most personalized recommendations possible";
}
