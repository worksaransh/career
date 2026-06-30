import { PrismaClient } from "@prisma/client";
try {
  const possiblePaths = [
    __dirname + "/../../../../../.env", __dirname + "/../../../../.env",
    process.cwd() + "/.env", process.cwd() + "/../../.env",
  ];
  const fs = require("fs");
  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      const envConfig = fs.readFileSync(envPath, "utf-8");
      envConfig.split("\n").forEach((line: string) => {
        const parts = line.split("=");
        if (parts.length >= 2) { const key = parts[0]?.trim(); const value = parts.slice(1).join("=").trim().replace(/^["']|["']$/g, ""); if (key && !key.startsWith("#")) process.env[key] = value; }
      });
      break;
    }
  }
} catch (e) {}

if (process.env.DIRECT_URL) process.env.DATABASE_URL = process.env.DIRECT_URL;
const prisma = new PrismaClient();

const template = {
  TECHNICAL: [
    "What skills and experience make you a good fit for this role?",
    "How do you approach troubleshooting a complex problem?",
    "Describe your experience with industry-standard tools.",
    "How do you ensure quality in your work?",
    "Tell me about a project you're proud of.",
    "What certifications do you hold relevant to this role?",
    "How do you stay current with industry developments?",
    "Describe your most challenging project.",
    "What methodologies do you follow in your work?",
    "How do you optimize your workflow for efficiency?",
  ],
  BEHAVIORAL: [
    "Tell me about a time you worked under pressure.",
    "Describe a conflict you resolved at work.",
    "How do you prioritize tasks?",
    "Tell me about a time you failed and what you learned.",
    "Describe a time you went above and beyond.",
    "How do you handle constructive feedback?",
    "Tell me about a time you led a team.",
    "Describe learning something quickly for a project.",
    "How do you deal with difficult stakeholders?",
    "Tell me about a time you innovated or improved a process.",
  ],
  HR: [
    "Why are you interested in this role?",
    "What are your career goals?",
    "Tell me about yourself.",
    "What do you know about our company?",
    "Do you have any questions for us?",
    "What is your expected salary?",
    "Why are you leaving your current role?",
    "What are your greatest strengths?",
    "What areas do you want to improve?",
    "Where do you see yourself in 5 years?",
  ],
  CASE_STUDY: [
    "How would you approach improving a declining business unit?",
    "Design a solution for a common industry challenge.",
    "Analyze this scenario and recommend a strategy.",
    "How would you handle a budget reduction?",
    "Create a 90-day plan for succeeding in this role.",
  ],
};

async function main() {
  const careers = await prisma.career.findMany({ where: { isActive: true }, select: { id: true } });
  console.log(`Generating questions for ${careers.length} careers...`);

  // Delete existing interview questions to do a clean bulk insert
  const existingCount = await prisma.interviewQuestion.count();
  if (existingCount > 10000) { console.log(`Already have ${existingCount}, skipping`); return; }

  const data: { careerId: string; type: string; question: string; difficulty: string; category: string; order: number; isActive: boolean }[] = [];
  for (const career of careers) {
    for (const [type, questions] of Object.entries(template)) {
      questions.forEach((q, i) => {
        data.push({ careerId: career.id, type, question: q, difficulty: "MEDIUM", category: type, order: i, isActive: true });
      });
    }
  }
  console.log(`Total questions to insert: ${data.length}`);

  // Batch insert in chunks of 1000
  let count = 0;
  for (let i = 0; i < data.length; i += 1000) {
    const chunk = data.slice(i, i + 1000);
    await prisma.interviewQuestion.createMany({ data: chunk, skipDuplicates: true });
    count += chunk.length;
    console.log(`  ${count}/${data.length}`);
  }
  console.log(`Created ${count} interview questions`);
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
