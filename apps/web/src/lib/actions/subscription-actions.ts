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

export async function createCashfreeOrder(item: { name: string; price: number }, couponCode?: string) {
  const user = await requireAuth();
  const { env } = await import("@/env");

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

  // item.price is in Rupees (e.g. 499, 2999) from the UI client
  const basePricePaise = item.price * 100;
  const discountAmount = Math.round((basePricePaise * discountPercentage) / 100);
  const finalPricePaise = Math.max(0, basePricePaise - discountAmount);
  const finalPriceRupees = (finalPricePaise / 100).toFixed(2);

  // 1. Create a PENDING payment record
  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      amount: finalPricePaise,
      currency: "INR",
      status: "PENDING",
      tier: item.name.toUpperCase().includes("ANNUAL")
        ? "PREMIUM_ANNUAL"
        : item.name.toUpperCase().includes("MONTHLY")
        ? "PREMIUM"
        : "SINGLE_UNLOCK",
      couponCode: couponCode ? couponCode.toUpperCase().trim() : null,
    },
  });

  const isProduction = env.CASHFREE_ENV === "production";
  const baseUrl = isProduction 
    ? "https://api.cashfree.com/pg/orders" 
    : "https://sandbox.cashfree.com/pg/orders";

  const appId = env.CASHFREE_APP_ID || "TEST_APP_ID";
  const secretKey = env.CASHFREE_SECRET_KEY || "TEST_SECRET_KEY";

  try {
    console.log(`[Cashfree] Requesting order creation from Cashfree API...`);
    const cfResponse = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": "2023-08-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order_id: payment.id,
        order_amount: parseFloat(finalPriceRupees),
        order_currency: "INR",
        customer_details: {
          customer_id: user.id,
          customer_name: user.name || "Customer",
          customer_email: user.email || "customer@careergps.ai",
          customer_phone: user.phone || "9999999999",
        },
        order_meta: {
          return_url: `${env.NEXT_PUBLIC_APP_URL}/payment-status?order_id={order_id}`,
        },
      }),
    });

    if (!cfResponse.ok) {
      const errorText = await cfResponse.text();
      throw new Error(`Cashfree PG API responded with status ${cfResponse.status}: ${errorText}`);
    }

    const cfData = await cfResponse.json();

    return {
      success: true,
      paymentSessionId: cfData.payment_session_id,
      orderId: cfData.order_id,
      paymentId: payment.id,
      env: env.CASHFREE_ENV || "sandbox",
    };
  } catch (err: any) {
    console.error("[Cashfree] Order creation error:", err);
    throw new Error(`Cashfree PG order initiation failed: ${err.message}`);
  }
}
