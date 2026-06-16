"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brain, ArrowRight, TrendingUp, Cpu, Landmark, ChevronRight, Check, Lock } from "lucide-react";
import { motion } from "framer-motion";

import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { ProgressiveProfilingUnlock } from "@/components/shared/progressive-profiling-unlock";

interface CareersContentProps {
  user: any;
  preferences: any;
  careers: any[];
  isPremium?: boolean;
}

export function CareersContent({ user, preferences, careers, isPremium = false }: CareersContentProps) {
  const router = useRouter();
  const [marks, setMarks] = useState<number | null>(preferences.marks ? Number(preferences.marks) : null);

  const handleUnlockMarks = (newMarks: number) => {
    setMarks(newMarks);
    router.refresh();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header and match progress */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">Tailored Selections</span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">Recommended Careers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Explore career options matched with your interests. Add more profile fields to increase compatibility accuracy.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-muted/20 border border-border/40 p-2.5 rounded-2xl text-xs font-bold">
          <span>Matching Reliability:</span>
          <Badge variant="secondary" className="bg-primary/10 border-primary/20 text-primary">
            {marks ? "75% (High Accuracy)" : "65% (Base Analysis)"}
          </Badge>
        </div>
      </div>

      {/* FOMO progressive profiling unlock card */}
      {!marks && (
        <AnimatedContainer animation="fadeUp" delay={0.05}>
          <ProgressiveProfilingUnlock
            unlockKey="marks"
            title="Unlock Exact Salary Forecasts"
            description="We matched high-growth careers to your profile, but we need your academic marks to unlock exact entry-to-senior salary projections and boost recommendation accuracy."
            placeholder="Enter your Class 10/12/GPA percentage (e.g. 85)"
            inputType="number"
            onUnlock={handleUnlockMarks}
          />
        </AnimatedContainer>
      )}

      {/* Recommended career list grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {careers.slice(0, isPremium ? undefined : 3).map((career, idx) => {
          const isHighMatch = career.score >= 80;
          return (
            <AnimatedContainer key={career.id} animation="fadeUp" delay={idx * 0.05}>
              <GlassCard className="p-6 flex flex-col justify-between h-full hover:shadow-lg transition-all border border-border/80 hover:border-primary/40 relative overflow-hidden group">
                
                {/* Match percentage circular tag */}
                <div className="absolute top-6 right-6">
                  <div className={cn(
                    "flex flex-col items-center justify-center rounded-2xl p-2.5 border font-bold text-xs shadow-sm",
                    isHighMatch
                      ? "bg-primary/10 border-primary/20 text-primary"
                      : "bg-muted border-border text-muted-foreground"
                  )}>
                    <span className="text-lg leading-none">{career.score}%</span>
                    <span className="text-[8px] uppercase tracking-wider mt-0.5">Match</span>
                  </div>
                </div>

                <div className="space-y-4 pr-16">
                  <div>
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors pr-2">
                      {career.title}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">{career.summary}</p>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {career.description}
                  </p>

                  {/* Highlights row with marks locking */}
                  <div className="relative overflow-hidden rounded-xl border border-border/40 bg-muted/15 p-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Salary Range</span>
                        {marks ? (
                          <span className="font-extrabold text-foreground mt-0.5 block">
                            ₹{(career.salaryEntry / 100000).toFixed(0)}L - ₹{(career.salarySenior / 100000).toFixed(0)}L
                          </span>
                        ) : (
                          <div className="flex items-center gap-1 mt-0.5 font-bold text-muted-foreground select-none">
                            <Lock className="h-3 w-3 text-primary" />
                            <span>₹ ••L - ₹ ••L</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Growth Rate</span>
                        <span className="font-extrabold text-foreground mt-0.5 block flex items-center gap-1">
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> +{career.futureGrowthRate}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Badges/Tags */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={career.aiRiskLevel === "LOW" ? "glass" : "outline"} className="text-[10px]">
                      <Cpu className="h-3.5 w-3.5 mr-1" />
                      AI Risk: {career.aiRiskLevel}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      <Landmark className="h-3.5 w-3.5 mr-1" />
                      {career.demandLevel} Demand
                    </Badge>
                  </div>

                  {/* Recommendation Reasons */}
                  <div className="space-y-1.5 pt-2 border-t border-border/50">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Reasoning</span>
                    <ul className="space-y-1 text-xs">
                      {career.reasons.map((reason: string, rIdx: number) => (
                        <li key={rIdx} className="flex items-center gap-2 text-muted-foreground">
                          <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border/50 flex gap-2">
                  <Link href={`/roadmap?careerId=${career.id}`} className="flex-1">
                    <Button variant="outline" size="sm" fullWidth rightIcon={<ChevronRight className="h-4 w-4" />}>
                      GPS Roadmap
                    </Button>
                  </Link>
                  <Link href={`/colleges?careerId=${career.id}`} className="flex-1">
                    <Button variant="ghost" size="sm" fullWidth>
                      Find Colleges
                    </Button>
                  </Link>
                </div>
              </GlassCard>
            </AnimatedContainer>
          );
        })}

        {!isPremium && careers.length > 3 && (
          <AnimatedContainer animation="fadeUp" className="md:col-span-2">
            <GlassCard variant="strong" className="p-8 border border-primary/30 bg-gradient-to-br from-primary/5 via-transparent/5 to-transparent flex flex-col items-center text-center space-y-4 shadow-xl">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Lock className="h-6 w-6" />
              </div>
              <div className="space-y-2 max-w-lg">
                <h3 className="text-xl font-bold">Unlock {careers.length - 3} More Recommended Careers</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Our hybrid recommendations engine matched {careers.length} high-growth career pathways to your interests. Upgrade to Premium to unlock all matches, full roadmap timelines, AI mentor questions, and college options.
                </p>
              </div>
              <Link href="/pricing">
                <Button variant="gradient" size="sm" className="mt-2">
                  Upgrade to Premium
                </Button>
              </Link>
            </GlassCard>
          </AnimatedContainer>
        )}
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
