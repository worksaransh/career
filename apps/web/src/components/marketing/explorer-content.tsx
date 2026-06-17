"use client";

import React from "react";
import { Search } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { AnimatedContainer } from "@/components/ui/animated-container";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ExplorerContentProps {
  title: string;
  description: string;
  type: string;
}

export function ExplorerContent({ title, description, type }: ExplorerContentProps) {
  const { data: session, status } = useSession();

  // Map marketing explorer type to app route
  const typeToRoute: Record<string, string> = {
    careers: "/careers",
    colleges: "/colleges",
    degrees: "/degrees",
    skills: "/skills",
    scholarships: "/colleges",
  };

  const appRoute = typeToRoute[type] || "/dashboard";

  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <AnimatedContainer animation="fadeUp">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="gradient-text">{title}</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{description}</p>
        </AnimatedContainer>

        <AnimatedContainer animation="fadeUp" delay={0.1}>
          <div className="mt-8">
            <Input
              placeholder="Search..."
              leftIcon={<Search className="h-4 w-4" />}
              size="lg"
            />
          </div>
        </AnimatedContainer>

        <AnimatedContainer animation="fadeUp" delay={0.2}>
          <GlassCard className="mt-8 flex flex-col items-center justify-center py-16 text-center">
            <Search className="mb-4 h-12 w-12 text-muted-foreground" />
            {status === "loading" ? (
              <>
                <h3 className="text-lg font-semibold">Loading...</h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                  Checking your session...
                </p>
              </>
            ) : session?.user ? (
              <>
                <h3 className="text-lg font-semibold">Explore Your Personalized Matches</h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                  You&apos;re signed in! Access your personalized {type} recommendations in your dashboard.
                </p>
                <Link href={appRoute} className="mt-4">
                  <Button variant="gradient" size="lg">
                    View My {title}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold">Start Exploring</h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                  Create a free account to get personalized {type} recommendations powered by AI.
                </p>
                <div className="mt-4 flex gap-3">
                  <Link href="/register">
                    <Button variant="gradient" size="lg">
                      Create Free Account
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="lg">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </GlassCard>
        </AnimatedContainer>
      </div>
    </div>
  );
}
