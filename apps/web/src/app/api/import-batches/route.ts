import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma/prisma";
import { getSession } from "@/lib/session/session";

export async function GET() {
  try {
    const session = await getSession();
    const role = (session?.user as Record<string, unknown>)?.role;
    if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN" } }, { status: 403 });
    }

    const batches = await prisma.importBatch.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, data: batches });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR" } }, { status: 500 });
  }
}
