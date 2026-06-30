"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  Monitor,
  Search,
  Maximize2,
  ExternalLink,
  ChevronRight,
  Info,
  Sparkles,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Copy,
  Check,
  Layout,
  Filter,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import toast from "react-hot-toast";

interface ScreenMetadata {
  index: number;
  id: string;
  title: string;
  filename: string;
  width: string;
  height: string;
  deviceType: string;
}

interface ScreensClientProps {
  initialScreens: ScreenMetadata[];
}

export function ScreensClient({ initialScreens }: ScreensClientProps) {
  const [selectedScreen, setSelectedScreen] = useState<ScreenMetadata | null>(
    initialScreens[0] || null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [deviceFilter, setDeviceFilter] = useState<"ALL" | "MOBILE" | "DESKTOP">("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState(false);
  
  // Iframe controls
  const [zoom, setZoom] = useState(100);
  const [rotate, setRotate] = useState(false); // Portrait vs Landscape for mobile

  const categories = useMemo(() => {
    return [
      { id: "ALL", label: "All Screens" },
      { id: "ONBOARDING", label: "Onboarding & Auth" },
      { id: "DASHBOARD", label: "Dashboards" },
      { id: "CAREERS", label: "Careers Catalog" },
      { id: "COLLEGES", label: "Colleges & ROI" },
      { id: "MENTOR", label: "Mentors & Booking" },
      { id: "SKILLS", label: "Skills & Learning" },
      { id: "VAULT", label: "Vault & Resume" },
    ];
  }, []);

  const getScreenCategory = (title: string): string => {
    const t = title.toLowerCase();
    if (
      t.includes("interests") ||
      t.includes("user type") ||
      t.includes("sign up") ||
      t.includes("sign in") ||
      t.includes("welcome") ||
      t.includes("otp") ||
      t.includes("password") ||
      t.includes("about yourself") ||
      t.includes("forgot") ||
      t.includes("splash") ||
      t.includes("expertise")
    ) {
      return "ONBOARDING";
    }
    if (t.includes("dashboard") || t.includes("home") || t.includes("notifications")) {
      return "DASHBOARD";
    }
    if (
      t.includes("career") ||
      t.includes("salary") ||
      t.includes("demand") ||
      t.includes("timeline") ||
      t.includes("comparison")
    ) {
      return "CAREERS";
    }
    if (
      t.includes("college") ||
      t.includes("roi") ||
      t.includes("placement") ||
      t.includes("fee") ||
      t.includes("scholarship") ||
      t.includes("financing")
    ) {
      return "COLLEGES";
    }
    if (
      t.includes("mentor") ||
      t.includes("booking") ||
      t.includes("slots") ||
      t.includes("availability") ||
      t.includes("services") ||
      t.includes("chat") ||
      t.includes("mentee") ||
      t.includes("session")
    ) {
      return "MENTOR";
    }
    if (
      t.includes("skill") ||
      t.includes("certifications") ||
      t.includes("learning") ||
      t.includes("youtube") ||
      t.includes("upgrade")
    ) {
      return "SKILLS";
    }
    if (
      t.includes("resume") ||
      t.includes("portfolio") ||
      t.includes("ats") ||
      t.includes("streak") ||
      t.includes("achievements") ||
      t.includes("progress") ||
      t.includes("goals") ||
      t.includes("readiness") ||
      t.includes("upgrade") ||
      t.includes("interview") ||
      t.includes("applications") ||
      t.includes("coach")
    ) {
      return "VAULT";
    }
    return "OTHER";
  };

  const filteredScreens = useMemo(() => {
    return initialScreens.filter((screen) => {
      const matchesSearch = screen.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDevice =
        deviceFilter === "ALL" ||
        (deviceFilter === "MOBILE" && screen.deviceType === "MOBILE") ||
        (deviceFilter === "DESKTOP" && screen.deviceType === "DESKTOP");
      
      const category = getScreenCategory(screen.title);
      const matchesCategory = selectedCategory === "ALL" || category === selectedCategory;

      return matchesSearch && matchesDevice && matchesCategory;
    });
  }, [initialScreens, searchQuery, deviceFilter, selectedCategory]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    toast.success("Resource ID copied to clipboard!");
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Design Guidelines details specifically for Career GPS AI
  const designGuidelines = {
    theme: "Career GPS AI (Dark Mode First)",
    colors: {
      primary: "Electric Blue (#adc6ff / #3b82f6) - Used for primary actions and active navigation items",
      secondary: "Deep Purple (#d0bcff / #8b5cf6) - Used for intelligence indicators and progress curves",
      tertiary: "Cyan (#4cd7f6 / #06b6d4) - Used for data highlights and success status",
      background: "Pure Black (#000000) or Deep Slate (#0b1326)",
      surface: "Glass layers: 4% to 8% White Opacity with 20px backdrop-blur and 1px white border (10% opacity)",
    },
    typography: {
      display: "Inter - Tight tracking (-0.02em) with Bold weights for standard headings",
      labels: "Geist - Semi-bold for metrics, labels, numbers, and technical data details",
      body: "Inter - Clean fallback with 1.5x line height spacing for readability",
    },
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6 text-foreground overflow-hidden">
      {/* Sidebar Panel: Screens List */}
      <div className="w-80 flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-xl shrink-0">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Stitch Mockups ({initialScreens.length})</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search mockups..."
              className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-muted-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Sidebar Category Filter */}
        <div className="px-4 py-2 border-b border-border overflow-x-auto hide-scrollbar whitespace-nowrap bg-accent/20 flex gap-1.5 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {cat.label.split(" ")[0]}
            </button>
          ))}
        </div>

        {/* Device Quick Toggle */}
        <div className="grid grid-cols-3 p-2 bg-accent/10 border-b border-border text-center text-[10px] font-bold">
          <button
            onClick={() => setDeviceFilter("ALL")}
            className={`py-1 rounded-md transition-all ${deviceFilter === "ALL" ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground"}`}
          >
            All
          </button>
          <button
            onClick={() => setDeviceFilter("MOBILE")}
            className={`py-1 rounded-md flex items-center justify-center gap-1 transition-all ${deviceFilter === "MOBILE" ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground"}`}
          >
            <Smartphone className="h-3 w-3" /> Mobile
          </button>
          <button
            onClick={() => setDeviceFilter("DESKTOP")}
            className={`py-1 rounded-md flex items-center justify-center gap-1 transition-all ${deviceFilter === "DESKTOP" ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground"}`}
          >
            <Monitor className="h-3 w-3" /> Desktop
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          <AnimatePresence>
            {filteredScreens.length > 0 ? (
              filteredScreens.map((screen) => {
                const isSelected = selectedScreen?.id === screen.id;
                return (
                  <motion.button
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={screen.id}
                    onClick={() => {
                      setSelectedScreen(screen);
                      setZoom(100);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all duration-200 ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 border border-primary"
                        : "hover:bg-accent border border-transparent"
                    }`}
                  >
                    <div className="space-y-0.5 truncate">
                      <p className="text-xs font-bold truncate">{screen.title}</p>
                      <div className="flex items-center gap-2 text-[9px] opacity-80 font-mono">
                        <span className="uppercase tracking-widest bg-black/10 px-1 rounded">
                          {screen.deviceType}
                        </span>
                        <span>#{screen.index}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 opacity-60 shrink-0 ml-2" />
                  </motion.button>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No mockups match the filters
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Preview Sandbox */}
      <div className="flex-1 flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
        {/* Preview Topbar */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-accent/10">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <Eye className="h-4.5 w-4.5 text-primary" />
              {selectedScreen ? selectedScreen.title : "No Mockup Selected"}
            </h3>
            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
              {selectedScreen ? `public/screens/${selectedScreen.filename}` : "-"}
            </p>
          </div>

          {selectedScreen && (
            <div className="flex items-center gap-2">
              {/* Zoom Buttons */}
              <div className="flex items-center bg-background border border-border rounded-xl px-1.5 py-0.5 gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg"
                  onClick={() => setZoom(Math.max(50, zoom - 10))}
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <span className="text-[10px] font-mono w-9 text-center font-bold">{zoom}%</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg"
                  onClick={() => setZoom(Math.min(150, zoom + 10))}
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Mobile Portrait / Landscape Toggle */}
              {selectedScreen.deviceType === "MOBILE" && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-xl"
                  onClick={() => setRotate(!rotate)}
                  title="Rotate Device"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              )}

              {/* Action Buttons */}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-xl"
                onClick={() => window.open(`/screens/${selectedScreen.filename}`, "_blank")}
                title="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Sandbox Canvas */}
        <div className="flex-1 bg-background/50 relative overflow-auto p-8 flex items-center justify-center border-b border-border">
          {selectedScreen ? (
            <div
              style={{
                transform: `scale(${zoom / 100})`,
                transition: "transform 0.2s ease-out",
              }}
              className="origin-center"
            >
              {selectedScreen.deviceType === "MOBILE" ? (
                /* Premium Mobile Device Frame */
                <div
                  className={`relative mx-auto rounded-[3rem] border-4 border-slate-800 bg-slate-950 shadow-2xl overflow-hidden transition-all duration-300 ${
                    rotate ? "w-[800px] h-[450px]" : "w-[390px] h-[800px]"
                  }`}
                  style={{
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(59, 130, 246, 0.15)",
                  }}
                >
                  {/* Phone Notch/Dynamic Island */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-full z-30 flex items-center justify-between px-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-950/80 border border-slate-800"></div>
                    <div className="w-4 h-1 bg-slate-950/80 rounded-full border border-slate-800"></div>
                  </div>
                  
                  {/* Embedded Iframe */}
                  <iframe
                    src={`/screens/${selectedScreen.filename}`}
                    className="w-full h-full border-none z-10"
                    title={selectedScreen.title}
                  />
                </div>
              ) : (
                /* Premium Desktop Browser Frame */
                <div
                  className="w-[1024px] h-[640px] rounded-2xl border border-border bg-slate-950 shadow-2xl overflow-hidden flex flex-col"
                  style={{
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 50px rgba(59, 130, 246, 0.1)",
                  }}
                >
                  {/* Browser Header Bar */}
                  <div className="bg-accent/10 border-b border-border px-4 py-2.5 flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                    </div>
                    <div className="flex-1 max-w-md mx-auto bg-background/80 border border-border/80 rounded-lg px-3 py-1 text-[10px] text-muted-foreground truncate select-none text-center font-mono">
                      https://career-os.local/admin/screens/{selectedScreen.filename}
                    </div>
                  </div>
                  
                  {/* Embedded Iframe */}
                  <iframe
                    src={`/screens/${selectedScreen.filename}`}
                    className="w-full flex-grow border-none"
                    title={selectedScreen.title}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-2">
              <Smartphone className="h-10 w-10 text-muted-foreground/40 mx-auto" />
              <p className="text-sm text-muted-foreground">Select a mockup to preview</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Spec & Design Guidelines */}
      <div className="w-80 flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-xl shrink-0">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Info className="h-4.5 w-4.5 text-primary" />
          <h2 className="text-sm font-bold uppercase tracking-wider">Specifications & Spec</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin text-xs">
          {selectedScreen ? (
            <>
              {/* Mockup Spec */}
              <div className="space-y-3">
                <h4 className="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Mockup Data</h4>
                <div className="space-y-2.5 bg-accent/20 border border-border p-3 rounded-xl font-mono text-[10px]">
                  <div>
                    <span className="text-muted-foreground">Title:</span>
                    <p className="font-bold text-foreground font-sans mt-0.5">{selectedScreen.title}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Device Type:</span>
                    <p className="font-bold text-foreground mt-0.5">{selectedScreen.deviceType}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dimensions:</span>
                    <p className="font-bold text-foreground mt-0.5">
                      {selectedScreen.width}px x {selectedScreen.height}px
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Stitch Resource ID:</span>
                    <div className="flex items-center justify-between mt-1 p-1 bg-background rounded border border-border/80 gap-1.5">
                      <span className="truncate text-[9px] select-all">{selectedScreen.id}</span>
                      <button
                        onClick={() => copyToClipboard(selectedScreen.id)}
                        className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                      >
                        {copiedId ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Design System Guidelines */}
              <div className="space-y-4">
                <div className="flex items-center gap-1.5">
                  <Layout className="h-4 w-4 text-primary" />
                  <h4 className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">
                    Design Guidelines
                  </h4>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <h5 className="font-bold text-foreground flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span> Colors
                    </h5>
                    <div className="pl-3 mt-1 space-y-1.5 text-muted-foreground text-[11px]">
                      <div>
                        <span className="font-bold text-foreground/80">Primary:</span> {designGuidelines.colors.primary}
                      </div>
                      <div>
                        <span className="font-bold text-foreground/80">Secondary:</span> {designGuidelines.colors.secondary}
                      </div>
                      <div>
                        <span className="font-bold text-foreground/80">Tertiary:</span> {designGuidelines.colors.tertiary}
                      </div>
                      <div>
                        <span className="font-bold text-foreground/80">Surfaces:</span> {designGuidelines.colors.surface}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-bold text-foreground flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span> Typography
                    </h5>
                    <div className="pl-3 mt-1 space-y-1 text-muted-foreground text-[11px]">
                      <div>
                        <span className="font-bold text-foreground/80">Headings:</span> {designGuidelines.typography.display}
                      </div>
                      <div>
                        <span className="font-bold text-foreground/80">Labels:</span> {designGuidelines.typography.labels}
                      </div>
                      <div>
                        <span className="font-bold text-foreground/80">Body Text:</span> {designGuidelines.typography.body}
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/5 border border-primary/20 p-3 rounded-xl space-y-1">
                    <p className="font-bold text-primary flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" /> High-Fidelity Implementation
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Use standard layout grid (mobile 4cols, desktop 12cols). Accent highlights and glass elements must retain background blurs (12px to 24px) for premium UI finish.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground mt-8">Select a mockup screen to see details.</p>
          )}
        </div>
      </div>
    </div>
  );
}
