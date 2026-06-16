import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { CatalogTable, type Column, type FieldDef } from "@/components/admin/catalog-table";
import { deleteCareer, listCareers, upsertCareer } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/careers")({
  component: CareersPage,
});

type Career = {
  id?: string;
  title: string;
  emoji: string;
  description: string | null;
  salary_entry: number | null;
  salary_mid: number | null;
  demand_index: number | null;
  ai_risk: "Low" | "Medium" | "High";
  required_education: string | null;
  alternatives: string[];
  tags: string[];
};

const COLUMNS: Column<Career>[] = [
  { key: "emoji", label: "" },
  { key: "title", label: "Title" },
  { key: "ai_risk", label: "AI risk" },
  {
    key: "salary_entry",
    label: "Salary (LPA)",
    render: (r) => `${r.salary_entry ?? "—"} – ${r.salary_mid ?? "—"}`,
  },
  { key: "demand_index", label: "Demand" },
];

const FIELDS: FieldDef[] = [
  { key: "title", label: "Title" },
  { key: "emoji", label: "Emoji" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "ai_risk", label: "AI risk", type: "select", options: ["Low", "Medium", "High"] },
  { key: "salary_entry", label: "Entry salary (LPA)", type: "number" },
  { key: "salary_mid", label: "Mid salary (LPA)", type: "number" },
  { key: "demand_index", label: "Demand index (0-100)", type: "number" },
  { key: "required_education", label: "Required education" },
  { key: "alternatives", label: "Alternative careers", type: "list", placeholder: "Business Analyst, Founder's Office" },
  { key: "tags", label: "Tags", type: "list", placeholder: "tech, business" },
];

function CareersPage() {
  const list = useServerFn(listCareers);
  const save = useServerFn(upsertCareer);
  const del = useServerFn(deleteCareer);
  const { data, isLoading, refetch } = useQuery({ queryKey: ["admin-careers"], queryFn: () => list() });

  return (
    <CatalogTable<Career>
      title="Careers"
      description="Master list of careers used across the platform."
      rows={data as Career[] | undefined}
      isLoading={isLoading}
      columns={COLUMNS}
      fields={FIELDS}
      emptyTemplate={{
        title: "",
        emoji: "💼",
        description: "",
        salary_entry: null,
        salary_mid: null,
        demand_index: 50,
        ai_risk: "Medium",
        required_education: "",
        alternatives: [],
        tags: [],
      }}
      onSave={(row) => save({ data: row })}
      onDelete={(id) => del({ data: { id } })}
      refetch={refetch}
    />
  );
}
