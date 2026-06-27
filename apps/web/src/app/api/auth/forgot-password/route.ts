import { NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import { prisma } from "@/lib/db/prisma/prisma";
import { env } from "@/env";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: { message: "Email is required" } }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // To prevent user enumeration attacks, we return success even if the email doesn't exist
    if (!user) {
      return NextResponse.json({ success: true, message: "Reset link sent" });
    }

    // Generate secure token using NextAuth's encryptor
    const secret = env.AUTH_SECRET || "your-secret-key-change-in-production-long-secret";
    const token = await encode({
      token: {
        id: user.id,
        role: user.role,
        email: user.email,
      },
      secret,
      maxAge: 3600, // 1 hour
    });

    const resetLink = `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${encodeURIComponent(token)}`;
    console.log(`[PASSWORD RESET LINK] Sent to ${user.email}: ${resetLink}`);

    // If Resend API Key is configured, try sending the email
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || "onboarding@resend.dev",
            to: user.email,
            subject: "Reset your Career GPS AI Password",
            html: `<p>Please reset your password by clicking this link: <a href="${resetLink}">${resetLink}</a></p>`,
          }),
        });
      } catch (emailErr) {
        console.error("Failed to send reset email via Resend:", emailErr);
      }
    }

    return NextResponse.json({ success: true, message: "Reset link sent" });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, error: { message: error.message || "Failed to process request" } },
      { status: 500 },
    );
  }
}
