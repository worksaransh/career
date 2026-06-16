import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma/prisma";
import { getSession } from "@/lib/session/session";

const imageSchema = z.object({
  url: z.string().url(),
  alt: z.string().max(200).optional(),
  type: z.enum(["LOGO", "CAMPUS", "AERIAL", "LIBRARY", "LAB", "SPORTS", "HOSTEL", "CLASSROOM", "OTHER"]).default("CAMPUS"),
  isPrimary: z.boolean().default(false),
  source: z.enum(["UPLOADED", "AI_GENERATED", "LICENSED"]).default("UPLOADED"),
  width: z.number().int().positive().default(800),
  height: z.number().int().positive().default(600),
});

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const images = await prisma.collegeImage.findMany({
      where: { collegeId: params.id },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ success: true, data: images });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR" } }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    const userId = session?.user?.id;
    const role = (session?.user as Record<string, unknown>)?.role;
    if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN" } }, { status: 403 });
    }

    const body = await request.json();
    const validated = imageSchema.parse(body);

    if (validated.isPrimary) {
      await prisma.collegeImage.updateMany({
        where: { collegeId: params.id, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const image = await prisma.collegeImage.create({
      data: {
        collegeId: params.id,
        ...validated,
        uploadedById: userId ?? null,
      },
    });

    return NextResponse.json({ success: true, data: image });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", details: error.flatten().fieldErrors } }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR" } }, { status: 500 });
  }
}
