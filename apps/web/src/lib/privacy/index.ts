import { prisma } from "@/lib/db/prisma/prisma";
import type { ConsentType } from "@/lib/consent/consent";

export interface PrivacySettings {
  cookieConsent: boolean;
  marketingConsent: boolean;
  aiPersonalizationConsent: boolean;
  dataExportAvailable: boolean;
  dataDeletionRequested: boolean;
  parentConsent: boolean;
  activityHistory: boolean;
}

export async function getPrivacySettings(userId: string): Promise<PrivacySettings> {
  const records = await prisma.consentRecord.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    distinct: ["type"],
  });

  const map = new Map(records.map((r) => [r.type, r.granted]));

  return {
    cookieConsent: map.get("COOKIE_CONSENT") ?? false,
    marketingConsent: map.get("MARKETING_EMAILS") ?? false,
    aiPersonalizationConsent: map.get("AI_PERSONALIZATION") ?? false,
    dataExportAvailable: true,
    dataDeletionRequested: false,
    parentConsent: map.get("PARENT_CONSENT") ?? false,
    activityHistory: map.get("ACTIVITY_HISTORY") ?? true,
  };
}

export async function updateConsent(userId: string, type: ConsentType, granted: boolean, ip?: string): Promise<void> {
  await prisma.consentRecord.create({
    data: { userId, type, granted, ip, userAgent: null },
  });
}

export async function requestDataExport(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      assessments: true,
      savedItems: true,
      roadmaps: true,
      payments: true,
      subscriptions: true,
    },
  });

  return JSON.stringify(user, null, 2);
}

export async function requestDataDeletion(userId: string): Promise<void> {
  await prisma.consentRecord.create({
    data: { userId, type: "DATA_DELETION_REQUEST", granted: true },
  });
  await prisma.user.update({
    where: { id: userId },
    data: {
      name: "Deleted User",
      email: `deleted-${userId}@careeros.ai`,
      phone: null,
      hashedPassword: null,
      image: null,
      onboardingStep: "WELCOME",
      profileCompleteness: 10,
    },
  });
}

export async function getConsentLogs(userId: string) {
  return prisma.consentRecord.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
