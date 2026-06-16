import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="mesh-gradient pointer-events-none fixed inset-0" aria-hidden="true" />
      <div className="relative max-w-md w-full space-y-6">
        
        {/* Lost Route Custom Illustration */}
        <div className="w-full flex justify-center">
          <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-float">
            <defs>
              <linearGradient id="notfound-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            {/* Radar concentric circles */}
            <circle cx="90" cy="90" r="75" fill="none" stroke="url(#notfound-grad)" strokeWidth="1.5" opacity="0.1" />
            <circle cx="90" cy="90" r="55" fill="none" stroke="url(#notfound-grad)" strokeWidth="1.5" opacity="0.2" />
            <circle cx="90" cy="90" r="35" fill="none" stroke="url(#notfound-grad)" strokeWidth="1.5" opacity="0.3" />
            
            {/* Center lost node */}
            <circle cx="90" cy="90" r="8" fill="#ec4899" />
            
            {/* Sweeper arm */}
            <line x1="90" y1="90" x2="135" y2="45" stroke="url(#notfound-grad)" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" className="origin-center" style={{ transformOrigin: "90px 90px", animation: "spin-slow 4s linear infinite" }} />
            
            {/* Crosshairs */}
            <line x1="90" y1="10" x2="90" y2="170" stroke="#374151" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
            <line x1="10" y1="90" x2="170" y2="90" stroke="#374151" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-8xl font-bold gradient-text tracking-tight">404</h1>
          <h2 className="text-2xl font-extrabold tracking-tight">Page not found</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The coordinates you requested do not point to any active career pathways. The page might have been updated or moved.
          </p>
        </div>

        <div className="flex justify-center gap-3">
          <Link href="/">
            <Button variant="gradient" size="lg" className="rounded-xl px-6">
              Go Home
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg" className="rounded-xl px-6 border-border/80 hover:bg-muted/10">
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
