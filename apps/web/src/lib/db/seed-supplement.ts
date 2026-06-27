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
} catch (e) { console.error(e); }

if (process.env.DIRECT_URL) process.env.DATABASE_URL = process.env.DIRECT_URL;
const prisma = new PrismaClient();
const CSV_DIR = path.resolve("d:/CODE/Career/bundle/database/csv");

function parseCsvLine(line: string): string[] {
  const result: string[] = []; let current = ""; let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i], nextChar = line[i + 1];
    if (char === '"') { if (inQuotes && nextChar === '"') { current += '"'; i++; } else { inQuotes = !inQuotes; } }
    else if (char === "," && !inQuotes) { result.push(current.trim()); current = ""; }
    else { current += char; }
  }
  result.push(current.trim()); return result;
}
function parseCsv(filePath: string): any[] {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split(/\r?\n/);
  if (lines.length === 0) return [];
  const header = parseCsvLine(lines[0] || "");
  const result: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i]; if (!rawLine) continue;
    const line = rawLine.trim(); if (!line) continue;
    const values = parseCsvLine(line);
    const row: any = {};
    header.forEach((colName, index) => { row[colName] = values[index] !== undefined ? values[index] : null; });
    result.push(row);
  }
  return result;
}
function cleanNumber(val: string | null | undefined): number {
  if (!val) return 0; const num = parseFloat(val); return isNaN(num) ? 0 : num;
}
function slugify(val: string): string {
  return val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function seedSkillsFromTaxonomy() {
  console.log("\n=== Seeding Skills from Taxonomy ===");
  const terms = parseCsv(path.join(CSV_DIR, "career_taxonomy_terms.csv"));
  const skillTerms = terms.filter(t => ["technical_skill", "soft_skill", "interest"].includes(t.term_type));
  console.log(`Found ${skillTerms.length} skill terms`);

  const existing = await prisma.skill.findMany({ select: { name: true } });
  const existingNames = new Set(existing.map(s => s.name.toLowerCase()));

  const categories = ["Technical", "Soft Skill", "Interest"];
  const catMap = new Map<string, string>();
  for (const cat of categories) {
    const slug = slugify(cat);
    const c = await prisma.skillCategory.upsert({
      where: { slug }, update: { name: cat }, create: { name: cat, slug, description: `${cat} skills` },
    });
    catMap.set(cat, c.id);
  }

  const newSkills = skillTerms.filter(s => !existingNames.has((s.name || "").toLowerCase()));
  let count = 0;
  for (const s of newSkills) {
    const cat = s.term_type === "technical_skill" ? "Technical" : s.term_type === "soft_skill" ? "Soft Skill" : "Interest";
    try {
      await prisma.skill.create({
        data: {
          name: s.name, category: cat, categoryId: catMap.get(cat) || null,
          description: s.description || s.name, difficulty: "MEDIUM", demand: "MEDIUM",
        },
      });
      count++;
    } catch { /* duplicate */ }
  }
  console.log(`Created ${count} new skills`);
}

async function seedCertificationsFromTaxonomy() {
  console.log("\n=== Seeding Certifications from Taxonomy ===");
  const terms = parseCsv(path.join(CSV_DIR, "career_taxonomy_terms.csv"));
  const certTerms = terms.filter(t => t.term_type === "certification");
  console.log(`Found ${certTerms.length} certification terms`);

  const existing = await prisma.certification.findMany({ select: { name: true } });
  const existingNames = new Set(existing.map(c => c.name.toLowerCase()));
  let count = 0;
  for (const c of certTerms) {
    if (existingNames.has((c.name || "").toLowerCase())) continue;
    try {
      await prisma.certification.create({
        data: {
          name: c.name, slug: c.slug || slugify(c.name),
          provider: c.provider || "Unknown", cost: 0, duration: "Varies",
          description: c.description || null, skillsCovered: [], isActive: true,
        },
      });
      count++;
    } catch { /* duplicate */ }
  }
  console.log(`Created ${count} new certifications`);
}

async function seedCompaniesFromRecruiters() {
  console.log("\n=== Seeding Companies from Recruiters ===");
  const terms = parseCsv(path.join(CSV_DIR, "career_taxonomy_terms.csv"));
  const recruiterTerms = terms.filter(t => t.term_type === "recruiter");
  console.log(`Found ${recruiterTerms.length} recruiter/company terms`);

  const existing = await prisma.company.findMany({ select: { slug: true } });
  const existingSlugs = new Set(existing.map(c => c.slug));
  let count = 0;
  for (const r of recruiterTerms) {
    const slug = r.slug || slugify(r.name);
    if (existingSlugs.has(slug)) continue;
    try {
      await prisma.company.create({
        data: { name: r.name, slug, description: r.description || null, isActive: true },
      });
      count++;
      existingSlugs.add(slug);
    } catch { /* duplicate */ }
  }
  console.log(`Created ${count} companies`);
}

async function seedCareerCompanyLinks() {
  console.log("\n=== Seeding Career-Company Links ===");
  const careers = await prisma.career.findMany({ select: { id: true, companiesHiring: true } });
  const companies = await prisma.company.findMany({ select: { id: true, name: true } });
  const companyNameMap = new Map(companies.map(c => [c.name.toLowerCase(), c.id]));
  const existing = await prisma.careerCompany.findMany({ select: { careerId: true, companyId: true } });
  const existingSet = new Set(existing.map(l => `${l.careerId}:${l.companyId}`));
  let count = 0;
  for (const career of careers) {
    if (!career.companiesHiring?.length) continue;
    for (const name of career.companiesHiring) {
      const companyId = companyNameMap.get(name.toLowerCase());
      if (!companyId || existingSet.has(`${career.id}:${companyId}`)) continue;
      try {
        await prisma.careerCompany.create({ data: { careerId: career.id, companyId } });
        count++;
        existingSet.add(`${career.id}:${companyId}`);
      } catch { /* skip */ }
    }
  }
  console.log(`Created ${count} career-company links`);
}

async function seedCareerSkillDemand() {
  console.log("\n=== Seeding Career-Skill Demand Links ===");
  const careers = await prisma.career.findMany({ select: { id: true, requiredSkills: true } });
  const skills = await prisma.skill.findMany({ select: { id: true, name: true } });
  const skillNameMap = new Map(skills.map(s => [s.name.toLowerCase(), s.id]));
  const existing = await prisma.careerSkillDemand.findMany({ select: { careerId: true, skillId: true } });
  const existingSet = new Set(existing.map(l => `${l.careerId}:${l.skillId}`));
  let count = 0;
  for (const career of careers) {
    if (!career.requiredSkills?.length) continue;
    for (const name of career.requiredSkills) {
      const skillId = skillNameMap.get(name.toLowerCase());
      if (!skillId || existingSet.has(`${career.id}:${skillId}`)) continue;
      try {
        await prisma.careerSkillDemand.create({ data: { careerId: career.id, skillId, demandScore: 0.5, growthRate: 0 } });
        count++;
        existingSet.add(`${career.id}:${skillId}`);
      } catch { /* skip */ }
    }
  }
  console.log(`Created ${count} career-skill demand links`);
}

async function generateGovernmentExams() {
  console.log("\n=== Generating Government Exams ===");
  const existing = await prisma.governmentExam.count();
  if (existing > 0) { console.log(`Already have ${existing} exams, skipping`); return; }
  const exams = [
    { name: "UPSC Civil Services Exam", conductingBody: "Union Public Service Commission", eligibility: "Bachelor's degree from recognized university, Age 21-32 years", examPattern: "Prelims (MCQ) + Mains (Written) + Interview", salary: "₹56,100 - ₹2,50,000 per month", growthProspect: "Career progression up to Cabinet Secretary level", competition: "~1 million applicants for ~1,000 positions", timeline: "18-24 months preparation typically required", applicationFee: 100 },
    { name: "SSC CGL", conductingBody: "Staff Selection Commission", eligibility: "Bachelor's degree from recognized university", examPattern: "Tier I (MCQ) + Tier II (MCQ) + Tier III (Descriptive) + Skill Test", salary: "₹35,000 - ₹1,50,000 per month", growthProspect: "Promotion to higher grades with experience", competition: "~2 million applicants for ~7,000 positions", timeline: "12-18 months preparation", applicationFee: 100 },
    { name: "IBPS PO", conductingBody: "Institute of Banking Personnel Selection", eligibility: "Bachelor's degree, Age 20-30 years", examPattern: "Prelims (MCQ) + Mains (MCQ + Descriptive) + Interview", salary: "₹50,000 - ₹1,20,000 per month", growthProspect: "Promotion to Branch Manager and above", competition: "~1.5 million applicants for ~4,000 positions", timeline: "12 months preparation", applicationFee: 175 },
    { name: "GATE", conductingBody: "IITs and IISc", eligibility: "Bachelor's degree in Engineering/Technology/Science", examPattern: "MCQ + MSQ + NAT questions", salary: "Post-GATE: M.Tech stipend ₹12,400/month, PSU jobs ₹60,000-1,20,000/month", growthProspect: "Entry to PSUs, M.Tech from IITs, higher education", competition: "~1 million applicants", timeline: "12 months preparation", applicationFee: 1500 },
    { name: "NEET PG", conductingBody: "National Board of Examinations", eligibility: "MBBS degree from recognized medical college", examPattern: "MCQ based computer-based test", salary: "₹80,000 - ₹2,00,000 per month (Junior Resident)", growthProspect: "Specialization to Senior Resident to Consultant", competition: "~200,000 applicants for ~50,000 seats", timeline: "12 months preparation", applicationFee: 3750 },
    { name: "CAT", conductingBody: "IIMs", eligibility: "Bachelor's degree with 50% marks (45% for SC/ST)", examPattern: "VARC + DILR + QA (MCQ + TITA)", salary: "Post-MBA: ₹25-35 LPA average", growthProspect: "Management roles in corporates, consulting, finance", competition: "~250,000 applicants for ~5,000 IIM seats", timeline: "12-18 months preparation", applicationFee: 2400 },
    { name: "UGC NET", conductingBody: "National Testing Agency", eligibility: "Master's degree with 55% marks", examPattern: "Paper I (Teaching Aptitude) + Paper II (Subject)", salary: "Assistant Professor: ₹57,700 - ₹1,82,400 per month", growthProspect: "Associate Professor to Professor", competition: "~1 million applicants for ~50,000 positions", timeline: "6-12 months preparation", applicationFee: 1000 },
    { name: "RRB NTPC", conductingBody: "Railway Recruitment Board", eligibility: "10th/12th/Bachelor's degree depending on position", examPattern: "CBT I + CBT II + Typing/Skill Test", salary: "₹25,000 - ₹85,000 per month", growthProspect: "Career progression up to Railway Board level", competition: "~2 million applicants for ~35,000 positions", timeline: "12 months preparation", applicationFee: 500 },
    { name: "CTET", conductingBody: "Central Board of Secondary Education", eligibility: "Senior Secondary (50%) + D.Ed/B.Ed", examPattern: "MCQ based computer-based test", salary: "₹35,000 - ₹80,000 per month (Primary/Secondary Teacher)", growthProspect: "PRT → TGT → PGT → Principal", competition: "~500,000 applicants for ~50,000 positions", timeline: "3-6 months preparation", applicationFee: 1000 },
    { name: "CLAT", conductingBody: "Consortium of NLUs", eligibility: "12th with 45% marks (40% for SC/ST)", examPattern: "English + GK + Legal Reasoning + Logical Reasoning + Mathematics", salary: "Post-LLB: ₹6-18 LPA (corporate law)", growthProspect: "Lawyer → Senior Advocate → Judge", competition: "~100,000 applicants for ~3,000 NLU seats", timeline: "12 months preparation", applicationFee: 4000 },
    { name: "CDS", conductingBody: "Union Public Service Commission", eligibility: "Bachelor's degree (Unmarried, Age 19-25 years)", examPattern: "English + GK + Elementary Mathematics + SSB Interview", salary: "₹56,100 - ₹2,50,000 per month", growthProspect: "Commissioned Officer → Major → Colonel → General", competition: "~200,000 applicants for ~400 positions", timeline: "12-18 months preparation", applicationFee: 200 },
    { name: "NDA", conductingBody: "Union Public Service Commission", eligibility: "12th pass (Unmarried, Age 16.5-19.5 years)", examPattern: "Mathematics + GK + SSB Interview", salary: "₹56,100 - ₹2,50,000 per month (starting as Officer)", growthProspect: "Career progression to highest military ranks", competition: "~500,000 applicants for ~400 positions", timeline: "12 months preparation", applicationFee: 100 },
    { name: "LIC AAO", conductingBody: "Life Insurance Corporation of India", eligibility: "Bachelor's degree, Age 21-30 years", examPattern: "Prelims + Mains + Interview", salary: "₹40,000 - ₹1,00,000 per month", growthProspect: "AAO → AO → Manager → Senior Manager", competition: "~500,000 applicants for ~500 positions", timeline: "6-12 months preparation", applicationFee: 700 },
    { name: "SEBI Grade A", conductingBody: "Securities and Exchange Board of India", eligibility: "Bachelor's/Master's degree, Age 30 years max", examPattern: "Phase I + Phase II + Interview", salary: "₹60,000 - ₹1,40,000 per month", growthProspect: "Officer → Assistant Manager → Deputy Manager → Manager", competition: "~150,000 applicants for ~50 positions", timeline: "12-18 months preparation", applicationFee: 1000 },
    { name: "RBI Grade B", conductingBody: "Reserve Bank of India", eligibility: "Bachelor's degree with 60% marks, Age 21-30 years", examPattern: "Phase I + Phase II + Interview", salary: "₹78,000 - ₹2,00,000 per month", growthProspect: "Grade B → Grade A → Executive Director → Governor", competition: "~200,000 applicants for ~150 positions", timeline: "12-18 months preparation", applicationFee: 850 },
  ];
  let count = 0;
  for (const exam of exams) {
    const slug = slugify(exam.name);
    try {
      await prisma.governmentExam.upsert({
        where: { slug }, update: exam, create: { ...exam, slug, description: `${exam.name} - ${exam.conductingBody}`, isActive: true, seoMetadata: {} },
      });
      count++;
    } catch (e: any) { console.error(`Failed to create ${exam.name}: ${e.message}`); }
  }
  console.log(`Created ${count} government exams`);
}

async function generateInterviewQuestions() {
  console.log("\n=== Generating Interview Questions ===");
  const careers = await prisma.career.findMany({ where: { isActive: true }, select: { id: true, title: true }, take: 50 });
  const existing = await prisma.interviewQuestion.count();
  if (existing > 5000) { console.log(`Already have ${existing} questions, skipping`); return; }

  const questionTemplates: Record<string, { technical: string[]; behavioral: string[]; hr: string[] }> = {
    "Software Engineer": {
      technical: [
        "Explain the difference between REST and GraphQL APIs.",
        "How does garbage collection work in Java?",
        "Describe your experience with microservices architecture.",
        "What is the time complexity of quicksort in the worst case?",
        "How do you handle database migrations in production?",
      ],
      behavioral: [
        "Tell me about a time you had to refactor a large codebase.",
        "Describe a situation where you disagreed with a technical decision.",
        "How do you stay updated with the latest technology trends?",
        "Tell me about a challenging bug you resolved.",
        "Describe a project where you collaborated with cross-functional teams.",
      ],
      hr: ["Why do you want to work here?", "Where do you see yourself in 5 years?", "What is your expected salary?", "Why are you leaving your current job?", "What are your greatest strengths and weaknesses?"],
    },
  };
  const defaultQuestions = {
    technical: [
      "What skills and experience make you a good fit for this role?",
      "How do you approach troubleshooting a complex problem?",
      "Describe your experience with industry-standard tools and technologies.",
      "How do you ensure quality in your work?",
      "Tell me about a project you're proud of.",
    ],
    behavioral: [
      "Tell me about a time you worked under pressure.",
      "Describe a conflict you resolved at work.",
      "How do you prioritize your tasks?",
      "Tell me about a time you failed and what you learned.",
      "Describe a situation where you went above and beyond.",
    ],
    hr: [
      "Why are you interested in this role?",
      "What are your career goals?",
      "Tell me about yourself.",
      "What do you know about our company?",
      "Do you have any questions for us?",
    ],
  };

  const questionTypes = ["TECHNICAL", "BEHAVIORAL", "HR", "CASE_STUDY"];
  let count = 0;
  for (const career of careers) {
    const templates = questionTemplates[career.title] || defaultQuestions;
    const allQuestions = [
      ...templates.technical.map((q: string) => ({ type: "TECHNICAL", question: q })),
      ...templates.behavioral.map((q: string) => ({ type: "BEHAVIORAL", question: q })),
      ...templates.hr.map((q: string) => ({ type: "HR", question: q })),
    ];
    for (let i = 0; i < allQuestions.length; i++) {
      const q = allQuestions[i];
      const exists = await prisma.interviewQuestion.findFirst({ where: { careerId: career.id, question: q.question } });
      if (exists) continue;
      try {
        await prisma.interviewQuestion.create({
          data: { careerId: career.id, type: q.type, question: q.question, difficulty: "MEDIUM", category: q.type, order: i, isActive: true },
        });
        count++;
      } catch { /* skip */ }
    }
  }
  console.log(`Created ${count} interview questions`);
}

async function generateMoreColleges() {
  console.log("\n=== Generating Additional College Data ===");
  const currentCount = await prisma.college.count();
  const target = 25000;
  if (currentCount >= target) { console.log(`Already have ${currentCount} colleges`); return; }
  console.log(`Have ${currentCount} colleges, generating synthetic data to reach ${target}...`);
}

async function main() {
  const start = Date.now();
  await seedSkillsFromTaxonomy();
  await seedCertificationsFromTaxonomy();
  await seedCompaniesFromRecruiters();
  await seedCareerCompanyLinks();
  await seedCareerSkillDemand();
  await generateGovernmentExams();
  await generateInterviewQuestions();
  const elapsed = Math.round((Date.now() - start) / 1000);
  console.log(`\n=== Supplemental seeding completed in ${elapsed}s ===`);
}
main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
