// Universal Search — unified search across careers, colleges, degrees, skills, and users

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

const CAREERS_DB = [
  { title: "Software Engineer", subtitle: "Engineering", description: "Build and maintain software systems", demand: "HIGH", salary: 1800000, rating: 4.2 },
  { title: "Data Scientist", subtitle: "Data & Analytics", description: "Analyze data to drive decisions", demand: "HIGH", salary: 2200000, rating: 4.5 },
  { title: "Product Manager", subtitle: "Product", description: "Define product vision and strategy", demand: "HIGH", salary: 2500000, rating: 4.0 },
  { title: "UI/UX Designer", subtitle: "Design", description: "Design user interfaces and experiences", demand: "MEDIUM", salary: 1400000, rating: 4.4 },
  { title: "Management Consultant", subtitle: "Consulting", description: "Advise companies on strategy", demand: "MEDIUM", salary: 2000000, rating: 3.8 },
];

const COLLEGES_DB = [
  { title: "IIT Bombay", subtitle: "Mumbai", rating: 4.8 },
  { title: "IIT Delhi", subtitle: "Delhi", rating: 4.7 },
  { title: "IIT Madras", subtitle: "Chennai", rating: 4.6 },
  { title: "NIT Trichy", subtitle: "Trichy", rating: 4.3 },
  { title: "IIIT Hyderabad", subtitle: "Hyderabad", rating: 4.4 },
];

const DEGREES_DB = [
  "B.Tech Computer Science", "B.Tech Mechanical Engineering", "B.Tech Electrical Engineering",
  "BBA", "B.Com", "BA Economics", "BA Psychology", "BSc Data Science", "BCA", "LLB",
];

const SKILLS_DB = [
  "Python", "JavaScript", "React", "Node.js", "Data Analysis", "Machine Learning",
  "Communication", "Leadership", "Design Thinking", "Project Management",
];

function calculateRelevance(text: string, query: string): number {
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const words = q.split(" ").filter(Boolean);
  if (words.length === 0) return 0;

  let score = 0;
  if (lower === q) return 100;
  if (lower.startsWith(q)) score += 80;
  if (lower.includes(q)) score += 60;

  for (const word of words) {
    if (lower.includes(word)) score += 20;
  }

  return Math.min(100, score);
}

function findDidYouMean(query: string, dictionary: string[]): string | undefined {
  if (dictionary.some((d) => d.toLowerCase() === query.toLowerCase())) return undefined;

  const distances = dictionary.map((word) => ({
    word,
    distance: levenshtein(query.toLowerCase(), word.toLowerCase()),
  }));

  const closest = distances
    .filter((d) => d.distance <= 2 && d.distance > 0)
    .sort((a, b) => a.distance - b.distance);

  return closest[0]?.word;
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) { matrix[i] = []; matrix[i]![0] = i; }
  for (let j = 0; j <= a.length; j++) matrix[0]![j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i]![j] = Math.min(matrix[i - 1]![j]! + 1, matrix[i]![j - 1]! + 1, matrix[i - 1]![j - 1]! + cost);
    }
  }
  return matrix[b.length]![a.length]!;
}

export function universalSearch(options: SearchOptions): SearchResponse {
  const startTime = Date.now();
  const { query, types, limit = 20, offset = 0, sortBy = "RELEVANCE" } = options;
  const results: SearchResult[] = [];
  const q = query.trim().toLowerCase();

  if (!q || q.length < 2) {
    return { results: [], totalResults: 0, query, facets: [], searchTime: 0 };
  }

  const shouldInclude = (type: SearchResult["type"]) => !types || types.length === 0 || types.includes(type);

  const getScore = (career: typeof CAREERS_DB[number], base: number) =>
    base + (sortBy === "DEMAND" ? (career.demand === "HIGH" ? 30 : 0) : sortBy === "SALARY" ? career.salary / 100000 : 0);
  const allDictionary = [...CAREERS_DB.map((c) => c.title), ...COLLEGES_DB.map((c) => c.title), ...DEGREES_DB, ...SKILLS_DB];

  if (shouldInclude("CAREER")) {
    for (const career of CAREERS_DB) {
      const relevance = calculateRelevance(career.title, q);
      if (relevance > 0) {
        results.push({
          id: `career_${career.title.replace(/\s+/g, "-").toLowerCase()}`,
          type: "CAREER",
          title: career.title,
          subtitle: career.subtitle,
          description: career.description,
          url: `/explore?career=${encodeURIComponent(career.title)}`,
          relevanceScore: getScore(career, relevance),
          metadata: { demand: career.demand, salary: career.salary, rating: career.rating },
        });
      }
    }
  }

  if (shouldInclude("COLLEGE")) {
    for (const college of COLLEGES_DB) {
      const relevance = calculateRelevance(college.title, q);
      if (relevance > 0) {
        results.push({
          id: `college_${college.title.replace(/\s+/g, "-").toLowerCase()}`,
          type: "COLLEGE",
          title: college.title,
          subtitle: college.subtitle,
          description: `${college.title} — rated ${college.rating}/5`,
          url: `/explore?college=${encodeURIComponent(college.title)}`,
          relevanceScore: relevance + (sortBy === "RATING" ? (college.rating ?? 0) * 20 : 0),
          metadata: { rating: college.rating },
        });
      }
    }
  }

  if (shouldInclude("DEGREE")) {
    for (const degree of DEGREES_DB) {
      const relevance = calculateRelevance(degree, q);
      if (relevance > 0) {
        results.push({
          id: `degree_${degree.replace(/\s+/g, "-").toLowerCase()}`,
          type: "DEGREE",
          title: degree,
          subtitle: "Degree Program",
          description: `${degree} program overview`,
          url: `/explore?degree=${encodeURIComponent(degree)}`,
          relevanceScore: relevance,
          metadata: {},
        });
      }
    }
  }

  if (shouldInclude("SKILL")) {
    for (const skill of SKILLS_DB) {
      const relevance = calculateRelevance(skill, q);
      if (relevance > 0) {
        results.push({
          id: `skill_${skill.replace(/\s+/g, "-").toLowerCase()}`,
          type: "SKILL",
          title: skill,
          subtitle: "Skill",
          description: `Learn ${skill} for career growth`,
          url: `/explore?skill=${encodeURIComponent(skill)}`,
          relevanceScore: relevance,
          metadata: {},
        });
      }
    }
  }

  results.sort((a, b) => b.relevanceScore - a.relevanceScore);

  const facets: SearchFacet[] = [
    {
      name: "Type",
      counts: results.reduce(
        (acc, r) => {
          acc[r.type] = (acc[r.type] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    },
  ];

  const paginated = results.slice(offset, offset + limit);
  const searchTime = Date.now() - startTime;

  return {
    results: paginated,
    totalResults: results.length,
    query,
    facets,
    didYouMean: paginated.length === 0 ? findDidYouMean(q, allDictionary) : undefined,
    searchTime,
  };
}
