// Public Explorer Pages — SEO-optimized public landing pages for careers, colleges, degrees

import { generateCareerSEOPage } from "@/lib/seo";
import type { SEOPage } from "@/lib/seo";

import { prisma } from "@/lib/db/prisma/prisma";

export interface ExplorerPage {
  type: "CAREER" | "COLLEGE" | "DEGREE" | "SKILL";
  slug: string;
  seo: SEOPage;
  relatedItems: ExplorerRelatedItem[];
  stats: ExplorerStats;
  cta: ExplorerCTA;
  richItems?: any[];
}

export interface ExplorerRelatedItem {
  title: string;
  url: string;
  type: "CAREER" | "COLLEGE" | "DEGREE";
  relevance: number;
}

export interface ExplorerStats {
  totalCareers: number;
  totalColleges: number;
  totalDegrees: number;
  averageSalary: number;
  topDemandCareers: string[];
}

export interface ExplorerCTA {
  primary: { text: string; url: string };
  secondary: { text: string; url: string };
}

const EXPLORER_CAREERS = [
  "Software Engineer", "Data Scientist", "Product Manager", "UI/UX Designer", "Management Consultant",
  "DevOps Engineer", "Cloud Architect", "AI/ML Engineer", "Cybersecurity Analyst", "Blockchain Developer",
  "Digital Marketer", "Business Analyst", "Financial Analyst", "Data Analyst", "Full Stack Developer",
];

const EXPLORER_COLLEGES = [
  "IIT Bombay", "IIT Delhi", "IIT Madras", "IIT Kanpur", "IIT Kharagpur",
  "IIT Roorkee", "IIT Guwahati", "NIT Trichy", "NIT Surathkal", "IIIT Hyderabad",
  "DTU Delhi", "NSUT Delhi", "BITS Pilani", "VIT Vellore", "SRM Chennai",
];

const EXPLORER_DEGREES = [
  "B.Tech Computer Science", "B.Tech Mechanical", "B.Tech Electrical", "BBA", "B.Com",
  "BA Economics", "BA Psychology", "BSc Data Science", "BCA", "LLB",
  "MBBS", "B.Arch", "B.Des", "B.Pharm", "B.Sc Nursing",
];

const EXPLORER_SKILLS = [
  "Python", "JavaScript", "React", "Node.js", "TypeScript",
  "Data Analysis", "Machine Learning", "Cloud Computing", "DevOps", "UI/UX Design",
  "Communication", "Leadership", "Project Management", "SQL", "Digital Marketing",
];

const EXPLORER_MAP: Record<string, { type: ExplorerPage["type"]; items: string[] }> = {
  careers: { type: "CAREER", items: EXPLORER_CAREERS },
  colleges: { type: "COLLEGE", items: EXPLORER_COLLEGES },
  degrees: { type: "DEGREE", items: EXPLORER_DEGREES },
  skills: { type: "SKILL", items: EXPLORER_SKILLS },
};

