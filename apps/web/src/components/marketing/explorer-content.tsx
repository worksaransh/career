"use client";

import React from "react";
import { Search } from "lucide-react";

import { AnimatedContainer } from "@/components/ui/animated-container";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";

interface ExplorerContentProps {
  title: string;
  description: string;
  type: string;
}

export function ExplorerContent({ title, description }: ExplorerContentProps) {
  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <AnimatedContainer animation="fadeUp">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="gradient-text">{title}</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{description}</p>
        </AnimatedContainer>

        <AnimatedContainer animation="fadeUp" delay={0.1}>
          <div className="mt-8">
            <Input
              placeholder="Search..."
              leftIcon={<Search className="h-4 w-4" />}
              size="lg"
            />
          </div>
        </AnimatedContainer>

        <AnimatedContainer animation="fadeUp" delay={0.2}>
          <GlassCard className="mt-8 flex flex-col items-center justify-center py-16 text-center">
            <Search className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Start Exploring</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              Sign in to get personalized recommendations or browse our directory.
            </p>
          </GlassCard>
        </AnimatedContainer>
      </div>
    </div>
  );
}
