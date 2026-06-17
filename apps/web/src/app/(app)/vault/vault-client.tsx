"use client";

import React, { useState, useEffect } from "react";
import {
  FolderOpen,
  FileText,
  Link as LinkIcon,
  Trash2,
  Plus,
  Loader2,
  AlertCircle,
  TrendingUp,
  Award,
  Sparkles,
  Trophy,
  ArrowRight,
  ExternalLink,
  Lock,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { motion } from "framer-motion";

import { GlassCard } from "@/components/ui/glass-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

import {
  listVaultDocuments,
  saveVaultDocument,
  deleteVaultDocument,
} from "@/lib/actions/vault-actions";
import { getUserMemory } from "@/lib/actions/memory-actions";

export function VaultClient({ userId, isPremium = false }: { userId: string; isPremium?: boolean }) {
  const [activeTab, setActiveTab] = useState("assets");
  const [docs, setDocs] = useState<any[]>([]);
  const [memory, setMemory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({
    title: "",
    type: "RESUME",
    fileUrl: "",
    linkUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Load documents and user memory
  async function loadData() {
    setLoading(true);
    try {
      const docsList = await listVaultDocuments();
      setDocs(docsList);
      
      const userMemory = await getUserMemory();
      setMemory(userMemory);
    } catch (err: any) {
      toast.error("Failed to load vault assets: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (form.type === "GITHUB" || form.type === "LINKEDIN" || form.type === "WEBSITE" || form.type === "FREELANCE_PROFILE") {
      if (!form.linkUrl.trim()) {
        toast.error("Please enter the profile URL");
        return;
      }
    } else {
      if (!form.fileUrl.trim()) {
        toast.error("Please enter the file/document URL");
        return;
      }
    }

    setSubmitting(true);
    const toastId = toast.loading("Saving asset to vault...");
    try {
      const res = await saveVaultDocument(form);
      if (res.success) {
        toast.success("Asset saved successfully! Scores recalculated.", { id: toastId });
        setIsAdding(false);
        setForm({ title: "", type: "RESUME", fileUrl: "", linkUrl: "" });
        await loadData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save asset", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this document/link?")) return;
    const toastId = toast.loading("Removing asset...");
    try {
      const res = await deleteVaultDocument(id);
      if (res.success) {
        toast.success("Asset deleted. Scores updated.", { id: toastId });
        await loadData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete", { id: toastId });
    }
  };

  // Heuristic recommendations
  const getImprovements = () => {
    const actions = [];
    const docTypes = docs.map((d) => d.type);

    if (!docTypes.includes("RESUME")) {
      actions.push({
        text: "Upload your primary Resume (PDF)",
        impact: "+20 Portfolio strength, +6 Job Readiness",
        type: "RESUME",
      });
    }
    if (!docTypes.includes("LINKEDIN")) {
      actions.push({
        text: "Connect your LinkedIn profile link",
        impact: "+15 Portfolio strength",
        type: "LINKEDIN",
      });
    }
    if (!docTypes.includes("GITHUB")) {
      actions.push({
        text: "Add your GitHub developer profile URL",
        impact: "+15 Portfolio strength",
        type: "GITHUB",
      });
    }
    if (!docTypes.includes("PROJECT")) {
      actions.push({
        text: "Add proof of practical/mini project",
        impact: "+10 Portfolio strength",
        type: "PROJECT",
      });
    }
    if (!docTypes.includes("CERTIFICATE")) {
      actions.push({
        text: "Upload skill certifications certificates",
        impact: "+10 Portfolio strength",
        type: "CERTIFICATE",
      });
    }

    return actions;
  };

  const improvements = getImprovements();

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground font-semibold">Analyzing vault documents...</span>
      </div>
    );
  }

  const pScore = memory?.portfolioScore ?? 50;
  const jScore = memory?.jobReadinessScore ?? 45;

  return (
    <div className="space-y-6 text-foreground pb-20 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Career Vault</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your resumes, project proofs, LinkedIn link, and view live AI readiness scorecards.
          </p>
        </div>
        <Button
          variant="gradient"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setIsAdding(true)}
        >
          Add Vault Asset
        </Button>
      </div>

      {/* Lock layer for Non-Premium Users */}
      {!isPremium && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="no-print">
          <GlassCard variant="strong" className="p-8 border border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-transparent flex flex-col items-center text-center space-y-4 shadow-xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Lock className="h-6 w-6" />
            </div>
            <div className="space-y-2 max-w-lg">
              <h3 className="text-xl font-bold">Unlock AI Portfolio & Job Readiness Scorecard</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connect your Resume, GitHub connection, CV, and certifications to receive dynamic AI scores (Strengths & Weaknesses checklists) and job readiness metrics customized for placements.
              </p>
            </div>
            <Link href="/pricing">
              <Button variant="gradient" size="lg" className="mt-2">
                Upgrade to Premium
              </Button>
            </Link>
          </GlassCard>
        </motion.div>
      )}

      {/* Gated Content */}
      <div className={cn("space-y-6", !isPremium && "relative pointer-events-none select-none opacity-15 filter blur-sm no-print")}>
        
        {/* Dynamic Score Display Row */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* AI Portfolio Strength Scorecard */}
          <GlassCard className="relative overflow-hidden border border-purple-500/20 bg-gradient-to-b from-purple-500/[0.02] to-purple-500/[0.08] p-6">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-purple-300 flex items-center gap-1.5 mb-4">
              <Trophy className="h-4.5 w-4.5" /> AI Portfolio Scorecard
            </h3>
            <div className="flex items-center gap-6">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-purple-500 bg-purple-950/20 text-2xl font-black text-white">
                {pScore}
                <div className="absolute inset-0 border border-dashed border-purple-500/40 rounded-full animate-spin [animation-duration:15s]" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">PORTFOLIO STRENGTH</span>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  Calculated from verified resumes, certifications, portfolios, website links, and project repositories.
                </p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Badge className="bg-purple-500/10 border-purple-500/20 text-purple-300 text-[9px] uppercase font-bold tracking-wider">
                    {pScore >= 80 ? "EXPERT" : pScore >= 60 ? "STRONG" : "EXPLORER"}
                  </Badge>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Job Readiness Scorecard */}
          <GlassCard className="relative overflow-hidden border border-emerald-500/20 bg-gradient-to-b from-emerald-500/[0.02] to-emerald-500/[0.08] p-6">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-emerald-300 flex items-center gap-1.5 mb-4">
              <Sparkles className="h-4.5 w-4.5" /> Job Readiness Index
            </h3>
            <div className="flex items-center gap-6">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-emerald-500 bg-emerald-950/20 text-2xl font-black text-white">
                {jScore}
                <div className="absolute inset-0 border border-dashed border-emerald-500/40 rounded-full animate-spin [animation-duration:15s]" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">EMPLOYABILITY RATING</span>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  Aggregates your portfolio scores, assessments compatibility, skill proficiencies, and streak consistency.
                </p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-300 text-[9px] uppercase font-bold tracking-wider">
                    {jScore >= 75 ? "READY FOR PLACEMENTS" : "NEEDS ACTION ITEMS"}
                  </Badge>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border text-sm font-semibold">
          {[
            { code: "assets", label: "Uploaded Assets", icon: FolderOpen },
            { code: "scorecard", label: "AI Scorecard Details", icon: Award },
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
        {activeTab === "assets" && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Document Listing Column */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-muted-foreground">Vault Repository</h3>
              
              {docs.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border rounded-3xl bg-card/10">
                  <FolderOpen className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground font-semibold">No assets found in vault</p>
                  <p className="text-xs text-muted-foreground/80 mt-1 max-w-xs mx-auto leading-relaxed">
                    Start uploading your Resume, CV, GitHub, or LinkedIn details to calculate your AI Portfolio Score!
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {docs.map((doc) => {
                    const isLink = ["LINKEDIN", "GITHUB", "WEBSITE", "FREELANCE_PROFILE"].includes(doc.type);
                    return (
                      <div
                        key={doc.id}
                        className="p-4 rounded-2xl border border-border bg-card/20 hover:border-primary/20 transition-all flex flex-col justify-between"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`p-2 rounded-xl ${isLink ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"} flex-shrink-0`}>
                            {isLink ? <LinkIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                          </div>
                          <div className="min-w-0">
                            <Badge variant="glass" className="text-[9px] uppercase tracking-wider scale-90 -ml-1">
                              {doc.type}
                            </Badge>
                            <h4 className="text-sm font-bold text-foreground truncate mt-1">{doc.title}</h4>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/60">
                          <a
                            href={isLink ? doc.linkUrl : doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline"
                          >
                            View Asset <ExternalLink className="h-3 w-3" />
                          </a>
                          
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="p-1 rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Helper Column: Improvements Checklist */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-muted-foreground">Action Checklist</h3>
              <GlassCard className="border border-border/80 p-5 space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">PORTFOLIO SUGGESTIONS</span>
                  <h4 className="font-bold text-sm text-foreground mt-1">Direct ROI Actions</h4>
                </div>
                
                {improvements.length === 0 ? (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                    <CheckCircle2 className="h-4 w-4" /> All main assets uploaded! Great job.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {improvements.map((act, idx) => (
                      <div
                        key={idx}
                        className="p-3 border border-border/60 rounded-xl bg-card/10 flex items-start gap-2.5"
                      >
                        <AlertCircle className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-foreground leading-snug">{act.text}</p>
                          <span className="text-[10px] text-purple-300 font-mono mt-1 block">{act.impact}</span>
                          <button
                            onClick={() => {
                              setForm((prev) => ({ ...prev, type: act.type }));
                              setIsAdding(true);
                            }}
                            className="text-[9px] font-bold text-primary hover:underline mt-2 inline-flex items-center gap-0.5"
                          >
                            Fix Now <ArrowRight className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>
          </div>
        )}

        {activeTab === "scorecard" && (
          <div className="grid gap-6 md:grid-cols-2">
            <GlassCard className="border border-border/80 p-5">
              <h4 className="font-extrabold text-sm text-foreground mb-4">Portfolio Strengths & Weaknesses</h4>
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] font-bold text-emerald-400 block tracking-wider uppercase">STRENGTHS</span>
                  <ul className="list-disc pl-5 mt-1 text-xs text-muted-foreground space-y-1">
                    {docs.length > 0 ? (
                      docs.map((doc, idx) => (
                        <li key={idx}>Verified {doc.type.toLowerCase().replace("_", " ")} uploaded: {doc.title}</li>
                      ))
                    ) : (
                      <li>No active profile strengths mapped yet.</li>
                    )}
                  </ul>
                </div>

                <div className="pt-3 border-t border-border/60">
                  <span className="text-[9px] font-bold text-amber-500 block tracking-wider uppercase">WEAKNESSES / GAPS</span>
                  <ul className="list-disc pl-5 mt-1 text-xs text-muted-foreground space-y-1">
                    {improvements.length > 0 ? (
                      improvements.map((act, idx) => (
                        <li key={idx}>Missing {act.type.toLowerCase().replace("_", " ")} authentication link</li>
                      ))
                    ) : (
                      <li>All major profiles and cv models linked cleanly.</li>
                    )}
                  </ul>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="border border-border/80 p-5">
              <h4 className="font-extrabold text-sm text-foreground mb-4">Job Placement Checklist</h4>
              <div className="space-y-3">
                {[
                  { label: "Upload Primary Resume Document", check: docs.some((d) => d.type === "RESUME"), info: "Unlocks ATS matching tools" },
                  { label: "Upload CV / Profile Summary", check: docs.some((d) => d.type === "CV"), info: "Unlocks dynamic RAG counselor sync" },
                  { label: "Add Career / Skill Assessments Result", check: true, info: "Unlocks personalized career match scoring" },
                  { label: "Connect Verified LinkedIn Link", check: docs.some((d) => d.type === "LINKEDIN"), info: "Unlocks employer outreach matching" },
                  { label: "Connect GitHub Repository", check: docs.some((d) => d.type === "GITHUB"), info: "Unlocks engineering portfolio verification" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between p-2.5 border border-border/40 rounded-xl bg-card/5">
                    <div>
                      <p className="text-xs font-bold text-foreground">{item.label}</p>
                      <span className="text-[10px] text-muted-foreground block mt-0.5">{item.info}</span>
                    </div>
                    {item.check ? (
                      <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-[9px] uppercase font-bold tracking-wider">DONE</Badge>
                    ) : (
                      <Badge variant="outline" className="border-border text-muted-foreground text-[9px] uppercase font-bold tracking-wider">PENDING</Badge>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}
      </div>

      {/* ─── ADD ASSET MODAL DIALOG ─── */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setIsAdding(false)} />
          
          <GlassCard className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl z-10">
            <h3 className="text-lg font-bold mb-1">Add Vault Asset</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Enter document/profile parameters below. Our AI score logic will automatically verify credentials.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Asset Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="E.g. Full-Stack Developer Resume 2026"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Asset Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="RESUME">Resume (PDF)</option>
                  <option value="CV">Curriculum Vitae (CV)</option>
                  <option value="LINKEDIN">LinkedIn Profile URL</option>
                  <option value="GITHUB">GitHub Developer Profile URL</option>
                  <option value="PORTFOLIO">Portfolio / Personal Website Link</option>
                  <option value="WEBSITE">Personal Website Link</option>
                  <option value="FREELANCE_PROFILE">Freelance Profile Link (Upwork/Fiverr)</option>
                  <option value="CERTIFICATE">Skill Certificate / Credential PDF</option>
                  <option value="PROJECT">Project Documentation / Link</option>
                  <option value="INTERNSHIP_PROOF">Internship Proof / Completion Certificate</option>
                </select>
              </div>

              {["LINKEDIN", "GITHUB", "PORTFOLIO", "WEBSITE", "FREELANCE_PROFILE", "PROJECT"].includes(form.type) ? (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Profile / Project URL</label>
                  <input
                    type="url"
                    required
                    value={form.linkUrl}
                    onChange={(e) => setForm((prev) => ({ ...prev, linkUrl: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="E.g. https://linkedin.com/in/username"
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">File/Document URL</label>
                  <input
                    type="url"
                    required
                    value={form.fileUrl}
                    onChange={(e) => setForm((prev) => ({ ...prev, fileUrl: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="E.g. https://drive.google.com/file/.../resume.pdf"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={submitting} variant="gradient" fullWidth>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Asset"}
                </Button>
                <Button type="button" onClick={() => setIsAdding(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
