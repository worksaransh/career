"use client";

import React, { useEffect, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Brain, TrendingUp, AlertCircle, Sparkles, ChevronRight } from "lucide-react";
import { getDynamicConfidence } from "@/lib/actions/adaptive-question-actions";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

interface ConfidenceData {
  confidence: number;
  missing: string[];
  improvements: { field: string; boost: number }[];
  totalAnswered: number;
  nextMilestone: number;
}

export function ConfidenceScoreCard() {
  const [data, setData] = useState<ConfidenceData | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        const result = await getDynamicConfidence();
        setData(result);
      } catch {
        // Silent fail
      }
    });
  }, []);

  if (!data) {
    return (
      <div className="rounded-2xl border border-border/80 bg-card/40 p-6 animate-pulse">
        <div className="h-24 bg-muted/30 rounded-xl" />
      </div>
    );
  }

  const circumference = 2 * Math.PI * 42;
  const dashOffset = circumference - (data.confidence / 100) * circumference;

  const confidenceColor =
    data.confidence >= 80
      ? "text-emerald-500"
      : data.confidence >= 60
        ? "text-primary"
        : data.confidence >= 40
          ? "text-amber-500"
          : "text-red-400";

  const confidenceGradient =
    data.confidence >= 80
      ? "from-emerald-500 to-emerald-400"
      : data.confidence >= 60
        ? "from-primary to-blue-400"
        : data.confidence >= 40
          ? "from-amber-500 to-amber-400"
          : "from-red-500 to-red-400";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/40 p-6 shadow-md backdrop-blur-sm">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5 blur-3xl -z-10" />

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Brain className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">Profile Intelligence</h3>
          <p className="text-[10px] text-muted-foreground">How well the AI knows you</p>
        </div>
      </div>

      {/* Confidence Ring + Stats */}
      <div className="flex items-center gap-6">
        {/* Animated SVG Ring */}
        <div className="relative shrink-0">
          <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-muted/30"
            />
            {/* Progress ring */}
            <motion.circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="url(#confidenceGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="confidenceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" className={cn("stop-color-current", confidenceColor)} style={{ stopColor: "hsl(var(--primary))" }} />
                <stop offset="100%" style={{ stopColor: data.confidence >= 80 ? "#34d399" : data.confidence >= 60 ? "#60a5fa" : "#fbbf24" }} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className={cn("text-2xl font-extrabold", confidenceColor)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {data.confidence}%
            </motion.span>
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">
              Confidence
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-2.5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs text-foreground font-medium">
              {data.totalAnswered} questions answered
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground">
            Next milestone: <span className="font-bold text-foreground">{data.nextMilestone}</span> questions
          </div>

          {/* Progress bar to next milestone */}
          <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
            <motion.div
              className={cn("h-full rounded-full bg-gradient-to-r", confidenceGradient)}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (data.totalAnswered / data.nextMilestone) * 100)}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Missing data improvements */}
      {data.improvements.length > 0 && (
        <div className="mt-4 space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Answer to improve accuracy
          </p>
          {data.improvements.map((imp) => (
            <div
              key={imp.field}
              className="flex items-center justify-between rounded-lg bg-muted/20 border border-border/40 px-3 py-1.5"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-3 w-3 text-amber-500" />
                <span className="text-[11px] text-muted-foreground">{imp.field}</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-500">+{imp.boost}%</span>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <Link
        href="/assessments"
        className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 px-4 py-2.5 text-xs font-bold text-primary hover:from-primary/15 hover:to-purple-500/15 transition-all"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Improve Your Score
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
