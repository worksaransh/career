"use client";

import { Sparkles, Route, Target, Brain, Building2, GraduationCap, Award, Trophy, Zap, MessageSquare } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardEngagement } from "@/components/dashboard/dashboard-engagement";
import { ConfidenceScoreCard } from "@/components/intelligence/confidence-score";

interface Props {
  user: any;
  latestResult?: any;
  recommendedCareersCount?: number;
  savedCount?: number;
  memory: any;
  initialWeeklyChallenges: any[];
  initialTimelineEvents: any[];
  initialPartners: any[];
  whatsappLink: string;
  telegramLink: string;
}

import { DynamicCareerTimeline } from "../dynamic-career-timeline";
import { AiMicroGoals } from "../ai-micro-goals";

export function StudentDashboardContent({ user, latestResult, recommendedCareersCount, savedCount, memory, initialWeeklyChallenges, initialTimelineEvents, initialPartners, whatsappLink, telegramLink }: Props) {
  let careerScore = "--";
  if (latestResult?.scores) {
    const vals = Object.values(latestResult.scores).filter((v) => typeof v === "number") as number[];
    if (vals.length > 0) careerScore = `${Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome, {user.name?.split(" ")[0] ?? "Student"}!</h1>
          <p className="text-muted-foreground mt-1">Your career journey starts here</p>
        </div>
        <Badge variant="glass" className="text-xs gap-1"><Zap className="h-3 w-3" /> Student Mode</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/careers" className="group">
          <GlassCard variant="strong" className="p-4 hover:ring-2 hover:ring-primary/30 transition-all">
            <Target className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold">{careerScore}%</p>
            <p className="text-xs text-muted-foreground">Career Match</p>
          </GlassCard>
        </Link>
        <Link href="/assessments" className="group">
          <GlassCard variant="strong" className="p-4 hover:ring-2 hover:ring-primary/30 transition-all">
            <Brain className="h-5 w-5 text-emerald-500 mb-2" />
            <p className="text-2xl font-bold">{latestResult ? "Complete" : "Start"}</p>
            <p className="text-xs text-muted-foreground">Career DNA</p>
          </GlassCard>
        </Link>
        <Link href="/skills" className="group">
          <GlassCard variant="strong" className="p-4 hover:ring-2 hover:ring-primary/30 transition-all">
            <Award className="h-5 w-5 text-amber-500 mb-2" />
            <p className="text-2xl font-bold">{recommendedCareersCount ?? 0}</p>
            <p className="text-xs text-muted-foreground">Skills To Learn</p>
          </GlassCard>
        </Link>
        <Link href="/saved" className="group">
          <GlassCard variant="strong" className="p-4 hover:ring-2 hover:ring-primary/30 transition-all">
            <Sparkles className="h-5 w-5 text-purple-500 mb-2" />
            <p className="text-2xl font-bold">{savedCount ?? 0}</p>
            <p className="text-xs text-muted-foreground">Saved Items</p>
          </GlassCard>
        </Link>
      </div>

      {/* Dynamic Growth Timeline & Goals */}
      <DynamicCareerTimeline persona="STUDENT" memory={memory} />
      <AiMicroGoals persona="STUDENT" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/roadmap">
              <Card className="hover:border-primary/40 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <Route className="h-8 w-8 text-primary" />
                  <div><p className="font-semibold">Career GPS</p><p className="text-xs text-muted-foreground">Your 4-year roadmap</p></div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/colleges">
              <Card className="hover:border-primary/40 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <Building2 className="h-8 w-8 text-blue-500" />
                  <div><p className="font-semibold">Colleges</p><p className="text-xs text-muted-foreground">Find your best match</p></div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/degrees">
              <Card className="hover:border-primary/40 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <GraduationCap className="h-8 w-8 text-emerald-500" />
                  <div><p className="font-semibold">Degrees</p><p className="text-xs text-muted-foreground">Compare programs</p></div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/colleges">
              <Card className="hover:border-primary/40 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <Trophy className="h-8 w-8 text-amber-500" />
                  <div><p className="font-semibold">Scholarships</p><p className="text-xs text-muted-foreground">Find funding</p></div>
                </CardContent>
              </Card>
            </Link>
          </div>

          <ConfidenceScoreCard />
        </div>

        <div className="space-y-4">
          <DashboardEngagement user={user} latestResult={latestResult} />
        </div>
      </div>

      {latestResult && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Weekly Goals</p>
            <p className="font-bold text-lg">{initialWeeklyChallenges?.length ?? 0} active</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">XP Earned</p>
            <p className="font-bold text-lg">{memory?.careerUpgradeScore ?? 0}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">AI Coach Sessions</p>
            <p className="font-bold text-lg">
              <Link href="/mentor" className="text-primary hover:underline">Chat Now</Link>
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Decision Timeline</p>
            <p className="font-bold text-lg">{initialTimelineEvents?.length ?? 0} events</p>
          </div>
        </div>
      )}

      {!latestResult && (
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <Brain className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-bold text-lg mb-1">Discover Your Career DNA</h3>
          <p className="text-sm text-muted-foreground mb-4">Take our assessments to unlock personalized career matches, college recommendations, and your complete roadmap.</p>
          <Link href="/assessments">
            <Button variant="gradient">Start Assessment</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
