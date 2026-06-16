import { prisma } from "@/lib/db/prisma/prisma";

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  rolloutPercentage: number;
  description: string;
  updatedAt: Date;
}

const defaultFlags: Record<string, Omit<FeatureFlag, "updatedAt">> = {
  "scholarship-module": { key: "scholarship-module", enabled: true, rolloutPercentage: 100, description: "Enable scholarship explorer and matching" },
  "ai-simulator": { key: "ai-simulator", enabled: true, rolloutPercentage: 100, description: "Enable AI future simulator" },
  "referral-system": { key: "referral-system", enabled: false, rolloutPercentage: 0, description: "Enable referral and rewards" },
  "beta-ui": { key: "beta-ui", enabled: false, rolloutPercentage: 10, description: "Enable experimental UI components" },
  "career-intelligence-graph": { key: "career-intelligence-graph", enabled: true, rolloutPercentage: 100, description: "Enable knowledge graph recommendations" },
  "universal-search": { key: "universal-search", enabled: true, rolloutPercentage: 100, description: "Enable global search" },
  "weekly-digest": { key: "weekly-digest", enabled: true, rolloutPercentage: 100, description: "Enable weekly intelligence emails" },
  "comparison-engine": { key: "comparison-engine", enabled: true, rolloutPercentage: 100, description: "Enable universal comparison" },
  "recommendation-confidence": { key: "recommendation-confidence", enabled: true, rolloutPercentage: 100, description: "Show confidence scores on recommendations" },
  "ai-explainability": { key: "ai-explainability", enabled: true, rolloutPercentage: 100, description: "Show AI reasoning for recommendations" },
  "programmatic-seo": { key: "programmatic-seo", enabled: true, rolloutPercentage: 100, description: "Generate SEO pages automatically" },
  "editorial-workflow": { key: "editorial-workflow", enabled: false, rolloutPercentage: 0, description: "Multi-step content approval workflow" },
  "experimentation-platform": { key: "experimentation-platform", enabled: true, rolloutPercentage: 100, description: "A/B testing infrastructure" },
  "progressive-profiling": { key: "progressive-profiling", enabled: true, rolloutPercentage: 100, description: "Contextual data collection" },
};

const cache = new Map<string, { flag: FeatureFlag; expiresAt: number }>();
const CACHE_TTL = 60_000;

export async function getFeatureFlag(key: string): Promise<FeatureFlag> {
  const cached = cache.get(key);
  if (cached && Date.now() < cached.expiresAt) return cached.flag;

  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: `feature_flag_${key}` },
    });

    if (!setting) {
      const def = defaultFlags[key];
      if (def) return { ...def, updatedAt: new Date() };
      return { key, enabled: false, rolloutPercentage: 0, description: "", updatedAt: new Date() };
    }

    const parsed = JSON.parse(setting.value);
    const flag: FeatureFlag = {
      key,
      enabled: parsed.enabled ?? false,
      rolloutPercentage: parsed.rolloutPercentage ?? 0,
      description: parsed.description ?? setting.description ?? "",
      updatedAt: setting.updatedAt,
    };

    cache.set(key, { flag, expiresAt: Date.now() + CACHE_TTL });
    return flag;
  } catch {
    const def = defaultFlags[key];
    if (def) return { ...def, updatedAt: new Date() };
    return { key, enabled: false, rolloutPercentage: 0, description: "", updatedAt: new Date() };
  }
}

export async function isFeatureEnabled(key: string, userId?: string): Promise<boolean> {
  const flag = await getFeatureFlag(key);
  if (!flag.enabled) return false;
  if (flag.rolloutPercentage >= 100) return true;
  if (!userId) return false;
  const hash = simpleHash(`${userId}:${key}`);
  return hash % 100 < flag.rolloutPercentage;
}

export async function setFeatureFlag(key: string, data: Partial<Omit<FeatureFlag, "key" | "updatedAt">>): Promise<void> {
  const existing = await getFeatureFlag(key);
  const updated = { ...existing, ...data };
  await prisma.systemSetting.upsert({
    where: { key: `feature_flag_${key}` },
    update: { value: JSON.stringify({ enabled: updated.enabled, rolloutPercentage: updated.rolloutPercentage, description: updated.description }) },
    create: { key: `feature_flag_${key}`, value: JSON.stringify({ enabled: updated.enabled, rolloutPercentage: updated.rolloutPercentage, description: updated.description }), description: updated.description },
  });
  cache.delete(key);
}

export async function getAllFeatureFlags(): Promise<FeatureFlag[]> {
  const keys = Object.keys(defaultFlags);
  const results = await Promise.all(keys.map((k) => getFeatureFlag(k)));
  return results;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
