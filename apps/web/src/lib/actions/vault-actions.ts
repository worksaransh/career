"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma/prisma";
import { requireAuth } from "@/lib/session/session";
import { buildCareerTwin } from "@/lib/career-twin";
import { getUserMemory } from "./memory-actions";

// Recalculate Portfolio, Job Readiness, and Career Upgrade Scores
export async function recalculateScores(userId: string) {
  const docs = await prisma.vaultDocument.findMany({
    where: { userId },
  });

  const memory = await prisma.userMemory.findUnique({
    where: { userId },
  });

  const engagement = await prisma.userEngagement.findUnique({
    where: { userId },
  });

  const assessments = await prisma.assessmentResult.findMany({
    where: { userId },
  });

  const skills = await prisma.skillProficiency.findMany({
    where: { userId },
  });

  const profile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  // 1. Calculate Portfolio Score (0-100)
  let portScore = 40; // baseline
  const docTypes = docs.map((d) => d.type);

  if (docTypes.includes("RESUME")) portScore += 20;
  if (docTypes.includes("CV")) portScore += 10;
  if (docTypes.includes("LINKEDIN")) portScore += 15;
  if (docTypes.includes("GITHUB")) portScore += 15;
  if (docTypes.includes("PORTFOLIO")) portScore += 15;
  if (docTypes.includes("WEBSITE")) portScore += 5;
  if (docTypes.includes("CERTIFICATE")) portScore += 10;
  if (docTypes.includes("PROJECT")) portScore += 10;
  
  portScore = Math.min(100, portScore);

  // 2. Calculate Job Readiness Score (0-100)
  let readScore = 30; // baseline
  readScore += Math.round(portScore * 0.3); // up to +30 from portfolio strength

  if (assessments.length > 0) readScore += 20; // completed assessments
  if (engagement && engagement.totalXP > 150) readScore += 10;
  if (engagement && engagement.currentStreak >= 3) readScore += 10;
  readScore += Math.min(10, skills.length * 2); // validated skills impact

  readScore = Math.min(100, readScore);

  // 3. Calculate Career Upgrade Score (0-100)
  let upgradeScore = 50; // baseline
  upgradeScore += Math.round(readScore * 0.2); // up to +20 from readiness
  upgradeScore += Math.round(portScore * 0.1); // up to +10 from portfolio

  const completedChallenges = await prisma.weeklyChallenge.count({
    where: { userId, isCompleted: true },
  });
  upgradeScore += Math.min(15, completedChallenges * 5); // +5 per challenge

  if (profile?.educationLevel) upgradeScore += 5;
  if (profile?.interests && profile.interests.length > 0) upgradeScore += 5;

  upgradeScore = Math.min(100, upgradeScore);

  // 4. Update memory scores
  const currentMemory = await prisma.userMemory.upsert({
    where: { userId },
    create: {
      userId,
      portfolioScore: portScore,
      jobReadinessScore: readScore,
      careerUpgradeScore: upgradeScore,
    },
    update: {
      portfolioScore: portScore,
      jobReadinessScore: readScore,
      careerUpgradeScore: upgradeScore,
    },
  });

  // Sync to Career Twin in background
  try {
    const previousSnapshot = await prisma.careerTwinSnapshot.findFirst({
      where: { userId },
      orderBy: { version: "desc" },
    });

    const previousTwin = previousSnapshot
      ? {
          version: previousSnapshot.version,
          profileSnapshot: previousSnapshot.profileSnapshot as any,
          predictedPath: previousSnapshot.predictedPath as any,
          skillGaps: previousSnapshot.skillGaps as any,
          riskProfile: previousSnapshot.riskProfile as any,
          userId,
          lastSyncedAt: previousSnapshot.syncedAt.toISOString(),
        }
      : undefined;

    const topSkillsList = skills.map((s) => s.skillName);
    const interestsList = profile?.interests ?? [];

    const twinSnapshot = await buildCareerTwin(
      userId,
      {
        education: profile?.educationLevel ?? "Not Provided",
        currentRole: docTypes.includes("RESUME") ? "Resume Uploaded" : "Explorer",
        yearsOfExperience: docTypes.includes("INTERNSHIP_PROOF") ? 1 : 0,
        topSkills: topSkillsList.length > 0 ? topSkillsList : ["Learning"],
        interests: interestsList,
        careerGoals: (memory?.goals as any)?.longTerm ?? "Exploring Options",
        location: profile?.location ?? "Remote",
        salaryExpectation: 600000,
      },
      previousTwin as any
    );

    await prisma.careerTwinSnapshot.create({
      data: {
        userId,
        version: twinSnapshot.version,
        profileSnapshot: twinSnapshot.profileSnapshot as any,
        predictedPath: twinSnapshot.predictedPath as any,
        skillGaps: twinSnapshot.skillGaps as any,
        riskProfile: twinSnapshot.riskProfile as any,
      },
    });
  } catch (err) {
    console.error("Twin sync error in score recalculation:", err);
  }

  return { portfolioScore: portScore, jobReadinessScore: readScore, careerUpgradeScore: upgradeScore };
}

