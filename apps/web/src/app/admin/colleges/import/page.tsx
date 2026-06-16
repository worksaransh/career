"use client";

import React, { useState, useCallback } from "react";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, X, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

interface ImportResult {
  total: number;
  imported: number;
  skipped: number;
  errors: number;
  skippedReasons: { index: number; reason: string }[];
  errorDetails: { index: number; error: string }[];
}

interface BatchRecord {
  id: string;
  fileName: string;
  type: string;
  totalRecords: number;
  importedRecords: number;
  skippedRecords: number;
  errorRecords: number;
  status: string;
  completedAt: string | null;
  createdAt: string;
}

export default function AdminCollegeImportPage() {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [batches, setBatches] = useState<BatchRecord[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [csvText, setCsvText] = useState("");

  const loadBatches = useCallback(async () => {
    setLoadingBatches(true);
    try {
      const res = await fetch("/api/import-batches");
      const json = await res.json();
      if (json.success) setBatches(json.data);
    } catch {
      // silently fail
    } finally {
      setLoadingBatches(false);
    }
  }, []);

  React.useEffect(() => { loadBatches(); }, [loadBatches]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }
    setImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/colleges/import", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success) {
        setImportResult(json.data);
        toast.success(`Imported ${json.data.imported} colleges`);
        loadBatches();
      } else {
        toast.error(json.error?.message ?? "Import failed");
      }
    } catch {
      toast.error("Import request failed");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const handlePasteImport = async () => {
    if (!csvText.trim()) {
      toast.error("Paste CSV data first");
      return;
    }
    setImporting(true);
    setImportResult(null);
    try {
      const res = await fetch("/api/colleges/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: csvText }),
      });
      const json = await res.json();
      if (json.success) {
        setImportResult(json.data);
        toast.success(`Imported ${json.data.imported} colleges`);
        setCsvText("");
        loadBatches();
      } else {
        toast.error(json.error?.message ?? "Import failed");
      }
    } catch {
      toast.error("Import request failed");
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch("/api/colleges/export");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `colleges-export-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded");
    } catch {
      toast.error("Export failed");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">Data Management</span>
        <h1 className="text-3xl font-extrabold tracking-tight mt-1">College Import / Export</h1>
        <p className="text-sm text-muted-foreground mt-1">Bulk import colleges from CSV or paste data, export existing records.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-bold text-lg flex items-center gap-2 mb-4"><Upload className="h-5 w-5 text-primary" /> Import Colleges</h2>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">
              Upload CSV File
            </label>
            <label className="flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed border-border bg-accent/20 hover:bg-accent/40 cursor-pointer transition-colors">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Click to upload CSV</span>
              <span className="text-xs text-muted-foreground mt-1">name, location, ranking, feesTotal, avgPackage, ...</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" disabled={importing} />
            </label>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">or paste CSV data</span></div>
          </div>

          <div className="mt-4">
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="name,location,ranking,feesTotal,avgPackage,placementPercent..."
              rows={5}
              className="w-full rounded-xl border border-border bg-background p-3 text-xs font-mono outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
            <button
              onClick={handlePasteImport}
              disabled={importing || !csvText.trim()}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
              {importing ? "Importing..." : "Import from Paste"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-bold text-lg flex items-center gap-2 mb-4"><Download className="h-5 w-5 text-primary" /> Export Colleges</h2>
          <p className="text-sm text-muted-foreground mb-4">Download all college records as a CSV file for backup or external processing.</p>
          <button
            onClick={handleExport}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Download className="h-4 w-4" /> Export All Colleges
          </button>

          <div className="mt-6">
            <h3 className="font-semibold text-sm mb-2">Expected CSV Headers</h3>
            <code className="block text-[10px] text-muted-foreground bg-accent p-3 rounded-xl leading-relaxed">
              name,slug,description,location,city,state,ranking,feesTotal,feesTuition,feesLiving,avgPackage,highestPackage,placementPercent,topRecruiters,rating,studentCount,establishedYear,ownership,accreditation,affiliatedTo,website,collegeType
            </code>
          </div>
        </div>
      </div>

      {importResult && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4">Import Result</h3>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 rounded-xl bg-accent">
              <p className="text-2xl font-bold text-primary">{importResult.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-emerald-500/10">
              <p className="text-2xl font-bold text-emerald-500">{importResult.imported}</p>
              <p className="text-xs text-muted-foreground">Imported</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-amber-500/10">
              <p className="text-2xl font-bold text-amber-500">{importResult.skipped}</p>
              <p className="text-xs text-muted-foreground">Skipped</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-rose-500/10">
              <p className="text-2xl font-bold text-rose-500">{importResult.errors}</p>
              <p className="text-xs text-muted-foreground">Errors</p>
            </div>
          </div>
          {importResult.errorDetails.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-semibold text-rose-500 mb-2">Errors:</p>
              <div className="max-h-32 overflow-y-auto text-xs space-y-1">
                {importResult.errorDetails.map((e, i) => (
                  <p key={i} className="text-muted-foreground">Row {e.index + 1}: {e.error}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-4">Import History</h3>
        {loadingBatches ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : batches.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No import batches found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 font-semibold">File</th>
                  <th className="pb-2 font-semibold">Date</th>
                  <th className="pb-2 font-semibold">Status</th>
                  <th className="pb-2 font-semibold text-right">Total</th>
                  <th className="pb-2 font-semibold text-right">Imported</th>
                  <th className="pb-2 font-semibold text-right">Skipped</th>
                  <th className="pb-2 font-semibold text-right">Errors</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b.id} className="border-b border-border/50">
                    <td className="py-2.5 font-medium">{b.fileName}</td>
                    <td className="py-2.5 text-muted-foreground">{new Date(b.createdAt).toLocaleDateString()}</td>
                    <td className="py-2.5">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        b.status === "COMPLETED" ? "bg-emerald-500/15 text-emerald-500" :
                        b.status === "COMPLETED_WITH_ERRORS" ? "bg-amber-500/15 text-amber-500" :
                        b.status === "PROCESSING" ? "bg-blue-500/15 text-blue-500" :
                        "bg-rose-500/15 text-rose-500"
                      }`}>{b.status.replace("_", " ")}</span>
                    </td>
                    <td className="py-2.5 text-right">{b.totalRecords}</td>
                    <td className="py-2.5 text-right">{b.importedRecords}</td>
                    <td className="py-2.5 text-right">{b.skippedRecords}</td>
                    <td className="py-2.5 text-right">{b.errorRecords}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
