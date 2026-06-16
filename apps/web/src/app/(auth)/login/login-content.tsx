"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function LoginContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <GlassCard variant="strong" className="p-8">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold mb-6">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="gradient-text">Career OS</span>
        </Link>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to continue your journey
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive" role="alert">
            {error}
          </div>
        )}
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
          placeholder="Enter your password"
          required
          autoComplete="current-password"
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded border-border" />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Button variant="gradient" fullWidth size="lg" loading={isLoading}>
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary hover:underline font-medium">
          Sign up free
        </Link>
      </p>
    </GlassCard>
  );
}
