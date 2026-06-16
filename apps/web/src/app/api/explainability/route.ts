import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma/prisma";
import { generateCareerExplanation, generateCollegeExplanation } from "@/lib/explainability";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");
    if (!type || !id) {
      return NextResponse.json({ success: false, error: { code: "MISSING_PARAMS", message: "type and id required" } }, { status: 400 });
    }
    if (type === "CAREER") {
      const career = await prisma.career.findUnique({ where: { id } });
      if (!career) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Career not found" } }, { status: 404 });
      const explanation = generateCareerExplanation(career as any, 0, [], 75);
      return NextResponse.json({ success: true, data: explanation });
    }
    if (type === "COLLEGE") {
      const college = await prisma.college.findUnique({ where: { id } });
      if (!college) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "College not found" } }, { status: 404 });
      const explanation = generateCollegeExplanation(college);
      return NextResponse.json({ success: true, data: explanation });
    }
    return NextResponse.json({ success: false, error: { code: "INVALID_TYPE", message: "Unsupported type" } }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
  }
}
