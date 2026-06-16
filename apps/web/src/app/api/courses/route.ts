import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma/prisma";

const courseSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  category: z.string().min(1),
  level: z.enum(["UG", "PG", "DIPLOMA", "CERTIFICATE", "PHD"]).default("UG"),
  duration: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") ?? "";
    const category = searchParams.get("category") ?? "";
    const level = searchParams.get("level") ?? "";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "50"));

    const where: Record<string, unknown> = { isActive: true };
    if (query) where.name = { contains: query, mode: "insensitive" };
    if (category) where.category = category;
    if (level) where.level = level;

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where: where as any,
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.course.count({ where: where as any }),
    ]);

    const categories = await prisma.course.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: { courses, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }, categories: categories.map((c) => c.category) },
    });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR" } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = courseSchema.parse(body);
    const slug = validated.name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 100);

    const existing = await prisma.course.findUnique({ where: { slug } });
    const course = await prisma.course.create({
      data: {
        ...validated,
        slug: existing ? `${slug}-${Date.now()}` : slug,
        duration: validated.duration ?? `${validated.level === "UG" ? "4" : validated.level === "PG" ? "2" : "1"} years`,
      },
    });

    return NextResponse.json({ success: true, data: course });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", details: error.flatten().fieldErrors } }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR" } }, { status: 500 });
  }
}
