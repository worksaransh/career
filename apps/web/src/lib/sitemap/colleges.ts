import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma/prisma";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://careeros.ai";

export default async function collegeSitemap(): Promise<MetadataRoute.Sitemap> {
  const colleges = await prisma.college.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
    orderBy: { ranking: "asc" },
  });

  return colleges.map((college) => ({
    url: `${baseUrl}/colleges/${college.slug}`,
    lastModified: college.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
}
