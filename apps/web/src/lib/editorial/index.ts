// Editorial Workflow — content management for programmatic and human-written articles

import { prisma } from "@/lib/db/prisma/prisma";

export type PostStatus = "DRAFT" | "REVIEW" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
export type PostCategory = "CAREER_GUIDE" | "COLLEGE_REVIEW" | "INDUSTRY_TREND" | "SKILL_TUTORIAL" | "SUCCESS_STORY" | "NEWS";

export interface EditorialPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: PostCategory;
  status: PostStatus;
  authorId: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  featuredImage?: string;
  publishedAt?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostVersion {
  id: string;
  postId: string;
  version: number;
  body: string;
  changeNotes: string;
  editedBy: string;
  createdAt: string;
}

const POST_CATEGORIES: Record<PostCategory, string> = {
  CAREER_GUIDE: "Career Guide",
  COLLEGE_REVIEW: "College Review",
  INDUSTRY_TREND: "Industry Trend",
  SKILL_TUTORIAL: "Skill Tutorial",
  SUCCESS_STORY: "Success Story",
  NEWS: "News",
};

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 100);
}

export async function createPost(
  title: string,
  body: string,
  category: PostCategory,
  authorId: string,
  tags?: string[],
): Promise<EditorialPost> {
  const slug = slugify(title);
  const existing = await prisma.editorialPost.findUnique({ where: { slug } });
  const uniqueSlug = existing ? `${slug}-${Date.now()}` : slug;

  const post = await prisma.editorialPost.create({
    data: {
      title,
      slug: uniqueSlug,
      excerpt: body.slice(0, 200).replace(/\n/g, " "),
      body,
      category,
      status: "DRAFT",
      authorId,
      tags: tags ?? [],
    },
  });

  return post as unknown as EditorialPost;
}

export async function updatePostStatus(postId: string, status: PostStatus): Promise<EditorialPost> {
  const updateData: Record<string, unknown> = { status };
  if (status === "PUBLISHED") updateData.publishedAt = new Date().toISOString();
  if (status === "SCHEDULED") updateData.scheduledAt = new Date().toISOString();

  const post = await prisma.editorialPost.update({
    where: { id: postId },
    data: updateData,
  });

  return post as unknown as EditorialPost;
}

export async function getPostsByCategory(category: PostCategory): Promise<EditorialPost[]> {
  const posts = await prisma.editorialPost.findMany({
    where: { category, status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });

  return posts as unknown as EditorialPost[];
}

export async function getLatestPosts(limit = 10): Promise<EditorialPost[]> {
  const posts = await prisma.editorialPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  return posts as unknown as EditorialPost[];
}

export async function searchPosts(query: string): Promise<EditorialPost[]> {
  const posts = await prisma.editorialPost.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { excerpt: { contains: query, mode: "insensitive" } },
        { tags: { has: query } },
      ],
    },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });

  return posts as unknown as EditorialPost[];
}

export { POST_CATEGORIES, slugify };
