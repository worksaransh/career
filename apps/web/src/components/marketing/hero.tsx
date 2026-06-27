"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp, Shield, Brain } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { AnimatedContainer } from "@/components/ui/animated-container";

const stats = [
  { label: "Careers Analyzed", value: "2,500+" },
  { label: "Students Guided", value: "100K+" },
  { label: "Match Accuracy", value: "94%" },
  { label: "Colleges Mapped", value: "48,000+" },
];

const features = [
  {
    icon: Brain,
    title: "AI Career Matching",
    description: "Get matched to careers based on your unique profile, interests, and strengths.",
  },
  {
    icon: TrendingUp,
    title: "Salary Forecasting",
    description: "See your earning potential with AI-powered salary projections across career paths.",
  },
  {
    icon: Shield,
    title: "College & Degree ROI",
    description: "Know the return on investment before choosing a college or degree program.",
  },
  {
    icon: Sparkles,
    title: "Career GPS",
    description: "Follow a year-by-year roadmap with projects, certifications, and milestones.",
  },
];

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
}

export function HeroSection({ title, subtitle, ctaText }: HeroSectionProps) {
  const [previewQuestion, setPreviewQuestion] = React.useState("");
  const [previewReply, setPreviewReply] = React.useState("");
  const titleParts = (title || "See Your Future|Before You Decide").split("|");

  return (
    <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24">
      <div className="mesh-gradient pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <AnimatedContainer animation="fadeUp" delay={0.1}>
            <Badge variant="glass" size="lg" className="mb-6">
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" aria-hidden="true" />
              AI-Powered Career Guidance
            </Badge>
          </AnimatedContainer>

          <AnimatedContainer animation="fadeUp" delay={0.2}>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="gradient-text">{titleParts[0]}</span>
              {titleParts[1] && (
                <>
                  <br />
                  {titleParts[1]}
                </>
              )}
            </h1>
          </AnimatedContainer>

          <AnimatedContainer animation="fadeUp" delay={0.3}>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto">
              {subtitle || "Stop guessing. Our AI analyzes your interests, skills, and goals to create a personalized career roadmap — from college to your dream job."}
            </p>
          </AnimatedContainer>

          <AnimatedContainer animation="fadeUp" delay={0.4}>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/register">
                <Button
                  variant="gradient"
                  size="xl"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  {ctaText || "Discover Your Future"}
                </Button>
              </Link>
              <Link href="/features">
                <Button variant="glass" size="xl">
                  See How It Works
                </Button>
              </Link>
            </div>
          </AnimatedContainer>

          <AnimatedContainer animation="fadeUp" delay={0.5}>
            <p className="mt-4 text-xs text-muted-foreground">
              30-second onboarding. No credit card. Free forever.
            </p>
          </AnimatedContainer>

          <AnimatedContainer animation="fadeUp" delay={0.55} className="mt-10">
            <GlassCard variant="strong" className="max-w-xl mx-auto p-5 text-left border-primary/20 hover:border-primary/40 transition-all duration-300">
              <div className="flex items-center gap-2 border-b border-border pb-3 mb-3">
                <Brain className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold">Try Live AI Career Matcher</span>
                <span className="ml-auto text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">DEMO</span>
              </div>
              
              <div className="space-y-3 max-h-48 overflow-y-auto mb-4 text-sm">
                <div className="bg-muted p-2.5 rounded-lg max-w-[85%] text-muted-foreground">
                  Hello! Select a question below to see how Career GPS AI maps out career options for you.
                </div>
                {previewQuestion && (
                  <div className="bg-primary/10 text-foreground p-2.5 rounded-lg max-w-[85%] ml-auto text-right font-medium">
                    {previewQuestion}
                  </div>
                )}
                {previewReply && (
                  <div className="bg-muted text-foreground p-2.5 rounded-lg max-w-[85%] border border-primary/10">
                    <Sparkles className="h-3.5 w-3.5 text-primary inline mr-1.5 mb-0.5" />
                    {previewReply}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { q: "Is AI going to replace developers?", a: "AI will automate coding, but increase demand for AI architects, security engineers, and domain-experts by 34% by 2030." },
                  { q: "Match High Design + Tech skills", a: "Top matches: Product Designer (UX/UI), Creative Technologist, and AR/VR Interaction Developer. Average entry package: ₹12L - ₹18L." },
                  { q: "Roadmap to become a Product Manager", a: "Year 1: Learn UX & Agile. Year 2: Build a side project. Year 3: Tech Internship. Year 4: Junior PM role." }
                ].map((opt) => (
                  <button
                    key={opt.q}
                    onClick={() => {
                      setPreviewQuestion(opt.q);
                      setPreviewReply(opt.a);
                    }}
                    className="text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border px-3 py-2 rounded-full transition-all"
                  >
                    {opt.q}
                  </button>
                ))}
              </div>
            </GlassCard>
          </AnimatedContainer>
        </div>

        <AnimatedContainer animation="slideUp" delay={0.6}>
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
              <GlassCard key={stat.label} variant="light" hover={false} className="text-center py-6">
                <p className="text-2xl font-bold gradient-text-subtle count-up" aria-live="polite">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
              </GlassCard>
            ))}
          </div>
        </AnimatedContainer>

        <AnimatedContainer animation="slideUp" delay={0.7}>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="group rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="text-base font-semibold">{feature.title}</div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </AnimatedContainer>
      </div>
    </section>
  );
}
