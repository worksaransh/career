import Link from "next/link";
import { CheckCircle, XCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/db/prisma/prisma";
import { env } from "@/env";
import { Button } from "@/components/ui/button";

interface PaymentStatusPageProps {
  searchParams: { order_id?: string };
}

export default async function PaymentStatusPage({ searchParams }: PaymentStatusPageProps) {
  const orderId = searchParams.order_id;

  if (!orderId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
        <XCircle className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-black">Invalid Request</h1>
        <p className="text-muted-foreground text-sm max-w-sm">No payment order ID was provided.</p>
        <Button asChild>
          <Link href="/pricing">Return to Pricing</Link>
        </Button>
      </div>
    );
  }

  // 1. Fetch order details from Cashfree directly
  const isProduction = env.CASHFREE_ENV === "production";
  const baseUrl = isProduction 
    ? `https://api.cashfree.com/pg/orders/${orderId}` 
    : `https://sandbox.cashfree.com/pg/orders/${orderId}`;

  const appId = env.CASHFREE_APP_ID || "TEST_APP_ID";
  const secretKey = env.CASHFREE_SECRET_KEY || "TEST_SECRET_KEY";

  let status = "PENDING";
  let amount = 0;
  let errorMsg = "";

  try {
    const cfResponse = await fetch(baseUrl, {
      method: "GET",
      headers: {
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": "2023-08-01",
      },
    });

    if (cfResponse.ok) {
      const cfOrder = await cfResponse.json();
      status = cfOrder.order_status;
      amount = cfOrder.order_amount;

      // Sync inline: In case webhook is slow, sync db directly
      if (status === "PAID") {
        const dbPayment = await prisma.payment.findUnique({
          where: { id: orderId },
        });

        if (dbPayment && dbPayment.status !== "SUCCESS") {
          await prisma.$transaction(async (tx) => {
            // Update payment to SUCCESS
            await tx.payment.update({
              where: { id: orderId },
              data: {
                status: "SUCCESS",
                paidAt: new Date(),
              },
            });

            // Activate subscription
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
        }
      }
    } else {
      errorMsg = "Order not found on Cashfree gateway.";
    }
  } catch (err: any) {
    console.error("Payment status verification error:", err);
    errorMsg = err.message || "Failed to contact gateway.";
  }

  const isSuccess = status === "PAID";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground">
      <div className="w-full max-w-md p-8 glass rounded-3xl border border-border/80 shadow-2xl text-center space-y-6 animate-in zoom-in duration-300">
        
        {isSuccess ? (
          <>
            <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCircle className="h-12 w-12" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight text-white">Payment Successful!</h1>
              <p className="text-xs text-muted-foreground">
                Your payment for order ID <span className="font-mono text-foreground font-semibold">{orderId}</span> has been processed.
              </p>
            </div>
            
            <div className="bg-muted/10 border border-border/30 rounded-2xl p-4 text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-bold text-foreground">₹{amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-bold text-emerald-500">PAID</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-2">
              <Button asChild variant="gradient" size="lg" fullWidth>
                <Link href="/dashboard" className="flex items-center justify-center gap-2">
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
              <XCircle className="h-12 w-12" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight text-white">Payment Failed</h1>
              <p className="text-xs text-muted-foreground">
                We could not verify your payment status (Order Status: <span className="font-semibold text-foreground">{status}</span>).
              </p>
              {errorMsg && <p className="text-[10px] text-destructive/80 font-mono mt-2">{errorMsg}</p>}
            </div>

            <div className="pt-4 flex flex-col gap-2">
              <Button asChild variant="outline" size="lg" fullWidth>
                <Link href="/pricing">Try Again</Link>
              </Button>
            </div>
          </>
        )}

        <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
          <ShieldCheck className="h-4 w-4 text-primary" /> Securing transactions via Cashfree
        </div>
      </div>
    </div>
  );
}
