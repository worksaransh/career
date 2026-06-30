"use client";

import React from "react";
import { Quote, Sparkles } from "lucide-react";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";

const testimonials = [
  {
    name: "Priya Sharma",
    handle: "@priya_sharma",
    role: "High School Student",
    content:
      "Career OS helped me discover that my interest in biology and technology could become a career in bioinformatics. I would never have found this path on my own.",
    initials: "PS",
    grad: "from-emerald-600 to-cyan-500"
  },
  {
    name: "Rohan Mehta",
    handle: "@rohan_m",
    role: "IIT Bombay Student",
    content:
      "Career GPS helped me switch from CS to Product Design, mapping the exact courses and salary projections. It literally saved me years of trial and error.",
    initials: "RM",
    grad: "from-blue-600 to-indigo-500"
  },
  {
    name: "Rahul Verma",
    handle: "@rahul_verma",
    role: "College Applicant",
    content:
      "The college comparison feature saved me from making a costly mistake. I chose a college with better ROI and now I'm on track to save ₹12 lakhs over my degree.",
    initials: "RV",
    grad: "from-purple-600 to-pink-500"
  },
  {
    name: "Ananya Patel",
    handle: "@ananya_parent",
    role: "Parent",
    content:
      "As a parent, the ROI dashboard gave me confidence in our education investment. Seeing salary projections and placement stats made the decision clear.",
    initials: "AP",
    grad: "from-amber-600 to-orange-500"
  },
  {
    name: "Vikram Singh",
    handle: "@vikram_s",
    role: "Career Switcher",
    content:
      "At 28, I thought it was too late to switch careers. Career GPS showed me a 3-year roadmap with certifications that led to a 40% salary increase.",
    initials: "VS",
    grad: "from-red-600 to-rose-500"
  },
  {
    name: "Sneha Reddy",
    handle: "@sneha_reddy",
    role: "UX Researcher",
    content:
      "The AI risk analysis and industry salary forecasting features are incredibly accurate. Helped me optimize my skills stack for 2026/2027 market trends.",
    initials: "SR",
    grad: "from-teal-600 to-emerald-500"
  }
];

export function TestimonialsSection() {
  return (
    <section className="relative border-t border-white/5 py-24 sm:py-32 bg-[#06060c]">
      
      {/* Background gradients */}
      <div className="absolute top-[20%] left-[-5%] w-[45%] h-[40%] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <AnimatedContainer animation="fadeUp">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge variant="glass" size="lg" className="mb-4 bg-indigo-500/10 border-indigo-500/25 text-indigo-400">
              Success Stories
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Trusted by <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">Thousands</span> of Students
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              See how students, parents, and career switchers use our AI ecosystem to build their future.
            </p>
          </div>
        </AnimatedContainer>

        {/* Masonry / Grid Layout (3 Columns on desktop) */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <AnimatedContainer
              key={testimonial.name}
              animation="fadeUp"
              delay={index * 0.05}
              className="h-full"
            >
              <GlassCard className="h-full border-white/5 bg-card/45 flex flex-col justify-between p-5 hover:border-indigo-500/15 transition-all duration-300">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${testimonial.grad} flex items-center justify-center text-white text-xs font-bold`}>
                        {testimonial.initials}
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-white leading-none">{testimonial.name}</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">{testimonial.handle}</p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-white/5 border border-white/5 px-2 py-0.5 rounded-full text-muted-foreground font-semibold">
                      {testimonial.role}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground text-left italic">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1 text-[9px] text-emerald-400 font-bold justify-end">
                  <Sparkles className="h-3 w-3 text-emerald-400" />
                  <span>Verified Outcome</span>
                </div>
              </GlassCard>
            </AnimatedContainer>
          ))}
        </div>
      </div>
    </section>
  );
}
