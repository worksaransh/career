"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

export default function MarketingError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-xl mx-auto py-16 animate-in fade-in duration-300">
      <GlassCard variant="strong" className="p-8 text-center space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Page Error</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {error.message || "Something went wrong on this page."}
          </p>
        </div>
        <Button variant="gradient" onClick={reset} rightIcon={<RefreshCw className="h-4 w-4" />}>
          Try Again
        </Button>
      </GlassCard>
    </div>
  );
}
