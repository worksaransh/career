"use client";

import React from "react";
import { motion } from "framer-motion";

import { AnimatedContainer } from "@/components/ui/animated-container";

const stats = [
  { value: "2,500+", label: "Careers Analyzed" },
  { value: "48,000+", label: "Colleges Mapped" },
  { value: "100K+", label: "Students Guided" },
  { value: "94%", label: "Match Accuracy" },
  { value: "500+", label: "Degree Programs" },
  { value: "15,000+", label: "Scholarships" },
];

export function StatsSection() {
  return (
    <section className="relative border-t border-border py-20">
      <div className="mesh-gradient pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedContainer animation="fadeUp">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built on <span className="gradient-text">Data</span>, Powered by{" "}
              <span className="gradient-text">AI</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Our platform analyzes millions of data points to deliver accurate,
              personalized career guidance.
            </p>
          </div>
        </AnimatedContainer>

        <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="text-center"
            >
              <p className="text-3xl font-bold gradient-text-subtle count-up">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
