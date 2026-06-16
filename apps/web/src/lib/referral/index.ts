// Referral Engine — track and reward user referrals

import { prisma } from "@/lib/db/prisma/prisma";

type ReferralStatus = "PENDING" | "JOINED" | "ACTIVE" | "EXPIRED" | "REWARDED";

export interface Referral {
  id?: string;
  referrerId: string;
  refereeEmail: string;
  status: "PENDING" | "JOINED" | "ACTIVE" | "EXPIRED" | "REWARDED";
  rewardType: "PREMIUM_ACCESS" | "FEATURE_UNLOCK" | "BONUS_MONTH";
  rewardClaimed: boolean;
  createdAt?: Date;
  joinedAt?: Date | null;
}

const REFERRAL_REWARDS = {
  PREMIUM_ACCESS: { label: "1 Month Premium Access", value: 30 },
  FEATURE_UNLOCK: { label: "Unlock Simulator Pro", value: 20 },
  BONUS_MONTH: { label: "Bonus Monthly Credit", value: 15 },
} as const;

function generateReferralCode(userId: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const random = Array.from({ length: 6 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
  return `${userId.slice(-4).toUpperCase()}${random}`;
}

export async function createReferral(referrerId: string, refereeEmail: string): Promise<Referral> {
  const referral = await prisma.referral.create({
    data: {
      referrerId,
      refereeEmail,
      status: "PENDING",
      rewardType: "PREMIUM_ACCESS",
      rewardClaimed: false,
    },
  });

  return referral as Referral;
}

export async function getReferralCode(userId: string): Promise<string> {
  let code = await prisma.systemSetting
    .findFirst({ where: { key: `referral_code_${userId}` } })
    .then((s) => s?.value);

  if (!code) {
    code = generateReferralCode(userId);
    await prisma.systemSetting.create({
      data: { key: `referral_code_${userId}`, value: code, category: "REFERRAL" },
    });
  }

  return code;
}

export async function getReferralStats(userId: string) {
  const referrals = await prisma.referral.findMany({ where: { referrerId: userId } });

  return {
    totalReferrals: referrals.length,
    pendingReferrals: referrals.filter((r) => r.status === "PENDING").length,
    activeReferrals: referrals.filter((r) => r.status === "ACTIVE").length,
    rewardedReferrals: referrals.filter((r) => r.status === "REWARDED").length,
    rewardsEarned: referrals.filter((r) => r.rewardClaimed).length,
  };
}

export async function processReferralJoined(refereeEmail: string, refereeId: string) {
  const referral = await prisma.referral.findFirst({
    where: { refereeEmail, status: "PENDING" },
  });

  if (!referral) return null;

  const updated = await prisma.referral.update({
    where: { id: referral.id },
    data: { status: "JOINED", joinedAt: new Date() },
  });

  return updated as Referral;
}

export async function claimReferralReward(referralId: string): Promise<Referral> {
  const referral = await prisma.referral.update({
    where: { id: referralId },
    data: { status: "REWARDED", rewardClaimed: true },
  });

  return referral as Referral;
}

export { REFERRAL_REWARDS };
