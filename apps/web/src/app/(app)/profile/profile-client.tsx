"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Save, Loader2, Award, Calendar, MapPin, GraduationCap, Briefcase, Plus, X, Bell } from "lucide-react";
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
}

export function ProfileClient({ user, profile, assessments }: ProfileClientProps) {
  const [name, setName] = useState(user.name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [location, setLocation] = useState(profile?.location ?? "");
  const [educationLevel, setEducationLevel] = useState(profile?.educationLevel ?? "");
  const [currentGrade, setCurrentGrade] = useState(profile?.currentGrade ?? "");
  
  // Format Date safely
  let formattedDob = "";
  if (profile?.dateOfBirth) {
    try {
      formattedDob = new Date(profile.dateOfBirth).toISOString().split("T")[0] || "";
    } catch (e) {}
  }
  const [dateOfBirth, setDateOfBirth] = useState(formattedDob);
  const [interests, setInterests] = useState<string[]>(profile?.interests ?? []);
  const [newInterest, setNewInterest] = useState("");

  const preferences = (profile?.preferences as Record<string, any>) || {};
  const [emailNotifications, setEmailNotifications] = useState(preferences.emailNotifications !== false);
  const [pushNotifications, setPushNotifications] = useState(preferences.pushNotifications !== false);

  const [saving, setSaving] = useState(false);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bio,
          location,
          educationLevel,
          currentGrade,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
          interests,
          emailNotifications,
          pushNotifications,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Profile saved successfully!");
      } else {
        toast.error(data.error?.message || "Failed to update profile");
      }
    } catch {
      toast.error("Network connection error");
    }
    setSaving(false);
  };

  const handleAddInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInterest.trim()) return;
    if (interests.includes(newInterest.trim())) {
      toast.error("Interest already exists");
      return;
    }
    setInterests([...interests, newInterest.trim()]);
    setNewInterest("");
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 text-foreground">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3.5 border-b border-border pb-4">
        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
          <User className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Your Career GPS Profile</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Customize personal details, interests matrix, and messaging options.</p>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Side: Summary Card */}
        <div className="md:col-span-1 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <GlassCard className="p-6 text-center space-y-4 border border-border/80">
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                {name ? name.slice(0, 2).toUpperCase() : user.email?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground truncate">{name || "Anonymous User"}</h3>
                <span className="text-xs text-muted-foreground truncate block max-w-full font-mono">{user.email}</span>
              </div>
              <div className="pt-2 border-t border-border/60 flex justify-around text-center text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Interests</span>
                  <span className="font-bold text-foreground text-sm">{interests.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Completed</span>
                  <span className="font-bold text-foreground text-sm">{assessments.length}</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Interests Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs uppercase font-extrabold tracking-wider text-muted-foreground">Interests Matrix</CardTitle>
                <CardDescription className="text-[11px]">Help Career GPS understand your preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <form onSubmit={handleAddInterest} className="flex gap-2">
                  <Input
                    placeholder="e.g. Coding, UI/UX"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    className="h-9 text-xs rounded-xl bg-background"
                  />
                  <Button type="submit" size="sm" className="h-9 px-3 rounded-xl">
                    <Plus className="h-4 w-4" />
                  </Button>
                </form>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {interests.length === 0 ? (
                    <span className="text-xs text-muted-foreground italic">No interests added yet.</span>
                  ) : (
                    interests.map((interest) => (
                      <Badge
                        key={interest}
                        variant="secondary"
                        className="pl-2.5 pr-1.5 py-1 text-[11px] flex items-center gap-1 rounded-full border border-border"
                      >
                        {interest}
                        <button
                          type="button"
                          onClick={() => handleRemoveInterest(interest)}
                          className="text-muted-foreground hover:text-destructive rounded-full hover:bg-muted p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Side: Main Editing Forms */}
        <div className="md:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-foreground">Personal Profile Settings</CardTitle>
                <CardDescription className="text-xs">Add details to personalize recommendations.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Full Name</label>
                    <Input
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-xl h-10 text-xs bg-background"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Date of Birth</label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Professional / Student Bio</label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about yourself..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground leading-relaxed"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Location (City)</label>
                    <Input
                      placeholder="e.g. New Delhi"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="rounded-xl h-10 text-xs bg-background"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Education Level</label>
                    <select
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value)}
                      className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                    >
                      <option value="">Select Level</option>
                      <option value="School">School Student</option>
                      <option value="Undergraduate">Undergraduate Student</option>
                      <option value="Post Graduate">Post Graduate Student</option>
                      <option value="Working Professional">Working Professional</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Grade / Class / Specialization</label>
                    <Input
                      placeholder="e.g. B.Tech CS / 12th PCM"
                      value={currentGrade}
                      onChange={(e) => setCurrentGrade(e.target.value)}
                      className="rounded-xl h-10 text-xs bg-background"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex justify-end">
                  <Button onClick={saveProfile} disabled={saving} variant="gradient" className="rounded-xl px-5 h-10 text-xs font-semibold">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Preferences Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2"><Bell className="h-4.5 w-4.5 text-primary" /> Notifications & Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3.5">
                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <div>
                    <span className="text-xs font-bold block text-foreground">Email Notifications</span>
                    <span className="text-[10px] text-muted-foreground">Receive updates about career matches, recommendations, and reports.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-border bg-card text-primary focus:ring-0"
                  />
                </div>

                <div className="flex items-center justify-between py-1">
                  <div>
                    <span className="text-xs font-bold block text-foreground">Push Notifications</span>
                    <span className="text-[10px] text-muted-foreground">Receive desktop alerts for mock interview reminders and weekly challenges.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={pushNotifications}
                    onChange={(e) => setPushNotifications(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-border bg-card text-primary focus:ring-0"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Assessments Completed */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Award className="h-4.5 w-4.5 text-indigo-400" /> Recent Assessments Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assessments.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No assessments completed yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {assessments.map((a) => (
                      <div key={a.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/10 p-3 hover:bg-muted/20 transition-all">
                        <div>
                          <p className="text-xs font-bold text-foreground">{a.assessment.title}</p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3" /> {new Date(a.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
