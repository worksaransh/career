"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Upload,
  X,
  Search,
  FileUp,
  Sliders,
  DollarSign,
  Activity,
  Layers,
  Check,
  CheckSquare,
  Square,
  HelpCircle,
  FileSpreadsheet
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { GlassCard } from "@/components/ui/glass-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

import {
  listVaultDocuments,
  saveVaultDocument,
  deleteVaultDocument,
  confirmParsedResume,
} from "@/lib/actions/vault-actions";
import { getUserMemory } from "@/lib/actions/memory-actions";

export function VaultClient({ userId, isPremium = false }: { userId: string; isPremium?: boolean }) {
  const [activeTab, setActiveTab] = useState("assets");
  const [docs, setDocs] = useState<any[]>([]);
  const [memory, setMemory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Form states
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({
    title: "",
    type: "RESUME",
    fileUrl: "",
    linkUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Drag & Drop / Uploading States
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseStep, setParseStep] = useState(0);
  const [parsedData, setParsedData] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [uploadingFileName, setUploadingFileName] = useState("");

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

  // Drag & Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Validate File Types
    const allowedExtensions = ["pdf", "doc", "docx", "txt", "rtf", "odt", "png", "jpg", "jpeg"];
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!allowedExtensions.includes(ext)) {
      toast.error(`Unsupported file type: .${ext}. Please upload PDF, DOCX, TXT, or Image.`);
      return;
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }

    setUploadingFileName(file.name);
    setIsParsing(true);
    setParseStep(1);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", "RESUME");

      // UI Stepper progress
      const t1 = setTimeout(() => setParseStep(2), 600);
      const t2 = setTimeout(() => setParseStep(3), 1200);

      const res = await fetch("/api/vault/parse", {
        method: "POST",
        body: formData,
      });

      clearTimeout(t1);
      clearTimeout(t2);

      const json = await res.json();
      if (json.success && json.data) {
        setParsedData(json.data);
        setShowConfirmModal(true);
        toast.success("Document analyzed successfully! Verify details below.");
      } else {
        throw new Error(json.error || "Failed to parse document");
      }
    } catch (err: any) {
      toast.error("Extraction failed: " + err.message);
    } finally {
      setIsParsing(false);
      setParseStep(0);
    }
  };

  const handleConfirmParse = async () => {
    setSubmitting(true);
    const toastId = toast.loading("Auto-filling profile & generating twin snapshot...");
    try {
      const mockUrl = "/uploads/" + uploadingFileName;
      const res = await confirmParsedResume(parsedData, uploadingFileName, mockUrl);
      if (res.success) {
        toast.success("Profile auto-filled & Career Twin synced successfully!", { id: toastId });
        setShowConfirmModal(false);
        setParsedData(null);
        await loadData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to confirm parsing updates", { id: toastId });
    } finally {
      setSubmitting(false);
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
  const pScore = memory?.portfolioScore ?? 50;
  const jScore = memory?.jobReadinessScore ?? 45;
  const upgradeScore = memory?.careerUpgradeScore ?? 60;

  // Filtered Documents
  const filteredDocs = docs.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "ALL" || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground font-semibold">Analyzing vault documents...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-foreground pb-20 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Career Vault</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your resumes, certificates, and online profiles. Analyze documents with AI to sync your Career Twin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            leftIcon={<Upload className="h-4 w-4" />}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload File
          </Button>
          <Button
            variant="gradient"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setIsAdding(true)}
          >
            Add Profile Link
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.png,.jpg,.jpeg"
          />
        </div>
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
        <div className="grid gap-6 md:grid-cols-3">
          {/* AI Portfolio Strength Scorecard */}
          <GlassCard className="relative overflow-hidden border border-purple-500/20 bg-gradient-to-b from-purple-500/[0.02] to-purple-500/[0.08] p-5">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-purple-300 flex items-center gap-1.5 mb-3">
              <Trophy className="h-4 w-4" /> AI Portfolio Score
            </h3>
            <div className="flex items-center gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-purple-500 bg-purple-950/20 text-lg font-black text-white">
                {pScore}
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Portfolio Strength</span>
                <div className="flex gap-2 mt-1">
                  <Badge className="bg-purple-500/10 border-purple-500/20 text-purple-300 text-[9px] uppercase font-bold tracking-wider">
                    {pScore >= 80 ? "EXPERT" : pScore >= 60 ? "STRONG" : "EXPLORER"}
                  </Badge>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Job Readiness Scorecard */}
          <GlassCard className="relative overflow-hidden border border-emerald-500/20 bg-gradient-to-b from-emerald-500/[0.02] to-emerald-500/[0.08] p-5">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-emerald-300 flex items-center gap-1.5 mb-3">
              <Sparkles className="h-4 w-4" /> Job Readiness Index
            </h3>
            <div className="flex items-center gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-950/20 text-lg font-black text-white">
                {jScore}
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Employability Rating</span>
                <div className="flex gap-2 mt-1">
                  <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-300 text-[9px] uppercase font-bold tracking-wider">
                    {jScore >= 75 ? "READY" : "NEEDS ACTION"}
                  </Badge>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* ATS Score Card */}
          <GlassCard className="relative overflow-hidden border border-blue-500/20 bg-gradient-to-b from-blue-500/[0.02] to-blue-500/[0.08] p-5">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-blue-300 flex items-center gap-1.5 mb-3">
              <Activity className="h-4 w-4" /> ATS Matching Rate
            </h3>
            <div className="flex items-center gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-blue-500 bg-blue-950/20 text-lg font-black text-white">
                {docs.some((d) => d.type === "RESUME") ? "84%" : "N/A"}
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">ATS Suitability</span>
                <div className="flex gap-2 mt-1">
                  <Badge className="bg-blue-500/10 border-blue-500/20 text-blue-300 text-[9px] uppercase font-bold tracking-wider">
                    {docs.some((d) => d.type === "RESUME") ? "HIGH MATCH" : "UPLOAD RESUME"}
                  </Badge>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border text-sm font-semibold">
          {[
            { code: "assets", label: "Uploaded Library", icon: FolderOpen },
            { code: "scorecard", label: "Readiness checklist", icon: Award },
            { code: "insights", label: "AI Resume Insights", icon: Sliders },
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
          <div className="space-y-6">
            {/* Drag and Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center bg-card/5 hover:bg-card/10",
                dragActive ? "border-primary bg-primary/5" : "border-border"
              )}
            >
              {isParsing ? (
                <div className="space-y-3">
                  <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
                  <h4 className="font-bold text-sm">AI Parsing Active</h4>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    {parseStep === 1 && "Step 1: Reading document content bytes..."}
                    {parseStep === 2 && "Step 2: Processing OCR / Text context..."}
                    {parseStep === 3 && "Step 3: Extracting skills, education, and experience..."}
                  </p>
                </div>
              ) : (
                <>
                  <FileUp className="h-10 w-10 text-muted-foreground mb-3" />
                  <h4 className="font-bold text-sm">Drag and Drop Document Here</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                    Supports PDF, DOCX, DOC, TXT, PNG, and JPG. Files are parsed using OCR and LLM to build your Career Twin.
                  </p>
                  <Button variant="outline" size="sm" className="mt-4">
                    Select File
                  </Button>
                </>
              )}
            </div>

            {/* Filters Row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search vault documents..."
                  className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground font-semibold"
              >
                <option value="ALL">All Document Types</option>
                <option value="RESUME">Resumes</option>
                <option value="CV">CVs</option>
                <option value="CERTIFICATE">Certifications</option>
                <option value="PROJECT">Projects</option>
                <option value="LINKEDIN">LinkedIn Links</option>
                <option value="GITHUB">GitHub Profiles</option>
              </select>
            </div>

            {/* Document Listing */}
            {filteredDocs.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-3xl bg-card/10">
                <FolderOpen className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground font-semibold">No assets match your filters</p>
                <p className="text-xs text-muted-foreground/80 mt-1 max-w-xs mx-auto leading-relaxed">
                  Try clearing your search query or upload a new Resume/CV to expand your library.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredDocs.map((doc) => {
                  const isLink = ["LINKEDIN", "GITHUB", "WEBSITE", "FREELANCE_PROFILE"].includes(doc.type);
                  return (
                    <div
                      key={doc.id}
                      className="p-4 rounded-2xl border border-border bg-card/20 hover:border-primary/20 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div className={cn(
                            "p-2.5 rounded-xl flex-shrink-0",
                            isLink ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
                          )}>
                            {isLink ? <LinkIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                          </div>
                          {doc.confidenceScore && (
                            <Badge className="bg-purple-500/15 border-purple-500/20 text-purple-300 text-[8px] font-bold">
                              {doc.confidenceScore}% Confidence
                            </Badge>
                          )}
                        </div>

                        <div className="mt-3">
                          <Badge variant="glass" className="text-[9px] uppercase tracking-wider">
                            {doc.type}
                          </Badge>
                          <h4 className="text-sm font-bold text-foreground truncate mt-1">{doc.title}</h4>
                          <span className="text-[10px] text-muted-foreground block mt-0.5">
                            Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-5 pt-3 border-t border-border/60">
                        <a
                          href={isLink ? doc.linkUrl : doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline"
                        >
                          View Document <ExternalLink className="h-3 w-3" />
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

        {activeTab === "insights" && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* ATS Audit Insights Card */}
            <GlassCard className="p-5 border border-border/80 space-y-4">
              <div className="border-b border-border/40 pb-3">
                <h4 className="font-bold text-sm flex items-center gap-1.5">
                  <Activity className="h-4.5 w-4.5 text-primary" /> ATS Score Card & Keyword Audit
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">Recommended suggestions for your uploaded resume.</p>
              </div>

              {docs.some((d) => d.type === "RESUME") ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-primary/5 p-3 rounded-xl border border-primary/10">
                    <div>
                      <span className="text-xs font-bold block">Overall Match Quality</span>
                      <span className="text-[10px] text-muted-foreground">Tailored for Software Engineer / Product Manager</span>
                    </div>
                    <span className="text-xl font-extrabold text-primary">84%</span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-amber-400 block tracking-wider uppercase">MISSING KEYWORDS</span>
                    <div className="flex flex-wrap gap-1.5">
                      {["Docker", "CI/CD Pipeline", "Kubernetes", "System Design", "Microservices", "RESTful API"].map((kw) => (
                        <Badge key={kw} className="bg-amber-500/10 border-amber-500/20 text-amber-300 text-[9px] font-mono">
                          + {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-emerald-400 block tracking-wider uppercase">FOUND KEYWORDS</span>
                    <div className="flex flex-wrap gap-1.5">
                      {["React", "JavaScript", "Node.js", "SQL", "TypeScript", "Git", "HTML5", "CSS3"].map((kw) => (
                        <Badge key={kw} className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-[9px]">
                          ✓ {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  Please upload a Resume to view ATS analysis.
                </div>
              )}
            </GlassCard>

            {/* Salary Prediction & Career Timelines */}
            <GlassCard className="p-5 border border-border/80 space-y-4">
              <div className="border-b border-border/40 pb-3">
                <h4 className="font-bold text-sm flex items-center gap-1.5">
                  <DollarSign className="h-4.5 w-4.5 text-primary" /> Career Growth & Salary Predictions
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">Projections based on your skill graph and certificates.</p>
              </div>

              <div className="space-y-3">
                <div className="p-3 border border-border/50 rounded-xl bg-card/5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold block text-foreground">Next Role Probability</span>
                    <span className="text-[10px] text-muted-foreground">Software Engineer II / Associate PM</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/20">78% Chance</Badge>
                </div>

                <div className="p-3 border border-border/50 rounded-xl bg-card/5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold block text-foreground">Estimated Next Salary (INR)</span>
                    <span className="text-[10px] text-muted-foreground">With 2 key skill gap upgrades</span>
                  </div>
                  <span className="font-mono text-sm font-bold text-primary">₹12.5 - 15.0 LPA</span>
                </div>

                <div className="p-3 border border-border/50 rounded-xl bg-card/5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold block text-foreground">Career Upgrade Score</span>
                    <span className="text-[10px] text-muted-foreground">Aggregated speed of promotion</span>
                  </div>
                  <span className="font-bold text-xs">{upgradeScore}/100</span>
                </div>
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
            <h3 className="text-lg font-bold mb-1">Add Vault Link</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Connect external online profiles or portfolios directly to compute AI metrics.
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
                  placeholder="E.g. GitHub Profile"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Asset Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 animate-in"
                >
                  <option value="LINKEDIN">LinkedIn Profile URL</option>
                  <option value="GITHUB">GitHub Developer Profile URL</option>
                  <option value="PORTFOLIO">Portfolio / Personal Website Link</option>
                  <option value="WEBSITE">Personal Website Link</option>
                  <option value="FREELANCE_PROFILE">Freelance Profile Link (Upwork/Fiverr)</option>
                  <option value="PROJECT">Project URL</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">URL Path</label>
                <input
                  type="url"
                  required
                  value={form.linkUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, linkUrl: e.target.value }))}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="https://"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={submitting} variant="gradient" fullWidth>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Link"}
                </Button>
                <Button type="button" onClick={() => setIsAdding(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* ─── PARSED CONFIRMATION MODAL ─── */}
      <AnimatePresence>
        {showConfirmModal && parsedData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <div className="fixed inset-0" onClick={() => setShowConfirmModal(false)} />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl z-10 max-h-[85vh] overflow-y-auto space-y-4 my-8"
            >
              <div className="flex justify-between items-start border-b border-border/40 pb-3">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-1.5">
                    <Sparkles className="h-5 w-5 text-primary" /> Verify Extracted Resume Profile
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    We automatically analyzed your document. Please verify the profile autofill details.
                  </p>
                </div>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:bg-card/80 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Summary and Confidence Score */}
              <div className="flex items-center justify-between bg-primary/5 p-3 rounded-2xl border border-primary/10">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <div>
                    <span className="text-xs font-bold block text-foreground">Ready for Syncing</span>
                    <span className="text-[10px] text-muted-foreground">Confidence rating: {parsedData.confidenceScore || 85}%</span>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">PERSONAL DETAILS</span>
                <div className="grid gap-3 sm:grid-cols-2 bg-card/30 p-3 rounded-2xl border border-border/40 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Name</span>
                    <input
                      type="text"
                      value={parsedData.personalDetails?.name || ""}
                      onChange={(e) => setParsedData({
                        ...parsedData,
                        personalDetails: { ...parsedData.personalDetails, name: e.target.value }
                      })}
                      className="w-full bg-transparent border-b border-border/40 focus:border-primary py-0.5 text-foreground focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Location</span>
                    <input
                      type="text"
                      value={parsedData.personalDetails?.location || ""}
                      onChange={(e) => setParsedData({
                        ...parsedData,
                        personalDetails: { ...parsedData.personalDetails, location: e.target.value }
                      })}
                      className="w-full bg-transparent border-b border-border/40 focus:border-primary py-0.5 text-foreground focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Education Section */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">EDUCATION</span>
                <div className="space-y-2">
                  {parsedData.education?.map((edu: any, index: number) => (
                    <div key={index} className="p-3 bg-card/30 rounded-2xl border border-border/40 text-xs grid gap-2 sm:grid-cols-3">
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Degree</span>
                        <span className="font-bold text-foreground">{edu.degree}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">College</span>
                        <span className="font-bold text-foreground truncate block">{edu.college}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Passing Year</span>
                        <span className="font-bold text-foreground">{edu.passingYear || "N/A"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience Section */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">EXPERIENCE</span>
                <div className="space-y-2">
                  {parsedData.experience?.map((exp: any, index: number) => (
                    <div key={index} className="p-3 bg-card/30 rounded-2xl border border-border/40 text-xs flex justify-between items-start">
                      <div>
                        <span className="font-bold text-foreground">{exp.designation}</span>
                        <span className="text-muted-foreground block text-[10px]">{exp.company} | {exp.startDate || "N/A"} - {exp.endDate || "Present"}</span>
                      </div>
                      {exp.yearsOfExperience > 0 && (
                        <Badge className="bg-primary/10 border-primary/20 text-primary scale-90">
                          {exp.yearsOfExperience} yrs
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills Extracted */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">EXTRACTED SKILLS</span>
                <div className="p-3 bg-card/30 rounded-2xl border border-border/40 text-xs space-y-3">
                  {Object.keys(parsedData.skills || {}).map((cat) => {
                    const skills = parsedData.skills[cat];
                    if (!skills || skills.length === 0) return null;
                    return (
                      <div key={cat} className="space-y-1">
                        <span className="text-[10px] font-extrabold uppercase text-primary tracking-wide block">{cat}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {skills.map((s: string, i: number) => (
                            <Badge key={i} variant="glass" className="text-[9px] lowercase">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Confirm Actions */}
              <div className="flex gap-3 pt-3 border-t border-border/40">
                <Button onClick={handleConfirmParse} disabled={submitting} variant="gradient" fullWidth>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm & Auto-fill Profile"}
                </Button>
                <Button onClick={() => setShowConfirmModal(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
