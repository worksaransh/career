import React from "react";
import Link from "next/link";
import { Brain, ArrowRight, Route, Clock, Target, Calendar, CheckSquare, BookOpen, Lock } from "lucide-react";

import { requireAuth } from "@/lib/session/session";
import { prisma } from "@/lib/db/prisma/prisma";
import { getRecommendations } from "@/lib/graph/recommendations";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedContainer } from "@/components/ui/animated-container";

export const metadata = { title: "Career GPS" };

interface RoadmapPageProps {
  searchParams: {
    careerId?: string;
  };
}

export default async function RoadmapPage({ searchParams }: RoadmapPageProps) {
  const user = await requireAuth();

  // Check if they completed their assessment
  const latestResult = await prisma.assessmentResult.findFirst({
    where: { userId: user.id },
  });

  if (!latestResult) {
    return (
      <div className="max-w-xl mx-auto py-16 animate-in fade-in duration-300">
        <GlassCard variant="strong" className="p-8 text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <Brain className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Generate Your GPS Roadmap</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Complete your Interest Assessment first so we can determine your optimal career matches and trace a custom multi-year roadmap to guide you there.
            </p>
          </div>
          <Link href="/assessments" className="block">
            <Button variant="gradient" fullWidth size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Start Interest Assessment
            </Button>
          </Link>
        </GlassCard>
      </div>
    );
  }

  // Load recommendations to identify top matching career if not specified in URL params
  const recommendations = await getRecommendations(user.id, "CAREER");
  const targetCareerId = searchParams.careerId || recommendations[0]?.itemId;

  if (!targetCareerId) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center text-sm text-muted-foreground border border-dashed border-border rounded-3xl bg-card/10 animate-in fade-in duration-300">
        No recommended careers found. Please retake the assessment or contact support.
      </div>
    );
  }

  // Fetch career details
  const career = await prisma.career.findUnique({
    where: { id: targetCareerId },
  });

  if (!career) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center text-sm text-muted-foreground border border-dashed border-border rounded-3xl bg-card/10 animate-in fade-in duration-300">
        The requested career profile does not exist.
      </div>
    );
  }

  // Query if a roadmap has already been generated
  let roadmap = await prisma.careerRoadmap.findFirst({
    where: { userId: user.id, careerId: career.id },
  });

  if (!roadmap) {
    // Self-generate a default 4-year roadmap based on career parameters and save it to the DB
    const milestones = [
      {
        year: 1,
        title: `Foundations of ${career.title}`,
        description: `Establish a strong base in core concepts required for ${career.title} fields.`,
        type: "EDUCATION",
        status: "CURRENT",
        tasks: [
          `Master fundamental tools and syntax related to ${career.requiredSkills[0] || "primary tools"}.`,
          `Complete online introductory tutorials and certifications.`,
          `Analyze basic system templates and document your learnings.`
        ],
        resources: [
          `Online introductory course syllabus`,
          `Official guides for ${career.requiredSkills[0] || "tools"}`
        ]
      },
      {
        year: 2,
        title: `Core Skill Specialization`,
        description: `Deep dive into advanced algorithms, structures, and practical models.`,
        type: "SKILL",
        status: "LOCKED",
        tasks: [
          `Build full-scale sandbox applications utilizing ${career.requiredSkills[1] || "advanced techniques"}.`,
          `Understand optimization, database handling, and APIs.`,
          `Deploy a public project workspace repository on GitHub.`
        ],
        resources: [
          `Technical textbooks and documentation`,
          `Hands-on coding challenges (e.g. LeetCode)`
        ]
      },
      {
        year: 3,
        title: `Real-World Projects & Internship`,
        description: `Apply your specialized capabilities in functional teams or individual builds.`,
        type: "INTERNSHIP",
        status: "LOCKED",
        tasks: [
          `Develop a collaborative project or secure a relevant trainee position.`,
          `Learn architectural system layouts and scalability parameters.`,
          `Obtain intermediate certification (e.g. ${career.certifications[0] || "Cloud Specialization"}).`
        ],
        resources: [
          `System design blogs and architectures`,
          `${career.certifications[0] || "Certification guidelines"}`
        ]
      },
      {
        year: 4,
        title: `Interview Prep & Landing Role`,
        description: `Refine your personal profile, practice coding evaluations, and secure your career entry point.`,
        type: "JOB",
        status: "LOCKED",
        tasks: [
          `Perform structured mock technical and behavioural interviews.`,
          `Assemble and publish a polished portfolio website showing your best work.`,
          `Update your LinkedIn profile and apply for professional positions.`
        ],
        resources: [
          `Interview preparation handbooks`,
          `Resume design checklist guides`
        ]
      }
    ];

    roadmap = await prisma.careerRoadmap.create({
      data: {
        userId: user.id,
        careerId: career.id,
        currentPosition: "Student / Career Switcher",
        goalPosition: career.title,
        yearsToGoal: 4,
        milestones: milestones,
      }
    });
  }

  // Fetch subscription status
  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const isPremium = subscription?.tier === "PREMIUM" && subscription?.status === "ACTIVE";

  // Parse milestones from JSON
  const milestonesList: any[] = Array.isArray(roadmap.milestones)
    ? roadmap.milestones
    : typeof roadmap.milestones === "string"
      ? JSON.parse(roadmap.milestones)
      : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">Navigation Compass</span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">Career GPS</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Step-by-step career path to land a job as a <span className="font-bold text-foreground">{career.title}</span>.
          </p>
        </div>
        <Link href="/careers">
          <Button variant="outline" size="sm">
            Change Target Career
          </Button>
        </Link>
      </div>

      {/* Target details card */}
      <GlassCard variant="light" className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span>Goal Position: <span className="font-bold text-foreground">{roadmap.goalPosition}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span>Timeline Estimate: <span className="font-bold text-foreground">{roadmap.yearsToGoal} Years</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>Generated: <span className="font-bold text-foreground">{new Date(roadmap.generatedAt).toLocaleDateString()}</span></span>
          </div>
        </div>
      </GlassCard>

      {/* Timeline nodes */}
      <div className="relative border-l-2 border-border/60 ml-4 pl-8 space-y-10">
        {milestonesList.slice(0, isPremium ? undefined : 1).map((m, mIdx) => {
          const isCurrent = m.status === "CURRENT";
          return (
            <AnimatedContainer key={mIdx} animation="fadeUp" delay={mIdx * 0.1} className="relative">
              
              {/* Timeline dot */}
              <span className={`absolute -left-12 top-1.5 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold shadow-sm ${
                isCurrent 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-background text-muted-foreground border-border"
              }`}>
                {m.year}
              </span>

              <GlassCard className={`p-6 border ${isCurrent ? "border-primary/40 shadow-md shadow-primary/5" : "border-border/85"}`}>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3 mb-4">
                  <h3 className="text-base font-bold text-foreground">
                    {m.title}
                  </h3>
                  <Badge variant={isCurrent ? "premium" : "glass"} className="text-[9px] uppercase tracking-wider">
                    {m.type}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed mb-5">
                  {m.description}
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Tasks */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block flex items-center gap-1.5">
                      <CheckSquare className="h-3.5 w-3.5 text-primary" /> Tasks to complete
                    </span>
                    <ul className="space-y-1.5">
                      {m.tasks.map((task: string, tIdx: number) => (
                        <li key={tIdx} className="text-xs text-muted-foreground leading-normal flex items-start gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary/70 mt-1.5 shrink-0" />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Resources */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-primary" /> Reference resources
                    </span>
                    <ul className="space-y-1.5">
                      {m.resources.map((res: string, rIdx: number) => (
                        <li key={rIdx} className="text-xs text-primary leading-normal font-medium flex items-center gap-1.5 hover:underline cursor-pointer">
                          <span className="h-1 w-1 bg-primary rounded-full" />
                          <span>{res}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </GlassCard>
            </AnimatedContainer>
          );
        })}

        {!isPremium && milestonesList.length > 1 && (
          <AnimatedContainer animation="fadeUp" className="relative">
            <span className="absolute -left-12 top-1.5 flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-primary bg-primary/5 text-primary text-xs font-bold shadow-sm">
              🔑
            </span>
            <GlassCard variant="strong" className="p-8 border border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-transparent flex flex-col items-center text-center space-y-4 shadow-xl">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Lock className="h-6 w-6" />
              </div>
              <div className="space-y-2 max-w-lg">
                <h3 className="text-xl font-bold">Unlock {milestonesList.length - 1} More Milestones</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your complete multi-year GPS roadmap guides you through Years 2-4 with specialized skills target benchmarks, real-world internships, premium certifications, and interview preparation.
                </p>
              </div>
              <Link href="/pricing">
                <Button variant="gradient" size="sm" className="mt-2">
                  Upgrade to Premium
                </Button>
              </Link>
            </GlassCard>
          </AnimatedContainer>
        )}
      </div>
    </div>
  );
}
