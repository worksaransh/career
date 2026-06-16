"use client";

import React from "react";
import { Sparkles, Target, Eye, Heart } from "lucide-react";

import { AnimatedContainer } from "@/components/ui/animated-container";
import { GlassCard } from "@/components/ui/glass-card";

export function AboutContent() {
  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <AnimatedContainer animation="fadeUp">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            About <span className="gradient-text">Career OS</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            We&apos;re on a mission to democratize career guidance using AI.
            Every student deserves to know their best path forward.
          </p>
        </AnimatedContainer>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {[
            { icon: Eye, title: "Our Vision", text: "A world where every student makes career decisions with clarity, confidence, and complete information." },
            { icon: Target, title: "Our Mission", text: "To build the most intelligent career guidance platform that combines AI, data, and human insight." },
            { icon: Heart, title: "Our Values", text: "Transparency, accuracy, accessibility, and putting students' futures first in everything we build." },
            { icon: Sparkles, title: "Our Impact", text: "100K+ students guided, 94% match accuracy, and partnerships with schools across India." },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <GlassCard key={item.title}>
                <Icon className="mb-3 h-8 w-8 text-primary" />
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
