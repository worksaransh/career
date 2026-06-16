import * as React from "react";
import { Edit3, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export type Column<T> = {
  key: keyof T & string;
  label: string;
  render?: (row: T) => React.ReactNode;
};

export type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select" | "list";
  options?: string[];
  placeholder?: string;
};

type Props<T extends { id?: string }> = {
  title: string;
  description: string;
  rows: T[] | undefined;
  isLoading: boolean;
  columns: Column<T>[];
  fields: FieldDef[];
  emptyTemplate: Partial<T>;
  onSave: (row: T) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
  refetch: () => void;
  /** Keys to search across (string/array values). Defaults to all string columns. */
  searchKeys?: string[];
  /** Eyebrow label rendered above the title. */
  eyebrow?: string;
};

export function CatalogTable<T extends { id?: string }>({
  title,
  description,
  rows,
  isLoading,
  columns,
  fields,
  emptyTemplate,
  onSave,
  onDelete,
  refetch,
  searchKeys,
  eyebrow = "Catalog",
}: Props<T>) {
  const [editing, setEditing] = React.useState<T | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [q, setQ] = React.useState("");

  const keys = searchKeys ?? columns.map((c) => c.key);

  const filtered = React.useMemo(() => {
    const list = rows ?? [];
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter((row) =>
      keys.some((k) => {
        const v = (row as Record<string, unknown>)[k];
        if (Array.isArray(v)) return v.join(" ").toLowerCase().includes(s);
        return String(v ?? "").toLowerCase().includes(s);
      }),
    );
  }, [rows, q, keys]);

  async function save() {
    if (!editing) return;
    setSaving(true);
    try {
      await onSave(editing);
      toast.success("Saved");
      setEditing(null);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this entry?")) return;
    try {
      await onDelete(id);
      toast.success("Deleted");
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {eyebrow}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {description} · {filtered.length} of {rows?.length ?? 0}
          </p>
        </div>
        <Button onClick={() => setEditing({ ...(emptyTemplate as T) })}>
          <Plus className="mr-1 h-4 w-4" /> New
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card p-3 shadow-sm">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-9 pl-9"
            placeholder="Search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
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
                  {columns.map((c) => (
                    <th key={c.key} className="px-4 py-3 font-semibold">
                      {c.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={row.id ?? i} className="border-t border-border/60 hover:bg-muted/30">
                    {columns.map((c) => (
                      <td key={c.key} className="px-4 py-3">
                        {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "—")}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditing({ ...row })}>
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => row.id && remove(row.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      {rows?.length ? "No entries match your search." : "No entries yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit" : "New"} entry</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
              {fields.map((f) => {
                const val = (editing as Record<string, unknown>)[f.key];
                const set = (v: unknown) => setEditing({ ...editing, [f.key]: v } as T);
                if (f.type === "textarea") {
                  return (
                    <div key={f.key}>
                      <label className="text-xs font-medium">{f.label}</label>
                      <textarea
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        rows={3}
                        value={(val as string) ?? ""}
                        onChange={(e) => set(e.target.value)}
                      />
                    </div>
                  );
                }
                if (f.type === "select" && f.options) {
                  return (
                    <div key={f.key}>
                      <label className="text-xs font-medium">{f.label}</label>
                      <select
                        className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        value={(val as string) ?? ""}
                        onChange={(e) => set(e.target.value)}
                      >
                        {f.options.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }
                if (f.type === "list") {
                  const arr = (val as string[] | null) ?? [];
                  return (
                    <div key={f.key}>
                      <label className="text-xs font-medium">{f.label} (comma-separated)</label>
                      <Input
                        className="mt-1 h-10"
                        value={arr.join(", ")}
                        placeholder={f.placeholder}
                        onChange={(e) =>
                          set(
                            e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          )
                        }
                      />
                    </div>
                  );
                }
                if (f.type === "number") {
                  return (
                    <div key={f.key}>
                      <label className="text-xs font-medium">{f.label}</label>
                      <Input
                        type="number"
                        className="mt-1 h-10"
                        value={(val as number | null) ?? ""}
                        onChange={(e) => set(e.target.value === "" ? null : Number(e.target.value))}
                      />
                    </div>
                  );
                }
                return (
                  <div key={f.key}>
                    <label className="text-xs font-medium">{f.label}</label>
                    <Input
                      className="mt-1 h-10"
                      placeholder={f.placeholder}
                      value={(val as string) ?? ""}
                      onChange={(e) => set(e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
