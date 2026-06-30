import React from "react";
import Link from "next/link";
import { Brain, ArrowRight, Star, GraduationCap, MapPin, Building2, ExternalLink } from "lucide-react";

import { requireAuth } from "@/lib/session/session";
import { prisma } from "@/lib/db/prisma/prisma";
import { getRecommendations } from "@/lib/graph/recommendations";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { CollegesContent } from "./colleges-content";

export const metadata = { title: "Colleges" };

export default async function CollegesPage() {
  const user = await requireAuth();

  // Check if they completed their assessment
  const latestResult = await prisma.assessmentResult.findFirst({
    where: { userId: user.id },
  });

  if (!latestResult) {
    return (
      <div className="max-w-xl mx-auto py-16 animate-in fade-in duration-300">
        <GlassCard variant="strong" className="p-8 text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <Brain className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Discover Colleges Matches</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Complete your Interest Assessment first so we can analyze your career profile and recommend matching universities with strong career alignment.
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

  // Load user profile & preferences
  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
  });
  const preferences = (profile?.preferences as Record<string, any>) || {};

  // Load college recommendations
  const recommendations = await getRecommendations(user.id, "COLLEGE");

  const collegeIds = recommendations.map(r => r.itemId);
  const colleges = await prisma.college.findMany({
    where: { id: { in: collegeIds } },
    include: { scholarships: true },
  });

  const sortedColleges = recommendations
    .map(rec => {
      const college = colleges.find(c => c.id === rec.itemId);
      if (!college) return null;
      return {
        ...college,
        score: Math.round(rec.score * 100),
        reasons: rec.reasons,
        explanation: rec.explanation,
      };
    })
    .filter(Boolean) as any[];

  // Fetch subscription status
  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const isPremium = (subscription?.tier === "PREMIUM" || subscription?.tier === "UNIVERSITY") && subscription?.status === "ACTIVE";

  return (
    <CollegesContent
      user={user}
      preferences={preferences}
      colleges={sortedColleges}
      isPremium={isPremium}
    />
  );
}

// Utility class helper mapping cn
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

function ChevronRight(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6"/></svg>
  );
}
