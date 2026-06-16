import React from "react";
import { Brain, ArrowRight, Award, ExternalLink } from "lucide-react";
import Link from "next/link";

import { requireAuth } from "@/lib/session/session";
import { prisma } from "@/lib/db/prisma/prisma";
import { getRecommendations } from "@/lib/graph/recommendations";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedContainer } from "@/components/ui/animated-container";

export const metadata = { title: "Certifications" };

export default async function CertificationsPage() {
  const user = await requireAuth();

  const latestResult = await prisma.assessmentResult.findFirst({ where: { userId: user.id } });

  if (!latestResult) {
    return (
      <div className="max-w-xl mx-auto py-16 animate-in fade-in duration-300">
        <GlassCard variant="strong" className="p-8 text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <Brain className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Unlock Certification Recommendations</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Complete your Interest Assessment first so we can recommend certifications that match your career goals.
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

  const recommendations = await getRecommendations(user.id, "SKILL");
  const skillIds = recommendations.map((r) => r.itemId);
  const skills = await prisma.skill.findMany({ where: { id: { in: skillIds } } });

  const certificationMap: Record<string, { name: string; provider: string; url: string }[]> = {
    Technology: [
      { name: "AWS Solutions Architect", provider: "Amazon", url: "https://aws.amazon.com/certification/" },
      { name: "Google Cloud Professional", provider: "Google", url: "https://cloud.google.com/certification" },
    ],
    "Data Science": [
      { name: "IBM Data Science Professional", provider: "IBM", url: "https://www.coursera.org/professional-certificates/ibm-data-science" },
    ],
    Design: [
      { name: "Google UX Design Certificate", provider: "Google", url: "https://www.coursera.org/professional-certificates/google-ux-design" },
    ],
    Business: [
      { name: "PMP Certification", provider: "PMI", url: "https://www.pmi.org/pmp" },
    ],
  };

  const certs = skills.flatMap((skill) => {
    const certsForCategory = certificationMap[skill.category] ?? [];
    return certsForCategory.map((c) => ({ ...c, skill: skill.name, skillCategory: skill.category }));
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">Professional Growth</span>
        <h1 className="text-3xl font-extrabold tracking-tight mt-1">Recommended Certifications</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Industry-recognized certifications to validate your skills and boost your career prospects.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {certs.length === 0 ? (
          <div className="col-span-full py-16 text-center text-sm text-muted-foreground border border-dashed border-border rounded-3xl bg-card/10">
            No certifications found for your skill profile. Try completing more assessments.
          </div>
        ) : (
          certs.map((cert, idx) => (
            <AnimatedContainer key={idx} animation="fadeUp" delay={idx * 0.05}>
              <GlassCard className="p-5 flex flex-col justify-between h-full hover:shadow-lg transition-all border border-border/80 hover:border-primary/40">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <Badge variant="outline" className="text-[10px]">{cert.skillCategory}</Badge>
                  </div>
                  <h3 className="font-bold text-sm">{cert.name}</h3>
                  <p className="text-xs text-muted-foreground">by {cert.provider}</p>
                  <p className="text-xs text-muted-foreground">Relevant skill: {cert.skill}</p>
                </div>
                <a href={cert.url} target="_blank" rel="noreferrer" className="mt-4 block">
                  <Button variant="outline" size="sm" fullWidth rightIcon={<ExternalLink className="h-3 w-3" />}>
                    Learn More
                  </Button>
                </a>
              </GlassCard>
            </AnimatedContainer>
          ))
        )}
      </div>
    </div>
  );
}
