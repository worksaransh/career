import React from "react";

/**
 * Standard definitions like blur filters and gradients for reuse across SVG components.
 */
function SvgDefs() {
  return (
    <defs>
      {/* Glow / blur filters */}
      <filter id="glow-light" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      <filter id="blur-bg" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation="15" />
      </filter>

      {/* Gradients */}
      <linearGradient id="grad-indigo-purple" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="50%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>

      <linearGradient id="grad-emerald-green" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>

      <linearGradient id="grad-blue-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#06b6d4" />
      </linearGradient>

      <linearGradient id="grad-glass" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.02" />
      </linearGradient>

      <linearGradient id="grad-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>

      <linearGradient id="grad-coral" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f43f5e" />
        <stop offset="100%" stopColor="#e11d48" />
      </linearGradient>
    </defs>
  );
}

/**
 * Animated SVG background grid mesh
 */
export function FloatingBackgroundGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none -z-10 opacity-30">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border/30" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        <circle cx="20%" cy="30%" r="200" fill="url(#grad-indigo-purple)" opacity="0.08" filter="url(#blur-bg)" />
        <circle cx="80%" cy="70%" r="250" fill="url(#grad-blue-cyan)" opacity="0.06" filter="url(#blur-bg)" />
      </svg>
    </div>
  );
}

/**
 * Futuristic AI Dashboard Mockup Hero Visual
 */
export function HomepageVisual({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 600 400" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <SvgDefs />
      
      {/* Outer mock frame */}
      <rect x="10" y="10" width="580" height="380" rx="24" fill="#0b0f19" stroke="#1f2937" strokeWidth="2" />
      <rect x="10" y="10" width="580" height="380" rx="24" fill="url(#grad-glass)" />

      {/* Safari-like window top bar */}
      <circle cx="35" cy="30" r="5" fill="#f43f5e" />
      <circle cx="50" cy="30" r="5" fill="#fbbf24" />
      <circle cx="65" cy="30" r="5" fill="#10b981" />
      <line x1="90" y1="30" x2="250" y2="30" stroke="#374151" strokeWidth="8" strokeLinecap="round" opacity="0.5" />

      {/* Left Sidebar Mockup */}
      <rect x="25" y="60" width="120" height="310" rx="12" fill="#111827" opacity="0.6" />
      <rect x="35" y="80" width="100" height="15" rx="5" fill="#374151" />
      {[1, 2, 3, 4].map((i) => (
        <rect key={i} x="35" y="110 + (i * 25)" width="80" height="10" rx="4" fill="#1f2937" />
      ))}

      {/* Main Roadmap node connections */}
      <g opacity="0.85">
        <path d="M 210 180 C 270 120, 310 240, 370 150 C 430 80, 480 220, 530 140" stroke="url(#grad-indigo-purple)" strokeWidth="4" strokeLinecap="round" />
        
        {/* Animated active path pulse */}
        <circle cx="210" cy="180" r="10" fill="#6366f1" filter="url(#glow-light)" />
        <circle cx="210" cy="180" r="5" fill="#ffffff" />

        <circle cx="290" cy="165" r="8" fill="#8b5cf6" opacity="0.8" />
        <circle cx="370" cy="150" r="12" fill="#ec4899" filter="url(#glow-light)" />
        <circle cx="370" cy="150" r="6" fill="#ffffff" />
        
        <circle cx="450" cy="158" r="8" fill="#3b82f6" opacity="0.8" />
        <circle cx="530" cy="140" r="14" fill="#10b981" filter="url(#glow-light)" />
        <circle cx="530" cy="140" r="7" fill="#ffffff" />
      </g>

      {/* Floating Card Mockups */}
      {/* 1. Parent ROI Widget Mock */}
      <g transform="translate(180, 240)" className="animate-float">
        <rect x="0" y="0" width="180" height="110" rx="16" fill="#1f2937" stroke="#374151" strokeWidth="1" />
        <rect x="0" y="0" width="180" height="110" rx="16" fill="url(#grad-glass)" />
        <text x="15" y="25" fill="#9ca3af" fontSize="10" fontWeight="bold">EXPECTED ROI</text>
        <text x="15" y="55" fill="#10b981" fontSize="24" fontWeight="extrabold">340%</text>
        <line x1="15" y1="75" x2="165" y2="75" stroke="#374151" strokeWidth="4" strokeLinecap="round" />
        <line x1="15" y1="75" x2="120" y2="75" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
        <text x="15" y="95" fill="#9ca3af" fontSize="8">Payback: 1.8 Years</text>
      </g>

      {/* 2. AI Recommendation card */}
      <g transform="translate(380, 240)" style={{ animationDelay: "2s" }} className="animate-float">
        <rect x="0" y="0" width="180" height="110" rx="16" fill="#1f2937" stroke="#374151" strokeWidth="1" />
        <rect x="0" y="0" width="180" height="110" rx="16" fill="url(#grad-glass)" />
        <circle cx="25" cy="25" r="10" fill="url(#grad-indigo-purple)" />
        <text x="45" y="28" fill="#ffffff" fontSize="10" fontWeight="bold">AI MENTOR</text>
        <rect x="15" y="48" width="150" height="6" rx="3" fill="#374151" />
        <rect x="15" y="60" width="130" height="6" rx="3" fill="#374151" />
        <rect x="15" y="72" width="90" height="6" rx="3" fill="#6366f1" />
        
        {/* Fit Badge */}
        <rect x="120" y="15" width="45" height="16" rx="8" fill="#6366f1" fillOpacity="0.2" />
        <text x="130" y="26" fill="#a5b4fc" fontSize="8" fontWeight="bold">98% FIT</text>
      </g>

      {/* Salary forecast chart */}
      <g transform="translate(180, 60)">
        <rect x="0" y="0" width="380" height="80" rx="16" fill="#111827" fillOpacity="0.4" />
        <path d="M 20 65 L 100 55 L 180 40 L 260 25 L 340 10" fill="none" stroke="url(#grad-blue-cyan)" strokeWidth="3" />
        <circle cx="340" cy="10" r="5" fill="#06b6d4" />
        <line x1="20" y1="70" x2="360" y2="70" stroke="#374151" strokeWidth="1" strokeDasharray="4 4" />
      </g>
    </svg>
  );
}

