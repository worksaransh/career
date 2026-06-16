export type EventName =
  | "page_view"
  | "cta_click"
  | "search"
  | "career_view"
  | "career_save"
  | "career_compare"
  | "college_view"
  | "college_save"
  | "college_compare"
  | "degree_view"
  | "degree_save"
  | "assessment_start"
  | "assessment_question_answer"
  | "assessment_complete"
  | "onboarding_step"
  | "onboarding_complete"
  | "roadmap_view"
  | "simulator_compare"
  | "report_download"
  | "report_purchase"
  | "recommendation_click"
  | "recommendation_feedback"
  | "feedback_submit"
  | "referral_share"
  | "referral_signup"
  | "upgrade_click"
  | "upgrade_complete"
  | "profile_update"
  | "consent_update"
  | "experiment_impression"
  | "experiment_conversion"
  | "search_autocomplete"
  | "search_result_click"
  | "weekly_digest_click"
  | "notification_click"
  | "error_encountered";

export interface AnalyticsEvent {
  name: EventName;
  properties?: Record<string, unknown>;
  timestamp?: number;
}

export function createEvent(name: EventName, properties?: Record<string, unknown>): AnalyticsEvent {
  return { name, properties, timestamp: Date.now() };
}
