"use client";

import React, { Suspense } from "react";
import { usePageViewTracking } from "@/hooks/use-analytics";

function PageViewTracker() {
  usePageViewTracking();
  return null;
}

export function AnalyticsWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      {children}
    </>
  );
}
