// Experimentation Platform — A/B testing for career content and recommendations

export interface Experiment {
  id: string;
  name: string;
  description: string;
  status: "DRAFT" | "RUNNING" | "PAUSED" | "COMPLETED" | "ARCHIVED";
  type: "A/B" | "MULTIVARIATE";
  variants: Variant[];
  targetMetric: Metric;
  startDate?: string;
  endDate?: string;
  minSampleSize: number;
}

export interface Variant {
  id: string;
  name: string;
  trafficPercent: number;
  config: Record<string, unknown>;
}

export interface Metric {
  name: string;
  type: "CLICK_RATE" | "CONVERSION" | "ENGAGEMENT" | "SATISFACTION" | "TIME_SPENT";
  target: number;
}

export interface ExperimentResult {
  experimentId: string;
  variantResults: VariantResult[];
  winner: string | null;
  confidence: number;
  significant: boolean;
  totalParticipants: number;
}

export interface VariantResult {
  variantId: string;
  variantName: string;
  participants: number;
  metricValue: number;
  improvement: number;
}

function generateId(): string {
  return `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createExperiment(
  name: string,
  description: string,
  variants: Omit<Variant, "id">[],
  targetMetric: Metric,
  type: "A/B" | "MULTIVARIATE" = "A/B",
): Experiment {
  const totalTraffic = variants.reduce((sum, v) => sum + v.trafficPercent, 0);
  if (Math.abs(totalTraffic - 100) > 0.01) {
    throw new Error("Variant traffic percentages must sum to 100");
  }

  return {
    id: generateId(),
    name,
    description,
    status: "DRAFT",
    type,
    variants: variants.map((v, i) => ({ id: `${generateId()}_v${i}`, ...v })),
    targetMetric,
    minSampleSize: 1000,
  };
}

export function getAssignedVariant(
  experiment: Experiment,
  userId: string,
): Variant {
  const hash = Array.from(userId).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const bucket = hash % 100;

  let cumulative = 0;
  for (const variant of experiment.variants) {
    cumulative += variant.trafficPercent;
    if (bucket < cumulative) return variant;
  }

  return experiment.variants[0]!;
}

export function analyzeExperiment(
  experiment: Experiment,
  variantData: VariantResult[],
): ExperimentResult {
  const totalParticipants = variantData.reduce((sum, v) => sum + v.participants, 0);

  if (totalParticipants < experiment.minSampleSize) {
    return {
      experimentId: experiment.id,
      variantResults: variantData,
      winner: null,
      confidence: 0,
      significant: false,
      totalParticipants,
    };
  }

  const control = variantData[0]!;
  const results = variantData.map((v) => ({
    ...v,
    improvement: control.metricValue > 0
      ? ((v.metricValue - control.metricValue) / control.metricValue) * 100
      : 0,
  }));

  const bestVariant = results.reduce((best, v) =>
    v.metricValue > best.metricValue ? v : best,
  );

  const improvement = bestVariant.variantId !== control.variantId
    ? Math.abs(bestVariant.improvement)
    : 0;

  const confidence = Math.min(99, 50 + improvement * 2 + (totalParticipants / 1000) * 10);
  const significant = confidence >= 95 && totalParticipants >= experiment.minSampleSize;

  return {
    experimentId: experiment.id,
    variantResults: results,
    winner: significant ? bestVariant.variantId : null,
    confidence: Math.round(confidence),
    significant,
    totalParticipants,
  };
}
