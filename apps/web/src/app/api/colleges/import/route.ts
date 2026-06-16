import { NextResponse } from "next/server";
import { getSession } from "@/lib/session/session";
import { importColleges, parseCSV, type CollegeImportRecord } from "@/lib/college-import";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const userId = session?.user?.id;
    const role = (session?.user as Record<string, unknown>)?.role;
    if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
      return NextResponse.json({ success: false, error: { code: "FORBIDDEN" } }, { status: 403 });
    }

    const contentType = request.headers.get("content-type") ?? "";
    let records: CollegeImportRecord[] = [];

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (!file || typeof file === "string") {
        return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "CSV file required" } }, { status: 400 });
      }
      const text = await (file as Blob).text();
      records = parseCSV(text);
    } else {
      const body = await request.json();
      if (body.csv) {
        records = parseCSV(body.csv);
      } else if (body.records) {
        records = body.records;
      } else {
        return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Provide csv string or records array" } }, { status: 400 });
      }
    }

    if (records.length === 0) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "No valid records found" } }, { status: 400 });
    }

    const result = await importColleges(records, userId ?? undefined, "api-import");

    return NextResponse.json({
      success: true,
      data: {
        total: records.length,
        imported: result.imported,
        skipped: result.skipped,
        errors: result.errors,
        skippedReasons: result.skippedReasons,
        errorDetails: result.errorDetails,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Import failed" } }, { status: 500 });
  }
}
