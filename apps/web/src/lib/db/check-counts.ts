import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const models = [
    "career", "careerResponsibility", "careerSalaryBenchmark",
    "learningResource", "skillCategory", "industry", "careerIndustry",
    "degree", "college", "collegeRanking", "collegeProgram",
    "scholarship", "certification", "skill", "company",
    "governmentExam", "interviewQuestion", "userCareerPath",
  ] as const;
  for (const m of models) {
    const count = await (prisma as any)[m].count();
    console.log(`${m}: ${count}`);
  }
}
main().catch(console.error).then(() => prisma.$disconnect());
