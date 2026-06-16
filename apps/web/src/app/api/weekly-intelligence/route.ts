import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma/prisma";
import { generateWeeklyIntelligence } from "@/lib/weekly-intelligence";
import { getSession } from "@/lib/session/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    const intel = generateWeeklyIntelligence(session.user.id, user ?? {});
    return NextResponse.json({ success: true, data: intel });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
  }
}
