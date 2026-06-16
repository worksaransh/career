"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Sparkles, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface QuestionOption {
  id: string;
  text: string;
  value?: number;
}

interface SliderOption {
  min: number;
  max: number;
  step: number;
  label: string;
}

interface QuestionCardProps {
  question: {
    id: string;
    text: string;
    textHi?: string | null;
    textHinglish?: string | null;
    type: string;
    options: unknown;
    category: string;
  };
  language?: string;
  onAnswer: (answer: string, answerData?: Record<string, unknown>) => void;
  isLoading?: boolean;
  compact?: boolean;
}

export function QuestionCard({ question, language = "en", onAnswer, isLoading, compact }: QuestionCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const [sliderValue, setSliderValue] = useState(50);
  const [freeText, setFreeText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Get question text in current language
  const questionText =
    language === "hi" && question.textHi
      ? question.textHi
      : language === "hinglish" && question.textHinglish
        ? question.textHinglish
        : question.text;

  const options = question.options as QuestionOption[] | SliderOption[];

  const handleSubmit = () => {
    if (submitted || isLoading) return;

    let answer = "";
    let answerData: Record<string, unknown> = {};

    switch (question.type) {
      case "MCQ":
      case "AGREE_DISAGREE":
      case "YES_NO":
        if (!selected) return;
        const opt = (options as QuestionOption[]).find((o) => o.id === selected);
        answer = opt?.text || selected;
        answerData = { optionId: selected, value: opt?.value };
        break;

      case "MULTI_SELECT":
        if (multiSelected.length === 0) return;
        const selectedTexts = (options as QuestionOption[])
          .filter((o) => multiSelected.includes(o.id))
          .map((o) => o.text);
        answer = selectedTexts.join(", ");
        answerData = { selectedIds: multiSelected, selectedTexts };
        break;

      case "SLIDER":
      case "RATING":
        answer = String(sliderValue);
        answerData = { value: sliderValue };
        break;

      case "FREE_TEXT":
        if (!freeText.trim()) return;
        answer = freeText.trim();
        answerData = { text: freeText.trim() };
        break;

      case "RANKING":
        // For ranking, use multi-select order
        if (multiSelected.length === 0) return;
        answer = multiSelected.join(", ");
        answerData = { ranking: multiSelected };
        break;

      case "EMOJI":
        if (!selected) return;
        answer = selected;
        answerData = { emoji: selected };
        break;

      default:
        if (!selected) return;
        answer = selected;
    }

    setSubmitted(true);
    onAnswer(answer, answerData);
  };

  const toggleMultiSelect = (id: string) => {
    setMultiSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4",
          compact && "p-3"
        )}
      >
        <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <Check className="h-4 w-4 text-emerald-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-500">+25 XP Earned!</p>
          <p className="text-xs text-muted-foreground">Your profile just got smarter</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm shadow-lg overflow-hidden",
        compact && "rounded-xl shadow-md"
      )}
    >
      {/* Header */}
      <div className={cn("px-5 pt-5 pb-3", compact && "px-4 pt-4 pb-2")}>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
            {question.category}
          </span>
          <span className="ml-auto text-[10px] font-medium text-emerald-500">+25 XP</span>
        </div>
        <p className={cn("text-sm font-semibold text-foreground leading-snug", compact && "text-xs")}>
          {questionText}
        </p>
      </div>

      {/* Options */}
      <div className={cn("px-5 pb-4 space-y-2", compact && "px-4 pb-3 space-y-1.5")}>
        {(question.type === "MCQ" || question.type === "AGREE_DISAGREE" || question.type === "YES_NO") && (
          <div className="space-y-1.5">
            {(options as QuestionOption[]).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                className={cn(
                  "w-full text-left rounded-xl border px-3.5 py-2.5 text-xs font-medium transition-all duration-200",
                  selected === opt.id
                    ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/20"
                    : "border-border/60 bg-background/50 text-muted-foreground hover:border-primary/30 hover:bg-primary/5"
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                      selected === opt.id
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30"
                    )}
                  >
                    {selected === opt.id && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                  </div>
                  {opt.text}
                </div>
              </button>
            ))}
          </div>
        )}

        {question.type === "MULTI_SELECT" && (
          <div className="space-y-1.5">
            {(options as QuestionOption[]).map((opt) => (
              <button
                key={opt.id}
                onClick={() => toggleMultiSelect(opt.id)}
                className={cn(
                  "w-full text-left rounded-xl border px-3.5 py-2.5 text-xs font-medium transition-all duration-200",
                  multiSelected.includes(opt.id)
                    ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/20"
                    : "border-border/60 bg-background/50 text-muted-foreground hover:border-primary/30 hover:bg-primary/5"
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-4 w-4 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
                      multiSelected.includes(opt.id)
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30"
                    )}
                  >
                    {multiSelected.includes(opt.id) && (
                      <Check className="h-2.5 w-2.5 text-primary-foreground" />
                    )}
                  </div>
                  {opt.text}
                </div>
              </button>
            ))}
            <p className="text-[10px] text-muted-foreground mt-1">Select all that apply</p>
          </div>
        )}

        {question.type === "RANKING" && (
          <div className="space-y-1.5">
            {(options as QuestionOption[]).map((opt, idx) => (
              <button
                key={opt.id}
                onClick={() => toggleMultiSelect(opt.id)}
                className={cn(
                  "w-full text-left rounded-xl border px-3.5 py-2.5 text-xs font-medium transition-all duration-200",
                  multiSelected.includes(opt.id)
                    ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/20"
                    : "border-border/60 bg-background/50 text-muted-foreground hover:border-primary/30"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground w-4">
                    {multiSelected.includes(opt.id) ? multiSelected.indexOf(opt.id) + 1 : ""}
                  </span>
                  {opt.text}
                </div>
              </button>
            ))}
            <p className="text-[10px] text-muted-foreground mt-1">Tap in order of preference</p>
          </div>
        )}

        {(question.type === "SLIDER" || question.type === "RATING") && (
          <div className="space-y-3 pt-2">
            <input
              type="range"
              min={(options as SliderOption[])[0]?.min ?? 0}
              max={(options as SliderOption[])[0]?.max ?? 100}
              step={(options as SliderOption[])[0]?.step ?? 10}
              value={sliderValue}
              onChange={(e) => setSliderValue(Number(e.target.value))}
              className="w-full accent-primary h-2 rounded-full appearance-none bg-muted cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Low</span>
              <span className="text-sm font-bold text-primary">{sliderValue}%</span>
              <span>High</span>
            </div>
          </div>
        )}

        {question.type === "FREE_TEXT" && (
          <div className="pt-1">
            <textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder="Type your answer..."
              rows={2}
              className="w-full rounded-xl border border-border/60 bg-background/50 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>
        )}

        {question.type === "EMOJI" && (
          <div className="flex gap-3 justify-center pt-2">
            {["😍", "😊", "😐", "😕", "😞"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => setSelected(emoji)}
                className={cn(
                  "text-2xl p-2 rounded-xl border transition-all",
                  selected === emoji
                    ? "border-primary bg-primary/10 scale-110"
                    : "border-transparent hover:border-border"
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Submit button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={isLoading}
          className={cn(
            "w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-md transition-all hover:shadow-lg disabled:opacity-50",
            compact && "py-2"
          )}
        >
          {isLoading ? (
            <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <>
              Submit <ChevronRight className="h-3.5 w-3.5" />
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
