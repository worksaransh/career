import { requireAuth } from "@/lib/session/session";
import { OnboardingContent } from "./onboarding-content";

export const metadata = {
  title: "Onboarding",
};

export default async function OnboardingPage() {
  const user = await requireAuth();
  return <OnboardingContent user={user} />;
}
