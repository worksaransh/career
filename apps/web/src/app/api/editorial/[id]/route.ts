import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma/prisma";
import { getSession } from "@/lib/session/session";

const editorialUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().min(1).optional(),
  excerpt: z.string().max(500).optional(),
  status: z.enum(["DRAFT", "REVIEW", "SCHEDULED", "PUBLISHED", "ARCHIVED"]).optional(),
  tags: z.array(z.string()).optional(),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
  canonicalUrl: z.string().url().optional(),
  featuredImage: z.string().url().optional(),
  scheduledAt: z.string().datetime().optional(),
});

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const post = await prisma.editorialPost.findUnique({ where: { id: params.id } });
    if (!post) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Post not found" } }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: post });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
    }

    const existing = await prisma.editorialPost.findUnique({ where: { id: params.id }, select: { authorId: true } });
    if (!existing) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Post not found" } }, { status: 404 });
    }

    const role = (session.user as Record<string, unknown>).role;
    if (existing.authorId !== session.user.id && role !== "SUPER_ADMIN" && role !== "ADMIN" && role !== "CONTENT_MANAGER") {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Not authorized to edit this post" } }, { status: 403 });
    }

    const body = await request.json();
    const validated = editorialUpdateSchema.parse(body);

    const updateData: Record<string, unknown> = {};
    if (validated.title) updateData.title = validated.title;
    if (validated.body) { updateData.body = validated.body; updateData.excerpt = validated.body.slice(0, 200).replace(/\n/g, " "); }
    if (validated.status) updateData.status = validated.status;
    if (validated.tags) updateData.tags = validated.tags;
    if (validated.seoTitle) updateData.seoTitle = validated.seoTitle;
    if (validated.seoDescription) updateData.seoDescription = validated.seoDescription;
    if (validated.canonicalUrl) updateData.canonicalUrl = validated.canonicalUrl;
    if (validated.featuredImage) updateData.featuredImage = validated.featuredImage;
    if (validated.scheduledAt) updateData.scheduledAt = new Date(validated.scheduledAt);
    if (validated.status === "PUBLISHED") updateData.publishedAt = new Date();

    const post = await prisma.editorialPost.update({ where: { id: params.id }, data: updateData });
    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", details: error.flatten().fieldErrors } }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
    }

    const existing = await prisma.editorialPost.findUnique({ where: { id: params.id }, select: { authorId: true } });
    if (!existing) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Post not found" } }, { status: 404 });
    }

    const role = (session.user as Record<string, unknown>).role;
    if (existing.authorId !== session.user.id && role !== "SUPER_ADMIN" && role !== "ADMIN") {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Not authorized to delete this post" } }, { status: 403 });
    }

    await prisma.editorialPost.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
  }
}
