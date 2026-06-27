import { NextResponse } from "next/server";
import { generateDynamicExplorerListingPage } from "@/lib/explorer";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = (searchParams.get("type") ?? "CAREER") as "CAREER" | "COLLEGE" | "DEGREE" | "SKILL";
    const search = searchParams.get("search") ?? "";

    if (!["CAREER", "COLLEGE", "DEGREE", "SKILL"].includes(type)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_TYPE", message: "Type must be CAREER, COLLEGE, DEGREE, or SKILL" } },
        { status: 400 },
      );
    }
    
    const page = await generateDynamicExplorerListingPage(type, search);
    return NextResponse.json({ success: true, data: page });
  } catch (error: any) {
    console.error("Explorer API error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Something went wrong" } },
      { status: 500 },
    );
  }
}
