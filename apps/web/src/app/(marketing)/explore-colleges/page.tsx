import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma/prisma";
import CollegeListingClient from "./college-listing-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Colleges in India - Search, Compare & Explore 15,000+ Institutions",
  description: "Browse 15,000+ colleges across India. Search by name, location, ranking, fees, and placement. Compare colleges side by side with detailed data.",
  openGraph: {
    title: "Colleges in India - Search & Compare",
    description: "Search 15,000+ Indian colleges by location, ranking, fees, and placement data.",
  },
};

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function CollegesListingPage({ searchParams }: PageProps) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const limit = 24;
  const query = (searchParams.q as string) ?? "";
  const location = (searchParams.location as string) ?? "";
  const sortBy = (searchParams.sortBy as string) ?? "ranking";
  const sortOrder = (searchParams.sortOrder as string) ?? "asc";

  const where: Record<string, unknown> = { isActive: true };
  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { location: { contains: query, mode: "insensitive" } },
    ];
  }
  if (location) where.location = { contains: location, mode: "insensitive" };

  const orderBy: Record<string, string> = {};
  const validSorts = ["ranking", "name", "avgPackage", "feesTotal", "rating"];
  const sortField = validSorts.includes(sortBy) ? sortBy : "ranking";
  orderBy[sortField] = sortOrder === "desc" ? "desc" : "asc";

  let colleges: any[] = [];
  let total = 0;
  let locations: any[] = [];

  try {
    const [dbColleges, dbTotal, dbLocations] = await Promise.all([
      prisma.college.findMany({
        where: where as any,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, name: true, slug: true, location: true, ranking: true,
          feesTotal: true, avgPackage: true, placementPercent: true, rating: true,
          topRecruiters: true, studentCount: true, isActive: true,
        },
      }),
      prisma.college.count({ where: where as any }),
      prisma.college.findMany({
        select: { location: true },
        distinct: ["location"],
        where: { isActive: true },
        take: 500,
      }),
    ]);
    colleges = dbColleges;
    total = dbTotal;
    locations = dbLocations;
  } catch (err) {
    console.error("Failed to fetch colleges from database:", err);
  }

  const uniqueLocations = [...new Set(locations.map((l) => l.location).filter(Boolean))].sort();

  return (
    <CollegeListingClient
      colleges={JSON.parse(JSON.stringify(colleges))}
      total={total}
      page={page}
      limit={limit}
      query={query}
      location={location}
      sortBy={sortBy}
      sortOrder={sortOrder}
      locations={uniqueLocations}
    />
  );
}
