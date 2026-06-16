"use client";

import React, { useState } from "react";

interface DataPoint {
  date: string;
  count: number;
}

interface DashboardChartProps {
  data: DataPoint[];
  title?: string;
  description?: string;
}

export function DashboardChart({ data, title = "Platform Activity", description = "Assessments completed over the past 14 days" }: DashboardChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-border bg-card/20 text-muted-foreground">
        No data available
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.count), 5); // Ensure at least 5 for scale
  const height = 200;
  const width = 600;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartHeight = height - paddingTop - paddingBottom;
  const chartWidth = width - paddingLeft - paddingRight;

  // Compute SVG coordinates
  const points = data.map((d, i) => {
    const x = paddingLeft + (i / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.count / maxVal) * chartHeight;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const areaPath = points.length > 0 && firstPoint && lastPoint
    ? `${linePath} L ${lastPoint.x} ${height - paddingBottom} L ${firstPoint.x} ${height - paddingBottom} Z` 
    : "";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/40 p-6 backdrop-blur-md shadow-xl transition-all duration-300 hover:shadow-2xl">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        
        {hoveredIdx !== null && points[hoveredIdx] && (
          <div className="inline-flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs text-primary font-medium animate-in fade-in slide-in-from-top-1 duration-200">
            <span className="font-semibold">{points[hoveredIdx]?.date}:</span>
            <span>{points[hoveredIdx]?.count} assessments</span>
          </div>
        )}
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[500px] overflow-visible"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--primary) / 0.8)" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingTop + ratio * chartHeight;
            const label = Math.round(maxVal * (1 - ratio));
            return (
              <g key={i} className="opacity-40">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="currentColor"
                  strokeDasharray="4 4"
                  className="text-border"
                  strokeWidth={1}
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  className="fill-muted-foreground font-mono font-medium"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Area under the line */}
          <path d={areaPath} fill="url(#areaGradient)" className="transition-all duration-300" />

          {/* Glow effect on the line */}
          <path
            d={linePath}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={4}
            className="opacity-15 blur-sm"
          />

          {/* The line itself */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />

          {/* Interactive touch points */}
          {points.map((p, i) => (
            <g
              key={i}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Invisible touch target */}
              <circle cx={p.x} cy={p.y} r={12} fill="transparent" />

              {/* Glowing point on hover */}
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === i ? 6 : 4}
                className="fill-background stroke-primary transition-all duration-200"
                strokeWidth={hoveredIdx === i ? 3 : 2}
              />
            </g>
          ))}

          {/* X Axis dates */}
          {points.filter((_, idx) => idx % 2 === 0 || idx === points.length - 1).map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={height - 8}
              textAnchor="middle"
              fontSize="9"
              className="fill-muted-foreground font-mono font-medium"
            >
              {p.date.slice(5)}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
