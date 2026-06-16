import { requireAuth } from "@/lib/session/session";
import { ConsentManager } from "@/components/consent/consent-manager";
import { AnimatedContainer } from "@/components/ui/animated-container";

export const metadata = { title: "Privacy Center" };

export default async function PrivacyCenterPage() {
  await requireAuth();
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <AnimatedContainer>
        <h1 className="text-2xl font-bold">Privacy Center</h1>
        <p className="text-muted-foreground">Manage your privacy preferences and data.</p>
      </AnimatedContainer>
      <ConsentManager />
    </div>
  );
}
