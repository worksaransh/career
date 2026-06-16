"use client";

import React, { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { submitFeedback } from "@/lib/feedback";
import { useSession } from "next-auth/react";
import type { FeedbackReason } from "@/lib/feedback";
import toast from "react-hot-toast";

interface ThumbsFeedbackProps {
  itemId: string;
  itemType: "CAREER" | "DEGREE" | "COLLEGE" | "SKILL" | "CERTIFICATION";
  variant?: "inline" | "card";
}

export function ThumbsFeedback({ itemId, itemType, variant = "inline" }: ThumbsFeedbackProps) {
  const { data: session } = useSession();
  const [rating, setRating] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showReason, setShowReason] = useState(false);

  const handleRate = async (value: number) => {
    if (!session?.user?.id) return;
    setRating(value);
    setShowReason(value <= 2);
    await submitFeedback({ userId: session.user.id, itemId, itemType, rating: value as 1 | 2 | 3 | 4 | 5 });
    setSubmitted(true);
  };

  const submitWithReason = async (reason: FeedbackReason) => {
    if (!session?.user?.id || !rating) return;
    await submitFeedback({ userId: session.user.id, itemId, itemType, rating: rating as 1 | 2 | 3 | 4 | 5, reason });
    toast.success("Thanks for your feedback!");
    setSubmitted(true);
    setShowReason(false);
  };

  if (submitted) {
    return <span className="text-xs text-muted-foreground">Feedback recorded</span>;
  }

  return (
    <div className={cn("flex items-center gap-2", variant === "card" && "p-3 glass rounded-xl")}>
      <span className="text-xs text-muted-foreground">Was this helpful?</span>
      <button onClick={() => handleRate(5)} className="p-1 rounded hover:bg-primary/10 transition-colors" aria-label="Helpful">
        <ThumbsUp className={cn("h-4 w-4", rating === 5 ? "text-primary" : "text-muted-foreground")} />
      </button>
      <button onClick={() => handleRate(2)} className="p-1 rounded hover:bg-destructive/10 transition-colors" aria-label="Not helpful">
        <ThumbsDown className={cn("h-4 w-4", rating !== null && rating <= 2 ? "text-destructive" : "text-muted-foreground")} />
      </button>

      <AnimatePresence>
        {showReason && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex gap-1 ml-2">
            {(["NOT_INTERESTED", "SALARY", "AI_RISK", "LOCATION"] as FeedbackReason[]).map((reason) => (
              <Button key={reason} variant="ghost" size="xs" onClick={() => submitWithReason(reason)}>
                {reason.replace("_", " ")}
              </Button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
