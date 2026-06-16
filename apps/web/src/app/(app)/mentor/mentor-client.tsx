"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Send, Bot, User, Lock, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

interface Message {
  sender: "ai" | "user";
  text: string;
  time: string;
}

interface MentorClientProps {
  userId: string;
  userName: string;
  isPremium: boolean;
  recommendedCareers: string[];
}

const SUGGESTED_PROMPTS = [
  "What skills should I learn first?",
  "How resilient are my matching careers to AI?",
  "What is the average ROI of an engineering degree?",
  "Help me prepare for an entry-level interview.",
];

export function MentorClient({ userName, isPremium, recommendedCareers }: MentorClientProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: `Hello ${userName}! I am your AI Career Mentor. I've analyzed your profile and matches${
        recommendedCareers.length > 0
          ? ` (like ${recommendedCareers.slice(0, 2).join(" and ")})`
          : ""
      }. Ask me anything about skills training, university cost comparisons, interview prep, or career progression!`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [queriesLeft, setQueriesLeft] = useState(3);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load trial queries count from localStorage on mount
  useEffect(() => {
    if (!isPremium) {
      const saved = localStorage.getItem("career_os_mentor_queries");
      if (saved !== null) {
        setQueriesLeft(Math.max(0, parseInt(saved)));
      }
    }
  }, [isPremium]);

  // Scroll to bottom when messages list changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const queryText = textToSend || input;
    if (!queryText.trim()) return;

    if (!isPremium && queriesLeft <= 0) {
      return;
    }

    // Append user message
    const userMsg: Message = {
      sender: "user",
      text: queryText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (textToSend) {
      // Clear suggestion clicking
    } else {
      setInput("");
    }

    setLoading(true);

    // Decrement free queries
    if (!isPremium) {
      const nextCount = Math.max(0, queriesLeft - 1);
      setQueriesLeft(nextCount);
      localStorage.setItem("career_os_mentor_queries", String(nextCount));
    }

    // Simulate AI response stream
    setTimeout(() => {
      let aiText = "";
      const textClean = queryText.toLowerCase();

      if (textClean.includes("skill") || textClean.includes("learn")) {
        aiText = `Based on your profile, I recommend focusing on foundation blocks:
1. Core analytical concepts (logical scripting, structuring system elements)
2. Practical sandbox tools related to target roles
3. Agile coordination & team communication skills.

Would you like me to map out a targeted 30-day skill syllabus?`;
      } else if (textClean.includes("ai risk") || textClean.includes("resilient") || textClean.includes("automation")) {
        aiText = `Most of your matching career routes show Medium-to-High AI resilience. While repetitive scripting and standard tasks are becoming automated, careers requiring strategic reasoning, specialized architecture design, and stakeholder communication have over 85% safety scores.
To boost safety:
- Focus on full-lifecycle project execution
- Adopt AI copilots as efficiency multipliers.`;
      } else if (textClean.includes("roi") || textClean.includes("cost") || textClean.includes("degree")) {
        aiText = `Education ROI depends heavily on the college cost-to-placement ratio.
For example:
- Tier 1 public universities (low fees, high placements) reach break-even in 1.5 - 2.5 years.
- Private colleges with high fees may require 4.5+ years of salary repayments.
I highly recommend checking our Parent Intelligence dashboard to simulate this cost payback curve!`;
      } else if (textClean.includes("interview") || textClean.includes("prep")) {
        aiText = `I can help you prepare! Here are the 3 pillars of landing entry-level positions:
1. Building a clean portfolio repository showing end-to-end sandbox designs.
2. Practicing standard behavioural stories (e.g. overcoming project challenges).
3. Mastering fundamentals like time complexity and relational schemas.

Would you like to start a mock interview practice session right here?`;
      } else {
        aiText = `That is a great question. Aligned with your profile, I recommend looking at these steps:
- Research current entry-level compensation trends in our matches folder.
- Benchmark your current skills gap.
- Focus on practical, hands-on portfolio milestones rather than just certifications.

Let me know if you want me to expand on any specific part!`;
      }

      const aiMsg: Message = {
        sender: "ai",
        text: aiText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 flex flex-col h-[calc(100vh-8rem)]">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/80">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold">AI Career Mentor</h1>
            <p className="text-xs text-muted-foreground">Get instant guidance on skills, colleges, and roadmap steps</p>
          </div>
        </div>
        <div>
          {isPremium ? (
            <Badge variant="premium" className="font-bold">UNLIMITED ACCESS</Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px] font-bold">
              {queriesLeft} Free Messages Left
            </Badge>
          )}
        </div>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-2 scrollbar-thin scrollbar-thumb-muted">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-3 max-w-[80%]",
                msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border",
                msg.sender === "user"
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "bg-muted border-border text-muted-foreground"
              )}>
                {msg.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={cn(
                "rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm",
                msg.sender === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-none font-medium"
                  : "bg-card border border-border/80 text-foreground rounded-tl-none"
              )}>
                <p className="whitespace-pre-line">{msg.text}</p>
                <span className="text-[9px] opacity-60 block mt-1.5 text-right">{msg.time}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex gap-3 max-w-[80%] mr-auto">
            <div className="h-8 w-8 rounded-full bg-muted border border-border text-muted-foreground flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-tl-none bg-card border border-border/80 px-4 py-3 text-xs flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              <span>Analyzing recommendations query...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Block */}
      {messages.length === 1 && !loading && (
        <div className="py-3">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">Suggested topics</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => handleSend(p)}
                className="text-left text-xs bg-muted/30 border border-border hover:border-primary/40 p-2.5 rounded-xl transition-all font-medium text-muted-foreground hover:text-foreground hover:bg-muted/65"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form with Gate */}
      <div className="pt-4 border-t border-border/80 bg-background/95">
        {!isPremium && queriesLeft <= 0 ? (
          <GlassCard variant="strong" className="p-4 border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Free AI Mentor trial complete</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Upgrade to Premium for unlimited chat messages and mock technical interview sessions.</p>
              </div>
            </div>
            <Link href="/pricing">
              <Button variant="gradient" size="sm">
                Unlock Premium
              </Button>
            </Link>
          </GlassCard>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Ask your career mentor a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 h-11 rounded-xl border border-border bg-background px-4 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
            />
            <Button
              type="submit"
              variant="gradient"
              className="h-11 px-5"
              disabled={!input.trim() || loading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
