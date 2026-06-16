import { NextResponse } from "next/server";
import { getRecommendations } from "@/lib/graph/recommendations";
import { invalidateCache } from "@/lib/graph";
import { getSession } from "@/lib/session/session";
import { checkRateLimit } from "@/lib/rate-limit/rate-limit";

export async function GET(request: Request) {
  const rateLimitResponse = await checkRateLimit(
    request.headers.get("x-forwarded-for") ?? "127.0.0.1",
    "/api/graph",
  );
  if (!rateLimitResponse.allowed) {
    return NextResponse.json(
      { success: false, error: { code: "RATE_LIMITED", message: "Too many requests" } },
      { status: 429, headers: { "Retry-After": String(rateLimitResponse.resetIn) } },
    );
  }

  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = (searchParams.get("type") ?? "CAREER") as "CAREER" | "DEGREE" | "COLLEGE" | "SKILL";
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") ?? "10"), 1), 50);

    const recommendations = await getRecommendations(session.user.id, type, limit);
    return NextResponse.json({ success: true, data: recommendations });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
    }
    const role = (session.user as Record<string, unknown>).role;
    if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Admin access required" } }, { status: 403 });
    }
    invalidateCache();
    return NextResponse.json({ success: true, data: { cacheCleared: true } });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
  }
}
