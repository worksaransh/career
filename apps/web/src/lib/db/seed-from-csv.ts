import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

// Manually load environment variables from the root .env file
try {
  const possiblePaths = [
    path.resolve(__dirname, "../../../../../.env"), // from apps/web/src/lib/db/
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "../../.env"),
  ];

  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      const envConfig = fs.readFileSync(envPath, "utf-8");
      envConfig.split("\n").forEach((line) => {
        const parts = line.split("=");
        if (parts.length >= 2) {
          const key = parts[0]?.trim();
          const value = parts.slice(1).join("=").trim().replace(/^["']|["']$/g, "");
          if (key && !key.startsWith("#")) {
            process.env[key] = value;
          }
        }
      });
      console.log(`Loaded environment from: ${envPath}`);
      break;
    }
  }
} catch (e) {
  console.error("Failed to load env file:", e);
}

// Crucial optimization: use DIRECT_URL for seeding to bypass PgBouncer connection limits
if (process.env.DIRECT_URL) {
  console.log("Setting DATABASE_URL to DIRECT_URL for high-speed seeding...");
  process.env.DATABASE_URL = process.env.DIRECT_URL;
}

const prisma = new PrismaClient();

const CSV_DIR = path.resolve("d:/CODE/Career/bundle/database/csv");

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped double quote
        current += '"';
        i++; // skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsv(filePath: string): any[] {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return [];
  }
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split(/\r?\n/);
  if (lines.length === 0) return [];
  const header = parseCsvLine(lines[0] || "");

  const result: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine) continue;
    const line = rawLine.trim();
    if (!line) continue;
    const values = parseCsvLine(line);
    const row: any = {};
    header.forEach((colName, index) => {
      row[colName] = values[index] !== undefined ? values[index] : null;
    });
    result.push(row);
  }
  return result;
}

