// Career Intelligence Graph — internal knowledge graph for entity relationships

export interface GraphNode {
  id: string;
  type: GraphEntityType;
  label: string;
  metadata: Record<string, unknown>;
}

export interface GraphEdge {
  sourceId: string;
  sourceType: GraphEntityType;
  targetId: string;
  targetType: GraphEntityType;
  relation: RelationType;
  weight: number;
}

export type GraphEntityType =
  | "USER" | "CAREER" | "DEGREE" | "COLLEGE" | "SKILL"
  | "CERTIFICATION" | "SCHOLARSHIP" | "INDUSTRY" | "COMPANY"
  | "INTEREST" | "PERSONALITY_TRAIT" | "GEOGRAPHY";

export type RelationType =
  | "INTERESTED_IN" | "MATCHES" | "REQUIRES" | "RECOMMENDS"
  | "LEADS_TO" | "LOCATED_IN" | "PART_OF" | "ALTERNATIVE_TO"
  | "SIMILAR_TO" | "HIGHER_SALARY" | "LOWER_AI_RISK"
  | "HIGHER_DEMAND" | "BETTER_ROI" | "USER_SAVED"
  | "USER_VIEWED" | "USER_COMPLETED";

const graphCache = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL = 5 * 60_000;

export function getCached<T>(key: string): T | null {
  const cached = graphCache.get(key);
  if (cached && Date.now() < cached.expiresAt) return cached.data as T;
  return null;
}

export function setCache(key: string, data: unknown): void {
  graphCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL });
}

export function invalidateCache(pattern?: string): void {
  if (!pattern) { graphCache.clear(); return; }
  for (const key of graphCache.keys()) {
    if (key.includes(pattern)) graphCache.delete(key);
  }
}

export function generateNodeId(type: GraphEntityType, externalId: string): string {
  return `${type}:${externalId}`;
}

export function parseNodeId(nodeId: string): { type: GraphEntityType; id: string } {
  const colonIndex = nodeId.indexOf(":");
  return { type: nodeId.slice(0, colonIndex) as GraphEntityType, id: nodeId.slice(colonIndex + 1) };
}
