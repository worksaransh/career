"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, GraduationCap, MapPin, Building2, ExternalLink, ChevronRight, AlertCircle, Award, Lock } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { ProgressiveProfilingUnlock } from "@/components/shared/progressive-profiling-unlock";

interface CollegesContentProps {
  user: any;
  preferences: any;
  colleges: any[];
  isPremium?: boolean;
}

export function CollegesContent({ user, preferences, colleges, isPremium = false }: CollegesContentProps) {
  const router = useRouter();
  const [budget, setBudget] = useState<number | null>(preferences.budget ? Number(preferences.budget) : null);

  const handleUnlockBudget = (newBudget: number) => {
    setBudget(newBudget);
    router.refresh();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">University Matcher</span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">Recommended Colleges</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Explore higher education institutions with outstanding career placement success and student satisfaction ratings.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-muted/20 border border-border/40 p-2.5 rounded-2xl text-xs font-bold">
          <span>Matching Reliability:</span>
          <Badge variant="secondary" className="bg-primary/10 border-primary/20 text-primary">
            {budget ? "85% (High Accuracy)" : "70% (Base Analysis)"}
          </Badge>
        </div>
      </div>

      {/* FOMO progressive profiling budget unlock */}
      {!budget ? (
        <div className="space-y-6">
          <AnimatedContainer animation="fadeUp" delay={0.05}>
            <ProgressiveProfilingUnlock
              unlockKey="budget"
              title="Unlock College Matches"
              description="We discovered 15+ matching universities for your interest profile. Enter your maximum annual education budget limit to unlock aligned colleges, placings package values, and scholarship options."
              placeholder="Enter maximum fees per year (INR, e.g. 200000)"
              inputType="number"
              onUnlock={handleUnlockBudget}
            />
          </AnimatedContainer>
          
          {/* Blurred preview background */}
          <div className="relative pointer-events-none select-none opacity-20 filter blur-xs grid gap-6 md:grid-cols-2">
            {[1, 2].map((i) => (
              <GlassCard key={i} className="p-6 h-64 border border-border/80">
                <div className="h-6 w-1/3 bg-muted rounded mb-4" />
                <div className="h-4 w-2/3 bg-muted rounded mb-2" />
                <div className="h-4 w-1/2 bg-muted rounded mb-6" />
                <div className="h-12 bg-muted/20 rounded-xl" />
              </GlassCard>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {colleges.length === 0 ? (
            <div className="col-span-full py-16 text-center text-sm text-muted-foreground border border-dashed border-border rounded-3xl bg-card/10">
              No colleges available matching your budget and interests. Please adjust your budget or take another assessment.
            </div>
          ) : (
            colleges.slice(0, isPremium ? undefined : 3).map((college, idx) => {
              const isHighMatch = college.score >= 80;
              return (
                <AnimatedContainer key={college.id} animation="fadeUp" delay={idx * 0.05}>
                  <GlassCard className="p-6 flex flex-col justify-between h-full hover:shadow-lg transition-all border border-border/80 hover:border-primary/40 relative overflow-hidden group">
                    
                    {/* Match score badge */}
                    <div className="absolute top-6 right-6">
                      <div className={cn(
                        "flex flex-col items-center justify-center rounded-2xl p-2.5 border font-bold text-xs shadow-sm",
                        isHighMatch
                          ? "bg-primary/10 border-primary/20 text-primary"
                          : "bg-muted border-border text-muted-foreground"
                      )}>
                        <span className="text-lg leading-none">{college.score}%</span>
                        <span className="text-[8px] uppercase tracking-wider mt-0.5">Fit</span>
                      </div>
                    </div>

                    <div className="space-y-4 pr-16">
                      <div>
                        <h3 className="text-lg font-bold group-hover:text-primary transition-colors pr-2">
                          {college.name}
                        </h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 font-medium">
                          <MapPin className="h-3 w-3 text-muted-foreground" /> {college.location}
                        </p>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {college.description}
                      </p>

                      {/* Highlights row */}
                      <div className="grid grid-cols-2 gap-3 bg-muted/10 border border-border/40 rounded-xl p-3 text-xs">
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Avg Package</span>
                          <span className="font-bold text-foreground mt-0.5 block">
                            ₹{(college.avgPackage / 100000).toFixed(1)} Lakhs
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Placement %</span>
                          <span className="font-bold text-foreground mt-0.5 block">
                            {college.placementPercent}% placed
                          </span>
                        </div>
                      </div>

                      {/* Ratings and rankings */}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="glass" className="text-[10px]">
                          <Building2 className="h-3 w-3 mr-1" />
                          NIRF Rank: #{college.ranking}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          <Star className="h-3 w-3 mr-1 fill-amber-400 text-amber-400" />
                          Rating: {college.rating}/5
                        </Badge>
                      </div>

                      {/* Scholarships */}
                      {college.scholarships && college.scholarships.length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-border/50">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block flex items-center gap-1">
                            <Award className="h-3.5 w-3.5 text-emerald-400" /> Available Scholarships
                          </span>
                          {isPremium ? (
                            college.scholarships.map((sch: any) => (
                              <div key={sch.id} className="rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-2.5 text-xs">
                                <span className="font-bold text-emerald-400 block">{sch.name}</span>
                                <span className="text-muted-foreground text-[10px] block mt-0.5">Value: ₹{sch.amount.toLocaleString("en-IN")} · MCM Criteria</span>
                              </div>
                            ))
                          ) : (
                            <div className="rounded-xl bg-muted/20 border border-border/60 p-2.5 text-xs flex items-center gap-2 text-muted-foreground">
                              <Lock className="h-3.5 w-3.5 text-primary" />
                              <span>Upgrade to Premium to view scholarship aid</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-border/50 flex gap-2">
                      <Link href={`/degrees?collegeSlug=${college.slug}`} className="flex-1">
                        <Button variant="outline" size="sm" fullWidth rightIcon={<ChevronRight className="h-4 w-4" />}>
                          View Degrees
                        </Button>
                      </Link>
                      <a href={`https://www.google.com/search?q=${encodeURIComponent(college.name)}`} target="_blank" rel="noreferrer" className="flex-1">
                        <Button variant="ghost" size="sm" fullWidth>
                          Visit Site
                        </Button>
                      </a>
                    </div>
                  </GlassCard>
                </AnimatedContainer>
              );
            })
          )}

          {!isPremium && colleges.length > 3 && (
            <AnimatedContainer animation="fadeUp" className="md:col-span-2">
              <GlassCard variant="strong" className="p-8 border border-primary/30 bg-gradient-to-br from-primary/5 via-transparent/5 to-transparent flex flex-col items-center text-center space-y-4 shadow-xl">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Lock className="h-6 w-6" />
                </div>
                <div className="space-y-2 max-w-lg">
                  <h3 className="text-xl font-bold">Unlock {colleges.length - 3} More Colleges & Scholarships</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Premium membership unlocks all {colleges.length} recommended universities, placement records details, NIRF rankings analysis, and complete income-based scholarship criteria.
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
      )}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
