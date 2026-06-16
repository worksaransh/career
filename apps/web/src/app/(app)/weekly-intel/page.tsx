import { requireAuth } from "@/lib/session/session";
import { WeeklyIntelClient } from "./weekly-intel-client";

export const metadata = { title: "Weekly Intelligence" };

export default async function WeeklyIntelPage() {
  const user = await requireAuth();
  return <WeeklyIntelClient userId={user.id} />;
}
