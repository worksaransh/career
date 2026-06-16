import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Download, Loader2, Search, Shield, Trash2, Users as UsersIcon } from "lucide-react";
import { deleteUser, listUsers, setUserRole } from "@/lib/admin.functions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});

function UsersPage() {
  const fn = useServerFn(listUsers);
  const roleFn = useServerFn(setUserRole);
  const delFn = useServerFn(deleteUser);
  const [q, setQ] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<"all" | "admin" | "user">("all");
  const [classFilter, setClassFilter] = React.useState<string>("all");
  const [sort, setSort] = React.useState<"recent" | "xp" | "name">("recent");
  const { data, isLoading, refetch } = useQuery({ queryKey: ["admin-users"], queryFn: () => fn() });

  const classes = React.useMemo(() => {
    const s = new Set<string>();
    (data ?? []).forEach((u) => u.class_level && s.add(u.class_level));
    return Array.from(s).sort();
  }, [data]);

  const filtered = React.useMemo(() => {
    let list = data ?? [];
    const s = q.trim().toLowerCase();
    if (s) {
      list = list.filter(
        (u) =>
          (u.email ?? "").toLowerCase().includes(s) ||
          (u.full_name ?? "").toLowerCase().includes(s) ||
          (u.city ?? "").toLowerCase().includes(s),
      );
    }
    if (roleFilter !== "all") {
      list = list.filter((u) =>
        roleFilter === "admin" ? u.roles.includes("admin") : !u.roles.includes("admin"),
      );
    }
    if (classFilter !== "all") {
      list = list.filter((u) => u.class_level === classFilter);
    }
    list = [...list].sort((a, b) => {
      if (sort === "xp") return (b.xp ?? 0) - (a.xp ?? 0);
      if (sort === "name") return (a.full_name ?? "").localeCompare(b.full_name ?? "");
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return list;
  }, [data, q, roleFilter, classFilter, sort]);

  async function toggleAdmin(userId: string, isAdmin: boolean) {
    try {
      await roleFn({ data: { userId, role: "admin", grant: !isAdmin } });
      toast.success(isAdmin ? "Admin removed" : "Granted admin");
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  async function remove(userId: string) {
    if (!confirm("Delete this user permanently?")) return;
    try {
      await delFn({ data: { userId } });
      toast.success("User deleted");
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  function exportCsv() {
    const rows = [
      ["Name", "Email", "Class", "Stream", "City", "XP", "Streak", "Roles", "Joined"],
      ...filtered.map((u) => [
        u.full_name ?? "",
        u.email ?? "",
        u.class_level ?? "",
        u.stream ?? "",
        u.city ?? "",
        String(u.xp ?? 0),
        String(u.streak ?? 0),
        u.roles.join("|"),
        u.created_at,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Operations
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} of {data?.length ?? 0} accounts shown
          </p>
        </div>
        <Button variant="outline" onClick={exportCsv} disabled={!filtered.length}>
          <Download className="mr-1 h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card p-3 shadow-sm">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-9 pl-9"
            placeholder="Search name, email, city…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as typeof roleFilter)}>
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
            <SelectItem value="user">Users</SelectItem>
          </SelectContent>
        </Select>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All classes</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c} value={c}>
                Class {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently joined</SelectItem>
            <SelectItem value="xp">XP (high → low)</SelectItem>
            <SelectItem value="name">Name (A→Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        {isLoading ? (
          <div className="flex items-center p-6 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading users…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Class · Stream</th>
                  <th className="px-4 py-3 font-semibold">City</th>
                  <th className="px-4 py-3 font-semibold">XP</th>
                  <th className="px-4 py-3 font-semibold">Roles</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const isAdmin = u.roles.includes("admin");
                  const initials = (u.full_name ?? u.email ?? "?")
                    .split(/[\s@]+/)
                    .slice(0, 2)
                    .map((s) => s[0]?.toUpperCase() ?? "")
                    .join("");
                  return (
                    <tr key={u.id} className="border-t border-border/60 hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-xs font-bold text-primary">
                            {initials || <UsersIcon className="h-4 w-4" />}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-medium">{u.full_name ?? "—"}</div>
                            <div className="truncate text-xs text-muted-foreground">{u.email ?? "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {u.class_level ?? "—"}{u.stream ? ` · ${u.stream}` : ""}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{u.city ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">{u.xp ?? 0}</span>
                      </td>
                      <td className="px-4 py-3">
                        {isAdmin ? (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                            admin
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">user</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => toggleAdmin(u.id, isAdmin)}>
                            <Shield className="mr-1 h-3.5 w-3.5" />
                            {isAdmin ? "Revoke" : "Make admin"}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => remove(u.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      No users match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
