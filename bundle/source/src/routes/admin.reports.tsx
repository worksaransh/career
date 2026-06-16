import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Archive, FileText, Flag, Loader2, RotateCw, Search, Trash2 } from "lucide-react";
import { deleteReport, listReports, updateReportStatus } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reports")({
  component: ReportsPage,
});

type Status = "all" | "active" | "flagged" | "archived";

function ReportsPage() {
  const list = useServerFn(listReports);
  const setStatus = useServerFn(updateReportStatus);
  const del = useServerFn(deleteReport);
  const { data, isLoading, refetch } = useQuery({ queryKey: ["admin-reports"], queryFn: () => list() });
  const [q, setQ] = React.useState("");
  const [status, setStatusFilter] = React.useState<Status>("all");

  const filtered = React.useMemo(() => {
    let list = data ?? [];
    if (status !== "all") list = list.filter((r) => r.status === status);
    const s = q.trim().toLowerCase();
    if (s) {
      list = list.filter(
        (r) =>
          (r.user?.full_name ?? "").toLowerCase().includes(s) ||
          (r.user?.email ?? "").toLowerCase().includes(s) ||
          (r.summary ?? "").toLowerCase().includes(s),
      );
    }
    return list;
  }, [data, q, status]);

  const counts = React.useMemo(() => {
    const c = { active: 0, flagged: 0, archived: 0 };
    (data ?? []).forEach((r) => {
      if (r.status === "flagged") c.flagged++;
      else if (r.status === "archived") c.archived++;
      else c.active++;
    });
    return c;
  }, [data]);

  async function changeStatus(id: string, s: "active" | "flagged" | "archived") {
    try {
      await setStatus({ data: { id, status: s } });
      toast.success(`Marked as ${s}`);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this report?")) return;
    try {
      await del({ data: { id } });
      toast.success("Deleted");
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Operations
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">
          {filtered.length} of {data?.length ?? 0} generated career reports
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatusKpi label="Active" value={counts.active} tone="emerald" />
        <StatusKpi label="Flagged" value={counts.flagged} tone="rose" />
        <StatusKpi label="Archived" value={counts.archived} tone="muted" />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card p-3 shadow-sm">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-9 pl-9"
            placeholder="Search student or summary…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatusFilter(v as Status)}>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        {isLoading ? (
          <div className="flex items-center p-6 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Student</th>
                  <th className="px-4 py-3 font-semibold">Summary</th>
                  <th className="px-4 py-3 font-semibold">Careers</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-border/60 align-top hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.user?.full_name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{r.user?.email ?? "—"}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="line-clamp-2 max-w-md">{r.summary ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                        {r.careerCount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        {r.status !== "flagged" && (
                          <Button size="sm" variant="outline" onClick={() => changeStatus(r.id, "flagged")}>
                            <Flag className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {r.status !== "archived" && (
                          <Button size="sm" variant="outline" onClick={() => changeStatus(r.id, "archived")}>
                            <Archive className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {r.status !== "active" && (
                          <Button size="sm" variant="outline" onClick={() => changeStatus(r.id, "active")}>
                            <RotateCw className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => remove(r.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      No reports match these filters.
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

function StatusKpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "rose" | "muted";
}) {
  const toneCls =
    tone === "emerald"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "rose"
        ? "text-rose-600 dark:text-rose-400"
        : "text-muted-foreground";
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs font-medium">{label}</span>
        <FileText className={`h-4 w-4 ${toneCls}`} />
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight">{value.toLocaleString()}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "flagged"
      ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
      : status === "archived"
        ? "bg-muted text-muted-foreground"
        : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${cls}`}>{status}</span>;
}
