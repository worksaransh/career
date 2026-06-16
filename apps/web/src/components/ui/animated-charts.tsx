"use client";

import React, { useEffect, useState } from "react";

/**
 * 1. Animated Salary Growth Line Chart
 */
interface SalaryGrowthChartProps {
  entry: number;
  mid: number;
  senior: number;
}

export function SalaryGrowthChart({ entry, mid, senior }: SalaryGrowthChartProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(t);
  }, []);

  const entryLakhs = entry / 100000;
  const midLakhs = mid / 100000;
  const seniorLakhs = senior / 100000;
  const maxLakhs = Math.max(seniorLakhs, 50); // upper limit bounds

  // Map salaries to SVG coordinates (Y height is 120 max, top padding 10)
  const getY = (val: number) => 130 - (val / maxLakhs) * 100;

  const yEntry = getY(entryLakhs);
  const yMid = getY(midLakhs);
  const ySenior = getY(seniorLakhs);

  // Path data (animated to draw from flat line)
  const pathD = animated
    ? `M 20 ${yEntry} Q 110 ${yMid}, 200 ${ySenior}`
    : `M 20 130 Q 110 130, 200 130`;

  return (
    <div className="w-full bg-card/30 border border-border/60 rounded-3xl p-5 hover-lift transition-all relative overflow-hidden backdrop-blur-xs">
      <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-primary/5 blur-[50px] pointer-events-none" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Compensation Forecast</span>
      
      <div className="relative h-40 w-full">
        <svg viewBox="0 0 220 140" className="w-full h-full overflow-visible">
          {/* Y-axis grid dashes */}
          <line x1="20" y1="30" x2="200" y2="30" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
          <line x1="20" y1="80" x2="200" y2="80" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
          <line x1="20" y1="130" x2="200" y2="130" stroke="var(--border)" strokeWidth="0.5" opacity="0.5" />

          {/* Connected Curved Path */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#chart-gradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            style={{ transition: "d 1.2s cubic-bezier(0.25, 1, 0.5, 1)" }}
          />

          {/* Dots & Labels */}
          {animated && (
            <>
              {/* Entry */}
              <circle cx="20" cy={yEntry} r="5.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" className="animate-pulse" />
              <text x="20" y={yEntry - 10} fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle">₹{entryLakhs.toFixed(1)}L</text>
              
              {/* Mid */}
              <circle cx="110" cy={yMid} r="5.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />
              <text x="110" y={yMid - 10} fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle">₹{midLakhs.toFixed(0)}L</text>

              {/* Senior */}
              <circle cx="200" cy={ySenior} r="5.5" fill="#ec4899" stroke="#ffffff" strokeWidth="1.5" />
              <text x="200" y={ySenior - 10} fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle">₹{seniorLakhs.toFixed(0)}L</text>
            </>
          )}

          <defs>
            <linearGradient id="chart-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="flex justify-between items-center text-[9px] text-muted-foreground uppercase font-bold tracking-wider pt-2 border-t border-border/30">
        <span>Entry (0-2y)</span>
        <span>Mid (5-8y)</span>
        <span>Senior (12y+)</span>
      </div>
    </div>
  );
}

/**
 * 2. Animated ROI Payback Infographic Comparison Chart
 */
interface RoiPaybackChartProps {
  investment: number;
  earnings: number;
}

export function RoiPaybackChart({ investment, earnings }: RoiPaybackChartProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  const totalMax = Math.max(investment, earnings, 1);
  const costPercent = Math.round((investment / totalMax) * 100);
  const earningsPercent = Math.round((earnings / totalMax) * 100);

  return (
    <div className="w-full bg-card/30 border border-border/60 rounded-3xl p-5 hover-lift transition-all backdrop-blur-xs">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-4">Investment Recovery (5-Yr Outlook)</span>
      
      <div className="space-y-4">
        {/* Cost Row */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> Total Cost
            </span>
            <span className="font-bold text-foreground">₹{(investment / 100000).toFixed(1)} Lakhs</span>
          </div>
          <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all duration-1000 ease-out"
              style={{ width: animated ? `${costPercent}%` : "0%" }}
            />
          </div>
        </div>

        {/* Earnings Row */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> 5-Year Earnings
            </span>
            <span className="font-bold text-foreground">₹{(earnings / 100000).toFixed(1)} Lakhs</span>
          </div>
          <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000 ease-out"
              style={{ width: animated ? `${earningsPercent}%` : "0%" }}
            />
          </div>
        </div>
      </div>

      {earnings > investment && (
        <div className="mt-4 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-[10px] text-emerald-400 font-semibold text-center">
          💰 Earnings surpass education costs by {(earnings / investment).toFixed(1)}x within 5 years.
        </div>
      )}
    </div>
  );
}

/**
 * 3. Animated Speedometer Dial for AI Risk Level
 */
interface AiRiskGaugeProps {
  level: "LOW" | "MEDIUM" | "HIGH";
}

export function AiRiskGauge({ level }: AiRiskGaugeProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 250);
    return () => clearTimeout(t);
  }, []);

  // Map risk strings to gauge rotation angles
  const angle = level === "LOW" ? 30 : level === "MEDIUM" ? 90 : 150;
  const colorClass = level === "LOW" ? "text-emerald-400" : level === "MEDIUM" ? "text-amber-400" : "text-rose-400";
  const desc = level === "LOW" ? "Highly resilient to AI displacement" : level === "MEDIUM" ? "Moderate task automation potential" : "High exposure to AI automation";

  return (
    <div className="w-full bg-card/30 border border-border/60 rounded-3xl p-5 hover-lift transition-all backdrop-blur-xs flex flex-col justify-between items-center text-center">
      <div className="w-full flex justify-between items-center mb-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block text-left">AI Disruption Risk</span>
        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-card ${colorClass} border-current/20`}>
          {level}
        </span>
      </div>

      <div className="relative h-28 w-44 mt-3 flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 100 60" className="w-full h-full overflow-visible">
          {/* Semicircle Gauge Track */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#1f2937"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Semicircle Fill */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="url(#gauge-gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="126"
            strokeDashoffset={126 - (126 * (angle / 180))}
            style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.25, 1, 0.5, 1)" }}
          />

          {/* Gauge Needle */}
          <g 
            transform={`translate(50, 50) rotate(${animated ? angle - 90 : -90})`}
            style={{ transition: "transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
          >
            <polygon points="-3,0 3,0 0,-38" fill="#ffffff" />
            <circle cx="0" cy="0" r="5" fill="#ffffff" />
          </g>

          <defs>
            <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <p className="text-[10px] text-muted-foreground leading-relaxed mt-2">
        {desc}
      </p>
    </div>
  );
}
