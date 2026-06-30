"use client";

import React, { useState, useEffect } from "react";
import {
  Brain, Route, GraduationCap, Building2, TrendingUp, Award, Target, Sparkles,
  ArrowRight, Users, CheckCircle2, Plus, Send, Loader2, Share2, FolderOpen,
  Calendar, MessageSquare, Trophy, Zap, HelpCircle, DollarSign, Activity,
  Sliders, Briefcase, BookOpen, AlertTriangle, BarChart3, Star, Percent, Shield,
  ArrowRightLeft, Check, PlayCircle, Eye, Settings, Heart, X
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { User } from "@career-os/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardEngagement } from "@/components/dashboard/dashboard-engagement";
import { ConfidenceScoreCard } from "@/components/intelligence/confidence-score";
import { ShareBrandingModal } from "@/components/shared/share-branding";
import { DashboardModeSwitcher, type PersonaType } from "@/components/dashboard/persona/dashboard-mode-switcher";
import { AiMicroGoals } from "@/components/dashboard/ai-micro-goals";

// Server Actions
import { completeWeeklyChallenge } from "@/lib/actions/challenge-actions";
import { invitePartner, sendPartnerNudge } from "@/lib/actions/accountability-actions";

interface DashboardContentProps {
  user: User;
  latestResult?: any;
  recommendedCareersCount?: number;
  savedCount?: number;
  memory: any;
  initialWeeklyChallenges: any[];
  initialTimelineEvents: any[];
  initialPartners: any[];
  whatsappLink: string;
  telegramLink: string;
  hasResume?: boolean;
}

export function DashboardContent({
  user,
  latestResult,
  recommendedCareersCount,
  savedCount,
  memory,
  initialWeeklyChallenges,
  initialTimelineEvents,
  initialPartners,
  whatsappLink,
  telegramLink,
  hasResume = false,
}: DashboardContentProps) {
  // Local States
  const [challenges, setChallenges] = useState(initialWeeklyChallenges);
  const [partners, setPartners] = useState(initialPartners);
  const [timeline, setTimeline] = useState(initialTimelineEvents);
  
  const [scores, setScores] = useState({
    careerUpgrade: memory?.careerUpgradeScore ?? 65,
    jobReadiness: memory?.jobReadinessScore ?? 45,
    portfolio: memory?.portfolioScore ?? 50,
  });

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", relationship: "FRIEND" });
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
  
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [completingIds, setCompletingIds] = useState<Record<string, boolean>>({});
  const [nudgingIds, setNudgingIds] = useState<Record<string, boolean>>({});

  // Navigation Switcher Tab State (home, professional, switcher, learning, finance, ai)
  const [dashboardTab, setDashboardTab] = useState("home");

  // Persona State
  const effectivePersona = (user as any).primaryPersona ?? "STUDENT";
  const [activePersona, setActivePersona] = useState<PersonaType>(effectivePersona as PersonaType);
  const [showPersonaPicker, setShowPersonaPicker] = useState(false);

  // Widget customizer states
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [visibleWidgets, setVisibleWidgets] = useState<Record<string, boolean>>({});

  // ROI scenarios
  const [roiTuition, setRoiTuition] = useState(150000);
  const [roiSalary, setRoiSalary] = useState(1200000);
  const [roiYears, setRoiYears] = useState(4);

  // Study target planner input
  const [studyPlannerText, setStudyPlannerText] = useState("");
  const [studyPlannerList, setStudyPlannerList] = useState<string[]>([
    "Revise Chemistry chapter 3",
    "Complete Mathematics mock test",
    "Read PM fundamentals module 1"
  ]);

  // Load custom widgets visibility from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("career_os_widgets");
    if (saved) {
      try {
        setVisibleWidgets(JSON.parse(saved));
      } catch (e) {}
    } else {
      // Default widget mapping
      setVisibleWidgets({
        // Student
        goals: true, interests: true, match: true, subjects: true, careers: true, planner: true, challenges: true,
        // College
        internships: true, projects: true, skills: true, resume: true, placements: true, readiness: true,
        // Professional
        currentSalary: true, expectedSalary: true, promotion: true, atsScore: true, skillGap: true, interview: true, upgrade: true,
        // Switcher
        switchReadiness: true, transferable: true, salaryDiff: true, certs: true, missions: true,
        // Parent
        childProgress: true, confidence: true, eduRoi: true, fees: true, futureSalary: true,
      });
    }
  }, []);

  const toggleWidget = (key: string) => {
    const updated = { ...visibleWidgets, [key]: !visibleWidgets[key] };
    setVisibleWidgets(updated);
    localStorage.setItem("career_os_widgets", JSON.stringify(updated));
  };

  const handlePersonaSwitch = async (persona: PersonaType) => {
    setActivePersona(persona);
    if (persona !== effectivePersona) {
      setShowPersonaPicker(true);
    }
  };

  const handleSavePersona = async () => {
    try {
      await fetch("/api/user/persona", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona: activePersona }),
      });
      setShowPersonaPicker(false);
      toast.success(`Default persona set to ${activePersona.replace("_", " ")}`);
    } catch {}
  };

  const handleChallengeCheck = async (id: string) => {
    if (completingIds[id]) return;
    setCompletingIds((prev) => ({ ...prev, [id]: true }));
    const toastId = toast.loading("Recording challenge completion...");
    try {
      const res = await completeWeeklyChallenge(id);
      if (res.success) {
        toast.success("Challenge completed! XP and scores boosted! 🚀", { id: toastId });
        setChallenges((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isCompleted: true, completedAt: new Date() } : c))
        );
        setScores((prev) => ({ ...prev, careerUpgrade: Math.min(100, prev.careerUpgrade + 3) }));
      } else {
        toast.error(res.message || "Failed to complete challenge", { id: toastId });
      }
    } catch (e: any) {
      toast.error(e.message || "Something went wrong", { id: toastId });
    } finally {
      setCompletingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) {
      toast.error("Please enter a name and email");
      return;
    }
    setIsSubmittingInvite(true);
    const toastId = toast.loading("Inviting study partner...");
    try {
      const res = await invitePartner(inviteForm);
      if (res.success) {
        toast.success("Partner invited! Link established.", { id: toastId });
        setIsInviteOpen(false);
        setInviteForm({ name: "", email: "", relationship: "FRIEND" });
        setPartners((prev) => [
          ...prev,
          {
            id: res.partner.id,
            name: res.partner.partnerName,
            email: res.partner.partnerEmail,
            relation: res.partner.relation,
            status: "ACCEPTED",
            streak: 0,
            xp: 0,
            completeness: 15,
            careerUpgradeScore: 65,
          },
        ]);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to invite partner", { id: toastId });
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  const handleNudge = async (partnerId: string, partnerName: string) => {
    if (nudgingIds[partnerId]) return;
    setNudgingIds((prev) => ({ ...prev, [partnerId]: true }));
    const toastId = toast.loading(`Nudging ${partnerName}...`);
    try {
      const res = await sendPartnerNudge(partnerId);
      toast.success(res.message || "Nudge sent successfully!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to send nudge", { id: toastId });
    } finally {
      setNudgingIds((prev) => ({ ...prev, [partnerId]: false }));
    }
  };

  const addStudyGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studyPlannerText.trim()) return;
    setStudyPlannerList([...studyPlannerList, studyPlannerText.trim()]);
    setStudyPlannerText("");
  };

  // Determine current active dashboard view
  const activeView = dashboardTab === "home" ? activePersona : dashboardTab;

  return (
    <div className="space-y-6 text-foreground pb-20 max-w-7xl mx-auto p-4 sm:p-6">
      
      {/* Upper Mode Switcher Row */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}!
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Your personalized AI Career Operating System.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Dashboard switch options */}
          <div className="flex bg-accent/30 rounded-xl p-1 text-xs border border-border">
            {[
              { code: "home", label: "Home" },
              { code: "PROFESSIONAL", label: "Professional" },
              { code: "CAREER_SWITCHER", label: "Switcher" },
              { code: "learning", label: "Learning" },
              { code: "finance", label: "Finance" },
              { code: "ai", label: "Twin Insights" },
            ].map((tab) => (
              <button
                key={tab.code}
                onClick={() => setDashboardTab(tab.code)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  dashboardTab === tab.code 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl h-9"
            leftIcon={<Settings className="h-4 w-4" />}
            onClick={() => setShowCustomizer(true)}
          >
            Customize
          </Button>
        </div>
      </div>

      {/* Manual Persona switcher in Home View */}
      {dashboardTab === "home" && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card/15 p-3 rounded-2xl border border-border">
          <div className="text-xs text-muted-foreground font-semibold">
            Currently displaying <strong>{activePersona.replace("_", " ")}</strong> profile. Switch manually:
          </div>
          <DashboardModeSwitcher currentPersona={activePersona} onSwitch={handlePersonaSwitch} compact />
        </div>
      )}

      {/* ─── DYNAMIC WIDGETS DISPLAY GRID ─── */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* ========================================================
            SCHOOL STUDENT WIDGETS
           ======================================================== */}
        {activeView === "STUDENT" && (
          <>
            {/* Widget: Today's Goal */}
            {visibleWidgets.goals && (
              <GlassCard className="p-5 border border-border space-y-3 relative overflow-hidden">
                <Badge variant="glass" className="bg-primary/10 text-primary border-primary/20 text-[9px] font-bold">TODAY&apos;S GOAL</Badge>
                <AiMicroGoals persona="STUDENT" />
              </GlassCard>
            )}

            {/* Widget: Career Interests */}
            {visibleWidgets.interests && (
              <GlassCard className="p-5 border border-border space-y-3">
                <Badge variant="glass" className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-[9px] font-bold">CAREER INTERESTS</Badge>
                <h3 className="text-sm font-bold text-foreground">Interest Matrix</h3>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(memory.demographics.interests ?? ["Coding", "UI/UX", "Management", "Science"]).map((int: string) => (
                    <Badge key={int} variant="secondary" className="rounded-full text-[10px]">{int}</Badge>
                  ))}
                  <Link href="/profile">
                    <Badge variant="outline" className="rounded-full text-[10px] border-dashed border-primary text-primary cursor-pointer hover:bg-primary/10">+ Edit</Badge>
                  </Link>
                </div>
              </GlassCard>
            )}

            {/* Widget: Career Match */}
            {visibleWidgets.match && (
              <GlassCard className="p-5 border border-border space-y-3">
                <Badge variant="glass" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] font-bold">DNA MATCH</Badge>
                <div className="flex items-center gap-4">
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-emerald-500 text-lg font-black text-white">
                    {latestResult ? "85%" : "--"}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Career Compatibility</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5 font-semibold">Based on interest dna assessment</p>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Widget: Recommended Subjects */}
            {visibleWidgets.subjects && (
              <GlassCard className="p-5 border border-border space-y-3">
                <Badge variant="glass" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[9px] font-bold">ACADEMICS</Badge>
                <h3 className="text-sm font-bold text-foreground">Recommended High School Subjects</h3>
                <ul className="text-xs text-muted-foreground space-y-2 font-semibold">
                  <li className="flex justify-between border-b border-border/40 pb-1"><span>Mathematics (Core)</span> <span className="text-primary font-bold">High ROI</span></li>
                  <li className="flex justify-between border-b border-border/40 pb-1"><span>Computer Applications</span> <span className="text-emerald-400 font-bold">100% Match</span></li>
                  <li className="flex justify-between"><span>Physics & Chemistry</span> <span className="text-indigo-300 font-bold">Required</span></li>
                </ul>
              </GlassCard>
            )}

            {/* Widget: Recommended Careers */}
            {visibleWidgets.careers && (
              <GlassCard className="p-5 border border-border space-y-3 col-span-1 md:col-span-2 lg:col-span-1">
                <Badge variant="glass" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[9px] font-bold">SUGGESTED PATHS</Badge>
                <div className="space-y-2 text-xs">
                  <div className="p-2 border border-border/50 rounded-xl bg-card/5 flex justify-between items-center">
                    <div>
                      <span className="font-bold block">Software Engineer</span>
                      <span className="text-[10px] text-muted-foreground">Tech Sector</span>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px]">92% Match</Badge>
                  </div>
                  <div className="p-2 border border-border/50 rounded-xl bg-card/5 flex justify-between items-center">
                    <div>
                      <span className="font-bold block">Product Designer</span>
                      <span className="text-[10px] text-muted-foreground">Creative Sector</span>
                    </div>
                    <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-[9px]">85% Match</Badge>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Widget: Study Planner */}
            {visibleWidgets.planner && (
              <GlassCard className="p-5 border border-border space-y-3">
                <Badge variant="glass" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[9px] font-bold">PLANNER</Badge>
                <h3 className="text-sm font-bold text-foreground">Study Targets</h3>
                <form onSubmit={addStudyGoal} className="flex gap-2">
                  <input
                    type="text"
                    value={studyPlannerText}
                    onChange={(e) => setStudyPlannerText(e.target.value)}
                    placeholder="E.g. Revise Physics"
                    className="flex-1 h-8 rounded-lg border border-border bg-background px-2 text-xs text-foreground focus:outline-none"
                  />
                  <Button type="submit" size="sm" className="h-8 rounded-lg px-2"><Plus className="h-3.5 w-3.5" /></Button>
                </form>
                <ul className="text-[11px] text-muted-foreground space-y-2 mt-2">
                  {studyPlannerList.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 bg-card/10 p-2 rounded-lg border border-border/40 font-semibold">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            )}

            {/* Widget: Weekly Challenge */}
            {visibleWidgets.challenges && (
              <GlassCard className="p-5 border border-border space-y-3 col-span-1 md:col-span-2">
                <Badge variant="glass" className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[9px] font-bold">CHALLENGE</Badge>
                <div className="space-y-2">
                  {challenges.slice(0, 2).map((challenge) => (
                    <div key={challenge.id} className="flex items-center justify-between p-3 border border-border rounded-xl bg-card/10">
                      <div>
                        <span className="font-bold text-xs block text-foreground">{challenge.title}</span>
                        <span className="text-[10px] text-muted-foreground">{challenge.description}</span>
                      </div>
                      <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => handleChallengeCheck(challenge.id)} disabled={challenge.isCompleted}>
                        {challenge.isCompleted ? "Done" : "Complete"}
                      </Button>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </>
        )}

        {/* ========================================================
            COLLEGE STUDENT WIDGETS
           ======================================================== */}
        {activeView === "COLLEGE_STUDENT" && (
          <>
            {/* Widget: Internships */}
            {visibleWidgets.internships && (
              <GlassCard className="p-5 border border-border space-y-3">
                <Badge variant="glass" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] font-bold">OPPORTUNITIES</Badge>
                <h3 className="text-sm font-bold text-foreground">Recommended Internships</h3>
                <div className="space-y-2 text-xs">
                  <div className="p-2 border border-border/50 rounded-xl bg-card/5 flex justify-between items-center">
                    <div>
                      <span className="font-bold block">Frontend Developer</span>
                      <span className="text-[10px] text-muted-foreground">Stripe • Remote</span>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px]">92% Match</Badge>
                  </div>
                  <div className="p-2 border border-border/50 rounded-xl bg-card/5 flex justify-between items-center">
                    <div>
                      <span className="font-bold block">Product Management Intern</span>
                      <span className="text-[10px] text-muted-foreground">Google • Bengaluru</span>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px]">84% Match</Badge>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Widget: Projects */}
            {visibleWidgets.projects && (
              <GlassCard className="p-5 border border-border space-y-3">
                <Badge variant="glass" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[9px] font-bold">BUILD LOG</Badge>
                <h3 className="text-sm font-bold text-foreground">Active Build Projects</h3>
                <div className="space-y-2 text-xs">
                  {(memory.demographics.projects ?? [{ projectName: "Career GPS AI Twin", technologies: ["React", "Node.js", "Prisma"] }]).slice(0, 3).map((p: any, idx: number) => (
                    <div key={idx} className="p-2 border border-border/40 rounded-xl bg-card/10">
                      <span className="font-bold block text-foreground">{p.projectName}</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.technologies?.map((t: string) => <Badge key={t} variant="glass" className="text-[8px] lowercase">{t}</Badge>)}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Widget: Skills */}
            {visibleWidgets.skills && (
              <GlassCard className="p-5 border border-border space-y-3">
                <Badge variant="glass" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[9px] font-bold">SKILLS MATRIX</Badge>
                <h3 className="text-sm font-bold text-foreground">Verified Skill Proficiencies</h3>
                <div className="flex flex-wrap gap-1.5">
                  {Object.keys(memory.skills || {}).slice(0, 6).map((s) => (
                    <Badge key={s} variant="secondary" className="text-[9px]">{s}</Badge>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Widget: Resume / Vault */}
            {visibleWidgets.resume && (
              <GlassCard className="p-5 border border-border space-y-3">
                <Badge variant="glass" className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-[9px] font-bold">RESUME MATCH</Badge>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Primary Resume Sync</span>
                  <Badge className={hasResume ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}>
                    {hasResume ? "ACTIVE" : "PENDING"}
                  </Badge>
                </div>
                {hasResume ? (
                  <div className="p-3 border border-border/60 rounded-xl bg-primary/5 text-xs">
                    <span className="font-bold block">Resume Score: 84%</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5 block">Synced with Career Twin memory.</span>
                  </div>
                ) : (
                  <Link href="/vault">
                    <Button variant="outline" size="sm" className="w-full text-xs">Upload Resume</Button>
                  </Link>
                )}
              </GlassCard>
            )}

            {/* Widget: Placements Prep */}
            {visibleWidgets.placements && (
              <GlassCard className="p-5 border border-border space-y-3">
                <Badge variant="glass" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[9px] font-bold">PLACEMENTS PREP</Badge>
                <h3 className="text-sm font-bold text-foreground">Campus Preparation Checklist</h3>
                <ul className="text-xs text-muted-foreground space-y-2 font-semibold">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Resume Review completed</li>
                  <li className="flex items-center gap-2 text-amber-400"><div className="h-4 w-4 rounded-full border border-amber-500/30" /> Practice 10 System Design questions</li>
                  <li className="flex items-center gap-2"><div className="h-4 w-4 rounded-full border border-border" /> Complete 1 mock coding test</li>
                </ul>
              </GlassCard>
            )}

            {/* Widget: Job Readiness Index */}
            {visibleWidgets.readiness && (
              <GlassCard className="p-5 border border-border space-y-3">
                <Badge variant="glass" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[9px] font-bold">READINESS</Badge>
                <div className="text-center space-y-1">
                  <span className="text-3xl font-black text-white">{scores.jobReadiness}%</span>
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold">Job Readiness score</span>
                  <Progress value={scores.jobReadiness} variant="gradient" className="h-1.5 mt-2 bg-slate-800" />
                </div>
              </GlassCard>
            )}
          </>
        )}

        {/* ========================================================
            WORKING PROFESSIONAL WIDGETS
           ======================================================== */}
        {activeView === "PROFESSIONAL" && (
          <>
            {/* Widget: Current Salary */}
            {visibleWidgets.currentSalary && (
              <GlassCard className="p-5 border border-border space-y-1">
                <Badge variant="glass" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] font-bold block w-fit mb-2">CURRENT REMUNERATION</Badge>
                <span className="text-xs text-muted-foreground">Current Annual Salary</span>
                <p className="text-2xl font-black text-white font-mono">{memory.goals.currentSalary || "₹8,00,000"}</p>
              </GlassCard>
            )}

            {/* Widget: Expected Salary */}
            {visibleWidgets.expectedSalary && (
              <GlassCard className="p-5 border border-border space-y-1">
                <Badge variant="glass" className="bg-primary/10 text-primary border-primary/20 text-[9px] font-bold block w-fit mb-2">EXPECTED COMPENSATION</Badge>
                <span className="text-xs text-muted-foreground">Target Expected Salary</span>
                <p className="text-2xl font-black text-primary font-mono">{memory.goals.expectedSalary || "₹15,00,000"}</p>
              </GlassCard>
            )}

            {/* Widget: Promotion Prediction */}
            {visibleWidgets.promotion && (
              <GlassCard className="p-5 border border-border space-y-3">
                <Badge variant="glass" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[9px] font-bold">GROWTH RADAR</Badge>
                <h3 className="text-sm font-bold text-foreground">Promotion Probability</h3>
                <div className="flex items-center justify-between border-t border-border/40 pt-2 text-xs">
                  <span>SWE II / Senior PM</span>
                  <span className="text-emerald-400 font-bold">78% Likelihood</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">
                  Expected window: 6-12 months. Requires 2 key certified skill upgrades.
                </p>
              </GlassCard>
            )}

            {/* Widget: ATS Scorecard */}
            {visibleWidgets.atsScore && (
              <GlassCard className="p-5 border border-border space-y-3 col-span-1 md:col-span-2 lg:col-span-1">
                <Badge variant="glass" className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-[9px] font-bold">ATS MATCH RATE</Badge>
                <div className="flex items-center gap-4">
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-violet-500 text-lg font-black text-white">
                    {hasResume ? "84%" : "N/A"}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">ATS Target Match</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5 font-semibold">{hasResume ? "Optimize keywords for match boost" : "Upload resume to test"}</p>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Widget: Skill Gap */}
            {visibleWidgets.skillGap && (
              <GlassCard className="p-5 border border-border space-y-3">
                <Badge variant="glass" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[9px] font-bold">SKILL GAP ANALYSIS</Badge>
                <h3 className="text-sm font-bold text-foreground">Missing Core Keywords</h3>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Docker", "CI/CD Pipeline", "Kubernetes", "System Design"].map((kw) => (
                    <Badge key={kw} className="bg-amber-500/10 border-amber-500/20 text-amber-300 text-[9px] font-mono">
                      + {kw}
                    </Badge>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Widget: Interview Readiness */}
            {visibleWidgets.interview && (
              <GlassCard className="p-5 border border-border space-y-3">
                <Badge variant="glass" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[9px] font-bold">INTERVIEW READY</Badge>
                <h3 className="text-sm font-bold text-foreground">Mock Interview Status</h3>
                <div className="space-y-2 text-xs font-semibold">
                  <div className="flex justify-between"><span>Coding / DS & Algos</span> <span className="font-bold text-foreground">75% Ready</span></div>
                  <div className="flex justify-between"><span>System Design</span> <span className="font-bold text-amber-400">45% (Needs work)</span></div>
                  <div className="flex justify-between"><span>Behavioral Rounds</span> <span className="font-bold text-emerald-400">90% Excellent</span></div>
                </div>
              </GlassCard>
            )}

            {/* Widget: Career Upgrade Score */}
            {visibleWidgets.upgrade && (
              <GlassCard className="p-5 border border-border space-y-3">
                <Badge variant="glass" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[9px] font-bold">GROWTH INDEX</Badge>
                <div className="text-center space-y-1">
                  <span className="text-3xl font-black text-white">{scores.careerUpgrade}/100</span>
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold">Career Upgrade Score</span>
                  <Progress value={scores.careerUpgrade} variant="gradient" className="h-1.5 mt-2 bg-slate-800" />
                </div>
              </GlassCard>
            )}
          </>
        )}

        {/* ========================================================
            CAREER SWITCHER WIDGETS
           ======================================================= */}
        {activeView === "CAREER_SWITCHER" && (
          <>
            {/* Widget: Switch Readiness Index */}
            {visibleWidgets.switchReadiness && (
              <GlassCard className="p-5 border border-border space-y-3">
                <Badge variant="glass" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] font-bold">SWITCH READINESS</Badge>
                <div className="text-center space-y-1">
                  <span className="text-3xl font-black text-white">62%</span>
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold">Transition Readiness Index</span>
                  <Progress value={62} variant="gradient" className="h-1.5 mt-2 bg-slate-800" />
                </div>
              </GlassCard>
            )}

            {/* Widget: Transferable Skills */}
            {visibleWidgets.transferable && (
              <GlassCard className="p-5 border border-border space-y-3">
                <Badge variant="glass" className="bg-primary/10 text-primary border-primary/20 text-[9px] font-bold">TRANSFERABLE SKILLS</Badge>
                <h3 className="text-sm font-bold text-foreground">Matched Transferable Skills</h3>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Product Strategy", "Project Management", "Data Analytics", "Public Speaking"].map((s) => (
                    <Badge key={s} variant="secondary" className="text-[9px] bg-primary/5 text-primary border-primary/20">{s}</Badge>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Widget: Salary Difference */}
            {visibleWidgets.salaryDiff && (
              <GlassCard className="p-5 border border-border space-y-2">
                <Badge variant="glass" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[9px] font-bold">COMPENSATION DELTA</Badge>
                <span className="text-xs text-muted-foreground">Estimated Salary Upgrade</span>
                <p className="text-2xl font-black text-white font-mono">+ ₹4.5 LPA</p>
                <span className="text-[10px] text-muted-foreground mt-0.5 block font-semibold">Estimated change based on target PM role.</span>
              </GlassCard>
            )}

            {/* Widget: Recommended Certifications */}
            {visibleWidgets.certs && (
              <GlassCard className="p-5 border border-border space-y-3">
                <Badge variant="glass" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[9px] font-bold">CREDENTIALS SUGGESTIONS</Badge>
                <h3 className="text-sm font-bold text-foreground">Certifications for Target Domain</h3>
                <ul className="text-xs text-muted-foreground space-y-2 font-semibold">
                  <li className="flex justify-between border-b border-border/40 pb-1"><span>AWS Cloud Practitioner</span> <span className="text-emerald-400 font-bold">High Impact</span></li>
                  <li className="flex justify-between border-b border-border/40 pb-1"><span>Scrum Alliance CSM</span> <span className="text-primary font-bold">Medium</span></li>
                </ul>
              </GlassCard>
            )}

            {/* Widget: Weekly Switch Missions */}
            {visibleWidgets.missions && (
              <GlassCard className="p-5 border border-border space-y-3 col-span-1 md:col-span-2">
                <Badge variant="glass" className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[9px] font-bold">TRANSITION MISSION</Badge>
                <div className="space-y-2 text-xs">
                  <div className="p-3 border border-border rounded-xl bg-card/10 flex justify-between items-center">
                    <div>
                      <span className="font-bold block text-foreground">Mission 1: Complete SQL course Module 1</span>
                      <span className="text-[10px] text-muted-foreground">Matches 80% of target Business Analyst profiles.</span>
                    </div>
                    <Badge className="bg-amber-500/10 text-amber-400">IN PROGRESS</Badge>
                  </div>
                </div>
              </GlassCard>
            )}
          </>
        )}

        {/* ========================================================
            PARENT DASHBOARD WIDGETS
           ======================================================== */}
        {activeView === "PARENT" && (
          <>
            {/* Widget: Child Progress */}
            {visibleWidgets.childProgress && (
              <GlassCard className="p-5 border border-border space-y-3">
                <Badge variant="glass" className="bg-primary/10 text-primary border-primary/20 text-[9px] font-bold">CHILD PROGRESS</Badge>
                <h3 className="text-sm font-bold text-foreground">Sarah&apos;s Milestones</h3>
                <ul className="text-xs text-muted-foreground space-y-2 font-semibold">
                  <li className="flex justify-between border-b border-border/40 pb-1"><span>Career DNA Assessment</span> <span className="text-emerald-400 font-bold">Completed</span></li>
                  <li className="flex justify-between border-b border-border/40 pb-1"><span>Computer Sci. compatible</span> <span className="text-primary font-bold">85% Match</span></li>
                  <li className="flex justify-between"><span>Study Goals Completed</span> <span className="text-foreground font-bold">3/4 This Week</span></li>
                </ul>
              </GlassCard>
            )}

            {/* Widget: Career Confidence */}
            {visibleWidgets.confidence && (
              <GlassCard className="p-5 border border-border space-y-3">
                <Badge variant="glass" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] font-bold">CONFIDENCE INDEX</Badge>
                <div className="text-center space-y-1">
                  <span className="text-3xl font-black text-white">85%</span>
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold">Career Choice Confidence</span>
                  <Progress value={85} variant="gradient" className="h-1.5 mt-2 bg-slate-800" />
                </div>
              </GlassCard>
            )}

            {/* Widget: College & Education ROI */}
            {visibleWidgets.eduRoi && (
              <GlassCard className="p-5 border border-border space-y-3 col-span-1 md:col-span-2">
                <Badge variant="glass" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[9px] font-bold">INVESTMENT RETURN</Badge>
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-foreground">Interactive Return-On-Investment Calculator</h4>
                  <div className="grid gap-2 sm:grid-cols-3 text-xs text-muted-foreground">
                    <div>
                      <span className="block text-[10px]">Tuition (Annual)</span>
                      <input type="number" value={roiTuition} onChange={(e) => setRoiTuition(Number(e.target.value))} className="w-full bg-accent/40 rounded-lg p-1.5 border border-border mt-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-semibold" />
                    </div>
                    <div>
                      <span className="block text-[10px]">Proj. Salary (LPA)</span>
                      <input type="number" value={roiSalary} onChange={(e) => setRoiSalary(Number(e.target.value))} className="w-full bg-accent/40 rounded-lg p-1.5 border border-border mt-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-semibold" />
                    </div>
                    <div>
                      <span className="block text-[10px]">Course Duration</span>
                      <input type="number" value={roiYears} onChange={(e) => setRoiYears(Number(e.target.value))} className="w-full bg-accent/40 rounded-lg p-1.5 border border-border mt-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-semibold" />
                    </div>
                  </div>
                  <div className="bg-primary/5 p-2 rounded-xl border border-primary/10 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Break-even Period</span>
                      <span className="font-bold text-white">
                        {Math.max(0.5, ((roiTuition * roiYears) / (roiSalary * 0.7))).toFixed(1)} Years
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Total Course Cost</span>
                      <span className="font-bold text-white">₹{(roiTuition * roiYears / 100000).toFixed(1)} Lakhs</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Widget: Fees & Scholarships */}
            {visibleWidgets.fees && (
              <GlassCard className="p-5 border border-border space-y-3">
                <Badge variant="glass" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[9px] font-bold">FINANCES</Badge>
                <h3 className="text-sm font-bold text-foreground">Scholarships & Grants Available</h3>
                <ul className="text-xs text-muted-foreground space-y-1.5 font-semibold">
                  <li className="flex justify-between border-b border-border/40 pb-1"><span>STEM Diversity Scholarship</span> <span className="text-emerald-400 font-bold">₹1.5L Grant</span></li>
                  <li className="flex justify-between"><span>Olympiad Merit Fee Waiver</span> <span className="text-primary font-bold">50% Waiver</span></li>
                </ul>
              </GlassCard>
            )}

            {/* Widget: Future Salary */}
            {visibleWidgets.futureSalary && (
              <GlassCard className="p-5 border border-border space-y-2">
                <Badge variant="glass" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[9px] font-bold">PROJECTIONS</Badge>
                <span className="text-xs text-muted-foreground">Estimated Future Entry Salary</span>
                <p className="text-2xl font-black text-white font-mono">₹10 - 14 LPA</p>
                <span className="text-[10px] text-muted-foreground mt-0.5 block font-semibold">Estimated for Software Engineers in Metros (2027)</span>
              </GlassCard>
            )}
          </>
        )}

        {/* ========================================================
            TAB 4: LEARNING HUB
           ======================================================== */}
        {activeView === "learning" && (
          <>
            {/* Learning Roadmaps */}
            <GlassCard className="p-5 border border-border space-y-3">
              <Badge variant="glass" className="bg-primary/10 text-primary border-primary/20 text-[9px] font-bold">CAREER ROADMAP</Badge>
              <h3 className="text-sm font-bold text-foreground">Your Course Roadmap</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Personalized 4-year learning path based on your target domains.
              </p>
              <Link href="/roadmap">
                <Button variant="outline" size="sm" className="w-full text-xs">View Full Roadmap</Button>
              </Link>
            </GlassCard>

            {/* Certifications Progress */}
            <GlassCard className="p-5 border border-border space-y-3">
              <Badge variant="glass" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[9px] font-bold">CERTIFICATIONS</Badge>
              <h3 className="text-sm font-bold text-foreground">Course Certifications</h3>
              <div className="space-y-2 text-xs">
                {(memory.demographics.certifications ?? ["AWS Practitioner", "Python Foundations"]).slice(0, 3).map((c: string) => (
                  <div key={c} className="p-2 border border-border/40 rounded-xl bg-card/10 flex justify-between items-center">
                    <span className="font-semibold block text-foreground">{c}</span>
                    <Badge className="bg-emerald-500/10 text-emerald-400">VERIFIED</Badge>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Skills & Gap Analysis */}
            <GlassCard className="p-5 border border-border space-y-3">
              <Badge variant="glass" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[9px] font-bold">SKILLS HUB</Badge>
              <h3 className="text-sm font-bold text-foreground">Key Skill Gap</h3>
              <div className="space-y-2 text-xs font-semibold">
                <p className="text-muted-foreground">Add these to match 90% of target vacancies:</p>
                <div className="flex flex-wrap gap-1.5">
                  {["SQL Join", "Docker Containers", "CI/CD Deployment"].map((s) => (
                    <Badge key={s} className="bg-amber-500/10 border-amber-500/20 text-amber-300 text-[9px]">{s}</Badge>
                  ))}
                </div>
              </div>
            </GlassCard>
          </>
        )}

        {/* ========================================================
            TAB 5: FINANCE & CALCULATORS
           ======================================================== */}
        {activeView === "finance" && (
          <>
            {/* Compensation gap */}
            <GlassCard className="p-5 border border-border space-y-2">
              <Badge variant="glass" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] font-bold">COMPENSATION BREAKDOWN</Badge>
              <div className="grid grid-cols-2 gap-2 text-center text-xs pt-2">
                <div className="bg-card/10 p-2.5 rounded-xl border border-border/40">
                  <span className="text-muted-foreground block text-[10px]">CURRENT SALARY</span>
                  <span className="font-bold text-white font-mono">{memory.goals.currentSalary || "₹8,00,000"}</span>
                </div>
                <div className="bg-card/10 p-2.5 rounded-xl border border-border/40">
                  <span className="text-muted-foreground block text-[10px]">TARGET EXPECTED</span>
                  <span className="font-bold text-primary font-mono">{memory.goals.expectedSalary || "₹15,00,000"}</span>
                </div>
              </div>
            </GlassCard>

            {/* Education investment calculator */}
            <GlassCard className="p-5 border border-border space-y-3 col-span-1 md:col-span-2">
              <Badge variant="glass" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[9px] font-bold">ROI PROJECTOR</Badge>
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-foreground">Interactive Cost vs Earnings Projector</h4>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase">Tuition Fee (Annual)</label>
                    <input type="number" value={roiTuition} onChange={(e) => setRoiTuition(Number(e.target.value))} className="w-full bg-accent/40 rounded-lg p-1.5 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary mt-1 font-semibold" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase">Target Salary (LPA)</label>
                    <input type="number" value={roiSalary} onChange={(e) => setRoiSalary(Number(e.target.value))} className="w-full bg-accent/40 rounded-lg p-1.5 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary mt-1 font-semibold" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase">Course Years</label>
                    <input type="number" value={roiYears} onChange={(e) => setRoiYears(Number(e.target.value))} className="w-full bg-accent/40 rounded-lg p-1.5 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary mt-1 font-semibold" />
                  </div>
                </div>
                <div className="bg-primary/5 p-3 rounded-xl border border-primary/10 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Break-even Period</span>
                    <span className="font-bold text-white">
                      {Math.max(0.5, ((roiTuition * roiYears) / (roiSalary * 0.7))).toFixed(1)} Years
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-bold text-primary">ROI Profit Factor (5 Year)</span>
                    <span className="font-bold text-emerald-400">
                      {((roiSalary * 5) / (roiTuition * roiYears)).toFixed(1)}x Return
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </>
        )}

        {/* ========================================================
            TAB 6: AI TWIN INSIGHTS
           ======================================================== */}
        {activeView === "ai" && (
          <>
            {/* Career Twin calibration status */}
            <GlassCard className="p-5 border border-border space-y-3">
              <Badge variant="glass" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[9px] font-bold">TWIN METRICS</Badge>
              <h3 className="text-sm font-bold text-foreground">AI Career Twin Calibration</h3>
              <div className="space-y-2 text-xs font-semibold">
                <div className="flex justify-between"><span>Twin Confidence Score:</span> <span className="font-bold text-white">88%</span></div>
                <div className="flex justify-between"><span>Profile Completion Rate:</span> <span className="font-bold text-white">{Math.round(memory.profileCompleteness || 60)}%</span></div>
                <div className="flex justify-between"><span>Resume Verification Index:</span> <span className="font-bold text-emerald-400">{hasResume ? "94% Verified" : "0% (Not Uploaded)"}</span></div>
                <div className="flex justify-between"><span>Skill Verification Index:</span> <span className="font-bold text-emerald-400">80% Checked</span></div>
              </div>
            </GlassCard>

            {/* AI Recommendation Confidence */}
            <GlassCard className="p-5 border border-border space-y-3">
              <Badge variant="glass" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[9px] font-bold">RECS ACCURACY</Badge>
              <h3 className="text-sm font-bold text-foreground">Recommendation Accuracy</h3>
              <div className="flex items-center gap-4">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-purple-500 text-lg font-black text-white">
                  92%
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Accurate Tailoring</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-semibold">High calibration based on verified history</p>
                </div>
              </div>
            </GlassCard>

            {/* Coach Logs CTA */}
            <GlassCard className="p-5 border border-border space-y-3">
              <Badge variant="glass" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[9px] font-bold">AI COACH</Badge>
              <h3 className="text-sm font-bold text-foreground">Personalized AI Coach CTA</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Connect directly with your AI Mentor to address missing skill gaps.
              </p>
              <Link href="/mentor">
                <Button variant="gradient" size="sm" className="w-full text-xs">Chat with Mentor</Button>
              </Link>
            </GlassCard>
          </>
        )}

      </div>

      {/* ─── CHALLENGES & DECISION TIMELINE ROWS ─── */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-6">
          
          {/* Weekly Challenges list */}
          <AnimatedContainer animation="fadeUp" delay={0.3}>
            <GlassCard className="border border-border/80 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Your Weekly Challenges</h3>
                <Badge variant="glass" className="text-[10px]">Monday Reset</Badge>
              </div>
              <div className="space-y-3">
                {challenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all ${
                      challenge.isCompleted
                        ? "border-emerald-500/20 bg-emerald-500/[0.02] text-muted-foreground"
                        : "border-border hover:border-primary/30 bg-card/20"
                    }`}
                  >
                    <button
                      onClick={() => !challenge.isCompleted && handleChallengeCheck(challenge.id)}
                      disabled={challenge.isCompleted || completingIds[challenge.id]}
                      className="mt-0.5 flex-shrink-0 focus:outline-none"
                    >
                      {challenge.isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-500/10" />
                      ) : completingIds[challenge.id] ? (
                        <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border border-muted-foreground/50 hover:border-primary transition-colors" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold leading-tight ${challenge.isCompleted && "line-through opacity-60"}`}>
                        {challenge.title}
                      </p>
                      {challenge.description && (
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {challenge.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] font-bold text-amber-500 font-mono">+{challenge.xpReward} XP</span>
                        <span className="text-[10px] font-bold text-indigo-400 font-mono">+{challenge.scoreImpact} Upgrade Pts</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </AnimatedContainer>

          {/* Evolution Timeline */}
          <AnimatedContainer animation="fadeUp" delay={0.32}>
            <GlassCard className="border border-border/80 p-5">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Route className="h-5 w-5 text-primary" />
                AI Pathway Evolution Timeline
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                Understand how your actions, questionnaire scores, and portfolio certificates change the career profiles recommended by the AI.
              </p>
              
              <div className="relative pl-6 border-l border-border space-y-6 ml-2">
                {timeline.map((event: any, idx: number) => (
                  <div key={event.id || idx} className="relative">
                    <div className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-primary bg-background flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold font-mono text-primary uppercase block tracking-wider">{event.month}</span>
                      <p className="text-sm font-semibold text-foreground mt-0.5 leading-snug">{event.activity}</p>
                      <span className="text-xs text-muted-foreground bg-accent/20 border border-border px-2 py-0.5 rounded-md inline-block mt-1.5 font-medium">
                        Result: {event.impact}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </AnimatedContainer>

        </div>

        <div className="lg:col-span-5 space-y-6">
          {/* Accountability partners */}
          <AnimatedContainer animation="fadeUp" delay={0.34}>
            <GlassCard className="border border-border/80 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Users className="h-4.5 w-4.5 text-primary" />
                  Accountability Lounge
                </h3>
                <Button variant="ghost" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => setIsInviteOpen(true)} className="h-7 text-[10px] px-2">
                  Invite Partner
                </Button>
              </div>

              {partners.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-border rounded-2xl bg-card/10">
                  <p className="text-xs text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
                    Invite friends or study partners to compare streaks and goals!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {partners.map((partner) => (
                    <div key={partner.id} className="flex items-center justify-between p-3 border border-border/80 rounded-2xl bg-card/10">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold">{partner.name}</span>
                          <Badge className="text-[9px] scale-90 px-1 py-0.5 bg-primary/10 text-primary border-primary/20 uppercase tracking-widest">{partner.relation}</Badge>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">{partner.email}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] font-bold block text-emerald-400 font-mono">{partner.streak}d Streak</span>
                          <span className="text-[9px] text-muted-foreground font-mono">{partner.xp} XP</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={nudgingIds[partner.id]}
                          onClick={() => handleNudge(partner.id, partner.name)}
                          className="h-8 w-8 p-0 rounded-lg"
                        >
                          {nudgingIds[partner.id] ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="h-3.5 w-3.5 text-primary" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </AnimatedContainer>

          {/* Quick recommendations */}
          <AnimatedContainer animation="fadeUp" delay={0.36}>
            <GlassCard className="border border-amber-500/20 bg-amber-500/[0.01] p-5">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Smart AI Recommendations</h4>
              <ul className="text-xs text-muted-foreground space-y-3.5">
                <li>
                  <strong>What should I do today?</strong>
                  <p className="text-foreground text-[11px] mt-0.5">Solve the coding weekly challenges to lock in your React skills.</p>
                </li>
                <li>
                  <strong>What should I learn this week?</strong>
                  <p className="text-foreground text-[11px] mt-0.5">Take a 15-minute SQL JOIN tutorial. Highest ROI for matching local PM vacancies.</p>
                </li>
                <li>
                  <strong>What is blocking my growth?</strong>
                  <p className="text-foreground text-[11px] mt-0.5">Missing cloud deployment certifications. AWS Solutions Architect suggested.</p>
                </li>
              </ul>
            </GlassCard>
          </AnimatedContainer>
        </div>
      </div>

      {/* ─── DIALOGS & CUSTOMIZER WIDGETS SLIDE-OVER ─── */}
      <AnimatePresence>
        {showCustomizer && (
          <div className="fixed inset-0 z-50 flex items-center justify-end p-4 bg-black/70 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setShowCustomizer(false)} />
            
            <motion.div
              initial={{ x: 200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 200, opacity: 0 }}
              className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl z-10 h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-border pb-3 mb-4">
                <h3 className="text-sm font-bold flex items-center gap-1.5"><Settings className="h-4 w-4" /> Customize Dashboard Widgets</h3>
                <button onClick={() => setShowCustomizer(false)} className="p-1 rounded-lg text-muted-foreground hover:bg-accent"><X className="h-4.5 w-4.5" /></button>
              </div>

              <div className="space-y-4 text-xs">
                <p className="text-muted-foreground leading-relaxed">
                  Toggle widget cards below to customize your AI Workspace layout.
                </p>

                <div className="space-y-2 border-t border-border pt-4">
                  <span className="font-extrabold uppercase tracking-wide text-primary text-[10px] block">School Student Widgets</span>
                  {Object.keys(visibleWidgets).slice(0, 7).map((key) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer text-foreground font-semibold">
                      <input type="checkbox" checked={visibleWidgets[key]} onChange={() => toggleWidget(key)} className="rounded text-primary h-4 w-4 bg-background" />
                      {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                    </label>
                  ))}
                </div>

                <div className="space-y-2 border-t border-border pt-4">
                  <span className="font-extrabold uppercase tracking-wide text-emerald-400 text-[10px] block">College Student Widgets</span>
                  {Object.keys(visibleWidgets).slice(7, 13).map((key) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer text-foreground font-semibold">
                      <input type="checkbox" checked={visibleWidgets[key]} onChange={() => toggleWidget(key)} className="rounded text-primary h-4 w-4 bg-background" />
                      {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                    </label>
                  ))}
                </div>

                <div className="space-y-2 border-t border-border pt-4">
                  <span className="font-extrabold uppercase tracking-wide text-indigo-400 text-[10px] block">Professional & Switcher Widgets</span>
                  {Object.keys(visibleWidgets).slice(13).map((key) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer text-foreground font-semibold">
                      <input type="checkbox" checked={visibleWidgets[key]} onChange={() => toggleWidget(key)} className="rounded text-primary h-4 w-4 bg-background" />
                      {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Accountability Invite Dialog */}
      <AnimatePresence>
        {isInviteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div className="absolute inset-0" onClick={() => setIsInviteOpen(false)} />
            <motion.div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl z-10 text-foreground">
              <h3 className="text-lg font-bold mb-2">Invite Accountability Partner</h3>
              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Partner Name</label>
                  <input type="text" required value={inviteForm.name} onChange={(e) => setInviteForm((prev) => ({ ...prev, name: e.target.value }))} className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none" placeholder="Sarah" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Partner Email</label>
                  <input type="email" required value={inviteForm.email} onChange={(e) => setInviteForm((prev) => ({ ...prev, email: e.target.value }))} className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none" placeholder="sarah@example.com" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Relationship</label>
                  <select value={inviteForm.relationship} onChange={(e) => setInviteForm((prev) => ({ ...prev, relationship: e.target.value }))} className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none">
                    <option value="FRIEND">Friend / Classmate</option>
                    <option value="PARENT">Parent / Guardian</option>
                    <option value="SIBLING">Sibling</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={isSubmittingInvite} variant="gradient" fullWidth>Send Invite</Button>
                  <Button type="button" onClick={() => setIsInviteOpen(false)} variant="outline">Cancel</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPersonaPicker && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <motion.div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
              <h3 className="text-lg font-bold mb-2">Save default mode?</h3>
              <p className="text-sm text-muted-foreground mb-6">Set {activePersona.replace("_", " ")} as default dashboard?</p>
              <div className="flex gap-3">
                <Button variant="outline" fullWidth onClick={() => { setActivePersona(effectivePersona as PersonaType); setShowPersonaPicker(false); }}>Exploring</Button>
                <Button variant="gradient" fullWidth onClick={handleSavePersona}>Save default</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
