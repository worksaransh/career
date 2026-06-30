import { requireAuth } from "@/lib/session/session";
import { prisma } from "@/lib/db/prisma/prisma";
import { VaultClient } from "./vault-client";

export const metadata = { title: "Career Vault" };

export default async function VaultPage() {
  const user = await requireAuth();

  // Fetch subscription status
  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  
  const isPremium = (subscription?.tier === "PREMIUM" || subscription?.tier === "UNIVERSITY") && subscription?.status === "ACTIVE";

  return <VaultClient userId={user.id} isPremium={isPremium} />;
}
