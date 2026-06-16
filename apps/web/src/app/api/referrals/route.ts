import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma/prisma";
import { referralCreateSchema } from "@career-os/validations";
import { getSession } from "@/lib/session/session";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
    }
    const body = await request.json();
    const validated = referralCreateSchema.parse(body);
    const referral = await prisma.referral.create({
      data: { referrerId: session.user.id, refereeEmail: validated.refereeEmail, status: "PENDING", rewardType: "PREMIUM_ACCESS", rewardClaimed: false },
    });
    return NextResponse.json({ success: true, data: referral });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", details: error.flatten().fieldErrors } }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
    }
    const referrals = await prisma.referral.findMany({ where: { referrerId: session.user.id } });
    const stats = {
      totalReferrals: referrals.length,
      pendingReferrals: referrals.filter((r) => r.status === "PENDING").length,
      activeReferrals: referrals.filter((r) => r.status === "ACTIVE").length,
      rewardedReferrals: referrals.filter((r) => r.status === "REWARDED").length,
      rewardsEarned: referrals.filter((r) => r.rewardClaimed).length,
    };
    return NextResponse.json({ success: true, data: { referrals, stats } });
  } catch {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
  }
}
