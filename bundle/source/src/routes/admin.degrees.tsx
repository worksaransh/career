import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { CatalogTable, type Column, type FieldDef } from "@/components/admin/catalog-table";
import { deleteDegree, listDegrees, upsertDegree } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/degrees")({
  component: DegreesPage,
});

type Degree = {
  id?: string;
  name: string;
  short_name: string | null;
  level: "diploma" | "undergrad" | "postgrad" | "doctorate" | "certification";
  duration_years: number;
  stream: string | null;
  description: string | null;
  avg_fees: number | null;
  career_tags: string[];
};

const COLUMNS: Column<Degree>[] = [
  { key: "short_name", label: "Code" },
  { key: "name", label: "Name" },
  { key: "level", label: "Level" },
  { key: "duration_years", label: "Years" },
  { key: "stream", label: "Stream" },
  { key: "avg_fees", label: "Avg fees (₹)" },
];

const FIELDS: FieldDef[] = [
  { key: "name", label: "Name" },
  { key: "short_name", label: "Short name (e.g. B.Tech)" },
  { key: "level", label: "Level", type: "select", options: ["diploma", "undergrad", "postgrad", "doctorate", "certification"] },
  { key: "duration_years", label: "Duration (years)", type: "number" },
  { key: "stream", label: "Stream" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "avg_fees", label: "Average fees (₹)", type: "number" },
  { key: "career_tags", label: "Career tags", type: "list", placeholder: "tech, ai" },
];

function DegreesPage() {
  const list = useServerFn(listDegrees);
  const save = useServerFn(upsertDegree);
  const del = useServerFn(deleteDegree);
  const { data, isLoading, refetch } = useQuery({ queryKey: ["admin-degrees"], queryFn: () => list() });

  return (
    <CatalogTable<Degree>
      title="Degrees"
      description="Education paths students can choose from."
      rows={data as Degree[] | undefined}
      isLoading={isLoading}
      columns={COLUMNS}
      fields={FIELDS}
      emptyTemplate={{
        name: "",
        short_name: "",
        level: "undergrad",
        duration_years: 3,
        stream: "",
        description: "",
        avg_fees: null,
        career_tags: [],
      }}
      onSave={(row) => save({ data: row })}
      onDelete={(id) => del({ data: { id } })}
      refetch={refetch}
    />
  );
}
