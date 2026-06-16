import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== DATABASE DIAGNOSTICS ===");
  try {
    const [
      careers,
      degrees,
      colleges,
      skills,
      certifications,
      scholarships,
      hiringCompanies,
      dailyQuestions,
      userEngagements,
      systemSettings,
    ] = await Promise.all([
      prisma.career.count(),
      prisma.degree.count(),
      prisma.college.count(),
      prisma.skill.count(),
      prisma.certification.count(),
      prisma.scholarship.count(),
      prisma.hiringCompany.count(),
      prisma.dailyQuestion.count(),
      prisma.userEngagement.count(),
      prisma.systemSetting.count(),
    ]);

    console.log(`Careers: ${careers}`);
    console.log(`Degrees: ${degrees}`);
    console.log(`Colleges: ${colleges}`);
    console.log(`Skills: ${skills}`);
    console.log(`Certifications: ${certifications}`);
    console.log(`Scholarships: ${scholarships}`);
    console.log(`Hiring Companies: ${hiringCompanies}`);
    console.log(`Daily Questions: ${dailyQuestions}`);
    console.log(`User Engagements: ${userEngagements}`);
    console.log(`System Settings: ${systemSettings}`);

    // If Skill table is empty, show a sample of raw skills from Career table to see if they exist
    if (skills === 0) {
      const sampleCareers = await prisma.career.findMany({
        take: 5,
        select: { requiredSkills: true }
      });
      const uniqueSkills = new Set(sampleCareers.flatMap(c => c.requiredSkills));
      console.log(`Unique skills sample from Career: ${Array.from(uniqueSkills).join(", ")}`);
    }

  } catch (err) {
    console.error("Diagnostics error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
