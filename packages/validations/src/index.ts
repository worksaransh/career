import { z } from "zod";

// ─── Auth ────────────────────────────────────────────────────────

export const emailSchema = z
  .string()
  .email("Please enter a valid email address")
  .min(1, "Email is required")
  .max(255, "Email is too long")
  .transform((val) => val.toLowerCase().trim());

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
    "Password must contain at least one special character",
  );

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s-]{10,15}$/, "Please enter a valid phone number")
  .transform((val) => val.replace(/[\s-]/g, ""));

export const otpSchema = z
  .string()
  .length(6, "OTP must be 6 digits")
  .regex(/^\d{6}$/, "OTP must be 6 digits");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name is too long")
      .transform((val) => val.trim()),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    acceptedTerms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms and conditions" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const otpLoginSchema = z.object({
  phone: phoneSchema,
  otp: otpSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ─── Onboarding ──────────────────────────────────────────────────

export const personaSchema = z.object({
  persona: z.enum(["STUDENT", "PARENT", "COLLEGE_STUDENT", "GRADUATE", "PROFESSIONAL", "CAREER_SWITCHER"]),
});

export const onboardingStepSchema = z.object({
  step: z.enum(["WELCOME", "PERSONA", "GOAL", "INTERESTS", "EDUCATION", "COMPLETE"]),
  data: z.record(z.unknown()).optional(),
});

export const goalSchema = z.object({
  goal: z.enum([
    "EXPLORE_CAREERS",
    "CHOOSE_DEGREE",
    "FIND_COLLEGE",
    "PLAN_ROADMAP",
    "SWITCH_CAREER",
    "GENERAL_GUIDANCE",
  ]),
  currentEducation: z.string().optional(),
  targetTimeline: z.string().optional(),
});

export const interestsSchema = z.object({
  categories: z.array(z.string()).min(1, "Select at least one interest"),
  subjects: z.array(z.string()).optional(),
  activities: z.array(z.string()).optional(),
});

export const educationSchema = z.object({
  level: z.enum([
    "HIGH_SCHOOL",
    "UNDERGRADUATE",
    "GRADUATE",
    "POSTGRADUATE",
    "OTHER",
  ]),
  grade: z.string().optional(),
  field: z.string().optional(),
  institution: z.string().optional(),
});

// ─── Profile ─────────────────────────────────────────────────────

export const profileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(200).optional(),
  dateOfBirth: z.string().optional(),
  educationLevel: z.string().optional(),
  currentGrade: z.string().optional(),
  interests: z.array(z.string()).optional(),
  preferences: z
    .object({
      theme: z.enum(["light", "dark", "system"]).optional(),
      language: z.enum(["en", "hi", "hinglish"]).optional(),
      emailNotifications: z.boolean().optional(),
      pushNotifications: z.boolean().optional(),
    })
    .optional(),
});

// ─── Assessment ──────────────────────────────────────────────────

export const assessmentAnswerSchema = z.object({
  questionId: z.string(),
  optionId: z.string(),
  value: z.number().min(0).max(5),
});

export const assessmentSubmissionSchema = z.object({
  assessmentId: z.string(),
  answers: z.array(assessmentAnswerSchema).min(1, "Please answer all questions"),
  timeSpent: z.number().positive(),
});

// ─── Admin ───────────────────────────────────────────────────────

export const cmsContentSchema = z.object({
  key: z.string().min(1).max(100),
  section: z.string().min(1).max(100),
  type: z.enum(["TEXT", "IMAGE", "VIDEO", "LOTTIE", "BANNER", "TESTIMONIAL"]),
  value: z.string(),
  metadata: z.record(z.string()).nullable().optional(),
  language: z.enum(["en", "hi", "hinglish"]),
  isActive: z.boolean().default(true),
});

export const mediaAssetSchema = z.object({
  url: z.string().url(),
  alt: z.string().min(1).max(200),
  width: z.number().positive(),
  height: z.number().positive(),
  type: z.enum(["IMAGE", "VIDEO", "LOTTIE", "ICON"]),
  section: z.string().min(1).max(100),
  tags: z.array(z.string()).default([]),
});

