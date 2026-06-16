"use client";

import React, { useEffect, useState } from "react";
import { CatalogTable, Column, FieldDef } from "@/components/admin/catalog-table";
import { listCareers, upsertCareer, deleteCareer } from "@/lib/actions/admin-actions";
import toast from "react-hot-toast";

type CareerRow = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  summary: string;
  salaryEntry: number;
  salaryMid: number;
  salarySenior: number;
  tenYearGrowthPercent: number;
  demandLevel: string;
  aiRiskLevel: string;
  requiredSkills: string[];
  recommendedDegrees: string[];
  certifications: string[];
  alternativeCareers: string[];
  isActive: boolean;
};

const COLUMNS: Column<CareerRow>[] = [
  { key: "title", label: "Title" },
  { key: "slug", label: "Slug" },
  {
    key: "salaryEntry",
    label: "Salary Entry",
    render: (row) => `₹${(row.salaryEntry / 100000).toFixed(1)}L/yr`,
  },
  {
    key: "salaryMid",
    label: "Salary Mid",
    render: (row) => `₹${(row.salaryMid / 100000).toFixed(1)}L/yr`,
  },
  {
    key: "demandLevel",
    label: "Demand",
    render: (row) => {
      const colors: Record<string, string> = {
        HIGH: "bg-emerald-500/15 text-emerald-500",
        MEDIUM: "bg-amber-500/15 text-amber-500",
        LOW: "bg-rose-500/15 text-rose-500",
      };
      return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${colors[row.demandLevel] || "bg-muted"}`}>
          {row.demandLevel}
        </span>
      );
    },
  },
  {
    key: "aiRiskLevel",
    label: "AI Risk",
    render: (row) => {
      const colors: Record<string, string> = {
        HIGH: "bg-rose-500/15 text-rose-500",
        MEDIUM: "bg-amber-500/15 text-amber-500",
        LOW: "bg-emerald-500/15 text-emerald-500",
      };
      return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${colors[row.aiRiskLevel] || "bg-muted"}`}>
          {row.aiRiskLevel}
        </span>
      );
    },
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
  { key: "title", label: "Career Title", placeholder: "e.g. Software Architect" },
  { key: "slug", label: "Slug (leave blank to auto-generate)", placeholder: "e.g. software-architect" },
  { key: "description", label: "Detailed Description", type: "textarea", placeholder: "Explain the job profile..." },
  { key: "summary", label: "Day-to-day Summary", type: "textarea", placeholder: "Explain what they do on a daily basis..." },
  { key: "salaryEntry", label: "Entry Level Salary (INR per Year)", type: "number", placeholder: "e.g. 400000" },
  { key: "salaryMid", label: "Mid Career Salary (INR per Year)", type: "number", placeholder: "e.g. 1200000" },
  { key: "salarySenior", label: "Senior Salary (INR per Year)", type: "number", placeholder: "e.g. 2500000" },
  { key: "tenYearGrowthPercent", label: "10-Year Growth Rate (%)", type: "number", placeholder: "e.g. 15" },
  { key: "demandLevel", label: "Market Demand Level", type: "select", options: ["MEDIUM", "HIGH", "LOW"] },
  { key: "aiRiskLevel", label: "AI Replacement Risk", type: "select", options: ["MEDIUM", "LOW", "HIGH"] },
  { key: "requiredSkills", label: "Required Skills", type: "list", placeholder: "e.g. React, Node.js, System Design" },
  { key: "recommendedDegrees", label: "Recommended Degrees accepted", type: "list", placeholder: "e.g. B.Tech CS, BCA" },
  { key: "certifications", label: "Recommended Certifications", type: "list", placeholder: "e.g. AWS Solutions Architect" },
  { key: "alternativeCareers", label: "Alternative Careers", type: "list", placeholder: "e.g. Product Manager, DevOps Engineer" },
];

const EMPTY_TEMPLATE: CareerRow = {
  title: "",
  slug: "",
  description: "",
  summary: "",
  salaryEntry: 400000,
  salaryMid: 1200000,
  salarySenior: 2500000,
  tenYearGrowthPercent: 12.5,
  demandLevel: "MEDIUM",
  aiRiskLevel: "MEDIUM",
  requiredSkills: [],
  recommendedDegrees: [],
  certifications: [],
  alternativeCareers: [],
  isActive: true,
};

export default function AdminCareersPage() {
  const [rows, setRows] = useState<CareerRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const data = await listCareers();
      setRows(data as CareerRow[]);
    } catch (e: any) {
      toast.error(e.message || "Failed to load careers list");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSave(row: CareerRow) {
    const toastId = toast.loading("Saving changes...");
    try {
      await upsertCareer(row);
      toast.success("Career profile saved successfully!", { id: toastId });
    } catch (e: any) {
      toast.error(e.message || "Save operation failed", { id: toastId });
      throw e;
    }
  }

  async function handleDelete(id: string) {
    const toastId = toast.loading("Deleting career profile...");
    try {
      await deleteCareer(id);
      toast.success("Career profile removed successfully!", { id: toastId });
    } catch (e: any) {
      toast.error(e.message || "Delete operation failed", { id: toastId });
      throw e;
    }
  }

  return (
    <div className="space-y-6">
      <CatalogTable<CareerRow>
        eyebrow="Industry Database"
        title="Careers Catalog"
        description="Manage industry career pathways, compensation tiers, market growth potential, and AI resilience score metrics."
        rows={rows}
        isLoading={loading}
        columns={COLUMNS}
        fields={FIELDS}
        emptyTemplate={EMPTY_TEMPLATE}
        onSave={handleSave}
        onDelete={handleDelete}
        refetch={loadData}
        searchKeys={["title", "slug", "description"]}
      />
    </div>
  );
}
