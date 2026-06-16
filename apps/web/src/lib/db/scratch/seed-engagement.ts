import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DAILY_QUESTIONS = [
  { text: "Do you enjoy solving complex logic puzzles?", options: ["Yes, very much", "Sometimes", "Not really"], category: "Analytical" },
  { text: "Do you like mentoring or helping others solve their problems?", options: ["Yes", "Maybe", "No"], category: "Social" },
  { text: "Do you enjoy creating digital art, drawings, or layouts?", options: ["Strongly Agree", "Agree", "Disagree"], category: "Creative" },
  { text: "Are you interested in coding, scripting, or hardware configurations?", options: ["Yes, definitely", "Curious about it", "Not at all"], category: "Technical" },
  { text: "Do you enjoy managing team activities or organizing events?", options: ["Yes", "Neutral", "No"], category: "Leadership" }
];

const HIRING_COMPANIES = [
  { name: "Google", logoUrl: "https://logo.clearbit.com/google.com", careers: ["software-engineer", "data-scientist", "product-manager"] },
  { name: "Microsoft", logoUrl: "https://logo.clearbit.com/microsoft.com", careers: ["software-engineer", "data-scientist"] },
  { name: "Deloitte", logoUrl: "https://logo.clearbit.com/deloitte.com", careers: ["product-manager", "data-scientist"] },
  { name: "McKinsey & Co", logoUrl: "https://logo.clearbit.com/mckinsey.com", careers: ["product-manager"] },
  { name: "Goldman Sachs", logoUrl: "https://logo.clearbit.com/goldmansachs.com", careers: ["software-engineer", "data-scientist"] }
];

const SYSTEM_SETTINGS = [
  { key: "xp_login_reward", value: "15", description: "XP reward for daily logins", category: "ENGAGEMENT" },
  { key: "xp_question_reward", value: "30", description: "XP reward for answering the daily smart question", category: "ENGAGEMENT" },
  { key: "xp_task_reward", value: "10", description: "Base XP reward for completing a daily task", category: "ENGAGEMENT" },
  { key: "xp_streak_7", value: "100", description: "Bonus XP for a 7-day login streak", category: "ENGAGEMENT" },
  { key: "xp_streak_30", value: "500", description: "Bonus XP for a 30-day login streak", category: "ENGAGEMENT" },
  { key: "xp_streak_100", value: "2000", description: "Bonus XP for a 100-day login streak", category: "ENGAGEMENT" },
  { key: "xp_streak_365", value: "10000", description: "Bonus XP for a 365-day login streak", category: "ENGAGEMENT" }
];

async function main() {
  console.log("=== SEEDING DAILY ENGAGEMENT & SYSTEM SETTINGS ===");
  try {
    // 1. Seed Daily Questions
    console.log("Seeding daily questions...");
    const qCount = await prisma.dailyQuestion.count();
    if (qCount === 0) {
      await prisma.dailyQuestion.createMany({
        data: DAILY_QUESTIONS
      });
      console.log(`Successfully seeded ${DAILY_QUESTIONS.length} daily questions.`);
    } else {
      console.log(`DailyQuestion table already contains ${qCount} records. Skipping.`);
    }

    // 2. Seed Hiring Companies
    console.log("Seeding hiring companies...");
    const cCount = await prisma.hiringCompany.count();
    if (cCount === 0) {
      await prisma.hiringCompany.createMany({
        data: HIRING_COMPANIES
      });
      console.log(`Successfully seeded ${HIRING_COMPANIES.length} hiring companies.`);
    } else {
      console.log(`HiringCompany table already contains ${cCount} records. Skipping.`);
    }

    // 3. Seed System Settings
    console.log("Seeding engagement system settings...");
    let settingsSeeded = 0;
    for (const setting of SYSTEM_SETTINGS) {
      const exists = await prisma.systemSetting.findUnique({
        where: { key: setting.key }
      });
      if (!exists) {
        await prisma.systemSetting.create({
          data: setting
        });
        settingsSeeded++;
      }
    }
    console.log(`Successfully seeded ${settingsSeeded} system settings.`);

    console.log("Engagement seeding completed successfully!");
  } catch (err) {
    console.error("Error seeding engagement defaults:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
