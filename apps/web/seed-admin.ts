import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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

// Use pooled database URL by default from .env
console.log("Using DATABASE_URL from .env");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding admin user and coupon...");

  const email = "work.saranshgulati@gmail.com";
  const password = "Saransh12@#";
  const hashedPassword = await bcrypt.hash(password, 12);

  // 1. Create or update the admin user
  const adminUser = await prisma.user.upsert({
    where: { email },
    update: {
      hashedPassword,
      role: "SUPER_ADMIN",
      onboardingStep: "COMPLETE",
      profileCompleteness: 100,
    },
    create: {
      name: "Saransh Gulati",
      email,
      hashedPassword,
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
          tier: "PREMIUM",
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        },
      },
    },
  });

  console.log("Admin user updated/created:", adminUser.email);

  // 1b. Update default seed users with credentials passwords so they can be logged into
  const demoPasswordHash = await bcrypt.hash("CareerOS12@#", 12);
  
  const seedAdmin = await prisma.user.upsert({
    where: { email: "admin@careeros.ai" },
    update: {
      hashedPassword: demoPasswordHash,
      role: "SUPER_ADMIN",
    },
    create: {
      name: "Super Admin",
      email: "admin@careeros.ai",
      hashedPassword: demoPasswordHash,
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
  console.log("Default seed admin updated/created:", seedAdmin.email);

  const seedDemo = await prisma.user.upsert({
    where: { email: "demo@careeros.ai" },
    update: {
      hashedPassword: demoPasswordHash,
      role: "USER",
    },
    create: {
      name: "Demo Student",
      email: "demo@careeros.ai",
      hashedPassword: demoPasswordHash,
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
  console.log("Default seed demo user updated/created:", seedDemo.email);

  // 2. Create or update the FREE coupon code
  const coupon = await prisma.coupon.upsert({
    where: { code: "FREE" },
    update: {
      discountPercentage: 100,
      isActive: true,
    },
    create: {
      code: "FREE",
      discountPercentage: 100,
      isActive: true,
    },
  });

  console.log("Coupon updated/created:", coupon.code);
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
