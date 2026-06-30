"use client";

import React, { useEffect, useState } from "react";
import { CatalogTable, Column, FieldDef } from "@/components/admin/catalog-table";
import { listColleges, upsertCollege, deleteCollege } from "@/lib/actions/admin-actions";
import { GlassCard } from "@/components/ui/glass-card";
import { Building2, Activity, ShieldAlert, Clock } from "lucide-react";
import toast from "react-hot-toast";

type CollegeRow = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  location: string;
  ranking: number;
  feesTotal: number;
  feesTuition: number;
  feesLiving: number;
  feesCurrency: string;
  avgPackage: number;
  highestPackage: number;
  placementPercent: number;
  topRecruiters: string[];
  isActive: boolean;
};

const COLUMNS: Column<CollegeRow>[] = [
  { key: "name", label: "Name" },
  { key: "location", label: "Location" },
  { key: "ranking", label: "NIRF Rank" },
  {
    key: "feesTotal",
    label: "Total Fees",
    render: (row) => `₹${(row.feesTotal / 100000).toFixed(2)}L avg`,
  },
  {
    key: "avgPackage",
    label: "Avg Package",
    render: (row) => `₹${(row.avgPackage / 100000).toFixed(2)}L/yr`,
  },
  {
    key: "isActive",
    label: "Status",
    render: (row) => (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
          row.isActive
            ? "bg-emerald-500/15 text-emerald-500"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {row.isActive ? "Active" : "Disabled"}
      </span>
    ),
  },
];

const FIELDS: FieldDef[] = [
  { key: "name", label: "College Name", placeholder: "e.g. Indian Institute of Technology Delhi" },
  { key: "slug", label: "Slug (leave blank to auto-generate)", placeholder: "e.g. iit-delhi" },
  { key: "description", label: "Description Overview", type: "textarea", placeholder: "Explain college campus, history, etc..." },
  { key: "location", label: "Location (City, State)", placeholder: "e.g. New Delhi, Delhi" },
  { key: "ranking", label: "National Ranking / NIRF", type: "number", placeholder: "e.g. 2" },
  { key: "feesTotal", label: "Estimated Annual Fees (INR)", type: "number", placeholder: "e.g. 220000" },
  { key: "feesTuition", label: "Tuition Fees portion (INR)", type: "number", placeholder: "e.g. 200000" },
  { key: "feesLiving", label: "Living / Hostel Fees portion (INR)", type: "number", placeholder: "e.g. 20000" },
  { key: "feesCurrency", label: "Currency Code", placeholder: "e.g. INR" },
  { key: "avgPackage", label: "Average Salary Package (INR)", type: "number", placeholder: "e.g. 1800000" },
  { key: "highestPackage", label: "Highest Salary Package (INR)", type: "number", placeholder: "e.g. 4500000" },
  { key: "placementPercent", label: "Placement Rate Percentage (%)", type: "number", placeholder: "e.g. 98.2" },
  { key: "topRecruiters", label: "Top Recruiter Firms", type: "list", placeholder: "e.g. Google, Microsoft, McKinsey" },
];

const EMPTY_TEMPLATE: CollegeRow = {
  name: "",
  slug: "",
  description: "",
  location: "India",
  ranking: 9999,
  feesTotal: 200000,
  feesTuition: 180000,
  feesLiving: 20000,
  feesCurrency: "INR",
  avgPackage: 600000,
  highestPackage: 1500000,
  placementPercent: 80,
  topRecruiters: [],
  isActive: true,
};

export default function AdminCollegesPage() {
  const [rows, setRows] = useState<CollegeRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const data = await listColleges();
      setRows(data as CollegeRow[]);
    } catch (e: any) {
      toast.error(e.message || "Failed to load colleges list");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSave(row: CollegeRow) {
    const toastId = toast.loading("Saving changes...");
    try {
      await upsertCollege(row);
      toast.success("College profile saved successfully!", { id: toastId });
    } catch (e: any) {
      toast.error(e.message || "Save operation failed", { id: toastId });
      throw e;
    }
  }

  async function handleDelete(id: string) {
    const toastId = toast.loading("Deleting college profile...");
    try {
      await deleteCollege(id);
      toast.success("College profile removed successfully!", { id: toastId });
    } catch (e: any) {
      toast.error(e.message || "Delete operation failed", { id: toastId });
      throw e;
    }
  }

  return (
    <div className="space-y-6 text-foreground">
      {/* Colleges Knowledge Graph KPI Counters */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard className="p-4 border border-border/80" variant="strong">
          <span className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">Total Colleges</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-white">{rows.length}</span>
            <Building2 className="h-4.5 w-4.5 text-primary" />
          </div>
        </GlassCard>

        <GlassCard className="p-4 border border-border/80" variant="strong">
          <span className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">Updated Today</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-white">1</span>
            <Activity className="h-4.5 w-4.5 text-emerald-400" />
          </div>
        </GlassCard>

        <GlassCard className="p-4 border border-border/80" variant="strong">
          <span className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">Need Review</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-white">4</span>
            <ShieldAlert className="h-4.5 w-4.5 text-amber-500" />
          </div>
        </GlassCard>

        <GlassCard className="p-4 border border-border/80" variant="strong">
          <span className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">Recently Added</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-white">3</span>
            <Clock className="h-4.5 w-4.5 text-cyan-400" />
          </div>
        </GlassCard>
      </div>

      <CatalogTable<CollegeRow>
        eyebrow="Institution Database"
        title="Colleges Catalog"
        description="Configure university listing information, national NIRF ranking scorecards, campus fee models, and average placement metrics."
        rows={rows}
        isLoading={loading}
        columns={COLUMNS}
        fields={FIELDS}
        emptyTemplate={EMPTY_TEMPLATE}
        onSave={handleSave}
        onDelete={handleDelete}
        refetch={loadData}
        searchKeys={["name", "location", "description"]}
      />
    </div>
  );
}
