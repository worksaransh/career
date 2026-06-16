"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { signIn } from "next-auth/react";

import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function RegisterContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <GlassCard variant="strong" className="p-8">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold mb-6">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="gradient-text">Career OS</span>
        </Link>
        <h1 className="text-2xl font-bold">Discover your future</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your account in 30 seconds. Free forever.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setIsLoading(true);
          setError(null);
          const formData = new FormData(e.currentTarget);
          try {
            const res = await fetch("/api/auth/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: formData.get("name"),
                email: formData.get("email"),
                password: formData.get("password"),
                confirmPassword: formData.get("password"),
                acceptedTerms: true,
              }),
            });
            const data = await res.json();
            if (res.ok) {
              await signIn("credentials", {
                email: formData.get("email"),
                password: formData.get("password"),
                callbackUrl: "/onboarding",
              });
            } else {
              setError(data?.error?.message ?? "Registration failed. Please try again.");
            }
          } catch {
            setError("Network error. Please try again.");
          }
          setIsLoading(false);
        }}
      >
        <Input
          label="Full Name"
          name="name"
          placeholder="John Doe"
          required
          autoComplete="name"
        />
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="john@example.com"
          required
          autoComplete="email"
        />
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Create a strong password"
          required
          autoComplete="new-password"
        />
        <Input
          label="Phone (optional)"
          name="phone"
          type="tel"
          placeholder="+91 98765 43210"
        />
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" required className="mt-1 rounded border-border" />
          <span className="text-muted-foreground">
            I agree to the{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </span>
        </label>
        <Button variant="gradient" fullWidth size="lg" loading={isLoading}>
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </GlassCard>
  );
}
