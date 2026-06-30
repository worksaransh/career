"use client";

import React from "react";
import { motion } from "framer-motion";

const stats = [
  { value: "2,500+", label: "Careers Analyzed" },
  { value: "100K+", label: "Students Guided" },
  { value: "94%", label: "Match Accuracy" },
  { value: "48,000+", label: "Colleges Mapped" },
  { value: "15,000+", label: "Scholarships" }
];

export function StatsSection() {
  return (
    <section className="relative overflow-hidden border-t border-b border-white/5 py-12 bg-[#06060c]">
      
      {/* Background with slow moving grid and light streaks */}
      <div className="absolute inset-0 bg-mesh-pattern opacity-[0.03] pointer-events-none" />
      
      {/* Light streaks */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-emerald-500/20 via-cyan-500/20 to-transparent pointer-events-none z-0" />
      <div className="absolute left-[20%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none z-0" />
      <div className="absolute right-[30%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent pointer-events-none z-0" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              className="w-full text-center md:px-6 py-4 md:py-0 space-y-1"
            >
              <h3 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 tracking-tight">
                {stat.value}
              </h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
