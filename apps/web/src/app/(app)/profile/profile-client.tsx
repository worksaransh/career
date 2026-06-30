"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Save, Loader2, Award, Calendar, MapPin, 
  GraduationCap, Briefcase, Plus, X, Bell, Link2, 
  Linkedin, Github, Globe, DollarSign, Target, Sparkles,
  BookOpen, FolderGit, Languages, Shield, Brain
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import toast from "react-hot-toast";

interface ProfileClientProps {
  user: { id: string; name: string | null; email: string | null; createdAt: Date };
  profile: {
    bio: string | null;
    location: string | null;
    educationLevel: string | null;
    currentGrade: string | null;
    dateOfBirth: string | null;
    interests: string[] | null;
    preferences: Record<string, unknown> | null;
  } | null;
  assessments: Array<{ id: string; scores: Record<string, unknown>; completedAt: Date; assessment: { title: string } }>;
  memory: {
    id: string;
    demographics: Record<string, any>;
    education: Record<string, any>;
    marks: Record<string, any>;
    interests: any;
    goals: Record<string, any>;
    personality: Record<string, any>;
    skills: Record<string, any>;
    budget: Record<string, any>;
    profileCompleteness: number;
    careerUpgradeScore: number;
    jobReadinessScore: number;
    portfolioScore: number;
  };
}

