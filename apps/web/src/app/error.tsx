"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="mesh-gradient pointer-events-none fixed inset-0" aria-hidden="true" />
      <GlassCard variant="strong" className="max-w-md w-full text-center p-8 border border-border/60 rounded-3xl relative overflow-hidden">
        
        {/* Animated Server Error SVG */}
        <div className="w-full flex justify-center mb-4">
          <svg width="120" height="90" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-float">
            <defs>
              <linearGradient id="server-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <circle cx="60" cy="45" r="35" fill="url(#server-grad)" />
            {/* Server racks */}
            <rect x="35" y="20" width="50" height="15" rx="4" fill="#1f2937" stroke="#374151" />
            <rect x="35" y="40" width="50" height="15" rx="4" fill="#1f2937" stroke="#374151" />
            
            {/* Server blinkers */}
            <circle cx="45" cy="27" r="2.5" fill="#ef4444" className="animate-pulse" />
            <circle cx="55" cy="27" r="2" fill="#10b981" />
            
            <circle cx="45" cy="47" r="2.5" fill="#ef4444" className="animate-pulse" style={{ animationDelay: "0.5s" }} />
            <circle cx="55" cy="47" r="2" fill="#374151" />
            
            {/* Disconnected line */}
            <path d="M 68 27 L 78 27 L 78 47 L 82 47" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="82" cy="47" r="2" fill="#ef4444" />
          </svg>
        </div>

        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Something went wrong</h1>
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed px-4">
          {error.message ?? "We encountered a server error while calculating career outcomes. Please try refreshing."}
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <Button variant="gradient" className="rounded-xl px-5" onClick={reset}>
            Try again
          </Button>
          <Button variant="outline" className="rounded-xl px-5 border-border/80" onClick={() => (window.location.href = "/")}>
            Go Home
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
