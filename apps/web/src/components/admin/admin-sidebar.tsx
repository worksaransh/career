"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  GraduationCap,
  Building2,
  CreditCard,
  ArrowLeft,
  Sparkles,
  Award,
  BookOpen,
  Image,
  FolderLock,
  Compass,
  Megaphone,
  Sliders,
  Settings,
  Flame,
  Smartphone,
} from "lucide-react";

interface AdminSidebarProps {
  role: string;
}

const ALL_NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER", "ANALYST", "FINANCE", "SUPPORT_AGENT"] },
  { href: "/admin/screens", label: "Mockup Simulator", icon: Smartphone, roles: ["SUPER_ADMIN", "ADMIN"] },
  { href: "/admin/users", label: "Users & RBAC", icon: Users, roles: ["SUPER_ADMIN", "ADMIN", "SUPPORT_AGENT"] },
  { href: "/admin/content", label: "CMS & Landing Pages", icon: FileText, roles: ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"] },
  { href: "/admin/careers", label: "Careers Catalog", icon: Briefcase, roles: ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER", "ANALYST"] },
  { href: "/admin/degrees", label: "Degrees Catalog", icon: GraduationCap, roles: ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER", "ANALYST"] },
  { href: "/admin/colleges", label: "Colleges Catalog", icon: Building2, roles: ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER", "ANALYST"] },
  { href: "/admin/skills", label: "Skills Catalog", icon: Compass, roles: ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER", "ANALYST"] },
  { href: "/admin/certifications", label: "Certifications Catalog", icon: Award, roles: ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER", "ANALYST"] },
  { href: "/admin/blog", label: "Blog CMS", icon: BookOpen, roles: ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"] },
  { href: "/admin/media", label: "Media Library", icon: Image, roles: ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"] },
  { href: "/admin/assessments", label: "Assessment Builder", icon: Sliders, roles: ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"] },
  { href: "/admin/prompts", label: "AI Prompt Config", icon: FolderLock, roles: ["SUPER_ADMIN", "ADMIN"] },
  { href: "/admin/campaigns", label: "Notifications Campaign", icon: Megaphone, roles: ["SUPER_ADMIN", "ADMIN"] },
  { href: "/admin/payments", label: "Payments & Pricing", icon: CreditCard, roles: ["SUPER_ADMIN", "ADMIN", "FINANCE"] },
  { href: "/admin/settings/engagement", label: "Engagement Config", icon: Flame, roles: ["SUPER_ADMIN"] },
  { href: "/admin/settings", label: "System Settings", icon: Settings, roles: ["SUPER_ADMIN"] },
];

export function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname();

  // Filter menu items by user role
  const visibleItems = ALL_NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside className="fixed left-0 top-0 z-40 h-full w-64 border-r border-border bg-card hidden lg:block shadow-md">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold gradient-text">Enterprise Admin</span>
        </div>

        {/* Scrollable Nav list */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200",
                  active
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer info and back actions */}
        <div className="border-t border-border p-4 space-y-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-xl px-4 py-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Application
          </Link>
          <div className="px-4 text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-accent/30 py-1.5 rounded-lg border border-border/40">
            Role: <span className="text-primary font-extrabold">{role.replace("_", " ")}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
