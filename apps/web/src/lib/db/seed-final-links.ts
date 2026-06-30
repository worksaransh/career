import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const careers = await prisma.career.findMany({ select: { id: true, companiesHiring: true, requiredSkills: true } });
  const companies = await prisma.company.findMany({ select: { id: true, name: true } });
  const skills = await prisma.skill.findMany({ select: { id: true, name: true } });

  // Career-Company links
  const nameMap = new Map(companies.map(c => [c.name.toLowerCase(), c.id]));
  const existing = await prisma.careerCompany.findMany({ select: { careerId: true, companyId: true } });
  const existingSet = new Set(existing.map(l => `${l.careerId}:${l.companyId}`));
  const data1: { careerId: string; companyId: string }[] = [];
  for (const c of careers) {
    if (!c.companiesHiring?.length) continue;
    for (const name of c.companiesHiring) {
      const cid = nameMap.get(name.toLowerCase());
      if (cid && !existingSet.has(`${c.id}:${cid}`)) data1.push({ careerId: c.id, companyId: cid });
    }
  }
  console.log(`CareerCompany to insert: ${data1.length}`);
  for (let i = 0; i < data1.length; i += 500) {
    await prisma.careerCompany.createMany({ data: data1.slice(i, i + 500), skipDuplicates: true });
  }

  // Career-Skill demand links
  const skillNameMap = new Map(skills.map(s => [s.name.toLowerCase(), s.id]));
  const existing2 = await prisma.careerSkillDemand.findMany({ select: { careerId: true, skillId: true } });
  const existingSet2 = new Set(existing2.map(l => `${l.careerId}:${l.skillId}`));
  const data2: { careerId: string; skillId: string; demandScore: number; growthRate: number }[] = [];
  for (const c of careers) {
    if (!c.requiredSkills?.length) continue;
    for (const name of c.requiredSkills) {
      const sid = skillNameMap.get(name.toLowerCase());
      if (sid && !existingSet2.has(`${c.id}:${sid}`)) data2.push({ careerId: c.id, skillId: sid, demandScore: 0.5, growthRate: 0 });
    }
  }
  console.log(`CareerSkillDemand to insert: ${data2.length}`);
  for (let i = 0; i < data2.length; i += 500) {
    await prisma.careerSkillDemand.createMany({ data: data2.slice(i, i + 500), skipDuplicates: true });
  }

  // Final counts
  const models = ["career", "careerResponsibility", "careerSalaryBenchmark", "learningResource", "skillCategory", "industry", "careerIndustry", "careerCompany", "careerSkillDemand", "degree", "college", "collegeRanking", "collegeProgram", "scholarship", "certification", "skill", "company", "governmentExam", "interviewQuestion", "userCareerPath"];
  for (const m of models) {
    console.log(`${m}: ${await (prisma as any)[m].count()}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
