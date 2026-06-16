"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <GlassCard variant="strong" className="p-8 text-center">
        <p className="text-sm text-muted-foreground">Invalid or missing reset token.</p>
        <Link href="/forgot-password" className="text-sm text-primary hover:underline mt-2 block">
          Request a new link
        </Link>
      </GlassCard>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(data?.error?.message ?? "Reset failed");
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <GlassCard variant="strong" className="p-8">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold mb-6">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="gradient-text">Career OS</span>
        </Link>
        <h1 className="text-2xl font-bold">Set new password</h1>
      </div>

      {success ? (
        <div className="text-center space-y-4">
          <p className="text-sm text-emerald-500">Password reset successfully. Redirecting to sign in...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <Input
            label="New Password"
            name="password"
            type="password"
            placeholder="Create a strong password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" variant="gradient" fullWidth size="lg" loading={loading}>
            Reset Password
          </Button>
        </form>
      )}
    </GlassCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <GlassCard variant="strong" className="p-8 text-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </GlassCard>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
