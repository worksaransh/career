"use client";

import React, { useState } from "react";
import { Megaphone, Users, Globe, Compass, Send, CheckCircle2, Clock } from "lucide-react";
import { createNotificationCampaign } from "@/lib/actions/admin-actions";
import toast from "react-hot-toast";

export default function AdminCampaignsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [channel, setChannel] = useState("IN_APP");
  const [userType, setUserType] = useState("ALL");
  const [language, setLanguage] = useState("ALL");
  const [sending, setSending] = useState(false);

  const handleLaunchCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error("Please fill in campaign title and notification message body");
      return;
    }

    setSending(true);
    const toastId = toast.loading("Launching notification campaign to target users...");
    try {
      const res = await createNotificationCampaign({
        title: title.trim(),
        body: body.trim(),
        userType,
        language,
      });

      if (res.success) {
        toast.success(`Campaign successfully dispatched to ${res.sentCount} users!`, { id: toastId });
        setTitle("");
        setBody("");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to trigger campaign", { id: toastId });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-foreground">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text text-transparent sm:text-4xl">
          Marketing Campaigns
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Trigger push alerts, dispatch bulk in-app announcements, target languages, and plan schedules.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Campaign Builder form */}
        <form onSubmit={handleLaunchCampaign} className="md:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-md space-y-4">
          <h3 className="text-sm font-bold text-foreground">Launch Announcement Campaign</h3>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Campaign Title</label>
              <input
                type="text"
                placeholder="e.g. New Assessment Available!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Notification Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground cursor-pointer"
              >
                <option value="IN_APP">In-App Notification</option>
                <option value="PUSH">System Push Notification</option>
                <option value="EMAIL">Email Dispatch</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Target User Type (Role)</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: "ALL", label: "All Users" },
                { code: "USER", label: "Students & Free" },
                { code: "ADMIN", label: "Admin Staff Only" },
              ].map((role) => (
                <button
                  type="button"
                  key={role.code}
                  onClick={() => setUserType(role.code)}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    userType === role.code
                      ? "border-primary text-primary bg-primary/5 shadow-sm"
                      : "border-border text-muted-foreground hover:text-foreground bg-card"
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Target Language</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { code: "ALL", label: "All Langs" },
                { code: "en", label: "English" },
                { code: "hi", label: "Hindi" },
                { code: "hng", label: "Hinglish" },
              ].map((lang) => (
                <button
                  type="button"
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    language === lang.code
                      ? "border-primary text-primary bg-primary/5 shadow-sm"
                      : "border-border text-muted-foreground hover:text-foreground bg-card"
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Announcement Message Body</label>
            <textarea
              rows={4}
              placeholder="Type your push or notification message details here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground h-11 text-xs font-bold hover:bg-primary/95 shadow-sm transition-all"
          >
            <Send className="h-4 w-4" /> Launch Live Campaign
          </button>
        </form>

        {/* Campaign Info Cards */}
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-md">
            <h3 className="text-sm font-bold text-foreground mb-4">Past Dispatch Campaigns</h3>
            <div className="space-y-4">
              {[
                { title: "Weekly Report Reminders", sent: "1,420 sent", time: "2 days ago", active: true },
                { title: "Summer Internship Alerts", sent: "320 sent", time: "1 week ago", active: false },
                { title: "AI Mentor Welcome", sent: "4,204 sent", time: "3 weeks ago", active: false },
              ].map((c, i) => (
                <div key={i} className="flex items-start justify-between text-xs">
                  <div>
                    <span className="font-bold text-foreground block">{c.title}</span>
                    <span className="text-[10px] text-muted-foreground/80 mt-0.5 block">{c.sent} · {c.time}</span>
                  </div>
                  <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    c.active ? "bg-emerald-500/10 text-emerald-500" : "bg-accent/40 text-muted-foreground"
                  }`}>
                    {c.active ? "Running" : "Sent"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
