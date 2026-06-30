"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { AnimatedContainer } from "@/components/ui/animated-container";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

const faqs = [
  {
    question: "How does Career OS work?",
    answer:
      "Career OS uses advanced AI to analyze your interests, personality, skills, and goals. Based on this analysis, we match you with careers, degrees, and colleges that align with your unique profile. Our platform then generates a personalized roadmap to guide you from where you are to your dream career.",
  },
  {
    question: "Is Career OS free?",
    answer:
      "Yes! We offer a generous free tier that includes interest assessments, basic career matches, and limited college comparisons. Our Premium plan unlocks the full suite of features including unlimited comparisons, Career GPS, future simulator, and premium PDF reports.",
  },
  {
    question: "How accurate are the career matches?",
    answer:
      "Our AI achieves 94% match accuracy by analyzing multiple dimensions of your profile including interests, personality traits, skills, learning style, and career goals. We continuously improve our models based on user feedback and outcome data.",
  },
  {
    question: "Can parents use Career OS?",
    answer:
      "Absolutely! We have a dedicated Parent Dashboard that provides ROI calculators, cost breakdowns, salary projections, and education investment analysis. Parents can track their child's progress and make informed decisions together.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Security is our priority. We encrypt all data in transit and at rest, implement strict access controls, and comply with data privacy regulations. You can delete your data at any time.",
  },
  {
    question: "Which languages are supported?",
    answer:
      "Career OS is available in English, Hindi, and Hinglish. All assessments, recommendations, and reports are available in your preferred language.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="relative border-t border-white/5 py-24 sm:py-32 bg-[#06060c]">
      
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 z-10">
        <AnimatedContainer animation="fadeUp">
          <div className="text-center">
            <Badge variant="glass" size="lg" className="mb-4 bg-emerald-500/10 border-emerald-500/25 text-emerald-400">
              Got Questions?
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Frequently Asked <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">Questions</span>
            </h2>
          </div>
        </AnimatedContainer>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, index) => (
            <AnimatedContainer key={index} animation="fadeUp" delay={index * 0.05}>
              <div className="rounded-2xl border border-white/5 bg-card/45 overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/5 text-white"
                  aria-expanded={openIndex === index}
                >
                  <span className="text-sm font-semibold">{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                      openIndex === index && "rotate-180",
                    )}
                  />
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-5 pb-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </AnimatedContainer>
          ))}
        </div>
      </div>
    </section>
  );
}
