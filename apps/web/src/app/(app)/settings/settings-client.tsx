"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Settings, User, Bell, Shield, CreditCard, Save, Loader2, CheckCircle, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import { useI18n, LANG_LABELS, type Lang } from "@/providers/i18n-provider";

interface SettingsClientProps {
  user: { id: string; name: string | null; email: string | null; language?: string };
  profile: { preferences: Record<string, unknown> | null } | null;
  subscription: { tier: string; status: string } | null;
}

export function SettingsClient({ user, profile, subscription }: SettingsClientProps) {
  const { setLang, t } = useI18n();
  const [name, setName] = useState(user.name ?? "");
  const [language, setLanguageState] = useState<Lang>((user.language as Lang) ?? "en");
  const [saving, setSaving] = useState(false);
  
  const prefs = (profile?.preferences as Record<string, unknown>) ?? {};
  const [emailNotifs, setEmailNotifs] = useState((prefs.emailNotifications as boolean) ?? true);
  const [pushNotifs, setPushNotifs] = useState((prefs.pushNotifications as boolean) ?? true);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          language,
          emailNotifications: emailNotifs,
          pushNotifications: pushNotifs,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Profile updated");
        setLang(language);
      } else {
        toast.error("Failed to update");
      }
    } catch {
      toast.error("Network error");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">{t("settings")}</h1>
          <p className="text-sm text-muted-foreground">Manage your account preferences</p>
        </div>
      </motion.div>

      {/* Profile Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Profile Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Email" value={user.email ?? ""} disabled />
            <Button onClick={saveProfile} disabled={saving} variant="gradient" size="sm">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {t("done")}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Language Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" /> {t("selectLang")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-3">
            {(["en", "hi", "hinglish"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLanguageState(l)}
                className={`p-4 rounded-xl border text-center font-semibold transition-all duration-200 ${
                  language === l
                    ? "border-primary bg-primary/5 text-primary shadow-sm"
                    : "border-border hover:border-border/80 bg-muted/5 hover:bg-muted/10 text-muted-foreground"
                }`}
              >
                {LANG_LABELS[l]}
              </button>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Push Notifications</p>
                <p className="text-xs text-muted-foreground">Receive browser push notifications</p>
              </div>
              <Switch checked={pushNotifs} onCheckedChange={setPushNotifs} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Subscription Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> Subscription</CardTitle></CardHeader>
          <CardContent>
            {subscription ? (
              <div className="flex items-center gap-3">
                <Badge variant="default">{subscription.tier}</Badge>
                <span className="text-sm text-muted-foreground">Status: {subscription.status}</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Badge variant="outline">FREE</Badge>
                <span className="text-sm text-muted-foreground">No active subscription</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Privacy Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Privacy</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <a href="/privacy-center" className="text-sm text-primary hover:underline block">Privacy & Consent Center</a>
            <a href="/terms" className="text-sm text-primary hover:underline block">Terms of Service</a>
            <a href="/privacy" className="text-sm text-primary hover:underline block">Privacy Policy</a>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