/**
 * Career GPS Roadmap node illustration
 */
export function CareerGpsVisual({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <SvgDefs />
      <circle cx="100" cy="100" r="80" fill="url(#grad-indigo-purple)" opacity="0.1" />
      <circle cx="100" cy="100" r="60" fill="url(#grad-indigo-purple)" opacity="0.15" />
      <path d="M 50 130 C 80 80, 120 120, 150 70" stroke="url(#grad-indigo-purple)" strokeWidth="5" strokeLinecap="round" />
      <circle cx="50" cy="130" r="8" fill="#6366f1" />
      <circle cx="100" cy="100" r="10" fill="#8b5cf6" filter="url(#glow-light)" />
      <circle cx="150" cy="70" r="14" fill="#10b981" filter="url(#glow-light)" />
      <circle cx="150" cy="70" r="7" fill="#ffffff" />
    </svg>
  );
}

/**
 * Future Simulator graphic
 */
export function FutureSimulatorVisual({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <SvgDefs />
      <rect x="20" y="20" width="160" height="160" rx="24" fill="url(#grad-glass)" stroke="#374151" />
      <circle cx="100" cy="100" r="45" fill="none" stroke="#1f2937" strokeWidth="4" />
      <circle cx="100" cy="100" r="45" fill="none" stroke="url(#grad-indigo-purple)" strokeWidth="4" strokeDasharray="280" strokeDashoffset="120" strokeLinecap="round" />
      <text x="100" y="106" fill="#ffffff" fontSize="18" fontWeight="bold" textAnchor="middle">85%</text>
      <path d="M 40 150 L 80 140 L 120 160 L 160 130" fill="none" stroke="url(#grad-blue-cyan)" strokeWidth="3" />
    </svg>
  );
}

/**
 * Parent Intelligence Infographic visual
 */
