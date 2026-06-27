import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma/prisma";
import { env } from "@/env";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[Cashfree Webhook] Received webhook payload:", body);

    const orderId = body?.data?.order?.order_id || body?.order_id;
    if (!orderId) {
      return NextResponse.json({ success: false, error: "Order ID missing" }, { status: 400 });
    }

    // Out-of-band validation: Query Cashfree directly to verify order status
    const isProduction = env.CASHFREE_ENV === "production";
    const baseUrl = isProduction 
      ? `https://api.cashfree.com/pg/orders/${orderId}` 
      : `https://sandbox.cashfree.com/pg/orders/${orderId}`;

    const appId = env.CASHFREE_APP_ID || "TEST_APP_ID";
    const secretKey = env.CASHFREE_SECRET_KEY || "TEST_SECRET_KEY";

    const cfResponse = await fetch(baseUrl, {
      method: "GET",
      headers: {
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": "2023-08-01",
      },
    });

    if (!cfResponse.ok) {
      throw new Error(`Failed to fetch order status from Cashfree: ${cfResponse.statusText}`);
    }

    const cfOrder = await cfResponse.json();
    console.log(`[Cashfree Webhook] Verified order status: ${cfOrder.order_status}`);

    if (cfOrder.order_status === "PAID") {
      // Find the corresponding payment in our DB
      const dbPayment = await prisma.payment.findUnique({
        where: { id: orderId },
      });

      if (!dbPayment) {
        return NextResponse.json({ success: false, error: "Payment record not found" }, { status: 404 });
      }

      if (dbPayment.status === "SUCCESS") {
        return NextResponse.json({ success: true, message: "Payment already processed" });
      }

      // Update payment record and activate subscription in a transaction
      await prisma.$transaction(async (tx) => {
        // 1. Update Payment status to SUCCESS
        await tx.payment.update({
          where: { id: orderId },
          data: {
            status: "SUCCESS",
            paidAt: new Date(),
          },
        });

        // 2. Handle Subscription activation if applicable
        if (dbPayment.tier.includes("PREMIUM")) {
          const isAnnual = dbPayment.tier === "PREMIUM_ANNUAL";
          const end = new Date();
          if (isAnnual) {
            end.setFullYear(end.getFullYear() + 1);
          } else {
            end.setDate(end.getDate() + 30);
          }

          const existingSub = await tx.subscription.findFirst({
            where: { userId: dbPayment.userId },
          });

          if (existingSub) {
            await tx.subscription.update({
              where: { id: existingSub.id },
              data: {
                tier: dbPayment.tier,
                status: "ACTIVE",
                currentPeriodStart: new Date(),
                currentPeriodEnd: end,
                cancelAtPeriodEnd: false,
              },
            });
          } else {
            await tx.subscription.create({
              data: {
                userId: dbPayment.userId,
                tier: dbPayment.tier,
                status: "ACTIVE",
                currentPeriodStart: new Date(),
                currentPeriodEnd: end,
              },
            });
          }
        }
      });

      console.log(`[Cashfree Webhook] Successfully processed payment and activated plan for order: ${orderId}`);
      return NextResponse.json({ success: true, message: "Processed successfully" });
    }

    return NextResponse.json({ success: true, message: `Order status is ${cfOrder.order_status}, no action taken` });
  } catch (error: any) {
    console.error("[Cashfree Webhook] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal webhook handler error" },
      { status: 500 },
    );
  }
}
