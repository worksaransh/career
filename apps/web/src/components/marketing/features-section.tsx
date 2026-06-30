"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Route,
  GraduationCap,
  TrendingUp,
  Users,
  CheckCircle2,
  ChevronRight,
  TrendingDown,
  UserCheck
} from "lucide-react";

import { AnimatedContainer } from "@/components/ui/animated-container";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const mentorsData = [
  {
    name: "Siddharth Goel",
    role: "Staff Engineer",
    company: "Google",
    grad: "from-blue-600 to-cyan-500",
    initials: "SG"
  },
  {
    name: "Meera Nair",
    role: "Product Designer",
    company: "Meta",
    grad: "from-indigo-600 to-purple-500",
    initials: "MN"
  },
  {
    name: "Arjun Sen",
    role: "Senior PM",
    company: "Netflix",
    grad: "from-red-600 to-rose-500",
    initials: "AS"
  }
];

export function FeaturesSection() {
  const [connectedMentors, setConnectedMentors] = useState<string[]>([]);
  const [selectedTimelineStep, setSelectedTimelineStep] = useState(2); // Default to Internship (Year 3)

  const toggleConnect = (name: string) => {
    setConnectedMentors((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]
    );
  };

  const timelineSteps = [
    { year: "Year 1", title: "College Core", desc: "Master DSA, UI Fundamentals, & Web Tech", status: "completed" },
    { year: "Year 2", title: "Deep Specialization", desc: "Build fullstack projects & AI APIs", status: "completed" },
    { year: "Year 3", title: "Industry Internship", desc: "Land junior Dev/Design role at startup", status: "active" },
    { year: "Year 4", title: "FAANG / Unicorn Hire", desc: "Secure fulltime CTC of ₹18L - ₹25L", status: "target" }
  ];

  return (
    <section id="features" className="relative border-t border-white/5 py-24 sm:py-32 bg-[#06060c]">
      
      {/* Background patterns */}
      <div className="absolute inset-0 bg-mesh-pattern opacity-[0.02] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-5%] w-[45%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <AnimatedContainer animation="fadeUp">
          <div className="mx-auto max-w-2xl text-center mb-20">
            <Badge variant="glass" size="lg" className="mb-4 bg-emerald-500/10 border-emerald-500/25 text-emerald-400">
              Everything You Need
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Your Complete Career <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">Operating System</span>
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Ditch the generic advice. Our AI analyzes your potential to design personalized pathways, ROI evaluations, and direct industry connections.
            </p>
          </div>
        </AnimatedContainer>

        {/* Bento Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          
          {/* Card 1: AI Career GPS Roadmaps (Double Width) */}
          <div className="md:col-span-2">
            <AnimatedContainer animation="fadeUp" delay={0.05} className="h-full">
              <GlassCard className="h-full border-white/5 bg-card/45 flex flex-col justify-between p-6 hover:border-emerald-500/10 transition-all duration-300">
                <div className="space-y-2 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Route className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">AI Career GPS Roadmaps</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-lg">
                    Follow an interactive, automated roadmap showing milestone progression from college to high-paying job. Click on steps below to inspect milestones.
                  </p>
                </div>

                {/* Interactive Timeline Visual */}
                <div className="grid gap-4 sm:grid-cols-4 pt-2 relative">
                  {timelineSteps.map((step, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedTimelineStep(idx)}
                      className={`relative text-left p-3.5 rounded-2xl border transition-all ${
                        selectedTimelineStep === idx
                          ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                          : "bg-white/[0.01] border-white/5 text-muted-foreground hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">{step.year}</span>
                        {step.status === "completed" && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        )}
                        {step.status === "active" && (
                          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                        )}
                      </div>
                      <h4 className="text-xs font-bold mb-1 text-white truncate">{step.title}</h4>
                      <p className="text-[9px] leading-normal text-muted-foreground line-clamp-2">
                        {step.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </GlassCard>
            </AnimatedContainer>
          </div>

          {/* Card 2: College & Degree ROI (Single Width) */}
          <div>
            <AnimatedContainer animation="fadeUp" delay={0.1} className="h-full">
              <GlassCard className="h-full border-white/5 bg-card/45 flex flex-col justify-between p-6 hover:border-cyan-500/10 transition-all duration-300">
                <div className="space-y-2 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">College & Degree ROI</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Compare college costs against placement statistics side-by-side to find the highest return on investment.
                  </p>
                </div>

                {/* Cost vs Salary Placement bars */}
                <div className="space-y-3 rounded-2xl border border-white/5 bg-white/[0.01] p-3">
                  {/* College A */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-semibold text-white">
                      <span>Top Tier Tech Univ</span>
                      <span className="text-emerald-400">ROI: 2.4x</span>
                    </div>
                    <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                      <div className="bg-red-400 h-full w-[45%]" title="Cost: ₹12L" />
                      <div className="bg-emerald-400 h-full w-[55%]" title="Avg Placement: ₹24L" />
                    </div>
                    <div className="flex justify-between text-[8px] text-muted-foreground">
                      <span>Fees: ₹12L</span>
                      <span>CTC: ₹24L</span>
                    </div>
                  </div>

                  {/* College B */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-semibold text-white">
                      <span>Mid Tier Private</span>
                      <span className="text-red-400">ROI: 0.5x</span>
                    </div>
                    <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                      <div className="bg-red-400 h-full w-[70%]" title="Cost: ₹18L" />
                      <div className="bg-emerald-400 h-full w-[30%]" title="Avg Placement: ₹8L" />
                    </div>
                    <div className="flex justify-between text-[8px] text-muted-foreground">
                      <span>Fees: ₹18L</span>
                      <span>CTC: ₹8L</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </AnimatedContainer>
          </div>

          {/* Card 3: Salary Forecasting (Single Width) */}
          <div>
            <AnimatedContainer animation="fadeUp" delay={0.15} className="h-full">
              <GlassCard className="h-full border-white/5 bg-card/45 flex flex-col justify-between p-6 hover:border-indigo-500/10 transition-all duration-300">
                <div className="space-y-2 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Salary Forecasting</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    AI-powered predictions of lifetime income trajectories based on career choices and automated trends.
                  </p>
                </div>

                {/* Salary trajectories info */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-3 space-y-2">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-[10px] font-bold text-white">GenAI Engineering</span>
                    <span className="text-[10px] font-extrabold text-emerald-400 flex items-center gap-0.5">
                      +18.5% YoY <TrendingUp className="h-3 w-3" />
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white">Manual QA Testing</span>
                    <span className="text-[10px] font-extrabold text-red-400 flex items-center gap-0.5">
                      -8.2% YoY <TrendingDown className="h-3 w-3" />
                    </span>
                  </div>
                  <div className="text-[9px] text-muted-foreground pt-1 leading-normal">
                    * AI tracks automation risks & projections dynamically every 30 days.
                  </div>
                </div>
              </GlassCard>
            </AnimatedContainer>
          </div>

          {/* Card 4: Direct Industry Mentorship (Double Width) */}
          <div className="md:col-span-2">
            <AnimatedContainer animation="fadeUp" delay={0.2} className="h-full">
              <GlassCard className="h-full border-white/5 bg-card/45 flex flex-col justify-between p-6 hover:border-emerald-500/10 transition-all duration-300">
                <div className="space-y-2 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Users className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Direct Industry Mentorship</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-lg">
                    Connect directly with working professionals at top companies. Get roadmap validation, portfolio reviews, and internship referrals.
                  </p>
                </div>

                {/* Interactive Mentors list */}
                <div className="grid gap-3 sm:grid-cols-3">
                  {mentorsData.map((mentor) => {
                    const isConnected = connectedMentors.includes(mentor.name);
                    return (
                      <div
                        key={mentor.name}
                        className="rounded-2xl border border-white/5 bg-white/[0.01] p-3 text-center flex flex-col items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                      >
                        <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${mentor.grad} flex items-center justify-center text-white text-xs font-bold shadow-md shadow-black/45`}>
                          {mentor.initials}
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-white">{mentor.name}</h4>
                          <p className="text-[10px] text-muted-foreground">{mentor.role}</p>
                          <span className="text-[9px] bg-white/5 border border-white/5 px-2 py-0.5 rounded-full text-foreground inline-block font-semibold">
                            {mentor.company}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant={isConnected ? "outline" : "glass"}
                          onClick={() => toggleConnect(mentor.name)}
                          className={`w-full text-[10px] h-7 rounded-xl flex items-center justify-center gap-1 ${
                            isConnected
                              ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10"
                              : ""
                          }`}
                        >
                          {isConnected ? (
                            <>
                              <UserCheck className="h-3.5 w-3.5" />
                              <span>Connected</span>
                            </>
                          ) : (
                            <span>Connect</span>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </AnimatedContainer>
          </div>

        </div>
      </div>
    </section>
  );
}
