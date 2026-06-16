"use client";

import React, { useState, useEffect } from "react";
import { Shield, Download, Trash2, Eye } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";

interface ConsentState {
  cookieConsent: boolean;
  marketingConsent: boolean;
  aiPersonalizationConsent: boolean;
  parentConsent: boolean;
  activityHistory: boolean;
}

export function ConsentManager() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<ConsentState>({
    cookieConsent: false,
    marketingConsent: false,
    aiPersonalizationConsent: false,
    parentConsent: false,
    activityHistory: true,
  });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch("/api/privacy")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setSettings((prev) => ({ ...prev, ...data.data.settings }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleConsent = async (type: string, current: boolean) => {
    const newValue = !current;
    setSettings((prev) => ({ ...prev, [type]: newValue }));
    await fetch("/api/privacy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update-consent", type, granted: newValue }),
    });
    toast.success("Preference updated");
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/privacy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "export-data" }),
      });
      const data = await res.json();
      if (data.success) {
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "career-os-data-export.json";
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Data export downloaded");
      } else {
        toast.error("Export failed");
      }
    } catch {
      toast.error("Export failed");
    }
    setExporting(false);
  };

  const handleDeletion = async () => {
    const confirmed = window.confirm("Are you sure? This action cannot be undone. All your data will be deleted.");
    if (!confirmed) return;
    await fetch("/api/privacy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete-data" }),
    });
    toast.success("Deletion requested. You will be logged out.");
    setTimeout(() => (window.location.href = "/"), 3000);
  };

  if (loading) {
    return (
      <GlassCard className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </GlassCard>
    );
  }

  const toggles: { key: keyof ConsentState; label: string; desc: string }[] = [
    { key: "cookieConsent", label: "Cookie Consent", desc: "Allow essential and analytics cookies" },
    { key: "marketingConsent", label: "Marketing Emails", desc: "Receive updates about new features and offers" },
    { key: "aiPersonalizationConsent", label: "AI Personalization", desc: "Allow AI to use your data for personalized recommendations" },
    { key: "parentConsent", label: "Parent Consent", desc: "Parent/guardian consent for career guidance" },
    { key: "activityHistory", label: "Activity History", desc: "Track your browsing history for better recommendations" },
  ];

  return (
    <GlassCard>
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-6 w-6 text-primary" />
        <h2 className="text-lg font-semibold">Privacy & Consent Center</h2>
      </div>
      <div className="space-y-4">
        {toggles.map((t) => (
          <div key={t.key} className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium">{t.label}</p>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
            </div>
            <Switch checked={settings[t.key]} onCheckedChange={() => toggleConsent(t.key, settings[t.key])} />
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="outline" size="sm" onClick={handleExport} loading={exporting} leftIcon={<Download className="h-4 w-4" />}>
          Export My Data
        </Button>
        <Button variant="outline" size="sm" onClick={() => fetch("/api/privacy").then(r => r.json()).then(d => { if(d.success) toast.success(`${d.data.logs.length} consent records found`) })} leftIcon={<Eye className="h-4 w-4" />}>
          View Consent Logs
        </Button>
        <Button variant="destructive" size="sm" onClick={handleDeletion} leftIcon={<Trash2 className="h-4 w-4" />}>
          Delete My Data
        </Button>
      </div>
    </GlassCard>
  );
}
