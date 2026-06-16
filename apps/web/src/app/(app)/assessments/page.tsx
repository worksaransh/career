import { requireAuth } from "@/lib/session/session";
import { AssessmentsContent } from "./assessments-content";
import { getAssessmentQuestions, getLatestAssessmentResult } from "@/lib/actions/assessment-actions";

export const metadata = { title: "Assessments" };

export default async function AssessmentsPage() {
  await requireAuth();
  const [assessment, latestResult] = await Promise.all([
    getAssessmentQuestions(),
    getLatestAssessmentResult(),
  ]);

  return <AssessmentsContent assessment={assessment} latestResult={latestResult} />;
}
