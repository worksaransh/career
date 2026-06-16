import React from "react";
import { cn } from "@/lib/utils/cn";
import { Card } from "./card";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

function DefaultEmptyIllustration() {
  return (
    <svg width="120" height="90" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto opacity-80 mb-2">
      <defs>
        <linearGradient id="empty-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="45" r="35" fill="url(#empty-grad)" />
      <rect x="40" y="25" width="40" height="30" rx="8" fill="#1f2937" stroke="#374151" strokeWidth="1.5" />
      <line x1="50" y1="35" x2="70" y2="35" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="50" y1="42" x2="65" y2="42" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="78" cy="58" r="10" fill="#111827" stroke="#6366f1" strokeWidth="1.5" />
      <line x1="85" y1="65" x2="92" y2="72" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <Card
      variant="glass"
      padding="lg"
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 border border-border/80 rounded-3xl",
        className,
      )}
    >
      <div className="mb-4 text-muted-foreground">
        {icon ?? <DefaultEmptyIllustration />}
      </div>
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <Button variant="outline" size="sm" className="mt-5 rounded-xl border-primary/20 hover:border-primary/50 text-xs font-semibold px-5" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </Card>
  );
};