export async function generateDynamicExplorerListingPage(
  type: ExplorerPage["type"],
  search: string = ""
): Promise<ExplorerPage> {
  const typeKey = type.toLowerCase() + "s";
  
  // 1. Fetch real-time totals
  const totalCareers = await prisma.career.count({ where: { isActive: true } });
  const totalColleges = await prisma.college.count({ where: { isActive: true } });
  const totalDegrees = await prisma.degree.count({ where: { isActive: true } });

  // 2. Fetch specific rich items dynamically from database
  let richItems: any[] = [];
  
  if (type === "COLLEGE") {
    const dbColleges = await prisma.college.findMany({
      where: {
        isActive: true,
        OR: search
          ? [
              { name: { contains: search, mode: "insensitive" } },
              { location: { contains: search, mode: "insensitive" } },
            ]
          : undefined,
      },
      orderBy: { ranking: "asc" },
      take: 100,
    });
    richItems = dbColleges.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      location: c.location,
      ranking: c.ranking,
      feesTotal: c.feesTotal,
      avgPackage: c.avgPackage,
      placementPercent: c.placementPercent,
    }));
  } else if (type === "CAREER") {
    const dbCareers = await prisma.career.findMany({
      where: {
        isActive: true,
        OR: search
          ? [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ]
          : undefined,
      },
      orderBy: { title: "asc" },
      take: 100,
    });
    richItems = dbCareers.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: c.description,
      salaryEntry: c.salaryEntry,
      salarySenior: c.salarySenior,
      futureGrowthRate: c.futureGrowthRate,
      aiRiskLevel: c.aiRiskLevel,
      demandLevel: c.demandLevel,
    }));
  } else if (type === "DEGREE") {
    const dbDegrees = await prisma.degree.findMany({
      where: {
        isActive: true,
        OR: search
          ? [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ]
          : undefined,
      },
      orderBy: { name: "asc" },
      take: 100,
    });
    richItems = dbDegrees.map((d) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      description: d.description,
      duration: d.duration,
      costTotal: d.costTotal,
      riskAdjustedScore: d.riskAdjustedScore,
      aiResilience: d.aiResilience,
    }));
  } else if (type === "SKILL") {
    const dbSkills = await prisma.skill.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { name: "asc" },
      take: 100,
    });
    richItems = dbSkills.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      difficulty: s.difficulty,
      demand: s.demand,
      description: s.description,
    }));
  }

  // 3. Map list items for SEO backwards compatibility
  const seoItems = richItems.map((item) => item.name ?? item.title);

  // Generate fallback related items
  const relatedItems: ExplorerRelatedItem[] = richItems.slice(0, 5).map((item) => ({
    title: item.name ?? item.title,
    url: `/${typeKey}/${item.slug ?? (item.name ?? item.title).toLowerCase().replace(/\s+/g, "-")}`,
    type: type === "SKILL" ? ("DEGREE" as const) : type,
    relevance: 90,
  }));

  const stats: ExplorerStats = {
    totalCareers,
    totalColleges,
    totalDegrees,
    averageSalary: 1800000,
    topDemandCareers: ["Software Engineer", "Data Scientist", "AI/ML Engineer"],
  };

  const cta: ExplorerCTA = {
    primary: { text: "Find Your Perfect Career", url: "/assessments" },
    secondary: { text: "Compare Options", url: "/comparisons" },
  };

  const pageTitle =
    type === "CAREER"
      ? "Explore Careers"
      : type === "COLLEGE"
        ? "Explore Colleges"
        : type === "DEGREE"
          ? "Explore Degrees"
          : "Explore Skills";

  const pageDesc =
    type === "CAREER"
      ? `Browse ${totalCareers} career paths in India. Compare salaries, growth rates, and find your perfect career match.`
      : type === "COLLEGE"
        ? `Explore ${totalColleges} top colleges in India. Compare rankings, placements, and fees.`
        : type === "DEGREE"
          ? `Discover ${totalDegrees} degree programs. Learn about scope, duration, and career prospects.`
          : `Master various in-demand skills. Find courses and career paths for each skill.`;

  const seo: SEOPage = {
    url: `/${typeKey}`,
    title: `${pageTitle} — Career GPS AI`,
    metaDescription: pageDesc,
    h1: pageTitle,
    contentSections: [
      { heading: pageTitle, body: pageDesc, type: "TEXT" },
      { heading: `Popular ${type}s`, body: "", type: "LIST", items: seoItems },
    ],
    faqSchema: [
      { question: `How many ${typeKey} are listed?`, answer: `We cover ${seoItems.length} ${typeKey}.` },
      { question: `How are ${typeKey} compared?`, answer: `Using salary, demand, ratings, and growth metrics.` },
    ],
    breadcrumbs: [
      { label: "Home", url: "/" },
      { label: pageTitle, url: `/${typeKey}` },
    ],
    canonical: `https://careergps.ai/${typeKey}`,
    ogImage: `https://careergps.ai/og/${typeKey}.png`,
  };

  return { type, slug: typeKey, seo, relatedItems, stats, cta, richItems };
}

export function generateExplorerListingPage(type: ExplorerPage["type"]): ExplorerPage {
  const typeKey = type.toLowerCase() + "s";
  const config = EXPLORER_MAP[typeKey]!;

  const items = config.items.map((title) => ({
    title,
    url: `/${typeKey}/${title.toLowerCase().replace(/\s+/g, "-")}`,
    type: type === "SKILL" ? ("DEGREE" as const) : type,
    relevance: 50,
  } as ExplorerRelatedItem));

  const stats: ExplorerStats = {
    totalCareers: EXPLORER_CAREERS.length,
    totalColleges: EXPLORER_COLLEGES.length,
    totalDegrees: EXPLORER_DEGREES.length,
    averageSalary: 1800000,
    topDemandCareers: ["Software Engineer", "Data Scientist", "AI/ML Engineer"],
  };

  const cta: ExplorerCTA = {
    primary: { text: "Find Your Perfect Career", url: "/assessments" },
    secondary: { text: "Compare Options", url: "/comparisons" },
  };

  const pageTitle =
    type === "CAREER"
      ? "Explore Careers"
      : type === "COLLEGE"
        ? "Explore Colleges"
        : type === "DEGREE"
          ? "Explore Degrees"
          : "Explore Skills";

  const pageDesc =
    type === "CAREER"
      ? `Browse ${EXPLORER_CAREERS.length} career paths in India.`
      : type === "COLLEGE"
        ? `Explore ${EXPLORER_COLLEGES.length} top colleges.`
        : type === "DEGREE"
          ? `Discover ${EXPLORER_DEGREES.length} degree programs.`
          : `Master ${EXPLORER_SKILLS.length} skills.`;

  const seo: SEOPage = {
    url: `/${typeKey}`,
    title: `${pageTitle} — Career GPS`,
    metaDescription: pageDesc,
    h1: pageTitle,
    contentSections: [
      { heading: pageTitle, body: pageDesc, type: "TEXT" },
      { heading: `Popular ${type}s`, body: "", type: "LIST", items: items.map((i) => i.title) },
    ],
    faqSchema: [],
    breadcrumbs: [],
    canonical: "",
    ogImage: "",
  };

  return { type, slug: typeKey, seo, relatedItems: items.slice(0, 5), stats, cta, richItems: [] };
}

export { EXPLORER_CAREERS, EXPLORER_COLLEGES, EXPLORER_DEGREES, EXPLORER_SKILLS, EXPLORER_MAP };
