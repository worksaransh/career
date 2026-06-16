import { prisma } from "@/lib/db/prisma/prisma";

export interface CollegeImportRecord {
  name?: string;
  slug?: string;
  description?: string;
  location?: string;
  city?: string;
  state?: string;
  ranking?: number;
  feesTotal?: number;
  feesTuition?: number;
  feesLiving?: number;
  avgPackage?: number;
  highestPackage?: number;
  placementPercent?: number;
  topRecruiters?: string;
  rating?: number;
  studentCount?: number;
  establishedYear?: number;
  ownership?: string;
  accreditation?: string;
  affiliatedTo?: string;
  website?: string;
  collegeType?: string;
  [key: string]: unknown;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: number;
  skippedReasons: { index: number; reason: string }[];
  errorDetails: { index: number; error: string }[];
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100);
}

function splitAndTrim(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function importColleges(
  records: CollegeImportRecord[],
  userId?: string,
  fileName?: string,
): Promise<ImportResult> {
  const batch = await prisma.importBatch.create({
    data: {
      fileName: fileName ?? "manual-import.csv",
      type: "COLLEGE",
      totalRecords: records.length,
      status: "PROCESSING",
      userId: userId ?? null,
    },
  });

  const result: ImportResult = { imported: 0, skipped: 0, errors: 0, skippedReasons: [], errorDetails: [] };

  for (let i = 0; i < records.length; i++) {
    const record = records[i]!;
    try {
      if (!record.name || record.name.trim().length === 0) {
        result.skipped++;
        result.skippedReasons.push({ index: i, reason: "Missing name" });
        continue;
      }

      const name = record.name.trim();
      const slug = record.slug || generateSlug(name);

      const cleanedRecruiters = splitAndTrim(record.topRecruiters as string | undefined);
      const feesTotal = Math.abs(record.feesTotal ?? 0);
      const feesTuition = Math.abs(record.feesTuition ?? Math.round(feesTotal * 0.7));
      const feesLiving = Math.abs(record.feesLiving ?? Math.round(feesTotal * 0.3));

      const existing = await prisma.college.findFirst({
        where: {
          OR: [{ slug }, { name }],
        },
      });

      if (existing) {
        await prisma.college.update({
          where: { id: existing.id },
          data: {
            description: record.description ?? existing.description,
            location: record.location ?? existing.location,
            ranking: record.ranking ?? existing.ranking,
            feesTotal,
            feesTuition,
            feesLiving,
            avgPackage: record.avgPackage ?? existing.avgPackage,
            highestPackage: record.highestPackage ?? existing.highestPackage,
            placementPercent: record.placementPercent ?? existing.placementPercent,
            topRecruiters: cleanedRecruiters.length > 0 ? cleanedRecruiters : existing.topRecruiters,
            rating: record.rating ?? existing.rating,
            studentCount: record.studentCount ?? existing.studentCount,
          },
        });
        result.skipped++;
        result.skippedReasons.push({ index: i, reason: `Updated existing: ${name}` });
        continue;
      }

      await prisma.college.create({
        data: {
          name,
          slug,
          description: record.description ?? `${name} is a prestigious educational institution.`,
          location: record.location ?? (record.city as string) ?? (record.state as string) ?? "India",
          ranking: record.ranking ?? 9999,
          feesTotal,
          feesTuition,
          feesLiving,
          avgPackage: record.avgPackage ?? 0,
          highestPackage: record.highestPackage ?? 0,
          placementPercent: record.placementPercent ?? 0,
          topRecruiters: cleanedRecruiters,
          rating: record.rating ?? 0,
          studentCount: record.studentCount ?? 0,
          seoMetadata: {
            establishedYear: record.establishedYear as number | undefined,
            ownership: record.ownership as string | undefined,
            accreditation: splitAndTrim(record.accreditation as string | undefined),
            affiliatedTo: record.affiliatedTo as string | undefined,
            website: record.website as string | undefined,
            collegeType: record.collegeType as string | undefined,
          },
        },
      });
      result.imported++;
    } catch (error) {
      result.errors++;
      result.errorDetails.push({
        index: i,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  await prisma.importBatch.update({
    where: { id: batch.id },
    data: {
      status: result.errors > 0 ? "COMPLETED_WITH_ERRORS" : "COMPLETED",
      importedRecords: result.imported,
      skippedRecords: result.skipped,
      errorRecords: result.errors,
      errors: result.errorDetails as any,
      completedAt: new Date(),
    },
  });

  return result;
}

export function parseCSV(text: string): CollegeImportRecord[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0]!.split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
  const records: CollegeImportRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]!);
    if (values.length !== headers.length) continue;
    const record: CollegeImportRecord = {};
    headers.forEach((h, idx) => {
      const val = values[idx]?.replace(/^["']|["']$/g, "").trim() ?? "";
      const key = h.replace(/\s+/g, "").replace(/^[a-z]/, (c) => c.toLowerCase());
      if (val !== "") {
        const numVal = Number(val);
        record[key] = isNaN(numVal) ? val : numVal;
      }
    });
    records.push(record);
  }
  return records;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

export function exportCollegesToCSV(colleges: Record<string, unknown>[]): string {
  const headers = [
    "name", "slug", "description", "location", "city", "state", "ranking",
    "feesTotal", "feesTuition", "feesLiving", "avgPackage", "highestPackage",
    "placementPercent", "topRecruiters", "rating", "studentCount",
    "establishedYear", "ownership", "accreditation", "affiliatedTo", "website", "collegeType",
  ];
  const rows = [headers.join(",")];
  for (const c of colleges) {
    const seo = (c.seoMetadata ?? {}) as Record<string, unknown>;
    const recruiters = c.topRecruiters as string[] | undefined;
    const row = [
      csvEscape(String(c.name ?? "")),
      csvEscape(String(c.slug ?? "")),
      csvEscape(String(c.description ?? "")),
      csvEscape(String(c.location ?? "")),
      csvEscape(String((seo.city as string) ?? "")),
      "",
      String(c.ranking ?? ""),
      String(c.feesTotal ?? ""),
      String(c.feesTuition ?? ""),
      String(c.feesLiving ?? ""),
      String(c.avgPackage ?? ""),
      String(c.highestPackage ?? ""),
      String(c.placementPercent ?? ""),
      csvEscape((recruiters?.join(";")) ?? ""),
      String(c.rating ?? ""),
      String(c.studentCount ?? ""),
      String(seo.establishedYear ?? ""),
      csvEscape(String((seo.ownership as string) ?? "")),
      csvEscape(String(((seo.accreditation as string[]) ?? []).join(";"))),
      csvEscape(String((seo.affiliatedTo as string) ?? "")),
      csvEscape(String((seo.website as string) ?? "")),
      csvEscape(String((seo.collegeType as string) ?? "")),
    ];
    rows.push(row.join(","));
  }
  return rows.join("\n");
}

function csvEscape(val: string): string {
  if (val.includes(",") || val.includes("\n") || val.includes('"')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export function generateAIPlaceholderImage(collegeName: string, type: string): string {
  return `/api/college-image-placeholder?name=${encodeURIComponent(collegeName)}&type=${encodeURIComponent(type)}`;
}
