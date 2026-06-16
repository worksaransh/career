"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AnimatedContainer } from "@/components/ui/animated-container";

export function CtaSection() {
  return (
    <section className="relative border-t border-border py-20 sm:py-28">
      <div className="mesh-gradient pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <AnimatedContainer animation="fadeUp">
          <div className="glass-strong rounded-3xl p-8 sm:p-16">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" aria-hidden="true" />
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to See Your{" "}
              <span className="gradient-text">Future Career</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Join 100,000+ students who&apos;ve discovered their ideal career
              path. Start your journey in under 30 seconds.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button
                  variant="gradient"
                  size="xl"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  Discover Your Future
                </Button>
              </Link>
              <Link href="/features">
                <Button variant="glass" size="xl">
                  Explore Features
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Free forever. No credit card required. Start in 30 seconds.
            </p>
          </div>
        </AnimatedContainer>
      </div>
    </section>
  );
}
