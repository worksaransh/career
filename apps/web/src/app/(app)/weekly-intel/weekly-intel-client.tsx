"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Lightbulb, Quote, ArrowRight, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { WeeklyIntelligence } from "@career-os/types";

export function WeeklyIntelClient({ userId }: { userId: string }) {
  const [data, setData] = useState<WeeklyIntelligence | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/weekly-intelligence")
      .then((r) => r.json())
      .then((res) => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [userId]);

  if (loading) return <WeeklyIntelSkeleton />;
  if (!data) return <EmptyState />;

  const severityIcon = (severity: string) => {
    if (severity === "WARNING") return <AlertCircle className="h-4 w-4 text-amber-500" />;
    if (severity === "SUCCESS") return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    return <Lightbulb className="h-4 w-4 text-blue-500" />;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <Sparkles className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">{data.title}</h1>
          <p className="text-sm text-muted-foreground">{data.summary}</p>
        </div>
      </motion.div>

      {data.nudge && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${data.nudge.priority === "HIGH" ? "bg-amber-100 dark:bg-amber-900/30" : "bg-blue-100 dark:bg-blue-900/30"}`}>
              <Lightbulb className={`h-5 w-5 ${data.nudge.priority === "HIGH" ? "text-amber-600" : "text-blue-600"}`} />
            </div>
            <span className="font-medium">{data.nudge.message}</span>
          </div>
          <Button size="sm" asChild><a href={data.nudge.actionUrl}>{data.nudge.action} <ArrowRight className="ml-1 h-4 w-4" /></a></Button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><TrendingUp className="h-5 w-5" /> Trending Careers</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {data.trendingCareers.map((c, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="font-medium">{c.title}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={c.trend === "UP" ? "default" : "secondary"}>
                      {c.trend === "UP" ? "+" : ""}{c.percentageChange}%
                    </Badge>
                    <span className="text-xs text-muted-foreground">{c.reason}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Lightbulb className="h-5 w-5" /> Insights</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {data.insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                  {severityIcon(insight.severity)}
                  <span className="text-sm">{insight.message}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader><CardTitle className="text-lg">Recommended Actions</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {data.recommendedActions.map((action) => (
              <div key={action.id} className="p-4 rounded-xl border glass hover:shadow-md transition-shadow">
                <Badge variant="outline" className="mb-2">{action.category}</Badge>
                <h3 className="font-semibold mb-1">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">{action.effort} effort</Badge>
                  <Badge variant="secondary" className="text-xs">{action.impact} impact</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center p-6 glass rounded-xl">
        <Quote className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
        <p className="italic text-lg">&ldquo;{data.quote.text}&rdquo;</p>
        <p className="text-sm text-muted-foreground mt-1">— {data.quote.author}</p>
      </motion.div>
    </div>
  );
}

function WeeklyIntelSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-16 w-full rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
      <Skeleton className="h-32 rounded-xl" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="max-w-4xl mx-auto p-6 text-center">
      <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h2 className="text-xl font-semibold mb-2">No intelligence data yet</h2>
      <p className="text-muted-foreground">Complete your assessments to get personalized weekly insights</p>
    </div>
  );
}
