"use client";

import React, { useEffect, useState } from "react";
import { CatalogTable, Column, FieldDef } from "@/components/admin/catalog-table";
import { listDegrees, upsertDegree, deleteDegree } from "@/lib/actions/admin-actions";
import toast from "react-hot-toast";

type DegreeRow = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  duration: string;
  costTotal: number;
  costTuition: number;
  costFees: number;
  costLiving: number;
  costCurrency: string;
  fiveYearReturn: number;
  tenYearReturn: number;
  lifetimeReturn: number;
  breakEvenPeriod: number;
  riskAdjustedScore: number;
  aiResilience: number;
  careerOutcomes: any;
  futureOpportunities: string[];
  requiredSubjects: string[];
  isActive: boolean;
};

const COLUMNS: Column<DegreeRow>[] = [
  { key: "name", label: "Name" },
  { key: "slug", label: "Slug" },
  { key: "duration", label: "Duration" },
  {
    key: "costTotal",
    label: "Cost Total",
    render: (row) => `₹${(row.costTotal / 100000).toFixed(2)}L total`,
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
  { key: "name", label: "Degree Name", placeholder: "e.g. Bachelor of Computer Applications" },
  { key: "slug", label: "Slug (leave blank to auto-generate)", placeholder: "e.g. bca" },
  { key: "description", label: "Degree Description", type: "textarea", placeholder: "Explain the degree objectives..." },
  { key: "duration", label: "Degree Duration", placeholder: "e.g. 3 Years" },
  { key: "costTotal", label: "Estimated Total Fee (INR)", type: "number", placeholder: "e.g. 300000" },
  { key: "costTuition", label: "Tuition Fee portion (INR)", type: "number", placeholder: "e.g. 240000" },
  { key: "costCurrency", label: "Currency Code", placeholder: "e.g. INR" },
  { key: "fiveYearReturn", label: "Est. 5-Year Return (INR)", type: "number", placeholder: "e.g. 1500000" },
  { key: "tenYearReturn", label: "Est. 10-Year Return (INR)", type: "number", placeholder: "e.g. 4000000" },
  { key: "lifetimeReturn", label: "Est. Lifetime Return (INR)", type: "number", placeholder: "e.g. 15000000" },
  { key: "breakEvenPeriod", label: "Break Even Period (Years)", type: "number", placeholder: "e.g. 4" },
  { key: "riskAdjustedScore", label: "ROI Risk-Adjusted Score (0 to 10)", type: "number", placeholder: "e.g. 7.5" },
  { key: "aiResilience", label: "AI Resilience Score (0 to 10)", type: "number", placeholder: "e.g. 8.2" },
  { key: "futureOpportunities", label: "Future Opportunities / Job Titles Accepted", type: "list", placeholder: "e.g. Software Engineer, Tech Lead" },
  { key: "requiredSubjects", label: "Required / Prerequisite High School Subjects", type: "list", placeholder: "e.g. Mathematics, Physics" },
];

const EMPTY_TEMPLATE: DegreeRow = {
  name: "",
  slug: "",
  description: "",
  duration: "3 Years",
  costTotal: 300000,
  costTuition: 250000,
  costFees: 50000,
  costLiving: 0,
  costCurrency: "INR",
  fiveYearReturn: 1200000,
  tenYearReturn: 3500000,
  lifetimeReturn: 12000000,
  breakEvenPeriod: 4,
  riskAdjustedScore: 7.0,
  aiResilience: 7.5,
  careerOutcomes: [],
  futureOpportunities: [],
  requiredSubjects: [],
  isActive: true,
};

export default function AdminDegreesPage() {
  const [rows, setRows] = useState<DegreeRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const data = await listDegrees();
      setRows(data as DegreeRow[]);
    } catch (e: any) {
      toast.error(e.message || "Failed to load degrees list");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSave(row: DegreeRow) {
    const toastId = toast.loading("Saving changes...");
    try {
      await upsertDegree(row);
      toast.success("Degree profile saved successfully!", { id: toastId });
    } catch (e: any) {
      toast.error(e.message || "Save operation failed", { id: toastId });
      throw e;
    }
  }

  async function handleDelete(id: string) {
    const toastId = toast.loading("Deleting degree profile...");
    try {
      await deleteDegree(id);
      toast.success("Degree profile removed successfully!", { id: toastId });
    } catch (e: any) {
      toast.error(e.message || "Delete operation failed", { id: toastId });
      throw e;
    }
  }

  return (
    <div className="space-y-6">
      <CatalogTable<DegreeRow>
        eyebrow="Academic Program Database"
        title="Degrees Catalog"
        description="Manage listed degree options, college durations, average tuition pricing tiers, and ROI projection modeling."
        rows={rows}
        isLoading={loading}
        columns={COLUMNS}
        fields={FIELDS}
        emptyTemplate={EMPTY_TEMPLATE}
        onSave={handleSave}
        onDelete={handleDelete}
        refetch={loadData}
        searchKeys={["name", "slug", "description"]}
      />
    </div>
  );
}
