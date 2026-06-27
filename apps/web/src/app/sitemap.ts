import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma/prisma";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://careeros.ai";

const staticRoutes = [
  { path: "", priority: 1, freq: "weekly" as const },
  { path: "/about", priority: 0.8, freq: "monthly" as const },
  { path: "/pricing", priority: 0.8, freq: "monthly" as const },
  { path: "/features", priority: 0.8, freq: "monthly" as const },
  { path: "/blog", priority: 0.8, freq: "weekly" as const },
  { path: "/career-explorer", priority: 0.9, freq: "weekly" as const },
  { path: "/degree-explorer", priority: 0.9, freq: "weekly" as const },
  { path: "/college-explorer", priority: 0.9, freq: "weekly" as const },
  { path: "/colleges", priority: 0.9, freq: "daily" as const },
  { path: "/skills-explorer", priority: 0.8, freq: "weekly" as const },
  { path: "/scholarship-explorer", priority: 0.8, freq: "weekly" as const },
  { path: "/contact", priority: 0.7, freq: "monthly" as const },
  { path: "/faq", priority: 0.6, freq: "monthly" as const },
  { path: "/privacy", priority: 0.3, freq: "yearly" as const },
  { path: "/terms", priority: 0.3, freq: "yearly" as const },
  { path: "/login", priority: 0.5, freq: "monthly" as const },
  { path: "/register", priority: 0.5, freq: "monthly" as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = staticRoutes.map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.freq,
    priority: r.priority,
  }));

  let collegeEntries: MetadataRoute.Sitemap = [];
  try {
    const colleges = await prisma.college.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
      orderBy: { ranking: "asc" },
      take: 50000,
    });

    collegeEntries = colleges.map((c) => ({
      url: `${baseUrl}/colleges/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Failed to fetch colleges for sitemap:", error);
  }

  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const blogPosts = await prisma.blogPost?.findMany?.({
      where: { publishedAt: { not: null } },
      select: { slug: true, updatedAt: true },
    }) ?? [];

    blogEntries = blogPosts.map((p) => ({
      url: `${baseUrl}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Failed to fetch blog posts for sitemap:", error);
  }

  return [...staticEntries, ...collegeEntries, ...blogEntries];
}
