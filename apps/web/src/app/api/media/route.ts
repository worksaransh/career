import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma/prisma";
import { getSession } from "@/lib/session/session";

const mediaSchema = z.object({
  url: z.string().url(),
  alt: z.string().min(1).max(200),
  type: z.enum(["image", "video", "pdf", "document"]),
  section: z.string().default("general"),
  tags: z.array(z.string()).default([]),
  width: z.number().int().positive().default(800),
  height: z.number().int().positive().default(600),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED" } }, { status: 401 });
    }
    const assets = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ success: true, data: assets });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR" } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const role = (session?.user as Record<string, unknown>)?.role;
    if (role !== "SUPER_ADMIN" && role !== "ADMIN" && role !== "CONTENT_MANAGER") {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN" } }, { status: 403 });
    }
    const body = await request.json();
    const validated = mediaSchema.parse(body);
    const asset = await prisma.mediaAsset.create({ data: validated });
    return NextResponse.json({ success: true, data: asset });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", details: error.flatten().fieldErrors } }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR" } }, { status: 500 });
  }
}
