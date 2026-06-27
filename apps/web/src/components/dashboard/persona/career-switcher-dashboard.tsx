"use client";

import { ArrowRightLeft, Target, TrendingUp, Clock, DollarSign, Route, Award, BarChart3 } from "lucide-react";
import { PersonaRecommendationCards } from "./persona-recommendation-cards";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfidenceScoreCard } from "@/components/intelligence/confidence-score";

interface Props {
  user: any;
  latestResult?: any;
  memory: any;
}

export function CareerSwitcherDashboardContent({ user, latestResult, memory }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome, {user.name?.split(" ")[0] ?? "Career Switcher"}!</h1>
          <p className="text-muted-foreground mt-1">Your transition plan starts here</p>
        </div>
        <Badge variant="glass" className="text-xs gap-1"><ArrowRightLeft className="h-3 w-3" /> Career Switcher Mode</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard variant="strong" className="p-4">
          <Target className="h-5 w-5 text-primary mb-2" />
          <p className="text-2xl font-bold">{memory?.careerUpgradeScore ?? 35}%</p>
          <p className="text-xs text-muted-foreground">Transition Progress</p>
        </GlassCard>
        <GlassCard variant="strong" className="p-4">
          <BriefcaseIcon className="h-5 w-5 text-blue-500 mb-2" />
          <p className="text-lg font-bold truncate">Current</p>
          <p className="text-xs text-muted-foreground">Current Role</p>
        </GlassCard>
        <GlassCard variant="strong" className="p-4">
          <Target className="h-5 w-5 text-emerald-500 mb-2" />
          <p className="text-lg font-bold truncate">Target</p>
          <p className="text-xs text-muted-foreground">Target Role</p>
        </GlassCard>
        <GlassCard variant="strong" className="p-4">
          <Clock className="h-5 w-5 text-amber-500 mb-2" />
          <p className="text-2xl font-bold">--</p>
          <p className="text-xs text-muted-foreground">Time To Switch</p>
        </GlassCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <GlassCard variant="strong" className="p-4">
          <Award className="h-5 w-5 text-purple-500 mb-2" />
          <p className="text-2xl font-bold">{memory?.jobReadinessScore ?? 30}%</p>
          <p className="text-xs text-muted-foreground">Skill Gap Closed</p>
        </GlassCard>
        <GlassCard variant="strong" className="p-4">
          <DollarSign className="h-5 w-5 text-emerald-500 mb-2" />
          <p className="text-lg font-bold">--</p>
          <p className="text-xs text-muted-foreground">Salary Difference</p>
        </GlassCard>
        <GlassCard variant="strong" className="p-4">
          <Route className="h-5 w-5 text-primary mb-2" />
          <p className="text-lg font-bold">
            <Link href="/roadmap" className="text-primary hover:underline">View Plan</Link>
          </p>
          <p className="text-xs text-muted-foreground">Transition Roadmap</p>
        </GlassCard>
      </div>

      <PersonaRecommendationCards persona="CAREER_SWITCHER" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/skills">
              <Card className="hover:border-primary/40 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <Award className="h-8 w-8 text-primary" />
                  <div><p className="font-semibold">Skill Gap Analysis</p><p className="text-xs text-muted-foreground">Compare current vs target</p></div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/certifications">
              <Card className="hover:border-primary/40 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-emerald-500" />
                  <div><p className="font-semibold">Certifications</p><p className="text-xs text-muted-foreground">Fast-track your switch</p></div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/roadmap">
              <Card className="hover:border-primary/40 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <Route className="h-8 w-8 text-blue-500" />
                  <div><p className="font-semibold">Transition Roadmap</p><p className="text-xs text-muted-foreground">Step-by-step plan</p></div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/simulator">
              <Card className="hover:border-primary/40 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                  <div><p className="font-semibold">Future Simulator</p><p className="text-xs text-muted-foreground">Project your outcomes</p></div>
                </CardContent>
              </Card>
            </Link>
          </div>

          <ConfidenceScoreCard />
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-3">Your Transition Checklist</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-4 h-4 rounded border border-border" /> Identify target career
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-4 h-4 rounded border border-border" /> Assess skill gap
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-4 h-4 rounded border border-border" /> Get certified
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-4 h-4 rounded border border-border" /> Update portfolio
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-4 h-4 rounded border border-border" /> Apply for roles
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function BriefcaseIcon(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}