export function ProfileClient({ user, profile, assessments, memory }: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState("personal");

  // Tab 1: Personal Info
  const [name, setName] = useState(user.name ?? "");
  const [phone, setPhone] = useState(memory.demographics.phone ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [location, setLocation] = useState(profile?.location ?? "");
  let formattedDob = "";
  if (profile?.dateOfBirth) {
    try {
      formattedDob = new Date(profile.dateOfBirth).toISOString().split("T")[0] || "";
    } catch (e) {}
  }
  const [dateOfBirth, setDateOfBirth] = useState(formattedDob);
  const [languages, setLanguages] = useState<string[]>(memory.demographics.languages ?? ["English"]);
  const [newLanguage, setNewLanguage] = useState("");

  // Tab 2: Education & Goals
  const [educationLevel, setEducationLevel] = useState(profile?.educationLevel ?? "");
  const [currentGrade, setCurrentGrade] = useState(profile?.currentGrade ?? "");
  const [educationHistory, setEducationHistory] = useState<any[]>(memory.education.history ?? []);
  
  // Edu edit item states
  const [newDegree, setNewDegree] = useState("");
  const [newCollege, setNewCollege] = useState("");
  const [newPassingYear, setNewPassingYear] = useState("");
  const [newCgpa, setNewCgpa] = useState("");

  // Goals
  const [shortTermGoal, setShortTermGoal] = useState(memory.goals.shortTerm ?? "");
  const [longTermGoal, setLongTermGoal] = useState(memory.goals.longTerm ?? "");
  const [preferredCities, setPreferredCities] = useState<string[]>(memory.goals.preferredCities ?? []);
  const [newCity, setNewCity] = useState("");
  const [preferredCountries, setPreferredCountries] = useState<string[]>(memory.goals.preferredCountries ?? []);
  const [newCountry, setNewCountry] = useState("");

  // Tab 3: Work Experience
  const [experiences, setExperiences] = useState<any[]>(memory.demographics.experience ?? []);
  
  // Work edit item states
  const [expDesignation, setExpDesignation] = useState("");
  const [expCompany, setExpCompany] = useState("");
  const [expStartDate, setExpStartDate] = useState("");
  const [expEndDate, setExpEndDate] = useState("");
  const [expDescription, setExpDescription] = useState("");

  // Tab 4: Projects & Certificates
  const [projects, setProjects] = useState<any[]>(memory.demographics.projects ?? []);
  
  // Project edit states
  const [projName, setProjName] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projRole, setProjRole] = useState("");
  const [projTech, setProjTech] = useState("");
  const [projImpact, setProjImpact] = useState("");

  const [certifications, setCertifications] = useState<string[]>(memory.demographics.certifications ?? []);
  const [newCert, setNewCert] = useState("");

  // Tab 5: Links & Finance
  const [linkedin, setLinkedin] = useState(memory.demographics.linkedin ?? "");
  const [github, setGithub] = useState(memory.demographics.github ?? "");
  const [website, setWebsite] = useState(memory.demographics.website ?? "");
  const [currentSalary, setCurrentSalary] = useState(memory.goals.currentSalary ?? "");
  const [expectedSalary, setExpectedSalary] = useState(memory.goals.expectedSalary ?? "");

  // Preferences
  const preferences = (profile?.preferences as Record<string, any>) || {};
  const [emailNotifications, setEmailNotifications] = useState(preferences.emailNotifications !== false);
  const [pushNotifications, setPushNotifications] = useState(preferences.pushNotifications !== false);

  const [saving, setSaving] = useState(false);

  // Save Handlers
  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          bio,
          location,
          educationLevel,
          currentGrade,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
          emailNotifications,
          pushNotifications,
          experience: experiences,
          projects,
          certifications,
          linkedin,
          github,
          website,
          languages,
          currentSalary,
          expectedSalary,
          preferredCities,
          preferredCountries,
          shortTerm: shortTermGoal,
          longTerm: longTermGoal,
          educationHistory,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("AI Career Memory synced successfully!");
      } else {
        toast.error(data.error?.message || "Failed to update profile");
      }
    } catch {
      toast.error("Network connection error");
    } finally {
      setSaving(false);
    }
  };

  // Helper push/pulls for arrays
  const addLanguage = () => {
    if (!newLanguage.trim()) return;
    if (languages.includes(newLanguage.trim())) return;
    setLanguages([...languages, newLanguage.trim()]);
    setNewLanguage("");
  };

  const removeLanguage = (lang: string) => {
    setLanguages(languages.filter((l) => l !== lang));
  };

  const addCity = () => {
    if (!newCity.trim()) return;
    if (preferredCities.includes(newCity.trim())) return;
    setPreferredCities([...preferredCities, newCity.trim()]);
    setNewCity("");
  };

  const removeCity = (city: string) => {
    setPreferredCities(preferredCities.filter((c) => c !== city));
  };

  const addCountry = () => {
    if (!newCountry.trim()) return;
    if (preferredCountries.includes(newCountry.trim())) return;
    setPreferredCountries([...preferredCountries, newCountry.trim()]);
    setNewCountry("");
  };

  const removeCountry = (country: string) => {
    setPreferredCountries(preferredCountries.filter((c) => c !== country));
  };

  const addEducation = () => {
    if (!newDegree.trim() || !newCollege.trim()) {
      toast.error("Please add Degree and Institution");
      return;
    }
    setEducationHistory([...educationHistory, {
      degree: newDegree,
      college: newCollege,
      passingYear: newPassingYear,
      cgpa: newCgpa
    }]);
    setNewDegree("");
    setNewCollege("");
    setNewPassingYear("");
    setNewCgpa("");
  };

  const removeEducation = (index: number) => {
    setEducationHistory(educationHistory.filter((_, i) => i !== index));
  };

  const addExperience = () => {
    if (!expDesignation.trim() || !expCompany.trim()) {
      toast.error("Please add Designation and Company");
      return;
    }
    setExperiences([...experiences, {
      designation: expDesignation,
      company: expCompany,
      startDate: expStartDate,
      endDate: expEndDate || "Present",
      description: expDescription
    }]);
    setExpDesignation("");
    setExpCompany("");
    setExpStartDate("");
    setExpEndDate("");
    setExpDescription("");
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const addProject = () => {
    if (!projName.trim()) {
      toast.error("Please enter a Project Name");
      return;
    }
    setProjects([...projects, {
      projectName: projName,
      description: projDesc,
      role: projRole,
      technologies: projTech.split(",").map(t => t.trim()).filter(Boolean),
      businessImpact: projImpact
    }]);
    setProjName("");
    setProjDesc("");
    setProjRole("");
    setProjTech("");
    setProjImpact("");
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const addCert = () => {
    if (!newCert.trim()) return;
    if (certifications.includes(newCert.trim())) return;
    setCertifications([...certifications, newCert.trim()]);
    setNewCert("");
  };

  const removeCert = (cert: string) => {
    setCertifications(certifications.filter((c) => c !== cert));
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 text-foreground">
      
      {/* Upper Brand Section */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-6"
      >
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 bg-primary/10 rounded-2xl text-primary ring-1 ring-primary/20">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">AI Career Profile & Memory Center</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Refine your Career Twin parameters to tailor RAG coaching, job matches, and ROI predictions.
            </p>
          </div>
        </div>
        <Button 
          onClick={saveProfile} 
          disabled={saving} 
          variant="gradient"
          className="rounded-xl px-5 h-11"
          leftIcon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        >
          {saving ? "Syncing Twin..." : "Sync Profile Memory"}
        </Button>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-4">
        
        {/* Left column: Navigation Tabs & Twin Status */}
        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-md overflow-hidden border border-border">
            <div className="p-4 bg-gradient-to-br from-primary/5 to-transparent border-b border-border text-center space-y-3">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-white text-xl font-black shadow-lg">
                {name ? name.slice(0, 2).toUpperCase() : user.email?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground truncate">{name || "Anonymous OS User"}</h3>
                <span className="text-[10px] text-muted-foreground font-mono truncate block">{user.email}</span>
              </div>
            </div>
            
            {/* Tab Links */}
            <div className="p-2 space-y-1">
              {[
                { code: "personal", label: "Personal Information", icon: User },
                { code: "education", label: "Education & Goals", icon: GraduationCap },
                { code: "experience", label: "Work Experience", icon: Briefcase },
                { code: "projects", label: "Projects & Certs", icon: FolderGit },
                { code: "finance", label: "Links & Salaries", icon: Link2 },
                { code: "twin", label: "Career Twin State", icon: Sparkles },
              ].map((t) => {
                const Icon = t.icon;
                const isActive = activeTab === t.code;
                return (
                  <button
                    key={t.code}
                    onClick={() => setActiveTab(t.code)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Micro Twin Snapshot */}
          <GlassCard className="p-4 border border-indigo-500/20 bg-gradient-to-b from-indigo-500/[0.01] to-indigo-500/[0.05]">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300 flex items-center gap-1 mb-2.5">
              <Shield className="h-3.5 w-3.5" /> Career Twin Status
            </h4>
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1 font-semibold">
                  <span className="text-muted-foreground">Profile Completed</span>
                  <span className="text-foreground">{Math.round(memory.profileCompleteness || 60)}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${memory.profileCompleteness || 60}%` }} />
                </div>
              </div>
              <div className="pt-2 border-t border-border/40 grid grid-cols-2 gap-2 text-center text-[10px]">
                <div className="bg-card/30 p-2 rounded-xl border border-border/30">
                  <span className="text-muted-foreground block">Twin Confidence</span>
                  <span className="font-bold text-foreground text-xs mt-0.5 block">{memory.jobReadinessScore + 10}%</span>
                </div>
                <div className="bg-card/30 p-2 rounded-xl border border-border/30">
                  <span className="text-muted-foreground block">Portfolio Rate</span>
                  <span className="font-bold text-foreground text-xs mt-0.5 block">{memory.portfolioScore}%</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right column: Form Content */}
        <div className="md:col-span-3">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: PERSONAL */}
            {activeTab === "personal" && (
              <motion.div key="personal" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <Card className="shadow-md border border-border">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Personal Profile Information</CardTitle>
                    <CardDescription className="text-xs">Define standard contact information and bio details.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
                        <Input placeholder="E.g. John Doe" value={name} onChange={(e) => setName(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Phone Number</label>
                        <Input placeholder="E.g. +91 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Date of Birth</label>
                        <input
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Current Location</label>
                        <Input placeholder="E.g. Bengaluru, India" value={location} onChange={(e) => setLocation(e.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Professional Bio</label>
                      <textarea
                        rows={3}
                        placeholder="Tell us about yourself..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                      />
                    </div>

                    {/* Languages Array */}
                    <div className="space-y-2 border-t border-border pt-4">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Languages Known</label>
                      <div className="flex gap-2">
                        <Input placeholder="E.g. Spanish" value={newLanguage} onChange={(e) => setNewLanguage(e.target.value)} className="max-w-xs" />
                        <Button type="button" onClick={addLanguage} variant="outline" className="h-10 px-3"><Plus className="h-4 w-4" /></Button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {languages.map((l) => (
                          <Badge key={l} variant="secondary" className="pl-2.5 pr-1.5 py-1 text-[10px] flex items-center gap-1 rounded-full border border-border">
                            {l}
                            <button type="button" onClick={() => removeLanguage(l)} className="text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* TAB 2: EDUCATION & GOALS */}
            {activeTab === "education" && (
              <motion.div key="education" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <Card className="shadow-md border border-border">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Education History & Career Goals</CardTitle>
                    <CardDescription className="text-xs">Outline qualifications, target career goals, and locations.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Education Level</label>
                        <select
                          value={educationLevel}
                          onChange={(e) => setEducationLevel(e.target.value)}
                          className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="School">School Student</option>
                          <option value="Undergraduate">Undergraduate Student</option>
                          <option value="Graduate">Post-Graduate / Graduate</option>
                          <option value="Working Professional">Working Professional</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Grade / Specialization</label>
                        <Input placeholder="E.g. Computer Science Engineering" value={currentGrade} onChange={(e) => setCurrentGrade(e.target.value)} />
                      </div>
                    </div>

                    {/* Educational Degrees List */}
                    <div className="space-y-3 border-t border-border pt-4">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Detailed Academic History</label>
                      
                      <div className="grid gap-2 sm:grid-cols-4 bg-accent/20 p-3 rounded-2xl border border-border/40 text-xs">
                        <Input placeholder="Degree (e.g. B.Tech)" value={newDegree} onChange={(e) => setNewDegree(e.target.value)} />
                        <Input placeholder="Institution (e.g. IIT)" value={newCollege} onChange={(e) => setNewCollege(e.target.value)} />
                        <Input placeholder="Year (e.g. 2025)" value={newPassingYear} onChange={(e) => setNewPassingYear(e.target.value)} />
                        <div className="flex gap-2">
                          <Input placeholder="GPA (e.g. 9.1)" value={newCgpa} onChange={(e) => setNewCgpa(e.target.value)} />
                          <Button type="button" onClick={addEducation} variant="outline" className="h-10 px-3"><Plus className="h-4 w-4" /></Button>
                        </div>
                      </div>

                      <div className="space-y-2 mt-2">
                        {educationHistory.map((edu, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-card/40 p-3 rounded-xl border border-border/50 text-xs">
                            <div>
                              <span className="font-bold text-foreground">{edu.degree}</span>
                              <span className="text-muted-foreground block text-[10px]">{edu.college} | Class of {edu.passingYear || "N/A"} {edu.cgpa ? `| GPA: ${edu.cgpa}` : ""}</span>
                            </div>
                            <button type="button" onClick={() => removeEducation(idx)} className="p-1 text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Career Goals */}
                    <div className="space-y-4 border-t border-border pt-4">
                      <h4 className="text-xs font-bold text-foreground">Target Career Goals</h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Short-term Goal (1-2 yrs)</label>
                          <Input placeholder="E.g. Secure full stack engineer role" value={shortTermGoal} onChange={(e) => setShortTermGoal(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Long-term Goal (3-5 yrs)</label>
                          <Input placeholder="E.g. Lead engineering architect" value={longTermGoal} onChange={(e) => setLongTermGoal(e.target.value)} />
                        </div>
                      </div>

                      {/* Cities & Countries */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Preferred Cities</label>
                          <div className="flex gap-2">
                            <Input placeholder="E.g. London" value={newCity} onChange={(e) => setNewCity(e.target.value)} />
                            <Button type="button" onClick={addCity} variant="outline" className="h-10 px-3"><Plus className="h-4 w-4" /></Button>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {preferredCities.map((c) => (
                              <Badge key={c} variant="secondary" className="pl-2.5 pr-1.5 py-1 text-[10px] rounded-full border">
                                {c}
                                <button type="button" onClick={() => removeCity(c)} className="text-muted-foreground hover:text-destructive ml-1"><X className="h-3 w-3" /></button>
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Preferred Countries</label>
                          <div className="flex gap-2">
                            <Input placeholder="E.g. United Kingdom" value={newCountry} onChange={(e) => setNewCountry(e.target.value)} />
                            <Button type="button" onClick={addCountry} variant="outline" className="h-10 px-3"><Plus className="h-4 w-4" /></Button>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {preferredCountries.map((c) => (
                              <Badge key={c} variant="secondary" className="pl-2.5 pr-1.5 py-1 text-[10px] rounded-full border">
                                {c}
                                <button type="button" onClick={() => removeCountry(c)} className="text-muted-foreground hover:text-destructive ml-1"><X className="h-3 w-3" /></button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* TAB 3: WORK EXPERIENCE */}
            {activeTab === "experience" && (
              <motion.div key="experience" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <Card className="shadow-md border border-border">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Professional Experience Timeline</CardTitle>
                    <CardDescription className="text-xs">Add full-time, part-time, or internship roles.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                    {/* Add Experience Form */}
                    <div className="bg-accent/10 p-4 rounded-2xl border border-border/40 space-y-3">
                      <h4 className="text-xs font-bold text-foreground">Add Work History Item</h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input placeholder="Designation (e.g. PM Intern)" value={expDesignation} onChange={(e) => setExpDesignation(e.target.value)} />
                        <Input placeholder="Company (e.g. Google)" value={expCompany} onChange={(e) => setExpCompany(e.target.value)} />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="text-[9px] font-bold text-muted-foreground uppercase block mb-1">Start Date</label>
                          <Input placeholder="E.g. May 2024" value={expStartDate} onChange={(e) => setExpStartDate(e.target.value)} />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-muted-foreground uppercase block mb-1">End Date</label>
                          <Input placeholder="E.g. July 2024 / Present" value={expEndDate} onChange={(e) => setExpEndDate(e.target.value)} />
                        </div>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Description of responsibilities and achievements..."
                        value={expDescription}
                        onChange={(e) => setExpDescription(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground focus:outline-none"
                      />
                      <Button type="button" onClick={addExperience} size="sm" variant="outline" className="w-full">
                        <Plus className="h-4 w-4 mr-1" /> Add Experience to Timeline
                      </Button>
                    </div>

                    {/* Experiences Timeline */}
                    <div className="space-y-4 pt-4 border-t border-border">
                      <h4 className="text-xs font-bold text-foreground">Experiences Checklist</h4>
                      {experiences.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic text-center py-4">No experience roles added. Upload a Resume to auto-populate.</p>
                      ) : (
                        <div className="space-y-3">
                          {experiences.map((exp, idx) => (
                            <div key={idx} className="flex items-start justify-between bg-card/40 p-4 rounded-2xl border border-border/60 text-xs">
                              <div className="space-y-1">
                                <span className="font-extrabold text-foreground text-sm flex items-center gap-1.5">
                                  <Briefcase className="h-4 w-4 text-primary" /> {exp.designation}
                                </span>
                                <span className="text-primary font-semibold block">{exp.company}</span>
                                <span className="text-[10px] text-muted-foreground block">{exp.startDate} - {exp.endDate}</span>
                                <p className="text-muted-foreground leading-relaxed mt-2 text-[11px]">{exp.description}</p>
                              </div>
                              <button type="button" onClick={() => removeExperience(idx)} className="p-1 text-muted-foreground hover:text-destructive"><X className="h-5 w-5" /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* TAB 4: PROJECTS & CERTS */}
            {activeTab === "projects" && (
              <motion.div key="projects" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <Card className="shadow-md border border-border">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Practical Projects & Certifications</CardTitle>
                    <CardDescription className="text-xs">Showcase hands-on builds and verified certifications.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                    {/* Add Project Form */}
                    <div className="bg-accent/10 p-4 rounded-2xl border border-border/40 space-y-3">
                      <h4 className="text-xs font-bold text-foreground">Add Practical Project</h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input placeholder="Project Name (e.g. AI Twin)" value={projName} onChange={(e) => setProjName(e.target.value)} />
                        <Input placeholder="Your Role (e.g. Lead Engineer)" value={projRole} onChange={(e) => setProjRole(e.target.value)} />
                      </div>
                      <Input placeholder="Technologies Used (comma separated, e.g. React, Node)" value={projTech} onChange={(e) => setProjTech(e.target.value)} />
                      <textarea
                        rows={2}
                        placeholder="Project Description..."
                        value={projDesc}
                        onChange={(e) => setProjDesc(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground focus:outline-none"
                      />
                      <Input placeholder="Business / Product Impact (e.g. Boosted SEO traffic by 30%)" value={projImpact} onChange={(e) => setProjImpact(e.target.value)} />
                      <Button type="button" onClick={addProject} size="sm" variant="outline" className="w-full">
                        <Plus className="h-4 w-4 mr-1" /> Add Project
                      </Button>
                    </div>

                    {/* Projects List */}
                    <div className="space-y-4 pt-4 border-t border-border">
                      <h4 className="text-xs font-bold text-foreground">Projects</h4>
                      {projects.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic text-center py-4">No projects logged yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {projects.map((proj, idx) => (
                            <div key={idx} className="flex items-start justify-between bg-card/40 p-4 rounded-2xl border border-border/60 text-xs">
                              <div className="space-y-1.5 flex-1">
                                <span className="font-extrabold text-foreground text-sm flex items-center gap-1.5">
                                  <FolderGit className="h-4 w-4 text-emerald-400" /> {proj.projectName}
                                </span>
                                {proj.role && <span className="text-[10px] text-muted-foreground block">Role: {proj.role}</span>}
                                <p className="text-muted-foreground leading-relaxed text-[11px]">{proj.description}</p>
                                {proj.technologies && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {proj.technologies.map((t: string) => (
                                      <Badge key={t} variant="glass" className="text-[9px] lowercase">{t}</Badge>
                                    ))}
                                  </div>
                                )}
                                {proj.businessImpact && (
                                  <div className="bg-primary/5 p-2 rounded-lg border border-primary/10 text-[10px] text-primary mt-2">
                                    <strong>Impact:</strong> {proj.businessImpact}
                                  </div>
                                )}
                              </div>
                              <button type="button" onClick={() => removeProject(idx)} className="p-1 text-muted-foreground hover:text-destructive ml-2"><X className="h-5 w-5" /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Certifications Array */}
                    <div className="space-y-2 border-t border-border pt-4">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Certifications</label>
                      <div className="flex gap-2">
                        <Input placeholder="E.g. AWS Solutions Architect" value={newCert} onChange={(e) => setNewCert(e.target.value)} className="max-w-xs" />
                        <Button type="button" onClick={addCert} variant="outline" className="h-10 px-3"><Plus className="h-4 w-4" /></Button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {certifications.map((c) => (
                          <Badge key={c} variant="secondary" className="pl-2.5 pr-1.5 py-1 text-[10px] flex items-center gap-1 rounded-full border">
                            <BookOpen className="h-3.5 w-3.5 text-blue-400" />
                            {c}
                            <button type="button" onClick={() => removeCert(c)} className="text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* TAB 5: LINKS & SALARY */}
            {activeTab === "finance" && (
              <motion.div key="finance" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <Card className="shadow-md border border-border">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Online Portfolios & Compensation Details</CardTitle>
                    <CardDescription className="text-xs">Link professional URLs and salary expectations.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-foreground">Social & Portfolio URLs</h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Linkedin className="h-3.5 w-3.5 text-blue-400" /> LinkedIn URL
                          </label>
                          <Input placeholder="https://linkedin.com/in/username" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Github className="h-3.5 w-3.5 text-foreground" /> GitHub URL
                          </label>
                          <Input placeholder="https://github.com/username" value={github} onChange={(e) => setGithub(e.target.value)} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                          <Globe className="h-3.5 w-3.5 text-emerald-400" /> Personal Website / Portfolio Link
                        </label>
                        <Input placeholder="https://myportfolio.com" value={website} onChange={(e) => setWebsite(e.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-3 border-t border-border pt-4">
                      <h4 className="text-xs font-bold text-foreground">Compensation Projections (INR)</h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> Current Annual Salary
                          </label>
                          <Input placeholder="E.g. ₹8,00,000" value={currentSalary} onChange={(e) => setCurrentSalary(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5 text-primary" /> Target Expected Salary
                          </label>
                          <Input placeholder="E.g. ₹15,00,000" value={expectedSalary} onChange={(e) => setExpectedSalary(e.target.value)} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 border-t border-border pt-4">
                      <h4 className="text-xs font-bold text-foreground">Notification Subscriptions</h4>
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                          <input type="checkbox" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} className="rounded text-primary focus:ring-primary h-4 w-4 bg-background" />
                          Receive Weekly Career Insights Email Reports
                        </label>
                        <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                          <input type="checkbox" checked={pushNotifications} onChange={(e) => setPushNotifications(e.target.checked)} className="rounded text-primary focus:ring-primary h-4 w-4 bg-background" />
                          Enable Live AI Coach Push Notifications
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* TAB 6: AI TWIN INSIGHTS */}
            {activeTab === "twin" && (
              <motion.div key="twin" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <Card className="shadow-md border border-border">
                  <CardHeader>
                    <CardTitle className="text-base font-bold flex items-center gap-1.5">
                      <Sparkles className="h-5 w-5 text-primary" /> Career Twin Memory State
                    </CardTitle>
                    <CardDescription className="text-xs">Understand the exact representation stored in the RAG databases.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                    <div className="grid gap-4 sm:grid-cols-3 text-center">
                      <div className="p-3 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                        <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">Twin Calibration</span>
                        <span className="text-2xl font-black text-white mt-1 block">94%</span>
                      </div>
                      <div className="p-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                        <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">Rec Engine Sync</span>
                        <span className="text-2xl font-black text-white mt-1 block">Active</span>
                      </div>
                      <div className="p-3 bg-purple-500/5 rounded-2xl border border-purple-500/10">
                        <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">RAG Tokens Active</span>
                        <span className="text-2xl font-black text-white mt-1 block">4,288</span>
                      </div>
                    </div>

                    {/* Skill Gap Matrix */}
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold text-foreground">Skills Profile Matrix (UserMemory)</h4>
                      <div className="p-4 rounded-2xl border border-border bg-card/20 text-xs space-y-3">
                        {Object.keys(memory.skills || {}).length === 0 ? (
                          <p className="text-muted-foreground italic text-center py-2">No verified skills stored in memory. Try uploading your resume.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {Object.keys(memory.skills || {}).map((s) => (
                              <Badge key={s} variant="glass" className="py-1 px-2.5 text-[10px] font-mono flex items-center gap-1.5">
                                <Award className="h-3 w-3 text-primary" />
                                {s} <span className="opacity-60 font-sans">({memory.skills[s]})</span>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Personality & RIASEC Representation */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="p-4 border border-border/80 rounded-2xl space-y-3">
                        <span className="text-[10px] font-bold text-primary block uppercase tracking-wider">RIASEC Profile (AI Mapped)</span>
                        <div className="space-y-1.5 text-xs text-muted-foreground">
                          <div className="flex justify-between"><span>Realistic:</span> <span className="font-bold text-foreground">30%</span></div>
                          <div className="flex justify-between"><span>Investigative:</span> <span className="font-bold text-foreground">78%</span></div>
                          <div className="flex justify-between"><span>Artistic:</span> <span className="font-bold text-foreground">64%</span></div>
                          <div className="flex justify-between"><span>Social:</span> <span className="font-bold text-foreground">42%</span></div>
                          <div className="flex justify-between"><span>Enterprising:</span> <span className="font-bold text-foreground">50%</span></div>
                          <div className="flex justify-between"><span>Conventional:</span> <span className="font-bold text-foreground">25%</span></div>
                        </div>
                      </div>

                      <div className="p-4 border border-border/80 rounded-2xl space-y-2 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-400 block uppercase tracking-wider">AI Coach Memory Insights</span>
                          <p className="text-xs text-muted-foreground leading-relaxed mt-1.5">
                            Our RAG engine reads this complete profile memory to supply Context-Aware advice. When chatting, the AI remembers your target salary (₹{expectedSalary || "15,00,000"}), your preferred cities, and your skill gap.
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="w-full text-[11px] mt-2">
                          Recalibrate Memory Embeddings
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
