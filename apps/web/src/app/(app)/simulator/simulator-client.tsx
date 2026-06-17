"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Rocket, TrendingUp, TrendingDown, Minus, Loader2, AlertCircle, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";

interface SimulationResult {
  career: string;
  medianIncome: number;
  p10Income: number;
  p90Income: number;
  unemploymentRisk: number;
  growthRate: number;
  confidence: number;
  aiRisk: string;
}

export function SimulatorClient({ userId, isPremium = false }: { userId: string; isPremium?: boolean }) {
  const [careers, setCareers] = useState<string[]>(["Software Engineer", "Data Scientist"]);
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const CAREER_OPTIONS = [
    "Software Engineer", "Data Scientist", "Product Manager", "Management Consultant",
    "UI/UX Designer", "Investment Banker", "Doctor", "Lawyer", "Civil Engineer", "Architect",
  ];

  const runSimulation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/simulator/monte-carlo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ careers, iterations: 1000 }),
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.data.results);
      } else {
        setError(data.error?.message ?? "Simulation failed");
      }
    } catch {
      setError("Failed to run simulation");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <Rocket className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Future Simulator</h1>
          <p className="text-sm text-muted-foreground">Monte Carlo simulation to compare career financial outcomes</p>
        </div>
      </motion.div>

      {!isPremium && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="no-print">
          <GlassCard variant="strong" className="p-8 border border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-transparent flex flex-col items-center text-center space-y-4 shadow-xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Lock className="h-6 w-6" />
            </div>
            <div className="space-y-2 max-w-lg">
              <h3 className="text-xl font-bold">Unlock Future Simulator</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Run 1,000+ Monte Carlo probability trials comparing starting salary, 10-year income projections, AI displacement risk, and job growth trajectory side-by-side.
              </p>
            </div>
            <Link href="/pricing">
              <Button variant="gradient" size="lg" className="mt-2">
                Upgrade to Premium
              </Button>
            </Link>
          </GlassCard>
        </motion.div>
      )}

      <div className={cn("space-y-6", !isPremium && "relative pointer-events-none select-none opacity-15 filter blur-sm no-print")}>

      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold mb-4">Select Careers to Compare</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {CAREER_OPTIONS.map((c) => (
            <Badge
              key={c}
              variant={careers.includes(c) ? "default" : "outline"}
              className="cursor-pointer transition-colors"
              onClick={() => {
                setCareers((prev) =>
                  prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c].slice(0, 4)
                );
              }}
            >
              {c}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mb-4">Select 2-4 careers to compare side by side.</p>
        <Button onClick={runSimulation} disabled={loading || careers.length < 2} variant="gradient">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Rocket className="h-4 w-4 mr-2" />}
          Run Simulation
        </Button>
      </GlassCard>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      )}

      {results.length > 0 && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{r.career}</span>
                    <Badge variant={r.growthRate > 5 ? "default" : r.growthRate < 0 ? "destructive" : "secondary"}>
                      {r.growthRate > 5 ? <TrendingUp className="h-3 w-3 mr-1" /> : r.growthRate < 0 ? <TrendingDown className="h-3 w-3 mr-1" /> : <Minus className="h-3 w-3 mr-1" />}
                      {r.growthRate > 0 ? "+" : ""}{r.growthRate}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Median Salary</span>
                      <p className="text-lg font-bold mt-1">₹{(r.medianIncome / 100000).toFixed(1)}L</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Unemployment Risk</span>
                      <p className="text-lg font-bold mt-1">{r.unemploymentRisk.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-3">
                      <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">10th Percentile</span>
                      <p className="text-sm font-bold mt-1">₹{(r.p10Income / 100000).toFixed(1)}L</p>
                    </div>
                    <div className="rounded-lg bg-blue-500/5 border border-blue-500/10 p-3">
                      <span className="text-[10px] uppercase font-bold text-blue-500 tracking-wider">90th Percentile</span>
                      <p className="text-sm font-bold mt-1">₹{(r.p90Income / 100000).toFixed(1)}L</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-[10px]">AI Risk: {r.aiRisk}</Badge>
                    <Badge variant="outline" className="text-[10px]">Confidence: {r.confidence}%</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* ─── NEW: LIFETIME EARNINGS COMPARISON CALCULATOR ─── */}
      {results.length >= 2 && !loading && (() => {
        const optA = results[0];
        const optB = results[1];
        if (!optA || !optB) return null;

        const calculateCumulative = (median: number, growth: number, years: number) => {
          let total = 0;
          let current = median;
          for (let i = 0; i < years; i++) {
            total += current;
            current = current * (1 + growth / 100);
          }
          return total;
        };

        const formatCrore = (val: number) => {
          if (val >= 10000000) {
            return `₹${(val / 10000000).toFixed(2)} Crore`;
          }
          return `₹${(val / 100000).toFixed(1)} Lakh`;
        };

        const c5A = calculateCumulative(optA.medianIncome, optA.growthRate, 5);
        const c5B = calculateCumulative(optB.medianIncome, optB.growthRate, 5);

        const c10A = calculateCumulative(optA.medianIncome, optA.growthRate, 10);
        const c10B = calculateCumulative(optB.medianIncome, optB.growthRate, 10);

        const c20A = calculateCumulative(optA.medianIncome, optA.growthRate, 20);
        const c20B = calculateCumulative(optB.medianIncome, optB.growthRate, 20);

        const cLifeA = calculateCumulative(optA.medianIncome, optA.growthRate, 35);
        const cLifeB = calculateCumulative(optB.medianIncome, optB.growthRate, 35);

        const diffLife = Math.abs(cLifeA - cLifeB);
        const preferredCareer = cLifeA > cLifeB ? optA.career : optB.career;
        const diffText = formatCrore(diffLife);

        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <GlassCard className="p-6 border border-amber-500/25 bg-amber-500/[0.01]">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="glass" className="bg-amber-500/20 text-amber-400 border-amber-500/30 font-bold uppercase tracking-wider text-[10px]">
                  Lifetime Earnings Simulator
                </Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold">Side-by-Side Financial Projections</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Accumulative earnings calculations over 35 active working years, assuming a baseline {optA.growthRate}% growth for Option A and {optB.growthRate}% growth for Option B.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 pt-2">
                  <div className="p-3.5 rounded-2xl bg-card border border-border">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">5-Year Cumulative</span>
                    <div className="text-xs font-semibold text-foreground mt-2">
                      <p>Option A: {formatCrore(c5A)}</p>
                      <p className="mt-0.5">Option B: {formatCrore(c5B)}</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-card border border-border">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">10-Year Cumulative</span>
                    <div className="text-xs font-semibold text-foreground mt-2">
                      <p>Option A: {formatCrore(c10A)}</p>
                      <p className="mt-0.5">Option B: {formatCrore(c10B)}</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-card border border-border">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">20-Year Cumulative</span>
                    <div className="text-xs font-semibold text-foreground mt-2">
                      <p>Option A: {formatCrore(c20A)}</p>
                      <p className="mt-0.5">Option B: {formatCrore(c20B)}</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-card border border-border">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Lifetime Earning Potential</span>
                    <div className="text-xs font-semibold text-foreground mt-2">
                      <p>Option A: {formatCrore(cLifeA)}</p>
                      <p className="mt-0.5">Option B: {formatCrore(cLifeB)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/[0.03] border border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4 mt-3">
                  <div>
                    <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest">Projection Difference Insights</h4>
                    <p className="text-sm font-bold text-foreground mt-1">
                      {preferredCareer} offers a lifetime projection gain of <span className="text-amber-400">+{diffText}</span> over the alternative.
                    </p>
                  </div>
                  <Badge variant="glass" className="bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold font-mono py-1 px-3">
                    Confidence Interval: {Math.round((optA.confidence + optB.confidence) / 2)}%
                  </Badge>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        );
      })()}

      {!loading && results.length === 0 && !error && (
        <div className="text-center py-16 text-muted-foreground">
          <Rocket className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Select careers and run the simulation to see projected outcomes</p>
        </div>
      )}
      </div>
    </div>
  );
}
