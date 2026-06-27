// ─── Core Entity Types ───────────────────────────────────────────

export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "CONTENT_MANAGER"
  | "SCHOOL_MANAGER"
  | "SUPPORT_AGENT"
  | "ANALYST"
  | "FINANCE"
  | "MODERATOR"
  | "USER";

export type PrimaryPersona =
  | "STUDENT"
  | "PARENT"
  | "COLLEGE_STUDENT"
  | "GRADUATE"
  | "PROFESSIONAL"
  | "CAREER_SWITCHER";

export type OnboardingStep =
  | "WELCOME"
  | "PERSONA"
  | "GOAL"
  | "INTERESTS"
  | "EDUCATION"
  | "COMPLETE";

export type ProfileCompleteness = 10 | 25 | 47 | 63 | 89 | 100;

export type Language = "en" | "hi" | "hinglish";

export type ThemeMode = "light" | "dark" | "system";

export type SubscriptionTier = "FREE" | "PREMIUM" | "SCHOOL" | "UNIVERSITY";

export type AssessmentType =
  | "INTEREST"
  | "PERSONALITY"
  | "SKILLS"
  | "LEARNING_STYLE"
  | "CAREER_GOALS";

// ─── User ────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  image: string | null;
  role: UserRole;
  primaryPersona: PrimaryPersona;
  onboardingStep: OnboardingStep;
  profileCompleteness: ProfileCompleteness;
  language: Language;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  bio: string | null;
  location: string | null;
  educationLevel: string | null;
  currentGrade: string | null;
  dateOfBirth: string | null;
  interests: string[];
  savedCareers: string[];
  savedColleges: string[];
  savedDegrees: string[];
  assessmentResults: AssessmentResult[];
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: ThemeMode;
  language: Language;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  weeklyDigest: boolean;
}

export interface UserSession {
  id: string;
  userId: string;
  device: string | null;
  location: string | null;
  ip: string | null;
  lastActive: string;
  createdAt: string;
}

// ─── Assessments ────────────────────────────────────────────────

export interface Assessment {
  id: string;
  type: AssessmentType;
  title: string;
  description: string;
  questions: AssessmentQuestion[];
  timeEstimate: number;
  isActive: boolean;
  language: Language;
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  options: AssessmentOption[];
  order: number;
  category: string | null;
}

export interface AssessmentOption {
  id: string;
  text: string;
  value: number;
}

export interface AssessmentResult {
  id: string;
  userId: string;
  assessmentId: string;
  type: AssessmentType;
  scores: Record<string, number>;
  summary: string;
  completedAt: string;
}

// ─── Career ─────────────────────────────────────────────────────

export interface Career {
  id: string;
  title: string;
  slug: string;
  description: string;
  summary: string;
  salaryRange: SalaryRange;
  demandLevel: "HIGH" | "MEDIUM" | "LOW";
  aiRiskLevel: "LOW" | "MEDIUM" | "HIGH";
  futureGrowthRate: number;
  requiredSkills: string[];
  recommendedDegrees: string[];
  certifications: string[];
  alternativeCareers: string[];
  matchScore: number;
  isActive: boolean;
  seoMetadata: SEOMetadata;
}

export interface SalaryRange {
  currency: string;
  entry: number;
  mid: number;
  senior: number;
  tenYearGrowthPercent: number;
}

export interface CareerRecommendation {
  career: Career;
  matchPercentage: number;
  reasoning: string;
  alternativeCareers: Career[];
  salaryForecast: SalaryForecast;
}

export interface SalaryForecast {
  current: number;
  fiveYear: number;
  tenYear: number;
  growthRate: number;
}

// ─── Degree ─────────────────────────────────────────────────────

export interface Degree {
  id: string;
  name: string;
  slug: string;
  description: string;
  duration: string;
  cost: CostBreakdown;
  roi: ROIAnalysis;
  careerOutcomes: CareerOutcome[];
  aiResilience: number;
  futureOpportunities: string[];
  universities: string[];
  requiredSubjects: string[];
  seoMetadata: SEOMetadata;
}

