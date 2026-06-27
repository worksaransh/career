"use client";

import React, { useState } from "react";
import {
  Brain,
  Route,
  GraduationCap,
  Building2,
  TrendingUp,
  Award,
  Target,
  Sparkles,
  ArrowRight,
  Users,
  CheckCircle2,
  Plus,
  Send,
  Loader2,
  Share2,
  FolderOpen,
  QrCode,
  Calendar,
  MessageSquare,
  HelpCircle,
  Trophy,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardEngagement } from "@/components/dashboard/dashboard-engagement";
import { ConfidenceScoreCard } from "@/components/intelligence/confidence-score";
import { ShareBrandingModal } from "@/components/shared/share-branding";
import { DashboardModeSwitcher, type PersonaType } from "@/components/dashboard/persona/dashboard-mode-switcher";
import { PersonaRecommendationCards } from "@/components/dashboard/persona/persona-recommendation-cards";
import { ProfessionalDashboardContent } from "@/components/dashboard/persona/professional-dashboard";
import { CareerSwitcherDashboardContent } from "@/components/dashboard/persona/career-switcher-dashboard";
import { CollegeStudentDashboardContent } from "@/components/dashboard/persona/college-student-dashboard";
import { ParentDashboardRedirect } from "@/components/dashboard/persona/parent-dashboard-redirect";

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
}: DashboardContentProps) {
  // All hooks must be before any conditional returns
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

  // Persona-aware state
  const effectivePersona = (user as any).primaryPersona ?? "STUDENT";
  const [activePersona, setActivePersona] = useState<PersonaType>(effectivePersona as PersonaType);
  const [showPersonaPicker, setShowPersonaPicker] = useState(false);

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
    } catch {}
  };

  // Non-student personas get their own dashboard
  if (activePersona === "PROFESSIONAL") {
    return <ProfessionalDashboardContent user={user} latestResult={latestResult} memory={memory} whatsappLink={whatsappLink} telegramLink={telegramLink} />;
  }
  if (activePersona === "CAREER_SWITCHER") {
    return <CareerSwitcherDashboardContent user={user} latestResult={latestResult} memory={memory} />;
  }
  if (activePersona === "PARENT") {
    return <ParentDashboardRedirect />;
  }
  if (activePersona === "COLLEGE_STUDENT") {
    return <CollegeStudentDashboardContent user={user} latestResult={latestResult} recommendedCareersCount={recommendedCareersCount} savedCount={savedCount} memory={memory} initialWeeklyChallenges={initialWeeklyChallenges} initialTimelineEvents={initialTimelineEvents} initialPartners={initialPartners} whatsappLink={whatsappLink} telegramLink={telegramLink} />;
  }

  // Compute Career Score dynamically from latest assessment result
  let careerScore = "--";
  let careerDesc = "Complete assessments to unlock";
  if (latestResult && latestResult.scores) {
    const scoreVals = Object.values(latestResult.scores) as number[];
    if (scoreVals.length > 0) {
      const avg = Math.round(scoreVals.reduce((sum, v) => sum + v, 0) / scoreVals.length);
      careerScore = `${avg}`;
      careerDesc = "Interest compatibility score";
    }
  }

  const completeness = latestResult ? 63 : user.profileCompleteness;

  const widgets = [
    {
      title: "Career Match Score",
      value: careerScore,
      icon: Brain,
      color: "from-violet-500 to-purple-600",
      href: "/assessments",
      description: careerDesc,
    },
    {
      title: "Profile Completeness",
      value: `${completeness}%`,
      icon: Target,
      color: "from-blue-500 to-cyan-600",
      href: "/profile",
      description: "Complete your profile",
      progress: completeness,
    },
    {
      title: "Recommended Careers",
      value: latestResult ? `${recommendedCareersCount ?? 0}` : "0",
      icon: TrendingUp,
      color: "from-emerald-500 to-teal-600",
      href: "/careers",
      description: latestResult ? "Personalized matches" : "Unlock career matches",
    },
    {
      title: "Saved Items",
      value: `${savedCount ?? 0}`,
      icon: Building2,
      color: "from-orange-500 to-red-600",
      href: "/saved",
      description: "Manage your saved items",
    },
  ];

  // Challenge Complete Handler
  const handleChallengeCheck = async (id: string) => {
    if (completingIds[id]) return;
    setCompletingIds((prev) => ({ ...prev, [id]: true }));
    const toastId = toast.loading("Recording challenge completion...");
    try {
      const res = await completeWeeklyChallenge(id);
      if (res.success) {
        toast.success("Challenge completed! XP and scores boosted! 🚀", { id: toastId });
        
        // Update local state
        setChallenges((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isCompleted: true, completedAt: new Date() } : c))
        );
        // Boost score state visually
        setScores((prev) => ({
          ...prev,
          careerUpgrade: Math.min(100, prev.careerUpgrade + 3),
        }));
      } else {
        toast.error(res.message || "Failed to complete challenge", { id: toastId });
      }
    } catch (e: any) {
      toast.error(e.message || "Something went wrong", { id: toastId });
    } finally {
      setCompletingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Accountability Invite Submit Handler
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
        
        // Refresh partners list locally
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

  // Nudge Partner Handler
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

  return (
    <div className="space-y-6 text-foreground pb-20">
      
      {/* Persona Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">
            {activePersona === "STUDENT" || activePersona === "GRADUATE" ? "Your career journey overview" :
             activePersona === "COLLEGE_STUDENT" ? "Build skills, find internships & jobs" :
             activePersona === "PROFESSIONAL" ? "Track your career growth" :
             activePersona === "PARENT" ? "Plan your child's future" :
             activePersona === "CAREER_SWITCHER" ? "Plan your career transition" :
             "Your career journey overview"}
          </p>
        </div>
        <DashboardModeSwitcher currentPersona={activePersona} onSwitch={handlePersonaSwitch} compact />
      </div>

      {/* CORE ASSESSMENT METRICS */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {widgets.map((widget, index) => {
          const Icon = widget.icon;
          return (
            <AnimatedContainer key={widget.title} animation="fadeUp" delay={index * 0.05}>
              <Link href={widget.href}>
                <Card variant="elevated" className="h-full group cursor-pointer border border-border/80">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {widget.title}
                    </CardTitle>
                    <div className={`rounded-xl bg-gradient-to-br ${widget.color} p-2 text-white`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{widget.value}</div>
                    {"progress" in widget && widget.progress !== undefined && (
                      <Progress value={widget.progress} variant="gradient" className="mt-2" />
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">{widget.description}</p>
                  </CardContent>
                </Card>
              </Link>
            </AnimatedContainer>
          );
        })}
      </div>

      {/* ─── NEW WIDGETS ROW: DYNAMIC GROWTH SCORES ─── */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Career Upgrade Score */}
        <AnimatedContainer animation="fadeUp" delay={0.1}>
          <GlassCard className="relative overflow-hidden border border-indigo-500/20 bg-gradient-to-b from-indigo-500/[0.02] to-indigo-500/[0.08] p-5 h-full">
            <div className="absolute top-2 right-2">
              <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10 font-mono text-[9px]">LIVE SCORE</Badge>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Trophy className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-indigo-300">Career Upgrade Score</h3>
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-4xl font-extrabold tracking-tight text-white">{scores.careerUpgrade}</span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
            <Progress value={scores.careerUpgrade} variant="gradient" className="h-2 mt-3 bg-slate-800" />
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              Based on verified skills, portfolio uploads, and streak consistency. Complete challenges to boost this score.
            </p>
          </GlassCard>
        </AnimatedContainer>

        {/* Job Readiness Score */}
        <AnimatedContainer animation="fadeUp" delay={0.15}>
          <GlassCard className="relative overflow-hidden border border-emerald-500/20 bg-gradient-to-b from-emerald-500/[0.02] to-emerald-500/[0.08] p-5 h-full">
            <div className="absolute top-2 right-2">
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-mono text-[9px]">EMPLOYABLE</Badge>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-emerald-300">Job Readiness Score</h3>
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-4xl font-extrabold tracking-tight text-white">{scores.jobReadiness}</span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
            <Progress value={scores.jobReadiness} variant="gradient" className="h-2 mt-3 bg-slate-800" />
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              Heuristic compatibility index calculated from verified credentials, portfolio proofs, and assessment profiles.
            </p>
          </GlassCard>
        </AnimatedContainer>

        {/* AI Portfolio Strength */}
        <AnimatedContainer animation="fadeUp" delay={0.2}>
          <GlassCard className="relative overflow-hidden border border-purple-500/20 bg-gradient-to-b from-purple-500/[0.02] to-purple-500/[0.08] p-5 h-full">
            <div className="absolute top-2 right-2">
              <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10 font-mono text-[9px]">ASSET SCORE</Badge>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <FolderOpen className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-purple-300">AI Portfolio Strength</h3>
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-4xl font-extrabold tracking-tight text-white">{scores.portfolio}</span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
            <Progress value={scores.portfolio} variant="gradient" className="h-2 mt-3 bg-slate-800" />
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              Measures the optimization of your Resume, GitHub connection, CV, and certifications stored in the Vault.
            </p>
          </GlassCard>
        </AnimatedContainer>
      </div>

      {/* COMMUNITY CHANNELS BANNER & REFLECTION ALERT */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* WhatsApp & Telegram Community Join */}
        <AnimatedContainer animation="fadeUp" delay={0.22}>
          <GlassCard className="border border-border/80 p-5 bg-card/40 flex flex-col justify-between h-full">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="glass" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold uppercase tracking-wider text-[10px]">Community Channels</Badge>
              </div>
              <h3 className="text-lg font-bold">Join the Career Growth Network</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connect directly with peer study groups and career coaches on WhatsApp & Telegram. Recieve weekly micro challenges, hiring news alerts, and direct AI tips.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[150px]">
                <Button variant="gradient" fullWidth leftIcon={<MessageSquare className="h-4 w-4" />}>
                  Join WhatsApp
                </Button>
              </a>
              <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[150px]">
                <Button variant="outline" fullWidth leftIcon={<Send className="h-4 w-4" />}>
                  Join Telegram
                </Button>
              </a>
            </div>
          </GlassCard>
        </AnimatedContainer>

        {/* Weekly Reflection Alert Banner */}
        <AnimatedContainer animation="fadeUp" delay={0.24}>
          <GlassCard className="border border-indigo-500/25 p-5 bg-indigo-500/[0.03] flex flex-col justify-between h-full relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-indigo-500/10 blur-xl" />
            <div className="space-y-2 relative z-10">
              <div className="flex items-center gap-2">
                <Badge variant="glass" className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 font-bold uppercase tracking-wider text-[10px]">Weekly Review</Badge>
              </div>
              <h3 className="text-lg font-bold">7-Day Reflection due</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Sync your Career Twin with what you learned and achieved this week. Answering updates your memory store, prompts fresh recommendations, and boosts your upgrade score.
              </p>
            </div>
            <div className="mt-4 relative z-10">
              <Link href="/reflection">
                <Button variant="gradient" fullWidth rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Start Reflection Wizard
                </Button>
              </Link>
            </div>
          </GlassCard>
        </AnimatedContainer>
      </div>

      {/* Engagement Hub (Smart Question / Streaks) */}
      <AnimatedContainer animation="fadeUp" delay={0.26}>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight">Daily Habit Hub</h2>
            <Badge variant="glass" className="text-[10px] bg-primary/10 text-primary border-primary/20 font-bold uppercase tracking-wider">Engagement Engine</Badge>
          </div>
          <DashboardEngagement user={user} latestResult={latestResult} />
        </div>
      </AnimatedContainer>

      {/* MAIN TWO-COLUMN DASHBOARD GRID */}
      <div className="grid gap-6 lg:grid-cols-12">
        
        {/* LEFT COLUMN: Challenges & Timeline (7 spans) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Weekly Challenges checklist */}
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

          {/* Decision Explainability Timeline */}
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
                    {/* Circle Node */}
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

        {/* RIGHT COLUMN: Partners, Habit Loop & Actions (5 spans) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Accountability Partner Lounge */}
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

          {/* Persona Recommendation Cards */}
          <AnimatedContainer animation="fadeUp" delay={0.3}>
            <PersonaRecommendationCards persona={activePersona} />
          </AnimatedContainer>

          {/* Premium Habit Loop & Smart Learning Recommendations */}
          <AnimatedContainer animation="fadeUp" delay={0.36}>
            <GlassCard className="border border-amber-500/20 bg-amber-500/[0.01] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="glass" className="bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold uppercase tracking-wider text-[10px]">Smart Recommendations</Badge>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">Weekly Micro Goal</h4>
                  <p className="text-sm font-semibold text-foreground mt-0.5">Learn basic Pivot Tables</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Fastest way to optimize technical profile matching this week.
                  </p>
                  <Badge variant="glass" className="mt-2 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border-emerald-500/20">Impact: +8 Career Upgrade Score</Badge>
                </div>

                <div className="pt-3 border-t border-border/60">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">Learning Suggestion</h4>
                  <p className="text-sm font-semibold text-foreground mt-0.5">15-Minute SQL JOIN tutorial</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    A short, high-ROI tutorial. Completing it matches 85% of recommended Data positions.
                  </p>
                </div>
              </div>
            </GlassCard>
          </AnimatedContainer>

          {/* Existing Quick Actions & Confidence Score */}
          <div className="grid gap-6">
            <GlassCard className="border border-border/80">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Quick Actions
              </h3>
              <div className="grid gap-3">
                {[
                  { icon: Brain, label: latestResult ? "Review/Retake Assessment" : "Take Interest Assessment", href: "/assessments" },
                  { icon: Route, label: "View Career Roadmap", href: "/roadmap" },
                  { icon: GraduationCap, label: "Explore Degrees", href: "/degrees" },
                  { icon: Award, label: "Discover Skills", href: "/skills" },
                ].map((action) => {
                  const ActionIcon = action.icon;
                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent bg-card/10"
                    >
                      <ActionIcon className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">{action.label}</span>
                      <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                    </Link>
                  );
                })}
              </div>
            </GlassCard>

            <ConfidenceScoreCard />
          </div>

        </div>
      </div>

      {/* ─── MODAL DIALOGS ─── */}
      <AnimatePresence>
        {isInviteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0"
              onClick={() => setIsInviteOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            
            {/* Dialog Container */}
            <motion.div
              className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl z-10 text-foreground"
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
            >
              <h3 className="text-lg font-bold mb-2">Invite Accountability Partner</h3>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Connect with friends or family by email. When they join, you can view their weekly streak and consistency live on your dashboard!
              </p>

              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Partner Name</label>
                  <input
                    type="text"
                    required
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="E.g. Sarah"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Partner Email</label>
                  <input
                    type="email"
                    required
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="E.g. sarah@example.com"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Relationship</label>
                  <select
                    value={inviteForm.relationship}
                    onChange={(e) => setInviteForm((prev) => ({ ...prev, relationship: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="FRIEND">Friend / Classmate</option>
                    <option value="PARENT">Parent / Guardian</option>
                    <option value="SIBLING">Sibling</option>
                    <option value="STUDY_PARTNER">Study Partner</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={isSubmittingInvite} variant="gradient" fullWidth>
                    {isSubmittingInvite ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Invite"}
                  </Button>
                  <Button type="button" onClick={() => setIsInviteOpen(false)} variant="outline">
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Progress Share Modal */}
      <ShareBrandingModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        careerName={latestResult ? "Software Engineer" : "Exploring Careers"}
        streakCount={completeness > 50 ? 5 : 1}
      />

      {/* Persona Save Modal */}
      <AnimatePresence>
        {showPersonaPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
            >
              <h3 className="text-lg font-bold mb-2">Save as default mode?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Would you like to set <strong>{activePersona.toLowerCase().replace("_", " ")}</strong> as your default dashboard view?
              </p>
              <div className="flex gap-3">
                <Button variant="outline" fullWidth onClick={() => { setActivePersona(effectivePersona as PersonaType); setShowPersonaPicker(false); }}>
                  Just exploring
                </Button>
                <Button variant="gradient" fullWidth onClick={handleSavePersona}>
                  Save as default
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
