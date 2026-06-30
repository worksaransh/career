"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Plus, X, Briefcase, TrendingUp, CheckCircle2, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedContainer } from "@/components/ui/animated-container";

const availableSkills = [
  "React",
  "Figma",
  "Python",
  "SQL",
  "Writing",
  "Speaking",
  "Financial Models",
  "Machine Learning",
  "Product Strategy",
  "Stochastic Calculus"
];

const matchesDatabase = [
  {
    skills: ["React", "Figma"],
    career: "UX Engineer / Creative Technologist",
    fit: 95,
    package: "₹14L - ₹22L",
    nextStep: "Build a design-system portfolio with coded components."
  },
  {
    skills: ["Python", "SQL", "Machine Learning"],
    career: "ML Engineer / Data Scientist",
    fit: 96,
    package: "₹18L - ₹32L",
    nextStep: "Complete a fine-tuning project using HuggingFace models."
  },
  {
    skills: ["Writing", "Speaking", "Product Strategy"],
    career: "Product Marketing Manager (PMM)",
    fit: 91,
    package: "₹12L - ₹18L",
    nextStep: "Write a teardown analysis of a successful product launch."
  },
  {
    skills: ["Financial Models", "SQL", "Stochastic Calculus"],
    career: "Quantitative Financial Analyst",
    fit: 94,
    package: "₹25L - ₹45L",
    nextStep: "Build a time-series algorithm simulating portfolio risk."
  },
  {
    skills: ["Python", "SQL"],
    career: "Data Analyst",
    fit: 88,
    package: "₹8L - ₹14L",
    nextStep: "Build an interactive Tableau/Looker dashboard using public datasets."
  },
  {
    skills: ["React"],
    career: "Frontend Developer",
    fit: 85,
    package: "₹7L - ₹12L",
    nextStep: "Learn Next.js App Router and server actions."
  },
  {
    skills: ["Figma"],
    career: "UI Designer",
    fit: 84,
    package: "₹6L - ₹10L",
    nextStep: "Redesign an outdated mobile screen and post it on Dribbble."
  }
];

export function PlaygroundSection() {
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["React", "Figma"]);
  const [customSkill, setCustomSkill] = useState("");

  const handleToggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSkill.trim()) return;
    const cleanSkill = customSkill.trim();
    if (!selectedSkills.includes(cleanSkill)) {
      setSelectedSkills([...selectedSkills, cleanSkill]);
    }
    setCustomSkill("");
  };

  // Logic to find the best career match based on selected skills
  const getBestMatch = () => {
    if (selectedSkills.length === 0) {
      return {
        career: "Select your skills above",
        fit: 0,
        package: "₹0L",
        nextStep: "Add one or more skills to calculate your personalized career fit."
      };
    }

    let bestMatch = matchesDatabase[matchesDatabase.length - 1]!; // Default fallback
    let maxIntersection = 0;

    // Check intersection count with database definitions
    for (const match of matchesDatabase) {
      const intersection = match.skills.filter((s) => selectedSkills.includes(s)).length;
      if (intersection > maxIntersection) {
        maxIntersection = intersection;
        bestMatch = match;
      }
    }

    // Dynamic adjustment of fit score based on total matching skills
    const baseFit = bestMatch.fit;
    const adjustedFit = Math.min(99, Math.max(70, baseFit + (maxIntersection - bestMatch.skills.length) * 2));

    return {
      ...bestMatch,
      fit: adjustedFit
    };
  };

  const bestMatchResult = getBestMatch();

  return (
    <section id="playground" className="relative border-t border-white/5 py-24 sm:py-32 bg-[#06060c]">
      
      {/* Glow backdrop */}
      <div className="absolute top-[30%] right-[-10%] w-[50%] h-[40%] rounded-full bg-cyan-500/5 blur-[130px] pointer-events-none" />
      
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title */}
        <AnimatedContainer animation="fadeUp">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <Badge variant="glass" size="lg" className="mb-4 bg-emerald-500/10 border-emerald-500/25 text-emerald-400">
              Interactive Playground
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Test the AI <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">Career Engine</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
              Select or type some skills you have (or want to learn) below, and watch the Career OS algorithm predict your matches and packages in real-time.
            </p>
          </div>
        </AnimatedContainer>

        {/* Interactive Widget Box */}
        <AnimatedContainer animation="slideUp" delay={0.1}>
          <GlassCard className="border border-white/5 shadow-2xl p-6 bg-card/50 backdrop-blur-xl rounded-3xl space-y-6">
            
            {/* Skill Selector Section */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">Select Skills</label>
              <div className="flex flex-wrap gap-2">
                {availableSkills.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleToggleSkill(skill)}
                      className={`text-xs px-3.5 py-2 rounded-2xl border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/10 font-semibold"
                          : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {isSelected ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Skill Input Form */}
              <form onSubmit={handleAddCustomSkill} className="flex gap-2 max-w-sm pt-1">
                <input
                  type="text"
                  placeholder="Type a custom skill (e.g. Docker, Python)..."
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  className="flex-1 h-9 rounded-2xl border border-white/5 bg-white/[0.02] px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                />
                <Button type="submit" variant="glass" size="sm" className="h-9 px-4 rounded-2xl flex items-center gap-1 text-xs">
                  <Plus className="h-3.5 w-3.5" /> Add
                </Button>
              </form>
            </div>

            {/* Results Grid Box */}
            <div className="border-t border-white/5 pt-6 grid gap-6 md:grid-cols-12 md:items-stretch">
              
              {/* Left Column: Skill Summary list */}
              <div className="md:col-span-4 bg-white/[0.01] border border-white/5 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Selected Skills Profile</span>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {selectedSkills.length === 0 ? (
                      <span className="text-xs text-muted-foreground italic">No skills selected</span>
                    ) : (
                      selectedSkills.map((skill) => (
                        <span key={skill} className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                          {skill}
                        </span>
                      ))
                    )}
                  </div>
                </div>
                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Skills Count</span>
                  <span className="font-extrabold text-white">{selectedSkills.length}</span>
                </div>
              </div>

              {/* Right Column: AI Match Output */}
              <div className="md:col-span-8 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-2xl p-5 flex flex-col justify-between space-y-5">
                
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                      Calculated Top Career Match
                    </span>
                    <h3 className="text-lg font-black text-white">{bestMatchResult.career}</h3>
                  </div>
                  {selectedSkills.length > 0 && (
                    <div className="text-right shrink-0">
                      <span className="text-2xl font-black text-white">{bestMatchResult.fit}%</span>
                      <span className="text-[9px] text-muted-foreground uppercase tracking-wider block font-bold">Match Fit</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/5 bg-white/[0.01] p-3 space-y-1">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
                      Projected Entry Package
                    </span>
                    <p className="text-sm font-extrabold text-white">{bestMatchResult.package}</p>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-white/[0.01] p-3 space-y-1">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      Recommended Next Step
                    </span>
                    <p className="text-[10.5px] leading-relaxed text-muted-foreground">{bestMatchResult.nextStep}</p>
                  </div>
                </div>

                {/* Call-to-action */}
                <div className="pt-2 flex items-center justify-between border-t border-white/5">
                  <span className="text-[10px] text-muted-foreground">Unlock 100+ careers & custom detailed pathing reports</span>
                  <Link href="/register">
                    <Button variant="gradient" size="sm" className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-8 rounded-xl text-xs font-bold tracking-wide flex items-center gap-1">
                      Explore Full Roadmap <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>

              </div>

            </div>

          </GlassCard>
        </AnimatedContainer>

      </div>
    </section>
  );
}