function parsePgArray(pgArrayStr: string | null): string[] {
  if (!pgArrayStr) return [];
  const trimmed = pgArrayStr.trim();
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) {
    return trimmed ? [trimmed] : [];
  }
  const inner = trimmed.slice(1, -1).trim();
  if (!inner) return [];

  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < inner.length; i++) {
    const char = inner[i];
    if (char === '"') {
      if (inQuotes && inner[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result.map((s) => s.replace(/\\"/g, '"')).filter(Boolean);
}

function cleanNumber(val: string | null | undefined): number {
  if (!val) return 0;
  const num = parseFloat(val);
  return isNaN(num) ? 0 : num;
}

// Concurrency helper to run promises in bounded batches
async function runConcurrent<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number
): Promise<T[]> {
  const results: T[] = [];
  const activePromises: Promise<any>[] = [];
  
  for (const task of tasks) {
    const p = task().then((res) => {
      // Remove self from active list when finished
      activePromises.splice(activePromises.indexOf(p), 1);
      results.push(res);
    });
    activePromises.push(p);
    if (activePromises.length >= concurrency) {
      await Promise.race(activePromises);
    }
  }
  
  await Promise.all(activePromises);
  return results;
}

async function main() {
  console.log("Starting full database seeding from CSV files with high-concurrency settings...");

  // 1. Careers
  console.log("Parsing careers.csv...");
  const careerRows = parseCsv(path.join(CSV_DIR, "careers.csv"));
  console.log(`Found ${careerRows.length} careers. Seeding to database...`);
  
  const careerTasks = careerRows.map((row) => () => {
    const slug = row.career_code || row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const salaryEntry = Math.round(cleanNumber(row.salary_entry) * 100000);
    const salaryMid = Math.round(cleanNumber(row.salary_mid) * 100000);
    const salarySenior = Math.round(cleanNumber(row.salary_senior) * 100000);
    const demandIndex = cleanNumber(row.demand_index);

    let demandLevel = "MEDIUM";
    const rawDemand = (row.future_demand || "").toLowerCase();
    if (rawDemand.includes("very high") || rawDemand.includes("high")) demandLevel = "HIGH";
    else if (rawDemand.includes("low")) demandLevel = "LOW";

    let aiRiskLevel = "MEDIUM";
    const rawRisk = (row.ai_risk || "").toLowerCase();
    if (rawRisk.includes("high")) aiRiskLevel = "HIGH";
    else if (rawRisk.includes("low")) aiRiskLevel = "LOW";

    return prisma.career.upsert({
      where: { slug },
      update: {
        title: row.title,
        description: row.description || row.title,
        summary: row.day_to_day_summary || row.description || row.title,
        salaryEntry,
        salaryMid,
        salarySenior: salarySenior || salaryMid * 2,
        tenYearGrowthPercent: cleanNumber(row.growth_rate) || demandIndex,
        demandLevel,
        aiRiskLevel,
        futureGrowthRate: cleanNumber(row.growth_rate) || demandIndex,
        requiredSkills: parsePgArray(row.skills_required),
        recommendedDegrees: parsePgArray(row.degrees_accepted),
        certifications: parsePgArray(row.certifications),
        alternativeCareers: parsePgArray(row.alternatives),
        isActive: row.is_published === "t" || row.is_published === "true",
      },
      create: {
        id: row.id,
        title: row.title,
        slug,
        description: row.description || row.title,
        summary: row.day_to_day_summary || row.description || row.title,
        salaryEntry,
        salaryMid,
        salarySenior: salarySenior || salaryMid * 2,
        salaryCurrency: "INR",
        tenYearGrowthPercent: cleanNumber(row.growth_rate) || demandIndex,
        demandLevel,
        aiRiskLevel,
        futureGrowthRate: cleanNumber(row.growth_rate) || demandIndex,
        requiredSkills: parsePgArray(row.skills_required),
        recommendedDegrees: parsePgArray(row.degrees_accepted),
        certifications: parsePgArray(row.certifications),
        alternativeCareers: parsePgArray(row.alternatives),
        isActive: row.is_published === "t" || row.is_published === "true",
        seoMetadata: {},
      },
    });
  });

  console.log("Executing career upserts in parallel batches of 8...");
  let completedCareers = 0;
  const careerBatches = [];
  for (let i = 0; i < careerTasks.length; i += 100) {
    const chunk = careerTasks.slice(i, i + 100);
    careerBatches.push(chunk);
  }

  for (let idx = 0; idx < careerBatches.length; idx++) {
    const batch = careerBatches[idx];
    if (!batch) continue;
    await runConcurrent(batch, 8);
    completedCareers += batch.length;
    console.log(`  Seeded ${completedCareers}/${careerTasks.length} careers...`);
  }
  console.log(`Seeded ${careerTasks.length} careers successfully.`);

  // 2. Degrees
  console.log("Parsing degrees.csv...");
  const degreeRows = parseCsv(path.join(CSV_DIR, "degrees.csv"));
  console.log(`Found ${degreeRows.length} degrees. Seeding to database...`);
  
  const degreeTasks = degreeRows.map((row) => () => {
    const slug = row.degree_code || row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const costTotal = Math.round(cleanNumber(row.fee_max_inr) || cleanNumber(row.avg_fees));
    const costTuition = Math.round(cleanNumber(row.fee_min_inr) || cleanNumber(row.avg_fees));

    return prisma.degree.upsert({
      where: { slug },
      update: {
        name: row.name,
        description: row.description || row.name,
        duration: row.duration_years ? `${row.duration_years} Years` : "3 Years",
        costTotal,
        costTuition,
        costFees: 0,
        costLiving: 0,
        futureOpportunities: parsePgArray(row.career_tags),
        requiredSubjects: row.eligibility_summary ? [row.eligibility_summary] : [],
        isActive: row.is_published === "t" || row.is_published === "true",
      },
      create: {
        id: row.id,
        name: row.name,
        slug,
        description: row.description || row.name,
        duration: row.duration_years ? `${row.duration_years} Years` : "3 Years",
        costTotal,
        costTuition,
        costFees: 0,
        costLiving: 0,
        costCurrency: "INR",
        futureOpportunities: parsePgArray(row.career_tags),
        requiredSubjects: row.eligibility_summary ? [row.eligibility_summary] : [],
        isActive: row.is_published === "t" || row.is_published === "true",
        seoMetadata: {},
      },
    });
  });

  console.log("Executing degree upserts in parallel batches of 8...");
  let completedDegrees = 0;
  const degreeBatches = [];
  for (let i = 0; i < degreeTasks.length; i += 100) {
    const chunk = degreeTasks.slice(i, i + 100);
    degreeBatches.push(chunk);
  }

  for (let idx = 0; idx < degreeBatches.length; idx++) {
    const batch = degreeBatches[idx];
    if (!batch) continue;
    await runConcurrent(batch, 8);
    completedDegrees += batch.length;
    console.log(`  Seeded ${completedDegrees}/${degreeTasks.length} degrees...`);
  }
  console.log(`Seeded ${degreeTasks.length} degrees successfully.`);

  // 3. Colleges
  console.log("Parsing colleges.csv...");
  const collegeRows = parseCsv(path.join(CSV_DIR, "colleges.csv"));
  console.log(`Found ${collegeRows.length} colleges. Seeding to database...`);

  // Load placement data mapping by college_id
  console.log("Loading placements CSV...");
  const placementRows = parseCsv(path.join(CSV_DIR, "college_placements.csv"));
  const placementMap = new Map<string, any>();
  for (const pl of placementRows) {
    if (!pl.college_id) continue;
    const existing = placementMap.get(pl.college_id);
    if (!existing || cleanNumber(pl.highest_package_inr) > cleanNumber(existing.highest_package_inr)) {
      placementMap.set(pl.college_id, pl);
    }
  }

  // Load rankings data mapping by college_id
  console.log("Loading rankings CSV...");
  const rankingRows = parseCsv(path.join(CSV_DIR, "college_rankings.csv"));
  const rankingMap = new Map<string, number>();
  for (const rank of rankingRows) {
    if (!rank.college_id) continue;
    const rankNum = parseInt(rank.rank);
    if (!isNaN(rankNum)) {
      rankingMap.set(rank.college_id, rankNum);
    }
  }

  const collegeTasks = collegeRows.map((row) => () => {
    const slug = row.college_code || row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const feesTotal = Math.round(cleanNumber(row.avg_fees));
    const location = row.city && row.state ? `${row.city}, ${row.state}` : row.city || row.state || "India";

    // Lookup placement metrics
    const pm = placementMap.get(row.id) || {};
    const avgPackage = Math.round(cleanNumber(pm.average_package_inr));
    const highestPackage = Math.round(cleanNumber(pm.highest_package_inr));
    const placementPercent = cleanNumber(pm.placement_rate);
    const topRecruiters = parsePgArray(pm.top_recruiters);

    // Lookup ranking
    const ranking = rankingMap.get(row.id) || cleanNumber(row.ranking) || 9999;

    return prisma.college.upsert({
      where: { slug },
      update: {
        name: row.name,
        description: row.description || row.name,
        location,
        ranking,
        feesTotal,
        feesTuition: feesTotal,
        avgPackage: avgPackage || 400000,
        highestPackage: highestPackage || 1200000,
        placementPercent: placementPercent || 75.0,
        topRecruiters,
        isActive: row.is_published === "t" || row.is_published === "true",
      },
      create: {
        id: row.id,
        name: row.name,
        slug,
        description: row.description || row.name,
        location,
        ranking,
        feesTotal,
        feesTuition: feesTotal,
        feesLiving: 0,
        feesCurrency: "INR",
        avgPackage: avgPackage || 400000,
        highestPackage: highestPackage || 1200000,
        placementPercent: placementPercent || 75.0,
        topRecruiters,
        isActive: row.is_published === "t" || row.is_published === "true",
        seoMetadata: {},
      },
    });
  });

  console.log("Executing college upserts in parallel batches of 8...");
  let completedColleges = 0;
  const collegeBatches = [];
  for (let i = 0; i < collegeTasks.length; i += 200) {
    const chunk = collegeTasks.slice(i, i + 200);
    collegeBatches.push(chunk);
  }

  for (let idx = 0; idx < collegeBatches.length; idx++) {
    const batch = collegeBatches[idx];
    if (!batch) continue;
    await runConcurrent(batch, 8);
    completedColleges += batch.length;
    console.log(`  Seeded ${completedColleges}/${collegeTasks.length} colleges...`);
  }
  console.log(`Seeded ${collegeTasks.length} colleges successfully.`);

  // 4. Scholarships
  console.log("Parsing college_scholarships.csv...");
  const scholarshipRows = parseCsv(path.join(CSV_DIR, "college_scholarships.csv"));
  console.log(`Found ${scholarshipRows.length} scholarships. Seeding to database...`);
  
  console.log("Clearing existing scholarships first...");
  await prisma.scholarship.deleteMany({});
  
  let scholarshipCount = 0;
  const activeCollegeIds = new Set((await prisma.college.findMany({ select: { id: true } })).map((c) => c.id));

  const scholarshipData = [];
  for (const row of scholarshipRows) {
    if (!row.college_id || !activeCollegeIds.has(row.college_id)) continue;
    
    scholarshipData.push({
      id: row.id,
      collegeId: row.college_id,
      name: row.name || "College Scholarship",
      amount: Math.round(cleanNumber(row.award_value)),
      eligibility: row.eligibility || "Verify with the institution",
      isMeritBased: (row.scholarship_code || "").includes("merit"),
      isActive: row.is_active === "t" || row.is_active === "true",
    });
  }

  console.log(`Inserting ${scholarshipData.length} valid scholarships in batches of 1000...`);
  const batchSize = 1000;
  for (let i = 0; i < scholarshipData.length; i += batchSize) {
    const batch = scholarshipData.slice(i, i + batchSize);
    await prisma.scholarship.createMany({ data: batch });
    scholarshipCount += batch.length;
    console.log(`  Seeded ${scholarshipCount}/${scholarshipData.length} scholarships...`);
  }

  console.log(`Seeded ${scholarshipCount} scholarships successfully.`);
  console.log("Full database seeding from CSV files completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seeding error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
