import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma/prisma";
import { getSession } from "@/lib/session/session";

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    const role = (session?.user as Record<string, unknown>)?.role;
    if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN" } }, { status: 403 });
    }
    await prisma.mediaAsset.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR" } }, { status: 500 });
  }
}
