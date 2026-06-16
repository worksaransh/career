import { NextResponse } from "next/server";
import { getOutcomesForCareer, predictOutcomes, compareOutcomes } from "@/lib/outcomes";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const career = searchParams.get("career");
    const compare = searchParams.get("compare");
    if (compare) {
      const careers = compare.split(",").map((c) => c.trim());
      const data = compareOutcomes(careers);
      return NextResponse.json({ success: true, data });
    }
    if (career) {
      const outcome = getOutcomesForCareer(career);
      const prediction = predictOutcomes(career);
      return NextResponse.json({ success: true, data: { outcome, prediction } });
    }
    return NextResponse.json({ success: false, error: { code: "MISSING_PARAMS", message: "Provide career or compare parameter" } }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
  }
}
