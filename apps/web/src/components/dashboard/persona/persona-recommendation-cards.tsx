"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Award, BookOpen, TrendingUp, Target, Users, GraduationCap, Briefcase, ArrowRight, Route } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface RecommendationCard {
  key: string;
  title: string;
  description: string;
  linkUrl: string;
  ctaText: string;
  icon: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles, Award, BookOpen, TrendingUp, Target, Users, GraduationCap, Briefcase, Route,
};

const FALLBACKS: Record<string, RecommendationCard[]> = {
  STUDENT: [
    { key: "student-scholarship", title: "Scholarship Opportunity", description: "Find scholarships matching your profile and academic achievements.", linkUrl: "/colleges", ctaText: "Browse Scholarships", icon: "Award" },
    { key: "student-featured-career", title: "Featured Career", description: "Explore high-growth careers aligned with your interests.", linkUrl: "/careers", ctaText: "Explore Careers", icon: "Target" },
    { key: "student-new-skill", title: "New Skill to Learn", description: "Discover skills that will boost your career prospects.", linkUrl: "/skills", ctaText: "View Skills", icon: "BookOpen" },
  ],
  PARENT: [
    { key: "parent-roi", title: "Education ROI Insight", description: "See the estimated return on investment for different education paths.", linkUrl: "/parents", ctaText: "View ROI", icon: "TrendingUp" },
    { key: "parent-scholarship", title: "Scholarship Alert", description: "New scholarships and financial aid opportunities available.", linkUrl: "/parents", ctaText: "View Alerts", icon: "Award" },
  ],
  PROFESSIONAL: [
    { key: "professional-cert", title: "Certification Suggestion", description: "Recommended certifications to advance your career.", linkUrl: "/certifications", ctaText: "View Certs", icon: "Briefcase" },
    { key: "professional-salary", title: "Salary Growth Opportunity", description: "See how upskilling can increase your earning potential.", linkUrl: "/careers", ctaText: "Check Salary", icon: "TrendingUp" },
  ],
  CAREER_SWITCHER: [
    { key: "switcher-roadmap", title: "Transition Roadmap", description: "Step-by-step plan to move into your target career.", linkUrl: "/roadmap", ctaText: "View Plan", icon: "Route" },
    { key: "switcher-skills", title: "Skill Gap Analysis", description: "Identify the skills you need for your target role.", linkUrl: "/skills", ctaText: "Analyze Skills", icon: "Target" },
  ],
  COLLEGE_STUDENT: [
    { key: "college-internship", title: "Internship Finder", description: "Find internships that match your skills and career goals.", linkUrl: "/skills", ctaText: "Find Internships", icon: "Briefcase" },
    { key: "college-portfolio", title: "Build Your Portfolio", description: "Create a standout portfolio to impress recruiters.", linkUrl: "/vault", ctaText: "Start Building", icon: "Sparkles" },
  ],
  GRADUATE: [
    { key: "graduate-jobs", title: "Job Readiness Check", description: "Assess how prepared you are for the job market.", linkUrl: "/vault", ctaText: "Check Readiness", icon: "Target" },
    { key: "graduate-cert", title: "Get Certified", description: "Boost your resume with industry-recognized certifications.", linkUrl: "/certifications", ctaText: "View Certs", icon: "Award" },
  ],
};

interface Props {
  persona: string;
}

export function PersonaRecommendationCards({ persona }: Props) {
  const [cards, setCards] = useState<RecommendationCard[]>([]);

  useEffect(() => {
    const fallback = (FALLBACKS[persona] ?? FALLBACKS.STUDENT) as RecommendationCard[];
    setCards(fallback);

    fetch(`/api/cms?section=recommendation_card&language=en`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const prefix = `${persona}.`;
          const matching = json.data
            .filter((c: any) => c.key.startsWith(prefix))
            .map((c: any) => {
              try {
                return { key: c.key, ...JSON.parse(c.value) } as RecommendationCard;
              } catch {
                return null;
              }
            })
            .filter((c: unknown): c is RecommendationCard => c !== null);
          if (matching.length > 0) setCards(matching);
        }
      })
      .catch(() => {});
  }, [persona]);

  if (cards.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Recommended for You</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((card) => {
          const Icon = ICON_MAP[card.icon] ?? Sparkles;
          return (
            <Link key={card.key} href={card.linkUrl}>
              <Card className="hover:border-primary/40 hover:shadow-sm transition-all group cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm group-hover:text-primary transition-colors">{card.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{card.description}</p>
                      <span className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-2">
                        {card.ctaText} <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
