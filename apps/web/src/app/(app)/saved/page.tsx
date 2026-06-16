import { requireAuth } from "@/lib/session/session";
import { SavedClient } from "./saved-client";

export const metadata = { title: "Saved Items" };

export default async function SavedPage() {
  const user = await requireAuth();
  return <SavedClient userId={user.id} />;
}
