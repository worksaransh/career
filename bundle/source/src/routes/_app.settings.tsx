import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bell, Crown, HelpCircle, LogOut, Moon, Shield } from "lucide-react";
import { useI18n, LANG_LABELS } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { LangSwitch } from "@/components/lang-switch";
import * as React from "react";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — Disha" }] }),
  component: Settings,
});

function Settings() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [dark, setDark] = React.useState(false);
  const [notif, setNotif] = React.useState(true);

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("settings")}
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Account</h1>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-hero text-lg font-bold text-white">
          A
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold">Aarav Sharma</div>
          <div className="text-xs text-muted-foreground">+91 98XXXXXX12 · Class 12 Commerce</div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-saffron/15 px-2 py-1 text-[11px] font-bold text-saffron-foreground">
          <Crown className="h-3 w-3" /> Free
        </span>
      </div>

      <section className="space-y-2 rounded-2xl border border-border bg-card p-2 shadow-card">
        <Row label="Language" hint={LANG_LABELS[lang]}>
          <LangSwitch />
        </Row>
        <Row label="Dark mode" icon={<Moon className="h-4 w-4" />}>
          <Switch checked={dark} onCheckedChange={setDark} />
        </Row>
        <Row label="Notifications" icon={<Bell className="h-4 w-4" />}>
          <Switch checked={notif} onCheckedChange={setNotif} />
        </Row>
        <Row label="Privacy" icon={<Shield className="h-4 w-4" />}>
          <span className="text-xs text-muted-foreground">Manage</span>
        </Row>
        <Row label="Help & support" icon={<HelpCircle className="h-4 w-4" />}>
          <span className="text-xs text-muted-foreground">Contact</span>
        </Row>
      </section>

      <Button
        variant="outline"
        className="h-12 w-full"
        onClick={() => navigate({ to: "/" })}
      >
        <LogOut className="mr-2 h-4 w-4" /> Log out
      </Button>

      <p className="text-center text-[11px] text-muted-foreground">v0.1 · Made for India 🇮🇳</p>
    </div>
  );
}

function Row({
  label,
  hint,
  icon,
  children,
}: {
  label: string;
  hint?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl px-3 py-3">
      <div className="flex items-center gap-3">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <div>
          <div className="text-sm font-medium">{label}</div>
          {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}
