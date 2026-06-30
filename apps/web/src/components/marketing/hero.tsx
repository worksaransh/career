"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Play,
  LayoutDashboard,
  MessageSquare,
  TrendingUp,
  CheckCircle2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { AnimatedContainer } from "@/components/ui/animated-container";

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
}

const careerTracks = [
  {
    id: "ai-eng",
    name: "AI Engineer",
    match: "96%",
    salary: [8, 14, 22, 38, 55],
    skills: ["Python", "PyTorch", "LLMs", "Vector DBs", "LangChain"],
    roadmap: [
      { step: "Year 1", title: "Neural Networks & ML Basics" },
      { step: "Year 2", title: "LLM Fine-tuning & Embeddings" },
      { step: "Year 3", title: "MLOps & Cloud Deployment" },
      { step: "Year 4", title: "AI Architect at Tech Startup" }
    ]
  },
  {
    id: "ux-des",
    name: "Product Designer",
    match: "92%",
    salary: [6, 11, 18, 28, 40],
    skills: ["Figma", "User Research", "Design Systems", "Prototyping", "Handoff"],
    roadmap: [
      { step: "Year 1", title: "UI Principles & Figma Mastery" },
      { step: "Year 2", title: "UX Case Studies & User Testing" },
      { step: "Year 3", title: "Design Systems & Frontend Basics" },
      { step: "Year 4", title: "UX Designer at FAANG / Unicorn" }
    ]
  },
  {
    id: "prod-mgr",
    name: "Product Manager",
    match: "88%",
    salary: [10, 16, 25, 36, 50],
    skills: ["Agile/Scrum", "Product Strategy", "SQL & Analytics", "UX Basics", "Market Research"],
    roadmap: [
      { step: "Year 1", title: "Product Management Fundamentals" },
      { step: "Year 2", title: "UX & Data Analytics Mastery" },
      { step: "Year 3", title: "Associate PM / Business Analyst" },
      { step: "Year 4", title: "Product Manager Core Role" }
    ]
  },
  {
    id: "quant-analyst",
    name: "Quant Analyst",
    match: "85%",
    salary: [15, 24, 38, 55, 80],
    skills: ["C++ / Python", "Stochastic Calculus", "Time-series Models", "Risk Management", "SQL"],
    roadmap: [
      { step: "Year 1", title: "Stochastic Calc & Stats Mastery" },
      { step: "Year 2", title: "Algorithmic Trading & Finance" },
      { step: "Year 3", title: "Internship at Hedge Fund Desk" },
      { step: "Year 4", title: "Quant Analyst Hire" }
    ]
  }
];

const chatScenarios = [
  {
    q: "Is AI going to replace developers?",
    a: "No. AI will automate boilerplate coding, but it increases the demand for AI architects, security engineers, and domain-experts. Growth in AI-developer roles is projected at +34% by 2030."
  },
  {
    q: "Match High Design + Tech skills",
    a: "Top matches: Creative Technologist, UX/UI Engineer, and AR/VR Interaction Developer. Average salary package: ₹12L - ₹18L. These bridge roles are highly resilient to AI automation."
  },
  {
    q: "Roadmap to become a PM",
    a: "Pathway: 1. Master UX & Agile. 2. Launch a side-project (show product execution). 3. Apply for APM roles. Average salary range: ₹10L - ₹15L entry."
  }
];

