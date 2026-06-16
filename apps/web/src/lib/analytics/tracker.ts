import type { EventName } from "./events";

let sessionId: string | null = null;

function getSessionId(): string {
  if (!sessionId) {
    sessionId = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
  return sessionId;
}

export function trackEvent(event: EventName, properties?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;

  const payload = {
    event,
    properties: { ...properties, url: window.location.href, path: window.location.pathname },
    sessionId: getSessionId(),
  };

  try {
    const endpoint = "/api/analytics/track";
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, JSON.stringify(payload));
    } else {
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    queueEvent(payload);
  }
}

const eventQueue: unknown[] = [];

function queueEvent(event: unknown): void {
  eventQueue.push(event);
  if (eventQueue.length >= 20) {
    flushQueue();
  }
}

function flushQueue(): void {
  if (eventQueue.length === 0) return;
  const batch = eventQueue.splice(0);
  try {
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batch }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

setInterval(flushQueue, 30_000);

export function trackPageView(): void {
  trackEvent("page_view", { title: document.title });
}

export function trackClick(label: string, category?: string): void {
  trackEvent("cta_click", { label, category });
}

export function trackSearch(term: string, resultsCount: number): void {
  trackEvent("search", { term, resultsCount });
}

export function trackSave(itemType: string, itemId: string): void {
  trackEvent("career_save", { itemType, itemId });
}

export function trackAssessment(action: "start" | "complete" | "question_answer", assessmentId: string): void {
  trackEvent(`assessment_${action}` as EventName, { assessmentId });
}

export function trackRecommendationFeedback(careerId: string, rating: number): void {
  trackEvent("recommendation_feedback", { careerId, rating });
}
