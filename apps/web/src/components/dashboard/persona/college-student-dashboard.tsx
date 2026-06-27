"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  Briefcase,
  FileText,
  Award,
  Route,
  Target,
  Zap,
  Sparkles,
  CheckCircle2,
  Loader2,
  Users,
  Send,
  Plus,
  MessageSquare,
  ArrowRight,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { PersonaRecommendationCards } from "./persona-recommendation-cards";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardEngagement } from "@/components/dashboard/dashboard-engagement";
import { ConfidenceScoreCard } from "@/components/intelligence/confidence-score";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";

// Server Actions
import { completeWeeklyChallenge } from "@/lib/actions/challenge-actions";
import { invitePartner, sendPartnerNudge } from "@/lib/actions/accountability-actions";

interface Props {
  user: any;
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

export function CollegeStudentDashboardContent({
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
}: Props) {
  // Local state initialized from initial props
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

  const [completingIds, setCompletingIds] = useState<Record<string, boolean>>({});
  const [nudgingIds, setNudgingIds] = useState<Record<string, boolean>>({});

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome, {user.name?.split(" ")[0] ?? "College Student"}!</h1>
          <p className="text-muted-foreground mt-1">Build skills, find internships, and launch your career</p>
        </div>
        <Badge variant="glass" className="text-xs gap-1"><GraduationCap className="h-3 w-3" /> College Mode</Badge>
      </div>

      {/* DYNAMIC SCORING ROW */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/careers">
          <GlassCard variant="strong" className="p-5 hover:ring-2 hover:ring-primary/30 transition-all h-full relative overflow-hidden group">
            <div className="absolute top-2 right-2 opacity-50 group-hover:opacity-100 transition-opacity">
              <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10 font-mono text-[9px]">LIVE SCORE</Badge>
            </div>
            <Target className="h-5 w-5 text-primary mb-2" />
            <p className="text-3xl font-extrabold tracking-tight">{scores.jobReadiness}%</p>
            <p className="text-xs text-muted-foreground font-bold mt-1">Job Readiness</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Compatible index score</p>
          </GlassCard>
        </Link>
        <Link href="/vault">
          <GlassCard variant="strong" className="p-5 hover:ring-2 hover:ring-primary/30 transition-all h-full relative overflow-hidden group">
            <div className="absolute top-2 right-2 opacity-50 group-hover:opacity-100 transition-opacity">
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-mono text-[9px]">VAULT ASSETS</Badge>
            </div>
            <Award className="h-5 w-5 text-emerald-500 mb-2" />
            <p className="text-3xl font-extrabold tracking-tight">{scores.portfolio}%</p>
            <p className="text-xs text-muted-foreground font-bold mt-1">Portfolio Strength</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Resume & profile optimization</p>
          </GlassCard>
        </Link>
        <Link href="/skills">
          <GlassCard variant="strong" className="p-5 hover:ring-2 hover:ring-primary/30 transition-all h-full relative overflow-hidden group">
            <div className="absolute top-2 right-2 opacity-50 group-hover:opacity-100 transition-opacity">
              <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 font-mono text-[9px]">SKILLS</Badge>
            </div>
            <Route className="h-5 w-5 text-amber-500 mb-2" />
            <p className="text-3xl font-extrabold tracking-tight">{recommendedCareersCount ?? 0}</p>
            <p className="text-xs text-muted-foreground font-bold mt-1">Skills to Learn</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Identified skill gaps</p>
          </GlassCard>
        </Link>
        <Link href="/saved">
          <GlassCard variant="strong" className="p-5 hover:ring-2 hover:ring-primary/30 transition-all h-full relative overflow-hidden group">
            <div className="absolute top-2 right-2 opacity-50 group-hover:opacity-100 transition-opacity">
              <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10 font-mono text-[9px]">SAVED</Badge>
            </div>
            <Sparkles className="h-5 w-5 text-purple-500 mb-2" />
            <p className="text-3xl font-extrabold tracking-tight">{savedCount ?? 0}</p>
            <p className="text-xs text-muted-foreground font-bold mt-1">Saved Items</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Colleges & careers saved</p>
          </GlassCard>
        </Link>
      </div>

      {/* QUICK LINK CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/roadmap">
          <GlassCard variant="strong" className="p-4 hover:bg-card/50 transition-all flex items-center gap-3 cursor-pointer border border-border/60">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Route className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none">Skill Roadmap</p>
              <p className="text-[10px] text-muted-foreground mt-1">Your learning path</p>
            </div>
          </GlassCard>
        </Link>
        <Link href="/skills">
          <GlassCard variant="strong" className="p-4 hover:bg-card/50 transition-all flex items-center gap-3 cursor-pointer border border-border/60">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none">Internship Finder</p>
              <p className="text-[10px] text-muted-foreground mt-1">Find opportunities</p>
            </div>
          </GlassCard>
        </Link>
        <Link href="/vault">
          <GlassCard variant="strong" className="p-4 hover:bg-card/50 transition-all flex items-center gap-3 cursor-pointer border border-border/60">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none">Portfolio</p>
              <p className="text-[10px] text-muted-foreground mt-1">Showcase your work</p>
            </div>
          </GlassCard>
        </Link>
        <Link href="/vault">
          <GlassCard variant="strong" className="p-4 hover:bg-card/50 transition-all flex items-center gap-3 cursor-pointer border border-border/60">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none">Resume Analysis</p>
              <p className="text-[10px] text-muted-foreground mt-1">Get AI feedback</p>
            </div>
          </GlassCard>
        </Link>
      </div>

      <PersonaRecommendationCards persona="COLLEGE_STUDENT" />

      {/* TWO COLUMN GRID LAYOUT */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Challenges & Timeline (7 spans) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Weekly Challenges checklist */}
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
                    className="mt-0.5 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full"
                    aria-label={challenge.isCompleted ? `Completed: ${challenge.title}` : `Mark as completed: ${challenge.title}`}
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

          {/* Decision Explainability Timeline */}
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

        </div>

        {/* RIGHT COLUMN: Partners, Habit Loop & Actions (5 spans) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Accountability Partner Lounge */}
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

          {/* Confidence Score Card */}
          <ConfidenceScoreCard />

          {/* WhatsApp & Telegram Community Join */}
          <GlassCard className="border border-border/80 p-5 bg-card/40 flex flex-col justify-between h-full">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="glass" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold uppercase tracking-wider text-[10px]">Community Channels</Badge>
              </div>
              <h3 className="text-lg font-bold">Join the Career Growth Network</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connect directly with peer study groups and career coaches on WhatsApp & Telegram. Receive weekly micro challenges, hiring news alerts, and direct AI tips.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[120px]">
                <Button variant="gradient" fullWidth leftIcon={<MessageSquare className="h-4 w-4" />}>
                  WhatsApp
                </Button>
              </a>
              <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[120px]">
                <Button variant="outline" fullWidth leftIcon={<Send className="h-4 w-4" />}>
                  Telegram
                </Button>
              </a>
            </div>
          </GlassCard>

          {/* Weekly Reflection Alert Banner */}
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
                  Start Reflection
                </Button>
              </Link>
            </div>
          </GlassCard>

          {/* Daily Habit Hub */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight">Daily Habit Hub</h2>
              <Badge variant="glass" className="text-[10px] bg-primary/10 text-primary border-primary/20 font-bold uppercase tracking-wider">Engagement</Badge>
            </div>
            <DashboardEngagement user={user} latestResult={latestResult} />
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
    </div>
  );
}
