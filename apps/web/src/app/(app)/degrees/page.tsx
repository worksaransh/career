import React from "react";
import Link from "next/link";
import { Brain, ArrowRight, TrendingUp, Award, Clock, DollarSign } from "lucide-react";

import { requireAuth } from "@/lib/session/session";
import { prisma } from "@/lib/db/prisma/prisma";
import { getRecommendations } from "@/lib/graph/recommendations";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedContainer } from "@/components/ui/animated-container";

export const metadata = { title: "Degrees" };

export default async function DegreesPage() {
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
            <h2 className="text-2xl font-bold tracking-tight">Unlock Degrees Matches</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Complete your Interest Assessment first so we can analyze your profile and identify degree paths that align with your career goals.
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

  // Load degree recommendations
  const recommendations = await getRecommendations(user.id, "DEGREE");

  const degreeIds = recommendations.map(r => r.itemId);
  const degrees = await prisma.degree.findMany({
    where: { id: { in: degreeIds } },
  });

  const sortedDegrees = recommendations
    .map(rec => {
      const degree = degrees.find(d => d.id === rec.itemId);
      if (!degree) return null;
      return {
        ...degree,
        score: Math.round(rec.score * 100),
        reasons: rec.reasons,
        explanation: rec.explanation,
      };
    })
    .filter(Boolean) as any[];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">Academics GPS</span>
        <h1 className="text-3xl font-extrabold tracking-tight mt-1">Recommended Degrees</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Explore degree programs structured to match your cognitive strength categories and future market opportunities.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {sortedDegrees.length === 0 ? (
          <div className="col-span-full py-16 text-center text-sm text-muted-foreground border border-dashed border-border rounded-3xl bg-card/10">
            No degrees available matching your interests. Please check back later.
          </div>
        ) : (
          sortedDegrees.map((degree, idx) => {
            const isHighMatch = degree.score >= 80;
            // Parse career outcomes safely if they are in JSON
            const outcomes: any[] = Array.isArray(degree.careerOutcomes)
              ? degree.careerOutcomes
              : typeof degree.careerOutcomes === "string"
                ? JSON.parse(degree.careerOutcomes)
                : [];

            return (
              <AnimatedContainer key={degree.id} animation="fadeUp" delay={idx * 0.05}>
                <GlassCard className="p-6 flex flex-col justify-between h-full hover:shadow-lg transition-all border border-border/80 hover:border-primary/40 relative overflow-hidden group">
                  
                  {/* Fit score badge */}
                  <div className="absolute top-6 right-6">
                    <div className={cn(
                      "flex flex-col items-center justify-center rounded-2xl p-2.5 border font-bold text-xs shadow-sm",
                      isHighMatch
                        ? "bg-primary/10 border-primary/20 text-primary"
                        : "bg-muted border-border text-muted-foreground"
                    )}>
                      <span className="text-lg leading-none">{degree.score}%</span>
                      <span className="text-[8px] uppercase tracking-wider mt-0.5">Fit</span>
                    </div>
                  </div>

                  <div className="space-y-4 pr-16">
                    <div>
                      <h3 className="text-lg font-bold group-hover:text-primary transition-colors pr-2">
                        {degree.name}
                      </h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 font-medium">
                        <Clock className="h-3 w-3" /> Duration: {degree.duration}
                      </p>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {degree.description}
                    </p>

                    {/* Cost and returns */}
                    <div className="grid grid-cols-2 gap-3 bg-muted/10 border border-border/40 rounded-xl p-3 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Total Est. Cost</span>
                        <span className="font-bold text-foreground mt-0.5 block">
                          ₹{(degree.costTotal / 100000).toFixed(1)} Lakhs
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">ROI Payback</span>
                        <span className="font-bold text-foreground mt-0.5 block">
                          ~{degree.breakEvenPeriod} Years
                        </span>
                      </div>
                    </div>

                    {/* Resilience score indicators */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="glass" className="text-[10px]">
                        AI Resilience: {(degree.aiResilience * 10).toFixed(0)}%
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        ROI Score: {(degree.riskAdjustedScore * 10).toFixed(0)}%
                      </Badge>
                    </div>

                    {/* Career Outcomes */}
                    {outcomes.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-border/50">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Top Career Outcomes</span>
                        <div className="space-y-1">
                          {outcomes.map((out, oIdx) => (
                            <div key={oIdx} className="flex justify-between items-center text-xs">
                              <span className="text-muted-foreground">{out.title || out.career}</span>
                              <span className="font-semibold font-mono text-foreground">{out.percentage}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/50 flex gap-2">
                    <Link href={`/careers`} className="flex-1">
                      <Button variant="outline" size="sm" fullWidth>
                        Explore Careers
                      </Button>
                    </Link>
                    <Link href={`/colleges`} className="flex-1">
                      <Button variant="ghost" size="sm" fullWidth rightIcon={<ChevronRight className="h-4 w-4" />}>
                        Find Colleges
                      </Button>
                    </Link>
                  </div>
                </GlassCard>
              </AnimatedContainer>
            );
          })
        )}
      </div>
    </div>
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
