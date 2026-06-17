"use client";

import React, { useState } from "react";
import {
  Calendar,
  Sparkles,
  BookOpen,
  Trophy,
  Target,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

import { GlassCard } from "@/components/ui/glass-card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { submitWeeklyReflection } from "@/lib/actions/challenge-actions";

export default function ReflectionPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    learned: "",
    challenges: "",
    achievement: "",
    goalsNextWeek: "",
    projectsBuilt: "",
    jobsApplied: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);

  const steps = [
    {
      id: 1,
      title: "Learnings & Knowledge",
      desc: "What did you learn or study this week?",
      placeholder: "I studied advanced SQL joins and practiced 5 Excel formulas...",
      field: "learned",
      icon: BookOpen,
      color: "from-blue-500 to-cyan-600",
    },
    {
      id: 2,
      title: "Obstacles & Challenges",
      desc: "What challenged or blocked you this week?",
      placeholder: "I struggled to understand self-joins in SQL initially...",
      field: "challenges",
      icon: AlertCircle,
      color: "from-orange-500 to-red-600",
    },
    {
      id: 3,
      title: "Achievements & Wins",
      desc: "What achievement or progress are you proud of?",
      placeholder: "I built a basic SQLite script linking 3 tables cleanly...",
      field: "achievement",
      icon: Trophy,
      color: "from-amber-500 to-yellow-600",
    },
    {
      id: 4,
      title: "Future Objectives",
      desc: "What do you want to focus on or improve next week?",
      placeholder: "I want to practice indices and SQL execution plans...",
      field: "goalsNextWeek",
      icon: Target,
      color: "from-purple-500 to-indigo-600",
    },
    {
      id: 5,
      title: "Project Development",
      desc: "Did you build or release any projects this week?",
      placeholder: "Yes, I built a local script and uploaded it to GitHub...",
      field: "projectsBuilt",
      icon: Sparkles,
      color: "from-emerald-500 to-teal-600",
    },
    {
      id: 6,
      title: "Career Outreach",
      desc: "Did you apply for any internships, jobs, or college listings?",
      placeholder: "No applications this week, focused on skill development...",
      field: "jobsApplied",
      icon: Briefcase,
      color: "from-violet-500 to-pink-600",
    },
  ];

  const currentStep = steps[step - 1];
  if (!currentStep) return null;

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const toastId = toast.loading("Saving weekly reflections...");
    try {
      const res = await submitWeeklyReflection(form);
      if (res.success) {
        toast.success("Reflection synchronized successfully! Career Twin updated.", { id: toastId });
        setComplete(true);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to submit reflection", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const progressPercentage = Math.round((step / steps.length) * 100);

  if (complete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-foreground p-6">
        <GlassCard className="max-w-md w-full border border-emerald-500/20 bg-gradient-to-b from-emerald-500/[0.01] to-emerald-500/[0.05] p-8 text-center space-y-6">
          <div className="relative h-20 w-20 flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mx-auto">
            <CheckCircle2 className="h-10 w-10" />
            <div className="absolute inset-0 border border-dashed border-emerald-500/30 rounded-full animate-spin [animation-duration:12s]" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black">Sync Complete!</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your weekly reflection details have been successfully saved. The AI has updated your Career Twin snapshot and recalculated your live upgrade scores!
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/dashboard" className="flex-1">
              <Button variant="gradient" fullWidth>
                Back to Dashboard
              </Button>
            </Link>
            <Link href="/vault" className="flex-1">
              <Button variant="outline" fullWidth>
                View Vault Scores
              </Button>
            </Link>
          </div>
        </GlassCard>
      </div>
    );
  }

  const Icon = currentStep.icon;

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-foreground pb-20 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Weekly Reflection</h1>
        <p className="text-sm text-muted-foreground">
          Take a moment to record your learnings, achievements, and challenges.
        </p>
      </div>

      <Progress value={progressPercentage} variant="gradient" className="h-2 bg-slate-800 rounded-full" />

      {/* Step card */}
      <GlassCard className="border border-border p-6 shadow-xl relative overflow-hidden space-y-6">
        {/* Step Badge */}
        <div className="flex items-center justify-between">
          <Badge variant="glass" className="bg-primary/10 text-primary border-primary/20 uppercase font-mono tracking-wider text-[10px]">
            STEP {step} OF {steps.length}
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">{progressPercentage}% Complete</span>
        </div>

        {/* Step question */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-gradient-to-br ${currentStep.color} text-white`}>
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-foreground">{currentStep.title}</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed pl-1">
            {currentStep.desc}
          </p>
        </div>

        {/* Text Area */}
        <div className="space-y-1.5 pt-2">
          <textarea
            required
            rows={4}
            value={(form as any)[currentStep.field]}
            onChange={(e) => setForm((prev) => ({ ...prev, [currentStep.field]: e.target.value }))}
            className="w-full rounded-2xl border border-border bg-background/50 p-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/50 leading-relaxed"
            placeholder={currentStep.placeholder}
          />
        </div>

        {/* Nav Row */}
        <div className="flex items-center justify-between pt-4 border-t border-border/80">
          <Button
            type="button"
            variant="ghost"
            disabled={step === 1}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={handleBack}
          >
            Back
          </Button>

          {step < steps.length ? (
            <Button
              type="button"
              variant="gradient"
              disabled={!(form as any)[currentStep.field].trim()}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              onClick={handleNext}
            >
              Next Step
            </Button>
          ) : (
            <Button
              type="button"
              variant="gradient"
              disabled={!(form as any)[currentStep.field].trim() || submitting}
              rightIcon={submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              onClick={handleSubmit}
            >
              Finish Reflection
            </Button>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
