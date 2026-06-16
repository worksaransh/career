"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  DollarSign, 
  TrendingUp, 
  ShieldAlert, 
  FileText, 
  Printer, 
  RefreshCw, 
  MapPin, 
  Info, 
  ChevronRight, 
  Star,
  Zap,
  Building,
  GraduationCap,
  Lock
} from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { ProgressiveProfilingUnlock } from "@/components/shared/progressive-profiling-unlock";

interface ParentsContentProps {
  user: any;
  preferences: any;
  careers: any[];
  colleges: any[];
  degrees: any[];
  isPremium?: boolean;
}

export function ParentsContent({ user, preferences, careers = [], colleges = [], degrees = [], isPremium = false }: ParentsContentProps) {
  const router = useRouter();
  const [familyIncome, setFamilyIncome] = useState<number | null>(
    preferences.familyIncome ? Number(preferences.familyIncome) : null
  );
  
  const [selectedCareerId, setSelectedCareerId] = useState(careers[0]?.id || "");
  const activeCareer = careers.find(c => c.id === selectedCareerId) || careers[0];
  const activeDegree = degrees[0] || { duration: "4 Years" };
  const duration = parseInt(activeDegree.duration) || 4;

  // Scenario Simulator Inputs
  const [tuition, setTuition] = useState(200000); // per year
  const [scholarship, setScholarship] = useState(
    preferences.familyIncome && Number(preferences.familyIncome) < 600000 ? 50000 : 0
  ); // per year
  const [living, setLiving] = useState(100000); // per year
  const [misc, setMisc] = useState(20000); // books & other per year
  const [salaryEntry, setSalaryEntry] = useState(activeCareer?.salaryEntry || 800000);
  const [increment, setIncrement] = useState(10); // annual %
  const [inflation, setInflation] = useState(6); // annual %
  const [locationType, setLocationType] = useState("METRO"); // METRO, NON_METRO

  // Update salary input when selected career changes
  useEffect(() => {
    if (activeCareer) {
      setSalaryEntry(activeCareer.salaryEntry);
    }
  }, [selectedCareerId]);

  // Set scholarship when familyIncome changes (progressive unlock dynamic)
  useEffect(() => {
    if (familyIncome && familyIncome < 600000) {
      setScholarship(50000);
    }
  }, [familyIncome]);

  const handleUnlockIncome = (newIncome: number) => {
    setFamilyIncome(newIncome);
    router.refresh();
  };

  const handleReset = () => {
    setTuition(200000);
    setScholarship(familyIncome && familyIncome < 600000 ? 50000 : 0);
    setLiving(100000);
    setMisc(20000);
    setSalaryEntry(activeCareer?.salaryEntry || 800000);
    setIncrement(10);
    setInflation(6);
    setLocationType("METRO");
  };

  // Calculations
  const locFactor = locationType === "METRO" ? 1.2 : 0.9;
  const yearlyLivingCost = living * locFactor;
  const totalInvestment = Math.max(0, (tuition + yearlyLivingCost + misc - scholarship) * duration);
  
  // Calculate 5-year earnings with annual increments
  let currentSalary = salaryEntry;
  let total5YearEarnings = 0;
  for (let y = 1; y <= 5; y++) {
    total5YearEarnings += currentSalary;
    currentSalary = currentSalary * (1 + increment / 100);
  }

  // Adjusted 5-year Net ROI
  const net5YearROI = totalInvestment > 0 
    ? Math.round(((total5YearEarnings - totalInvestment) / totalInvestment) * 100)
    : 100;
    
  const paybackPeriod = salaryEntry > 0
    ? Number((totalInvestment / salaryEntry).toFixed(1))
    : 0;

  const lifetimeGrowth = activeCareer 
    ? activeCareer.salarySenior - activeCareer.salaryEntry
    : 0;

  const demandScore = activeCareer?.demandLevel === "HIGH" ? 92 : activeCareer?.demandLevel === "MEDIUM" ? 65 : 35;
  const automationRiskText = activeCareer?.aiRiskLevel || "MEDIUM";

  // Comparison top 3 recommendations calculations
  const topRecommendations = careers.slice(0, 3).map(c => {
    const defaultTotal = 800000;
    const est5YrEarnings = c.salaryEntry * 5.8; // approximate scale
    const roiMult = Number((est5YrEarnings / defaultTotal).toFixed(1));
    const payback = Number((defaultTotal / c.salaryEntry).toFixed(1));
    return {
      ...c,
      investment: defaultTotal,
      est5YrEarnings,
      roiMult,
      payback
    };
  });

  const [sortField, setSortField] = useState<string>("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleSort = (field: string) => {
    const order = sortField === field && sortOrder === "desc" ? "asc" : "desc";
    setSortField(field);
    setSortOrder(order);
  };

  const sortedTopRecs = [...topRecommendations].sort((a: any, b: any) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (typeof valA === "string") {
      return sortOrder === "desc" ? valB.localeCompare(valA) : valA.localeCompare(valB);
    }
    return sortOrder === "desc" ? valB - valA : valA - valB;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      {/* Print Local Styles Overlay */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-full {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: transparent !important;
          }
          aside, header, nav, footer, button {
            display: none !important;
          }
        }
      `}</style>

      {/* Hero Section */}
      <div className="flex flex-wrap items-center justify-between gap-6 pb-2 border-b border-border/80 no-print">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">Investment Security</span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">Parent Intelligence</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your child&apos;s future plan, explained in numbers. Compare costs, ROI growth, and AI risks.
          </p>
        </div>
        <div className="flex gap-3">
          <select 
            value={selectedCareerId}
            onChange={(e) => setSelectedCareerId(e.target.value)}
            className="h-10 rounded-xl border border-border bg-card px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
          >
            {careers.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          <Button 
            variant="gradient" 
            size="sm"
            leftIcon={<Printer className="h-4 w-4" />}
            onClick={() => window.print()}
          >
            Print Report
          </Button>
        </div>
      </div>

      {!isPremium && (
        <div className="no-print">
          <AnimatedContainer animation="fadeUp" delay={0.05}>
            <GlassCard variant="strong" className="p-8 border border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-transparent flex flex-col items-center text-center space-y-4 shadow-xl">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Lock className="h-6 w-6" />
              </div>
              <div className="space-y-2 max-w-lg">
                <h3 className="text-xl font-bold">Unlock Parent ROI & Intelligence Dashboard</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Make data-backed decisions about your child's education investment. Compare multi-year college costs, entry-to-senior salary trajectories, estimated payback period, automation risks, and hiring rates.
                </p>
              </div>
              <Link href="/pricing">
                <Button variant="gradient" size="lg" className="mt-2">
                  Upgrade to Premium
                </Button>
              </Link>
            </GlassCard>
          </AnimatedContainer>
        </div>
      )}

      <div className={cn("space-y-10", !isPremium && "relative pointer-events-none select-none opacity-15 filter blur-sm no-print")}>
        {!familyIncome ? (
          <div className="space-y-6">
          <AnimatedContainer animation="fadeUp" delay={0.05}>
            <ProgressiveProfilingUnlock
              unlockKey="familyIncome"
              title="Unlock Parent ROI & Scholarship Insights"
              description="We discovered potential scholarship options and ROI payback metrics for your selected career path. Enter your annual family income to unlock these details and see if they qualify."
              placeholder="Enter annual family income (INR, e.g. 600000)"
              inputType="number"
              onUnlock={handleUnlockIncome}
            />
          </AnimatedContainer>
          
          {/* Blurred preview background */}
          <div className="relative pointer-events-none select-none opacity-20 filter blur-xs space-y-6">
            {/* Blurred KPIs */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-2xl border border-border bg-card/40 p-4 h-24 flex flex-col justify-between">
                  <div className="h-3 w-1/2 bg-muted rounded" />
                  <div className="h-6 w-3/4 bg-muted rounded mt-2" />
                </div>
              ))}
            </div>
            {/* Blurred Simulator / growth */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 h-64 bg-card/40 border border-border rounded-2xl p-6" />
              <div className="h-64 bg-card/40 border border-border rounded-2xl p-6" />
            </div>
          </div>
        </div>
      ) : (
        <div className="print-full space-y-10">
          
          {/* Print-Only Header Banner */}
          <div className="hidden print:block border-b-2 border-primary pb-4 mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-primary">Career OS - Parent Intelligence Report</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Child Future Plan ROI Analysis for: <span className="font-bold text-black">{activeCareer?.title}</span>
            </p>
          </div>

          {/* Top KPIs Section */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Expected 5-Yr ROI", value: `${net5YearROI}%`, desc: "Total return on investment", color: "text-emerald-500" },
              { label: "Est. Total Cost", value: `₹${(totalInvestment / 100000).toFixed(1)}L`, desc: "Investment for tuition + living", color: "text-indigo-400" },
              { label: "Starting Salary", value: `₹${(salaryEntry / 100000).toFixed(1)}L`, desc: "Estimated year 1 net salary", color: "text-amber-500" },
              { label: "Payback Period", value: `${paybackPeriod} Yrs`, desc: "Time to break even", color: "text-rose-500" },
              { label: "Lifetime Growth", value: `₹${(lifetimeGrowth / 100000).toFixed(0)}L`, desc: "Career salary ceiling jump", color: "text-violet-400" },
              { label: "Future Demand", value: `${demandScore}/100`, desc: "Hiring growth scale", color: "text-teal-400" },
              { label: "AI Automation Risk", value: automationRiskText, desc: "AI replacement probability", color: "text-pink-500" },
              { label: "Data Confidence", value: "95%", desc: "Data collection precision", color: "text-cyan-500" }
            ].map((kpi, idx) => (
              <div key={idx} className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/40 p-4 shadow-sm backdrop-blur-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{kpi.label}</span>
                <div className="my-2">
                  <h3 className={`text-2xl font-extrabold tracking-tight ${kpi.color}`}>{kpi.value}</h3>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{kpi.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Simulator & Salary timelines */}
          <div className="grid gap-6 lg:grid-cols-3">
            
            {/* Scenario Simulator */}
            <GlassCard className="p-6 lg:col-span-2 space-y-6 border border-border/80 no-print">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-primary" /> Scenario Simulator
                </h3>
                <Button variant="ghost" size="sm" onClick={handleReset} leftIcon={<RefreshCw className="h-3 w-3" />}>
                  Reset
                </Button>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 text-xs">
                {/* Left Column inputs */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between font-medium">
                      <span className="text-muted-foreground">Tuition Fees (per year)</span>
                      <span className="font-bold">₹{tuition.toLocaleString("en-IN")}</span>
                    </div>
                    <input 
                      type="range" min="10000" max="600000" step="10000" 
                      value={tuition} onChange={(e) => setTuition(Number(e.target.value))}
                      className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between font-medium">
                      <span className="text-muted-foreground">Scholarship (per year)</span>
                      <span className="font-bold">₹{scholarship.toLocaleString("en-IN")}</span>
                    </div>
                    <input 
                      type="range" min="0" max="300000" step="5000" 
                      value={scholarship} onChange={(e) => setScholarship(Number(e.target.value))}
                      className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between font-medium">
                      <span className="text-muted-foreground">Living Cost (per year)</span>
                      <span className="font-bold">₹{living.toLocaleString("en-IN")}</span>
                    </div>
                    <input 
                      type="range" min="20000" max="300000" step="10000" 
                      value={living} onChange={(e) => setLiving(Number(e.target.value))}
                      className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>

                {/* Right Column inputs */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between font-medium">
                      <span className="text-muted-foreground">Salary Increment (annual %)</span>
                      <span className="font-bold">{increment}%</span>
                    </div>
                    <input 
                      type="range" min="1" max="25" step="1" 
                      value={increment} onChange={(e) => setIncrement(Number(e.target.value))}
                      className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between font-medium">
                      <span className="text-muted-foreground">Inflation Rate (annual %)</span>
                      <span className="font-bold">{inflation}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="15" step="1" 
                      value={inflation} onChange={(e) => setInflation(Number(e.target.value))}
                      className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <span className="text-muted-foreground block font-medium">College Location</span>
                    <div className="flex gap-2">
                      {[
                        { code: "METRO", label: "Metro City (1.2x living)", factor: 1.2 },
                        { code: "NON_METRO", label: "Non-Metro (0.9x living)", factor: 0.9 }
                      ].map((loc) => (
                        <button
                          key={loc.code}
                          onClick={() => setLocationType(loc.code)}
                          className={`flex-1 py-2 text-center rounded-xl font-semibold border transition-all ${
                            locationType === loc.code 
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border text-muted-foreground hover:bg-muted/10"
                          }`}
                        >
                          {loc.code === "METRO" ? "Metro" : "Non-Metro"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Salary growth timeline */}
            <GlassCard className="p-6 flex flex-col justify-between border border-border/80">
              <div className="border-b border-border/50 pb-3 mb-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Salary Growth Timeline
                </h3>
              </div>

              <div className="space-y-4 flex-1 flex flex-col justify-center">
                {[
                  { phase: "Entry Salary", salary: activeCareer?.salaryEntry || 800000, desc: "0-2 Years Experience", color: "bg-blue-500/10 text-blue-400" },
                  { phase: "Mid-Level Salary", salary: activeCareer?.salaryMid || 2500000, desc: "5-8 Years Experience", color: "bg-amber-500/10 text-amber-400" },
                  { phase: "Senior Salary", salary: activeCareer?.salarySenior || 5000000, desc: "12+ Years Experience", color: "bg-purple-500/10 text-purple-400" }
                ].map((sal, sIdx) => (
                  <div key={sIdx} className="flex items-center gap-4 relative">
                    {sIdx < 2 && (
                      <span className="absolute left-6 top-10 bottom-0 w-0.5 bg-border/60 h-10" />
                    )}
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg ${sal.color}`}>
                      ₹
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">{sal.phase}</span>
                      <span className="font-extrabold text-foreground text-base mt-0.5">₹{(sal.salary / 100000).toFixed(1)} Lakhs / year</span>
                      <span className="text-[9px] text-muted-foreground block">{sal.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Career ROI Comparison Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" /> Career ROI Comparison Table
              </h3>
              <span className="text-[10px] text-muted-foreground font-semibold">Comparing Top 3 recommendations</span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/40 uppercase font-semibold text-muted-foreground border-b border-border tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Career</th>
                      <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort("investment")}>Investment</th>
                      <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort("est5YrEarnings")}>5-Yr Earnings</th>
                      <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort("roiMult")}>ROI Multiple</th>
                      <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort("payback")}>Payback Period</th>
                      <th className="px-4 py-3">Future Demand</th>
                      <th className="px-4 py-3 text-right">AI Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sortedTopRecs.map((row) => (
                      <tr key={row.id} className="hover:bg-muted/15 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-foreground">{row.title}</td>
                        <td className="px-4 py-3.5 font-medium text-muted-foreground">₹{(row.investment / 100000).toFixed(1)}L</td>
                        <td className="px-4 py-3.5 font-bold text-foreground">₹{(row.est5YrEarnings / 100000).toFixed(1)}L</td>
                        <td className="px-4 py-3.5 text-emerald-400 font-bold">{row.roiMult}x return</td>
                        <td className="px-4 py-3.5 font-semibold text-foreground">{row.payback} Yrs</td>
                        <td className="px-4 py-3.5 font-semibold text-muted-foreground capitalize">{row.demandLevel.toLowerCase()}</td>
                        <td className="px-4 py-3.5 text-right font-medium text-pink-500 capitalize">{row.aiRiskLevel.toLowerCase()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Future Demand, Risk widgets & Breakdown */}
          <div className="grid gap-6 md:grid-cols-3">
            
            {/* Future Demand Widget */}
            <GlassCard className="p-5 space-y-4 border border-border/80">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Future Demand Market</h4>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-foreground">{demandScore}%</span>
                  <span className="text-[9px] font-semibold text-muted-foreground block mt-0.5">Global Growth Score</span>
                </div>
                <Badge variant="glass" className="text-[10px] text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
                  +{activeCareer?.futureGrowthRate || 18}% YoY
                </Badge>
              </div>
              <Progress value={demandScore} variant="gradient" className="h-1.5" />
              <p className="text-[10px] text-muted-foreground leading-normal">
                Based on corporate hiring metrics, skills gap analytics, and global investment flows for this profession over the next decade.
              </p>
            </GlassCard>

            {/* AI Automation Risk Widget */}
            <GlassCard className="p-5 space-y-4 border border-border/80">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">AI Disruption Risk</h4>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-xl font-extrabold text-xs border ${
                  automationRiskText === "LOW"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : automationRiskText === "MEDIUM"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-pink-500/10 text-pink-400 border-pink-500/20"
                }`}>
                  {automationRiskText} RISK
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold">
                  {automationRiskText === "LOW" ? "High resilience" : "Moderate vulnerability"}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-normal">
                This represents the probability that a large portion of tasks in this profession may be automated over the next decade.
              </p>
            </GlassCard>

            {/* Education cost breakdown visual */}
            <GlassCard className="p-5 space-y-4 border border-border/80">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Education Cost Breakdown</h4>
              <div className="space-y-2 text-xs">
                {[
                  { label: "Tuition Fees", val: tuition, pct: Math.round((tuition / (tuition + yearlyLivingCost + misc)) * 100) || 0, color: "bg-primary" },
                  { label: "Living expenses", val: yearlyLivingCost, pct: Math.round((yearlyLivingCost / (tuition + yearlyLivingCost + misc)) * 100) || 0, color: "bg-indigo-400" },
                  { label: "Books & other", val: misc, pct: Math.round((misc / (tuition + yearlyLivingCost + misc)) * 100) || 0, color: "bg-violet-400" }
                ].map((cost, cIdx) => (
                  <div key={cIdx} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">{cost.label} ({cost.pct}%)</span>
                      <span className="font-semibold text-foreground">₹{cost.val.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="w-full bg-secondary h-1 rounded-full overflow-hidden">
                      <div className={`h-full ${cost.color}`} style={{ width: `${cost.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Degree & College list */}
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Recommended Degree Card */}
            <GlassCard className="p-6 space-y-4 border border-border/80">
              <div className="border-b border-border/50 pb-3">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-primary" /> Academic Degree Comparison
                </h4>
              </div>

              {degrees.map((deg) => (
                <div key={deg.id} className="space-y-3">
                  <h5 className="font-bold text-foreground text-sm">{deg.name}</h5>
                  <p className="text-xs text-muted-foreground leading-normal">{deg.description}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs pt-2">
                    <div className="bg-muted/10 p-2 rounded-xl text-center border border-border/40">
                      <span className="text-muted-foreground text-[9px] uppercase font-bold tracking-wider block">Duration</span>
                      <span className="font-bold text-foreground block mt-0.5">{deg.duration}</span>
                    </div>
                    <div className="bg-muted/10 p-2 rounded-xl text-center border border-border/40">
                      <span className="text-muted-foreground text-[9px] uppercase font-bold tracking-wider block">Total Tuition</span>
                      <span className="font-bold text-foreground block mt-0.5">₹{(deg.costTuition / 100000).toFixed(1)}L</span>
                    </div>
                    <div className="bg-muted/10 p-2 rounded-xl text-center border border-border/40">
                      <span className="text-muted-foreground text-[9px] uppercase font-bold tracking-wider block">AI resilience</span>
                      <span className="font-bold text-foreground block mt-0.5">{(deg.aiResilience * 10).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </GlassCard>

            {/* Recommended Colleges cards list */}
            <GlassCard className="p-6 space-y-4 border border-border/80">
              <div className="border-b border-border/50 pb-3">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Building className="h-4 w-4 text-primary" /> Target Universities Matches
                </h4>
              </div>

              <div className="space-y-4 overflow-y-auto max-h-[300px] pr-1">
                {colleges.map((col) => (
                  <div key={col.id} className="border border-border/75 rounded-2xl p-3 bg-muted/5 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h5 className="font-bold text-foreground text-xs">{col.name}</h5>
                      <div className="flex gap-2 items-center text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {col.location.split(",")[0]}</span>
                        <span>NIRF #{col.ranking}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-primary text-xs block">₹{(col.avgPackage / 100000).toFixed(1)}L avg</span>
                      <span className="text-[9px] text-muted-foreground block mt-0.5">{col.placementPercent}% placement</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Hiring Companies Logotypes list */}
          <div className="space-y-4 no-print">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Top Hiring Companies</h3>
            </div>
            <div className="flex flex-wrap gap-4 items-center justify-around bg-card/25 border border-border/60 rounded-3xl p-5">
              {[
                { name: "Google", desc: "Top Technical recruiter" },
                { name: "Microsoft", desc: "Software engineering recruiter" },
                { name: "Deloitte", desc: "Consulting & analytics role" },
                { name: "McKinsey & Co", desc: "Strategy management recruiter" },
                { name: "Goldman Sachs", desc: "Financial engineering role" }
              ].map((comp, idx) => (
                <div key={idx} className="flex flex-col items-center text-center">
                  <span className="font-extrabold text-foreground text-sm tracking-tight">{comp.name}</span>
                  <span className="text-[8px] text-muted-foreground mt-0.5 uppercase tracking-wider">{comp.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Print-Only Report Suggested Next Steps */}
          <div className="hidden print:block border-t border-border pt-6 mt-8 space-y-2">
            <h4 className="text-sm font-bold text-black uppercase tracking-widest">Child Strengths & Suggested Next Steps</h4>
            <ol className="list-decimal pl-5 text-xs text-muted-foreground space-y-1">
              <li>Review the 4-Year GPS roadmap with your child to verify skills benchmarks.</li>
              <li>Take today&apos;s Smart Question to continuously align interests and update matching variables.</li>
              <li>Explore available scholarship criteria for BITS Pilani and IIT Delhi to minimize debt options.</li>
            </ol>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

// Utility class helper mapping cn
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
