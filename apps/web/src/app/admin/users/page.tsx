import React from "react";
import { listUsers } from "@/lib/actions/admin-actions";
import { UserTable } from "./user-table";

export const metadata = { title: "User Management - Career OS" };

export default async function AdminUsersPage() {
  const users = await listUsers().catch(() => []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text text-transparent sm:text-4xl">
          User Management
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          View register details, search accounts, change role permissions, or delete profiles.
        </p>
      </div>

      <UserTable initialUsers={users} />
    </div>
  );
}
