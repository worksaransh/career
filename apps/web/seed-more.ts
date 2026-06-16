import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

// Manually load environment variables from the root .env file
try {
  const possiblePaths = [
    path.resolve(__dirname, "../../.env"), // from apps/web/
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
  console.log("Seeding colleges, degrees, and scholarships...");

  // 1. Seed Degrees
  const degrees = [
    {
      name: "Bachelor of Technology in Computer Science",
      slug: "btech-computer-science",
      description: "A comprehensive 4-year program covering software engineering, algorithms, computer networks, database systems, and artificial intelligence.",
      duration: "4 Years",
      costTotal: 1000000,
      costTuition: 800000,
      costFees: 100000,
      costLiving: 100000,
      costCurrency: "INR",
      fiveYearReturn: 2500000,
      tenYearReturn: 6000000,
      lifetimeReturn: 30000000,
      breakEvenPeriod: 3,
      riskAdjustedScore: 9.2,
      aiResilience: 8.5,
      careerOutcomes: [
        { title: "Software Engineer", percentage: 70 },
        { title: "Systems Analyst", percentage: 15 },
        { title: "Product Manager", percentage: 10 }
      ],
      futureOpportunities: ["AI Engineer", "Blockchain Developer", "Cloud Solutions Architect"],
      requiredSubjects: ["Mathematics", "Physics", "Computer Science"],
      isActive: true,
    },
    {
      name: "Bachelor of Science in Data Science",
      slug: "bsc-data-science",
      description: "A 3-year interdisciplinary program focused on statistics, programming, machine learning, data mining, and big data technologies.",
      duration: "3 Years",
      costTotal: 600000,
      costTuition: 450000,
      costFees: 50000,
      costLiving: 100000,
      costCurrency: "INR",
      fiveYearReturn: 2000000,
      tenYearReturn: 5000000,
      lifetimeReturn: 25000000,
      breakEvenPeriod: 2,
      riskAdjustedScore: 8.9,
      aiResilience: 9.0,
      careerOutcomes: [
        { title: "Data Analyst", percentage: 55 },
        { title: "Data Scientist", percentage: 30 },
        { title: "Business Intelligence Developer", percentage: 10 }
      ],
      futureOpportunities: ["Machine Learning Engineer", "Quantitative Analyst", "Data Architect"],
      requiredSubjects: ["Mathematics", "Statistics"],
      isActive: true,
    },
    {
      name: "Master of Business Administration",
      slug: "mba",
      description: "A 2-year postgraduate program designed to develop business management and leadership capabilities with specializations in Finance, Marketing, and Strategy.",
      duration: "2 Years",
      costTotal: 1500000,
      costTuition: 1200000,
      costFees: 100000,
      costLiving: 200000,
      costCurrency: "INR",
      fiveYearReturn: 4000000,
      tenYearReturn: 9000000,
      lifetimeReturn: 45000000,
      breakEvenPeriod: 4,
      riskAdjustedScore: 8.5,
      aiResilience: 7.8,
      careerOutcomes: [
        { title: "Management Consultant", percentage: 40 },
        { title: "Investment Banker", percentage: 25 },
        { title: "Brand Manager", percentage: 20 }
      ],
      futureOpportunities: ["Chief Executive Officer", "Strategy Director", "Venture Capitalist"],
      requiredSubjects: ["Any Bachelor's Degree"],
      isActive: true,
    }
  ];

  for (const degree of degrees) {
    await prisma.degree.upsert({
      where: { slug: degree.slug },
      update: {},
      create: degree,
    });
  }
  console.log(`Created ${degrees.length} degrees.`);

  // 2. Seed Colleges & Scholarships
  const colleges = [
    {
      name: "Indian Institute of Technology Delhi",
      slug: "iit-delhi",
      description: "One of the premier public technical and research universities in India, offering world-class education in engineering and technology.",
      location: "New Delhi, Delhi",
      ranking: 2,
      feesTotal: 800000,
      feesTuition: 600000,
      feesLiving: 200000,
      feesCurrency: "INR",
      avgPackage: 1800000,
      highestPackage: 15000000,
      placementPercent: 96.5,
      topRecruiters: ["Google", "Microsoft", "Goldman Sachs", "McKinsey", "Amazon"],
      fiveYearReturn: 4500000,
      tenYearReturn: 12000000,
      lifetimeReturn: 60000000,
      breakEvenPeriod: 1,
      riskAdjustedScore: 9.8,
      rating: 4.8,
      reviewCount: 342,
      studentCount: 10000,
      studentFitScore: 92.0,
      similarColleges: ["iit-bombay", "iit-madras", "iit-kharagpur"],
      isActive: true,
      scholarships: {
        create: [
          {
            name: "IIT Delhi Merit-cum-Means Scholarship",
            amount: 100000,
            eligibility: "GPA above 7.0 and annual parental income below 4.5 LPA.",
            isMeritBased: true,
            isActive: true,
          }
        ]
      }
    },
    {
      name: "Birla Institute of Technology and Science Pilani",
      slug: "bits-pilani",
      description: "A leading private deemed university in India, renowned for its strong focus on undergraduate education in engineering, sciences, and management.",
      location: "Pilani, Rajasthan",
      ranking: 15,
      feesTotal: 1800000,
      feesTuition: 1500000,
      feesLiving: 300000,
      feesCurrency: "INR",
      avgPackage: 1500000,
      highestPackage: 6000000,
      placementPercent: 94.2,
      topRecruiters: ["Apple", "Uber", "Oracle", "Boston Consulting Group", "J.P. Morgan"],
      fiveYearReturn: 3500000,
      tenYearReturn: 9000000,
      lifetimeReturn: 48000000,
      breakEvenPeriod: 2,
      riskAdjustedScore: 9.1,
      rating: 4.6,
      reviewCount: 288,
      studentCount: 12000,
      studentFitScore: 89.5,
      similarColleges: ["bits-goa", "bits-hyderabad", "vit-vellore"],
      isActive: true,
      scholarships: {
        create: [
          {
            name: "BITS Pilani Merit-cum-Need Scholarship",
            amount: 150000,
            eligibility: "Top 20% in BITSAT or CGPA above 8.0.",
            isMeritBased: true,
            isActive: true,
          }
        ]
      }
    },
    {
      name: "University of Delhi",
      slug: "delhi-university",
      description: "A premier collegiate public central university established in 1922, known for its high standards in teaching and research across Arts, Commerce, and Sciences.",
      location: "Delhi, Delhi",
      ranking: 11,
      feesTotal: 60000,
      feesTuition: 30000,
      feesLiving: 30000,
      feesCurrency: "INR",
      avgPackage: 700000,
      highestPackage: 3500000,
      placementPercent: 82.0,
      topRecruiters: ["Deloitte", "KPMG", "EY", "PwC", "HDFC Bank"],
      fiveYearReturn: 1500000,
      tenYearReturn: 4000000,
      lifetimeReturn: 22000000,
      breakEvenPeriod: 1,
      riskAdjustedScore: 8.4,
      rating: 4.3,
      reviewCount: 915,
      studentCount: 80000,
      studentFitScore: 81.0,
      similarColleges: ["jawaharlal-nehru-university", "jamia-millia-islamia"],
      isActive: true,
      scholarships: {
        create: [
          {
            name: "Delhi University Single Girl Child Scholarship",
            amount: 25000,
            eligibility: "Only girl child enrolled in full-time postgraduate program.",
            isMeritBased: false,
            isActive: true,
          }
        ]
      }
    }
  ];

  for (const college of colleges) {
    const { scholarships, ...collegeData } = college;
    
    // Upsert the college
    const collegeRecord = await prisma.college.upsert({
      where: { slug: college.slug },
      update: {},
      create: collegeData,
    });

    // Create the scholarship if not exists
    if (scholarships && scholarships.create) {
      for (const scholarship of scholarships.create) {
        const existingScholarship = await prisma.scholarship.findFirst({
          where: {
            collegeId: collegeRecord.id,
            name: scholarship.name
          }
        });
        
        if (!existingScholarship) {
          await prisma.scholarship.create({
            data: {
              ...scholarship,
              collegeId: collegeRecord.id
            }
          });
        }
      }
    }
  }
  console.log(`Created ${colleges.length} colleges & scholarships.`);
  console.log("Database addition complete!");
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
