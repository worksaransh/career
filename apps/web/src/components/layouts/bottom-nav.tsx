"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LineChart, Route, Rocket, Users, Brain, Building2, Award, BookOpen, Briefcase } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils/cn";

type BottomNavItem = { href: string; label: string; icon: React.ElementType; personas: string[] };

const allMobileLinks: BottomNavItem[] = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard, personas: ["STUDENT", "PARENT", "COLLEGE_STUDENT", "GRADUATE", "PROFESSIONAL", "CAREER_SWITCHER"] },
  { href: "/careers", label: "Matches", icon: LineChart, personas: ["STUDENT", "COLLEGE_STUDENT", "GRADUATE", "PROFESSIONAL", "CAREER_SWITCHER"] },
  { href: "/assessments", label: "Assess", icon: Brain, personas: ["STUDENT", "GRADUATE"] },
  { href: "/roadmap", label: "GPS", icon: Route, personas: ["STUDENT", "COLLEGE_STUDENT", "GRADUATE", "PROFESSIONAL", "CAREER_SWITCHER"] },
  { href: "/colleges", label: "Colleges", icon: Building2, personas: ["STUDENT", "PARENT", "COLLEGE_STUDENT"] },
  { href: "/skills", label: "Skills", icon: Award, personas: ["STUDENT", "COLLEGE_STUDENT", "GRADUATE", "PROFESSIONAL", "CAREER_SWITCHER"] },
  { href: "/certifications", label: "Certs", icon: BookOpen, personas: ["COLLEGE_STUDENT", "GRADUATE", "PROFESSIONAL", "CAREER_SWITCHER"] },
  { href: "/simulator", label: "Simulator", icon: Rocket, personas: ["STUDENT", "PARENT", "COLLEGE_STUDENT", "GRADUATE", "PROFESSIONAL", "CAREER_SWITCHER"] },
  { href: "/parents", label: "Parents", icon: Users, personas: ["PARENT"] },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const persona = (session?.user as any)?.primaryPersona ?? "STUDENT";

  const mobileLinks = useMemo(
    () => allMobileLinks.filter((link) => link.personas.includes(persona)).slice(0, 5),
    [persona],
  );

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
