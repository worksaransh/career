"use client";

import React, { useState, useEffect } from "react";
import { 
  Flame, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  TrendingUp, 
  Share2, 
  Globe, 
  Copy, 
  Check, 
  Gift, 
  HelpCircle,
  Trophy
} from "lucide-react";
import toast from "react-hot-toast";

import { GlassCard } from "@/components/ui/glass-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShareBrandingModal } from "@/components/shared/share-branding";
import { 
  recordActivityAndGetStreak,
  getDailySmartQuestion,
  submitDailyAnswer,
  getDailyTasks,
  completeDailyTask,
  getAchievementBadges,
  getDailyCareerNews,
  getDailyInsights,
  processReferral
} from "@/lib/actions/engagement-actions";

interface DashboardEngagementProps {
  user: any;
  latestResult?: any;
}

export function DashboardEngagement({ user, latestResult }: DashboardEngagementProps) {
  // Engagement State
  const [profile, setProfile] = useState<any>(null);
  const [question, setQuestion] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [tasks, setTasks] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [referralInput, setReferralInput] = useState<string>("");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize and load daily stats
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Record login activity & get updated streak
        const userProfile = await recordActivityAndGetStreak();
        setProfile(userProfile);

        // Fetch daily smart question
        const dailyQ = await getDailySmartQuestion();
        setQuestion(dailyQ);

        // Fetch daily tasks
        const dailyT = await getDailyTasks();
        setTasks(dailyT);

        // Fetch badges
        const badgesList = await getAchievementBadges();
        setBadges(badgesList);

        // Fetch daily news & insights
        const newsList = await getDailyCareerNews();
        setNews(newsList);

        const insightsList = await getDailyInsights();
        setInsights(insightsList);
      } catch (err) {
        console.error("Error loading daily engagement data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Submit Answer Action
  const handleAnswerSubmit = async () => {
    if (!question || !selectedOption) return;
    try {
      setIsSubmittingAnswer(true);
      await submitDailyAnswer(question.id, selectedOption);
      toast.success("Answer saved! +30 XP, +20 points earned.");
      setQuestion(null); // Remove question since answered today
      
      // Refresh state
      const updatedProfile = await recordActivityAndGetStreak();
      setProfile(updatedProfile);
      
      const updatedTasks = await getDailyTasks();
      setTasks(updatedTasks);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit answer.");
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // Complete Task Action
  const handleTaskComplete = async (taskId: string) => {
    try {
      const completed = await completeDailyTask(taskId);
      toast.success(`Task completed! +${completed.xpReward} XP earned.`);
      
      // Refresh state
      const updatedTasks = await getDailyTasks();
      setTasks(updatedTasks);
      
      const updatedProfile = await recordActivityAndGetStreak();
      setProfile(updatedProfile);
    } catch (err: any) {
      toast.error(err.message || "Failed to complete task.");
    }
  };

  // Claim Streak Milestone
  const handleClaimMilestone = (key: string) => {
    toast.success(`Milestone ${key.replace("_", " ")} applied automatically to your level!`);
  };

  // Process referral code submit
  const handleReferralSubmit = async () => {
    if (!referralInput.trim()) return;
    try {
      const res = await processReferral(referralInput);
      if (res.success) {
        toast.success(res.message);
        setReferralInput("");
        const updatedProfile = await recordActivityAndGetStreak();
        setProfile(updatedProfile);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to apply referral code.");
    }
  };

  const copyReferralCode = () => {
    const code = profile?.referralCode || `REF-${user.id.slice(0, 6).toUpperCase()}`;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success("Referral code copied!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Calculations for level progression
  const totalXP = profile?.totalXP || 0;
  const level = Math.floor(totalXP / 100) + 1;
  const currentLevelXP = totalXP % 100;
  const xpNeeded = 100;

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 animate-pulse">
        <div className="space-y-6">
          <div className="h-40 rounded-3xl bg-muted/20" />
          <div className="h-64 rounded-3xl bg-muted/20" />
        </div>
        <div className="space-y-6">
          <div className="h-48 rounded-3xl bg-muted/20" />
          <div className="h-56 rounded-3xl bg-muted/20" />
        </div>
      </div>
    );
  }

  const userReferral = profile?.referralCode || `REF-${user.id.slice(0, 6).toUpperCase()}`;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 items-start">
      {/* Left Column: Streaks, Daily Question & Tasks */}
      <div className="space-y-6 lg:col-span-3">
        {/* Streak & Level Progress Widget */}
        <GlassCard className="p-6 relative overflow-hidden border border-border/80">
          <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-primary/5 blur-[50px] pointer-events-none" />
          
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5 border-b border-border/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Flame className="h-6 w-6 text-amber-500 fill-amber-500 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-base flex items-center gap-1.5">
                  Streak Master <span className="text-sm font-normal text-muted-foreground">({profile?.currentStreak || 1} days active)</span>
                </h3>
                <p className="text-xs text-muted-foreground">Keep logging in daily to secure XP multipliers!</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="glass" className="text-xs border-amber-500/20 text-amber-500 font-semibold bg-amber-500/5">
                Record: {profile?.longestStreak || 1} Days
              </Badge>
              <Badge variant="secondary" className="text-xs font-bold bg-primary/10 border border-primary/20 text-primary">
                XP: {profile?.totalXP || 0}
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold text-foreground">
              <span>LEVEL {level}</span>
              <span className="text-muted-foreground">{currentLevelXP}/{xpNeeded} XP to Level {level + 1}</span>
            </div>
            <Progress value={currentLevelXP} variant="gradient" className="h-2.5" />
          </div>

          {/* Bonus streak logs indicator */}
          <div className="mt-5 grid grid-cols-4 gap-2 text-center">
            {[
              { label: "7d Bonus", limit: 7, claimed: profile?.milestonesClaimed?.includes("7_DAYS") },
              { label: "30d Bonus", limit: 30, claimed: profile?.milestonesClaimed?.includes("30_DAYS") },
              { label: "100d Bonus", limit: 100, claimed: profile?.milestonesClaimed?.includes("100_DAYS") },
              { label: "365d Bonus", limit: 365, claimed: profile?.milestonesClaimed?.includes("365_DAYS") }
            ].map((milestone) => {
              const meetsLimit = (profile?.currentStreak || 0) >= milestone.limit;
              return (
                <button
                  key={milestone.label}
                  disabled={!meetsLimit || milestone.claimed}
                  onClick={() => handleClaimMilestone(milestone.label.replace(" Bonus", "_DAYS"))}
                  className={`p-2 rounded-xl border text-[10px] font-bold transition-all ${
                    milestone.claimed
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 cursor-default"
                      : meetsLimit
                        ? "bg-primary text-primary-foreground border-primary hover:opacity-90 animate-bounce"
                        : "bg-muted/15 border-border/40 text-muted-foreground opacity-60 cursor-not-allowed"
                  }`}
                >
                  <Gift className="h-3.5 w-3.5 mx-auto mb-1" />
                  {milestone.label}
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* Daily Smart Question Widget */}
        {question ? (
          <GlassCard className="p-6 border border-border/80 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4 border-b border-border/40 pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
                <HelpCircle className="h-4 w-4 text-indigo-400" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-foreground">Daily Smart Question</h4>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Tuned to: {question.category}</p>
              </div>
              <Badge variant="glass" className="ml-auto text-[10px] border-indigo-500/20 text-indigo-400 font-bold bg-indigo-500/5">
                +30 XP
              </Badge>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-bold text-foreground leading-relaxed">
                {question.text}
              </p>

              <div className="space-y-2.5">
                {question.options.map((opt: string) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedOption(opt)}
                    className={`w-full py-2.5 px-4 text-left text-xs font-semibold rounded-xl border transition-all ${
                      selectedOption === opt
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-muted/5 border-border/50 text-muted-foreground hover:bg-muted/10 hover:text-foreground"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <Button
                variant="gradient"
                fullWidth
                size="sm"
                onClick={handleAnswerSubmit}
                disabled={!selectedOption || isSubmittingAnswer}
                loading={isSubmittingAnswer}
              >
                Submit Answer
              </Button>
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="p-6 border border-border/80 text-center space-y-3 bg-emerald-500/[0.02]">
            <div className="h-10 w-10 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <h4 className="font-extrabold text-sm text-foreground">Daily Smart Question Completed</h4>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
              Nice work! You have answered today&apos;s smart question. We are updating your recommended pathways based on this feedback.
            </p>
          </GlassCard>
        )}

        {/* Daily Tasks Checklist Widget */}
        <GlassCard className="p-6 border border-border/80">
          <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-3">
            <h4 className="font-extrabold text-sm text-foreground flex items-center gap-2">
              <Trophy className="h-4.5 w-4.5 text-primary" /> Today&apos;s Smart Quest
            </h4>
            <span className="text-[10px] text-muted-foreground font-semibold">
              {tasks.filter(t => t.isCompleted).length}/{tasks.length} Completed
            </span>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div 
                key={task.id}
                className={`flex items-center justify-between gap-4 p-3 border rounded-2xl transition-all ${
                  task.isCompleted 
                    ? "bg-emerald-500/[0.02] border-emerald-500/20 text-muted-foreground" 
                    : "bg-muted/5 border-border/60 hover:bg-muted/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button 
                    onClick={() => !task.isCompleted && handleTaskComplete(task.id)}
                    className="mt-0.5"
                    disabled={task.isCompleted}
                  >
                    {task.isCompleted ? (
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                    ) : (
                      <Circle className="h-4.5 w-4.5 text-muted-foreground/60 hover:text-primary transition-colors" />
                    )}
                  </button>
                  <div>
                    <p className={`text-xs font-bold ${task.isCompleted ? "line-through" : "text-foreground"}`}>
                      {task.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{task.description}</p>
                  </div>
                </div>
                <Badge variant="glass" className={`text-[10px] font-bold ${
                  task.isCompleted ? "border-emerald-500/10 text-emerald-500/70" : "border-primary/20 text-primary"
                }`}>
                  +{task.xpReward} XP
                </Badge>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Right Column: Badges, Insights Feed & Sharing Referral */}
      <div className="space-y-6 lg:col-span-2">
        {/* Referral and Match Card Sharing Widget */}
        <GlassCard className="p-6 border border-border/80 relative overflow-hidden">
          <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-purple-500/5 blur-[50px] pointer-events-none" />
          
          <h4 className="font-extrabold text-sm text-foreground flex items-center gap-2 mb-4 border-b border-border/40 pb-3">
            <Share2 className="h-4.5 w-4.5 text-primary" /> Share DNA & Invite Friends
          </h4>

          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/60 space-y-2 text-xs">
              <span className="text-[9px] font-bold text-muted-foreground block uppercase tracking-widest">Your Referral Code</span>
              <div className="flex items-center justify-between bg-card border rounded-xl p-1.5 px-3">
                <span className="font-mono font-bold tracking-wider text-sm">{userReferral}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={copyReferralCode}
                  className="h-8 w-8 p-0 rounded-lg"
                >
                  {copiedCode ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button 
              variant="gradient" 
              fullWidth 
              size="sm"
              leftIcon={<Share2 className="h-4 w-4" />}
              onClick={() => setIsShareOpen(true)}
            >
              Share Match DNA Card
            </Button>

            <div className="space-y-2 border-t border-border/40 pt-4">
              <span className="text-[10px] font-extrabold text-muted-foreground block uppercase tracking-widest">Apply Invitation Code</span>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={referralInput}
                  onChange={(e) => setReferralInput(e.target.value)}
                  placeholder="Paste referral code"
                  className="h-9 rounded-xl border border-border bg-card px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground flex-1"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleReferralSubmit}
                  className="h-9"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Weekly Insights & News Feed Widget */}
        <GlassCard className="p-6 border border-border/80">
          <h4 className="font-extrabold text-sm text-foreground flex items-center gap-2 mb-3 border-b border-border/40 pb-3">
            <BookOpen className="h-4.5 w-4.5 text-primary" /> Daily Intelligence Feed
          </h4>

          <div className="space-y-4">
            {/* Insights */}
            {insights.map((ins, idx) => (
              <div key={idx} className="flex gap-2.5 text-xs text-muted-foreground leading-relaxed bg-primary/5 p-3 rounded-2xl border border-primary/10">
                <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p>{ins.text}</p>
              </div>
            ))}

            {/* News */}
            <div className="space-y-3 pt-2">
              <span className="text-[9px] font-bold text-muted-foreground block uppercase tracking-widest">Market & Skill Updates</span>
              {news.map((item, idx) => (
                <a 
                  key={idx}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group rounded-xl border border-border/50 p-2.5 hover:bg-muted/10 transition-colors"
                >
                  <div className="flex justify-between items-start gap-3">
                    <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{item.title}</span>
                    <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{item.industry}</span>
                    <span className="text-[9px] text-primary group-hover:underline">Read →</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Achievements / Badges Panel Widget */}
        <GlassCard className="p-6 border border-border/80">
          <h4 className="font-extrabold text-sm text-foreground flex items-center gap-2 mb-4 border-b border-border/40 pb-3">
            <Award className="h-4.5 w-4.5 text-primary" /> Milestones & Badges
          </h4>

          <div className="grid grid-cols-3 gap-3">
            {badges.map((badge) => (
              <div 
                key={badge.type} 
                className={`relative flex flex-col items-center text-center p-2 rounded-2xl border transition-all ${
                  badge.isUnlocked
                    ? "bg-primary/5 border-primary/20 text-foreground"
                    : "bg-muted/5 border-border/40 text-muted-foreground opacity-60"
                }`}
                title={badge.description}
              >
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-1.5 transition-transform hover:scale-105 ${
                  badge.isUnlocked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/40"
                }`}>
                  <Award className="h-5.5 w-5.5" />
                </div>
                <span className="text-[9px] font-black tracking-tight block max-w-full truncate">{badge.title}</span>
                <span className="text-[7px] text-muted-foreground block mt-0.5 leading-none">
                  {badge.isUnlocked ? "Unlocked" : "Locked"}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Share DNA Modal */}
      <ShareBrandingModal 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        careerName={latestResult ? "Software Engineer" : "Data Scientist"} // Fallback or dynamic selection
        matchPercentage={94}
        streakCount={profile?.currentStreak || 1}
        referralCode={userReferral}
      />
    </div>
  );
}
