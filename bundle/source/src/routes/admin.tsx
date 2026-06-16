import * as React from "react";
import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Building2,
  GraduationCap,
  Briefcase,
  LayoutDashboard,
  Loader2,
  ShieldAlert,
  Users,
  FileText,
  ArrowLeft,
  Sparkles,
  Search,
  Bell,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/admin.functions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin · Career GPS AI" }] }),
  component: AdminLayout,
});

type NavItem = {
  to: "/admin" | "/admin/users" | "/admin/analytics" | "/admin/careers" | "/admin/degrees" | "/admin/colleges" | "/admin/reports";
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  group: "Insights" | "Catalog" | "Operations";
};

const NAV: NavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true, group: "Insights" },
  { to: "/admin/analytics", label: "Assessments", icon: BarChart3, group: "Insights" },
  { to: "/admin/users", label: "Users", icon: Users, group: "Operations" },
  { to: "/admin/reports", label: "Reports", icon: FileText, group: "Operations" },
  { to: "/admin/careers", label: "Career database", icon: Briefcase, group: "Catalog" },
  { to: "/admin/degrees", label: "Degree database", icon: GraduationCap, group: "Catalog" },
  { to: "/admin/colleges", label: "Colleges", icon: Building2, group: "Catalog" },
];

const GROUPS: NavItem["group"][] = ["Insights", "Operations", "Catalog"];

function AdminLayout() {
  const navigate = useNavigate();
  const { location } = useRouterState();
  const [sessionChecked, setSessionChecked] = React.useState(false);
  const check = useServerFn(checkIsAdmin);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate({ to: "/login" });
      else setSessionChecked(true);
    });
  }, [navigate]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-check"],
    queryFn: () => check(),
    enabled: sessionChecked,
    retry: false,
  });

  if (!sessionChecked || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking access…
      </div>
    );
  }

  if (error || !data?.isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <div>
          <h1 className="text-2xl font-bold">Admin access required</h1>
          <p className="mt-1 text-sm text-muted-foreground">You don't have permission to view this area.</p>
        </div>
        <Button onClick={() => navigate({ to: "/dashboard" })}>Back to app</Button>
      </div>
    );
  }

  const currentNav = [...NAV].reverse().find((n) =>
    n.exact ? location.pathname === n.to : location.pathname.startsWith(n.to),
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/40 via-background to-muted/30">
      <div className="grid min-h-screen md:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="hidden border-r border-border/60 bg-background/80 backdrop-blur md:flex md:flex-col">
          <div className="border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-sm">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Admin Console
                </div>
                <div className="text-sm font-bold tracking-tight">Career GPS</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-5 overflow-y-auto p-3">
            {GROUPS.map((g) => (
              <div key={g}>
                <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  {g}
                </div>
                <div className="space-y-0.5">
                  {NAV.filter((n) => n.group === g).map((n) => {
                    const active = n.exact ? location.pathname === n.to : location.pathname.startsWith(n.to);
                    const Icon = n.icon;
                    return (
                      <Link
                        key={n.to}
                        to={n.to}
                        className={cn(
                          "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                          active
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <Icon className={cn("h-4 w-4", active ? "" : "text-muted-foreground/70")} />
                        {n.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-border/60 p-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back to app
            </Link>
          </div>
        </aside>

        {/* Mobile top nav */}
        <div className="md:hidden">
          <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
            <div className="font-bold">Admin</div>
            <Link to="/dashboard" className="text-xs text-muted-foreground">
              Back to app
            </Link>
          </div>
          <div className="flex gap-1 overflow-x-auto border-b border-border bg-background px-3 py-2">
            {NAV.map((n) => {
              const active = n.exact ? location.pathname === n.to : location.pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium",
                    active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </div>
        </div>

        <main className="min-w-0">
          {/* Topbar (desktop) */}
          <div className="sticky top-0 z-20 hidden items-center gap-4 border-b border-border/60 bg-background/70 px-8 py-3 backdrop-blur md:flex">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Admin</span>
              <span>/</span>
              <span className="font-medium text-foreground">{currentNav?.label ?? "Overview"}</span>
            </div>
            <div className="relative ml-auto w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Quick search…"
                className="h-9 pl-8 text-sm"
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  const v = e.currentTarget.value.toLowerCase();
                  if (!v) return;
                  if ("users".includes(v)) navigate({ to: "/admin/users" });
                  else if ("careers".includes(v)) navigate({ to: "/admin/careers" });
                  else if ("degrees".includes(v)) navigate({ to: "/admin/degrees" });
                  else if ("colleges".includes(v)) navigate({ to: "/admin/colleges" });
                  else if ("reports".includes(v)) navigate({ to: "/admin/reports" });
                }}
              />
            </div>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Bell className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
