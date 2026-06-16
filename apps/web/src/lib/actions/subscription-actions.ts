"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma/prisma";
import { requireAuth } from "@/lib/session/session";

export async function getSubscriptionStatus() {
  const user = await requireAuth();
  const sub = await prisma.subscription.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return sub;
}

export async function subscribeToPremium(couponCode?: string) {
  const user = await requireAuth();

  let discountPercentage = 0;
  let couponId: string | null = null;

  if (couponCode) {
    const codeClean = couponCode.toUpperCase().trim();
    const coupon = await prisma.coupon.findUnique({
      where: { code: codeClean },
    });

    if (!coupon) {
      throw new Error("Invalid coupon code");
    }

    if (!coupon.isActive) {
      throw new Error("Coupon code is inactive");
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      throw new Error("Coupon code has expired");
    }

    if (coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses) {
      throw new Error("Coupon usage limit exceeded");
    }

    discountPercentage = coupon.discountPercentage;
    couponId = coupon.id;
  }

  const basePrice = 49900; // ₹499 in paise
  const discountAmount = Math.round((basePrice * discountPercentage) / 100);
  const finalPrice = Math.max(0, basePrice - discountAmount);

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create a successful payment log
    const payment = await tx.payment.create({
      data: {
        userId: user.id,
        amount: finalPrice,
        currency: "INR",
        status: "SUCCESS",
        tier: "PREMIUM",
        couponCode: couponCode ? couponCode.toUpperCase().trim() : null,
        paidAt: new Date(),
      },
    });

    // 2. Create or update user subscription
    const existingSub = await tx.subscription.findFirst({
      where: { userId: user.id },
    });

    const end = new Date();
    end.setDate(end.getDate() + 30); // 30 days validation

    let sub;
    if (existingSub) {
      sub = await tx.subscription.update({
        where: { id: existingSub.id },
        data: {
          tier: "PREMIUM",
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: end,
          cancelAtPeriodEnd: false,
        },
      });
    } else {
      sub = await tx.subscription.create({
        data: {
          userId: user.id,
          tier: "PREMIUM",
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: end,
        },
      });
    }

    // 3. Update coupon usage
    if (couponId) {
      await tx.coupon.update({
        where: { id: couponId },
        data: {
          currentUses: { increment: 1 },
        },
      });
    }

    return { payment, subscription: sub };
  });

  revalidatePath("/pricing");
  revalidatePath("/dashboard");
  revalidatePath("/settings");

  return { success: true, data: result };
}

export async function validateCoupon(code: string) {
  if (!code) {
    throw new Error("Coupon code is required");
  }
  const codeClean = code.toUpperCase().trim();
  const coupon = await prisma.coupon.findUnique({
    where: { code: codeClean },
  });

  if (!coupon) {
    throw new Error("Invalid coupon code");
  }

  if (!coupon.isActive) {
    throw new Error("Coupon code is inactive");
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    throw new Error("Coupon code has expired");
  }

  if (coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses) {
    throw new Error("Coupon usage limit exceeded");
  }

  return {
    code: coupon.code,
    discountPercentage: coupon.discountPercentage,
  };
}
