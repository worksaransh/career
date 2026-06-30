"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, ArrowLeft, Check, Upload, FileText, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { User } from "@career-os/types";

interface OnboardingContentProps {
  user: User;
}

const personaOptions = [
  { id: "STUDENT", label: "School Student", description: "Exploring PCM/PCB, streams & boards", icon: "🎒" },
  { id: "COLLEGE_STUDENT", label: "College Student", description: "Degrees, internships & CGPA", icon: "🏛️" },
  { id: "PROFESSIONAL", label: "Working Professional", description: "Experience, current role & resume upload", icon: "💼" },
  { id: "CAREER_SWITCHER", label: "Career Switcher", description: "Transitioning target paths & skill gap", icon: "🔄" },
  { id: "PARENT", label: "Parent", description: "Child class, budget & future ROI", icon: "👨‍👩‍👧‍👦" },
];

export function OnboardingContent({ user }: OnboardingContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 0: Persona select, 1: Dynamic Form, 2: Complete
  const [step, setStep] = useState(0);
  const [persona, setPersona] = useState<string>("STUDENT");
  const [loading, setLoading] = useState(false);
  
  // Dynamic Form states
  const [formData, setFormData] = useState<Record<string, any>>({
    // School Student
    class: "11",
    board: "CBSE",
    subjects: "",
    marks: "",
    favSubject: "",
    weakSubject: "",
    budget: "",
    prefCity: "",
    language: "English",
    goals: "",
    parentOccupation: "",

    // College Student
    college: "",
    degree: "",
    year: "3rd Year",
    cgpa: "",
    skills: "",
    internships: "",
    projects: "",
    placementGoal: "",
    linkedin: "",
    github: "",

    // Professional
    currentRole: "",
    currentCompany: "",
    experience: "",
    currentSalary: "",
    expectedSalary: "",
    noticePeriod: "Immediate",
    industry: "",
    portfolio: "",
    location: "",
    workMode: "Hybrid",
    careerGoal: "",
    reasonForSwitch: "",

    // Career Switcher
    targetRole: "",
    transferableSkills: "",
    learningTime: "6 Months",
    riskAppetite: "Medium",

    // Parent
    childClass: "12",
    childInterests: "",
  });

  // Resume state
  const [fileName, setFileName] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseStep, setParseStep] = useState(0);
  const [isParsed, setIsParsed] = useState(false);
  const [parsedResumeData, setParsedResumeData] = useState<any>(null);

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const handleInputChange = (field: string, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleResumeUpload = async (file: File) => {
    setIsParsing(true);
    setParseStep(1);
    setFileName(file.name);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", "RESUME");

      // UI animation simulation of parsing steps
      const t1 = setTimeout(() => setParseStep(2), 800);
      const t2 = setTimeout(() => setParseStep(3), 1600);

      const res = await fetch("/api/vault/parse", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      clearTimeout(t1);
      clearTimeout(t2);

      if (json.success && json.data) {
        setIsParsed(true);
        const parsed = json.data;
        setParsedResumeData(parsed);

        const primarySkills = [
          ...(parsed.skills?.technical || []),
          ...(parsed.skills?.business || []),
          ...(parsed.skills?.coding || [])
        ].slice(0, 8).join(", ");

        const highestEdu = parsed.education?.[0];
        const experienceYears = parsed.experience?.reduce((acc: number, item: any) => acc + (item.yearsOfExperience || 0), 0) || 0;

        setFormData((prev) => ({
          ...prev,
          currentRole: parsed.experience?.[0]?.designation || prev.currentRole || "Software Engineer",
          currentCompany: parsed.experience?.[0]?.company || prev.currentCompany || "Accenture",
          experience: experienceYears > 0 ? `${experienceYears} Years` : prev.experience || "1 Year",
          skills: primarySkills || prev.skills || "React, JavaScript, SQL",
          degree: highestEdu?.degree || prev.degree || "B.Tech in Computer Science",
          currentSalary: "8,50,000",
        }));

        toast.success("Resume parsed successfully!");
      } else {
        throw new Error(json.error || "Failed to parse resume");
      }
    } catch (err: any) {
      toast.error("Parsing failed: " + err.message);
    } finally {
      setIsParsing(false);
      setParseStep(0);
    }
  };

  const handleNext = async () => {
    if (step === 0) {
      setStep(1);
      return;
    }
    if (step === 1) {
      setStep(2);
      return;
    }

    setLoading(true);
    try {
      await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona,
          onboardingData: {
            ...formData,
            persona,
            resumeUploaded: !!fileName,
          },
          parsedResumeData,
          resumeFilename: fileName || undefined,
        }),
      });
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
    }
    setLoading(false);
    router.push(callbackUrl);
    router.refresh();
  };

  const progress = ((step + 1) / 3) * 100;

  return (
    <div className="flex min-h-[85vh] items-center justify-center py-8">
      <div className="w-full max-w-xl px-4">
        <div className="mb-8 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-primary mb-2" />
          <Progress value={progress} variant="gradient" className="mb-4" />
          <Badge variant="glass">{step + 1} of 3</Badge>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            <GlassCard variant="strong" className="p-8 border border-border/80 shadow-2xl">
              {step === 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-center mb-2">Who are you?</h2>
                  <p className="text-center text-muted-foreground mb-8">
                    Choose your primary path so we can customize your dashboard
                  </p>
                  <div className="space-y-3">
                    {personaOptions.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setPersona(p.id)}
                        className={`w-full text-left rounded-2xl border p-4 transition-all ${
                          persona === p.id
                            ? "border-primary bg-primary/5 ring-2 ring-primary/40"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{p.icon}</span>
                            <div>
                              <p className="font-bold">{p.label}</p>
                              <p className="text-xs text-muted-foreground">{p.description}</p>
                            </div>
                          </div>
                          {persona === p.id && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <Check className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h2 className="text-xl font-bold mb-1">Onboarding Details</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Enter details to customize your personalized recommendations
                  </p>

                  <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin">
                    {/* Resume Upload section for college, professional and switcher */}
                    {(persona === "PROFESSIONAL" || persona === "CAREER_SWITCHER" || persona === "COLLEGE_STUDENT") && (
                      <div className="p-4 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center text-center space-y-2 bg-muted/20">
                        {isParsing ? (
                          <div className="py-4 flex flex-col items-center space-y-2">
                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            <p className="text-xs font-semibold">
                              {parseStep === 1 && "Uploading file..."}
                              {parseStep === 2 && "Extracting profile context..."}
                              {parseStep === 3 && "Mapping skills and experience..."}
                            </p>
                          </div>
                        ) : isParsed ? (
                          <div className="flex items-center gap-2 text-emerald-500 py-2">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="text-xs font-semibold">Resume parsed and profile auto-filled!</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <div>
                              <p className="text-xs font-bold">
                                Upload Resume {persona !== "COLLEGE_STUDENT" ? "(Required)" : "(Optional)"}
                              </p>
                              <p className="text-[10px] text-muted-foreground">PDF or DOCX up to 5MB</p>
                            </div>
                            <input
                              type="file"
                              id="resume-file"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleResumeUpload(file);
                                }
                              }}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById("resume-file")?.click()}
                            >
                              Choose File
                            </Button>
                          </>
                        )}
                      </div>
                    )}

                    {/* SCHOOL STUDENT FLOW */}
                    {persona === "STUDENT" && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1">Class</label>
                            <select
                              value={formData.class}
                              onChange={(e) => handleInputChange("class", e.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                            >
                              <option value="9">Class 9</option>
                              <option value="10">Class 10</option>
                              <option value="11">Class 11</option>
                              <option value="12">Class 12</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1">Board</label>
                            <select
                              value={formData.board}
                              onChange={(e) => handleInputChange("board", e.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                            >
                              <option value="CBSE">CBSE</option>
                              <option value="ICSE">ICSE</option>
                              <option value="State Board">State Board</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-muted-foreground block mb-1">Stream / Subjects</label>
                          <input
                            type="text"
                            placeholder="PCM, Commerce with Math, Humanities, etc."
                            value={formData.subjects}
                            onChange={(e) => handleInputChange("subjects", e.target.value)}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1">Latest Marks %</label>
                            <input
                              type="text"
                              placeholder="e.g. 85%"
                              value={formData.marks}
                              onChange={(e) => handleInputChange("marks", e.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1">Fav Subject</label>
                            <input
                              type="text"
                              placeholder="e.g. Math, Coding"
                              value={formData.favSubject}
                              onChange={(e) => handleInputChange("favSubject", e.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1">Weak Subject</label>
                            <input
                              type="text"
                              placeholder="e.g. Chemistry"
                              value={formData.weakSubject}
                              onChange={(e) => handleInputChange("weakSubject", e.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1">Parent Occupation</label>
                            <input
                              type="text"
                              placeholder="e.g. Business, Engineer"
                              value={formData.parentOccupation}
                              onChange={(e) => handleInputChange("parentOccupation", e.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1">College Budget (Year)</label>
                            <input
                              type="text"
                              placeholder="e.g. ₹2,000,000"
                              value={formData.budget}
                              onChange={(e) => handleInputChange("budget", e.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1">Preferred City</label>
                            <input
                              type="text"
                              placeholder="e.g. Bangalore, Delhi"
                              value={formData.prefCity}
                              onChange={(e) => handleInputChange("prefCity", e.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* COLLEGE STUDENT FLOW */}
                    {persona === "COLLEGE_STUDENT" && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1">College Name</label>
                            <input
                              type="text"
                              placeholder="e.g. IIT, DU"
                              value={formData.college}
                              onChange={(e) => handleInputChange("college", e.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1">Degree / Course</label>
                            <input
                              type="text"
                              placeholder="e.g. B.Tech CS"
                              value={formData.degree}
                              onChange={(e) => handleInputChange("degree", e.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1">Year</label>
                            <select
                              value={formData.year}
                              onChange={(e) => handleInputChange("year", e.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                            >
                              <option value="1st Year">1st Year</option>
                              <option value="2nd Year">2nd Year</option>
                              <option value="3rd Year">3rd Year</option>
                              <option value="4th Year">4th Year</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1">CGPA</label>
                            <input
                              type="text"
                              placeholder="e.g. 8.5"
                              value={formData.cgpa}
                              onChange={(e) => handleInputChange("cgpa", e.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-muted-foreground block mb-1">Key Skills</label>
                          <input
                            type="text"
                            placeholder="React, Excel, Marketing, SQL..."
                            value={formData.skills}
                            onChange={(e) => handleInputChange("skills", e.target.value)}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-muted-foreground block mb-1">Internships / Projects</label>
                          <input
                            type="text"
                            placeholder="Briefly describe your projects..."
                            value={formData.projects}
                            onChange={(e) => handleInputChange("projects", e.target.value)}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1">LinkedIn Profile</label>
                            <input
                              type="text"
                              placeholder="https://linkedin.com/in/..."
                              value={formData.linkedin}
                              onChange={(e) => handleInputChange("linkedin", e.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1">GitHub Profile</label>
                            <input
                              type="text"
                              placeholder="https://github.com/..."
                              value={formData.github}
                              onChange={(e) => handleInputChange("github", e.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* WORKING PROFESSIONAL FLOW */}
                    {persona === "PROFESSIONAL" && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1">Current Role</label>
                            <input
                              type="text"
                              placeholder="e.g. Software Engineer"
                              value={formData.currentRole}
                              onChange={(e) => handleInputChange("currentRole", e.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1">Current Company</label>
                            <input
                              type="text"
                              placeholder="e.g. Google, Accenture"
                              value={formData.currentCompany}
                              onChange={(e) => handleInputChange("currentCompany", e.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1">Experience (Years)</label>
                            <input
                              type="text"
                              placeholder="e.g. 3 Years"
                              value={formData.experience}
                              onChange={(e) => handleInputChange("experience", e.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1">Industry</label>
                            <input
                              type="text"
                              placeholder="e.g. IT, FinTech"
                              value={formData.industry}
                              onChange={(e) => handleInputChange("industry", e.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1">Current Salary</label>
                            <input
                              type="text"
                              placeholder="e.g. ₹8,50,000"
                              value={formData.currentSalary}
                              onChange={(e) => handleInputChange("currentSalary", e.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1">Expected Salary</label>
                            <input
                              type="text"
                              placeholder="e.g. ₹12,00,000"
                              value={formData.expectedSalary}
                              onChange={(e) => handleInputChange("expectedSalary", e.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-muted-foreground block mb-1">Skills extracted & verified</label>
                          <input
                            type="text"
                            placeholder="React, TypeScript, SQL..."
                            value={formData.skills}
                            onChange={(e) => handleInputChange("skills", e.target.value)}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1">Work Mode</label>
                            <select
                              value={formData.workMode}
                              onChange={(e) => handleInputChange("workMode", e.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                            >
                              <option value="Hybrid">Hybrid</option>
                              <option value="Remote">Remote</option>
                              <option value="Office">Office</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1">Preferred Location</label>
                            <input
                              type="text"
                              placeholder="e.g. Bangalore"
                              value={formData.location}
                              onChange={(e) => handleInputChange("location", e.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* CAREER SWITCHER FLOW */}
                    {persona === "CAREER_SWITCHER" && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1">Current Role</label>
                            <input
                              type="text"
                              placeholder="e.g. Marketing Associate"
                              value={formData.currentRole}
                              onChange={(e) => handleInputChange("currentRole", e.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1">Target Role</label>
                            <input
                              type="text"
                              placeholder="e.g. Product Manager"
                              value={formData.targetRole}
                              onChange={(e) => handleInputChange("targetRole", e.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-muted-foreground block mb-1">Reason for Switch</label>
                          <input
                            type="text"
                            placeholder="e.g. Better growth, interest in Tech..."
                            value={formData.reasonForSwitch}
                            onChange={(e) => handleInputChange("reasonForSwitch", e.target.value)}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1">Transferable Skills</label>
                            <input
                              type="text"
                              placeholder="e.g. Analytics, Communication"
                              value={formData.transferableSkills}
                              onChange={(e) => handleInputChange("transferableSkills", e.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1">Learning Time/Week</label>
                            <select
                              value={formData.learningTime}
                              onChange={(e) => handleInputChange("learningTime", e.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                            >
                              <option value="2 Hours">2 Hours</option>
                              <option value="5 Hours">5 Hours</option>
                              <option value="10+ Hours">10+ Hours</option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}

                    {/* PARENT FLOW */}
                    {persona === "PARENT" && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1">Child&apos;s Class</label>
                            <select
                              value={formData.childClass}
                              onChange={(e) => handleInputChange("childClass", e.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                            >
                              <option value="9">Class 9</option>
                              <option value="10">Class 10</option>
                              <option value="11">Class 11</option>
                              <option value="12">Class 12</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1">Child&apos;s Interests</label>
                            <input
                              type="text"
                              placeholder="e.g. Science, Coding"
                              value={formData.childInterests}
                              onChange={(e) => handleInputChange("childInterests", e.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1">College Budget (Total)</label>
                            <input
                              type="text"
                              placeholder="e.g. ₹10,00,000"
                              value={formData.budget}
                              onChange={(e) => handleInputChange("budget", e.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-muted-foreground block mb-1">Preferred Location</label>
                            <input
                              type="text"
                              placeholder="e.g. Bangalore, Pune"
                              value={formData.location}
                              onChange={(e) => handleInputChange("location", e.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-muted-foreground block mb-1">Future Goals / Dreams</label>
                          <input
                            type="text"
                            placeholder="Secure job, foreign study..."
                            value={formData.futureGoal}
                            onChange={(e) => handleInputChange("futureGoal", e.target.value)}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="text-center py-8">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">You&apos;re all set!</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto mb-4">
                    Your context-aware profile is now saved inside your Career Twin. We&apos;ve optimized matches for you!
                  </p>
                </div>
              )}

              <div className="mt-8 flex gap-3 items-center">
                {step > 0 && step < 2 && (
                  <Button
                    variant="outline"
                    onClick={() => setStep((s) => s - 1)}
                    leftIcon={<ArrowLeft className="h-4 w-4" />}
                  >
                    Back
                  </Button>
                )}
                <Button
                  variant="gradient"
                  fullWidth={step === 0 || step === 2}
                  size="lg"
                  onClick={handleNext}
                  loading={loading}
                  rightIcon={step < 2 ? <ArrowRight className="h-4 w-4" /> : undefined}
                >
                  {step === 2 ? "Go to Dashboard" : "Continue"}
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