export const roleUpdateSchema = z.object({
  userId: z.string(),
  role: z.enum([
    "SUPER_ADMIN",
    "ADMIN",
    "CONTENT_MANAGER",
    "SCHOOL_MANAGER",
    "SUPPORT_AGENT",
    "ANALYST",
    "FINANCE",
    "MODERATOR",
    "USER",
  ]),
});

// ─── Career ──────────────────────────────────────────────────────

export const careerSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  summary: z.string().min(1).max(500),
  salaryEntry: z.number().positive(),
  salaryMid: z.number().positive(),
  salarySenior: z.number().positive(),
  demandLevel: z.enum(["HIGH", "MEDIUM", "LOW"]),
  aiRiskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]),
  futureGrowthRate: z.number().min(-100).max(1000),
  requiredSkills: z.array(z.string()),
  certifications: z.array(z.string()),
  isActive: z.boolean().default(true),
});

// ─── Payment ─────────────────────────────────────────────────────

export const paymentIntentSchema = z.object({
  tier: z.enum(["PREMIUM", "SCHOOL", "UNIVERSITY"]),
  couponCode: z.string().optional(),
  referralId: z.string().optional(),
});

export const couponSchema = z.object({
  code: z.string().min(3).max(50),
  discountPercentage: z.number().min(1).max(100),
  maxUses: z.number().positive().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean().default(true),
});

// ─── Notification ────────────────────────────────────────────────

export const notificationPreferencesSchema = z.object({
  weeklyRoadmapUpdates: z.boolean().default(true),
  newScholarships: z.boolean().default(true),
  newCollegeMatches: z.boolean().default(true),
  skillReminders: z.boolean().default(true),
  assessmentReminders: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
});

// ─── Export Types ────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type PersonaInput = z.infer<typeof personaSchema>;
export type OnboardingStepInput = z.infer<typeof onboardingStepSchema>;
export type GoalInput = z.infer<typeof goalSchema>;
export type InterestsInput = z.infer<typeof interestsSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type AssessmentSubmissionInput = z.infer<typeof assessmentSubmissionSchema>;
export type CMSContentInput = z.infer<typeof cmsContentSchema>;
export type MediaAssetInput = z.infer<typeof mediaAssetSchema>;
export type RoleUpdateInput = z.infer<typeof roleUpdateSchema>;
export type CareerInput = z.infer<typeof careerSchema>;
export type PaymentIntentInput = z.infer<typeof paymentIntentSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
export type NotificationPreferencesInput = z.infer<
  typeof notificationPreferencesSchema
>;

// ─── Feature Flags ───────────────────────────────────────────────

export const featureFlagSchema = z.object({
  key: z.string().min(1).max(100),
  enabled: z.boolean(),
  percentage: z.number().min(0).max(100).optional(),
  description: z.string().max(500).optional(),
});

// ─── Consent ─────────────────────────────────────────────────────

export const consentUpdateSchema = z.object({
  type: z.enum(["COOKIE_CONSENT", "DATA_PROCESSING", "AI_PERSONALIZATION", "PARENT_CONSENT", "ACTIVITY_HISTORY"]),
  granted: z.boolean(),
});

// ─── Feedback ────────────────────────────────────────────────────

export const feedbackSchema = z.object({
  itemId: z.string().min(1),
  itemType: z.enum(["CAREER", "DEGREE", "COLLEGE", "SKILL", "CERTIFICATION"]),
  rating: z.number().int().min(1).max(5),
  reason: z.enum(["IRRELEVANT", "NOT_INTERESTED", "ALREADY_KNOWN", "TOO_EXPENSIVE", "LOCATION", "SALARY", "AI_RISK", "PERFECT_MATCH", "EXCEEDS_EXPECTATIONS", "OTHER"]).optional(),
  comment: z.string().max(1000).optional(),
});

// ─── Referral ────────────────────────────────────────────────────

export const referralCreateSchema = z.object({
  refereeEmail: z.string().email(),
});

// ─── Experiment ──────────────────────────────────────────────────

