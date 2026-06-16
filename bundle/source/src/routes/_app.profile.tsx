import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Loader2, LogOut, Shield, User, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProfile, updateProfile } from "@/lib/career.functions";
import { checkIsAdmin } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Profile — Career GPS AI" }] }),
  component: Profile,
});

function Profile() {
  const navigate = useNavigate();
  const fetchProfile = useServerFn(getProfile);
  const save = useServerFn(updateProfile);
  const adminCheck = useServerFn(checkIsAdmin);
  const { data, isLoading, refetch } = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile() });
  const { data: adminData } = useQuery({ queryKey: ["admin-check"], queryFn: () => adminCheck(), retry: false });
  const [form, setForm] = React.useState({ full_name: "", class_level: "", stream: "", city: "" });
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (data) {
      setForm({
        full_name: data.full_name ?? "",
        class_level: data.class_level ?? "",
        stream: data.stream ?? "",
        city: data.city ?? "",
      });
    }
  }, [data]);

  async function onSave() {
    setSaving(true);
    try {
      await save({ data: form });
      toast.success("Profile saved");
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-hero text-white shadow-glow">
          <User className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{form.full_name || "Your profile"}</h1>
          <p className="text-xs text-muted-foreground">{data?.email}</p>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card">
        <Field label="Full name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
        <Field label="Class (e.g. 12)" value={form.class_level} onChange={(v) => setForm({ ...form, class_level: v })} />
        <Field label="Stream (Science / Commerce / Arts)" value={form.stream} onChange={(v) => setForm({ ...form, stream: v })} />
        <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />

        <Button onClick={onSave} disabled={saving} className="h-11 w-full bg-gradient-hero text-white shadow-glow">
          {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
          Save changes
        </Button>
      </div>

      <Link
        to="/billing"
        className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-card transition-colors hover:bg-muted/40"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero text-white shadow-glow">
            <Crown className="h-5 w-5" />
          </span>
          <div>
            <div className="text-sm font-semibold">My plan & rewards</div>
            <div className="text-xs text-muted-foreground">Streak, referrals, counsellor & upgrades</div>
          </div>
        </div>
        <span className="text-xs font-medium text-primary">Open →</span>
      </Link>

      {adminData?.isAdmin && (
        <Link
          to="/admin"
          className="flex items-center justify-between rounded-2xl border border-primary/30 bg-primary/5 p-5 shadow-card transition-colors hover:bg-primary/10"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Shield className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-semibold">Admin console</div>
              <div className="text-xs text-muted-foreground">Manage users, content & analytics</div>
            </div>
          </div>
          <span className="text-xs font-medium text-primary">Open →</span>
        </Link>
      )}

      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Sign out</div>
            <div className="text-xs text-muted-foreground">End your session on this device.</div>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="mr-1 h-4 w-4" /> Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 h-11" maxLength={120} />
    </div>
  );
}
