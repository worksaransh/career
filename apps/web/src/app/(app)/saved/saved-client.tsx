"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, Trash2, Briefcase, GraduationCap, Building2, Zap, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";

interface SavedItem {
  id: string;
  itemType: string;
  itemId: string;
  note: string | null;
  createdAt: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  CAREER: <Briefcase className="h-4 w-4" />,
  DEGREE: <GraduationCap className="h-4 w-4" />,
  COLLEGE: <Building2 className="h-4 w-4" />,
  SKILL: <Zap className="h-4 w-4" />,
};

export function SavedClient({ userId }: { userId: string }) {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/saved")
      .then((r) => r.json())
      .then((data) => { if (data.success) setItems(data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const removeItem = async (id: string) => {
    setDeleting(id);
    const res = await fetch(`/api/saved?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Item removed");
    } else {
      toast.error("Failed to remove item");
    }
    setDeleting(null);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <Bookmark className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Saved Items</h1>
          <p className="text-sm text-muted-foreground">{items.length} items saved</p>
        </div>
      </motion.div>

      {items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No saved items yet. Browse careers, degrees, colleges, and skills to save them here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {TYPE_ICONS[item.itemType] ?? <Bookmark className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{item.itemType}</Badge>
                      <span className="text-xs text-muted-foreground">
                        Saved {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {item.note && <p className="text-sm text-muted-foreground mt-1">{item.note}</p>}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  disabled={deleting === item.id}
                >
                  {deleting === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-destructive" />
                  )}
                </Button>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
