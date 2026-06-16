"use client";

import React from "react";
import { Quote } from "lucide-react";

import { AnimatedContainer } from "@/components/ui/animated-container";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "High School Student",
    content:
      "Career OS helped me discover that my interest in biology and technology could become a career in bioinformatics. I would never have found this path on my own.",
    initials: "PS",
  },
  {
    name: "Rahul Verma",
    role: "College Applicant",
    content:
      "The college comparison feature saved me from making a costly mistake. I chose a college with better ROI and now I'm on track to save ₹12 lakhs over my degree.",
    initials: "RV",
  },
  {
    name: "Ananya Patel",
    role: "Parent",
    content:
      "As a parent, the ROI dashboard gave me confidence in our education investment. Seeing salary projections and placement stats made the decision clear.",
    initials: "AP",
  },
  {
    name: "Vikram Singh",
    role: "Career Switcher",
    content:
      "At 28, I thought it was too late to switch careers. Career GPS showed me a 3-year roadmap with certifications that led to a 40% salary increase.",
    initials: "VS",
  },
];

export function TestimonialsSection() {
  return (
    <section className="relative border-t border-border py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedContainer animation="fadeUp">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="glass" size="lg" className="mb-4">
              Real Stories
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Trusted by{" "}
              <span className="gradient-text">Thousands</span> of Students
            </h2>
          </div>
        </AnimatedContainer>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <AnimatedContainer
              key={testimonial.name}
              animation="fadeUp"
              delay={index * 0.1}
            >
              <GlassCard>
                <Quote className="mb-4 h-8 w-8 text-primary/30" aria-hidden="true" />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </AnimatedContainer>
          ))}
        </div>
      </div>
    </section>
  );
}
