"use client";

import React, { useEffect, useState } from "react";
import { Settings, ShieldAlert, Database, History, HelpCircle, Save, Loader2, Key, BarChart3, Sliders, Zap } from "lucide-react";
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
  const [whatsappLink, setWhatsappLink] = useState("https://chat.whatsapp.com/mock-invite-gps");
  const [telegramLink, setTelegramLink] = useState("https://t.me/mock-invite-gps");
  const [featureAi, setFeatureAi] = useState(true);
  const [featureMarket, setFeatureMarket] = useState(false);
  const [saving, setSaving] = useState(false);

  // AI Provider Management
  const [aiProvider, setAiProvider] = useState("OpenRouter");
  const [aiModel, setAiModel] = useState("deepseek/deepseek-r1");
  const [aiFallback, setAiFallback] = useState("meta-llama/llama-3.3-70b-instruct");
  const [aiTemp, setAiTemp] = useState(0.7);
  const [aiMaxTokens, setAiMaxTokens] = useState(4096);
  const [aiRateLimit, setAiRateLimit] = useState(60);

  // Resume Parser Configuration
  const [parserOcrEnabled, setParserOcrEnabled] = useState(true);
  const [parserConfidence, setParserConfidence] = useState(75);
  const [parserMaxSize, setParserMaxSize] = useState(5);
  const [parserSupportedExtensions, setParserSupportedExtensions] = useState("pdf,docx,doc,txt,rtf,png,jpg,jpeg");
  const [parserPromptTemplate, setParserPromptTemplate] = useState("Extract candidate qualifications, experiences, and match skills cleanly...");

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

      const whatsappSetting = sysSettings.find((s) => s.key === "whatsapp_invite_link");
      if (whatsappSetting) setWhatsappLink(whatsappSetting.value);

      const telegramSetting = sysSettings.find((s) => s.key === "telegram_invite_link");
      if (telegramSetting) setTelegramLink(telegramSetting.value);

      // AI Provider settings load
      const prov = sysSettings.find((s) => s.key === "ai_provider");
      if (prov) setAiProvider(prov.value);
      const mod = sysSettings.find((s) => s.key === "ai_model");
      if (mod) setAiModel(mod.value);
      const fall = sysSettings.find((s) => s.key === "ai_fallback");
      if (fall) setAiFallback(fall.value);
      const temp = sysSettings.find((s) => s.key === "ai_temperature");
      if (temp) setAiTemp(parseFloat(temp.value));
      const maxT = sysSettings.find((s) => s.key === "ai_max_tokens");
      if (maxT) setAiMaxTokens(parseInt(maxT.value));
      const rateL = sysSettings.find((s) => s.key === "ai_rate_limit");
      if (rateL) setAiRateLimit(parseInt(rateL.value));

      // Resume Parser settings load
      const ocr = sysSettings.find((s) => s.key === "parser_ocr_enabled");
      if (ocr) setParserOcrEnabled(ocr.value === "true");
      const conf = sysSettings.find((s) => s.key === "parser_confidence_threshold");
      if (conf) setParserConfidence(parseInt(conf.value));
      const size = sysSettings.find((s) => s.key === "parser_max_size");
      if (size) setParserMaxSize(parseInt(size.value));
      const exts = sysSettings.find((s) => s.key === "parser_supported_extensions");
      if (exts) setParserSupportedExtensions(exts.value);
      const pPrompt = sysSettings.find((s) => s.key === "parser_prompt_template");
      if (pPrompt) setParserPromptTemplate(pPrompt.value);

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
      await upsertSystemSetting("whatsapp_invite_link", whatsappLink, "WhatsApp community invite link.");
      await upsertSystemSetting("telegram_invite_link", telegramLink, "Telegram community invite link.");
      
      toast.success("Settings saved successfully!", { id: toastId });
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAiProviders = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading("Saving AI Provider configurations...");
    try {
      await upsertSystemSetting("ai_provider", aiProvider, "Active AI provider config.");
      await upsertSystemSetting("ai_model", aiModel, "Active LLM model.");
      await upsertSystemSetting("ai_fallback", aiFallback, "Active fallback LLM model.");
      await upsertSystemSetting("ai_temperature", String(aiTemp), "LLM sampling temperature.");
      await upsertSystemSetting("ai_max_tokens", String(aiMaxTokens), "LLM response generation length.");
      await upsertSystemSetting("ai_rate_limit", String(aiRateLimit), "LLM requests rate limit per minute.");
      
      toast.success("AI Provider configuration saved successfully!", { id: toastId });
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save AI settings", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveParserSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading("Saving Resume Parser configurations...");
    try {
      await upsertSystemSetting("parser_ocr_enabled", String(parserOcrEnabled), "Enable OCR for resume images.");
      await upsertSystemSetting("parser_confidence_threshold", String(parserConfidence), "Minimum parsing confidence threshold.");
      await upsertSystemSetting("parser_max_size", String(parserMaxSize), "Maximum allowed file size in MB.");
      await upsertSystemSetting("parser_supported_extensions", parserSupportedExtensions, "Allowed file upload extensions.");
      await upsertSystemSetting("parser_prompt_template", parserPromptTemplate, "Prompt template for LLM parsing.");
      
      toast.success("Resume Parser configuration saved successfully!", { id: toastId });
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save parser settings", { id: toastId });
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
          { code: "ai", label: "AI Providers Manager", icon: Key },
          { code: "parser", label: "Resume Parser Rules", icon: Sliders },
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

          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">WhatsApp Invite Link</label>
              <input
                type="text"
                value={whatsappLink}
                onChange={(e) => setWhatsappLink(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Telegram Invite Link</label>
              <input
                type="text"
                value={telegramLink}
                onChange={(e) => setTelegramLink(e.target.value)}
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

      {activeTab === "ai" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* AI Providers Config Form */}
          <form onSubmit={handleSaveAiProviders} className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-md space-y-4">
            <div className="flex items-center gap-2 border-b border-border/40 pb-3 mb-2">
              <Sliders className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-bold text-foreground">AI Orchestration Settings</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Primary LLM Provider</label>
                <select
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground font-semibold"
                >
                  <option value="OpenRouter">OpenRouter (Recommended)</option>
                  <option value="Groq">Groq (Ultra Fast)</option>
                  <option value="Claude">Anthropic Claude</option>
                  <option value="Gemini">Google Gemini Pro</option>
                  <option value="DeepSeek">DeepSeek API</option>
                  <option value="Llama">Meta Llama (Self-Hosted)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Active Inference Model</label>
                <input
                  type="text"
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground font-mono"
                  placeholder="e.g. deepseek/deepseek-r1"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Fallback Model</label>
                <input
                  type="text"
                  value={aiFallback}
                  onChange={(e) => setAiFallback(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground font-mono"
                  placeholder="e.g. meta-llama/llama-3.3-70b-instruct"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Rate Limit (req/min)</label>
                <input
                  type="number"
                  value={aiRateLimit}
                  onChange={(e) => setAiRateLimit(parseInt(e.target.value))}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Temperature (0.0 - 1.0)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={aiTemp}
                  onChange={(e) => setAiTemp(parseFloat(e.target.value))}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Max Token Limit</label>
                <input
                  type="number"
                  value={aiMaxTokens}
                  onChange={(e) => setAiMaxTokens(parseInt(e.target.value))}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Base System Prompt Template</label>
              <textarea
                rows={4}
                className="w-full rounded-xl border border-border bg-background p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground leading-relaxed font-mono"
                defaultValue={`You are the Career GPS AI operating system. Retrieve context from user interests and resume memory...`}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-xs font-semibold hover:bg-primary/95 shadow-sm transition-all"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save AI Settings
            </button>
          </form>

          {/* AI Token Cost Analytics */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-md space-y-5">
            <div className="flex items-center gap-2 border-b border-border/40 pb-3">
              <BarChart3 className="h-5 w-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-foreground">Token Cost & Usage Analytics</h3>
            </div>

            <div className="grid gap-3 grid-cols-2">
              <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/15">
                <span className="text-[9px] uppercase font-bold text-muted-foreground block mb-0.5">Total Tokens (MTD)</span>
                <span className="text-lg font-black text-white">42.8M</span>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                <span className="text-[9px] uppercase font-bold text-muted-foreground block mb-0.5">Estimated Cost</span>
                <span className="text-lg font-black text-emerald-400">₹8,450.40</span>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Token Distribution by Provider</span>
              
              <div className="space-y-2">
                {[
                  { label: "OpenRouter (DeepSeek)", pct: 60, cost: "₹5,070" },
                  { label: "Groq (Llama-3)", pct: 25, cost: "₹2,112" },
                  { label: "Gemini / Claude Pro", pct: 15, cost: "₹1,268" },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground truncate max-w-[130px]">{item.label}</span>
                      <span className="text-foreground">{item.cost} ({item.pct}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-accent/40 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 flex items-start gap-2 text-[11px] leading-normal text-muted-foreground">
              <Zap className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
              <span>
                Fallback orchestration is enabled. If rate limit hits on OpenRouter, traffic redirects to Groq endpoint automatically.
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "parser" && (
        <form onSubmit={handleSaveParserSettings} className="rounded-2xl border border-border bg-card p-6 shadow-md max-w-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-border/40 pb-3 mb-2">
            <Sliders className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Resume Parser Rules & Configuration</h3>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-border/40">
            <div>
              <span className="text-xs font-bold block text-foreground">Activate OCR Parsing Engine</span>
              <span className="text-[10px] text-muted-foreground">Extracts raw text data from image-based portfolios and scanned JPG/PNG resumes.</span>
            </div>
            <input
              type="checkbox"
              checked={parserOcrEnabled}
              onChange={(e) => setParserOcrEnabled(e.target.checked)}
              className="h-4.5 w-4.5 rounded border-border bg-card text-primary focus:ring-0"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Confidence Threshold (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={parserConfidence}
                onChange={(e) => setParserConfidence(parseInt(e.target.value))}
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Maximum File Size (MB)</label>
              <input
                type="number"
                min="1"
                max="20"
                value={parserMaxSize}
                onChange={(e) => setParserMaxSize(parseInt(e.target.value))}
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Supported File Extensions</label>
            <input
              type="text"
              value={parserSupportedExtensions}
              onChange={(e) => setParserSupportedExtensions(e.target.value)}
              className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground font-mono"
            />
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">AI Extraction Prompt Template</label>
            <textarea
              rows={5}
              value={parserPromptTemplate}
              onChange={(e) => setParserPromptTemplate(e.target.value)}
              className="w-full rounded-xl border border-border bg-background p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground leading-relaxed font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-xs font-semibold hover:bg-primary/95 shadow-sm transition-all"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Parser Configuration
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
