import { requireAuth } from "@/lib/session/session";
import { prisma } from "@/lib/db/prisma/prisma";
import { SettingsClient } from "./settings-client";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireAuth();
  const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id, status: "ACTIVE" },
  });

  const serializedProfile = profile ? { preferences: profile.preferences as Record<string, unknown> } : null;
  return <SettingsClient user={user} profile={serializedProfile} subscription={subscription} />;
}
