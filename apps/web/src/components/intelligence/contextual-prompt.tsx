"use client";

import React, { useState, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Brain } from "lucide-react";
import { usePathname } from "next/navigation";
import { QuestionCard } from "./question-card";
import { getContextualQuestion, submitQuestionAnswer } from "@/lib/actions/adaptive-question-actions";
import { cn } from "@/lib/utils/cn";

interface ContextualQuestion {
  id: string;
  text: string;
  textHi: string | null;
  textHinglish: string | null;
  type: string;
  options: unknown;
  category: string;
}

export function ContextualPrompt() {
  const pathname = usePathname();
  const [question, setQuestion] = useState<ContextualQuestion | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Determine context from current page
  const getPageContext = (path: string): string | null => {
    if (path.includes("/skills")) return "skills";
    if (path.includes("/careers")) return "careers";
    if (path.includes("/colleges")) return "colleges";
    if (path.includes("/roadmap")) return "roadmap";
    if (path.includes("/parents")) return "parents";
    if (path.includes("/simulator")) return "simulator";
    if (path.includes("/dashboard")) return "dashboard";
    return null;
  };

  useEffect(() => {
    const context = getPageContext(pathname);
    if (!context || dismissed) return;

    // Show prompt after 3 seconds on page
    const timer = setTimeout(() => {
      startTransition(async () => {
        try {
          const q = await getContextualQuestion(context);
          if (q) {
            setQuestion(q as ContextualQuestion);
            setVisible(true);
          }
        } catch {
          // Silently fail — don't disrupt UX
        }
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [pathname, dismissed]);

  const handleAnswer = (answer: string, answerData?: Record<string, unknown>) => {
    if (!question) return;

    startTransition(async () => {
      try {
        await submitQuestionAnswer(
          question.id,
          answer,
          answerData,
          `contextual:${getPageContext(pathname)}`
        );
      } catch {
        // Silently fail
      }
    });

    // Auto-dismiss after 2.5 seconds
    setTimeout(() => {
      setVisible(false);
      setDismissed(true);
    }, 2500);
  };

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {visible && question && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 80, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={cn(
            "fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto",
            "lg:bottom-6 lg:right-6 lg:left-auto lg:mx-0"
          )}
        >
          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute -top-2 -right-2 z-10 h-7 w-7 rounded-full bg-muted border border-border flex items-center justify-center shadow-lg hover:bg-destructive/10 hover:border-destructive/30 transition-all"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {/* Glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/10 via-purple-500/5 to-emerald-500/10 blur-xl -z-10" />

          <QuestionCard
            question={question}
            onAnswer={handleAnswer}
            isLoading={isPending}
            compact
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
