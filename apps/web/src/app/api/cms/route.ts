import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section") ?? "";
    const language = searchParams.get("language") ?? "en";
    const key = searchParams.get("key") ?? "";

    const where: Record<string, unknown> = { isActive: true, language };
    if (section) where.section = section;
    if (key) where.key = { contains: key, mode: "insensitive" };

    const contents = await prisma.cMSContent.findMany({
      where: where as any,
      orderBy: { key: "asc" },
    });

    return NextResponse.json({ success: true, data: contents });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR" } }, { status: 500 });
  }
}
