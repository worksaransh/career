"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Save, Loader2, Award, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import toast from "react-hot-toast";

interface ProfileClientProps {
  user: { id: string; name: string | null; email: string | null; createdAt: Date };
  profile: { interests: string[] | null; preferences: Record<string, unknown> | null } | null;
  assessments: Array<{ id: string; scores: Record<string, unknown>; completedAt: Date; assessment: { title: string } }>;
}

export function ProfileClient({ user, profile, assessments }: ProfileClientProps) {
  const [name, setName] = useState(user.name ?? "");
  const [saving, setSaving] = useState(false);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.success) toast.success("Profile updated");
      else toast.error("Failed to update");
    } catch {
      toast.error("Network error");
    }
    setSaving(false);
  };

  const interests = (profile?.interests as string[]) ?? [];

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <User className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your personal information</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Email" value={user.email ?? ""} disabled />
            <Input label="Member Since" value={new Date(user.createdAt).toLocaleDateString()} disabled />
            <Button onClick={saveProfile} disabled={saving} variant="gradient" size="sm">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {interests.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader><CardTitle>Interests</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest, i) => (
                  <Badge key={i} variant="secondary">{interest}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" /> Recent Assessments</CardTitle></CardHeader>
          <CardContent>
            {assessments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No assessments completed yet.</p>
            ) : (
              <div className="space-y-3">
                {assessments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{a.assessment.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
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
  );
}
