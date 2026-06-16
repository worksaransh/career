import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Check, TrendingUp, AlertTriangle } from "lucide-react";
import { getSharedReport } from "@/lib/career.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/share/$token")({
  ssr: false,
  head: () => ({ meta: [{ title: "Career Report — Career GPS AI" }] }),
  component: SharedReport,
});

function SharedReport() {
  const { token } = useParams({ from: "/share/$token" });
  const fetchShared = useServerFn(getSharedReport);
  const { data, isLoading } = useQuery({
    queryKey: ["shared", token],
    queryFn: () => fetchShared({ data: { token } }),
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-hero text-white shadow-glow">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-base font-semibold">Career GPS AI</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-5">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && !data && (
          <div className="rounded-2xl border border-border bg-card p-5 text-sm">
            This share link is invalid or has been revoked.
          </div>
        )}
        {data && (
          <>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Shared career report
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              {data.student?.full_name ?? "Student"}'s top 5 careers
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {[data.student?.class_level && `Class ${data.student.class_level}`, data.student?.stream, data.student?.city]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {data.summary && (
              <p className="mt-3 rounded-xl bg-muted p-3 text-sm">{data.summary}</p>
            )}

            <div className="mt-5 space-y-3">
              {data.careers.map((c, i) => (
                <article key={c.id ?? i} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                  <header className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary text-2xl">
                        {c.emoji}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground">#{i + 1}</div>
                        <div className="text-base font-bold">{c.title}</div>
                      </div>
                    </div>
                    <span className="rounded-full bg-mint/20 px-2.5 py-1 text-xs font-bold text-mint-foreground">
                      {c.matchScore}%
                    </span>
                  </header>
                  <ul className="mt-4 space-y-1.5">
                    {c.why.map((w, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-mint" />
                        {w}
                      </li>
                    ))}
                  </ul>
                  <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px]">
                    <Stat label="Salary" value={`₹${c.salaryEntry}–${c.salaryMid}L`} />
                    <Stat label="Demand" value={`${c.demandIndex}/100`} icon={<TrendingUp className="h-3 w-3" />} />
                    <Stat
                      label="AI risk"
                      value={c.aiRisk}
                      tone={c.aiRisk === "Low" ? "good" : c.aiRisk === "High" ? "bad" : "warn"}
                      icon={<AlertTriangle className="h-3 w-3" />}
                    />
                  </dl>
                  <div className="mt-4 rounded-xl bg-muted p-3 text-xs">
                    <div className="font-semibold">Education</div>
                    <div className="text-muted-foreground">{c.education}</div>
                    <div className="mt-2 font-semibold">Alternatives</div>
                    <div className="text-muted-foreground">{c.alternatives.join(" · ")}</div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-primary/30 bg-gradient-hero p-5 text-white shadow-glow">
              <div className="text-xs font-semibold uppercase tracking-wider opacity-90">For parents</div>
              <h2 className="mt-1 text-lg font-bold">Get the full ROI picture — ₹999</h2>
              <p className="mt-1 text-sm opacity-90">
                Parent Premium unlocks the ROI dashboard, education-cost vs salary scenarios, college comparison and 1-on-1 counsellor chats.
              </p>
              <ul className="mt-3 space-y-1.5 text-sm">
                {["Career ROI calculator", "Scenario modeling", "1-on-1 counsellor"].map((x) => (
                  <li key={x} className="flex items-center gap-1.5"><Check className="h-4 w-4" /> {x}</li>
                ))}
              </ul>
              <Link to="/pricing" className="mt-4 block rounded-xl bg-white px-4 py-2.5 text-center text-sm font-bold text-primary">
                See all plans →
              </Link>
            </div>

            <div className="mt-4 rounded-2xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              Want a roadmap for your child? <Link to="/" className="font-semibold text-primary">Try Career GPS AI</Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "warn" | "bad";
  icon?: React.ReactNode;
}) {
  const cls =
    tone === "good"
      ? "bg-mint/15 text-mint-foreground"
      : tone === "warn"
        ? "bg-saffron/15 text-saffron-foreground"
        : tone === "bad"
          ? "bg-destructive/15 text-destructive"
          : "bg-muted text-foreground";
  return (
    <div className={cn("rounded-xl p-2", cls)}>
      <div className="flex items-center justify-center gap-1 font-bold">
        {icon} {value}
      </div>
      <div className="mt-0.5 uppercase tracking-wider opacity-70">{label}</div>
    </div>
  );
}
