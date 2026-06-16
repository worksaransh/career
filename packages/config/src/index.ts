export const siteConfig = {
  name: "Career OS",
  tagline: "See Your Future Before You Decide",
  description:
    "AI-powered career guidance platform that helps students discover their ideal career path through personalized assessments, college matching, and roadmap planning.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://careeros.ai",
  ogImage: "/images/og-image.jpg",
  links: {
    twitter: "https://twitter.com/careeros",
    linkedin: "https://linkedin.com/company/careeros",
    email: "hello@careeros.ai",
  },
  supportEmail: "support@careeros.ai",
  privacyEmail: "privacy@careeros.ai",
};

export const paginationConfig = {
  defaultPageSize: 20,
  maxPageSize: 100,
};

export const assessmentConfig = {
  minimumQuestions: 5,
  maximumQuestions: 50,
  types: ["INTEREST", "PERSONALITY", "SKILLS", "LEARNING_STYLE", "CAREER_GOALS"] as const,
};

export const profileCompleteness = {
  steps: [10, 25, 47, 63, 89, 100] as const,
  labels: {
    10: "Just Started",
    25: "Getting Started",
    47: "Building Profile",
    63: "Almost There",
    89: "Nearly Complete",
    100: "Complete",
  } as Record<number, string>,
};

export const cachingConfig = {
  careerListTTL: 60 * 5,
  careerDetailTTL: 60 * 15,
  collegeListTTL: 60 * 5,
  collegeDetailTTL: 60 * 15,
  assessmentTTL: 60 * 30,
  userProfileTTL: 60 * 5,
};

export const featureFlags = {
  aiMentor: process.env.FEATURE_AI_MENTOR === "true",
  jobMarketplace: process.env.FEATURE_JOB_MARKETPLACE === "true",
  whiteLabel: process.env.FEATURE_WHITE_LABEL === "true",
};
