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

function slugify(val: string): string {
  return val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
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
        where: { slug },
        update: exam,
        create: { ...exam, slug, description: `${exam.name} - ${exam.conductingBody}`, isActive: true, seoMetadata: {} },
      });
      count++;
    } catch (e: any) { console.error(`Failed: ${exam.name}: ${e.message}`); }
  }
  console.log(`Created ${count} government exams`);
}

async function generateInterviewQuestions() {
  console.log("\n=== Generating Interview Questions ===");
  const careers = await prisma.career.findMany({ where: { isActive: true }, select: { id: true, title: true } });
  const existing = await prisma.interviewQuestion.count();
  console.log(`Existing: ${existing}, generating for ${careers.length} careers`);

  const template = {
    technical: [
      "What skills and experience make you a good fit for this role?",
      "How do you approach troubleshooting a complex problem?",
      "Describe your experience with industry-standard tools and technologies.",
      "How do you ensure quality in your work?",
      "Tell me about a project you're proud of.",
      "What technical certifications do you hold?",
      "How do you stay current with industry developments?",
      "Describe your most challenging technical project.",
      "What methodologies do you follow in your work?",
      "How do you handle technical debt?",
    ],
    behavioral: [
      "Tell me about a time you worked under pressure.",
      "Describe a conflict you resolved at work.",
      "How do you prioritize your tasks?",
      "Tell me about a time you failed and what you learned.",
      "Describe a situation where you went above and beyond.",
      "How do you handle feedback?",
      "Tell me about a time you led a team.",
      "Describe a situation where you had to learn something quickly.",
      "How do you deal with difficult stakeholders?",
      "Tell me about a time you innovated or improved a process.",
    ],
    hr: [
      "Why are you interested in this role?",
      "What are your career goals?",
      "Tell me about yourself.",
      "What do you know about our company?",
      "Do you have any questions for us?",
      "What is your expected salary?",
      "Why are you leaving your current job?",
      "What are your greatest strengths?",
      "What areas do you want to improve?",
      "Where do you see yourself in 5 years?",
    ],
    case_study: [
      "How would you approach improving a declining business unit?",
      "Design a solution for a common industry problem.",
      "Analyze this market scenario and recommend a strategy.",
      "How would you handle a budget cut to your department?",
      "Create a 90-day plan for this role.",
    ],
  };

  let count = 0;
  const allTypes = ["TECHNICAL", "BEHAVIORAL", "HR", "CASE_STUDY"] as const;
  for (const career of careers) {
    for (const type of allTypes) {
      const questions = template[type.toLowerCase() as keyof typeof template] || template.technical;
      for (let i = 0; i < questions.length; i++) {
        try {
          await prisma.interviewQuestion.create({
            data: {
              careerId: career.id,
              type,
              question: questions[i],
              difficulty: "MEDIUM",
              category: type,
              order: i,
              isActive: true,
            },
          });
          count++;
        } catch { /* unique constraint or duplicate - skip */ }
      }
    }
  }
  console.log(`Created ${count} interview questions`);
}

async function seedCareerCompanyLinks() {
  console.log("\n=== Seeding Career-Company Links ===");
  const careers = await prisma.career.findMany({ select: { id: true, companiesHiring: true } });
  const companies = await prisma.company.findMany({ select: { id: true, name: true } });
  const companyNameMap = new Map(companies.map(c => [c.name.toLowerCase(), c.id]));

  const existing = await prisma.careerCompany.findMany({ select: { careerId: true, companyId: true } });
  const existingSet = new Set(existing.map(l => `${l.careerId}:${l.companyId}`));

  const data: { careerId: string; companyId: string }[] = [];
  for (const career of careers) {
    if (!career.companiesHiring?.length) continue;
    for (const name of career.companiesHiring) {
      const companyId = companyNameMap.get(name.toLowerCase());
      if (!companyId || existingSet.has(`${career.id}:${companyId}`)) continue;
      data.push({ careerId: career.id, companyId });
      existingSet.add(`${career.id}:${companyId}`);
    }
  }
  if (data.length) {
    for (let i = 0; i < data.length; i += 500) {
      await prisma.careerCompany.createMany({ data: data.slice(i, i + 500), skipDuplicates: true });
    }
  }
  console.log(`Created ${data.length} career-company links`);
}

async function main() {
  const start = Date.now();
  await generateGovernmentExams();
  await generateInterviewQuestions();
  await seedCareerCompanyLinks();
  const elapsed = Math.round((Date.now() - start) / 1000);
  console.log(`\n=== Remaining seeding completed in ${elapsed}s ===`);
  
  const counts: Record<string, number> = {};
  const models = ["career", "careerResponsibility", "careerSalaryBenchmark", "learningResource", "skillCategory", "industry", "careerIndustry", "degree", "college", "collegeRanking", "collegeProgram", "scholarship", "certification", "skill", "company", "governmentExam", "interviewQuestion", "careerCompany", "careerSkillDemand"];
  for (const m of models) { counts[m] = await (prisma as any)[m].count(); }
  console.log("\nFinal counts:", JSON.stringify(counts, null, 2));
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
