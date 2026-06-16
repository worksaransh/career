import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Target, TrendingUp, ShieldCheck, Star } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LangSwitch } from "@/components/lang-switch";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Disha — AI Career GPS for Class 11–12 in India" },
      {
        name: "description",
        content:
          "Find the right career, degree and college in 15 minutes. Built for Indian Class 11–12 students and parents. Free assessment in English, हिन्दी and Hinglish.",
      },
      { property: "og:title", content: "Disha — AI Career GPS" },
      {
        property: "og:description",
        content: "Personalised career, degree & college roadmap for Class 11–12 students in India.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t } = useI18n();
  return (
    <main className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-hero text-white shadow-glow">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-base font-semibold tracking-tight">{t("appName")}</span>
          </Link>
          <LangSwitch />
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 pt-8 pb-12">
        <div className="mx-auto max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Star className="h-3.5 w-3.5 text-saffron" />
            {t("tagline")}
          </div>
          <h1 className="mt-4 text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-4 text-balance text-base text-muted-foreground">{t("heroSub")}</p>
          <div className="mt-6 flex flex-col gap-3">
            <Button asChild size="lg" className="h-12 bg-gradient-hero text-white shadow-glow hover:opacity-95">
              <Link to="/language">
                {t("startFree")}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="h-12">
              <Link to="/login">{t("loginCta")}</Link>
            </Button>
          </div>

          {/* Trust strip */}
          <div className="mt-8 grid grid-cols-3 gap-2 rounded-2xl border border-border bg-card p-4 text-center shadow-card">
            <Stat value="1L+" label="Students" />
            <Stat value="200+" label="Careers" />
            <Stat value="4.8★" label="Rated" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/40 px-4 py-10">
        <div className="mx-auto max-w-md space-y-3">
          <h2 className="mb-4 text-lg font-semibold">{t("whyDisha")}</h2>
          <Feature
            icon={<Target className="h-5 w-5" />}
            title={t("feat1Title")}
            body={t("feat1Body")}
            tint="bg-gradient-primary"
          />
          <Feature
            icon={<TrendingUp className="h-5 w-5" />}
            title={t("feat2Title")}
            body={t("feat2Body")}
            tint="bg-gradient-saffron"
          />
          <Feature
            icon={<ShieldCheck className="h-5 w-5" />}
            title={t("feat3Title")}
            body={t("feat3Body")}
            tint="bg-gradient-mint"
          />
        </div>
      </section>

      {/* Sticky CTA */}
      <div
        className="sticky bottom-0 border-t border-border bg-background/90 backdrop-blur-xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto max-w-md px-4 py-3">
          <Button asChild size="lg" className="h-12 w-full bg-gradient-hero text-white shadow-glow">
            <Link to="/language">
              {t("startFree")} <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-lg font-bold tracking-tight">{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
  tint,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  tint: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${tint}`}>
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <p className="mt-1 text-xs text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
