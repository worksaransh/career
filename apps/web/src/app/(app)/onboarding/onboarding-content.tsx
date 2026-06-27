"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, ArrowLeft, Check } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { User } from "@career-os/types";

interface OnboardingContentProps {
  user: User;
}

const personaOptions = [
  { id: "STUDENT", label: "School Student", description: "Exploring careers, degrees & colleges", icon: "🎓" },
  { id: "PARENT", label: "Parent", description: "Planning my child's education & future", icon: "👨‍👩‍👧‍👦" },
  { id: "COLLEGE_STUDENT", label: "College Student", description: "Building skills, finding internships & jobs", icon: "🏛️" },
  { id: "GRADUATE", label: "Recent Graduate", description: "Starting my career journey", icon: "🎉" },
  { id: "PROFESSIONAL", label: "Working Professional", description: "Growing my career & salary", icon: "💼" },
  { id: "CAREER_SWITCHER", label: "Career Switcher", description: "Transitioning to a new career path", icon: "🔄" },
];

const steps = [
  {
    id: "welcome",
    title: "Welcome to Career OS",
    subtitle: "Let's discover your perfect career path together",
  },
  {
    id: "persona",
    title: "Who are you?",
    subtitle: "Tell us about yourself so we can personalize your experience",
  },
  {
    id: "goal",
    title: "What brings you here?",
    subtitle: "Tell us your primary goal so we can tailor your experience",
  },
  {
    id: "interests",
    title: "What interests you?",
    subtitle: "Select areas you're curious about",
  },
  {
    id: "education",
    title: "Your education level",
    subtitle: "Help us understand where you are in your journey",
  },
  {
    id: "complete",
    title: "You're all set!",
    subtitle: "Your AI-powered career journey begins now",
  },
];

const goals = [
  { id: "EXPLORE_CAREERS", label: "Explore Careers", description: "Discover career paths that match my interests" },
  { id: "CHOOSE_DEGREE", label: "Choose a Degree", description: "Find the right degree program" },
  { id: "FIND_COLLEGE", label: "Find a College", description: "Select the best college for me" },
  { id: "PLAN_ROADMAP", label: "Plan My Roadmap", description: "Create a step-by-step career plan" },
  { id: "SWITCH_CAREER", label: "Switch Careers", description: "Transition to a new career path" },
];

const interestOptions = [
  "Technology", "Science", "Arts", "Business", "Healthcare",
  "Engineering", "Education", "Finance", "Media", "Law",
  "Sports", "Environment", "Social Work", "Design", "Music",
];

export function OnboardingContent({ user }: OnboardingContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [persona, setPersona] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [education, setEducation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const progress = ((step + 1) / steps.length) * 100;

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  };

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
      return;
    }

    setLoading(true);
    await fetch("/api/onboarding/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ persona, goal, interests, education }),
    });
    setLoading(false);
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-primary mb-2" />
          <Progress value={progress} variant="gradient" className="mb-4" />
          <Badge variant="glass">{step + 1} of {steps.length}</Badge>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <GlassCard variant="strong" className="p-8">
              <h2 className="text-2xl font-bold text-center mb-2">
                {steps[step]!.title}
              </h2>
              <p className="text-center text-muted-foreground mb-8">
                {steps[step]!.subtitle}
              </p>

              {step === 1 && (
                <div className="space-y-3">
                  {personaOptions.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPersona(p.id)}
                      className={`w-full text-left rounded-xl border p-4 transition-all ${
                        persona === p.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{p.icon}</span>
                          <div>
                            <p className="font-medium">{p.label}</p>
                            <p className="text-sm text-muted-foreground">{p.description}</p>
                          </div>
                        </div>
                        {persona === p.id && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  {goals.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setGoal(g.id)}
                      className={`w-full text-left rounded-xl border p-4 transition-all ${
                        goal === g.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{g.label}</p>
                          <p className="text-sm text-muted-foreground">{g.description}</p>
                        </div>
                        {goal === g.id && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                        interests.includes(interest)
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              )}

              {step === 4 && (
                <div className="space-y-3">
                  {[
                    { id: "HIGH_SCHOOL", label: "High School", desc: "Class 9-12" },
                    { id: "UNDERGRADUATE", label: "Undergraduate", desc: "Bachelor's degree" },
                    { id: "GRADUATE", label: "Graduate", desc: "Master's or equivalent" },
                    { id: "POSTGRADUATE", label: "Postgraduate", desc: "PhD or advanced degree" },
                    { id: "OTHER", label: "Other", desc: "Diploma, certification, etc." },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setEducation(opt.id)}
                      className={`w-full text-left rounded-xl border p-4 transition-all ${
                        education === opt.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <p className="font-medium">{opt.label}</p>
                      <p className="text-sm text-muted-foreground">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              )}

              {step === 5 && (
                <div className="text-center py-8">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-10 w-10 text-primary" />
                  </div>
                  <p className="text-muted-foreground mb-4">
                    We&apos;ll now analyze your profile and start generating personalized recommendations.
                  </p>
                </div>
              )}

              <div className="mt-8 flex gap-3 items-center">
                {step > 0 && step < 5 && (
                  <Button
                    variant="outline"
                    onClick={() => setStep((s) => s - 1)}
                    leftIcon={<ArrowLeft className="h-4 w-4" />}
                  >
                    Back
                  </Button>
                )}
                <Button
                  variant="gradient"
                  fullWidth={step === 0 || step === 5}
                  size="lg"
                  onClick={handleNext}
                  loading={loading}
                  disabled={
                    (step === 1 && !persona) ||
                    (step === 2 && !goal) ||
                    (step === 3 && interests.length === 0) ||
                    (step === 4 && !education)
                  }
                  rightIcon={step < 5 ? <ArrowRight className="h-4 w-4" /> : undefined}
                >
                  {step === 5 ? "Go to Dashboard" : "Continue"}
                </Button>
                {step > 0 && step < 5 && (
                  <Button
                    variant="ghost"
                    onClick={async () => {
                      setLoading(true);
                      try {
                        await fetch("/api/onboarding/complete", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            persona: persona || "COLLEGE_STUDENT",
                            goal: goal || "EXPLORE_CAREERS",
                            interests: interests.length > 0 ? interests : ["Technology"],
                            education: education || "HIGH_SCHOOL",
                          }),
                        });
                      } catch (err) {}
                      setLoading(false);
                      router.push(callbackUrl);
                      router.refresh();
                    }}
                  >
                    Skip
                  </Button>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
