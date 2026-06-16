"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download } from "lucide-react";

import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const dismissed = localStorage.getItem("pwa-prompt-dismissed");
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 30000);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setIsDismissed(true);
    localStorage.setItem("pwa-prompt-dismissed", "true");
  };

  return (
    <AnimatePresence>
      {showPrompt && !isDismissed && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm sm:left-auto sm:right-4"
        >
          <div className="glass-strong rounded-2xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Download className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Install Career OS</p>
                  <p className="text-xs text-muted-foreground">
                    Get the best experience with our app
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Dismiss install prompt"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="gradient"
                size="sm"
                fullWidth
                onClick={handleInstall}
              >
                Install
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
              >
                Not now
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
