import { NextResponse } from "next/server";

const COLORS = [
  ["#4f46e5", "#6366f1"],
  ["#0891b2", "#06b6d4"],
  ["#059669", "#10b981"],
  ["#d97706", "#f59e0b"],
  ["#dc2626", "#ef4444"],
  ["#7c3aed", "#8b5cf6"],
  ["#db2777", "#ec4899"],
  ["#1d4ed8", "#3b82f6"],
];

const TYPE_LABELS: Record<string, string> = {
  LOGO: "LOGO",
  CAMPUS: "CAMPUS",
  AERIAL: "AERIAL VIEW",
  LIBRARY: "LIBRARY",
  LAB: "LABORATORY",
  SPORTS: "SPORTS",
  HOSTEL: "HOSTEL",
  CLASSROOM: "CLASSROOM",
};

function generateSVG(name: string, type: string): string {
  const colorPair = COLORS[Math.abs(name.length * 7 + type.length) % COLORS.length]!;
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const label = TYPE_LABELS[type] ?? type;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colorPair[0]}"/>
      <stop offset="100%" style="stop-color:${colorPair[1]}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#bg)" rx="8"/>
  <circle cx="400" cy="220" r="80" fill="rgba(255,255,255,0.1)"/>
  <text x="400" y="240" font-family="system-ui,sans-serif" font-size="64" font-weight="800" fill="rgba(255,255,255,0.9)" text-anchor="middle">${initials}</text>
  <text x="400" y="340" font-family="system-ui,sans-serif" font-size="22" font-weight="600" fill="rgba(255,255,255,0.8)" text-anchor="middle" max-width="600">${name.length > 40 ? name.slice(0, 40) + "..." : name}</text>
  <rect x="300" y="370" width="200" height="32" rx="16" fill="rgba(255,255,255,0.15)"/>
  <text x="400" y="392" font-family="system-ui,sans-serif" font-size="13" font-weight="600" fill="rgba(255,255,255,0.8)" text-anchor="middle">${label}</text>
</svg>`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") ?? "College";
  const type = searchParams.get("type") ?? "CAMPUS";

  const svg = generateSVG(name, type);

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
