"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Route,
  Brain,
  GraduationCap,
  Building2,
  LineChart,
  FileText,
  Award,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  Menu,
  Sparkles,
  BarChart3,
  BookOpen,
  Rocket,
  FolderOpen,
  DollarSign,
  TrendingUp,
  Briefcase,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils/cn";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/shared/theme-toggle";

type PersonaNav = { href: string; label: string; icon: React.ElementType; personas: string[] }[];

const allLinks: PersonaNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, personas: ["STUDENT", "PARENT", "COLLEGE_STUDENT", "GRADUATE", "PROFESSIONAL", "CAREER_SWITCHER"] },
  { href: "/assessments", label: "Assessments", icon: Brain, personas: ["STUDENT", "GRADUATE", "COLLEGE_STUDENT"] },
  { href: "/careers", label: "Career Matches", icon: LineChart, personas: ["STUDENT", "COLLEGE_STUDENT", "GRADUATE", "PROFESSIONAL", "CAREER_SWITCHER"] },
  { href: "/roadmap", label: "Career GPS", icon: Route, personas: ["STUDENT", "COLLEGE_STUDENT", "GRADUATE", "PROFESSIONAL", "CAREER_SWITCHER"] },
  { href: "/vault", label: "Career Vault", icon: FolderOpen, personas: ["STUDENT", "COLLEGE_STUDENT", "GRADUATE", "PROFESSIONAL", "CAREER_SWITCHER"] },
  { href: "/mentor", label: "AI Mentor", icon: Sparkles, personas: ["STUDENT", "PARENT", "COLLEGE_STUDENT", "GRADUATE", "PROFESSIONAL", "CAREER_SWITCHER"] },
  { href: "/skills", label: "Skills", icon: Award, personas: ["STUDENT", "COLLEGE_STUDENT", "GRADUATE", "PROFESSIONAL", "CAREER_SWITCHER"] },
  { href: "/colleges", label: "Colleges", icon: Building2, personas: ["STUDENT", "PARENT", "COLLEGE_STUDENT", "GRADUATE"] },
  { href: "/degrees", label: "Degrees", icon: GraduationCap, personas: ["STUDENT", "PARENT", "COLLEGE_STUDENT"] },
  { href: "/reports", label: "Reports", icon: FileText, personas: ["STUDENT", "PARENT", "GRADUATE", "PROFESSIONAL"] },
  { href: "/simulator", label: "Future Simulator", icon: Rocket, personas: ["STUDENT", "PARENT", "COLLEGE_STUDENT", "GRADUATE", "PROFESSIONAL", "CAREER_SWITCHER"] },
  { href: "/certifications", label: "Certifications", icon: BookOpen, personas: ["COLLEGE_STUDENT", "GRADUATE", "PROFESSIONAL", "CAREER_SWITCHER"] },
  { href: "/saved", label: "Saved Items", icon: BarChart3, personas: ["STUDENT", "PARENT", "COLLEGE_STUDENT", "GRADUATE", "PROFESSIONAL", "CAREER_SWITCHER"] },
  { href: "/parents", label: "Parent Dashboard", icon: Users, personas: ["PARENT"] },
];

const bottomLinks = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help", icon: HelpCircle },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const persona = (session?.user as any)?.primaryPersona ?? "STUDENT";

  const filteredLinks = useMemo(
    () => allLinks.filter((link) => link.personas.includes(persona)),
    [persona],
  );

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? "Close sidebar" : "Open sidebar"}
      >
        <Menu className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-full flex-col border-r border-border bg-card transition-all duration-300",
          collapsed ? "w-16" : "w-72",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          {!collapsed && (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-lg font-bold"
            >
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="gradient-text">Career OS</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent"
          >
            <ChevronLeft
              className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
            />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-hide">
          {filteredLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent",
                )}
                title={collapsed ? link.label : undefined}
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3 space-y-1">
          {bottomLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
                title={collapsed ? link.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            );
          })}

          <div className="flex items-center gap-2 px-3 py-2">
            <ThemeToggle />
          </div>

          {session?.user && (
            <div className="flex items-center gap-3 rounded-lg px-3 py-2">
              <Avatar className="h-8 w-8">
                {session.user.image && (
                  <AvatarImage src={session.user.image} alt={session.user.name ?? ""} />
                )}
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session.user.email}
                  </p>
                </div>
              )}
              <button
                onClick={() => signOut()}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
