import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma/prisma";
import CollegeDetailClient from "./college-detail-client";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const colleges = await prisma.college.findMany({
    where: { isActive: true },
    select: { slug: true },
    take: 500,
    orderBy: { ranking: "asc" },
  });
  return colleges.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const college = await prisma.college.findUnique({
    where: { slug: params.slug },
    select: { name: true, description: true, location: true },
  });

  if (!college) return { title: "College Not Found" };

  return {
    title: `${college.name} - Fees, Placements, Rankings, Reviews`,
    description: college.description?.slice(0, 160) ?? `Explore ${college.name} in ${college.location}. Check fees, placement stats, rankings, courses, and student reviews.`,
    openGraph: {
      title: `${college.name} - Complete College Guide`,
      description: college.description?.slice(0, 160) ?? `Detailed information about ${college.name}.`,
      type: "website",
    },
  };
}

export default async function CollegeDetailPage({ params }: Props) {
  const college = await prisma.college.findUnique({
    where: { slug: params.slug, isActive: true },
    include: {
      images: { orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }] },
      locations: { orderBy: { isPrimary: "desc" } },
      rankings: { orderBy: { year: "desc" }, take: 15 },
      collegeCourses: {
        include: { course: true },
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      },
      collegeDegrees: {
        include: { degree: true },
        where: { isActive: true },
      },
      reviews: {
        take: 12,
        orderBy: { createdAt: "desc" },
        select: { id: true, rating: true, title: true, content: true, createdAt: true },
      },
      scholarships: { where: { isActive: true } },
    },
  });

  if (!college) notFound();

  return <CollegeDetailClient college={JSON.parse(JSON.stringify(college))} />;
}
