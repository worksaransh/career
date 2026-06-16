import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  Bot,
  Building2,
  Calculator,
  GraduationCap,
  IndianRupee,
  Loader2,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useI18n } from "@/lib/i18n";
import { getParentDashboard } from "@/lib/career.functions";

export const Route = createFileRoute("/_app/parent")({
  head: () => ({ meta: [{ title: "Parent Dashboard — Disha" }] }),
  component: Parent,
});

type Career = {
  id: string;
  title: string;
  emoji: string;
  matchScore: number;
  salaryEntry: number;
  salaryMid: number;
  salarySenior: number;
  demandIndex: number;
  aiRisk: "Low" | "Medium" | "High";
  growthRate: number;
  futureDemand: string;
  remoteOpportunities: string;
  education: string;
  educationCostL: number;
  topCompanies: string[];
  degreesAccepted: string[];
  fiveYearEarn: number;
  roi: number;
  paybackMonths: number;
};

function Parent() {
  const { t } = useI18n();
  const fn = useServerFn(getParentDashboard);
  const { data, isLoading } = useQuery({ queryKey: ["parent-dashboard"], queryFn: () => fn() });

  if (isLoading) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Crunching numbers…
      </div>
    );
  }

  const careers = (data?.careers as Career[] | undefined) ?? [];
  if (careers.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-card">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold">No report yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask your child to complete the assessment to unlock the parent dashboard.
        </p>
        <Link
          to="/assessment"
          className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Start assessment
        </Link>
      </div>
    );
  }

  const top = careers[0];
  const studentName = data?.student?.full_name?.split(" ")[0] ?? "your child";
  const avgRoi = +(careers.reduce((s, c) => s + c.roi, 0) / careers.length).toFixed(1);
  const totalInvest = top.educationCostL;
  const maxSalary = Math.max(...careers.map((c) => c.salarySenior));

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("parent")} · Intelligence
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{studentName}'s plan, in numbers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Career ROI, education cost & risk analysis for the top {careers.length} matched careers.
        </p>
      </div>

      {/* Hero ROI */}
      <div className="overflow-hidden rounded-2xl bg-gradient-hero p-5 text-white shadow-glow">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-80">
          <TrendingUp className="h-3.5 w-3.5" /> Expected ROI · {top.title}
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <div className="text-4xl font-bold">{top.roi}×</div>
          <div className="text-sm opacity-80">5-yr earnings vs invest</div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <StatLight label="Invest" value={`₹${totalInvest}L`} />
          <StatLight label="Yr 1 salary" value={`₹${top.salaryEntry}L`} />
          <StatLight label="Payback" value={`${top.paybackMonths} mo`} />
        </div>
      </div>

      {/* Scenario modeling */}
      <ScenarioModeler careers={careers} />

      {/* KPI strip */}
      <section className="grid grid-cols-2 gap-3">
        <KpiCard
          icon={<Wallet className="h-4 w-4" />}
          label="Avg ROI (top 3)"
          value={`${avgRoi}×`}
          tone="primary"
        />
        <KpiCard
          icon={<IndianRupee className="h-4 w-4" />}
          label="Peak salary"
          value={`₹${maxSalary}L`}
          tone="mint"
        />
        <KpiCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Demand"
          value={`${top.demandIndex}/100`}
          tone="saffron"
        />
        <KpiCard
          icon={<ShieldCheck className="h-4 w-4" />}
          label="AI risk"
          value={top.aiRisk}
          tone={top.aiRisk === "Low" ? "mint" : top.aiRisk === "Medium" ? "saffron" : "danger"}
        />
      </section>

      {/* Salary comparison */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <SectionHeader icon={<IndianRupee className="h-4 w-4 text-primary" />} title="Salary trajectory" subtitle="Entry → Mid → Senior (₹ LPA)" />
        <div className="mt-4 space-y-4">
          {careers.map((c) => (
            <SalaryRow key={c.id} c={c} max={maxSalary} />
          ))}
        </div>
      </section>

      {/* Career ROI comparison */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <SectionHeader icon={<Calculator className="h-4 w-4 text-primary" />} title="Career ROI" subtitle="5-yr earnings ÷ education cost" />
        <div className="mt-3 overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Career</th>
                <th className="px-3 py-2 text-right font-semibold">Invest</th>
                <th className="px-3 py-2 text-right font-semibold">5-yr earn</th>
                <th className="px-3 py-2 text-right font-semibold">ROI</th>
              </tr>
            </thead>
            <tbody>
              {careers.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-3 py-2 font-medium">
                    {c.emoji} {c.title}
                  </td>
                  <td className="px-3 py-2 text-right">₹{c.educationCostL}L</td>
                  <td className="px-3 py-2 text-right">₹{c.fiveYearEarn}L</td>
                  <td className="px-3 py-2 text-right font-bold text-primary">{c.roi}×</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Future demand + AI risk */}
      <section className="grid gap-3 md:grid-cols-2">
        <Panel icon={<TrendingUp className="h-4 w-4 text-mint-foreground" />} title="Future demand">
          <div className="space-y-3">
            {careers.map((c) => (
              <div key={c.id}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{c.emoji} {c.title}</span>
                  <span className="text-muted-foreground">{c.demandIndex}/100 · +{c.growthRate}%/yr</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                    style={{ width: `${Math.min(100, c.demandIndex)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel icon={<Bot className="h-4 w-4 text-saffron" />} title="AI automation risk">
          <div className="space-y-2">
            {careers.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm">
                <span className="font-medium">{c.emoji} {c.title}</span>
                <RiskBadge risk={c.aiRisk} />
              </div>
            ))}
            <p className="pt-1 text-[11px] text-muted-foreground">
              Risk is the chance the role is largely automated within 10 years.
            </p>
          </div>
        </Panel>
      </section>

      {/* Degree comparison */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <SectionHeader icon={<GraduationCap className="h-4 w-4 text-primary" />} title="Degree comparison" subtitle="Cost, duration and feeder colleges" />
        <div className="mt-3 space-y-2">
          {(data?.degrees ?? []).map((d: any) => (
            <div key={d.name} className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5">
              <div>
                <div className="text-sm font-semibold">{d.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {d.duration ?? "—"} · {(d.top_colleges ?? []).slice(0, 3).join(", ") || "—"}
                </div>
              </div>
              <div className="text-sm font-bold">₹{Number(d.avg_cost ?? 0).toLocaleString("en-IN")}</div>
            </div>
          ))}
          {(data?.degrees ?? []).length === 0 && (
            <p className="text-xs text-muted-foreground">No degrees configured yet.</p>
          )}
        </div>
      </section>

      {/* Education cost breakdown */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <SectionHeader icon={<Wallet className="h-4 w-4 text-primary" />} title="Education cost — top pick" subtitle={top.title} />
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <CostCell label="Tuition" value={`₹${(top.educationCostL * 0.7).toFixed(1)}L`} />
          <CostCell label="Living" value={`₹${(top.educationCostL * 0.2).toFixed(1)}L`} />
          <CostCell label="Other" value={`₹${(top.educationCostL * 0.1).toFixed(1)}L`} />
        </div>
        <div className="mt-3 flex items-center justify-between rounded-xl bg-muted px-3 py-2 text-sm">
          <span className="text-muted-foreground">Total investment</span>
          <span className="font-bold">₹{top.educationCostL}L</span>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Estimates based on {top.education}. Scholarships and education loans can offset 30–60%.
        </p>
      </section>

      {/* Top companies + colleges */}
      <section className="grid gap-3 md:grid-cols-2">
        <Panel icon={<Building2 className="h-4 w-4 text-primary" />} title="Top hiring companies">
          <div className="flex flex-wrap gap-1.5">
            {(top.topCompanies.length ? top.topCompanies : ["Google", "Microsoft", "TCS", "Infosys"]).slice(0, 8).map((co) => (
              <span key={co} className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{co}</span>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
            <Users className="h-3.5 w-3.5" /> Remote-friendly: <span className="font-medium capitalize">{top.remoteOpportunities}</span>
          </div>
        </Panel>

        <Panel icon={<GraduationCap className="h-4 w-4 text-primary" />} title="Recommended colleges">
          <div className="space-y-2">
            {(data?.colleges ?? []).map((c: any) => (
              <div key={c.name} className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
                <div>
                  <div className="text-sm font-semibold">{c.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {[c.city, c.state].filter(Boolean).join(", ")} · {c.type}
                  </div>
                </div>
                <div className="text-right">
                  {c.ranking && <div className="text-[11px] text-muted-foreground">#{c.ranking}</div>}
                  {c.avg_fees && <div className="text-sm font-bold">₹{Number(c.avg_fees).toLocaleString("en-IN")}</div>}
                </div>
              </div>
            ))}
            {(data?.colleges ?? []).length === 0 && (
              <p className="text-xs text-muted-foreground">No colleges configured yet.</p>
            )}
          </div>
        </Panel>
      </section>
    </div>
  );
}

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm font-semibold">{icon} {title}</div>
      {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function Panel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center gap-2 text-sm font-semibold">{icon} {title}</div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function KpiCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: "primary" | "mint" | "saffron" | "danger" }) {
  const toneClass =
    tone === "mint"
      ? "bg-mint/15 text-mint-foreground"
      : tone === "saffron"
      ? "bg-saffron/15 text-saffron-foreground"
      : tone === "danger"
      ? "bg-destructive/15 text-destructive"
      : "bg-primary/10 text-primary";
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${toneClass}`}>{icon}</div>
      <div className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}

function SalaryRow({ c, max }: { c: Career; max: number }) {
  const pct = (v: number) => `${Math.min(100, (v / max) * 100)}%`;
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold">{c.emoji} {c.title}</span>
        <span className="text-muted-foreground">₹{c.salaryEntry}L → ₹{c.salaryMid}L → ₹{c.salarySenior}L</span>
      </div>
      <div className="mt-1.5 flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary/40" style={{ width: pct(c.salaryEntry) }} />
        <div className="h-full bg-primary/70" style={{ width: `calc(${pct(c.salaryMid)} - ${pct(c.salaryEntry)})` }} />
        <div className="h-full bg-primary" style={{ width: `calc(${pct(c.salarySenior)} - ${pct(c.salaryMid)})` }} />
      </div>
    </div>
  );
}

function RiskBadge({ risk }: { risk: "Low" | "Medium" | "High" }) {
  const cls =
    risk === "Low"
      ? "bg-mint/20 text-mint-foreground"
      : risk === "Medium"
      ? "bg-saffron/20 text-saffron-foreground"
      : "bg-destructive/15 text-destructive";
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>{risk}</span>;
}

function CostCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background px-2 py-3">
      <div className="text-base font-bold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function ScenarioModeler({ careers }: { careers: Career[] }) {
  const [selectedId, setSelectedId] = React.useState(careers[0].id);
  const selected = careers.find((c) => c.id === selectedId) ?? careers[0];

  const baseCost = Math.max(1, Math.round(selected.educationCostL));
  const baseSalary = Math.max(1, Math.round(selected.salaryEntry));

  const [cost, setCost] = React.useState(baseCost);
  const [salary, setSalary] = React.useState(baseSalary);

  // Re-baseline when career changes
  React.useEffect(() => {
    setCost(baseCost);
    setSalary(baseSalary);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // Mid/Senior scale proportionally to the entry-salary forecast
  const salaryScale = baseSalary > 0 ? salary / baseSalary : 1;
  const midForecast = +(selected.salaryMid * salaryScale).toFixed(1);
  const seniorForecast = +(selected.salarySenior * salaryScale).toFixed(1);
  const fiveYearEarn = +(salary * 2 + midForecast * 3).toFixed(1);
  const roi = cost > 0 ? +(fiveYearEarn / cost).toFixed(2) : 0;
  const paybackMonths = salary > 0 ? Math.ceil((cost / salary) * 12) : 0;

  // Demand index shifts with affordability + salary attractiveness
  const costFactor = baseCost > 0 ? baseCost / cost : 1; // cheaper → higher demand
  const salaryFactor = salary / Math.max(1, baseSalary); // higher pay → higher demand
  const demandForecast = Math.max(0, Math.min(100, Math.round(selected.demandIndex * (0.5 + 0.25 * costFactor + 0.25 * salaryFactor))));
  const demandDelta = demandForecast - selected.demandIndex;
  const roiDelta = +(roi - selected.roi).toFixed(2);
  const paybackDelta = paybackMonths - selected.paybackMonths;

  const reset = () => {
    setCost(baseCost);
    setSalary(baseSalary);
  };

  return (
    <section className="rounded-2xl border border-primary/30 bg-card p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <SlidersHorizontal className="h-4 w-4 text-primary" /> Scenario modeling
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Tweak education cost & forecast salary to see ROI, payback and demand in real time.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      {/* Career picker */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {careers.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedId(c.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              c.id === selectedId
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground hover:bg-muted/70"
            }`}
          >
            {c.emoji} {c.title}
          </button>
        ))}
      </div>

      {/* Sliders */}
      <div className="mt-5 space-y-5">
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Education cost</span>
            <span className="font-bold">
              ₹{cost}L{" "}
              <span className="text-muted-foreground">(base ₹{baseCost}L)</span>
            </span>
          </div>
          <Slider
            value={[cost]}
            min={1}
            max={Math.max(40, baseCost * 3)}
            step={1}
            onValueChange={(v) => setCost(v[0])}
            className="mt-2"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Forecast Year 1 salary</span>
            <span className="font-bold">
              ₹{salary}L{" "}
              <span className="text-muted-foreground">(base ₹{baseSalary}L)</span>
            </span>
          </div>
          <Slider
            value={[salary]}
            min={1}
            max={Math.max(50, baseSalary * 3)}
            step={1}
            onValueChange={(v) => setSalary(v[0])}
            className="mt-2"
          />
        </div>
      </div>

      {/* Live outputs */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        <ScenarioStat label="ROI (5y)" value={`${roi}×`} delta={roiDelta} unit="×" />
        <ScenarioStat label="Payback" value={`${paybackMonths} mo`} delta={paybackDelta} unit=" mo" invert />
        <ScenarioStat label="Demand" value={`${demandForecast}/100`} delta={demandDelta} />
      </div>

      <div className="mt-4 rounded-xl bg-muted/60 p-3 text-[11px] text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>Forecast salary trajectory</span>
          <span className="font-semibold text-foreground">
            ₹{salary}L → ₹{midForecast}L → ₹{seniorForecast}L
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span>5-year earnings</span>
          <span className="font-semibold text-foreground">₹{fiveYearEarn}L</span>
        </div>
      </div>
    </section>
  );
}

function ScenarioStat({ label, value, delta, unit = "", invert = false }: { label: string; value: string; delta: number; unit?: string; invert?: boolean }) {
  const positive = invert ? delta < 0 : delta > 0;
  const negative = invert ? delta > 0 : delta < 0;
  const tone = positive ? "text-mint-foreground" : negative ? "text-destructive" : "text-muted-foreground";
  const sign = delta > 0 ? "+" : "";
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-lg font-bold">{value}</div>
      {delta !== 0 && (
        <div className={`text-[11px] font-medium ${tone}`}>
          {sign}
          {delta}
          {unit} vs base
        </div>
      )}
    </div>
  );
}

function StatLight({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/15 px-2 py-2 backdrop-blur-sm">
      <div className="text-base font-bold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider opacity-80">{label}</div>
    </div>
  );
}
