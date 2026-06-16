import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma/prisma";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const college = await prisma.college.findUnique({
      where: { id: params.id },
      include: {
        scholarships: { where: { isActive: true } },
        reviews: { take: 10, orderBy: { createdAt: "desc" } },
        images: { orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }] },
        locations: { orderBy: { isPrimary: "desc" } },
        rankings: { orderBy: { year: "desc" }, take: 10 },
        collegeCourses: {
          include: { course: true },
          where: { isActive: true },
        },
        collegeDegrees: {
          include: { degree: true },
          where: { isActive: true },
        },
      },
    });

    if (!college) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND" } }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: college });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR" } }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const college = await prisma.college.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json({ success: true, data: college });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR" } }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.college.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR" } }, { status: 500 });
  }
}
