"use client";

import { useEffect, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { trackEvent, trackPageView } from "@/lib/analytics/tracker";
import type { EventName } from "@/lib/analytics/events";

export function usePageViewTracking(): void {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    trackPageView();
  }, [pathname, searchParams]);
}

export function useAnalytics() {
  const track = useCallback((event: EventName, properties?: Record<string, unknown>) => {
    trackEvent(event, properties);
  }, []);

  return { track };
}
