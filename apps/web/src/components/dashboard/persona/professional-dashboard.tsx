"use client";

import { TrendingUp, DollarSign, Target, Award, BookOpen, Briefcase, LineChart, Shield, Zap, AlertTriangle, BarChart3 } from "lucide-react";
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
  whatsappLink: string;
  telegramLink: string;
}

export function ProfessionalDashboardContent({ user, latestResult, memory }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome, {user.name?.split(" ")[0] ?? "Professional"}!</h1>
          <p className="text-muted-foreground mt-1">Track your career growth and earnings potential</p>
        </div>
        <Badge variant="glass" className="text-xs gap-1"><Briefcase className="h-3 w-3" /> Professional Mode</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard variant="strong" className="p-4">
          <TrendingUp className="h-5 w-5 text-primary mb-2" />
          <p className="text-2xl font-bold">{memory?.careerUpgradeScore ?? 65}%</p>
          <p className="text-xs text-muted-foreground">Career Growth Score</p>
        </GlassCard>
        <GlassCard variant="strong" className="p-4">
          <DollarSign className="h-5 w-5 text-emerald-500 mb-2" />
          <p className="text-2xl font-bold">--</p>
          <p className="text-xs text-muted-foreground">Current Salary</p>
        </GlassCard>
        <GlassCard variant="strong" className="p-4">
          <LineChart className="h-5 w-5 text-blue-500 mb-2" />
          <p className="text-2xl font-bold">--</p>
          <p className="text-xs text-muted-foreground">Potential Salary</p>
        </GlassCard>
        <GlassCard variant="strong" className="p-4">
          <Shield className="h-5 w-5 text-amber-500 mb-2" />
          <p className="text-2xl font-bold">{memory?.jobReadinessScore ?? 45}%</p>
          <p className="text-xs text-muted-foreground">Job Readiness</p>
        </GlassCard>
      </div>

      <PersonaRecommendationCards persona="PROFESSIONAL" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/skills">
              <Card className="hover:border-primary/40 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <Award className="h-8 w-8 text-primary" />
                  <div><p className="font-semibold">Skill Gap Analysis</p><p className="text-xs text-muted-foreground">Identify missing skills</p></div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/certifications">
              <Card className="hover:border-primary/40 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <BookOpen className="h-8 w-8 text-emerald-500" />
                  <div><p className="font-semibold">Certifications</p><p className="text-xs text-muted-foreground">Boost your resume</p></div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/roadmap">
              <Card className="hover:border-primary/40 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <Target className="h-8 w-8 text-blue-500" />
                  <div><p className="font-semibold">Career Transition Planner</p><p className="text-xs text-muted-foreground">Plan your next move</p></div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/vault">
              <Card className="hover:border-primary/40 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <Briefcase className="h-8 w-8 text-purple-500" />
                  <div><p className="font-semibold">Portfolio & Resume</p><p className="text-xs text-muted-foreground">Showcase your work</p></div>
                </CardContent>
              </Card>
            </Link>
          </div>

          <ConfidenceScoreCard />
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-3"><AlertTriangle className="h-4 w-4 text-amber-500" /> AI Risk Assessment</h3>
              <p className="text-xs text-muted-foreground mb-3">See how AI automation might affect your career path and what skills to develop.</p>
              <Link href="/careers">
                <Button variant="outline" size="sm" fullWidth>View AI Risk</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-3"><BarChart3 className="h-4 w-4 text-primary" /> Learning Plan</h3>
              <p className="text-xs text-muted-foreground mb-3">Personalized learning recommendations based on your career goals.</p>
              <Link href="/roadmap">
                <Button variant="outline" size="sm" fullWidth>View Plan</Button>
              </Link>
            </CardContent>
          </Card>

          {latestResult && (
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-1">Career Match Score</p>
              <p className="text-2xl font-bold text-primary">
                {(() => { const vals = Object.values(latestResult.scores ?? {}) as number[]; return vals.length > 0 ? `${Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)}%` : "--"; })()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
