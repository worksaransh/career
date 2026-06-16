import * as React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Compass, FileText, Users, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export function BottomNav() {
  const { t } = useI18n();
  const { location } = useRouterState();
  const items = [
    { to: "/dashboard", icon: Home, label: t("dashboard") },
    { to: "/roadmap", icon: Compass, label: t("roadmap") },
    { to: "/report", icon: FileText, label: t("report") },
    { to: "/parent", icon: Users, label: t("parent") },
    { to: "/settings", icon: SettingsIcon, label: t("settings") },
  ] as const;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/85 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {items.map((it) => {
          const active = location.pathname.startsWith(it.to);
          const Icon = it.icon;
          return (
            <li key={it.to}>
              <Link
                to={it.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                    active && "bg-primary/10",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
