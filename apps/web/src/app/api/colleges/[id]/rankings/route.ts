import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma/prisma";

const rankingSchema = z.object({
  source: z.string().min(1).max(50),
  rank: z.number().int().positive(),
  score: z.number().min(0).max(100).optional(),
  year: z.number().int().min(2000).max(2030),
  category: z.string().default("OVERALL"),
});

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const rankings = await prisma.collegeRanking.findMany({
      where: { collegeId: params.id },
      orderBy: [{ year: "desc" }, { rank: "asc" }],
    });
    return NextResponse.json({ success: true, data: rankings });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR" } }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const validated = rankingSchema.parse(body);

    const ranking = await prisma.collegeRanking.upsert({
      where: {
        collegeId_source_year_category: {
          collegeId: params.id,
          source: validated.source,
          year: validated.year,
          category: validated.category,
        },
      },
      update: { rank: validated.rank, score: validated.score },
      create: { collegeId: params.id, ...validated },
    });

    return NextResponse.json({ success: true, data: ranking });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", details: error.flatten().fieldErrors } }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR" } }, { status: 500 });
  }
}
