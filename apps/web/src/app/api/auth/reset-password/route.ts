import { NextResponse } from "next/server";
import { decode } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma/prisma";
import { env } from "@/env";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ success: false, error: { message: "Token and password are required" } }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: { message: "Password must be at least 6 characters" } }, { status: 400 });
    }

    // Verify and decode token
    const secret = env.AUTH_SECRET || "your-secret-key-change-in-production-long-secret";
    const decoded = await decode({
      token,
      secret,
    });

    if (!decoded || !decoded.email) {
      return NextResponse.json({ success: false, error: { message: "Invalid or expired reset token" } }, { status: 400 });
    }

    const email = decoded.email as string;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: { message: "User not found" } }, { status: 404 });
    }

    // Hash new password and update in DB
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { email },
      data: { hashedPassword },
    });

    console.log(`[PASSWORD RESET] Password updated successfully for user: ${email}`);

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, error: { message: error.message || "Failed to reset password" } },
      { status: 500 },
    );
  }
}
