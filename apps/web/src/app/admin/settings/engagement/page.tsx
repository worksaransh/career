"use client";

import React, { useEffect, useState } from "react";
import { Sliders, Save, Plus, Trash2, HelpCircle, Loader2, Sparkles, Building, Key } from "lucide-react";
import toast from "react-hot-toast";

import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  getEngagementSettings, 
  updateEngagementSettings,
  listDailyQuestions,
  createDailyQuestion,
  deleteDailyQuestion,
  listHiringCompanies,
  createHiringCompany,
  deleteHiringCompany
} from "@/lib/actions/engagement-actions";

export default function AdminEngagementSettingsPage() {
  const [activeTab, setActiveTab] = useState("rules");
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // XP Settings State
  const [xpLogin, setXpLogin] = useState("15");
  const [xpQuestion, setXpQuestion] = useState("30");
  const [xpTask, setXpTask] = useState("10");
  const [streak7, setStreak7] = useState("100");
  const [streak30, setStreak30] = useState("500");
  const [streak100, setStreak100] = useState("2000");
  const [streak365, setStreak365] = useState("10000");

  // Daily Questions State
  const [questions, setQuestions] = useState<any[]>([]);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionOptions, setNewQuestionOptions] = useState("Yes, Sometimes, No");
  const [newQuestionCategory, setNewQuestionCategory] = useState("Analytical");
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  // Hiring Companies State
  const [companies, setCompanies] = useState<any[]>([]);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyLogo, setNewCompanyLogo] = useState("");
  const [newCompanyCareers, setNewCompanyCareers] = useState("software-engineer, data-scientist");
  const [submittingCompany, setSubmittingCompany] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      // Load settings
      const settings = await getEngagementSettings();
      setXpLogin(settings.xp_login_reward ?? "15");
      setXpQuestion(settings.xp_question_reward ?? "30");
      setXpTask(settings.xp_task_reward ?? "10");
      setStreak7(settings.xp_streak_7 ?? "100");
      setStreak30(settings.xp_streak_30 ?? "500");
      setStreak100(settings.xp_streak_100 ?? "2000");
      setStreak365(settings.xp_streak_365 ?? "10000");

      // Load questions
      const qs = await listDailyQuestions();
      setQuestions(qs);

      // Load companies
      const comps = await listHiringCompanies();
      setCompanies(comps);
    } catch (e: any) {
      toast.error(e.message || "Failed to load configuration data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    const toastId = toast.loading("Saving XP configuration updates...");
    try {
      await updateEngagementSettings({
        xp_login_reward: xpLogin,
        xp_question_reward: xpQuestion,
        xp_task_reward: xpTask,
        xp_streak_7: streak7,
        xp_streak_30: streak30,
        xp_streak_100: streak100,
        xp_streak_365: streak365
      });
      toast.success("Engagement settings saved successfully!", { id: toastId });
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings.", { id: toastId });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim() || !newQuestionCategory.trim()) return;
    setSubmittingQuestion(true);
    const toastId = toast.loading("Creating daily question...");
    try {
      const optionsArr = newQuestionOptions
        .split(",")
        .map(opt => opt.trim())
        .filter(opt => opt.length > 0);
        
      await createDailyQuestion(newQuestionText, optionsArr, newQuestionCategory);
      toast.success("Question created successfully!", { id: toastId });
      setNewQuestionText("");
      setNewQuestionOptions("Yes, Sometimes, No");
      setNewQuestionCategory("Analytical");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to add question.", { id: toastId });
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    const toastId = toast.loading("Deleting question...");
    try {
      await deleteDailyQuestion(id);
      toast.success("Question deleted successfully!", { id: toastId });
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete question.", { id: toastId });
    }
  };

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim() || !newCompanyLogo.trim()) return;
    setSubmittingCompany(true);
    const toastId = toast.loading("Registering hiring company...");
    try {
      const careersArr = newCompanyCareers
        .split(",")
        .map(c => c.trim().toLowerCase())
        .filter(c => c.length > 0);
        
      await createHiringCompany(newCompanyName, newCompanyLogo, careersArr);
      toast.success("Company registered successfully!", { id: toastId });
      setNewCompanyName("");
      setNewCompanyLogo("");
      setNewCompanyCareers("software-engineer, data-scientist");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to register company.", { id: toastId });
    } finally {
      setSubmittingCompany(false);
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (!confirm("Are you sure you want to delete this company?")) return;
    const toastId = toast.loading("Deleting company...");
    try {
      await deleteHiringCompany(id);
      toast.success("Company deleted successfully!", { id: toastId });
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete company.", { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground">Loading configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-foreground">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text text-transparent sm:text-4xl flex items-center gap-2">
          Engagement Config Hub
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure game mechanics, login multipliers, daily questionnaires, and corporate recruitment profiles.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border text-sm font-semibold">
        {[
          { code: "rules", label: "XP & Streak Rules", icon: Sliders },
          { code: "questions", label: "Daily Questions CMS", icon: HelpCircle },
          { code: "companies", label: "Hiring Companies", icon: Building },
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
      {activeTab === "rules" && (
        <form onSubmit={handleSaveSettings} className="rounded-2xl border border-border bg-card p-6 shadow-md max-w-2xl space-y-6">
          <div className="border-b border-border pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" /> Core Gamification XP Rules
            </h3>
            <Badge variant="outline">Rules Settings</Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Daily Login Award (XP)</label>
              <input
                type="number"
                value={xpLogin}
                onChange={(e) => setXpLogin(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Daily Smart Question (XP)</label>
              <input
                type="number"
                value={xpQuestion}
                onChange={(e) => setXpQuestion(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Base Task Completion (XP)</label>
              <input
                type="number"
                value={xpTask}
                onChange={(e) => setXpTask(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Streak Milestone Bonuses</h4>
            
            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">7 Days Streak Award (XP)</label>
                <input
                  type="number"
                  value={streak7}
                  onChange={(e) => setStreak7(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">30 Days Streak Award (XP)</label>
                <input
                  type="number"
                  value={streak30}
                  onChange={(e) => setStreak30(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">100 Days Streak Award (XP)</label>
                <input
                  type="number"
                  value={streak100}
                  onChange={(e) => setStreak100(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">365 Days Streak Award (XP)</label>
                <input
                  type="number"
                  value={streak365}
                  onChange={(e) => setStreak365(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={savingSettings}
            loading={savingSettings}
            variant="gradient"
            size="sm"
            leftIcon={<Save className="h-4 w-4" />}
          >
            Save Rules & Milestones
          </Button>
        </form>
      )}

      {activeTab === "questions" && (
        <div className="grid gap-6 lg:grid-cols-5 items-start">
          {/* List existing */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              Active Question Database
            </h3>
            
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-muted/40 font-semibold text-muted-foreground border-b border-border uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Question Prompt</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Options</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {questions.map((q) => (
                      <tr key={q.id} className="hover:bg-muted/5 transition-colors font-medium">
                        <td className="px-4 py-3 font-bold text-foreground leading-normal max-w-[200px]">{q.text}</td>
                        <td className="px-4 py-3 text-muted-foreground">{q.category}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {q.options.map((opt: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-[9px] py-0 px-1">{opt}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Form to add */}
          <form onSubmit={handleAddQuestion} className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-md space-y-4 text-xs">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-primary" /> Create Daily Question
            </h3>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Question Text</label>
              <textarea
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="Do you prefer coding or building interface layouts?"
                required
                rows={3}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Category Mapping</label>
              <select
                value={newQuestionCategory}
                onChange={(e) => setNewQuestionCategory(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              >
                {["Analytical", "Social", "Creative", "Technical", "Leadership"].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Choices (Comma-Separated)</label>
              <input
                type="text"
                value={newQuestionOptions}
                onChange={(e) => setNewQuestionOptions(e.target.value)}
                placeholder="Strongly Agree, Neutral, Disagree"
                required
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              />
            </div>

            <Button
              type="submit"
              disabled={submittingQuestion}
              loading={submittingQuestion}
              variant="gradient"
              fullWidth
            >
              Add Question
            </Button>
          </form>
        </div>
      )}

      {activeTab === "companies" && (
        <div className="grid gap-6 lg:grid-cols-5 items-start">
          {/* List existing */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              Registered Recruitment Companies
            </h3>
            
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-muted/40 font-semibold text-muted-foreground border-b border-border uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Company Details</th>
                      <th className="px-4 py-3">Careers Tagged</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {companies.map((comp) => (
                      <tr key={comp.id} className="hover:bg-muted/5 transition-colors font-medium">
                        <td className="px-4 py-3 flex items-center gap-3">
                          <img 
                            src={comp.logoUrl} 
                            alt={comp.name} 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=50&h=50&q=80";
                            }}
                            className="h-8 w-8 rounded-lg object-cover bg-muted/20 border" 
                          />
                          <div>
                            <span className="font-bold text-foreground block">{comp.name}</span>
                            <span className="text-[9px] text-muted-foreground block">ID: {comp.id.slice(0, 8)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {comp.careers.map((slug: string, i: number) => (
                              <Badge key={i} variant="glass" className="text-[9px] py-0 px-1 capitalize border-primary/20 text-primary bg-primary/5">{slug.replace("-", " ")}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteCompany(comp.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Form to add */}
          <form onSubmit={handleAddCompany} className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-md space-y-4 text-xs">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-primary" /> Add Hiring Company
            </h3>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Company Name</label>
              <input
                type="text"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="Google Inc"
                required
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Logo URL</label>
              <input
                type="url"
                value={newCompanyLogo}
                onChange={(e) => setNewCompanyLogo(e.target.value)}
                placeholder="https://logo.clearbit.com/google.com"
                required
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Target Career Slugs (Comma-Separated)</label>
              <input
                type="text"
                value={newCompanyCareers}
                onChange={(e) => setNewCompanyCareers(e.target.value)}
                placeholder="software-engineer, software-developer"
                required
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              />
            </div>

            <Button
              type="submit"
              disabled={submittingCompany}
              loading={submittingCompany}
              variant="gradient"
              fullWidth
            >
              Register Company
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
