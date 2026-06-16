"use client";

import React, { useEffect, useState } from "react";
import { CatalogTable, Column, FieldDef } from "@/components/admin/catalog-table";
import { listSkills, upsertSkill, deleteSkill } from "@/lib/actions/admin-actions";
import toast from "react-hot-toast";

type SkillRow = {
  id?: string;
  name: string;
  category: string;
  description: string;
  difficulty: string;
  demand: string;
};

const COLUMNS: Column<SkillRow>[] = [
  { key: "name", label: "Skill Name" },
  { key: "category", label: "Category" },
  {
    key: "difficulty",
    label: "Difficulty",
    render: (row) => {
      const colors: Record<string, string> = {
        ADVANCED: "bg-rose-500/15 text-rose-500",
        MEDIUM: "bg-amber-500/15 text-amber-500",
        BEGINNER: "bg-emerald-500/15 text-emerald-500",
      };
      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors[row.difficulty] || "bg-muted"}`}>
          {row.difficulty}
        </span>
      );
    },
  },
  {
    key: "demand",
    label: "Market Demand",
    render: (row) => {
      const colors: Record<string, string> = {
        HIGH: "bg-emerald-500/15 text-emerald-500",
        MEDIUM: "bg-amber-500/15 text-amber-500",
        LOW: "bg-rose-500/15 text-rose-500",
      };
      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors[row.demand] || "bg-muted"}`}>
          {row.demand}
        </span>
      );
    },
  },
];

const FIELDS: FieldDef[] = [
  { key: "name", label: "Skill Name", placeholder: "e.g. TypeScript" },
  { key: "category", label: "Skill Category", placeholder: "e.g. Technical / Coding" },
  { key: "description", label: "Description", type: "textarea", placeholder: "Explain the skill requirements..." },
  { key: "difficulty", label: "Difficulty Rating", type: "select", options: ["MEDIUM", "BEGINNER", "ADVANCED"] },
  { key: "demand", label: "Industry Demand", type: "select", options: ["MEDIUM", "HIGH", "LOW"] },
];

const EMPTY_TEMPLATE: SkillRow = {
  name: "",
  category: "Technical",
  description: "",
  difficulty: "MEDIUM",
  demand: "MEDIUM",
};

export default function AdminSkillsPage() {
  const [rows, setRows] = useState<SkillRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const data = await listSkills();
      setRows(data as SkillRow[]);
    } catch (e: any) {
      toast.error(e.message || "Failed to load skills");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSave(row: SkillRow) {
    const toastId = toast.loading("Saving skill entry...");
    try {
      await upsertSkill(row);
      toast.success("Skill saved successfully!", { id: toastId });
    } catch (e: any) {
      toast.error(e.message || "Failed to save skill", { id: toastId });
      throw e;
    }
  }

  async function handleDelete(id: string) {
    const toastId = toast.loading("Deleting skill...");
    try {
      await deleteSkill(id);
      toast.success("Skill deleted successfully!", { id: toastId });
    } catch (e: any) {
      toast.error(e.message || "Failed to delete skill", { id: toastId });
      throw e;
    }
  }

  return (
    <div className="space-y-6">
      <CatalogTable<SkillRow>
        eyebrow="Competency Database"
        title="Skills Catalog"
        description="Manage the reference directory of key skills, classification segments, and industrial difficulty rankings."
        rows={rows}
        isLoading={loading}
        columns={COLUMNS}
        fields={FIELDS}
        emptyTemplate={EMPTY_TEMPLATE}
        onSave={handleSave}
        onDelete={handleDelete}
        refetch={loadData}
        searchKeys={["name", "category", "description"]}
      />
    </div>
  );
}
