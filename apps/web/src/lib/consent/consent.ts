import { prisma } from "@/lib/db/prisma/prisma";

export type ConsentType =
  | "TERMS_OF_SERVICE"
  | "PRIVACY_POLICY"
  | "DATA_PROCESSING"
  | "MARKETING_EMAILS"
  | "ANALYTICS"
  | "AI_PROCESSING";

export async function recordConsent(
  userId: string,
  type: ConsentType,
  granted: boolean,
  context?: { ip?: string; userAgent?: string },
): Promise<void> {
  await prisma.consentRecord.create({
    data: {
      userId,
      type,
      granted,
      ip: context?.ip ?? null,
      userAgent: context?.userAgent ?? null,
    },
  });
}

export async function hasConsent(
  userId: string,
  type: ConsentType,
): Promise<boolean> {
  const record = await prisma.consentRecord.findFirst({
    where: { userId, type },
    orderBy: { createdAt: "desc" },
  });

  return record?.granted ?? false;
}

export async function getUserConsents(
  userId: string,
): Promise<Record<ConsentType, boolean>> {
  const records = await prisma.consentRecord.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    distinct: ["type"],
  });

  return records.reduce(
    (acc, record) => {
      acc[record.type as ConsentType] = record.granted;
      return acc;
    },
    {} as Record<ConsentType, boolean>,
  );
}
