"use client";

import React, { useEffect, useState } from "react";
import { CatalogTable, Column, FieldDef } from "@/components/admin/catalog-table";
import { listCertifications, upsertCertification, deleteCertification } from "@/lib/actions/admin-actions";
import toast from "react-hot-toast";

type CertRow = {
  id?: string;
  name: string;
  provider: string;
  cost: number;
  duration: string;
  skillsCovered: string[];
  affiliateLink?: string | null;
};

const COLUMNS: Column<CertRow>[] = [
  { key: "name", label: "Certification Name" },
  { key: "provider", label: "Provider" },
  {
    key: "cost",
    label: "Estimated Cost",
    render: (row) => (row.cost > 0 ? `₹${row.cost.toLocaleString("en-IN")}` : "Free"),
  },
  { key: "duration", label: "Duration" },
  {
    key: "affiliateLink",
    label: "Affiliate Link",
    render: (row) =>
      row.affiliateLink ? (
        <a href={row.affiliateLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">
          Visit URL
        </a>
      ) : (
        "—"
      ),
  },
];

const FIELDS: FieldDef[] = [
  { key: "name", label: "Certification Name", placeholder: "e.g. AWS Solutions Architect Associate" },
  { key: "provider", label: "Credential Provider", placeholder: "e.g. Amazon Web Services (AWS)" },
  { key: "cost", label: "Cost (INR)", type: "number", placeholder: "e.g. 12000" },
  { key: "duration", label: "Estimated Study Duration", placeholder: "e.g. 3 Months" },
  { key: "skillsCovered", label: "Skills Covered", type: "list", placeholder: "e.g. Cloud Security, IAM, S3, EC2" },
  { key: "affiliateLink", label: "Affiliate URL link", placeholder: "e.g. https://aws.amazon.com/..." },
];

const EMPTY_TEMPLATE: CertRow = {
  name: "",
  provider: "",
  cost: 0,
  duration: "2 Months",
  skillsCovered: [],
  affiliateLink: null,
};

export default function AdminCertificationsPage() {
  const [rows, setRows] = useState<CertRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const data = await listCertifications();
      setRows(data as unknown as CertRow[]);
    } catch (e: any) {
      toast.error(e.message || "Failed to load certifications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSave(row: CertRow) {
    const toastId = toast.loading("Saving certification details...");
    try {
      await upsertCertification(row);
      toast.success("Certification saved successfully!", { id: toastId });
    } catch (e: any) {
      toast.error(e.message || "Failed to save certification", { id: toastId });
      throw e;
    }
  }

  async function handleDelete(id: string) {
    const toastId = toast.loading("Deleting certification...");
    try {
      await deleteCertification(id);
      toast.success("Certification deleted successfully!", { id: toastId });
    } catch (e: any) {
      toast.error(e.message || "Failed to delete certification", { id: toastId });
      throw e;
    }
  }

  return (
    <div className="space-y-6">
      <CatalogTable<CertRow>
        eyebrow="Academic Credentials"
        title="Certifications Catalog"
        description="Configure credential options, pricing tiers, provider credentials, and syllabus skills targets."
        rows={rows}
        isLoading={loading}
        columns={COLUMNS}
        fields={FIELDS}
        emptyTemplate={EMPTY_TEMPLATE}
        onSave={handleSave}
        onDelete={handleDelete}
        refetch={loadData}
        searchKeys={["name", "provider"]}
      />
    </div>
  );
}
