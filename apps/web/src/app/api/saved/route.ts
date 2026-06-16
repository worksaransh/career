import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma/prisma";
import { getSession } from "@/lib/session/session";

const saveItemSchema = z.object({
  itemType: z.enum(["CAREER", "DEGREE", "COLLEGE", "SKILL"]),
  itemId: z.string().min(1),
  notes: z.string().max(500).optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
    }

    const items = await prisma.savedItem.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: items });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
    }

    const body = await request.json();
    const validated = saveItemSchema.parse(body);

    const existing = await prisma.savedItem.findFirst({
      where: { userId: session.user.id, itemType: validated.itemType, itemId: validated.itemId },
    });

    if (existing) {
      return NextResponse.json({ success: false, error: { code: "ALREADY_SAVED", message: "Item already saved" } }, { status: 409 });
    }

    const item = await prisma.savedItem.create({
      data: {
        userId: session.user.id,
        itemType: validated.itemType,
        itemId: validated.itemId,
        notes: validated.notes,
      },
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", details: error.flatten().fieldErrors } }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Item ID required" } }, { status: 400 });
    }

    const item = await prisma.savedItem.findFirst({ where: { id, userId: session.user.id } });
    if (!item) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Item not found" } }, { status: 404 });
    }

    await prisma.savedItem.delete({ where: { id } });
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
  }
}
