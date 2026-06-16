import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  Briefcase,
  Building2,
  FileText,
  GraduationCap,
  Loader2,
  TrendingUp,
  Users,
  ArrowUpRight,
} from "lucide-react";
import { getAdminOverview, getAssessmentAnalytics } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/")({
  component: Overview,
});

const ACCENTS = [
  "from-sky-500/15 to-sky-500/0 text-sky-600 dark:text-sky-400",
  "from-violet-500/15 to-violet-500/0 text-violet-600 dark:text-violet-400",
  "from-emerald-500/15 to-emerald-500/0 text-emerald-600 dark:text-emerald-400",
  "from-amber-500/15 to-amber-500/0 text-amber-600 dark:text-amber-400",
  "from-rose-500/15 to-rose-500/0 text-rose-600 dark:text-rose-400",
  "from-indigo-500/15 to-indigo-500/0 text-indigo-600 dark:text-indigo-400",
  "from-teal-500/15 to-teal-500/0 text-teal-600 dark:text-teal-400",
];

function Overview() {
  const ov = useServerFn(getAdminOverview);
  const an = useServerFn(getAssessmentAnalytics);
  const overviewQ = useQuery({ queryKey: ["admin-overview"], queryFn: () => ov() });
  const analyticsQ = useQuery({ queryKey: ["admin-analytics"], queryFn: () => an() });

  if (overviewQ.isLoading || !overviewQ.data) {
    return (
      <div className="flex items-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading overview…
      </div>
    );
  }

  const data = overviewQ.data;
  const daily = analyticsQ.data?.daily ?? [];
  const last7 = daily.slice(-7).reduce((s, d) => s + d.count, 0);
  const prev7 = daily.slice(-14, -7).reduce((s, d) => s + d.count, 0);
  const delta = prev7 === 0 ? (last7 > 0 ? 100 : 0) : Math.round(((last7 - prev7) / prev7) * 100);

  const cards = [
    { label: "Users", value: data.users, to: "/admin/users", icon: Users },
    { label: "Assessments", value: data.assessments, to: "/admin/analytics", icon: BarChart3 },
    { label: "Reports", value: data.recommendations, to: "/admin/reports", icon: FileText },
    { label: "Shared links", value: data.shares, to: "/admin/reports", icon: ArrowUpRight },
    { label: "Careers", value: data.careers, to: "/admin/careers", icon: Briefcase },
    { label: "Degrees", value: data.degrees, to: "/admin/degrees", icon: GraduationCap },
    { label: "Colleges", value: data.colleges, to: "/admin/colleges", icon: Building2 },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-card to-card p-6 md:p-8 shadow-sm">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Overview
          </div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Welcome back, admin.</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Health snapshot of Career GPS AI — assessments, catalogs, and user activity at a glance.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Stat label="Assessments · 7d" value={last7.toLocaleString()} delta={delta} />
            <Stat label="Total users" value={data.users.toLocaleString()} />
            <Stat label="Reports generated" value={data.recommendations.toLocaleString()} />
          </div>
        </div>
      </section>

      {/* KPI cards */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Modules</h2>
            <p className="text-xs text-muted-foreground">Jump into any section.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.label}
                to={c.to}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md"
              >
                <div
                  className={`absolute inset-x-0 top-0 h-16 bg-gradient-to-b ${ACCENTS[i % ACCENTS.length]}`}
                />
                <div className="relative flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">{c.label}</span>
                  <Icon className={`h-4 w-4 ${ACCENTS[i % ACCENTS.length].split(" ").slice(-1)[0]}`} />
                </div>
                <div className="relative mt-3 text-2xl font-bold tracking-tight">
                  {c.value.toLocaleString()}
                </div>
                <div className="relative mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  Open <ArrowUpRight className="h-3 w-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Chart + side panel */}
      <section className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold">Assessment activity</h2>
              <p className="text-xs text-muted-foreground">Last 14 days · daily completions</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" /> {delta >= 0 ? `+${delta}` : delta}%
            </span>
          </div>
          <div className="mt-4 h-64">
            {analyticsQ.isLoading ? (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={daily} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    fill="url(#gradA)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Top recommended careers</h2>
          <p className="text-xs text-muted-foreground">By frequency in reports</p>
          <ol className="mt-4 space-y-2.5">
            {(analyticsQ.data?.topCareers ?? []).slice(0, 7).map((c, i) => (
              <li key={c.title} className="flex items-center gap-3 text-sm">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-muted text-[11px] font-semibold text-muted-foreground">
                  {i + 1}
                </span>
                <span className="flex-1 truncate font-medium">{c.title}</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {c.count}
                </span>
              </li>
            ))}
            {!analyticsQ.data?.topCareers?.length && (
              <li className="text-xs text-muted-foreground">No reports yet.</li>
            )}
          </ol>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, delta }: { label: string; value: string; delta?: number }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/60 p-4 backdrop-blur">
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight">{value}</span>
        {typeof delta === "number" && (
          <span
            className={`text-xs font-semibold ${delta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
          >
            {delta >= 0 ? "+" : ""}
            {delta}%
          </span>
        )}
      </div>
    </div>
  );
}
