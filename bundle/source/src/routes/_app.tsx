import * as React from "react";
import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { Sparkles, Flame } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { LangSwitch } from "@/components/lang-switch";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_app")({
  ssr: false,
  component: AppLayout,
});

function AppLayout() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate({ to: "/login" });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate({ to: "/login" });
      else setChecking(false);
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-hero text-white shadow-glow">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-base font-semibold tracking-tight">{t("appName")}</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-saffron/15 px-2.5 py-1 text-xs font-semibold text-saffron-foreground">
              <Flame className="h-3.5 w-3.5 text-saffron" />
              5 {t("streak")}
            </span>
            <LangSwitch />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pb-28 pt-4">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
