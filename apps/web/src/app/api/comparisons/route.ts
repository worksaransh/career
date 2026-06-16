import { NextResponse } from "next/server";
import { z } from "zod";
import { comparisonSchema } from "@career-os/validations";
import { compareItems, careerToComparisonItem, collegeToComparisonItem } from "@/lib/comparison";
import { prisma } from "@/lib/db/prisma/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = comparisonSchema.parse(body);
    const items = [];

    if (validated.type === "CAREER") {
      const careers = await prisma.career.findMany({ where: { id: { in: validated.itemIds } } });
      for (const career of careers) items.push(careerToComparisonItem(career));
    } else if (validated.type === "COLLEGE") {
      const colleges = await prisma.college.findMany({ where: { id: { in: validated.itemIds } } });
      for (const college of colleges) items.push(collegeToComparisonItem(college));
    }

    const result = compareItems(items);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", details: error.flatten().fieldErrors } }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
  }
}
