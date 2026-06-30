import React from "react";
import Link from "next/link";
import { Brain, ArrowRight } from "lucide-react";

import { requireAuth } from "@/lib/session/session";
import { prisma } from "@/lib/db/prisma/prisma";
import { getRecommendations } from "@/lib/graph/recommendations";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { CareersContent } from "./careers-content";

export const metadata = { title: "Career Matches" };

export default async function CareersPage() {
  const user = await requireAuth();

  const [latestResult, profile, recommendations, subscription] = await Promise.all([
    prisma.assessmentResult.findFirst({
      where: { userId: user.id },
    }),
    prisma.userProfile.findUnique({
      where: { userId: user.id },
    }),
    getRecommendations(user.id, "CAREER"),
    prisma.subscription.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!latestResult) {
    return (
      <div className="max-w-xl mx-auto py-16 animate-in fade-in duration-300">
        <GlassCard variant="strong" className="p-8 text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <Brain className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Unlock Your Career Recommendations</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Take our 5-minute AI Interest Assessment to analyze your profile and find the career paths that align best with your values, skills, and interests.
            </p>
          </div>
          <Link href="/assessments" className="block">
            <Button variant="gradient" fullWidth size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Start Interest Assessment
            </Button>
          </Link>
        </GlassCard>
      </div>
    );
  }

  const preferences = (profile?.preferences as Record<string, any>) || {};
  
  const careerIds = recommendations.map(r => r.itemId);
  const careers = await prisma.career.findMany({
    where: { id: { in: careerIds } },
  });

  const sortedCareers = recommendations
    .map(rec => {
      const career = careers.find(c => c.id === rec.itemId);
      if (!career) return null;
      return {
        ...career,
        score: Math.round(rec.score * 100),
        reasons: rec.reasons,
        explanation: rec.explanation,
      };
    })
    .filter(Boolean) as any[];

  const isPremium = (subscription?.tier === "PREMIUM" || subscription?.tier === "UNIVERSITY") && subscription?.status === "ACTIVE";

  return (
    <CareersContent
      user={user}
      preferences={preferences}
      careers={sortedCareers}
      isPremium={isPremium}
    />
  );
}

