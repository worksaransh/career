import { prisma } from "@/lib/db/prisma/prisma";

interface AuditEntry {
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details?: Record<string, unknown>;
  ip?: string | null;
  userAgent?: string | null;
}

export async function createAuditLog(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId,
        details: (entry.details as any) ?? {},
        ip: entry.ip ?? null,
        userAgent: entry.userAgent ?? null,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}

export function auditAction(
  action: string,
  resource: string,
  getDetails?: () => Record<string, unknown>,
) {
  return async function auditDecorator(
    userId: string,
    resourceId: string,
    additionalContext?: { ip?: string; userAgent?: string },
  ): Promise<void> {
    await createAuditLog({
      userId,
      action,
      resource,
      resourceId,
      details: getDetails?.() ?? {},
      ip: additionalContext?.ip,
      userAgent: additionalContext?.userAgent,
    });
  };
}