export interface CostBreakdown {
  total: number;
  tuition: number;
  fees: number;
  livingExpenses: number;
  currency: string;
}

export interface ROIAnalysis {
  fiveYearReturn: number;
  tenYearReturn: number;
  lifetimeReturn: number;
  breakEvenPeriod: number;
  riskAdjustedScore: number;
}

export interface CareerOutcome {
  career: string;
  percentage: number;
  averageSalary: number;
}

// ─── College ────────────────────────────────────────────────────

export interface College {
  id: string;
  name: string;
  slug: string;
  description: string;
  location: string;
  ranking: number;
  fees: CostBreakdown;
  placements: PlacementStats;
  roi: ROIAnalysis;
  scholarships: Scholarship[];
  rating: number;
  reviewCount: number;
  studentCount: number;
  similarColleges: string[];
  studentFitScore: number;
  seoMetadata: SEOMetadata;
}

export interface PlacementStats {
  averagePackage: number;
  highestPackage: number;
  placementPercentage: number;
  topRecruiters: string[];
  currency: string;
}

export interface Scholarship {
  id: string;
  name: string;
  amount: number;
  eligibility: string;
  deadline: string;
  isMeritBased: boolean;
}

// ─── Roadmap ────────────────────────────────────────────────────

export interface CareerRoadmap {
  id: string;
  userId: string;
  careerId: string;
  currentPosition: string;
  goalPosition: string;
  yearsToGoal: number;
  milestones: Milestone[];
  generatedAt: string;
}

export interface Milestone {
  year: number;
  title: string;
  description: string;
  type: "PROJECT" | "CERTIFICATION" | "INTERNSHIP" | "JOB" | "SKILL" | "EDUCATION";
  status: "LOCKED" | "CURRENT" | "COMPLETED";
  tasks: string[];
  resources: string[];
}

// ─── Comparison (Future Simulator) ──────────────────────────────

export interface CareerComparison {
  optionA: CareerOption;
  optionB: CareerOption;
  insights: ComparisonInsight[];
}

export interface CareerOption {
  career: Career;
  salaryProjection: number[];
  aiRiskScore: number;
  roiScore: number;
  timeline: number;
  totalCost: number;
  demandTrend: "RISING" | "STABLE" | "DECLINING";
  workLifeBalance: number;
}

export interface ComparisonInsight {
  category: string;
  winner: "A" | "B" | "TIE";
  explanation: string;
  difference: string;
}

// ─── Parent Dashboard ──────────────────────────────────────────

export interface ParentDashboard {
  student: User;
  roiAnalysis: ROIAnalysis;
  costBreakdown: CostBreakdown;
  salaryProjection: SalaryForecast;
  aiRiskAssessment: string;
  backupCareers: string[];
  recommendations: string[];
}

// ─── Reports ────────────────────────────────────────────────────

export type ReportType =
  | "STUDENT_SUMMARY"
  | "CAREER_ANALYSIS"
  | "DEGREE_ANALYSIS"
  | "COLLEGE_SUGGESTIONS"
  | "SALARY_FORECAST"
  | "PARENT_REPORT"
  | "ROADMAP";

export interface Report {
  id: string;
  userId: string;
  type: ReportType;
  title: string;
  data: Record<string, unknown>;
  generatedAt: string;
  isPremium: boolean;
}

// ─── Admin / CMS ────────────────────────────────────────────────

export interface CMSContent {
  id: string;
  key: string;
  section: string;
  type: "TEXT" | "IMAGE" | "VIDEO" | "LOTTIE" | "BANNER" | "TESTIMONIAL";
  value: string;
  metadata: Record<string, string> | null;
  language: Language;
  isActive: boolean;
  updatedAt: string;
}

export interface MediaAsset {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  type: "IMAGE" | "VIDEO" | "LOTTIE" | "ICON";
  section: string;
  tags: string[];
}

// ─── Analytics ──────────────────────────────────────────────────

