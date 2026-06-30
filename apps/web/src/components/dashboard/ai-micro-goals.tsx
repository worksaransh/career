"use client";

import React from "react";
import { CheckSquare, Target, Clock, Zap, DollarSign, Shield, Play } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Props {
  persona: string;
}

export function AiMicroGoals({ persona }: Props) {
  const getGoals = () => {
    switch (persona) {
      case "PROFESSIONAL":
      case "CAREER_SWITCHER":
        return [
          {
            type: "Today's Goal",
            title: "Answer the Smart Daily Question",
            estTime: "2 Mins",
            readinessImpact: "+2% Job Readiness",
            salaryImpact: "+1% Expected Salary",
            scoreImpact: "+15 XP",
            completed: false,
          },
          {
            type: "This Week's Goal",
            title: "Upload & Verify Skills from Resume",
            estTime: "15 Mins",
            readinessImpact: "+8% Job Readiness",
            salaryImpact: "+5% Expected Salary",
            scoreImpact: "+120 XP",
            completed: true,
          },
          {
            type: "This Month's Goal",
            title: "Complete AWS Cloud Practitioner Prep",
            estTime: "4 Hours",
            readinessImpact: "+15% Job Readiness",
            salaryImpact: "+10% Expected Salary",
            scoreImpact: "+500 XP",
            completed: false,
          },
        ];
      case "PARENT":
        return [
          {
            type: "Today's Goal",
            title: "Input preferred college budget limit",
            estTime: "1 Min",
            readinessImpact: "N/A",
            salaryImpact: "Budget Clarity",
            scoreImpact: "+10 XP",
            completed: false,
          },
          {
            type: "This Week's Goal",
            title: "Compare top 3 ROI colleges for child",
            estTime: "20 Mins",
            readinessImpact: "ROI Clear",
            salaryImpact: "Save up to ₹4L in tuition",
            scoreImpact: "+100 XP",
            completed: false,
          },
          {
            type: "This Month's Goal",
            title: "Schedule counselor briefing session",
            estTime: "45 Mins",
            readinessImpact: "100% Alignment",
            salaryImpact: "Unlocks placement assurances",
            scoreImpact: "+300 XP",
            completed: false,
          },
        ];
      default:
        return [
          {
            type: "Today's Goal",
            title: "Review target B.Tech subjects list",
            estTime: "3 Mins",
            readinessImpact: "Clarity Boosted",
            salaryImpact: "Strong Foundation",
            scoreImpact: "+20 XP",
            completed: false,
          },
          {
            type: "This Week's Goal",
            title: "Answer PCM stream assessment questions",
            estTime: "10 Mins",
            readinessImpact: "+5% Assessment Match",
            salaryImpact: "IIT/BITS Admission odds up",
            scoreImpact: "+80 XP",
            completed: false,
          },
          {
            type: "This Month's Goal",
            title: "Build first responsive HTML profile page",
            estTime: "3 Hours",
            readinessImpact: "+10% Portfolio Score",
            salaryImpact: "Kickstarts Dev Portfolio",
            scoreImpact: "+400 XP",
            completed: false,
          },
        ];
    }
  };

  const goals = getGoals();

  return (
    <GlassCard className="p-6 border border-border/80" variant="strong">
      <div className="flex items-center gap-2 mb-5 border-b border-border/40 pb-3">
        <Target className="h-5 w-5 text-emerald-400" />
        <h3 className="font-extrabold text-sm text-foreground">AI Career Micro Goals</h3>
        <Badge variant="glass" className="ml-auto text-[10px] bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-bold">
          Habit Loop Active
        </Badge>
      </div>

      <div className="space-y-4">
        {goals.map((g, idx) => (
          <div key={idx} className="p-3.5 rounded-2xl border border-border bg-card/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant={g.type.startsWith("Today") ? "glass" : "secondary"} className="text-[9px] font-extrabold py-0.5">
                  {g.type}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-0.5"><Clock className="h-3 w-3" /> {g.estTime}</span>
              </div>
              <p className={`text-xs font-bold text-foreground ${g.completed ? "line-through opacity-60" : ""}`}>
                {g.title}
              </p>
              
              <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-muted-foreground">
                <span className="flex items-center gap-0.5 text-blue-400"><Shield className="h-3 w-3" /> {g.readinessImpact}</span>
                <span className="flex items-center gap-0.5 text-emerald-400"><DollarSign className="h-3 w-3" /> {g.salaryImpact}</span>
                <span className="flex items-center gap-0.5 text-amber-500"><Zap className="h-3 w-3" /> {g.scoreImpact}</span>
              </div>
            </div>

            <Button
              variant={g.completed ? "ghost" : "outline"}
              size="sm"
              disabled={g.completed}
              className="text-xs font-extrabold gap-1 self-start md:self-center"
            >
              {g.completed ? "Completed" : "Start"}
            </Button>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
