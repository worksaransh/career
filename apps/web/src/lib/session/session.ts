import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth/auth";
import type { User } from "@career-os/types";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session?.user?.id) return null;

  const { prisma } = await import("@/lib/db/prisma/prisma");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    name: user.name,
    image: user.image,
    role: user.role as User["role"],
    primaryPersona: (user.primaryPersona ?? "STUDENT") as User["primaryPersona"],
    onboardingStep: user.onboardingStep as User["onboardingStep"],
    profileCompleteness: user.profileCompleteness as User["profileCompleteness"],
    language: user.language as User["language"],
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(...roles: string[]): Promise<User> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    redirect("/dashboard");
  }
  return user;
}
