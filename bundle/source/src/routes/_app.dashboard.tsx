import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Compass, FileText, Sparkles, Trophy, Zap } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CAREERS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Disha" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { t } = useI18n();
  const top = CAREERS[0];

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div>
        <div className="text-sm text-muted-foreground">{t("hi_user")}, Aarav 👋</div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Let's plan your next move.</h1>
      </div>

      {/* XP / Level card */}
      <div className="overflow-hidden rounded-2xl bg-gradient-hero p-5 text-white shadow-glow">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs/4 opacity-80">{t("level")} 3 · Explorer</div>
            <div className="mt-1 text-2xl font-bold">1,240 {t("xp")}</div>
          </div>
          <Trophy className="h-7 w-7 opacity-90" />
        </div>
        <div className="mt-4">
          <Progress value={62} className="h-2 bg-white/20" />
          <div className="mt-2 flex justify-between text-[11px] opacity-80">
            <span>L3</span>
            <span>760 XP to L4</span>
          </div>
        </div>
      </div>

      {/* Top match */}
      <Link
        to="/report"
        className="block overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card"
      >
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("yourMatch")}
          </div>
          <span className="rounded-full bg-mint/20 px-2 py-0.5 text-xs font-bold text-mint-foreground">
            {top.matchScore}% match
          </span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-2xl">
            {top.emoji}
          </div>
          <div>
            <div className="text-lg font-bold">{top.title}</div>
            <div className="text-xs text-muted-foreground">
              ₹{top.salaryEntry}–{top.salaryMid} LPA · AI risk: {top.aiRisk}
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm font-medium text-primary">
          {t("viewReport")} <ArrowRight className="h-4 w-4" />
        </div>
      </Link>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <QuickCard
          to="/assessment"
          icon={<Zap className="h-5 w-5" />}
          title={t("assessment")}
          sub="5 min · +200 XP"
          tint="bg-gradient-saffron"
        />
        <QuickCard
          to="/roadmap"
          icon={<Compass className="h-5 w-5" />}
          title={t("roadmap")}
          sub="Career GPS"
          tint="bg-gradient-mint"
        />
        <QuickCard
          to="/report"
          icon={<FileText className="h-5 w-5" />}
          title={t("report")}
          sub="Top 5 careers"
          tint="bg-gradient-primary"
        />
        <QuickCard
          to="/parent"
          icon={<Sparkles className="h-5 w-5" />}
          title={t("parent")}
          sub="ROI & cost"
          tint="bg-gradient-hero"
        />
      </div>

      {/* Daily quest */}
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Daily quest
        </div>
        <div className="mt-1 text-sm">
          Finish the 5-minute assessment to unlock your personalised roadmap.
        </div>
        <Button asChild size="sm" className="mt-3 bg-gradient-hero text-white">
          <Link to="/assessment">Start +200 XP</Link>
        </Button>
      </div>
    </div>
  );
}

function QuickCard({
  to,
  icon,
  title,
  sub,
  tint,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  sub: string;
  tint: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-border bg-card p-4 shadow-card transition-transform active:scale-[0.98]"
    >
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-white ${tint}`}>
        {icon}
      </div>
      <div className="mt-3 text-sm font-semibold">{title}</div>
      <div className="text-[11px] text-muted-foreground">{sub}</div>
    </Link>
  );
}
