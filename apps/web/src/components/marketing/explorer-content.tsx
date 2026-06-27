"use client";

import React, { useState } from "react";
import { Search, ExternalLink } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [search, setSearch] = useState("");

  // Map marketing explorer type to app route (personalized matches)
  const typeToRoute: Record<string, string> = {
    careers: "/careers",
    colleges: "/colleges",
    degrees: "/degrees",
    skills: "/skills",
    scholarships: "/colleges",
  };

  // Map marketing explorer type to general catalog search routes
  const typeToExplorerRoute: Record<string, string> = {
    careers: "/explorer/careers",
    colleges: "/explorer/colleges",
    degrees: "/explorer/degrees",
    skills: "/explorer/skills",
    scholarships: "/explorer/colleges",
  };

  const appRoute = typeToRoute[type] || "/dashboard";
  const explorerRoute = typeToExplorerRoute[type] || "/dashboard";

  const handleSearchSubmit = () => {
    if (session?.user) {
      router.push(`${explorerRoute}?search=${encodeURIComponent(search)}`);
    } else {
      router.push(`/register?search=${encodeURIComponent(search)}&callbackUrl=${encodeURIComponent(explorerRoute)}`);
    }
  };

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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearchSubmit();
            }}
            className="mt-8"
          >
            <Input
              placeholder="Search..."
              leftIcon={<Search className="h-4 w-4" />}
              size="lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
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
                <h3 className="text-lg font-semibold">Explore Your Matches & Database</h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                  You&apos;re signed in! You can view your personalized recommendations or search the entire general directory.
                </p>
                <div className="mt-6 flex flex-wrap gap-3 justify-center">
                  <Link href={appRoute}>
                    <Button variant="gradient" size="lg">
                      View My AI Matches
                    </Button>
                  </Link>
                  <Link href={explorerRoute}>
                    <Button variant="outline" size="lg" rightIcon={<ExternalLink className="h-4 w-4" />}>
                      Browse Directory
                    </Button>
                  </Link>
                </div>
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
