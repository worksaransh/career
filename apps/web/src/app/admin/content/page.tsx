"use client";

import React, { useEffect, useState, startTransition } from "react";
import { CatalogTable, Column, FieldDef } from "@/components/admin/catalog-table";
import { listCMSContents, upsertCMSContent, deleteCMSContent } from "@/lib/actions/admin-actions";
import toast from "react-hot-toast";

type CMSContentRow = {
  id?: string;
  key: string;
  section: string;
  type: string;
  value: string;
  language: string;
  isActive: boolean;
};

const COLUMNS: Column<CMSContentRow>[] = [
  { key: "key", label: "CMS Key" },
  { key: "section", label: "Page Section" },
  { key: "type", label: "Content Type" },
  {
    key: "value",
    label: "Value / Snippet",
    render: (row) => (
      <span className="block max-w-xs truncate text-xs font-mono text-muted-foreground bg-accent/30 rounded px-1.5 py-0.5">
        {row.value}
      </span>
    ),
  },
  { key: "language", label: "Lang" },
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
  { key: "key", label: "CMS Key (unique name)", placeholder: "e.g. hero-title" },
  { key: "section", label: "Marketing Section", placeholder: "e.g. hero, pricing" },
  { key: "type", label: "Format Type", type: "select", options: ["TEXT", "HTML", "MARKDOWN"] },
  { key: "value", label: "HTML/Text Value Content", type: "textarea", placeholder: "Type text content..." },
  { key: "language", label: "Language Code", placeholder: "e.g. en" },
];

const EMPTY_TEMPLATE: CMSContentRow = {
  key: "",
  section: "general",
  type: "TEXT",
  value: "",
  language: "en",
  isActive: true,
};

export default function AdminContentPage() {
  const [rows, setRows] = useState<CMSContentRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const data = await listCMSContents();
      setRows(data as CMSContentRow[]);
    } catch (e: any) {
      toast.error(e.message || "Failed to load content list");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSave(row: CMSContentRow) {
    const toastId = toast.loading("Saving changes...");
    try {
      await upsertCMSContent(row);
      toast.success("CMS entry saved successfully!", { id: toastId });
    } catch (e: any) {
      toast.error(e.message || "Save operation failed", { id: toastId });
      throw e;
    }
  }

  async function handleDelete(id: string) {
    const toastId = toast.loading("Deleting CMS entry...");
    try {
      await deleteCMSContent(id);
      toast.success("CMS entry removed successfully!", { id: toastId });
    } catch (e: any) {
      toast.error(e.message || "Delete operation failed", { id: toastId });
      throw e;
    }
  }

  return (
    <div className="space-y-6">
      <CatalogTable<CMSContentRow>
        eyebrow="Dynamic Content Manager"
        title="CMS Content Control"
        description="Configure dynamic copy, hero sections, banner headlines, and tags displayed across marketing pages."
        rows={rows}
        isLoading={loading}
        columns={COLUMNS}
        fields={FIELDS}
        emptyTemplate={EMPTY_TEMPLATE}
        onSave={handleSave}
        onDelete={handleDelete}
        refetch={loadData}
        searchKeys={["key", "section", "value"]}
      />
    </div>
  );
}
