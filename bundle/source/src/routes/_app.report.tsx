import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AlertTriangle, Check, Download, Share2, TrendingUp, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { CAREERS } from "@/lib/mock-data";
import { getLatestRecommendation, createShareLink } from "@/lib/career.functions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import jsPDF from "jspdf";

export const Route = createFileRoute("/_app/report")({
  head: () => ({ meta: [{ title: "Career Report — Career GPS AI" }] }),
  component: Report,
});

type Career = (typeof CAREERS)[number];

function Report() {
  const { t } = useI18n();
  const fetchLatest = useServerFn(getLatestRecommendation);
  const share = useServerFn(createShareLink);

  const { data, isLoading } = useQuery({
    queryKey: ["latestRecommendation"],
    queryFn: () => fetchLatest(),
  });

  const careers: Career[] = (data?.careers as Career[] | undefined) ?? CAREERS;
  const isReal = !!data;

  const shareMut = useMutation({
    mutationFn: () => share(),
    onSuccess: async ({ token }) => {
      const url = `${window.location.origin}/share/${token}`;
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Share link copied — send it to your parent");
      } catch {
        toast.success(`Share link: ${url}`);
      }
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not create link"),
  });

  function downloadPdf() {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    let y = 50;

    doc.setFillColor(91, 61, 246);
    doc.rect(0, 0, pageW, 80, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Career GPS AI — Your Report", 40, 50);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(new Date().toLocaleDateString(), 40, 68);

    y = 110;
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Top 5 career matches", 40, y);
    y += 10;

    careers.forEach((c, i) => {
      if (y > 740) {
        doc.addPage();
        y = 50;
      }
      y += 18;
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(`${i + 1}. ${c.title}  —  ${c.matchScore}% match`, 40, y);
      y += 16;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text(
        `Salary: INR ${c.salaryEntry}-${c.salaryMid} LPA   Demand: ${c.demandIndex}/100   AI risk: ${c.aiRisk}`,
        40,
        y,
      );
      y += 14;
      doc.setTextColor(20, 20, 20);
      c.why.forEach((w) => {
        const lines = doc.splitTextToSize(`• ${w}`, pageW - 80);
        doc.text(lines, 50, y);
        y += lines.length * 12;
      });
      y += 4;
      doc.setTextColor(80, 80, 80);
      const ed = doc.splitTextToSize(`Education: ${c.education}`, pageW - 80);
      doc.text(ed, 40, y);
      y += ed.length * 12;
      const alt = doc.splitTextToSize(`Alternatives: ${c.alternatives.join(", ")}`, pageW - 80);
      doc.text(alt, 40, y);
      y += alt.length * 12 + 8;
      doc.setTextColor(20, 20, 20);
    });

    doc.save("career-gps-report.pdf");
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("report")}
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Your top 5 careers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isReal
              ? data?.summary || "Personalised by Career GPS AI."
              : "Sample report — complete the assessment to get yours."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button onClick={downloadPdf} variant="outline" className="h-11">
          <Download className="mr-1 h-4 w-4" /> Download PDF
        </Button>
        <Button
          onClick={() => shareMut.mutate()}
          disabled={!isReal || shareMut.isPending}
          className="h-11 bg-gradient-hero text-white shadow-glow"
        >
          {shareMut.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Share2 className="mr-1 h-4 w-4" />}
          Share with parent
        </Button>
      </div>

      {isLoading && (
        <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Loading your latest report…
        </div>
      )}

      <div className="space-y-3">
        {careers.map((c, i) => (
          <article
            key={c.id ?? i}
            className="overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card"
          >
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
              <Metric label="Salary" value={`₹${c.salaryEntry}–${c.salaryMid}L`} />
              <Metric label="Demand" value={`${c.demandIndex}/100`} icon={<TrendingUp className="h-3 w-3" />} />
              <Metric
                label="AI risk"
                value={c.aiRisk}
                tone={c.aiRisk === "Low" ? "good" : c.aiRisk === "High" ? "bad" : "warn"}
                icon={<AlertTriangle className="h-3 w-3" />}
              />
            </dl>

            <div className="mt-4 rounded-xl bg-muted p-3 text-xs">
              <div className="font-semibold">Required education</div>
              <div className="mt-0.5 text-muted-foreground">{c.education}</div>
              <div className="mt-2 font-semibold">Alternatives</div>
              <div className="mt-0.5 text-muted-foreground">{c.alternatives.join(" · ")}</div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Metric({
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
  const toneClass =
    tone === "good"
      ? "bg-mint/15 text-mint-foreground"
      : tone === "warn"
        ? "bg-saffron/15 text-saffron-foreground"
        : tone === "bad"
          ? "bg-destructive/15 text-destructive"
          : "bg-muted text-foreground";
  return (
    <div className={cn("rounded-xl p-2", toneClass)}>
      <div className="flex items-center justify-center gap-1 font-bold">
        {icon} {value}
      </div>
      <div className="mt-0.5 uppercase tracking-wider opacity-70">{label}</div>
    </div>
  );
}
