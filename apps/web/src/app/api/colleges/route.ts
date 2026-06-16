import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") ?? "";
    const location = searchParams.get("location") ?? "";
    const minRank = parseInt(searchParams.get("minRank") ?? "0");
    const maxRank = parseInt(searchParams.get("maxRank") ?? "9999");
    const minPackage = parseInt(searchParams.get("minPackage") ?? "0");
    const collegeType = searchParams.get("type") ?? "";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
    const sortBy = searchParams.get("sortBy") ?? "ranking";
    const sortOrder = searchParams.get("sortOrder") ?? "asc";

    const where: Record<string, unknown> = { isActive: true };
    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { location: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }
    if (location) where.location = { contains: location, mode: "insensitive" };
    if (minRank > 0 || maxRank < 9999) where.ranking = { gte: minRank, lte: maxRank };
    if (minPackage > 0) where.avgPackage = { gte: minPackage };

    const orderBy: Record<string, string> = {};
    const validSorts = ["ranking", "name", "avgPackage", "placementPercent", "rating", "feesTotal"];
    const sortField = validSorts.includes(sortBy) ? sortBy : "ranking";
    orderBy[sortField] = sortOrder === "desc" ? "desc" : "asc";

    const [colleges, total] = await Promise.all([
      prisma.college.findMany({
        where: where as any,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: { images: { where: { isPrimary: true }, take: 1 }, locations: { where: { isPrimary: true }, take: 1 }, rankings: { take: 3, orderBy: { year: "desc" } } },
      }),
      prisma.college.count({ where: where as any }),
    ]);

    const stats = await prisma.college.aggregate({
      _avg: { avgPackage: true, placementPercent: true, rating: true },
      _count: { id: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        colleges: colleges.map((c) => ({
          ...c,
          primaryImage: c.images[0] ?? null,
          primaryLocation: c.locations[0] ?? null,
          recentRankings: c.rankings,
        })),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        stats: {
          totalColleges: stats._count.id,
          avgPackage: Math.round(stats._avg.avgPackage ?? 0),
          avgPlacement: Math.round(stats._avg.placementPercent ?? 0),
          avgRating: Math.round((stats._avg.rating ?? 0) * 10) / 10,
        },
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
  }
}
