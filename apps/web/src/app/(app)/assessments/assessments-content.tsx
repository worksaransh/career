"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, ArrowLeft, ArrowRight, Check, RefreshCw, BarChart2 } from "lucide-react";
import toast from "react-hot-toast";

import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { submitAssessment } from "@/lib/actions/assessment-actions";
import { cn } from "@/lib/utils/cn";

interface Option {
  id: string;
  text: string;
  value: number;
}

interface Question {
  id: string;
  text: string;
  options: any; // JSON string or array of Option
  order: number;
  category: string | null;
}

interface AssessmentsContentProps {
  assessment: {
    id: string;
    title: string;
    description: string;
    questions: Question[];
  } | null;
  latestResult: {
    id: string;
    scores: any; // Record<string, number>
    summary: string | null;
    completedAt: Date;
  } | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  Analytical: "from-blue-500 to-indigo-600 bg-blue-500/10 text-blue-400 border-blue-500/20",
  Social: "from-emerald-500 to-teal-600 bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Creative: "from-purple-500 to-pink-600 bg-purple-500/10 text-purple-400 border-purple-500/20",
  Technical: "from-orange-500 to-amber-600 bg-orange-500/10 text-orange-400 border-orange-500/20",
  Leadership: "from-red-500 to-rose-600 bg-red-500/10 text-red-400 border-red-500/20",
  General: "from-slate-500 to-slate-600 bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export function AssessmentsContent({ assessment, latestResult }: AssessmentsContentProps) {
  const router = useRouter();
  const [isRetaking, setIsRetaking] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { optionId: string; value: number }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = assessment?.questions || [];
  const activeResult = isRetaking ? null : latestResult;

  if (questions.length === 0) {
    return (
      <Card variant="glass" className="py-24 text-center">
        <CardContent className="flex flex-col items-center justify-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <Brain className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">No questions available</h1>
          <p className="mt-2 max-w-md text-muted-foreground">
            Questions have not been seeded in the system yet. Please contact an admin.
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentIdx]!;
  
  // Safely parse options JSON
  const rawOptions = currentQuestion.options;
  const options: Option[] = Array.isArray(rawOptions)
    ? rawOptions
    : typeof rawOptions === "string"
      ? JSON.parse(rawOptions)
      : [];

  const progress = ((currentIdx + 1) / questions.length) * 100;
  const currentAnswer = answers[currentQuestion.id];

  const handleSelectOption = (option: Option) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { optionId: option.id, value: option.value },
    }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((idx) => idx + 1);
    }
  };

  const handleBack = () => {
    if (currentIdx > 0) {
      setCurrentIdx((idx) => idx - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast.error("Please answer all questions before submitting.");
      return;
    }

    setIsSubmitting(true);
    const answersPayload = Object.entries(answers).map(([qId, data]) => ({
      questionId: qId,
      optionId: data.optionId,
      value: data.value,
    }));

    try {
      const res = await submitAssessment(assessment!.id, answersPayload);
      if (res.success) {
        toast.success("Assessment submitted successfully!");
        setIsRetaking(false);
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit assessment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Display Assessment results if user has completed it */}
      {activeResult ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">Result Scorecard</span>
            <h1 className="text-3xl font-extrabold tracking-tight mt-1">Your Interest Profile</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Based on your response analysis, here are your interest weights across major dimensions.
            </p>
          </div>

          <GlassCard variant="strong" className="p-8 space-y-8">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <BarChart2 className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-bold text-foreground">Interest Dimension Breakdown</h3>
            </div>

            <div className="space-y-6">
              {Object.entries(activeResult.scores as Record<string, number>).map(([category, score]) => {
                const badgeColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.General;
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-sm">{category}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeColor?.split(" ")[1]} ${badgeColor?.split(" ")[2]} ${badgeColor?.split(" ")[3]}`}>
                          {score >= 70 ? "High Interest" : score >= 40 ? "Medium Interest" : "Low Interest"}
                        </span>
                      </div>
                      <span className="font-mono text-sm font-bold text-primary">{score}%</span>
                    </div>
                    <Progress value={score} variant="gradient" className="h-2.5" />
                  </div>
                );
              })}
            </div>

            <div className="border-t border-border pt-6 flex flex-wrap gap-4 items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Last taken: {new Date(activeResult.completedAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  leftIcon={<RefreshCw className="h-4 w-4" />}
                  onClick={() => {
                    setAnswers({});
                    setCurrentIdx(0);
                    setIsRetaking(true);
                  }}
                >
                  Retake Assessment
                </Button>
                <Button variant="gradient" onClick={() => router.push("/dashboard")}>
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      ) : (
        // Test taking screen
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="text-center space-y-2">
            <Sparkles className="mx-auto h-8 w-8 text-primary" />
            <h1 className="text-2xl font-extrabold tracking-tight">{assessment?.title || "Interest Assessment"}</h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {assessment?.description || "Select the options that best match your personality and values."}
            </p>
          </div>

          <div className="w-full max-w-xl mx-auto">
            <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>Question {currentIdx + 1} of {questions.length}</span>
              <span className="font-mono">{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} variant="gradient" className="mb-6 h-1.5" />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.15 }}
              >
                <GlassCard variant="strong" className="p-8 space-y-6">
                  {currentQuestion.category && (
                    <Badge variant="glass" className="mb-2">
                      {currentQuestion.category} Dimension
                    </Badge>
                  )}
                  <h2 className="text-xl font-bold leading-snug text-foreground">
                    {currentQuestion.text}
                  </h2>

                  <div className="space-y-3 pt-4">
                    {options.map((opt) => {
                      const isSelected = currentAnswer?.optionId === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectOption(opt)}
                          className={cn(
                            "w-full text-left rounded-xl border p-4 transition-all text-sm font-medium",
                            isSelected
                              ? "border-primary bg-primary/5 ring-1 ring-primary text-foreground"
                              : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground bg-card/20"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span>{opt.text}</span>
                            {isSelected && (
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                                <Check className="h-3.5 w-3.5" />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-8 flex gap-3 pt-4 border-t border-border/50">
                    <Button
                      variant="outline"
                      disabled={currentIdx === 0}
                      onClick={handleBack}
                      leftIcon={<ArrowLeft className="h-4 w-4" />}
                    >
                      Back
                    </Button>

                    {currentIdx < questions.length - 1 ? (
                      <Button
                        variant="outline"
                        className="ml-auto"
                        disabled={!currentAnswer}
                        onClick={handleNext}
                        rightIcon={<ArrowRight className="h-4 w-4" />}
                      >
                        Continue
                      </Button>
                    ) : (
                      <Button
                        variant="gradient"
                        className="ml-auto"
                        disabled={!currentAnswer || isSubmitting}
                        loading={isSubmitting}
                        onClick={handleSubmit}
                      >
                        Submit Assessment
                      </Button>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
