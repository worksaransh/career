"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Search, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AnimatedContainer } from "@/components/ui/animated-container";

export function CtaSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);

    setTimeout(() => {
      setIsSearching(false);
      router.push(`/register?query=${encodeURIComponent(searchQuery.trim())}`);
    }, 1000);
  };

  return (
    <section className="relative border-t border-white/5 py-24 sm:py-32 bg-[#06060c]">
      
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] rounded-full bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-indigo-500/10 blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8 z-10">
        <AnimatedContainer animation="fadeUp">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 sm:p-16 shadow-[0_0_50px_rgba(16,185,129,0.03)] backdrop-blur-md">
            
            {/* Glowing borders */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/40 via-cyan-500/40 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/40 via-purple-500/40 to-transparent" />
            
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-md shadow-emerald-500/5">
              <Sparkles className="h-7 w-7 text-emerald-400" aria-hidden="true" />
            </div>

            <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Ready to Discover Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">Future Career</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Join 100,000+ students and professionals who use Career OS to find their path, calculate degree ROI, and verify their future.
            </p>

            {/* Interactive Career Search Input */}
            <form onSubmit={handleSearchSubmit} className="mt-10 max-w-md mx-auto relative flex items-center bg-white/[0.02] border border-white/5 p-1.5 rounded-2xl focus-within:border-emerald-500/45 transition-colors">
              <Search className="h-4 w-4 text-muted-foreground ml-3" />
              <input
                type="text"
                placeholder="Search any career path (e.g. AI Scientist)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isSearching}
                className="flex-1 h-10 bg-transparent px-3 text-xs text-white focus:outline-none placeholder-muted-foreground"
              />
              <Button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl h-10 px-4 text-xs font-bold shadow-md shadow-emerald-500/10 border-0 flex items-center gap-1 shrink-0"
              >
                {isSearching ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Search Path</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button
                  variant="gradient"
                  size="lg"
                  className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs h-10 rounded-xl"
                >
                  Onboard in 30 Seconds
                </Button>
              </Link>
            </div>
            
            <p className="mt-4 text-[10px] text-muted-foreground">
              Free forever basic account. No credit card required.
            </p>
          </div>
        </AnimatedContainer>
      </div>
    </section>
  );
}
