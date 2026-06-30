import { prisma } from "@/lib/db/prisma/prisma";

export interface SearchResult {
  id: string;
  type: "CAREER" | "COLLEGE" | "DEGREE" | "SKILL" | "USER" | "ARTICLE";
  title: string;
  subtitle: string;
  description: string;
  image?: string;
  url: string;
  relevanceScore: number;
  metadata: Record<string, unknown>;
}

export interface SearchResponse {
  results: SearchResult[];
  totalResults: number;
  query: string;
  facets: SearchFacet[];
  didYouMean?: string;
  searchTime: number;
}

export interface SearchFacet {
  name: string;
  counts: Record<string, number>;
}

export interface SearchOptions {
  query: string;
  types?: SearchResult["type"][];
  limit?: number;
  offset?: number;
  filters?: Record<string, string>;
  sortBy?: "RELEVANCE" | "RATING" | "DEMAND" | "SALARY";
}

function calculateRelevance(text: string, query: string): number {
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const words = q.split(" ").filter(Boolean);
  if (!words.length) return 0;
  let score = 0;
  if (lower === q) return 100;
  if (lower.startsWith(q)) score += 80;
  if (lower.includes(q)) score += 60;
  for (const word of words) { if (lower.includes(word)) score += 20; }
  return Math.min(100, score);
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) { matrix[i] = []; matrix[i]![0] = i; }
  for (let j = 0; j <= a.length; j++) matrix[0]![j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i]![j] = Math.min(
        matrix[i - 1]![j]! + 1,
        matrix[i]![j - 1]! + 1,
        matrix[i - 1]![j - 1]! + cost,
      );
    }
  }
  return matrix[b.length]![a.length]!;
}

export async function universalSearch(options: SearchOptions): Promise<SearchResponse> {
  const startTime = Date.now();
  const { query, types, limit = 20, offset = 0, sortBy = "RELEVANCE" } = options;
  const results: SearchResult[] = [];
  const q = query.trim();
  if (!q || q.length < 2) {
    return { results: [], totalResults: 0, query, facets: [], searchTime: 0 };
  }

  const shouldInclude = (type: SearchResult["type"]) => !types || types.length === 0 || types.includes(type);
  const likeQuery = `%${q}%`;

  // Build dictionary for "Did you mean?"
  const allDictionary: string[] = [];

  if (shouldInclude("CAREER")) {
    const careers = await prisma.career.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { summary: { contains: q, mode: "insensitive" } },
          { requiredSkills: { has: q } },
        ],
      },
      select: { id: true, title: true, description: true, summary: true, demandLevel: true, salaryEntry: true },
      take: 50,
    });
    for (const career of careers) {
      allDictionary.push(career.title);
      let baseScore = calculateRelevance(career.title, q);
      if (sortBy === "DEMAND") baseScore += career.demandLevel === "HIGH" ? 30 : career.demandLevel === "MEDIUM" ? 10 : 0;
      if (sortBy === "SALARY") baseScore += career.salaryEntry / 100000;
      if (baseScore > 0) {
        results.push({
          id: `career_${career.id}`,
          type: "CAREER",
          title: career.title,
          subtitle: career.demandLevel === "HIGH" ? "High Demand" : career.demandLevel === "MEDIUM" ? "Moderate Demand" : "Niche",
          description: career.summary || career.description,
          url: `/explore/careers?q=${encodeURIComponent(career.title)}`,
          relevanceScore: baseScore,
          metadata: { demand: career.demandLevel, salary: career.salaryEntry },
        });
      }
    }
  }

  if (shouldInclude("COLLEGE")) {
    const colleges = await prisma.college.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { location: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, description: true, location: true, rating: true, ranking: true },
      take: 50,
    });
    for (const college of colleges) {
      allDictionary.push(college.name);
      let baseScore = calculateRelevance(college.name, q);
      if (sortBy === "RATING") baseScore += (college.rating ?? 0) * 20;
      if (baseScore > 0) {
        results.push({
          id: `college_${college.id}`,
          type: "COLLEGE",
          title: college.name,
          subtitle: college.location || "India",
          description: college.description || college.name,
          url: `/explore/colleges?q=${encodeURIComponent(college.name)}`,
          relevanceScore: baseScore,
          metadata: { rating: college.rating, ranking: college.ranking },
        });
      }
    }
  }

  if (shouldInclude("DEGREE")) {
    const degrees = await prisma.degree.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, description: true },
      take: 50,
    });
    for (const degree of degrees) {
      allDictionary.push(degree.name);
      const baseScore = calculateRelevance(degree.name, q);
      if (baseScore > 0) {
        results.push({
          id: `degree_${degree.id}`,
          type: "DEGREE",
          title: degree.name,
          subtitle: "Degree Program",
          description: degree.description || degree.name,
          url: `/explore/degrees?q=${encodeURIComponent(degree.name)}`,
          relevanceScore: baseScore,
          metadata: {},
        });
      }
    }
  }

  if (shouldInclude("SKILL")) {
    const skills = await prisma.skill.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, description: true, demand: true },
      take: 50,
    });
    for (const skill of skills) {
      allDictionary.push(skill.name);
      const baseScore = calculateRelevance(skill.name, q);
      if (baseScore > 0) {
        results.push({
          id: `skill_${skill.id}`,
          type: "SKILL",
          title: skill.name,
          subtitle: `Demand: ${skill.demand}`,
          description: skill.description || skill.name,
          url: `/explore/skills?q=${encodeURIComponent(skill.name)}`,
          relevanceScore: baseScore,
          metadata: { demand: skill.demand },
        });
      }
    }
  }

  if (shouldInclude("ARTICLE")) {
    const posts = await prisma.blogPost.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { excerpt: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { slug: true, title: true, excerpt: true, coverImage: true },
      take: 20,
    });
    for (const post of posts) {
      allDictionary.push(post.title);
      const baseScore = calculateRelevance(post.title, q);
      if (baseScore > 0) {
        results.push({
          id: `article_${post.slug}`,
          type: "ARTICLE",
          title: post.title,
          subtitle: "Article",
          description: post.excerpt || post.title,
          image: post.coverImage || undefined,
          url: `/blog/${post.slug}`,
          relevanceScore: baseScore,
          metadata: {},
        });
      }
    }
  }

  results.sort((a, b) => b.relevanceScore - a.relevanceScore);

  const facets: SearchFacet[] = [
    {
      name: "Type",
      counts: results.reduce((acc, r) => { acc[r.type] = (acc[r.type] ?? 0) + 1; return acc; }, {} as Record<string, number>),
    },
  ];

  const paginated = results.slice(offset, offset + limit);
  const searchTime = Date.now() - startTime;

  let didYouMean: string | undefined;
  if (paginated.length === 0) {
    const distances = allDictionary.map((word) => ({ word, distance: levenshtein(q.toLowerCase(), word.toLowerCase()) }));
    const closest = distances.filter((d) => d.distance <= 2 && d.distance > 0).sort((a, b) => a.distance - b.distance);
    didYouMean = closest[0]?.word;
  }

  return { results: paginated, totalResults: results.length, query, facets, didYouMean, searchTime };
}
