"use client";

import React, { useEffect, useState } from "react";
import { FolderLock, RotateCcw, Save, ShieldAlert, Loader2, ListRestart } from "lucide-react";
import { listAIPrompts, upsertAIPrompt, rollbackAIPrompt } from "@/lib/actions/admin-actions";
import toast from "react-hot-toast";

interface AIPrompt {
  id: string;
  key: string;
  template: string;
  version: number;
  description: string | null;
  createdAt: string;
}

const TEMPLATES = [
  { key: "career-engine", label: "Career GPS Engine Prompt", desc: "Formulates matching careers recommendations based on user assessment values." },
  { key: "degree-engine", label: "Degree Return ROI Prompt", desc: "Calculates cost return estimations and resilience multipliers." },
  { key: "parent-advisor", label: "Parent Counselor Prompt", desc: "Advises families about financial timelines and job categories." },
  { key: "skill-engine", label: "Skills Gap Planner Prompt", desc: "Advises certificates courses and tools study milestones." },
];

export default function AdminAIPromptsPage() {
  const [prompts, setPrompts] = useState<AIPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState("career-engine");
  const [templateText, setTemplateText] = useState("");
  const [descText, setDescText] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadPrompts() {
    setLoading(true);
    try {
      const data = await listAIPrompts();
      setPrompts(data as unknown as AIPrompt[]);
      
      // Load latest prompt for current selected key
      const latest = (data as unknown as AIPrompt[])
        .filter((p) => p.key === selectedKey)
        .sort((a, b) => b.version - a.version)[0];
      
      setTemplateText(latest ? latest.template : `You are an AI career GPS counselor...`);
      setDescText("");
    } catch (err: any) {
      toast.error(err.message || "Failed to load prompts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPrompts();
  }, [selectedKey]);

  const handleSavePrompt = async () => {
    if (!templateText.trim()) return;
    setSaving(true);
    const toastId = toast.loading("Saving prompt update as new version...");
    try {
      await upsertAIPrompt({
        key: selectedKey,
        template: templateText,
        description: descText.trim() || `Manual update`,
      });
      toast.success("Prompt saved! New version registered.", { id: toastId });
      loadPrompts();
    } catch (err: any) {
      toast.error(err.message || "Failed to save prompt template", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleRollback = async (version: number) => {
    if (!confirm(`Are you sure you want to rollback to version ${version}? This will record a new latest version containing version ${version} template content.`)) return;
    const toastId = toast.loading(`Rolling back prompt to version ${version}...`);
    try {
      await rollbackAIPrompt(selectedKey, version);
      toast.success("Rollback successful!", { id: toastId });
      loadPrompts();
    } catch (err: any) {
      toast.error(err.message || "Failed to execute rollback", { id: toastId });
    }
  };

  // Get versions of selected key
  const history = prompts
    .filter((p) => p.key === selectedKey)
    .sort((a, b) => b.version - a.version);

  const selectedMeta = TEMPLATES.find((t) => t.key === selectedKey);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-foreground">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text text-transparent sm:text-4xl">
          AI Prompt Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Modify core GPT prompt templates, inspect version change audit histories, and roll back templates.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Templates selector sidebar */}
        <div className="md:col-span-1 rounded-2xl border border-border bg-card/40 p-4 shadow-sm backdrop-blur-sm space-y-2">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2">Prompt Engines</h3>
          {TEMPLATES.map((t) => (
            <button
              key={t.key}
              onClick={() => setSelectedKey(t.key)}
              className={`w-full text-left flex items-start gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                selectedKey === t.key 
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" 
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <FolderLock className="h-4.5 w-4.5 mt-0.5" />
              <div>
                <span className="block">{t.label}</span>
                <span className="text-[9px] text-muted-foreground/80 font-normal line-clamp-1 group-hover:text-foreground">
                  {t.key}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Content editor */}
        <div className="md:col-span-3 grid gap-6 md:grid-cols-3">
          {/* Main prompt edit block */}
          <div className="md:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-md space-y-4">
            <div>
              <h2 className="text-base font-bold text-foreground">{selectedMeta?.label}</h2>
              <p className="text-xs text-muted-foreground mt-1">{selectedMeta?.desc}</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Prompt Template</label>
                <textarea
                  rows={12}
                  value={templateText}
                  onChange={(e) => setTemplateText(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Change Summary</label>
                <input
                  type="text"
                  placeholder="Summarize changes for the version history logs..."
                  value={descText}
                  onChange={(e) => setDescText(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                />
              </div>

              <button
                onClick={handleSavePrompt}
                disabled={saving || loading}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-xs font-semibold hover:bg-primary/95 shadow-sm transition-all"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Prompt Version
              </button>
            </div>
          </div>

          {/* History tracker */}
          <div className="md:col-span-1 rounded-2xl border border-border bg-card p-6 shadow-md flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground mb-4">Version History</h3>
              
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {loading ? (
                  <span className="text-xs text-muted-foreground">Loading history logs...</span>
                ) : history.length === 0 ? (
                  <span className="text-xs text-muted-foreground">No saved version records.</span>
                ) : (
                  history.map((h, i) => (
                    <div key={h.id} className="relative pl-5 text-xs before:absolute before:left-1.5 before:top-2 before:bottom-0 before:w-[1px] before:bg-border last:before:hidden">
                      <span className="absolute -left-[1px] top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">v{h.version}</span>
                        {i > 0 && (
                          <button
                            onClick={() => handleRollback(h.version)}
                            title="Rollback to this version"
                            className="text-[10px] text-primary hover:underline font-semibold flex items-center gap-0.5"
                          >
                            <RotateCcw className="h-2.5 w-2.5" /> Rollback
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 italic">{h.description || "Manual update"}</p>
                      <span className="text-[9px] text-muted-foreground/70 block mt-1">
                        {new Date(h.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
