"use client";

import React from "react";
import { ArrowRight, Star, TrendingUp, Award, PlayCircle, Zap, Shield, CheckCircle2, ChevronRight } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface Props {
  persona: string;
  memory: any;
}

export function DynamicCareerTimeline({ persona, memory }: Props) {
  // Define timeline steps depending on the persona
  const getTimelineSteps = () => {
    switch (persona) {
      case "PROFESSIONAL":
      case "CAREER_SWITCHER":
        return [
          { name: "Current Role", val: memory?.education?.level || "Software Engineer", status: "completed" },
          { name: "Next Skill", val: "System Design & Go", status: "current" },
          { name: "Next Project", val: "Microservices Platform", status: "upcoming" },
          { name: "Certification", val: "AWS Solutions Architect", status: "upcoming" },
          { name: "Next Promotion", val: "Senior Staff Engineer", status: "upcoming" },
          { name: "Target Salary", val: "₹24,00,000 / yr", status: "upcoming" },
          { name: "5-Yr Projection", val: "Tech Lead / CPO", status: "upcoming" },
        ];
      case "PARENT":
        return [
          { name: "Child Class", val: `Class ${memory?.education?.institution || "12"}`, status: "completed" },
          { name: "Entrance Prep", val: "IIT-JEE / SAT prep", status: "current" },
          { name: "College Selection", val: "Top Tier Tier-1/2", status: "upcoming" },
          { name: "ROI Check", val: "Scholarship & Aid Check", status: "upcoming" },
          { name: "First Internship", val: "Tech Core / Finance Core", status: "upcoming" },
          { name: "Placement", val: "₹15L+ Expected Package", status: "upcoming" },
        ];
      default:
        return [
          { name: "Current Class", val: `Class ${memory?.education?.level || "11"}`, status: "completed" },
          { name: "Next Stream", val: "Science (PCM) + CS", status: "current" },
          { name: "Next Olympiad", val: "National Informatics", status: "upcoming" },
          { name: "Target Degree", val: "B.Tech Computer Science", status: "upcoming" },
          { name: "Target College", val: "IIT Bangalore / BITS", status: "upcoming" },
          { name: "5-Yr Projection", val: "Google AI Specialist", status: "upcoming" },
        ];
    }
  };

  const steps = getTimelineSteps();

  // Career Upgrade Meter calculations
  const upgradeScore = memory?.careerUpgradeScore ?? 65;
  const readinessScore = memory?.jobReadinessScore ?? 45;
  const portfolioScore = memory?.portfolioScore ?? 50;
  const skillScore = Math.min(100, Math.round((readinessScore + portfolioScore) / 1.8));
  const potentialScore = Math.min(100, upgradeScore + 18);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* 🚀 CAREER UPGRADE METER */}
      <GlassCard className="p-6 border border-border/80 md:col-span-1" variant="strong">
        <div className="flex items-center gap-2 mb-4 border-b border-border/40 pb-3">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-extrabold text-sm text-foreground">Career Upgrade Meter</h3>
          <Badge variant="glass" className="ml-auto text-[10px] bg-primary/10 border-primary/20 text-primary font-bold">
            POTENTIAL: {potentialScore}%
          </Badge>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-amber-500" /> Career Upgrade Score</span>
              <span>{upgradeScore}%</span>
            </div>
            <Progress value={upgradeScore} variant="gradient" className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-blue-500" /> Job Readiness</span>
              <span>{readinessScore}%</span>
            </div>
            <Progress value={readinessScore} variant="gradient" className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5 text-purple-500" /> Portfolio Strength</span>
              <span>{portfolioScore}%</span>
            </div>
            <Progress value={portfolioScore} variant="gradient" className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-emerald-500" /> Skill Competency</span>
              <span>{skillScore}%</span>
            </div>
            <Progress value={skillScore} variant="gradient" className="h-2" />
          </div>
        </div>

        <div className="mt-5 p-3 rounded-xl bg-primary/5 border border-primary/15 text-xs">
          <p className="font-bold text-foreground mb-1">💡 What improves next?</p>
          <p className="text-muted-foreground leading-relaxed">
            Completing <span className="font-semibold text-foreground">System Design</span> increases Job Readiness by <span className="font-semibold text-emerald-500 text-xs">+8%</span>.
          </p>
        </div>
      </GlassCard>

      {/* 📍 PERSONAL CAREER TIMELINE */}
      <GlassCard className="p-6 border border-border/80 md:col-span-1 lg:col-span-2" variant="strong">
        <div className="flex items-center gap-2 mb-6 border-b border-border/40 pb-3">
          <Award className="h-5 w-5 text-indigo-400" />
          <h3 className="font-extrabold text-sm text-foreground">Your Personal AI Career OS Timeline</h3>
          <Badge variant="glass" className="ml-auto text-[10px] border-indigo-500/20 text-indigo-400 font-bold bg-indigo-500/5">
            Dynamic Growth Path
          </Badge>
        </div>

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-3 pl-4 md:pl-0 border-l border-border/50 md:border-l-0 md:border-t md:pt-6">
          {steps.map((step, idx) => (
            <div key={idx} className="relative flex md:flex-col items-start md:items-center text-left md:text-center gap-3 md:gap-1.5 flex-1 w-full md:w-auto">
              {/* Connector dot */}
              <div className={`absolute left-[-21px] md:left-auto md:top-[-31px] h-[10px] w-[10px] rounded-full border-2 ${
                step.status === "completed"
                  ? "bg-emerald-500 border-emerald-500 shadow-md shadow-emerald-500/30"
                  : step.status === "current"
                    ? "bg-primary border-primary animate-ping"
                    : "bg-background border-border"
              }`} />
              
              <div className="flex flex-col md:items-center">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-0.5">{step.name}</span>
                <span className="text-xs font-semibold text-foreground truncate max-w-[120px] md:max-w-none">{step.val}</span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
