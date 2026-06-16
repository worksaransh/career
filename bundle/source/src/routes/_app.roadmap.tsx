import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, Cpu, GraduationCap, MapPin, Sparkles, TrendingUp } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { ROADMAP_PM } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/roadmap")({
  head: () => ({ meta: [{ title: "Career GPS Roadmap — Disha" }] }),
  component: RoadmapPage,
});

function RoadmapPage() {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("roadmap")}
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Class 12 → Product Manager</h1>
      </div>

      {/* From / To */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> Current
          </div>
          <div className="mt-1 text-sm font-semibold">{ROADMAP_PM.current}</div>
        </div>
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Goal
          </div>
          <div className="mt-1 text-sm font-semibold">{ROADMAP_PM.goal}</div>
        </div>
      </div>

      {/* Timeline */}
      <ol className="relative space-y-4 border-l-2 border-dashed border-border pl-5">
        {ROADMAP_PM.phases.map((p, i) => (
          <li key={p.id} className="relative">
            <span className="absolute -left-[29px] flex h-6 w-6 items-center justify-center rounded-full bg-gradient-hero text-[11px] font-bold text-white shadow-glow">
              {i + 1}
            </span>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-bold">{p.title}</div>
                  <div className="text-[11px] text-muted-foreground">{p.period}</div>
                </div>
                {p.salaryAt > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-mint/20 px-2 py-0.5 text-[11px] font-bold text-mint-foreground">
                    <TrendingUp className="h-3 w-3" /> ₹{p.salaryAt} LPA
                  </span>
                )}
              </div>
              <ul className="mt-3 space-y-1.5">
                {p.milestones.map((m, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                    {m}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5" /> {p.cost}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" /> Checkpoint {i + 1}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-4 text-xs text-muted-foreground">
        <Cpu className="mb-2 inline h-4 w-4 text-primary" /> Roadmap auto-recalculates as you log
        marks, projects and internships.
      </div>
    </div>
  );
}