// Get all documents in the user's vault
export async function listVaultDocuments() {
  const user = await requireAuth();
  return prisma.vaultDocument.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

// Save document or link to vault
export async function saveVaultDocument(data: {
  id?: string;
  title: string;
  type: string;
  fileUrl?: string;
  linkUrl?: string;
  parsedContent?: any;
  confidenceScore?: number;
}) {
  const user = await requireAuth();

  const docData = {
    userId: user.id,
    title: data.title,
    type: data.type,
    fileUrl: data.fileUrl || null,
    linkUrl: data.linkUrl || null,
    parsedContent: data.parsedContent ? (data.parsedContent as any) : undefined,
    confidenceScore: data.confidenceScore ?? null,
  };

  let saved;
  if (data.id) {
    saved = await prisma.vaultDocument.update({
      where: { id: data.id, userId: user.id },
      data: docData,
    });
  } else {
    saved = await prisma.vaultDocument.create({
      data: docData,
    });
  }

  // Award XP for uploading document if first time for this type
  const typeCount = await prisma.vaultDocument.count({
    where: { userId: user.id, type: data.type },
  });
  if (typeCount === 1) {
    const engagement = await prisma.userEngagement.findUnique({
      where: { userId: user.id },
    });
    if (engagement) {
      await prisma.userEngagement.update({
        where: { id: engagement.id },
        data: {
          totalXP: engagement.totalXP + 40, // +40 XP
          totalPoints: engagement.totalPoints + 40,
        },
      });
    }
  }

  // Recalculate portfolio & readiness scores
  await recalculateScores(user.id);

  revalidatePath("/dashboard");
  revalidatePath("/vault");
  return { success: true, document: saved };
}

// Delete document from vault
export async function deleteVaultDocument(id: string) {
  const user = await requireAuth();

  await prisma.vaultDocument.delete({
    where: { id, userId: user.id },
  });

  // Recalculate scores
  await recalculateScores(user.id);

  revalidatePath("/dashboard");
  revalidatePath("/vault");
  return { success: true };
}

// Confirm parsed resume and auto fill user profiles
export async function confirmParsedResume(parsedData: any, filename: string, fileUrl: string) {
  const user = await requireAuth();

  // 1. Save document to Vault
  const savedDoc = await prisma.vaultDocument.create({
    data: {
      userId: user.id,
      title: filename,
      type: "RESUME",
      fileUrl: fileUrl,
      parsedContent: parsedData as any,
      confidenceScore: parsedData.confidenceScore || 80,
    }
  });

  // 2. Update User Profile
  const highestEdu = parsedData.education?.[0];
  await prisma.userProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      educationLevel: highestEdu?.degree || "Undergraduate",
      location: parsedData.personalDetails?.location || "India",
    },
    update: {
      educationLevel: highestEdu?.degree || undefined,
      location: parsedData.personalDetails?.location || undefined,
    }
  });

  // 3. Update User Memory
  const memory = await getUserMemory();
  const demographics = (memory.demographics as Record<string, any>) || {};
  if (parsedData.personalDetails?.location) demographics.location = parsedData.personalDetails.location;
  if (parsedData.personalDetails?.name) demographics.name = parsedData.personalDetails.name;

  const education = (memory.education as Record<string, any>) || {};
  if (highestEdu?.degree) education.level = highestEdu.degree;
  if (highestEdu?.college) education.institution = highestEdu.college;
  if (highestEdu?.passingYear) education.passingYear = highestEdu.passingYear;

  const marks = (memory.marks as Record<string, any>) || {};
  if (highestEdu?.cgpa) marks.cgpa = highestEdu.cgpa;
  if (highestEdu?.marks) marks.percentage = highestEdu.marks;

  const goals = (memory.goals as Record<string, any>) || {};
  if (parsedData.careerObjective) goals.shortTerm = parsedData.careerObjective;
  if (parsedData.experience?.[0]?.designation) goals.longTerm = parsedData.experience[0].designation;

  // Aggregate all imported skills
  const skillsMap = (memory.skills as Record<string, any>) || {};
  const allSkills: string[] = [];
  
  if (parsedData.skills) {
    const categories = Object.keys(parsedData.skills);
    for (const cat of categories) {
      const list = parsedData.skills[cat];
      if (Array.isArray(list)) {
        list.forEach((s: string) => {
          skillsMap[s] = "INTERMEDIATE";
          allSkills.push(s);
        });
      }
    }
  }

  await prisma.userMemory.update({
    where: { id: memory.id },
    data: {
      demographics,
      education,
      marks,
      goals,
      skills: skillsMap,
    }
  });

  // 4. Save to SkillProficiency table
  for (const skill of allSkills.slice(0, 15)) {
    await prisma.skillProficiency.upsert({
      where: {
        userId_skillName: {
          userId: user.id,
          skillName: skill,
        }
      },
      create: {
        userId: user.id,
        skillName: skill,
        selfRated: 70,
        confidence: 50,
        verified: false,
        evidence: [
          { source: "RESUME", name: filename, timestamp: new Date().toISOString() }
        ] as any
      },
      update: {
        evidence: [
          { source: "RESUME", name: filename, timestamp: new Date().toISOString() }
        ] as any
      }
    });
  }

  // 5. Recalculate scores and sync Career Twin snapshot
  await recalculateScores(user.id);

  revalidatePath("/dashboard");
  revalidatePath("/vault");
  revalidatePath("/profile");

  return { success: true, documentId: savedDoc.id };
}
