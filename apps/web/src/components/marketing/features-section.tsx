"use client";

import React from "react";
import {
  Brain,
  Route,
  GraduationCap,
  Building2,
  LineChart,
  Users,
  Rocket,
  ShieldCheck,
  BarChart3,
  FileText,
  Bell,
  Globe,
} from "lucide-react";

import { AnimatedContainer } from "@/components/ui/animated-container";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Brain,
    title: "AI Career Matching",
    description: "Advanced AI analyzes your interests, personality, skills, and goals to find your ideal career path with match scores and reasoning.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Route,
    title: "Career GPS",
    description: "Year-by-year roadmap from where you are to your dream career, with projects, certifications, internships, and job milestones.",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    icon: GraduationCap,
    title: "Degree Intelligence",
    description: "Compare degrees by ROI, salary outcomes, AI resilience, and career opportunities. Know which degree gives you the best future.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: Building2,
    title: "College Explorer",
    description: "Dedicated pages for every college with AI summaries, fee analysis, placement stats, ROI, scholarships, and student fit scores.",
    gradient: "from-orange-500 to-red-600",
  },
  {
    icon: LineChart,
    title: "Salary Forecaster",
    description: "AI-powered salary projections across your career lifespan. See entry-level, mid-career, and senior-level earning potential.",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    icon: Rocket,
    title: "Future Simulator",
    description: "Compare two career paths side by side. See salary, AI risk, ROI, demand, and work-life balance before making a decision.",
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    icon: Users,
    title: "Parent Dashboard",
    description: "Dedicated interface for parents with ROI calculators, cost breakdowns, salary projections, and education investment analysis.",
    gradient: "from-amber-500 to-yellow-600",
  },
  {
    icon: ShieldCheck,
    title: "AI Risk Analysis",
    description: "Know which careers are future-proof. Our AI predicts automation risk and recommends alternative paths with strong demand.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: BarChart3,
    title: "Skills Intelligence",
    description: "Personalized skill recommendations with learning sequences, certifications, and projects to build your ideal career profile.",
    gradient: "from-purple-500 to-pink-600",
  },
  {
    icon: FileText,
    title: "Premium Reports",
    description: "Beautiful PDF reports with career analysis, degree ROI, college suggestions, salary forecasts, and personalized roadmaps.",
    gradient: "from-red-500 to-orange-600",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Weekly updates on new scholarships, college matches, skill reminders, and roadmap milestones delivered to your inbox.",
    gradient: "from-teal-500 to-emerald-600",
  },
  {
    icon: Globe,
    title: "Multilingual Support",
    description: "Available in English, Hindi, and Hinglish. Assessments and recommendations in your preferred language.",
    gradient: "from-sky-500 to-indigo-600",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative border-t border-border py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedContainer animation="fadeUp">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="glass" size="lg" className="mb-4">
              Everything You Need
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Your Complete Career{" "}
              <span className="gradient-text">Operating System</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              From career matching to college selection, salary forecasting to
              roadmap planning — all powered by AI.
            </p>
          </div>
        </AnimatedContainer>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <AnimatedContainer
                key={feature.title}
                animation="fadeUp"
                delay={index * 0.05}
              >
                <GlassCard className="h-full group">
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg`}
                  >
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </GlassCard>
              </AnimatedContainer>
            );
          })}
        </div>
      </div>
    </section>
  );
}
