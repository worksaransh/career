"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  TrendingUp,
  DollarSign,
  Shield,
  ExternalLink,
  HelpCircle,
  MapPin,
  Award,
  Clock,
  Cpu,
  Lock,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/glass-card";
import type { ExplorerPage } from "@career-os/types";

export function ExplorerPageClient({ type }: { type: "CAREER" | "COLLEGE" | "DEGREE" | "SKILL" }) {
  const [page, setPage] = useState<ExplorerPage | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(initialSearch);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetch(`/api/explorer?type=${type}&search=${encodeURIComponent(search)}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.success) {
            setPage(res.data);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [type, search]);

  const stats = page?.stats;
  const items = page?.richItems || [];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in duration-300">
      
      {/* Title block */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <Badge variant="glass" className="text-primary border-primary/20 bg-primary/5 uppercase font-mono tracking-wider">
          GPS Explorer
        </Badge>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          {page?.seo.h1 ?? `Explore ${type.toLowerCase()}s`}
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          {page?.seo.metaDescription ?? `Browse and search in-demand ${type.toLowerCase()}s in India.`}
        </p>
      </motion.div>

      {/* Search Input */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10 h-11 border-border/80 bg-muted/10 focus:bg-background transition-all rounded-xl"
            placeholder={`Search by name, category, description, or location...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Main Grid Content */}
      {loading ? (
        <ExplorerSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item: any, i: number) => {
            const delay = 0.03 * Math.min(i, 15);
            
            // COLLEGE CARD
            if (type === "COLLEGE") {
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay }}
                >
                  <Link href={`/colleges/${item.slug}`}>
                    <GlassCard className="p-5 flex flex-col justify-between h-full hover:shadow-lg transition-all border border-border/60 hover:border-primary/40 relative group cursor-pointer">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-bold text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
                            {item.name}
                          </h3>
                          <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          <span className="line-clamp-1">{item.location}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 py-2 border-t border-b border-border/30 bg-muted/5 rounded-lg p-2.5 text-xs">
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Avg Package</span>
                            <span className="font-extrabold text-foreground mt-0.5 block">
                              ₹{(item.avgPackage / 100000).toFixed(1)}L
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Total Fees</span>
                            <span className="font-extrabold text-foreground mt-0.5 block">
                              ₹{(item.feesTotal / 100000).toFixed(1)}L
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-transparent">
                          Placement: {item.placementPercent}%
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-mono font-semibold">
                          NIRF Rank: #{item.ranking}
                        </span>
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              );
            }

            // CAREER CARD
            if (type === "CAREER") {
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay }}
                >
                  <Link href={`/careers/${item.id}`}>
                    <GlassCard className="p-5 flex flex-col justify-between h-full hover:shadow-lg transition-all border border-border/60 hover:border-primary/40 relative group cursor-pointer">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-bold text-base leading-snug group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                          <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                          {item.description}
                        </p>

                        <div className="grid grid-cols-2 gap-3 py-2 border-t border-b border-border/30 bg-muted/5 rounded-lg p-2.5 text-xs">
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Salary (Entry - Sr)</span>
                            <span className="font-extrabold text-foreground mt-0.5 block">
                              ₹{(item.salaryEntry / 100000).toFixed(0)}L - ₹{(item.salarySenior / 100000).toFixed(0)}L
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Growth Rate</span>
                            <span className="font-extrabold text-foreground mt-0.5 block flex items-center gap-1">
                              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> +{item.futureGrowthRate}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2 flex-wrap">
                        <Badge variant="glass" className="text-[10px]">
                          AI Risk: {item.aiRiskLevel}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] bg-muted/30">
                          {item.demandLevel} Demand
                        </Badge>
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              );
            }

            // DEGREE CARD
            if (type === "DEGREE") {
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay }}
                >
                  <GlassCard className="p-5 flex flex-col justify-between h-full hover:shadow-lg transition-all border border-border/60 relative group">
                    <div className="space-y-4">
                      <h3 className="font-bold text-base leading-snug group-hover:text-primary transition-colors">
                        {item.name}
                      </h3>

                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {item.description}
                      </p>

                      <div className="grid grid-cols-2 gap-3 py-2 border-t border-b border-border/30 bg-muted/5 rounded-lg p-2.5 text-xs">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary shrink-0" />
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Duration</span>
                            <span className="font-extrabold text-foreground mt-0.5 block">
                              {item.duration}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-emerald-500 shrink-0" />
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Total Cost</span>
                            <span className="font-extrabold text-foreground mt-0.5 block">
                              ₹{(item.costTotal / 100000).toFixed(1)}L
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px]">
                        AI Resilience: {item.aiResilience}%
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-mono font-semibold">
                        ROI Score: {item.riskAdjustedScore}/100
                      </span>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            }

            // SKILL CARD
            if (type === "SKILL") {
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay }}
                >
                  <GlassCard className="p-5 flex flex-col justify-between h-full hover:shadow-lg transition-all border border-border/60 relative group">
                    <div className="space-y-4">
                      <div>
                        <Badge variant="glass" className="text-[10px] mb-2">
                          {item.category}
                        </Badge>
                        <h3 className="font-bold text-base leading-snug group-hover:text-primary transition-colors">
                          {item.name}
                        </h3>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Difficulty: <span className="font-semibold text-foreground">{item.difficulty}</span>
                      </span>
                      <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-transparent">
                        Demand: {item.demand}
                      </Badge>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            }

            return null;
          })}

          {items.length === 0 && (
            <div className="col-span-full text-center py-16 glass rounded-xl border border-dashed border-border p-6">
              <HelpCircle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-bold text-base mb-1">No matching {type.toLowerCase()}s found</h3>
              <p className="text-xs text-muted-foreground">Try modifying your search spelling or keywords.</p>
            </div>
          )}
        </div>
      )}

      {/* Dynamic Statistics Block */}
      {stats && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-border/60 bg-card/40 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-extrabold uppercase tracking-widest text-muted-foreground">
                Database Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6 py-4">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground block">Mapped Careers</span>
                <span className="text-2xl font-black text-foreground">{stats.totalCareers}</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground block">Verified Colleges</span>
                <span className="text-2xl font-black text-foreground">{stats.totalColleges}</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground block">Degree Streams</span>
                <span className="text-2xl font-black text-foreground">{stats.totalDegrees}</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground block">Avg Starting Salary</span>
                <span className="text-2xl font-black text-emerald-500">₹{(stats.averageSalary / 100000).toFixed(1)}L</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Call To Actions */}
      {page?.cta && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex gap-3 justify-center pt-4">
          <Button asChild variant="default" size="lg">
            <Link href={page.cta.primary.url}>{page.cta.primary.text}</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href={page.cta.secondary.url}>{page.cta.secondary.text}</Link>
          </Button>
        </motion.div>
      )}
    </div>
  );
}

function ExplorerSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} className="h-44 rounded-2xl bg-muted/20 border border-border/20" />
      ))}
    </div>
  );
}
