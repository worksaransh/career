"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {}
    setLoading(false);
  };

  return (
    <GlassCard variant="strong" className="p-8">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold mb-6">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="gradient-text">Career OS</span>
        </Link>
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {sent ? (
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            If an account exists with <strong>{email}</strong>, you&apos;ll receive a password reset link shortly.
          </p>
          <Link href="/login" className="text-sm text-primary hover:underline">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="john@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" variant="gradient" fullWidth size="lg" loading={loading}>
            Send Reset Link
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </form>
      )}
    </GlassCard>
  );
}
