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

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@careeros.ai" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@careeros.ai",
      role: "SUPER_ADMIN",
      onboardingStep: "COMPLETE",
      profileCompleteness: 100,
      profile: {
        create: {
          interests: ["Technology", "Education"],
          preferences: { theme: "system", language: "en" },
        },
      },
      subscriptions: {
        create: {
          tier: "UNIVERSITY",
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  console.log("Admin user created:", adminUser.email);

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@careeros.ai" },
    update: {},
    create: {
      name: "Demo Student",
      email: "demo@careeros.ai",
      role: "USER",
      onboardingStep: "COMPLETE",
      profileCompleteness: 47,
      profile: {
        create: {
          interests: ["Technology", "Science", "Engineering"],
          educationLevel: "HIGH_SCHOOL",
          currentGrade: "12",
          preferences: { theme: "system", language: "en", onboardingGoal: "EXPLORE_CAREERS" },
        },
      },
      subscriptions: {
        create: {
          tier: "FREE",
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  console.log("Demo user created:", demoUser.email);

  const careers = [
    {
      title: "Software Engineer",
      slug: "software-engineer",
      description: "Design, develop, and maintain software systems and applications. Work with cutting-edge technologies to solve complex problems.",
      summary: "Build the digital world with code",
      salaryEntry: 800000,
      salaryMid: 2500000,
      salarySenior: 5000000,
      demandLevel: "HIGH",
      aiRiskLevel: "LOW",
      futureGrowthRate: 25,
      requiredSkills: ["Python", "JavaScript", "Data Structures", "Algorithms", "System Design", "Cloud Computing"],
      certifications: ["AWS Certified Developer", "Google Cloud Engineer", "Meta Backend Developer"],
      isActive: true,
    },
    {
      title: "Data Scientist",
      slug: "data-scientist",
      description: "Analyze complex data sets to derive insights and drive business decisions using statistical methods and machine learning.",
      summary: "Turn data into actionable insights",
      salaryEntry: 1000000,
      salaryMid: 3000000,
      salarySenior: 6000000,
      demandLevel: "HIGH",
      aiRiskLevel: "LOW",
      futureGrowthRate: 28,
      requiredSkills: ["Python", "Machine Learning", "Statistics", "SQL", "Deep Learning", "Data Visualization"],
      certifications: ["TensorFlow Developer", "AWS ML Specialty", "Google Data Engineer"],
      isActive: true,
    },
    {
      title: "Product Manager",
      slug: "product-manager",
      description: "Define product vision, strategy, and roadmap. Work with engineering, design, and business teams to deliver successful products.",
      summary: "Lead product strategy and execution",
      salaryEntry: 1200000,
      salaryMid: 3500000,
      salarySenior: 7000000,
      demandLevel: "HIGH",
      aiRiskLevel: "LOW",
      futureGrowthRate: 18,
      requiredSkills: ["Product Strategy", "User Research", "Data Analysis", "Agile", "Communication", "Leadership"],
      certifications: ["PMP", "CSPO", "Product School Certification"],
      isActive: true,
    },
    {
      title: "Healthcare Professional",
      slug: "healthcare-professional",
      description: "Provide medical care, diagnose conditions, and treat patients. Includes doctors, nurses, and allied health professionals.",
      summary: "Save lives and improve health outcomes",
      salaryEntry: 600000,
      salaryMid: 1800000,
      salarySenior: 4000000,
      demandLevel: "HIGH",
      aiRiskLevel: "LOW",
      futureGrowthRate: 15,
      requiredSkills: ["Medical Knowledge", "Patient Care", "Diagnosis", "Communication", "Empathy"],
      certifications: ["MBBS", "BDS", "BAMS", "Nursing License"],
      isActive: true,
    },
    {
      title: "Graphic Designer",
      slug: "graphic-designer",
      description: "Create visual concepts to communicate ideas that inspire, inform, and captivate consumers through various media.",
      summary: "Bring ideas to life through design",
      salaryEntry: 300000,
      salaryMid: 800000,
      salarySenior: 1800000,
      demandLevel: "MEDIUM",
      aiRiskLevel: "MEDIUM",
      futureGrowthRate: 5,
      requiredSkills: ["Adobe Creative Suite", "Typography", "Color Theory", "UI/UX Design", "Motion Graphics"],
      certifications: ["Adobe Certified Professional", "Google UX Design"],
      isActive: true,
    },
  ];

  for (const career of careers) {
    await prisma.career.upsert({
      where: { slug: career.slug },
      update: {},
      create: career,
    });
  }

  console.log(`Created ${careers.length} careers`);

  const assessment = await prisma.assessment.upsert({
    where: { id: "d3b07384-d113-4ec5-a581-2292026d2c20" },
    update: {},
    create: {
      id: "d3b07384-d113-4ec5-a581-2292026d2c20",
      type: "INTEREST",
      title: "Interest Assessment",
      description: "Discover your career interests across different fields",
      timeEstimate: 10,
      language: "en",
      isActive: true,
      questions: {
        create: [
          {
            text: "I enjoy solving complex problems using logic and analysis.",
            order: 1,
            category: "Analytical",
            options: [
              { id: "ia-1-sa", text: "Strongly Agree", value: 5 },
              { id: "ia-1-a", text: "Agree", value: 4 },
              { id: "ia-1-n", text: "Neutral", value: 3 },
              { id: "ia-1-d", text: "Disagree", value: 2 },
              { id: "ia-1-sd", text: "Strongly Disagree", value: 1 },
            ],
          },
          {
            text: "I like working with people and helping others succeed.",
            order: 2,
            category: "Social",
            options: [
              { id: "ia-2-sa", text: "Strongly Agree", value: 5 },
              { id: "ia-2-a", text: "Agree", value: 4 },
              { id: "ia-2-n", text: "Neutral", value: 3 },
              { id: "ia-2-d", text: "Disagree", value: 2 },
              { id: "ia-2-sd", text: "Strongly Disagree", value: 1 },
            ],
          },
          {
            text: "I am creative and enjoy expressing myself through art or design.",
            order: 3,
            category: "Creative",
            options: [
              { id: "ia-3-sa", text: "Strongly Agree", value: 5 },
              { id: "ia-3-a", text: "Agree", value: 4 },
              { id: "ia-3-n", text: "Neutral", value: 3 },
              { id: "ia-3-d", text: "Disagree", value: 2 },
              { id: "ia-3-sd", text: "Strongly Disagree", value: 1 },
            ],
          },
          {
            text: "I am interested in how things work and enjoy building or fixing them.",
            order: 4,
            category: "Technical",
            options: [
              { id: "ia-4-sa", text: "Strongly Agree", value: 5 },
              { id: "ia-4-a", text: "Agree", value: 4 },
              { id: "ia-4-n", text: "Neutral", value: 3 },
              { id: "ia-4-d", text: "Disagree", value: 2 },
              { id: "ia-4-sd", text: "Strongly Disagree", value: 1 },
            ],
          },
          {
            text: "I enjoy leading teams and taking responsibility for outcomes.",
            order: 5,
            category: "Leadership",
            options: [
              { id: "ia-5-sa", text: "Strongly Agree", value: 5 },
              { id: "ia-5-a", text: "Agree", value: 4 },
              { id: "ia-5-n", text: "Neutral", value: 3 },
              { id: "ia-5-d", text: "Disagree", value: 2 },
              { id: "ia-5-sd", text: "Strongly Disagree", value: 1 },
            ],
          },
        ],
      },
    },
  });

  console.log("Assessment created:", assessment.title);

  const cmsContent = [
    { key: "hero-title", section: "home", type: "TEXT", value: "See Your Future Before You Decide", language: "en" },
    { key: "hero-subtitle", section: "home", type: "TEXT", value: "AI-powered career guidance for students and professionals", language: "en" },
    { key: "hero-banner", section: "home", type: "IMAGE", value: "/images/hero-banner.jpg", language: "en" },
    { key: "hero-cta", section: "home", type: "TEXT", value: "Discover Your Future", language: "en" },
  ];

  for (const content of cmsContent) {
    await prisma.cMSContent.upsert({
      where: { key_language: { key: content.key, language: content.language } },
      update: {},
      create: content,
    });
  }

  console.log(`Created ${cmsContent.length} CMS content entries`);
  console.log("Seeding complete!");
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
