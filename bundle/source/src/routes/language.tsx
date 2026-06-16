import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { useI18n, LANG_LABELS, type Lang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/language")({
  head: () => ({
    meta: [
      { title: "Choose your language — Disha" },
      { name: "description", content: "Pick English, हिन्दी or Hinglish to continue." },
    ],
  }),
  component: LanguagePage,
});

function LanguagePage() {
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const [picked, setPicked] = React.useState<Lang>(lang);

  const options: { id: Lang; native: string; sample: string }[] = [
    { id: "en", native: "English", sample: "Find the right career in 15 minutes." },
    { id: "hi", native: "हिन्दी", sample: "सही करियर सिर्फ 15 मिनट में।" },
    { id: "hinglish", native: "Hinglish", sample: "Sahi career sirf 15 minutes mein." },
  ];

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-bold tracking-tight">{t("selectLang")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You can change this any time from Settings.
        </p>

        <div className="mt-6 space-y-3">
          {options.map((o) => {
            const active = picked === o.id;
            return (
              <button
                key={o.id}
                onClick={() => setPicked(o.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border bg-card p-4 text-left shadow-card transition-all",
                  active ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-foreground/20",
                )}
              >
                <div>
                  <div className="text-base font-semibold">{o.native}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{o.sample}</div>
                </div>
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full border",
                    active ? "border-primary bg-primary text-primary-foreground" : "border-border",
                  )}
                >
                  {active && <Check className="h-4 w-4" />}
                </span>
              </button>
            );
          })}
        </div>

        <Button
          size="lg"
          className="mt-8 h-12 w-full bg-gradient-hero text-white shadow-glow"
          onClick={() => {
            setLang(picked);
            navigate({ to: "/login" });
          }}
        >
          {t("continue")} <ArrowRight className="ml-1 h-4 w-4" />
        </Button>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {LANG_LABELS[picked]} · {t("appName")}
        </p>
      </div>
    </main>
  );
}
