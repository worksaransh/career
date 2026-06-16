import React from "react";
import { HelpCircle, BookOpen, MessageSquare, Mail, ExternalLink } from "lucide-react";
import { requireAuth } from "@/lib/session/session";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedContainer } from "@/components/ui/animated-container";

export const metadata = { title: "Help Center" };

const FAQ_ITEMS = [
  { q: "How does the career assessment work?", a: "Our AI analyzes your interests, values, and preferences across multiple dimensions to recommend career paths that align with your profile. The assessment takes about 5 minutes." },
  { q: "What is the Career GPS Roadmap?", a: "The GPS Roadmap is a personalized step-by-step career plan that outlines the education, skills, internships, and interview prep needed to reach your target career." },
  { q: "How accurate are the recommendations?", a: "Our recommendations use a graph-based similarity engine combined with confidence scoring. Scores above 80% indicate a strong match based on your assessment results." },
  { q: "Can I compare different career paths?", a: "Yes! Use the Future Simulator to run Monte Carlo simulations comparing salary projections, unemployment risk, and growth rates across different careers." },
  { q: "How do I save items for later?", a: "Click the bookmark icon on any career, degree, college, or skill card to save it. Access all saved items from the Saved Items page." },
  { q: "Is my data private?", a: "Yes. We follow GDPR guidelines. You can export or delete all your data from the Privacy & Consent Center in Settings." },
];

export default async function HelpPage() {
  await requireAuth();

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <AnimatedContainer animation="fadeUp">
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Help Center</h1>
            <p className="text-sm text-muted-foreground">Find answers and get support</p>
          </div>
        </div>
      </AnimatedContainer>

      <AnimatedContainer animation="fadeUp" delay={0.1}>
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><BookOpen className="h-5 w-5" /> Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
                <h3 className="text-sm font-semibold mb-1">{item.q}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </AnimatedContainer>

      <AnimatedContainer animation="fadeUp" delay={0.2}>
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Contact Support</h2>
          <div className="space-y-3">
            <a href="mailto:support@careeros.ai" className="flex items-center gap-2 text-sm text-primary hover:underline">
              <Mail className="h-4 w-4" /> support@careeros.ai
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
              <ExternalLink className="h-4 w-4" /> Report an Issue
            </a>
          </div>
        </GlassCard>
      </AnimatedContainer>
    </div>
  );
}
