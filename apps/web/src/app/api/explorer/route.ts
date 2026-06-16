import { NextResponse } from "next/server";
import { generateExplorerListingPage } from "@/lib/explorer";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = (searchParams.get("type") ?? "CAREER") as "CAREER" | "COLLEGE" | "DEGREE" | "SKILL";
    if (!["CAREER", "COLLEGE", "DEGREE", "SKILL"].includes(type)) {
      return NextResponse.json({ success: false, error: { code: "INVALID_TYPE", message: "Type must be CAREER, COLLEGE, DEGREE, or SKILL" } }, { status: 400 });
    }
    const page = generateExplorerListingPage(type);
    return NextResponse.json({ success: true, data: page });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
  }
}
