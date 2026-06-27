"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ConsentManager } from "./consent-manager";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [showManager, setShowManager] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("career-os-cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  const acceptAll = () => {
    localStorage.setItem("career-os-cookie-consent", "all");
    fetch("/api/privacy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update-consent", type: "cookieConsent", granted: true }),
    });
    setVisible(false);
  };

  const acceptNecessary = () => {
    localStorage.setItem("career-os-cookie-consent", "necessary");
    fetch("/api/privacy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update-consent", type: "cookieConsent", granted: false }),
    });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      {showManager ? (
        <div className="mx-auto max-w-4xl p-4">
          <ConsentManager />
          <Button variant="ghost" className="mt-2" onClick={() => setShowManager(false)}>
            Close
          </Button>
        </div>
      ) : (
        <div className="mx-auto flex max-w-7xl flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            We use cookies to improve your experience. By continuing, you agree to our use of cookies.
          </p>
          <div className="flex shrink-0 gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowManager(true)}>
              Manage
            </Button>
            <Button variant="outline" size="sm" onClick={acceptNecessary}>
              Necessary Only
            </Button>
            <Button size="sm" onClick={acceptAll}>
              Accept All
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}
