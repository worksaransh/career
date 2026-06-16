import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, FileText, Languages, Loader2, TrendingUp } from "lucide-react";
import { getAssessmentAnalytics } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/analytics")({
  component: Analytics,
});

const RANGES = [
  { label: "7d", days: 7 },
  { label: "14d", days: 14 },
] as const;

const PIE_COLORS = ["var(--primary)", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

function Analytics() {
  const fn = useServerFn(getAssessmentAnalytics);
  const { data, isLoading } = useQuery({ queryKey: ["admin-analytics"], queryFn: () => fn() });
  const [range, setRange] = React.useState<(typeof RANGES)[number]["label"]>("14d");

  if (isLoading || !data) {
    return (
      <div className="flex items-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading analytics…
      </div>
    );
  }

  const days = RANGES.find((r) => r.label === range)?.days ?? 14;
  const series = data.daily.slice(-days);
  const seriesTotal = series.reduce((s, d) => s + d.count, 0);
  const langData = Object.entries(data.languages).map(([k, v]) => ({ name: k.toUpperCase(), value: v }));
  const topData = data.topCareers.slice(0, 8).map((c) => ({ name: c.title, count: c.count }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Insights
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Assessment analytics</h1>
          <p className="text-sm text-muted-foreground">
            {data.totalAssessments.toLocaleString()} assessments · {data.totalRecommendations.toLocaleString()} reports
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-border bg-card p-0.5">
          {RANGES.map((r) => (
            <Button
              key={r.label}
              size="sm"
              variant={range === r.label ? "default" : "ghost"}
              className="h-7 px-3 text-xs"
              onClick={() => setRange(r.label)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi icon={BarChart3} label={`Assessments · ${range}`} value={seriesTotal.toLocaleString()} />
        <Kpi icon={FileText} label="Reports total" value={data.totalRecommendations.toLocaleString()} />
        <Kpi
          icon={Languages}
          label="Languages used"
          value={Object.values(data.languages).filter((v) => v > 0).length.toString()}
        />
      </div>

      {/* Trend */}
      <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Daily assessments</h2>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" /> Trend
          </span>
        </div>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => d.slice(5)}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                stroke="var(--border)"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                stroke="var(--border)"
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="var(--primary)"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-5">
        <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold">Language distribution</h2>
          <div className="mt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={langData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {langData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm lg:col-span-3">
          <h2 className="text-sm font-semibold">Most recommended careers</h2>
          <div className="mt-4 h-64">
            {topData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                No data yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topData} layout="vertical" margin={{ left: 16, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" fill="var(--primary)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value }: { icon: typeof BarChart3; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs font-medium">{label}</span>
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );
}