export interface AnalyticsEvent {
  id: string;
  userId: string | null;
  event: string;
  properties: Record<string, unknown>;
  sessionId: string;
  timestamp: string;
}

export interface AnalyticsMetric {
  totalUsers: number;
  activeUsers: number;
  assessmentCompletions: number;
  conversions: number;
  revenue: number;
  topSearches: { term: string; count: number }[];
  deviceBreakdown: Record<string, number>;
  languageBreakdown: Record<string, number>;
}

// ─── Payments ───────────────────────────────────────────────────

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: "SUCCEEDED" | "FAILED" | "PENDING" | "REFUNDED";
  tier: SubscriptionTier;
  couponCode: string | null;
  referralId: string | null;
  paidAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: "ACTIVE" | "CANCELED" | "EXPIRED" | "TRIAL";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

// ─── Notifications ──────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  type: "EMAIL" | "PUSH" | "IN_APP";
  title: string;
  body: string;
  data: Record<string, string> | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationPreferences {
  weeklyRoadmapUpdates: boolean;
  newScholarships: boolean;
  newCollegeMatches: boolean;
  skillReminders: boolean;
  assessmentReminders: boolean;
  marketingEmails: boolean;
}

// ─── SEO ────────────────────────────────────────────────────────

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string | null;
  canonicalUrl: string | null;
  schema: Record<string, unknown> | null;
}

// ─── Audit ──────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, unknown> | null;
  ip: string | null;
  userAgent: string | null;
  timestamp: string;
}

// ─── API ────────────────────────────────────────────────────────

export interface APIResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: APIError | null;
  metadata: APIMetadata | null;
}

export interface APIError {
  code: string;
  message: string;
  details: Record<string, string[]> | null;
}

export interface APIMetadata {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ─── Feature Flags ────────────────────────────────────────────────

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  percentage?: number;
  description?: string;
}

// ─── Privacy & Consent ───────────────────────────────────────────

export type ConsentType =
  | "COOKIE_CONSENT"
  | "DATA_PROCESSING"
  | "AI_PERSONALIZATION"
  | "PARENT_CONSENT"
  | "ACTIVITY_HISTORY";

export interface ConsentSettings {
  cookieConsent: boolean;
  dataProcessing: boolean;
  aiPersonalization: boolean;
  parentConsent: boolean;
  activityHistory: boolean;
}

export interface ConsentLog {
  id: string;
  type: ConsentType;
  granted: boolean;
  timestamp: string;
  ip: string | null;
}

// ─── Career Intelligence Graph ────────────────────────────────────

export interface GraphNode {
  id: string;
  type: "CAREER" | "DEGREE" | "COLLEGE" | "SKILL" | "INTEREST" | "INDUSTRY" | "CERTIFICATION";
  label: string;
  metadata: Record<string, unknown>;
}

export interface GraphEdge {
  sourceId: string;
  targetId: string;
  relationship: "REQUIRES_SKILL" | "RECOMMENDS_DEGREE" | "OFFERED_AT" | "LEADS_TO" | "SIMILAR_TO" | "TRANSITIONS_TO";
  weight: number;
}

export interface GraphRecommendation {
  item: GraphNode;
  score: number;
  reasons: string[];
  matchedOn: string[];
}

// ─── Confidence Engine ───────────────────────────────────────────

export type ConfidenceLevel = "VERY_LOW" | "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";

export interface ConfidenceScore {
  overall: number;
  level: ConfidenceLevel;
  label: string;
  factors: ConfidenceFactor[];
  suggestions: ConfidenceSuggestion[];
}

export interface ConfidenceFactor {
  name: string;
  score: number;
  weight: number;
  weightedScore: number;
  maxScore: number;
}

export interface ConfidenceSuggestion {
  factor: string;
  description: string;
  potentialGain: number;
  effort: "LOW" | "MEDIUM" | "HIGH";
}

// ─── Explainability ──────────────────────────────────────────────

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

// ─── AI Safeguards ───────────────────────────────────────────────

export type VerificationResult<T> =
  | { verified: true; data: T; source: string }
  | { verified: false; error: string; suggestion: string };

