"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, TrendingUp, DollarSign, Shield, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { ExplorerPage } from "@career-os/types";

export function ExplorerPageClient({ type }: { type: "CAREER" | "COLLEGE" | "DEGREE" | "SKILL" }) {
  const [page, setPage] = useState<ExplorerPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`/api/explorer?type=${type}`)
      .then((r) => r.json())
      .then((res) => { setPage(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [type]);

  if (loading) return <ExplorerSkeleton />;
  if (!page) return <div className="p-6 text-center">Failed to load explorer data</div>;

  const filtered = page.seo.contentSections.find((s) => s.type === "LIST")?.items?.filter(
    (item) => item.toLowerCase().includes(search.toLowerCase()),
  ) ?? [];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">{page.seo.h1}</h1>
        <p className="text-muted-foreground">{page.seo.metaDescription}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-10" placeholder={`Search ${type.toLowerCase()}s...`} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item, i) => (
          <motion.div key={item} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">{item}</h3>
                  <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">{type}</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {page.stats && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader><CardTitle className="text-lg">Explore Stats</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center"><TrendingUp className="h-5 w-5 mx-auto mb-1 text-primary" /><div className="text-xl font-bold">{page.stats.totalCareers}</div><div className="text-xs text-muted-foreground">Careers</div></div>
              <div className="text-center"><Shield className="h-5 w-5 mx-auto mb-1 text-primary" /><div className="text-xl font-bold">{page.stats.totalColleges}</div><div className="text-xs text-muted-foreground">Colleges</div></div>
              <div className="text-center"><DollarSign className="h-5 w-5 mx-auto mb-1 text-primary" /><div className="text-xl font-bold">₹{(page.stats.averageSalary / 100000).toFixed(1)}L</div><div className="text-xs text-muted-foreground">Avg Salary</div></div>
              <div className="text-center"><TrendingUp className="h-5 w-5 mx-auto mb-1 text-primary" /><div className="text-xl font-bold">{page.stats.topDemandCareers.length}</div><div className="text-xs text-muted-foreground">Top Demand</div></div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {page.cta && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex gap-3 justify-center">
          <Button asChild><a href={page.cta.primary.url}>{page.cta.primary.text}</a></Button>
          <Button variant="outline" asChild><a href={page.cta.secondary.url}>{page.cta.secondary.text}</a></Button>
        </motion.div>
      )}
    </div>
  );
}

function ExplorerSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-10 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    </div>
  );
}
