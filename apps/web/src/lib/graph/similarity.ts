// Entity similarity engine using Jaccard similarity and weighted feature vectors

export type FeatureVector = Record<string, number>;

export function cosineSimilarity(a: FeatureVector, b: FeatureVector): number {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const key of keys) {
    const valA = a[key] ?? 0;
    const valB = b[key] ?? 0;
    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

export function jaccardSimilarity<T>(setA: T[], setB: T[]): number {
  const intersection = setA.filter((x) => setB.includes(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

export function weightedJaccardSimilarity(
  setA: { item: string; weight: number }[],
  setB: { item: string; weight: number }[],
): number {
  const mapA = new Map(setA.map((s) => [s.item, s.weight]));
  const mapB = new Map(setB.map((s) => [s.item, s.weight]));
  const allItems = new Set([...mapA.keys(), ...mapB.keys()]);

  let intersection = 0;
  let union = 0;

  for (const item of allItems) {
    const wA = mapA.get(item) ?? 0;
    const wB = mapB.get(item) ?? 0;
    intersection += Math.min(wA, wB);
    union += Math.max(wA, wB);
  }

  return union === 0 ? 0 : intersection / union;
}

export function skillSimilarity(skillsA: string[], skillsB: string[]): number {
  return jaccardSimilarity(skillsA, skillsB);
}

export function interestSimilarity(
  interestsA: string[],
  interestsB: string[],
): number {
  return jaccardSimilarity(interestsA, interestsB);
}

export function careerFeatureVector(career: {
  skills: string[];
  salaryMid: number;
  growthRate: number;
  aiRiskScore: number;
  demandLevel: string;
}): FeatureVector {
  const vec: FeatureVector = {};
  for (const skill of career.skills) vec[`skill:${skill.toLowerCase()}`] = 1;
  vec["salary_normalized"] = Math.log10(career.salaryMid + 1) / 7;
  vec["growth_rate"] = Math.max(0, Math.min(1, (career.growthRate + 100) / 200));
  vec["ai_risk"] = career.aiRiskScore;
  vec["demand"] = career.demandLevel === "HIGH" ? 1 : career.demandLevel === "MEDIUM" ? 0.5 : 0;
  return vec;
}

export function findSimilarEntities<T extends { id: string; similarity: (other: T) => number }>(
  target: T,
  candidates: T[],
  threshold = 0.3,
  maxResults = 10,
): { entity: T; score: number }[] {
  return candidates
    .filter((c) => c.id !== target.id)
    .map((c) => ({ entity: c, score: target.similarity(c) }))
    .filter((r) => r.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}
