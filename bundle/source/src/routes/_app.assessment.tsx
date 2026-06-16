import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ASSESSMENT_QUESTIONS } from "@/lib/mock-data";
import { submitAssessment } from "@/lib/career.functions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/assessment")({
  head: () => ({ meta: [{ title: "Assessment — Career GPS AI" }] }),
  component: Assessment,
});

function Assessment() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const submit = useServerFn(submitAssessment);
  const [idx, setIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, number>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [finished, setFinished] = React.useState(false);

  const q = ASSESSMENT_QUESTIONS[idx];
  const progress = ((idx + (finished ? 1 : 0)) / ASSESSMENT_QUESTIONS.length) * 100;

  function pick(optIdx: number) {
    setAnswers((a) => ({ ...a, [q.id]: optIdx }));
  }

  async function next() {
    if (idx < ASSESSMENT_QUESTIONS.length - 1) {
      setIdx(idx + 1);
      return;
    }
    setSubmitting(true);
    try {
      await submit({ data: { answers, language: lang } });
      setFinished(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  if (finished) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-hero text-white shadow-glow">
          <Sparkles className="h-9 w-9" />
        </div>
        <h2 className="mt-6 text-2xl font-bold tracking-tight">+200 XP unlocked!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We crunched your answers. Your top career match is ready.
        </p>
        <Button
          size="lg"
          className="mt-6 h-12 w-full max-w-xs bg-gradient-hero text-white shadow-glow"
          onClick={() => navigate({ to: "/report" })}
        >
          {t("viewReport")} <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    );
  }

  const picked = answers[q.id];
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>
            {t("question")} {idx + 1} {t("of")} {ASSESSMENT_QUESTIONS.length}
          </span>
          <span>+40 XP</span>
        </div>
        <Progress value={progress} className="mt-2 h-2" />
      </div>

      <h2 className="text-xl font-bold leading-snug tracking-tight">{q.text[lang]}</h2>

      <div className="space-y-3">
        {q.options.map((o, i) => {
          const active = picked === i;
          return (
            <button
              key={i}
              onClick={() => pick(i)}
              className={cn(
                "flex w-full items-center justify-between rounded-2xl border bg-card p-4 text-left shadow-card transition-all",
                active ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-foreground/20",
              )}
            >
              <span className="text-sm font-medium">{o[lang]}</span>
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

      <div
        className="fixed inset-x-0 bottom-16 border-t border-border bg-background/90 backdrop-blur-xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex max-w-md gap-2 px-4 py-3">
          <Button
            variant="ghost"
            className="h-12 flex-1"
            disabled={idx === 0 || submitting}
            onClick={() => setIdx(idx - 1)}
          >
            {t("back")}
          </Button>
          <Button
            className="h-12 flex-[2] bg-gradient-hero text-white shadow-glow"
            disabled={picked === undefined || submitting}
            onClick={next}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Analysing…
              </>
            ) : idx === ASSESSMENT_QUESTIONS.length - 1 ? (
              t("done")
            ) : (
              <>
                {t("next")}
                <ArrowRight className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
