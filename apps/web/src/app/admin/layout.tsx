import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

const allowedRoles = ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER", "ANALYST", "FINANCE", "MODERATOR"];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !allowedRoles.includes(session.user.role as string)) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar role={session.user.role as string} />
      <div className="flex-1 lg:pl-64">
        <main className="min-h-screen pb-16 pt-4 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
