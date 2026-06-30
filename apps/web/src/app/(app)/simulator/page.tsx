import { requireAuth } from "@/lib/session/session";
import { prisma } from "@/lib/db/prisma/prisma";
import { SimulatorClient } from "./simulator-client";

export const metadata = { title: "Future Simulator" };

export default async function SimulatorPage() {
  const user = await requireAuth();

  // Fetch subscription status
  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const isPremium = (subscription?.tier === "PREMIUM" || subscription?.tier === "UNIVERSITY") && subscription?.status === "ACTIVE";

  return <SimulatorClient userId={user.id} isPremium={isPremium} />;
}
