import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/db/prisma/prisma";
import { registerSchema } from "@career-os/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "EMAIL_EXISTS", message: "An account with this email already exists" },
        },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(validated.password, 12);

    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        hashedPassword,
        profile: {
          create: {
            interests: [],
            preferences: {
              theme: "system",
              language: "en",
              emailNotifications: true,
              pushNotifications: true,
            },
          },
        },
        subscriptions: {
          create: {
            tier: "FREE",
            status: "ACTIVE",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: error.flatten().fieldErrors,
          },
        },
        { status: 400 },
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
      },
      { status: 500 },
    );
  }
}
