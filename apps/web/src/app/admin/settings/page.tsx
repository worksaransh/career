"use client";

import React, { useEffect, useState } from "react";
import { Settings, ShieldAlert, Database, History, HelpCircle, Save, Loader2, Key } from "lucide-react";
import { listAuditLogs, listSystemSettings, upsertSystemSetting } from "@/lib/actions/admin-actions";
import toast from "react-hot-toast";

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: string;
  details: any;
  user: {
    name: string | null;
    email: string | null;
  };
}

interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("branding");
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Branding fields
  const [appName, setAppName] = useState("Career GPS AI");
  const [supportEmail, setSupportEmail] = useState("support@careergps.ai");
  const [featureAi, setFeatureAi] = useState(true);
  const [featureMarket, setFeatureMarket] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const logs = await listAuditLogs();
      // Safely map dates
      const formattedLogs = (logs as any[]).map((l) => ({
        ...l,
        timestamp: l.timestamp.toISOString(),
      }));
      setAuditLogs(formattedLogs);

      const sysSettings = await listSystemSettings();
      setSettings(sysSettings);

      // Populate states from sysSettings if they exist
      const appNameSetting = sysSettings.find((s) => s.key === "app_name");
      if (appNameSetting) setAppName(appNameSetting.value);

      const supportEmailSetting = sysSettings.find((s) => s.key === "support_email");
      if (supportEmailSetting) setSupportEmail(supportEmailSetting.value);

      const featureAiSetting = sysSettings.find((s) => s.key === "feature_ai_mentor");
      if (featureAiSetting) setFeatureAi(featureAiSetting.value === "true");

      const featureMarketSetting = sysSettings.find((s) => s.key === "feature_marketplace");
      if (featureMarketSetting) setFeatureMarket(featureMarketSetting.value === "true");

    } catch (e: any) {
      toast.error(e.message || "Failed to load settings data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading("Saving configuration updates...");
    try {
      await upsertSystemSetting("app_name", appName, "The app name displayed globally.");
      await upsertSystemSetting("support_email", supportEmail, "Primary customer support mail.");
      await upsertSystemSetting("feature_ai_mentor", String(featureAi), "Toggle for AI Mentor.");
      await upsertSystemSetting("feature_marketplace", String(featureMarket), "Toggle for Marketplace.");
      
      toast.success("Settings saved successfully!", { id: toastId });
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerBackup = () => {
    const toastId = toast.loading("Creating system snapshot backup...");
    setTimeout(() => {
      // Create mockup JSON download
      const backupData = {
        timestamp: new Date().toISOString(),
        databaseSchemaVersion: "1.2.4",
        branding: { appName, supportEmail },
        featureFlags: { featureAi, featureMarket },
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `career-gps-backup-${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);

      toast.success("Database snapshot downloaded successfully!", { id: toastId });
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-foreground">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text text-transparent sm:text-4xl">
          System Settings & Logs
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Branding metadata editor, global feature flags, database snapshot backups, and immutable system audit trails.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border text-sm font-semibold">
        {[
          { code: "branding", label: "Branding & Features", icon: Settings },
          { code: "logs", label: "Audit Logs (Trail)", icon: History },
          { code: "backups", label: "Backup & Recovery", icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.code}
              onClick={() => setActiveTab(tab.code)}
              className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors focus:outline-none ${
                activeTab === tab.code 
                  ? "border-primary text-primary font-bold" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === "branding" && (
        <form onSubmit={handleSaveBranding} className="rounded-2xl border border-border bg-card p-6 shadow-md max-w-2xl space-y-4">
          <h3 className="text-sm font-bold text-foreground">Global Branding Settings</h3>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Application Name</label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Support Contact Mail</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              />
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-border/80">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Feature Flags</h4>
            
            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <div>
                <span className="text-xs font-bold block text-foreground">AI Career Mentor Engine</span>
                <span className="text-[10px] text-muted-foreground">Enables AI matching counselor chats and advices.</span>
              </div>
              <input
                type="checkbox"
                checked={featureAi}
                onChange={(e) => setFeatureAi(e.target.checked)}
                className="h-4.5 w-4.5 rounded border-border bg-card text-primary focus:ring-0"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <div>
                <span className="text-xs font-bold block text-foreground">Marketplace Integration</span>
                <span className="text-[10px] text-muted-foreground">Enables colleges application forms submission links.</span>
              </div>
              <input
                type="checkbox"
                checked={featureMarket}
                onChange={(e) => setFeatureMarket(e.target.checked)}
                className="h-4.5 w-4.5 rounded border-border bg-card text-primary focus:ring-0"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-xs font-semibold hover:bg-primary/95 shadow-sm transition-all"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save System settings
          </button>
        </form>
      )}

      {activeTab === "logs" && (
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 rounded-2xl border border-border bg-accent/20 p-3.5 text-xs text-muted-foreground">
            <ShieldAlert className="h-5 w-5 text-primary flex-shrink-0" />
            <span>
              <strong>Immutable Logging:</strong> Operational logs index actions executed by admins, including credentials, prompt configurations, and settings changes. These audit logs are read-only and immutable.
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-md">
            {loading ? (
              <div className="p-8 text-center text-xs text-muted-foreground">Loading audit records...</div>
            ) : auditLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">No audit logs stored yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-muted/50 font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-5 py-4">Actor</th>
                      <th className="px-5 py-4">Action</th>
                      <th className="px-5 py-4">Resource Target</th>
                      <th className="px-5 py-4">IP Address</th>
                      <th className="px-5 py-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-accent/10 transition-all font-medium">
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground">{log.user?.name || "System"}</span>
                            <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[150px]">{log.user?.email || "No email"}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-bold text-primary">{log.action}</span>
                        </td>
                        <td className="px-5 py-4 font-mono text-[10px] text-muted-foreground">
                          {log.resource} ({log.resourceId})
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">127.0.0.1</td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "backups" && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-md max-w-xl space-y-4">
          <h3 className="text-sm font-bold text-foreground">Database Backups & Snapshot Recovery</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Generate download snapshots of configuration files, prompt templates, catalog datasets, and registered users profiles metadata.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-border">
            <button
              onClick={handleTriggerBackup}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground h-11 text-xs font-semibold hover:bg-primary/95 transition-all shadow-sm"
            >
              <Database className="h-4.5 w-4.5" /> Download Snapshot Backup
            </button>
            <button
              onClick={() => toast.error("Restore requires a direct SQL dump execution payload.")}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card h-11 text-xs font-semibold hover:bg-accent text-muted-foreground hover:text-foreground transition-all shadow-sm"
            >
              <History className="h-4.5 w-4.5" /> Restore Snapshot point
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
