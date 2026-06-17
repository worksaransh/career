import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma/prisma";
import { getSession } from "@/lib/session/session";
import { exportCollegesToCSV } from "@/lib/college-import";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    const role = (session?.user as Record<string, unknown>)?.role;
    if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN" } }, { status: 403 });
    }

    const colleges = await prisma.college.findMany({ orderBy: { name: "asc" } });
    const csv = exportCollegesToCSV(colleges);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="colleges-export-${Date.now()}.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR" } }, { status: 500 });
  }
}
