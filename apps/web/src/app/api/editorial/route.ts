import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma/prisma";
import { editorialPostCreateSchema } from "@career-os/validations";
import { getSession } from "@/lib/session/session";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
    }
    const body = await request.json();
    const validated = editorialPostCreateSchema.parse(body);
    const slug = validated.title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 100);
    const existing = await prisma.editorialPost.findUnique({ where: { slug } });
    const post = await prisma.editorialPost.create({
      data: {
        title: validated.title,
        slug: existing ? `${slug}-${Date.now()}` : slug,
        excerpt: validated.body.slice(0, 200).replace(/\n/g, " "),
        body: validated.body,
        category: validated.category,
        tags: validated.tags,
        authorId: session.user.id,
        seoTitle: validated.seoTitle,
        seoDescription: validated.seoDescription,
        featuredImage: validated.featuredImage,
        status: "DRAFT",
      },
    });
    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", details: error.flatten().fieldErrors } }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (status) where.status = status;
    else where.status = "PUBLISHED";
    const posts = await prisma.editorialPost.findMany({ where: where as any, orderBy: { publishedAt: "desc" }, take: Math.min(limit, 100) });
    return NextResponse.json({ success: true, data: posts });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
  }
}