// ─── Feedback Loop ───────────────────────────────────────────────

export type FeedbackRating = 1 | 2 | 3 | 4 | 5;
export type FeedbackReason =
  | "IRRELEVANT"
  | "NOT_INTERESTED"
  | "ALREADY_KNOWN"
  | "TOO_EXPENSIVE"
  | "LOCATION"
  | "SALARY"
  | "AI_RISK"
  | "PERFECT_MATCH"
  | "EXCEEDS_EXPECTATIONS"
  | "OTHER";

// ─── Progressive Profiling ───────────────────────────────────────

export type ProfileAttribute =
  | "NAME" | "EMAIL" | "PHONE" | "LOCATION" | "EDUCATION"
  | "WORK_EXPERIENCE" | "CURRENT_ROLE" | "SKILLS" | "INTERESTS"
  | "CAREER_GOALS" | "SALARY_EXPECTATION" | "WILLING_TO_RELOCATE"
  | "EDUCATION_LEVEL" | "BUDGET" | "PARENT_OCCUPATION"
  | "DISABILITY_STATUS" | "GENDER" | "DOB";

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

// ─── Career Twin ─────────────────────────────────────────────────

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

// ─── Outcome Intelligence ────────────────────────────────────────

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

// ─── Weekly Intelligence ─────────────────────────────────────────

export interface WeeklyIntelligence {
  userId: string;
  weekStart: string;
  weekEnd: string;
  title: string;
  summary: string;
  insights: WeeklyInsight[];
  nudge: WeeklyNudge | null;
  trendingCareers: TrendingCareer[];
  recommendedActions: RecommendedAction[];
  quote: MotivationalQuote;
}

export interface WeeklyInsight {
  type: "PROFILE" | "MARKET" | "SKILL" | "APPLICATION" | "GROWTH";
  message: string;
  severity: "INFO" | "SUCCESS" | "WARNING";
}

export interface WeeklyNudge {
  message: string;
  action: string;
  actionUrl: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
}

export interface TrendingCareer {
  title: string;
  trend: "UP" | "DOWN" | "NEW";
  percentageChange: number;
  reason: string;
}

export interface RecommendedAction {
  id: string;
  title: string;
  description: string;
  effort: "LOW" | "MEDIUM" | "HIGH";
  impact: "LOW" | "MEDIUM" | "HIGH";
  category: "LEARN" | "APPLY" | "NETWORK" | "RESEARCH";
}

export interface MotivationalQuote {
  text: string;
  author: string;
}

// ─── Referral Engine ─────────────────────────────────────────────

export interface Referral {
  id?: string;
  referrerId: string;
  refereeEmail: string;
  status: "PENDING" | "JOINED" | "ACTIVE" | "EXPIRED" | "REWARDED";
  rewardType: "PREMIUM_ACCESS" | "FEATURE_UNLOCK" | "BONUS_MONTH";
  rewardClaimed: boolean;
  createdAt?: string;
  joinedAt?: string | null;
}

export interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  activeReferrals: number;
  rewardedReferrals: number;
  rewardsEarned: number;
}

// ─── Experimentation ─────────────────────────────────────────────

export interface Experiment {
  id: string;
  name: string;
  description: string;
  status: "DRAFT" | "RUNNING" | "PAUSED" | "COMPLETED" | "ARCHIVED";
  type: "A/B" | "MULTIVARIATE";
  variants: Variant[];
  targetMetric: ExperimentMetric;
  startDate?: string;
  endDate?: string;
  minSampleSize: number;
}

export interface Variant {
  id: string;
  name: string;
  trafficPercent: number;
  config: Record<string, unknown>;
}

export interface ExperimentMetric {
  name: string;
  type: "CLICK_RATE" | "CONVERSION" | "ENGAGEMENT" | "SATISFACTION" | "TIME_SPENT";
  target: number;
}

export interface ExperimentResult {
  experimentId: string;
  variantResults: VariantResult[];
  winner: string | null;
  confidence: number;
  significant: boolean;
  totalParticipants: number;
}

