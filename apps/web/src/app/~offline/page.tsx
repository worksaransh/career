import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "You're Offline",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="mesh-gradient pointer-events-none fixed inset-0" aria-hidden="true" />
      <div className="relative max-w-sm w-full space-y-6">
        
        {/* Animated Offline Radar SVG */}
        <div className="w-full flex justify-center">
          <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-float">
            <defs>
              <linearGradient id="offline-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#9ca3af" />
                <stop offset="100%" stopColor="#4b5563" />
              </linearGradient>
            </defs>
            {/* Wave circles */}
            <circle cx="75" cy="110" r="10" fill="url(#offline-grad)" />
            <path d="M 60 95 A 20 20 0 0 1 90 95" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
            <path d="M 45 80 A 40 40 0 0 1 105 80" fill="none" stroke="#4b5563" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" className="animate-pulse" />
            <path d="M 30 65 A 60 60 0 0 1 120 65" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" className="animate-pulse" style={{ animationDelay: "0.5s" }} />
            
            {/* Base Stand */}
            <line x1="75" y1="110" x2="75" y2="135" stroke="#374151" strokeWidth="4" strokeLinecap="round" />
            <line x1="55" y1="135" x2="95" y2="135" stroke="#374151" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">You&apos;re offline</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Please check your local connection parameters. We couldn&apos;t reach the Career GPS analytics servers.
          </p>
        </div>

        <div className="mt-8">
          <Link href="/">
            <Button variant="gradient" size="lg" className="rounded-xl px-6">
              Try Again
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
