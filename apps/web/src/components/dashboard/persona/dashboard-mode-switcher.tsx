"use client";

import { GraduationCap, Briefcase, Users, ArrowRightLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type PersonaType = "STUDENT" | "PARENT" | "COLLEGE_STUDENT" | "GRADUATE" | "PROFESSIONAL" | "CAREER_SWITCHER";

interface DashboardModeSwitcherProps {
  currentPersona: PersonaType;
  onSwitch: (persona: PersonaType) => void;
  compact?: boolean;
}

const modes: { persona: PersonaType; label: string; icon: React.ElementType; description: string }[] = [
  { persona: "STUDENT", label: "Student", icon: GraduationCap, description: "Explore careers & colleges" },
  { persona: "PARENT", label: "Parent", icon: Users, description: "Plan your child's future" },
  { persona: "COLLEGE_STUDENT", label: "College", icon: GraduationCap, description: "Build skills & find jobs" },
  { persona: "GRADUATE", label: "Graduate", icon: ArrowRightLeft, description: "Start your career" },
  { persona: "PROFESSIONAL", label: "Professional", icon: Briefcase, description: "Grow your career" },
  { persona: "CAREER_SWITCHER", label: "Switcher", icon: ArrowRightLeft, description: "Change careers" },
];

export function DashboardModeSwitcher({ currentPersona, onSwitch, compact }: DashboardModeSwitcherProps) {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = mode.persona === currentPersona;
          return (
            <button
              key={mode.persona}
              onClick={() => onSwitch(mode.persona)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-accent text-muted-foreground hover:text-foreground hover:bg-accent/80",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {mode.label}
              {isActive && <Check className="h-3 w-3" />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = mode.persona === currentPersona;
        return (
          <button
            key={mode.persona}
            onClick={() => onSwitch(mode.persona)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all text-center",
              isActive
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border hover:border-primary/30 hover:bg-accent/50",
            )}
          >
            <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
            <span className={cn("text-xs font-semibold", isActive ? "text-primary" : "text-foreground")}>{mode.label}</span>
            <span className="text-[10px] text-muted-foreground leading-tight">{mode.description}</span>
          </button>
        );
      })}
    </div>
  );
}