export const experimentCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  type: z.enum(["A/B", "MULTIVARIATE"]).default("A/B"),
  variants: z.array(z.object({
    name: z.string().min(1),
    trafficPercent: z.number().min(0).max(100),
    config: z.record(z.unknown()).default({}),
  })).min(2, "At least 2 variants required"),
  targetMetric: z.object({
    name: z.string().min(1),
    type: z.enum(["CLICK_RATE", "CONVERSION", "ENGAGEMENT", "SATISFACTION", "TIME_SPENT"]),
    target: z.number().min(0),
  }),
  minSampleSize: z.number().int().positive().default(1000),
});

// ─── Search ──────────────────────────────────────────────────────

export const searchSchema = z.object({
  query: z.string().min(1).max(500),
  types: z.array(z.enum(["CAREER", "COLLEGE", "DEGREE", "SKILL", "USER", "ARTICLE"])).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
  sortBy: z.enum(["RELEVANCE", "RATING", "DEMAND", "SALARY"]).default("RELEVANCE"),
});

// ─── Editorial ───────────────────────────────────────────────────

export const editorialPostCreateSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  category: z.enum(["CAREER_GUIDE", "COLLEGE_REVIEW", "INDUSTRY_TREND", "SKILL_TUTORIAL", "SUCCESS_STORY", "NEWS"]),
  tags: z.array(z.string()).default([]),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
  featuredImage: z.string().url().optional(),
});

export const editorialPostUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().optional(),
  excerpt: z.string().max(500).optional(),
  category: z.enum(["CAREER_GUIDE", "COLLEGE_REVIEW", "INDUSTRY_TREND", "SKILL_TUTORIAL", "SUCCESS_STORY", "NEWS"]).optional(),
  status: z.enum(["DRAFT", "REVIEW", "SCHEDULED", "PUBLISHED", "ARCHIVED"]).optional(),
  tags: z.array(z.string()).optional(),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
  canonicalUrl: z.string().url().optional(),
  featuredImage: z.string().url().optional(),
  scheduledAt: z.string().datetime().optional(),
});

// ─── Comparison ──────────────────────────────────────────────────

export const comparisonSchema = z.object({
  itemIds: z.array(z.string()).min(2, "Select at least 2 items to compare").max(5, "Maximum 5 items"),
  type: z.enum(["CAREER", "COLLEGE", "DEGREE"]),
});

// ─── Simulation ──────────────────────────────────────────────────

export const simulationSchema = z.object({
  careerTitle: z.string().min(1),
  currentAge: z.number().int().min(10).max(80),
  currentSalary: z.number().min(0).default(0),
  savingsRate: z.number().min(0).max(1).default(0.1),
  educationDebt: z.number().min(0).default(0),
  yearsToProject: z.number().int().min(1).max(50).default(20),
  growthRate: z.number().min(-0.5).max(1).default(0.08),
  volatility: z.number().min(0).max(1).default(0.15),
  numSimulations: z.number().int().min(100).max(10000).default(1000),
});

// ─── Career Twin ─────────────────────────────────────────────────

export const careerTwinSyncSchema = z.object({
  profileSnapshot: z.object({
    education: z.string().optional(),
    currentRole: z.string().optional(),
    yearsOfExperience: z.number().min(0).optional(),
    topSkills: z.array(z.string()).optional(),
    interests: z.array(z.string()).optional(),
    careerGoals: z.string().optional(),
    location: z.string().optional(),
    salaryExpectation: z.number().min(0).optional(),
  }),
});

// ─── Export New Types ────────────────────────────────────────────

export type FeatureFlagInput = z.infer<typeof featureFlagSchema>;
export type ConsentUpdateInput = z.infer<typeof consentUpdateSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
export type ReferralCreateInput = z.infer<typeof referralCreateSchema>;
export type ExperimentCreateInput = z.infer<typeof experimentCreateSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type EditorialPostCreateInput = z.infer<typeof editorialPostCreateSchema>;
export type EditorialPostUpdateInput = z.infer<typeof editorialPostUpdateSchema>;
export type ComparisonInput = z.infer<typeof comparisonSchema>;
export type SimulationInput = z.infer<typeof simulationSchema>;
export type CareerTwinSyncInput = z.infer<typeof careerTwinSyncSchema>;
