import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

try {
  const possiblePaths = [
    path.resolve(__dirname, "../../../../../.env"),
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
          if (key && !key.startsWith("#")) process.env[key] = value;
        }
      });
      break;
    }
  }
} catch (e) {
  console.error("Failed to load env file:", e);
}

if (process.env.DIRECT_URL) {
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
      if (inQuotes && nextChar === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (char === "," && !inQuotes) { result.push(current.trim()); current = ""; }
    else { current += char; }
  }
  result.push(current.trim());
  return result;
}

function parseCsv(filePath: string): any[] {
  if (!fs.existsSync(filePath)) { console.warn(`File not found: ${filePath}`); return []; }
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
    header.forEach((colName, index) => { row[colName] = values[index] !== undefined ? values[index] : null; });
    result.push(row);
  }
  return result;
}

function parsePgArray(pgArrayStr: string | null): string[] {
  if (!pgArrayStr) return [];
  const trimmed = pgArrayStr.trim();
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) return trimmed ? [trimmed] : [];
  const inner = trimmed.slice(1, -1).trim();
  if (!inner) return [];
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < inner.length; i++) {
    const char = inner[i];
    if (char === '"') {
      if (inQuotes && inner[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (char === "," && !inQuotes) { result.push(current.trim()); current = ""; }
    else { current += char; }
  }
  result.push(current.trim());
  return result.map((s) => s.replace(/\\"/g, '"')).filter(Boolean);
}

function cleanNumber(val: string | null | undefined): number {
  if (!val) return 0;
  const num = parseFloat(val);
  return isNaN(num) ? 0 : num;
}

function slugify(val: string): string {
  return val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function runConcurrent(tasks: (() => Promise<any>)[], concurrency: number): Promise<void> {
  const active: Promise<void>[] = [];
  for (const task of tasks) {
    const p = task().then(() => { const idx = active.indexOf(p); if (idx >= 0) active.splice(idx, 1); });
    active.push(p);
    if (active.length >= concurrency) await Promise.race(active);
  }
  await Promise.all(active);
}

async function seedCareers() {
  console.log("\n=== Seeding Careers ===");
  const rows = parseCsv(path.join(CSV_DIR, "careers.csv"));
  console.log(`Found ${rows.length} careers`);
  const tasks = rows.map((row) => () => {
    const slug = row.career_code || slugify(row.title);
    const salaryEntry = Math.round(cleanNumber(row.salary_entry) * 100000);
    const salaryMid = Math.round(cleanNumber(row.salary_mid) * 100000);
    const salarySenior = Math.round(cleanNumber(row.salary_senior) * 100000);
    let demandLevel = "MEDIUM";
    const rd = (row.future_demand || "").toLowerCase();
    if (rd.includes("very high") || rd.includes("high")) demandLevel = "HIGH";
    else if (rd.includes("low")) demandLevel = "LOW";
    let aiRiskLevel = "MEDIUM";
    const ra = (row.ai_risk || "").toLowerCase();
    if (ra.includes("high")) aiRiskLevel = "HIGH";
    else if (ra.includes("low")) aiRiskLevel = "LOW";
    const topCompanies = parsePgArray(row.top_companies);
    const remoteOpp = cleanNumber(row.remote_opportunities) || (row.remote_possibility ? cleanNumber(row.remote_possibility) : 0);
    return prisma.career.upsert({
      where: { slug },
      update: {
        title: row.title, description: row.description || row.title,
        summary: row.day_to_day_summary || row.description || row.title,
        salaryEntry, salaryMid, salarySenior: salarySenior || salaryMid * 2,
        tenYearGrowthPercent: cleanNumber(row.growth_rate),
        demandLevel, aiRiskLevel, futureGrowthRate: cleanNumber(row.growth_rate),
        requiredSkills: parsePgArray(row.skills_required),
        recommendedDegrees: parsePgArray(row.degrees_accepted),
        certifications: parsePgArray(row.certifications),
        alternativeCareers: parsePgArray(row.alternatives),
        companiesHiring: topCompanies, remotePossibility: Math.round(remoteOpp),
        isActive: row.is_published === "t" || row.is_published === "true",
      },
      create: {
        title: row.title, slug, description: row.description || row.title,
        summary: row.day_to_day_summary || row.description || row.title,
        salaryEntry, salaryMid, salarySenior: salarySenior || salaryMid * 2,
        salaryCurrency: "INR", tenYearGrowthPercent: cleanNumber(row.growth_rate),
        demandLevel, aiRiskLevel, futureGrowthRate: cleanNumber(row.growth_rate),
        requiredSkills: parsePgArray(row.skills_required),
        recommendedDegrees: parsePgArray(row.degrees_accepted),
        certifications: parsePgArray(row.certifications),
        alternativeCareers: parsePgArray(row.alternatives),
        companiesHiring: topCompanies, remotePossibility: Math.round(remoteOpp),
        isActive: row.is_published === "t" || row.is_published === "true",
        seoMetadata: {},
      },
    });
  });
  const batches = [];
  for (let i = 0; i < tasks.length; i += 100) batches.push(tasks.slice(i, i + 100));
  let count = 0;
  for (const batch of batches) { await runConcurrent(batch, 8); count += batch.length; console.log(`  ${count}/${tasks.length} careers`); }
  console.log(`Seeded ${count} careers`);
}

async function seedCareerResponsibilities() {
  console.log("\n=== Seeding CareerResponsibilities ===");
  const rows = parseCsv(path.join(CSV_DIR, "career_responsibilities.csv"));
  console.log(`Found ${rows.length} responsibilities`);
  const careers = await prisma.career.findMany({ select: { id: true, slug: true } });
  const careerMap = new Map(careers.map(c => [c.id, c.slug]));
  const existing = await prisma.careerResponsibility.findMany({ select: { careerId: true, responsibility: true } });
  const existingSet = new Set(existing.map(e => `${e.careerId}:${e.responsibility}`));
  const data = rows.filter(r => r.career_id && careerMap.has(r.career_id) && !existingSet.has(`${r.career_id}:${r.responsibility}`))
    .map(r => ({ careerId: r.career_id, responsibility: r.responsibility, order: cleanNumber(r.display_order) }));
  if (data.length) {
    for (let i = 0; i < data.length; i += 500) {
      await prisma.careerResponsibility.createMany({ data: data.slice(i, i + 500), skipDuplicates: true });
    }
  }
  console.log(`Inserted ${data.length} responsibilities`);
}

async function seedCareerSalaryBenchmarks() {
  console.log("\n=== Seeding CareerSalaryBenchmarks ===");
  const rows = parseCsv(path.join(CSV_DIR, "career_salary_benchmarks.csv"));
  console.log(`Found ${rows.length} salary benchmarks`);
  const careers = await prisma.career.findMany({ select: { id: true } });
  const careerIds = new Set(careers.map(c => c.id));
  const existing = await prisma.careerSalaryBenchmark.findMany({ select: { careerId: true, country: true, experienceLevel: true, year: true } });
  const existingSet = new Set(existing.map(e => `${e.careerId}:${e.country}:${e.experienceLevel}:${e.year}`));
  const data = rows.filter(r => r.career_id && careerIds.has(r.career_id))
    .map(r => ({
      careerId: r.career_id,
      city: r.market_name || null,
      country: r.currency_code === "USD" ? "United States" : "India",
      experienceLevel: r.career_stage || "MID",
      salary: Math.round(cleanNumber(r.annual_median)),
      currency: r.currency_code || "INR",
      year: cleanNumber(r.as_of_year) || new Date().getFullYear(),
    })).filter(r => !existingSet.has(`${r.careerId}:${r.country}:${r.experienceLevel}:${r.year}`));
  if (data.length) {
    for (let i = 0; i < data.length; i += 500) {
      await prisma.careerSalaryBenchmark.createMany({ data: data.slice(i, i + 500), skipDuplicates: true });
    }
  }
  console.log(`Inserted ${data.length} salary benchmarks`);
}

async function seedCareerLearningResources() {
  console.log("\n=== Seeding LearningResources ===");
  const rows = parseCsv(path.join(CSV_DIR, "career_learning_resources.csv"));
  console.log(`Found ${rows.length} learning resources`);
  const careers = await prisma.career.findMany({ select: { id: true, slug: true } });
  const careerMap = new Map(careers.map(c => [c.id, c.slug]));
  const existing = await prisma.learningResource.findMany({ select: { url: true, careerId: true } });
  const existingSet = new Set(existing.map(e => `${e.careerId}:${e.url}`));
  const data = rows.filter(r => r.career_id && careerMap.has(r.career_id) && !existingSet.has(`${r.career_id}:${r.url}`))
    .map(r => ({
      careerId: r.career_id,
      title: r.title,
      url: r.url,
      platform: (r.provider || "").toUpperCase().replace(/[\s-]/g, "_") || "OTHER",
      type: (r.resource_type || "VIDEO").toUpperCase(),
      isFree: r.is_free === "t" || r.is_free === "true" || r.is_free === "1",
    }));
  if (data.length) {
    for (let i = 0; i < data.length; i += 500) {
      await prisma.learningResource.createMany({ data: data.slice(i, i + 500), skipDuplicates: true });
    }
  }
  console.log(`Inserted ${data.length} learning resources`);
}

async function seedSkillsAndIndustries() {
  console.log("\n=== Seeding Skills & Industries from Taxonomy ===");
  const terms = parseCsv(path.join(CSV_DIR, "career_taxonomy_terms.csv"));
  const links = parseCsv(path.join(CSV_DIR, "career_taxonomy_links.csv"));
  console.log(`Found ${terms.length} taxonomy terms, ${links.length} links`);

  const skills = terms.filter(t => (t.term_type || "").toLowerCase() === "skill");
  const industries = terms.filter(t => (t.term_type || "").toLowerCase() === "industry");
  const otherTerms = terms.filter(t => {
    const tt = (t.term_type || "").toLowerCase();
    return tt !== "skill" && tt !== "industry";
  });

  // Seed SkillCategories
  console.log(`Seeding ${skills.length} skills...`);
  const catMap = new Map<string, string>();
  const cats = [...new Set(skills.map(s => s.term_type || "General").filter(Boolean))];
  for (const cat of cats) {
    const slug = slugify(cat);
    const existingCat = await prisma.skillCategory.upsert({
      where: { slug },
      update: { name: cat },
      create: { name: cat, slug, description: `${cat} skills` },
    });
    catMap.set(cat, existingCat.id);
  }

  // Seed skills
  const existingSkills = await prisma.skill.findMany({ select: { name: true } });
  const existingSkillNames = new Set(existingSkills.map(s => s.name.toLowerCase()));
  const skillData = skills.filter(s => !existingSkillNames.has((s.name || "").toLowerCase()))
    .map(s => ({
      name: s.name,
      category: s.term_type || "General",
      categoryId: catMap.get(s.term_type) || null,
      description: s.description || s.name,
      difficulty: "MEDIUM",
      demand: "MEDIUM",
    }));
  if (skillData.length) {
    for (let i = 0; i < skillData.length; i += 200) {
      await prisma.skill.createMany({ data: skillData.slice(i, i + 200), skipDuplicates: true });
    }
  }
  console.log(`Inserted ${skillData.length} new skills`);
  const allSkills = await prisma.skill.findMany({ select: { id: true, name: true } });
  const skillMap = new Map(allSkills.map(s => [s.name.toLowerCase(), s.id]));

  // Seed Industries
  console.log(`Seeding ${industries.length} industries...`);
  const existingIndustries = await prisma.industry.findMany({ select: { slug: true } });
  const existingIndSlugs = new Set(existingIndustries.map(i => i.slug));
  const indData = industries.filter(i => slugify(i.name) && !existingIndSlugs.has(slugify(i.name)))
    .map(i => ({ name: i.name, slug: slugify(i.name), description: i.description || null }));
  for (const ind of indData) {
    await prisma.industry.upsert({ where: { slug: ind.slug }, update: ind, create: ind });
  }
  const allIndustries = await prisma.industry.findMany({ select: { id: true, name: true, slug: true } });
  const indMap = new Map(allIndustries.map(i => [i.slug, i.id]));

  // Seed Career-Industry links
  console.log("Seeding Career-Industry links...");
  const careers = await prisma.career.findMany({ select: { id: true, slug: true } });
  const careerIdMap = new Map(careers.map(c => [c.id, c.slug]));
  const existingLinks = await prisma.careerIndustry.findMany({ select: { careerId: true, industryId: true } });
  const existingLinkSet = new Set(existingLinks.map(l => `${l.careerId}:${l.industryId}`));
  const linkData: { careerId: string; industryId: string }[] = [];
  for (const link of links) {
    if (!link.career_id || !link.term_id) continue;
    const term = terms.find(t => t.id === link.term_id);
    if (!term) continue;
    const indId = indMap.get(slugify(term.name));
    if (indId && careerIdMap.has(link.career_id) && !existingLinkSet.has(`${link.career_id}:${indId}`)) {
      linkData.push({ careerId: link.career_id, industryId: indId });
    }
  }
  if (linkData.length) {
    for (let i = 0; i < linkData.length; i += 500) {
      await prisma.careerIndustry.createMany({ data: linkData.slice(i, i + 500), skipDuplicates: true });
    }
  }
  console.log(`Inserted ${linkData.length} career-industry links`);
}

async function seedDegrees() {
  console.log("\n=== Seeding Degrees ===");
  const rows = parseCsv(path.join(CSV_DIR, "degrees.csv"));
  console.log(`Found ${rows.length} degrees`);
  const existing = await prisma.degree.findMany({ select: { slug: true } });
  const existingSlugs = new Set(existing.map(d => d.slug));
  const tasks = rows.filter(r => {
    const slug = r.degree_code || slugify(r.name);
    return !existingSlugs.has(slug);
  }).map((row) => () => {
    const slug = row.degree_code || slugify(row.name);
    const costTotal = Math.round(cleanNumber(row.fee_max_inr) || cleanNumber(row.avg_fees));
    const costTuition = Math.round(cleanNumber(row.fee_min_inr) || cleanNumber(row.avg_fees));
    return prisma.degree.upsert({
      where: { slug },
      update: {
        name: row.name, description: row.description || row.name,
        duration: row.duration_years ? `${row.duration_years} Years` : "3 Years",
        costTotal, costTuition, costFees: 0, costLiving: 0,
        futureOpportunities: parsePgArray(row.career_tags),
        requiredSubjects: row.eligibility_summary ? [row.eligibility_summary] : [],
        isActive: row.is_published === "t" || row.is_published === "true",
      },
      create: {
        name: row.name, slug, description: row.description || row.name,
        duration: row.duration_years ? `${row.duration_years} Years` : "3 Years",
        costTotal, costTuition, costFees: 0, costLiving: 0, costCurrency: "INR",
        futureOpportunities: parsePgArray(row.career_tags),
        requiredSubjects: row.eligibility_summary ? [row.eligibility_summary] : [],
        isActive: row.is_published === "t" || row.is_published === "true",
        seoMetadata: {},
      },
    });
  });
  const batches = [];
  for (let i = 0; i < tasks.length; i += 50) batches.push(tasks.slice(i, i + 50));
  let count = 0;
  for (const batch of batches) { await runConcurrent(batch, 8); count += batch.length; console.log(`  ${count}/${tasks.length} degrees`); }
  console.log(`Seeded ${count} degrees`);
}

async function seedColleges() {
  console.log("\n=== Seeding Colleges ===");
  const rows = parseCsv(path.join(CSV_DIR, "colleges.csv"));
  console.log(`Found ${rows.length} colleges`);

  const placementRows = parseCsv(path.join(CSV_DIR, "college_placements.csv"));
  const placementMap = new Map<string, any>();
  for (const pl of placementRows) {
    if (!pl.college_id) continue;
    const existing = placementMap.get(pl.college_id);
    if (!existing || cleanNumber(pl.highest_package_inr) > cleanNumber(existing.highest_package_inr)) {
      placementMap.set(pl.college_id, pl);
    }
  }

  const rankingRows = parseCsv(path.join(CSV_DIR, "college_rankings.csv"));
  const rankingMap = new Map<string, number>();
  for (const rank of rankingRows) {
    if (!rank.college_id) continue;
    const r = parseInt(rank.rank);
    if (!isNaN(r)) rankingMap.set(rank.college_id, r);
  }

  const accreditationRows = parseCsv(path.join(CSV_DIR, "college_accreditations.csv"));
  const accreditationMap = new Map<string, any[]>();
  for (const acc of accreditationRows) {
    if (!acc.college_id) continue;
    const existing = accreditationMap.get(acc.college_id) || [];
    existing.push(acc);
    accreditationMap.set(acc.college_id, existing);
  }

  const existing = await prisma.college.findMany({ select: { slug: true } });
  const existingSlugs = new Set(existing.map(c => c.slug));

  const tasks = rows.filter(r => {
    const slug = r.college_code || slugify(r.name);
    return !existingSlugs.has(slug);
  }).map((row) => () => {
    const slug = row.college_code || slugify(row.name);
    const feesTotal = Math.round(cleanNumber(row.avg_fees));
    const location = row.city && row.state ? `${row.city}, ${row.state}` : row.city || row.state || "India";
    const pm = placementMap.get(row.id) || {};
    const avgPackage = Math.round(cleanNumber(pm.average_package_inr));
    const highestPackage = Math.round(cleanNumber(pm.highest_package_inr));
    const placementPercent = cleanNumber(pm.placement_rate);
    const topRecruiters = parsePgArray(pm.top_recruiters);
    const ranking = rankingMap.get(row.id) || cleanNumber(row.ranking) || 9999;
    const accreditations = (accreditationMap.get(row.id) || []).map(a => ({
      body: a.accreditation_body, name: a.accreditation_name, grade: a.grade,
      validFrom: a.valid_from, validUntil: a.valid_until,
    }));

    return prisma.college.upsert({
      where: { slug },
      update: {
        name: row.name, description: row.description || row.name, location, ranking,
        feesTotal, feesTuition: feesTotal, avgPackage: avgPackage || 400000,
        highestPackage: highestPackage || 1200000, placementPercent: placementPercent || 75.0,
        topRecruiters, ownership: row.type || null,
        accreditations: accreditations.length ? accreditations : undefined,
        isActive: row.is_published === "t" || row.is_published === "true",
      },
      create: {
        name: row.name, slug, description: row.description || row.name, location, ranking,
        feesTotal, feesTuition: feesTotal, feesLiving: 0, feesCurrency: "INR",
        avgPackage: avgPackage || 400000, highestPackage: highestPackage || 1200000,
        placementPercent: placementPercent || 75.0, topRecruiters,
        ownership: row.type || null, accreditations: accreditations.length ? accreditations : undefined,
        isActive: row.is_published === "t" || row.is_published === "true",
        seoMetadata: {},
      },
    });
  });
  const batches = [];
  for (let i = 0; i < tasks.length; i += 200) batches.push(tasks.slice(i, i + 200));
  let count = 0;
  for (const batch of batches) { await runConcurrent(batch, 8); count += batch.length; console.log(`  ${count}/${tasks.length} colleges`); }
  console.log(`Seeded ${count} colleges`);
}

async function seedCollegeRankings() {
  console.log("\n=== Seeding CollegeRankings ===");
  const rows = parseCsv(path.join(CSV_DIR, "college_rankings.csv"));
  console.log(`Found ${rows.length} ranking records`);
  const colleges = await prisma.college.findMany({ select: { id: true } });
  const collegeIds = new Set(colleges.map(c => c.id));
  const existing = await prisma.collegeRanking.findMany({ select: { collegeId: true, source: true, year: true, category: true } });
  const existingSet = new Set(existing.map(r => `${r.collegeId}:${r.source}:${r.year}:${r.category}`));
  const data = rows.filter(r => r.college_id && collegeIds.has(r.college_id))
    .map(r => ({
      collegeId: r.college_id,
      source: r.ranking_body || "NIRF",
      rank: cleanNumber(r.rank),
      score: r.score ? cleanNumber(r.score) : null,
      year: cleanNumber(r.ranking_year) || new Date().getFullYear(),
      category: r.ranking_category || "OVERALL",
    })).filter(r => !existingSet.has(`${r.collegeId}:${r.source}:${r.year}:${r.category}`));
  if (data.length) {
    for (let i = 0; i < data.length; i += 500) {
      await prisma.collegeRanking.createMany({ data: data.slice(i, i + 500), skipDuplicates: true });
    }
  }
  console.log(`Inserted ${data.length} rankings`);
}

async function seedCollegePrograms() {
  console.log("\n=== Seeding CollegePrograms ===");
  const rows = parseCsv(path.join(CSV_DIR, "college_degree_offerings.csv"));
  console.log(`Found ${rows.length} college-degree offerings`);
  const colleges = await prisma.college.findMany({ select: { id: true } });
  const collegeIds = new Set(colleges.map(c => c.id));
  const existing = await prisma.collegeProgram.findMany({ select: { collegeId: true, name: true } });
  const existingSet = new Set(existing.map(p => `${p.collegeId}:${p.name}`));
  const data = rows.filter(r => r.college_id && collegeIds.has(r.college_id))
    .map(r => ({
      collegeId: r.college_id,
      name: r.course_name || "Program",
      duration: r.duration_years ? `${r.duration_years} Years` : "3 Years",
      fees: Math.round(cleanNumber(r.annual_fee_inr) || cleanNumber(r.total_fee_inr)),
      seats: r.seats ? cleanNumber(r.seats) : null,
      eligibility: r.eligibility_notes || null,
      isActive: r.is_active === "t" || r.is_active === "true",
    })).filter(r => !existingSet.has(`${r.collegeId}:${r.name}`));
  if (data.length) {
    for (let i = 0; i < data.length; i += 500) {
      await prisma.collegeProgram.createMany({ data: data.slice(i, i + 500), skipDuplicates: true });
    }
  }
  console.log(`Inserted ${data.length} college programs`);
}

async function seedScholarships() {
  console.log("\n=== Seeding Scholarships ===");
  const rows = parseCsv(path.join(CSV_DIR, "college_scholarships.csv"));
  console.log(`Found ${rows.length} scholarship records`);
  const colleges = await prisma.college.findMany({ select: { id: true } });
  const collegeIds = new Set(colleges.map(c => c.id));
  const existing = await prisma.scholarship.findMany({ select: { collegeId: true, name: true } });
  const existingSet = new Set(existing.map(s => `${s.collegeId}:${s.name}`));
  const data = rows.filter(r => r.college_id && collegeIds.has(r.college_id))
    .map(r => ({
      collegeId: r.college_id,
      name: r.name || "College Scholarship",
      provider: r.scholarship_code || null,
      amount: Math.round(cleanNumber(r.award_value)),
      eligibility: r.eligibility || "Verify with the institution",
      applicationLink: r.application_url || null,
      deadline: r.deadline ? new Date(r.deadline) : null,
      isMeritBased: (r.scholarship_code || "").toLowerCase().includes("merit"),
      isNeedBased: (r.scholarship_code || "").toLowerCase().includes("need"),
      isActive: r.is_active === "t" || r.is_active === "true",
    })).filter(r => !existingSet.has(`${r.collegeId}:${r.name}`));
  if (data.length) {
    for (let i = 0; i < data.length; i += 500) {
      await prisma.scholarship.createMany({ data: data.slice(i, i + 500), skipDuplicates: true });
    }
  }
  console.log(`Inserted ${data.length} scholarships`);
}

async function seedCertifications() {
  console.log("\n=== Seeding Certifications ===");
  const rows = parseCsv(path.join(CSV_DIR, "education_certifications.csv"));
  console.log(`Found ${rows.length} certifications`);
  const existing = await prisma.certification.findMany({ select: { name: true } });
  const existingNames = new Set(existing.map(c => c.name.toLowerCase()));
  const data = rows.filter(r => !existingNames.has((r.name || "").toLowerCase()))
    .map(r => ({
      name: r.name, slug: r.certification_code || slugify(r.name),
      provider: r.provider || "Unknown",
      description: r.description || null,
      cost: 0, duration: r.validity_months ? `${r.validity_months} months` : "Self-paced",
      durationMonths: r.validity_months ? cleanNumber(r.validity_months) : null,
      skillsCovered: [],
      isActive: true,
    }));
  for (const cert of data) {
    await prisma.certification.upsert({
      where: { slug: cert.slug },
      update: cert,
      create: cert,
    });
  }
  console.log(`Inserted ${data.length} certifications`);
}

async function seedCareerDegreeLinks() {
  console.log("\n=== Seeding Career-Degree Links ===");
  const rows = parseCsv(path.join(CSV_DIR, "career_degree_links.csv"));
  console.log(`Found ${rows.length} career-degree links`);
  const careers = await prisma.career.findMany({ select: { id: true } });
  const degrees = await prisma.degree.findMany({ select: { id: true } });
  const careerIds = new Set(careers.map(c => c.id));
  const degreeIds = new Set(degrees.map(d => d.id));
  const existing = await prisma.careerSkillDemand.findMany({ select: { careerId: true, skillId: true } });
  const existingSet = new Set(existing.map(l => `${l.careerId}:${l.skillId}`));
}

async function main() {
  console.log("Starting full database seeding from CSV files...\n");
  const start = Date.now();

  // Verify DB connection
  await prisma.$connect();
  console.log("Database connected.\n");

  // Careers (801 rows)
  await seedCareers();

  // CareerResponsibilities (801 rows)
  await seedCareerResponsibilities();

  // CareerSalaryBenchmarks (4,806 rows)
  await seedCareerSalaryBenchmarks();

  // CareerLearningResources (1,602 rows)
  await seedCareerLearningResources();

  // Skills & Industries from taxonomy
  await seedSkillsAndIndustries();

  // Degrees (328 rows)
  await seedDegrees();

  // Colleges (5,204 rows)
  await seedColleges();

  // CollegeRankings (5,200 rows)
  await seedCollegeRankings();

  // CollegePrograms (15,600 rows)
  await seedCollegePrograms();

  // Scholarships (5,200 rows)
  await seedScholarships();

  // Certifications (20 rows)
  await seedCertifications();

  const elapsed = Math.round((Date.now() - start) / 1000);
  console.log(`\n=== Full seeding completed in ${elapsed}s ===`);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error("Seeding error:", e); await prisma.$disconnect(); process.exit(1); });