export interface VariantResult {
  variantId: string;
  variantName: string;
  participants: number;
  metricValue: number;
  improvement: number;
}

// ─── Universal Search ────────────────────────────────────────────

export interface SearchResult {
  id: string;
  type: "CAREER" | "COLLEGE" | "DEGREE" | "SKILL" | "USER" | "ARTICLE";
  title: string;
  subtitle: string;
  description: string;
  image?: string;
  url: string;
  relevanceScore: number;
  metadata: Record<string, unknown>;
}

export interface SearchResponse {
  results: SearchResult[];
  totalResults: number;
  query: string;
  facets: SearchFacet[];
  didYouMean?: string;
  searchTime: number;
}

export interface SearchFacet {
  name: string;
  counts: Record<string, number>;
}

export interface SearchOptions {
  query: string;
  types?: SearchResult["type"][];
  limit?: number;
  offset?: number;
  filters?: Record<string, string>;
  sortBy?: "RELEVANCE" | "RATING" | "DEMAND" | "SALARY";
}

// ─── Comparison Engine ───────────────────────────────────────────

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

// ─── Future Simulator ────────────────────────────────────────────

export interface SimulationConfig {
  careerTitle: string;
  currentAge: number;
  currentSalary: number;
  savingsRate: number;
  educationDebt: number;
  yearsToProject: number;
  growthRate: number;
  volatility: number;
  numSimulations: number;
}

export interface SimulationResult {
  medianPath: SimulationYear[];
  optimisticPath: SimulationYear[];
  pessimisticPath: SimulationYear[];
  summary: SimulationSummary;
}

export interface SimulationYear {
  year: number;
  age: number;
  salary: number;
  savings: number;
  netWorth: number;
}

export interface SimulationSummary {
  medianNetWorthAtEnd: number;
  optimisticNetWorthAtEnd: number;
  pessimisticNetWorthAtEnd: number;
  yearsToDebtFree: number;
  peakEarningAge: number;
  totalLifetimeEarnings: number;
  confidenceLevel: number;
}

// ─── Editorial Workflow ──────────────────────────────────────────

export type PostStatus = "DRAFT" | "REVIEW" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
export type PostCategory = "CAREER_GUIDE" | "COLLEGE_REVIEW" | "INDUSTRY_TREND" | "SKILL_TUTORIAL" | "SUCCESS_STORY" | "NEWS";

export interface EditorialPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: PostCategory;
  status: PostStatus;
  authorId: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  featuredImage?: string;
  publishedAt?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── SEO Engine ──────────────────────────────────────────────────

export interface SEOPage {
  url: string;
  title: string;
  metaDescription: string;
  h1: string;
  contentSections: SEOContentSection[];
  faqSchema: FAQSchema[];
  breadcrumbs: Breadcrumb[];
  canonical: string;
  ogImage: string;
}

export interface SEOContentSection {
  heading: string;
  body: string;
  type: "TEXT" | "LIST" | "TABLE" | "COMPARISON";
  items?: string[];
}

export interface FAQSchema {
  question: string;
  answer: string;
}

export interface Breadcrumb {
  label: string;
  url: string;
}

// ─── Explorer Pages ──────────────────────────────────────────────

export interface ExplorerPage {
  type: "CAREER" | "COLLEGE" | "DEGREE" | "SKILL";
  slug: string;
  seo: SEOPage;
  relatedItems: ExplorerRelatedItem[];
  stats: ExplorerStats;
  cta: ExplorerCTA;
  richItems?: any[];
}

export interface ExplorerRelatedItem {
  title: string;
  url: string;
  type: "CAREER" | "COLLEGE" | "DEGREE";
  relevance: number;
}

export interface ExplorerStats {
  totalCareers: number;
  totalColleges: number;
  totalDegrees: number;
  averageSalary: number;
  topDemandCareers: string[];
}

export interface ExplorerCTA {
  primary: { text: string; url: string };
  secondary: { text: string; url: string };
}