export function ParentDashboardVisual({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <SvgDefs />
      <rect x="20" y="25" width="160" height="150" rx="20" fill="url(#grad-glass)" stroke="#374151" />
      
      {/* 3D-ish bar representation */}
      <rect x="50" y="80" width="30" height="70" rx="6" fill="#374151" />
      <rect x="50" y="110" width="30" height="40" rx="6" fill="url(#grad-coral)" />
      
      <rect x="120" y="50" width="30" height="100" rx="6" fill="#374151" />
      <rect x="120" y="50" width="30" height="100" rx="6" fill="url(#grad-emerald-green)" />
      
      <text x="65" y="165" fill="#9ca3af" fontSize="10" textAnchor="middle">Cost</text>
      <text x="135" y="165" fill="#10b981" fontSize="10" textAnchor="middle">Salary</text>
      
      <circle cx="135" cy="50" r="12" fill="#10b981" opacity="0.2" />
      <path d="M131 50 L134 53 L139 47" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Skill Gap Connector illustration
 */
export function SkillGapVisual({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <SvgDefs />
      <circle cx="70" cy="100" r="30" fill="#1f2937" stroke="#374151" />
      <circle cx="130" cy="100" r="30" fill="#1f2937" stroke="#374151" />
      <circle cx="70" cy="100" r="15" fill="none" stroke="#6366f1" strokeWidth="3" />
      
      <path d="M 98 100 L 102 100" stroke="#9ca3af" strokeWidth="2" strokeDasharray="3 3" />
      
      <circle cx="130" cy="100" r="20" fill="url(#grad-emerald-green)" />
      <path d="M 125 100 L 129 104 L 136 96" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Scholarship Finder placeholder illustration
 */
export function ScholarshipFinderVisual({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <SvgDefs />
      <path d="M 40 80 L 100 50 L 160 80 L 100 110 Z" fill="url(#grad-gold)" />
      <path d="M 50 90 L 50 140 C 50 150, 150 150, 150 140 L 150 90" fill="none" stroke="#f59e0b" strokeWidth="4" />
      <line x1="100" y1="110" x2="100" y2="170" stroke="#f59e0b" strokeWidth="4" />
      <circle cx="100" cy="170" r="10" fill="url(#grad-gold)" />
    </svg>
  );
}

/**
 * AI Mentor interactive visual
 */
export function AiMentorVisual({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <SvgDefs />
      <circle cx="100" cy="90" r="45" fill="url(#grad-indigo-purple)" opacity="0.2" />
      <circle cx="100" cy="90" r="35" fill="none" stroke="url(#grad-indigo-purple)" strokeWidth="2.5" />
      
      {/* Bot face mockup */}
      <rect x="75" y="70" width="50" height="40" rx="12" fill="#1f2937" stroke="#374151" strokeWidth="2" />
      <circle cx="88" cy="90" r="4" fill="#6366f1" filter="url(#glow-light)" />
      <circle cx="112" cy="90" r="4" fill="#6366f1" filter="url(#glow-light)" />
      <path d="M 92 100 Q 100 105, 108 100" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
      <path d="M 90 70 L 100 55 L 110 70" stroke="#374151" strokeWidth="2" fill="none" />
      <circle cx="100" cy="53" r="4" fill="#ec4899" />
    </svg>
  );
}

/**
 * College explorer visual
 */
export function CollegeExplorerVisual({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <SvgDefs />
      <path d="M 20 150 L 180 150" stroke="#374151" strokeWidth="3" />
      <rect x="40" y="70" width="120" height="80" rx="8" fill="url(#grad-glass)" stroke="#374151" />
      
      {/* Columns */}
      <line x1="60" y1="80" x2="60" y2="140" stroke="#9ca3af" strokeWidth="6" strokeLinecap="round" />
      <line x1="100" y1="80" x2="100" y2="140" stroke="#9ca3af" strokeWidth="6" strokeLinecap="round" />
      <line x1="140" y1="80" x2="140" y2="140" stroke="#9ca3af" strokeWidth="6" strokeLinecap="round" />
      
      {/* Triangular roof */}
      <path d="M 30 70 L 100 30 L 170 70 Z" fill="url(#grad-indigo-purple)" />
    </svg>
  );
}

/**
 * Dynamic Dashboard Welcome Banner Visual
 */
export function DashboardWelcomeVisual({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <SvgDefs />
      <circle cx="350" cy="60" r="100" fill="url(#grad-indigo-purple)" opacity="0.1" filter="url(#blur-bg)" />
      <circle cx="50" cy="-20" r="80" fill="url(#grad-blue-cyan)" opacity="0.08" filter="url(#blur-bg)" />
      
      {/* Dynamic elements */}
      <path d="M 20 60 Q 100 40, 180 80 T 340 50" fill="none" stroke="url(#grad-indigo-purple)" strokeWidth="2.5" opacity="0.4" />
      <circle cx="100" cy="50" r="4" fill="#6366f1" />
      <circle cx="218" cy="72" r="6" fill="#8b5cf6" />
      <circle cx="340" cy="50" r="8" fill="#10b981" />
    </svg>
  );
}

/**
 * Streak fire icon (custom animated)
 */
export function StreakVisual({ days, className }: { days: number; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <SvgDefs />
      <circle cx="50" cy="50" r="40" fill="url(#grad-coral)" opacity="0.15" />
      
      {/* Flame path */}
      <path 
        d="M 50 15 C 65 35, 75 55, 70 70 C 65 85, 35 85, 30 70 C 25 50, 45 35, 50 15 Z" 
        fill="url(#grad-coral)" 
        filter="url(#glow-light)"
      />
      
      <path 
        d="M 50 30 C 58 45, 65 60, 60 70 C 55 80, 45 80, 40 70 C 35 60, 45 45, 50 30 Z" 
        fill="url(#grad-gold)" 
      />
      
      <text x="50" y="72" fill="#ffffff" fontSize="16" fontWeight="900" textAnchor="middle">{days}</text>
    </svg>
  );
}

/**
 * Achievements Badge
 */
export function AchievementsVisual({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <SvgDefs />
      <polygon points="50,15 80,30 80,70 50,85 20,70 20,30" fill="url(#grad-gold)" />
      <polygon points="50,22 74,34 74,66 50,78 26,66 26,34" fill="#111827" />
      <circle cx="50" cy="50" r="18" fill="url(#grad-gold)" />
      <path d="M 43 50 L 48 55 L 57 44" stroke="#111827" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
