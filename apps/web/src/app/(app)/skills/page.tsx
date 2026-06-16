import React from "react";
import Link from "next/link";
import { Brain, ArrowRight, Award, Zap, ShieldAlert } from "lucide-react";

import { requireAuth } from "@/lib/session/session";
import { prisma } from "@/lib/db/prisma/prisma";
import { getRecommendations } from "@/lib/graph/recommendations";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedContainer } from "@/components/ui/animated-container";

export const metadata = { title: "Skills" };

const DEFAULT_SKILLS = [
  { name: "Python", category: "Technology", difficulty: "MEDIUM", demand: "HIGH", description: "General-purpose programming language widely used in AI, data science, and scripting." },
  { name: "JavaScript", category: "Technology", difficulty: "MEDIUM", demand: "HIGH", description: "Core programming language enabling interactive client-side and server-side web apps." },
  { name: "Data Structures", category: "Computer Science", difficulty: "HARD", demand: "HIGH", description: "Theoretical formats for organizing and storing data efficiently in memory." },
  { name: "Machine Learning", category: "Data Science", difficulty: "HARD", demand: "HIGH", description: "Developing algorithms that enable computer models to learn and predict from data." },
  { name: "UI/UX Design", category: "Design", difficulty: "MEDIUM", demand: "HIGH", description: "Crafting beautiful, intuitive interfaces to enhance customer workflows." },
  { name: "Product Strategy", category: "Business", difficulty: "HARD", demand: "MEDIUM", description: "Formulating product visions and execution roadmaps based on market analytics." },
  { name: "Public Speaking", category: "Communication", difficulty: "EASY", demand: "HIGH", description: "Presenting concepts clearly and confidently to live stakeholder groups." },
  { name: "Financial Modeling", category: "Finance", difficulty: "HARD", demand: "MEDIUM", description: "Creating numerical representations of financial outcomes to drive decisions." },
];

export default async function SkillsPage() {
  const user = await requireAuth();

  // Check if they completed their assessment
  const latestResult = await prisma.assessmentResult.findFirst({
    where: { userId: user.id },
  });

  if (!latestResult) {
    return (
      <div className="max-w-xl mx-auto py-16 animate-in fade-in duration-300">
        <GlassCard variant="strong" className="p-8 text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <Brain className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Unlock Skill Recommendations</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Complete your Interest Assessment first so we can analyze your profile and identify high-demand skills you should build to achieve your career objectives.
            </p>
          </div>
          <Link href="/assessments" className="block">
            <Button variant="gradient" fullWidth size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Start Interest Assessment
            </Button>
          </Link>
        </GlassCard>
      </div>
    );
  }

  // Defensive check: If the skill catalog is empty in the database, seed them!
  const skillsCount = await prisma.skill.count();
  if (skillsCount === 0) {
    await prisma.$transaction(
      DEFAULT_SKILLS.map((sk) =>
        prisma.skill.create({
          data: sk,
        })
      )
    );
  }

  // Load skill recommendations
  const recommendations = await getRecommendations(user.id, "SKILL");

  const skillIds = recommendations.map(r => r.itemId);
  const skills = await prisma.skill.findMany({
    where: { id: { in: skillIds } },
  });

  const sortedSkills = recommendations
    .map(rec => {
      const skill = skills.find(s => s.id === rec.itemId);
      if (!skill) return null;
      return {
        ...skill,
        score: Math.round(rec.score * 100),
        reasons: rec.reasons,
        explanation: rec.explanation,
      };
    })
    .filter(Boolean) as any[];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">Skill Acquisition</span>
        <h1 className="text-3xl font-extrabold tracking-tight mt-1">Recommended Skills</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Acquire critical capabilities that fill gaps in your profile to prepare you for highly competitive career transitions.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sortedSkills.map((skill, idx) => {
          const isHighScore = skill.score >= 80;
          return (
            <AnimatedContainer key={skill.id} animation="fadeUp" delay={idx * 0.05}>
              <GlassCard className="p-5 flex flex-col justify-between h-full hover:shadow-lg transition-all border border-border/80 hover:border-primary/40 relative group">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                        {skill.category}
                      </span>
                      <h3 className="text-base font-bold group-hover:text-primary transition-colors mt-0.5">
                        {skill.name}
                      </h3>
                    </div>
                    {isHighScore && (
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                        Top Gap
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {skill.description}
                  </p>

                  {/* Attributes chips */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                    <Badge variant={skill.demand === "HIGH" ? "glass" : "outline"} className="text-[9px]">
                      <Zap className="h-2.5 w-2.5 mr-1" />
                      {skill.demand} Demand
                    </Badge>
                    <Badge variant="outline" className="text-[9px] capitalize">
                      Difficulty: {skill.difficulty.toLowerCase()}
                    </Badge>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-border/50 space-y-3">
                  <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                    <Award className="h-3 w-3 text-primary shrink-0" />
                    <span>{skill.explanation}</span>
                  </div>
                  <Link href={`/certifications?skill=${encodeURIComponent(skill.name)}`} className="block">
                    <Button variant="outline" size="sm" fullWidth>
                      Find Certifications
                    </Button>
                  </Link>
                </div>
              </GlassCard>
            </AnimatedContainer>
          );
        })}
      </div>
    </div>
  );
}

// Utility class helper mapping cn
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
