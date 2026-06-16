"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserRole, deleteUser, impersonateUser, toggleUserSuspension, grantPremiumTier, assignUserTags } from "@/lib/actions/admin-actions";
import { Search, Download, Trash2, ShieldAlert, Loader2, Shield, Eye, Lock, Unlock, Zap, Plus, X } from "lucide-react";
import toast from "react-hot-toast";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string;
  profile: {
    interests: string[];
    educationLevel: string | null;
    currentGrade: string | null;
    location: string | null;
  } | null;
}

interface UserTableProps {
  initialUsers: User[];
}

const ROLES = ["USER", "ADMIN", "SUPER_ADMIN", "ANALYST", "FINANCE", "CONTENT_MANAGER", "SUPPORT_AGENT", "MODERATOR"];

export function UserTable({ initialUsers }: UserTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Modal details
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [userTags, setUserTags] = useState<string[]>([]);
  const [showTagModalId, setShowTagModalId] = useState<string | null>(null);

  const filteredUsers = initialUsers.filter((user) => {
    const matchesSearch =
      (user.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (user.email?.toLowerCase() || "").includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    const toastId = toast.loading("Updating user role...");
    try {
      const res = await updateUserRole(userId, newRole);
      if (res.success) {
        toast.success("Role updated successfully!", { id: toastId });
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update role", { id: toastId });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (userId: string) => {
    const toastId = toast.loading("Deleting user...");
    try {
      const res = await deleteUser(userId);
      if (res.success) {
        toast.success("User deleted successfully!", { id: toastId });
        setConfirmDeleteId(null);
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user", { id: toastId });
    }
  };

  const handleImpersonate = async (user: User) => {
    const toastId = toast.loading(`Initiating impersonation of ${user.name || "User"}...`);
    try {
      await impersonateUser(user.id);
      toast.success(`Impersonating ${user.name}! Mode enabled on client.`, { id: toastId });
      // In a real environment, setting a session identifier and redirecting:
      window.sessionStorage.setItem("impersonate_user_id", user.id);
      window.sessionStorage.setItem("impersonate_user_name", user.name || "User");
      startTransition(() => {
        router.refresh();
        router.push("/dashboard");
      });
    } catch (err: any) {
      toast.error(err.message || "Impersonate failed", { id: toastId });
    }
  };

  const handleToggleSuspend = async (user: User) => {
    const isSuspended = user.role === "SUSPENDED";
    const action = isSuspended ? "Activating" : "Suspending";
    const toastId = toast.loading(`${action} user account...`);
    try {
      await toggleUserSuspension(user.id, !isSuspended);
      toast.success(`User ${isSuspended ? "activated" : "suspended"} successfully!`, { id: toastId });
      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      toast.error(err.message || "Suspension update failed", { id: toastId });
    }
  };

  const handleGrantPremium = async (user: User, grant: boolean) => {
    const toastId = toast.loading(`${grant ? "Granting" : "Revoking"} premium tier...`);
    try {
      await grantPremiumTier(user.id, grant);
      toast.success(`Premium tier ${grant ? "granted" : "revoked"} successfully!`, { id: toastId });
      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      toast.error(err.message || "Premium tier update failed", { id: toastId });
    }
  };

  const handleOpenTags = (user: User) => {
    setShowTagModalId(user.id);
    setUserTags(user.profile?.interests || []);
    setTagInput("");
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (userTags.includes(tagInput.trim())) return;
    setUserTags([...userTags, tagInput.trim()]);
    setTagInput("");
  };

  const handleSaveTags = async () => {
    if (!showTagModalId) return;
    const toastId = toast.loading("Saving user tags...");
    try {
      await assignUserTags(showTagModalId, userTags);
      toast.success("User tags saved successfully!", { id: toastId });
      setShowTagModalId(null);
      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to save tags", { id: toastId });
    }
  };

  const handleExportCSV = () => {
    if (filteredUsers.length === 0) {
      toast.error("No users to export");
      return;
    }

    const headers = ["ID", "Name", "Email", "Role", "Created At", "Location", "Education Level", "Interests"];
    const rows = filteredUsers.map((u) => [
      u.id,
      u.name || "",
      u.email || "",
      u.role,
      u.createdAt,
      u.profile?.location || "",
      u.profile?.educationLevel || "",
      (u.profile?.interests || []).join(";"),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))].join(
        "\n"
      );

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `career-os-users-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV download triggered!");
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border/80 bg-card/40 pl-10 pr-4 py-2.5 text-sm outline-none ring-primary/20 focus:border-primary focus:ring-4 transition-all text-foreground"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-border/80 bg-card/40 px-3.5 py-2.5 text-sm outline-none ring-primary/20 focus:border-primary focus:ring-4 transition-all cursor-pointer font-semibold text-muted-foreground hover:text-foreground"
          >
            <option value="ALL">All Roles</option>
            <option value="SUSPENDED">SUSPENDED</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r.replace("_", " ")}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-xl bg-card border border-border/80 px-4 py-2.5 text-sm font-semibold hover:bg-accent hover:text-foreground shadow-sm transition-all"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-border/85 bg-card/30 backdrop-blur-md shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/80 bg-card/65 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-4">User profile</th>
                <th className="px-5 py-4">Current Permission</th>
                <th className="px-5 py-4">Education details</th>
                <th className="px-5 py-4">Date Joined</th>
                <th className="px-5 py-4 text-right">Operations & Roles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                    No users match the search criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isSuspended = user.role === "SUSPENDED";
                  return (
                    <tr key={user.id} className={`hover:bg-accent/10 transition-colors ${isSuspended ? "bg-rose-500/5 opacity-80" : ""}`}>
                      {/* Name and Email */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground inline-flex items-center gap-1.5">
                            {user.name || "Unnamed"}
                            {isSuspended && (
                              <span className="text-[10px] bg-destructive/10 text-destructive border border-destructive/20 rounded px-1.5 py-0.5">
                                Suspended
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">{user.email || "No email"}</span>
                        </div>
                      </td>

                      {/* Role dropdown */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {updatingId === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          ) : user.role === "SUPER_ADMIN" ? (
                            <Shield className="h-4 w-4 text-amber-500" />
                          ) : null}
                          <select
                            value={user.role}
                            disabled={updatingId === user.id}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="bg-transparent font-semibold border-0 focus:ring-0 p-0 text-foreground cursor-pointer text-xs uppercase"
                          >
                            <option value="SUSPENDED">SUSPENDED</option>
                            {ROLES.map((r) => (
                              <option key={r} value={r} className="bg-card text-foreground">
                                {r}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Location & education */}
                      <td className="px-5 py-4 text-xs text-muted-foreground">
                        <div className="flex flex-col">
                          <span>{user.profile?.educationLevel || "Degree: —"}</span>
                          <span>{user.profile?.location || "Location: —"}</span>
                        </div>
                      </td>

                      {/* Created at */}
                      <td className="px-5 py-4 text-xs text-muted-foreground font-medium">
                        {new Date(user.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          {/* Details */}
                          <button
                            onClick={() => setSelectedUser(user)}
                            title="View user details & timeline"
                            className="rounded-xl border border-border bg-card p-2 text-muted-foreground hover:text-foreground shadow-sm transition-all"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Tags */}
                          <button
                            onClick={() => handleOpenTags(user)}
                            title="Assign tags"
                            className="rounded-xl border border-border bg-card px-2 py-1 text-xs text-muted-foreground hover:text-foreground shadow-sm font-semibold transition-all"
                          >
                            Tags ({user.profile?.interests.length || 0})
                          </button>

                          {/* Suspend / Unsuspend */}
                          <button
                            onClick={() => handleToggleSuspend(user)}
                            title={isSuspended ? "Activate User" : "Suspend User"}
                            className={`rounded-xl border p-2 shadow-sm transition-all ${
                              isSuspended 
                                ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/15" 
                                : "border-rose-500/30 text-rose-500 bg-rose-500/5 hover:bg-rose-500/15"
                            }`}
                          >
                            {isSuspended ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                          </button>

                          {/* Grant Premium */}
                          <button
                            onClick={() => handleGrantPremium(user, true)}
                            title="Grant Lifetime Premium"
                            className="rounded-xl border border-primary/20 bg-primary/5 p-2 text-primary hover:bg-primary/10 shadow-sm transition-all"
                          >
                            <Zap className="h-4 w-4" />
                          </button>

                          {/* Impersonate */}
                          <button
                            onClick={() => handleImpersonate(user)}
                            title="Impersonate User"
                            className="rounded-xl border border-border bg-card px-2 py-1 text-xs text-muted-foreground hover:text-foreground shadow-sm font-bold transition-all"
                          >
                            Login
                          </button>

                          {/* Delete */}
                          {confirmDeleteId === user.id ? (
                            <div className="flex items-center gap-1.5 scale-95 origin-right duration-250">
                              <button
                                onClick={() => handleDelete(user.id)}
                                className="rounded-lg bg-destructive px-2 py-1 text-xs font-bold text-destructive-foreground hover:bg-destructive/95"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="rounded-lg border border-border bg-card px-2 py-1 text-xs font-medium hover:bg-accent"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(user.id)}
                              title="Delete profile"
                              className="rounded-xl border border-border bg-card p-2 text-muted-foreground hover:text-destructive hover:border-destructive/40 shadow-sm transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tags editing modal */}
      {showTagModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl flex flex-col gap-4 text-foreground">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-lg font-bold">Assign Tags & Interests</h3>
              <button onClick={() => setShowTagModalId(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter tag (e.g. Science, IIT)..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                className="flex-1 h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              />
              <button
                onClick={handleAddTag}
                className="h-10 rounded-xl bg-primary text-primary-foreground px-4 text-sm font-semibold hover:bg-primary/95 transition-all"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* List */}
            <div className="flex flex-wrap gap-2 py-2 min-h-[60px] max-h-[150px] overflow-y-auto border border-dashed border-border rounded-xl p-3">
              {userTags.length === 0 ? (
                <span className="text-xs text-muted-foreground m-auto">No tags assigned.</span>
              ) : (
                userTags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 rounded bg-accent/60 px-2.5 py-1 text-xs font-semibold text-foreground">
                    {t}
                    <button
                      onClick={() => setUserTags(userTags.filter((x) => x !== t))}
                      className="text-muted-foreground hover:text-foreground ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border mt-1">
              <button
                onClick={() => setShowTagModalId(null)}
                className="px-4 py-2 text-sm font-medium hover:bg-accent rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTags}
                className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all"
              >
                Save Tags
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User details & timeline modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto text-foreground">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-xl font-bold">{selectedUser.name || "Unnamed"}</h3>
                <span className="text-xs text-muted-foreground font-mono">{selectedUser.id}</span>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground font-medium uppercase tracking-wider block">Email Address</span>
                <span className="font-semibold">{selectedUser.email || "—"}</span>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground font-medium uppercase tracking-wider block">Joined Date</span>
                <span className="font-semibold">{new Date(selectedUser.createdAt).toLocaleString()}</span>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground font-medium uppercase tracking-wider block">Education track</span>
                <span className="font-semibold">{selectedUser.profile?.educationLevel || "Not configured"}</span>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground font-medium uppercase tracking-wider block">Current grade</span>
                <span className="font-semibold">{selectedUser.profile?.currentGrade || "Not configured"}</span>
              </div>
            </div>

            {/* Profile timeline activity mock */}
            <div className="space-y-3 pt-3 border-t border-border">
              <h4 className="text-sm font-bold">Recent Account Activity</h4>
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-border">
                {[
                  { time: "Assessment completed successfully", date: "Today" },
                  { time: "Onboarded and profile generated", date: "Today" },
                  { time: "Account registered via credentials", date: new Date(selectedUser.createdAt).toLocaleDateString() },
                ].map((item, i) => (
                  <div key={i} className="relative text-xs">
                    <span className="absolute -left-[22px] top-1 h-2 w-2 rounded-full bg-primary ring-4 ring-card" />
                    <p className="font-semibold text-foreground">{item.time}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.date}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/95 transition-all"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 text-xs text-amber-500">
        <ShieldAlert className="h-5 w-5 flex-shrink-0" />
        <div>
          <span className="font-bold uppercase tracking-wider block mb-1">Super Admin Role Controls</span>
          Only users with the <span className="font-semibold font-mono">SUPER_ADMIN</span> role can upgrade user permission levels or delete other accounts. Always verify user identities before granting administrative roles.
        </div>
      </div>
    </div>
  );
}