export function HeroSection({ title, subtitle, ctaText }: HeroSectionProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "dashboard">("dashboard");
  const [selectedTrack, setSelectedTrack] = useState<(typeof careerTracks)[number]>(careerTracks[0]!);
  
  // Chat Simulator State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: "Hello! Select a question below to see how Career GPS AI maps out career options for you."
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const titleParts = (title || "See Your Future|Before You Decide").split("|");

  const handleChatQuestion = (questionText: string, answerText: string) => {
    if (isTyping) return;
    setChatMessages((prev) => [...prev, { sender: "user", text: questionText }]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setChatMessages((prev) => [...prev, { sender: "ai", text: answerText }]);
    }, 1200);
  };

  return (
    <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28 bg-[#06060c]">
      {/* Background Decorative Mesh Gradients */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/5 blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-cyan-500/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          
          {/* Left Column: Headline and Content */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <AnimatedContainer animation="fadeUp" delay={0.1}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span>New: GPT-4o Powered Advisor</span>
              </div>
            </AnimatedContainer>

            <AnimatedContainer animation="fadeUp" delay={0.2}>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-white leading-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400">
                  {titleParts[0]}
                </span>
                {titleParts[1] && (
                  <>
                    <br />
                    <span className="text-white">{titleParts[1]}</span>
                  </>
                )}
              </h1>
            </AnimatedContainer>

            <AnimatedContainer animation="fadeUp" delay={0.3}>
              <p className="text-base text-muted-foreground sm:text-lg max-w-xl leading-relaxed">
                {subtitle || "Increase your lifetime earnings with our AI-powered growth ecosystem. Get personalized skill roadmaps, ROI-backed college options, and direct path mapping to high-paying careers."}
              </p>
            </AnimatedContainer>

            <AnimatedContainer animation="fadeUp" delay={0.4}>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link href="/register">
                  <Button
                    variant="gradient"
                    size="xl"
                    className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 hover:opacity-95 text-white font-bold tracking-wide shadow-lg shadow-cyan-500/15"
                    rightIcon={<ArrowRight className="h-5 w-5" />}
                  >
                    {ctaText || "Launch Your Career OS"}
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" size="xl" className="border-white/10 text-white hover:bg-white/5 flex items-center justify-center gap-2">
                    <Play className="h-4 w-4 fill-white text-white" />
                    <span>Explore Features</span>
                  </Button>
                </Link>
              </div>
            </AnimatedContainer>

            <AnimatedContainer animation="fadeUp" delay={0.45}>
              <div className="flex items-center gap-4 pt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>30s Free Assessment</span>
                </div>
                <div className="h-3 w-px bg-white/10" />
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  <span>No Card Required</span>
                </div>
              </div>
            </AnimatedContainer>
          </div>

          {/* Right Column: Interactive AI Demo Widget */}
          <div className="lg:col-span-6 w-full">
            <AnimatedContainer animation="slideUp" delay={0.3} className="w-full">
              <GlassCard className="border border-white/5 shadow-2xl p-0 overflow-hidden bg-card/60 backdrop-blur-xl">
                
                {/* Simulated Widget Top Bar with Navigation Tabs */}
                <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/50" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
                  </div>
                  
                  {/* Tab Selector */}
                  <div className="flex bg-white/5 p-0.5 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setActiveTab("dashboard")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        activeTab === "dashboard"
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/10"
                          : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      <LayoutDashboard className="h-3.5 w-3.5" />
                      <span>Dashboard View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("chat")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        activeTab === "chat"
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/10"
                          : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>AI Advisor Chat</span>
                    </button>
                  </div>
                  
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                    LIVE
                  </span>
                </div>

                {/* Simulated Widget Body */}
                <div className="h-[400px] flex overflow-hidden">
                  
                  {/* TAB 1: DASHBOARD VIEW */}
                  <AnimatePresence mode="wait">
                    {activeTab === "dashboard" && (
                      <motion.div
                        key="dashboard"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 flex flex-col sm:flex-row"
                      >
                        {/* Sidebar: List of Careers */}
                        <div className="w-full sm:w-[180px] border-b sm:border-b-0 sm:border-r border-white/5 p-3 space-y-2 bg-white/[0.01] shrink-0">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-2 sm:block hidden">Matched Tracks</p>
                          <div className="flex sm:flex-col overflow-x-auto sm:overflow-x-visible gap-1.5 sm:gap-1 scrollbar-hide py-1 sm:py-0">
                            {careerTracks.map((track) => (
                              <button
                                key={track.id}
                                type="button"
                                onClick={() => setSelectedTrack(track)}
                                className={`shrink-0 sm:w-full text-left p-2 rounded-xl transition-all flex flex-col gap-0.5 ${
                                  selectedTrack.id === track.id
                                    ? "bg-emerald-500/10 border border-emerald-500/20 text-white"
                                    : "border border-transparent text-muted-foreground hover:text-white hover:bg-white/5"
                                }`}
                              >
                                <span className="text-xs font-bold block truncate">{track.name}</span>
                                <div className="flex items-center justify-between w-full sm:flex hidden">
                                  <span className="text-[9px] text-muted-foreground">Match Fit</span>
                                  <span className="text-[9px] font-bold text-emerald-400">{track.match}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Right Content Panel: Detailed Track View */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-hide">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-base font-extrabold text-white">{selectedTrack.name}</h3>
                              <p className="text-[10px] text-muted-foreground">AI recommendation based on design + tech strengths</p>
                            </div>
                            <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-1 rounded-xl font-bold">
                              Fit: {selectedTrack.match}
                            </span>
                          </div>

                          {/* 1. Salary Forecast Chart */}
                          <div className="rounded-xl border border-white/5 bg-white/[0.01] p-3 space-y-2">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-semibold text-muted-foreground flex items-center gap-1">
                                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                                Salary Projection (₹ L/Year)
                              </span>
                              <span className="font-bold text-white">Entry: ₹{selectedTrack.salary[0]!}L → Y10: ₹{selectedTrack.salary[4]!}L</span>
                            </div>
                            
                            {/* Simple SVG Chart */}
                            <div className="h-20 w-full pt-2">
                              <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                                <defs>
                                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                                  </linearGradient>
                                </defs>
                                <path
                                  d={`M 0 30 
                                     L 0 ${30 - selectedTrack.salary[0]! / 3} 
                                     L 25 ${30 - selectedTrack.salary[1]! / 3} 
                                     L 50 ${30 - selectedTrack.salary[2]! / 3} 
                                     L 75 ${30 - selectedTrack.salary[3]! / 3} 
                                     L 100 ${30 - selectedTrack.salary[4]! / 3} 
                                     L 100 30 Z`}
                                  fill="url(#chartGrad)"
                                />
                                <path
                                  d={`M 0 ${30 - selectedTrack.salary[0]! / 3} 
                                     L 25 ${30 - selectedTrack.salary[1]! / 3} 
                                     L 50 ${30 - selectedTrack.salary[2]! / 3} 
                                     L 75 ${30 - selectedTrack.salary[3]! / 3} 
                                     L 100 ${30 - selectedTrack.salary[4]! / 3}`}
                                  fill="none"
                                  stroke="#10b981"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                />
                                {selectedTrack.salary.map((s, idx) => (
                                  <circle
                                    key={idx}
                                    cx={idx * 25}
                                    cy={30 - s / 3}
                                    r="1.5"
                                    fill="#ffffff"
                                    stroke="#10b981"
                                    strokeWidth="1"
                                  />
                                ))}
                              </svg>
                              <div className="flex justify-between text-[8px] text-muted-foreground pt-1 px-1">
                                <span>Entry</span>
                                <span>Yr 3</span>
                                <span>Yr 5</span>
                                <span>Yr 8</span>
                                <span>Yr 10</span>
                              </div>
                            </div>
                          </div>

                          {/* 2. Skills Stack & Timeline */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-white/5 bg-white/[0.01] p-2.5 space-y-1.5">
                              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Target Skills</span>
                              <div className="flex flex-wrap gap-1">
                                {selectedTrack.skills.map((skill) => (
                                  <span key={skill} className="text-[9px] bg-white/5 border border-white/5 px-2 py-0.5 rounded-full text-foreground">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="rounded-xl border border-white/5 bg-white/[0.01] p-2.5 space-y-1.5">
                              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Roadmap Steps</span>
                              <div className="space-y-1">
                                {selectedTrack.roadmap.slice(0, 3).map((r) => (
                                  <div key={r.step} className="flex items-center gap-1.5 text-[8.5px]">
                                    <span className="font-bold text-emerald-400">{r.step}:</span>
                                    <span className="text-muted-foreground truncate">{r.title}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* TAB 2: AI ADVISOR CHAT */}
                    {activeTab === "chat" && (
                      <motion.div
                        key="chat"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 flex flex-col justify-between p-3.5"
                      >
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-hide">
                          {chatMessages.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`flex ${
                                msg.sender === "user" ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[85%] rounded-2xl p-2.5 text-xs leading-relaxed ${
                                  msg.sender === "user"
                                    ? "bg-indigo-600 text-white rounded-br-none"
                                    : "bg-white/5 border border-white/5 text-muted-foreground rounded-bl-none"
                                }`}
                              >
                                {msg.sender === "ai" && (
                                  <Sparkles className="h-3.5 w-3.5 text-emerald-400 inline mr-1.5 mb-0.5" />
                                )}
                                <span>{msg.text}</span>
                              </div>
                            </div>
                          ))}
                          
                          {isTyping && (
                            <div className="flex justify-start">
                              <div className="bg-white/5 border border-white/5 rounded-2xl rounded-bl-none p-2.5 text-xs text-muted-foreground flex items-center gap-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Interactive Pill Questions */}
                        <div className="border-t border-white/5 pt-3 mt-2 space-y-2 bg-card/10">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Select a question to test AI</p>
                          <div className="flex flex-wrap gap-1.5">
                            {chatScenarios.map((scen, idx) => {
                              const alreadyAsked = chatMessages.some((msg) => msg.text === scen.q);
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleChatQuestion(scen.q, scen.a)}
                                  disabled={isTyping || alreadyAsked}
                                  className={`text-[10px] px-3 py-1.5 rounded-full border transition-all text-left truncate max-w-full ${
                                    alreadyAsked
                                      ? "opacity-40 bg-white/2 border-white/2 text-muted-foreground cursor-default"
                                      : "bg-white/5 border-white/5 hover:border-emerald-500/35 hover:bg-emerald-500/5 text-foreground hover:text-white"
                                  }`}
                                >
                                  {scen.q}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </GlassCard>
            </AnimatedContainer>
          </div>

        </div>
      </div>
    </section>
  );
}
