import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { CatalogTable, type Column, type FieldDef } from "@/components/admin/catalog-table";
import { deleteCollege, listColleges, upsertCollege } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/colleges")({
  component: CollegesPage,
});

type College = {
  id?: string;
  name: string;
  city: string | null;
  state: string | null;
  type: "government" | "private" | "deemed" | "autonomous";
  ranking: number | null;
  avg_fees: number | null;
  website: string | null;
  offered_degrees: string[];
  description: string | null;
};

const COLUMNS: Column<College>[] = [
  { key: "name", label: "Name" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "type", label: "Type" },
  { key: "ranking", label: "Rank" },
  { key: "avg_fees", label: "Avg fees (₹)" },
];

const FIELDS: FieldDef[] = [
  { key: "name", label: "Name" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "type", label: "Type", type: "select", options: ["government", "private", "deemed", "autonomous"] },
  { key: "ranking", label: "Ranking", type: "number" },
  { key: "avg_fees", label: "Average fees (₹)", type: "number" },
  { key: "website", label: "Website" },
  { key: "offered_degrees", label: "Offered degrees", type: "list", placeholder: "B.Tech, M.Tech" },
  { key: "description", label: "Description", type: "textarea" },
];

function CollegesPage() {
  const list = useServerFn(listColleges);
  const save = useServerFn(upsertCollege);
  const del = useServerFn(deleteCollege);
  const { data, isLoading, refetch } = useQuery({ queryKey: ["admin-colleges"], queryFn: () => list() });

  return (
    <CatalogTable<College>
      title="Colleges"
      description="College/university directory."
      rows={data as College[] | undefined}
      isLoading={isLoading}
      columns={COLUMNS}
      fields={FIELDS}
      emptyTemplate={{
        name: "",
        city: "",
        state: "",
        type: "private",
        ranking: null,
        avg_fees: null,
        website: "",
        offered_degrees: [],
        description: "",
      }}
      onSave={(row) => save({ data: row })}
      onDelete={(id) => del({ data: { id } })}
      refetch={refetch}
    />
  );
}
