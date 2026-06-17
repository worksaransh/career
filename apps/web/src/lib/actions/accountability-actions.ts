"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma/prisma";
import { requireAuth } from "@/lib/session/session";

// Invite an accountability partner
export async function invitePartner(data: {
  name: string;
  email: string;
  relationship: string;
}) {
  const user = await requireAuth();

  const partner = await prisma.accountabilityPartner.create({
    data: {
      userId: user.id,
      partnerEmail: data.email.toLowerCase().trim(),
      partnerName: data.name,
      relation: data.relationship,
      status: "ACCEPTED", // Auto-link for high user delight in V1 simulation
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return { success: true, partner };
}

// Get all partners with streak comparisons
export async function getPartners() {
  const user = await requireAuth();

  const partners = await prisma.accountabilityPartner.findMany({
    where: { userId: user.id },
  });

  const enrichedPartners = await Promise.all(
    partners.map(async (partner) => {
      // Find matching user in the system to compare progress
      const targetUser = await prisma.user.findUnique({
        where: { email: partner.partnerEmail },
        include: {
          engagement: true,
          memory: true,
        },
      });

      return {
        id: partner.id,
        name: partner.partnerName,
        email: partner.partnerEmail,
        relation: partner.relation,
        status: partner.status,
        createdAt: partner.createdAt,
        isRegistered: !!targetUser,
        streak: targetUser?.engagement?.currentStreak ?? 0,
        xp: targetUser?.engagement?.totalXP ?? 0,
        completeness: targetUser?.memory?.profileCompleteness ?? targetUser?.profileCompleteness ?? 15,
        careerUpgradeScore: targetUser?.memory?.careerUpgradeScore ?? 65,
      };
    })
  );

  return enrichedPartners;
}

// Send nudge to accountability partner
export async function sendPartnerNudge(partnerId: string) {
  const user = await requireAuth();

  const partner = await prisma.accountabilityPartner.findFirst({
    where: { id: partnerId, userId: user.id },
  });

  if (!partner) {
    throw new Error("Partner connection not found.");
  }

  // Find target user to send notification
  const targetUser = await prisma.user.findUnique({
    where: { email: partner.partnerEmail },
  });

  if (targetUser) {
    // Create actual db notification
    await prisma.notification.create({
      data: {
        userId: targetUser.id,
        type: "NUDGE",
        title: "Accountability Nudge! 🚀",
        body: `${user.name || "Your partner"} sent you an encouragement nudge. Keep up the learning streak!`,
        data: { senderId: user.id, senderName: user.name || "Partner" },
      },
    });
  }

  return { success: true, message: `Nudge successfully sent to ${partner.partnerName}!` };
}
