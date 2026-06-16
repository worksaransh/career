"use client";

import React, { useState } from "react";
import { Lock, Sparkles, AlertCircle, TrendingUp, HelpCircle } from "lucide-react";
import toast from "react-hot-toast";
import { updateProfilePreference } from "@/lib/actions/profile-actions";
import { Button } from "@/components/ui/button";

interface ProgressiveProfilingUnlockProps {
  unlockKey: "marks" | "budget" | "familyIncome" | "preferredCity";
  title: string;
  description: string;
  placeholder?: string;
  inputType?: "number" | "text" | "select";
  selectOptions?: { value: string; label: string }[];
  onUnlock: (newValue: any) => void;
}

export function ProgressiveProfilingUnlock({
  unlockKey,
  title,
  description,
  placeholder = "",
  inputType = "text",
  selectOptions = [],
  onUnlock
}: ProgressiveProfilingUnlockProps) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;

    setSubmitting(true);
    const toastId = toast.loading("Recalculating matched intelligence...");
    try {
      const parsedValue = inputType === "number" ? Number(value) : value;
      await updateProfilePreference(unlockKey, parsedValue);
      
      toast.success("Profile updated! Match confidence increased.", { id: toastId });
      onUnlock(parsedValue);
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-card/60 p-8 text-center relative overflow-hidden backdrop-blur-md shadow-2xl">
      {/* Dynamic Grid Grid Glows */}
      <div className="absolute top-[-30%] left-[-10%] w-[50%] h-[60%] rounded-full bg-primary/10 blur-[80px]" />
      <div className="absolute bottom-[-30%] right-[-10%] w-[50%] h-[60%] rounded-full bg-purple-500/10 blur-[80px]" />

      <div className="relative max-w-md mx-auto space-y-6">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 animate-pulse">
          <Lock className="h-6 w-6 text-primary" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-extrabold tracking-tight text-foreground flex items-center justify-center gap-1.5">
            {title} <Sparkles className="h-4.5 w-4.5 text-primary" />
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-center">
          {inputType === "select" ? (
            <select
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
              className="h-10 w-full sm:flex-1 rounded-xl border border-border bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
            >
              <option value="">Select option</option>
              {selectOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={inputType}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              required
              className="h-10 w-full sm:flex-1 rounded-xl border border-border bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
            />
          )}

          <Button
            type="submit"
            disabled={submitting}
            loading={submitting}
            variant="gradient"
            className="w-full sm:w-auto h-10 px-6"
          >
            Unlock Now
          </Button>
        </form>

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
          <AlertCircle className="h-3.5 w-3.5 text-primary" /> Privacy Protected • Instant Recalculation
        </div>
      </div>
    </div>
  );
}
