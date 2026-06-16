"use client";

import React from "react";
import {
  LineChart,
  Building2,
  GraduationCap,
  Brain,
  Route,
  Rocket,
  Award,
  BookOpen,
  FileText,
  Users,
  BarChart3,
} from "lucide-react";

import { AnimatedContainer } from "@/components/ui/animated-container";
import { Card } from "@/components/ui/card";

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  LineChart,
  Building2,
  GraduationCap,
  Brain,
  Route,
  Rocket,
  Award,
  BookOpen,
  FileText,
  Users,
  BarChart3,
};

interface AppPlaceholderProps {
  title: string;
  description: string;
  icon: string;
}

export function AppPlaceholder({ title, description, icon }: AppPlaceholderProps) {
  const Icon = iconMap[icon] ?? LineChart;

  return (
    <AnimatedContainer animation="fadeUp">
      <Card variant="glass" className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <Icon className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-2 max-w-md text-muted-foreground">{description}</p>
      </Card>
    </AnimatedContainer>
  );
}
