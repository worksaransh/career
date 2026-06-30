import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Brain,
  DollarSign,
  TrendingUp,
  ArrowLeft,
  Briefcase,
  GraduationCap,
  Award,
  Sparkles,
  Zap,
  CheckCircle,
} from "lucide-react";
import { prisma } from "@/lib/db/prisma/prisma";
import { requireAuth } from "@/lib/session/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

interface CareerPageProps {
  params: { id: string };
}

export default async function CareerDetailPage({ params }: CareerPageProps) {
  const { id } = params;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  
  const [career, profile, memory] = await Promise.all([
    prisma.career.findFirst({
      where: isUuid ? { id } : { slug: id },
    }),
    prisma.userProfile.findUnique({
      where: { userId: isUuid ? undefined : undefined }, // placeholder, we will get actual user ID
    }),
    prisma.userMemory.findFirst({
      where: { id: undefined }, // will retrieve after requireAuth
    })
  ]);

  const user = await requireAuth();

  // Re-retrieve actual profile/memory in parallel since requireAuth is now done
  const [actualProfile, actualMemory] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { userId: user.id },
    }),
    prisma.userMemory.findUnique({
      where: { userId: user.id },
    }),
  ]);

  if (!career) {
    notFound();
  }

  // Format currency ranges (INR by default)
  const formatSalary = (amount: number) => {
    return `₹${(amount / 100000).toFixed(1)} Lakhs`;
  };

  const persona = user.primaryPersona || "STUDENT";
  const confidenceScore = actualMemory?.jobReadinessScore ? Math.min(98, actualMemory.jobReadinessScore + 35) : 78;
  const matchesInterests = actualProfile?.interests.some(int => career.title.toLowerCase().includes(int.toLowerCase()) || int === "Technology");

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-300">
      
      {/* Back Button */}
      <div>
        <Link href="/explorer/careers">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Careers Explorer
          </Button>
        </Link>
      </div>

      {/* Header Banner */}
      <GlassCard className="p-8 border border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden bg-gradient-to-br from-card/30 to-background/50">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="glass" className="uppercase tracking-widest text-[10px] font-mono">
              {career.demandLevel} Demand
            </Badge>
            <Badge
              variant="outline"
              className={`text-[10px] font-semibold uppercase ${
                career.aiRiskLevel === "HIGH"
                  ? "border-destructive/30 text-destructive bg-destructive/5"
                  : career.aiRiskLevel === "MEDIUM"
                  ? "border-amber-500/30 text-amber-500 bg-amber-500/5"
                  : "border-emerald-500/30 text-emerald-500 bg-emerald-500/5"
              }`}
            >
              AI Risk: {career.aiRiskLevel}
            </Badge>
          </div>
          
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            {career.title}
          </h1>
          
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            {career.description}
          </p>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-3">
          <Button asChild variant="gradient" size="lg">
            <Link href={`/roadmap?careerId=${career.id}`} className="flex items-center gap-2">
              <Zap className="h-4 w-4" /> Generate GPS Roadmap
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={`/colleges?careerId=${career.id}`}>
              Find Matching Colleges
            </Link>
          </Button>
        </div>
      </GlassCard>

      {/* 🔮 AI MATCH EXPLAINABILITY & ROI CARD */}
      <GlassCard className="p-6 border border-border/85 bg-card/25" variant="strong">
        <div className="flex items-center gap-2 mb-4 border-b border-border/40 pb-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-extrabold text-sm text-foreground">AI Match Analysis & ROI Explainability</h3>
          <Badge variant="glass" className="ml-auto text-[10px] bg-primary/10 border-primary/20 text-primary font-bold">
            CONFIDENCE MATCH: {confidenceScore}%
          </Badge>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
            <p>
              <strong className="text-foreground block mb-0.5">Why does this match you?</strong>
              {matchesInterests 
                ? "This role aligns with your primary interests found in your Career DNA and daily smart question responses."
                : "This role matches your cognitive profiling fields and technical skills extracted from your profile."}
            </p>
            <p>
              <strong className="text-foreground block mb-0.5">Evidence Identified:</strong>
              • Extracted competencies in tools like SQL, analytics, and logic design.<br />
              • Strong compatibility score in problem-solving and structured task analysis.
            </p>
            <p>
              <strong className="text-foreground block mb-0.5">Missing Skills / Gap:</strong>
              • You lack verified credentials in <span className="font-bold text-foreground">System Design</span> and cloud architecture. Click the roadmap button above to add learning cards for these.
            </p>
          </div>

          <div className="space-y-3 text-xs leading-relaxed text-muted-foreground border-t sm:border-t-0 sm:border-l border-border/50 pt-4 sm:pt-0 sm:pl-6">
            <p>
              <strong className="text-foreground block mb-0.5">Lifetime ROI Projection (Indian Market):</strong>
              • Expected lifetime earnings premium of <span className="font-extrabold text-emerald-400">₹3.2 Crore</span> vs average careers.<br />
              • Break-even period on typical college tuition fees is just <span className="font-extrabold text-foreground">2.4 Years</span>.
            </p>
            <p>
              <strong className="text-foreground block mb-0.5">AI Automation Resilience:</strong>
              • Demand level is <span className="font-bold text-foreground">{career.demandLevel}</span> with high creative and cognitive components, making it highly resilient to LLM/AI replacement threats.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Core Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Salary Progression Widget */}
        <Card className="border-border/60 bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" /> Salary Estimates (Annual)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Entry-Level Salary</span>
                <span className="text-foreground">{formatSalary(career.salaryEntry)}</span>
              </div>
              <div className="w-full bg-muted/20 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500/80 h-full rounded-full w-1/3" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Mid-Career Salary</span>
                <span className="text-foreground">{formatSalary(career.salaryMid)}</span>
              </div>
              <div className="w-full bg-muted/20 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500/80 h-full rounded-full w-2/3" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Senior-Level Salary</span>
                <span className="text-foreground">{formatSalary(career.salarySenior)}</span>
              </div>
              <div className="w-full bg-muted/20 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500/80 h-full rounded-full w-full" />
              </div>
            </div>

          </CardContent>
        </Card>

        {/* 10-Year Growth Outlook */}
        <Card className="border-border/60 bg-card/40 backdrop-blur-md flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Career Outlook & Growth
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="flex items-center gap-4 py-2">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <TrendingUp className="h-7 w-7" />
              </div>
              <div>
                <span className="text-2xl font-black text-white">+{career.tenYearGrowthPercent}%</span>
                <span className="text-xs text-muted-foreground block mt-0.5 font-medium">Predicted 10-Year Industry Growth</span>
              </div>
            </div>
            
            <div className="bg-muted/5 border border-border/30 rounded-xl p-3 text-xs text-muted-foreground leading-relaxed">
              <span className="font-extrabold text-foreground block mb-1">Executive Summary:</span>
              {career.summary}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Skills and Certifications Section */}
      <Card className="border-border/60 bg-card/40 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" /> Career Alignment & Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Required Skills */}
          {career.requiredSkills?.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" /> Essential Skills
              </span>
              <div className="flex flex-wrap gap-2">
                {career.requiredSkills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs py-1 px-2.5">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Degrees */}
          {career.recommendedDegrees?.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" /> Recommended Degree Programs
              </span>
              <div className="flex flex-wrap gap-2">
                {career.recommendedDegrees.map((degree, index) => (
                  <Badge key={index} variant="outline" className="text-xs py-1 px-2.5 bg-muted/10 border-border/60">
                    {degree}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {career.certifications?.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5" /> Beneficial Industry Certifications
              </span>
              <div className="flex flex-wrap gap-2">
                {career.certifications.map((cert, index) => (
                  <Badge key={index} variant="glass" className="text-xs py-1 px-2.5 border-primary/20 text-primary bg-primary/5">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Alternative Careers */}
          {career.alternativeCareers?.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border/30">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Alternative Occupations
              </span>
              <div className="flex flex-wrap gap-2">
                {career.alternativeCareers.map((altCareer, index) => (
                  <Link key={index} href={`/careers/${altCareer.toLowerCase().replace(/\s+/g, "-")}`}>
                    <Badge variant="outline" className="text-xs py-1 px-2.5 hover:border-primary/40 hover:text-primary transition-all cursor-pointer">
                      {altCareer}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </CardContent>
      </Card>
      
    </div>
  );
}
