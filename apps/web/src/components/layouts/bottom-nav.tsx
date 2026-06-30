"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LineChart, Route, Rocket, Users, Brain, Building2, Award, BookOpen, Briefcase, Bot, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils/cn";

type BottomNavItem = { href: string; label: string; icon: React.ElementType };

const mobileLinks: BottomNavItem[] = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/roadmap", label: "Career GPS", icon: Route },
  { href: "/mentor", label: "AI Chat", icon: Bot },
  { href: "/careers", label: "Explore", icon: LineChart },
  { href: "/profile", label: "Profile", icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();


  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/80 backdrop-blur-lg px-2 py-1 flex items-center justify-around shadow-2xl lg:hidden">
      {mobileLinks.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href || pathname.startsWith(link.href + "/");

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl text-[10px] font-bold transition-all duration-200 select-none",
              isActive
                ? "text-primary scale-105"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className={cn("h-5 w-5 transition-transform duration-200", isActive && "stroke-[2.5px] scale-110")} />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
