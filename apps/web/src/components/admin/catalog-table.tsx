"use client";

import React, { useState, useMemo, useRef } from "react";
import { Edit3, Loader2, Plus, Search, Trash2, X, Download, Upload, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

export type Column<T> = {
  key: keyof T & string;
  label: string;
  render?: (row: T) => React.ReactNode;
};

export type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select" | "list" | "date" | "boolean";
  options?: string[];
  placeholder?: string;
};

type CatalogTableProps<T extends { id?: string }> = {
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
  searchKeys?: string[];
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
}: CatalogTableProps<T>) {
  const [editing, setEditing] = useState<T | null>(null);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const keys = searchKeys ?? columns.map((c) => c.key);

  const filtered = useMemo(() => {
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

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    try {
      await onSave(editing);
      setEditing(null);
      refetch();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    try {
      await onDelete(id);
      refetch();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  // --- Bulk Actions ---
  const toggleSelectAll = () => {
    const activeIds = filtered.map((r) => r.id).filter(Boolean) as string[];
    if (selectedIds.length === activeIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(activeIds);
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected entries?`)) return;

    const toastId = toast.loading(`Deleting ${selectedIds.length} entries...`);
    try {
      // Execute deletions concurrently in batches of 5
      const limit = 5;
      for (let i = 0; i < selectedIds.length; i += limit) {
        const batch = selectedIds.slice(i, i + limit);
        await Promise.all(batch.map((id) => onDelete(id)));
      }
      toast.success("Bulk deletions completed successfully!", { id: toastId });
      setSelectedIds([]);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to complete bulk deletions", { id: toastId });
    }
  };

  // --- Export CSV ---
  const handleBulkExport = () => {
    const dataToExport = selectedIds.length > 0 
      ? (rows ?? []).filter((r) => r.id && selectedIds.includes(r.id))
      : filtered;

    if (dataToExport.length === 0) {
      toast.error("No entries to export");
      return;
    }

    const headers = columns.map((c) => c.label);
    const keysToExtract = columns.map((c) => c.key);

    const csvRows = dataToExport.map((row) =>
      keysToExtract.map((key) => {
        const val = (row as Record<string, unknown>)[key];
        if (Array.isArray(val)) return `"${val.join(";")}"`;
        return `"${String(val ?? "").replace(/"/g, '""')}"`;
      })
    );

    const csvContent = 
      "data:text/csv;charset=utf-8," + 
      [headers.join(","), ...csvRows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV export successfully generated!");
  };

  // --- Import CSV ---
  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const toastId = toast.loading("Uploading and parsing CSV...");
    const reader = new FileReader();

    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (!content) {
        toast.error("Failed to read CSV content", { id: toastId });
        setImporting(false);
        return;
      }

      try {
        const lines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        if (lines.length < 2) {
          toast.error("CSV file must contain a header and at least one row", { id: toastId });
          setImporting(false);
          return;
        }

        // Simple CSV splitter
        const parseLine = (line: string) => {
          const res = [];
          let current = "";
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const c = line[i];
            if (c === '"') {
              inQuotes = !inQuotes;
            } else if (c === "," && !inQuotes) {
              res.push(current.trim());
              current = "";
            } else {
              current += c;
            }
          }
          res.push(current.trim());
          return res.map(r => r.replace(/^["']|["']$/g, ""));
        };

        const headers = parseLine(lines[0] || "").map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, ""));
        const parsedRows: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = parseLine(lines[i] || "");
          const rowObj: any = { ...emptyTemplate };
          
          fields.forEach((f) => {
            // Find matched header
            const hIndex = headers.indexOf(f.key.toLowerCase());
            if (hIndex !== -1 && values[hIndex] !== undefined) {
              const val = values[hIndex] || "";
              if (f.type === "number") {
                rowObj[f.key] = Number(val) || 0;
              } else if (f.type === "list") {
                rowObj[f.key] = val.split(/[;,]/).map(s => s.trim()).filter(Boolean);
              } else {
                rowObj[f.key] = val;
              }
            }
          });
          parsedRows.push(rowObj);
        }

        toast.loading(`Importing ${parsedRows.length} entries (concurrency level: 5)...`, { id: toastId });
        
        // Parallel imports
        const limit = 5;
        for (let i = 0; i < parsedRows.length; i += limit) {
          const chunk = parsedRows.slice(i, i + limit);
          await Promise.all(chunk.map((item) => onSave(item)));
        }

        toast.success(`Successfully imported ${parsedRows.length} records!`, { id: toastId });
        refetch();
      } catch (err: any) {
        toast.error(err.message || "Parse/Import failed", { id: toastId });
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">
            {eyebrow}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {description} · Showing {filtered.length} of {rows?.length ?? 0} entries
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* CSV Import */}
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleCsvImport}
            className="hidden"
            disabled={importing}
          />
          <Button
            variant="glass"
            disabled={importing}
            onClick={() => fileInputRef.current?.click()}
          >
            {importing ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Upload className="mr-1.5 h-4 w-4" />} Bulk Import
          </Button>

          {/* Export button */}
          <Button variant="glass" onClick={handleBulkExport}>
            <Download className="mr-1.5 h-4 w-4" /> Export CSV
          </Button>

          <Button variant="gradient" onClick={() => setEditing({ ...(emptyTemplate as T) })}>
            <Plus className="mr-1.5 h-4 w-4" /> New Entry
          </Button>
        </div>
      </div>

      {/* Bulk actions and search bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card/50 p-4 shadow-sm backdrop-blur-sm">
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-10 pl-9"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-2 duration-200">
            <span className="text-xs font-semibold text-muted-foreground">
              {selectedIds.length} items selected
            </span>
            <Button
              size="sm"
              variant="destructive"
              className="rounded-xl px-3"
              onClick={handleBulkDelete}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete Selected
            </Button>
          </div>
        )}
      </div>

      {/* Table grid */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        {isLoading ? (
          <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" /> Loading catalog details...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase font-semibold text-muted-foreground tracking-wider border-b border-border">
                <tr>
                  <th className="px-5 py-4 w-12 text-center">
                    <button onClick={toggleSelectAll} className="text-muted-foreground hover:text-foreground">
                      {selectedIds.length === filtered.map(f => f.id).filter(Boolean).length && filtered.length > 0 ? (
                        <CheckSquare className="h-4 w-4 text-primary" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  {columns.map((c) => (
                    <th key={c.key} className="px-5 py-4 font-semibold">
                      {c.label}
                    </th>
                  ))}
                  <th className="px-5 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((row, i) => {
                  const isChecked = row.id ? selectedIds.includes(row.id) : false;
                  return (
                    <tr key={row.id ?? i} className={`hover:bg-muted/20 transition-colors ${isChecked ? "bg-primary/5" : ""}`}>
                      <td className="px-5 py-4 text-center">
                        <button
                          disabled={!row.id}
                          onClick={() => row.id && toggleSelect(row.id)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {isChecked ? (
                            <CheckSquare className="h-4 w-4 text-primary" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      {columns.map((c) => (
                        <td key={c.key} className="px-5 py-4 text-foreground/90 font-medium">
                          {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "—")}
                        </td>
                      ))}
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => setEditing({ ...row })}
                          >
                            <Edit3 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-destructive/10"
                            onClick={() => row.id && handleDelete(row.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive/80 hover:text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!filtered.length && (
                  <tr>
                    <td
                      colSpan={columns.length + 2}
                      className="px-5 py-12 text-center text-sm text-muted-foreground"
                    >
                      {rows?.length ? "No matches found." : "No records exist."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Custom Glassmorphic Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-background/95 p-6 shadow-2xl backdrop-blur-lg flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="text-xl font-bold tracking-tight">
                {editing.id ? "Edit Entry" : "Create New Entry"}
              </h3>
              <button
                onClick={() => setEditing(null)}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto py-5 space-y-4 pr-2 flex-1">
              {fields.map((f) => {
                const val = (editing as Record<string, unknown>)[f.key];
                const setVal = (v: unknown) => setEditing({ ...editing, [f.key]: v } as T);

                if (f.type === "textarea") {
                  return (
                    <div key={f.key} className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {f.label}
                      </label>
                      <textarea
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                        rows={4}
                        placeholder={f.placeholder}
                        value={(val as string) ?? ""}
                        onChange={(e) => setVal(e.target.value)}
                      />
                    </div>
                  );
                }

                if (f.type === "select" && f.options) {
                  return (
                    <div key={f.key} className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {f.label}
                      </label>
                      <select
                        className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                        value={(val as string) ?? ""}
                        onChange={(e) => setVal(e.target.value)}
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
                    <div key={f.key} className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {f.label} <span className="text-[10px] text-muted-foreground">(comma-separated)</span>
                      </label>
                      <Input
                        className="h-11 rounded-xl"
                        value={arr.join(", ")}
                        placeholder={f.placeholder}
                        onChange={(e) =>
                          setVal(
                            e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean)
                          )
                        }
                      />
                    </div>
                  );
                }

                if (f.type === "number") {
                  return (
                    <div key={f.key} className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {f.label}
                      </label>
                      <Input
                        type="number"
                        className="h-11 rounded-xl"
                        value={(val as number | null) ?? ""}
                        onChange={(e) =>
                          setVal(e.target.value === "" ? null : Number(e.target.value))
                        }
                      />
                    </div>
                  );
                }

                if (f.type === "date") {
                  const dateStr = val ? new Date(val as string).toISOString().split("T")[0] : "";
                  return (
                    <div key={f.key} className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {f.label}
                      </label>
                      <Input
                        type="date"
                        className="h-11 rounded-xl text-foreground"
                        value={dateStr}
                        onChange={(e) => setVal(e.target.value ? new Date(e.target.value).toISOString() : null)}
                      />
                    </div>
                  );
                }

                if (f.type === "boolean") {
                  return (
                    <div key={f.key} className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/5">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {f.label}
                      </span>
                      <input
                        type="checkbox"
                        checked={!!val}
                        onChange={(e) => setVal(e.target.checked)}
                        className="h-5 w-5 rounded border-border text-primary focus:ring-primary/20 bg-background"
                      />
                    </div>
                  );
                }

                return (
                  <div key={f.key} className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {f.label}
                    </label>
                    <Input
                      className="h-11 rounded-xl"
                      placeholder={f.placeholder}
                      value={(val as string) ?? ""}
                      onChange={(e) => setVal(e.target.value)}
                    />
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} variant="gradient">
                {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />} Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
