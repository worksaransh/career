import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma/prisma";
import { featureFlagSchema } from "@career-os/validations";
import { getSession } from "@/lib/session/session";

const FLAG_CACHE = new Map<string, { enabled: boolean; percentage?: number; description?: string }>();
let lastFetch = 0;
const CACHE_TTL = 60000;

async function getAllFlags() {
  const now = Date.now();
  if (now - lastFetch < CACHE_TTL && FLAG_CACHE.size > 0) {
    return Object.fromEntries(FLAG_CACHE);
  }
  const settings = await prisma.systemSetting.findMany({ where: { category: "FEATURE_FLAG" } });
  FLAG_CACHE.clear();
  for (const s of settings) {
    try {
      const parsed = JSON.parse(s.value);
      FLAG_CACHE.set(s.key, { enabled: parsed.enabled ?? false, percentage: parsed.percentage, description: parsed.description ?? s.description ?? undefined });
    } catch {
      FLAG_CACHE.set(s.key, { enabled: s.value === "true" });
    }
  }
  lastFetch = now;
  return Object.fromEntries(FLAG_CACHE);
}

export async function GET() {
  try {
    const flags = await getAllFlags();
    return NextResponse.json({ success: true, data: flags });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role as string)) {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Admin access required" } }, { status: 403 });
    }
    const body = await request.json();
    const validated = featureFlagSchema.parse(body);
    await prisma.systemSetting.upsert({
      where: { key: validated.key },
      update: { value: JSON.stringify({ enabled: validated.enabled, percentage: validated.percentage }), description: validated.description, category: "FEATURE_FLAG" },
      create: { key: validated.key, value: JSON.stringify({ enabled: validated.enabled, percentage: validated.percentage }), description: validated.description, category: "FEATURE_FLAG" },
    });
    lastFetch = 0;
    return NextResponse.json({ success: true, data: { key: validated.key, enabled: validated.enabled } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", details: error.flatten().fieldErrors } }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
  }
}
