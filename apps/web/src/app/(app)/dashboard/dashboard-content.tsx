"use client";

import React from "react";
import {
  Brain,
  Route,
  GraduationCap,
  Building2,
  TrendingUp,
  Award,
  Target,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { User } from "@career-os/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardEngagement } from "@/components/dashboard/dashboard-engagement";
import { ConfidenceScoreCard } from "@/components/intelligence/confidence-score";

interface DashboardContentProps {
  user: User;
  latestResult?: any;
  recommendedCareersCount?: number;
  savedCount?: number;
}

export function DashboardContent({ 
  user, 
  latestResult, 
  recommendedCareersCount, 
  savedCount 
}: DashboardContentProps) {
  // Compute Career Score dynamically from latest assessment result
  let careerScore = "--";
  let careerDesc = "Complete assessments to unlock";
  if (latestResult && latestResult.scores) {
    const scores = Object.values(latestResult.scores) as number[];
    if (scores.length > 0) {
      const avg = Math.round(scores.reduce((sum, v) => sum + v, 0) / scores.length);
      careerScore = `${avg}`;
      careerDesc = "Interest compatibility score";
    }
  }

  const completeness = latestResult ? 63 : user.profileCompleteness;

  const widgets = [
    {
      title: "Career Score",
      value: careerScore,
      icon: Brain,
      color: "from-violet-500 to-purple-600",
      href: "/assessments",
      description: careerDesc,
    },
    {
      title: "Profile Completeness",
      value: `${completeness}%`,
      icon: Target,
      color: "from-blue-500 to-cyan-600",
      href: "/profile",
      description: "Complete your profile",
      progress: completeness,
    },
    {
      title: "Recommended Careers",
      value: latestResult ? `${recommendedCareersCount ?? 0}` : "0",
      icon: TrendingUp,
      color: "from-emerald-500 to-teal-600",
      href: "/careers",
      description: latestResult ? "Personalized matches" : "Unlock career matches",
    },
    {
      title: "Saved Items",
      value: `${savedCount ?? 0}`,
      icon: Building2,
      color: "from-orange-500 to-red-600",
      href: "/saved",
      description: "Manage your saved items",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here&apos;s your career journey overview
          </p>
        </div>
        <Link href="/onboarding">
          <Button variant="gradient" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
            Continue Setup
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {widgets.map((widget, index) => {
          const Icon = widget.icon;
          return (
            <AnimatedContainer key={widget.title} animation="fadeUp" delay={index * 0.05}>
              <Link href={widget.href}>
                <Card variant="elevated" className="h-full group cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {widget.title}
                    </CardTitle>
                    <div className={`rounded-xl bg-gradient-to-br ${widget.color} p-2 text-white`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{widget.value}</div>
                    {"progress" in widget && widget.progress !== undefined && (
                      <Progress value={widget.progress} variant="gradient" className="mt-2" />
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">{widget.description}</p>
                  </CardContent>
                </Card>
              </Link>
            </AnimatedContainer>
          );
        })}
      </div>

      {/* Daily Engagement Hub */}
      <AnimatedContainer animation="fadeUp" delay={0.25}>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight">Daily Habit Hub</h2>
            <Badge variant="glass" className="text-[10px] bg-primary/10 text-primary border-primary/20 font-bold uppercase tracking-wider">Engagement Engine</Badge>
          </div>
          <DashboardEngagement user={user} latestResult={latestResult} />
        </div>
      </AnimatedContainer>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Quick Actions
          </h3>
          <div className="grid gap-3">
            {[
              { icon: Brain, label: latestResult ? "Review/Retake Assessment" : "Take Interest Assessment", href: "/assessments" },
              { icon: Route, label: "View Career Roadmap", href: "/roadmap" },
              { icon: GraduationCap, label: "Explore Degrees", href: "/degrees" },
              { icon: Award, label: "Discover Skills", href: "/skills" },
            ].map((action) => {
              const ActionIcon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent"
                >
                  <ActionIcon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{action.label}</span>
                  <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </Link>
              );
            })}
          </div>
        </GlassCard>

        {/* Profile Intelligence — Dynamic Confidence Score */}
        <ConfidenceScoreCard />
      </div>
    </div>
  );
}
