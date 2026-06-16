"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, FileBarChart, Route, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import toast from "react-hot-toast";

interface ReportsClientProps {
  results: Array<{ id: string; completedAt: Date; assessment: { title: string } }>;
  roadmaps: Array<{ id: string; goalPosition: string; yearsToGoal: number; generatedAt: Date; career: { title: string } | null }>;
}

export function ReportsClient({ results, roadmaps }: ReportsClientProps) {
  const [generating, setGenerating] = useState<string | null>(null);

  const generateReport = async (type: string, id: string) => {
    setGenerating(`${type}-${id}`);
    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `career-os-${type}-report.html`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Report downloaded");
      } else {
        toast.error("Failed to generate report");
      }
    } catch {
      toast.error("Network error");
    }
    setGenerating(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-muted-foreground">Download your career assessment and roadmap reports</p>
        </div>
      </motion.div>

      {results.length === 0 && roadmaps.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Complete assessments and generate roadmaps to create reports.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="p-5 flex flex-col justify-between h-full">
                <div className="flex items-center gap-3 mb-4">
                  <FileBarChart className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-semibold text-sm">{r.assessment.title}</h3>
                    <p className="text-xs text-muted-foreground">{new Date(r.completedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateReport("assessment", r.id)}
                  disabled={generating === `assessment-${r.id}`}
                >
                  {generating === `assessment-${r.id}` ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Download Report
                </Button>
              </GlassCard>
            </motion.div>
          ))}

          {roadmaps.map((rm, i) => (
            <motion.div key={rm.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (results.length + i) * 0.05 }}>
              <GlassCard className="p-5 flex flex-col justify-between h-full">
                <div className="flex items-center gap-3 mb-4">
                  <Route className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-semibold text-sm">{rm.career?.title ?? "Career"} Roadmap</h3>
                    <Badge variant="outline" className="mt-1 text-[10px]">{rm.yearsToGoal} year plan</Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateReport("roadmap", rm.id)}
                  disabled={generating === `roadmap-${rm.id}`}
                >
                  {generating === `roadmap-${rm.id}` ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Download Report
                </Button>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
