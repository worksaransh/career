"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Copy, Check, Share2, Sparkles, QrCode } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

interface ShareBrandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  careerName: string;
  matchPercentage?: number;
  streakCount: number;
  referralCode?: string;
}

export function ShareBrandingModal({
  isOpen,
  onClose,
  careerName,
  matchPercentage = 92,
  streakCount = 7,
  referralCode = "CAREER-OS-5432"
}: ShareBrandingModalProps) {
  const [isCopied, setIsCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/signup?ref=${referralCode}` 
    : `https://career-os-five-pi.vercel.app/signup?ref=${referralCode}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      toast.success("Referral link copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleDownloadSVG = () => {
    try {
      // Build a premium scalable SVG match card
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000" style="background:#0b0f19; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
          <defs>
            <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#111827" />
              <stop offset="50%" stop-color="#0f172a" />
              <stop offset="100%" stop-color="#1e1b4b" />
            </linearGradient>
            <linearGradient id="accent-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#6366f1" />
              <stop offset="100%" stop-color="#a855f7" />
            </linearGradient>
            <linearGradient id="emerald-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#10b981" />
              <stop offset="100%" stop-color="#059669" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="30" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" stroke-width="1" stroke-opacity="0.03" />
            </pattern>
          </defs>

          <!-- Background -->
          <rect width="800" height="1000" fill="url(#bg-grad)" />
          <rect width="800" height="1000" fill="url(#grid)" />

          <!-- Glowing Orbs -->
          <circle cx="200" cy="200" r="180" fill="#6366f1" fill-opacity="0.12" filter="url(#glow)" />
          <circle cx="600" cy="800" r="220" fill="#a855f7" fill-opacity="0.1" filter="url(#glow)" />

          <!-- Border Frame -->
          <rect x="30" y="30" width="740" height="940" rx="30" fill="none" stroke="#374151" stroke-width="2" stroke-opacity="0.4" />
          <rect x="40" y="40" width="720" height="920" rx="20" fill="none" stroke="#6366f1" stroke-width="1" stroke-opacity="0.15" />

          <!-- Header / Brand -->
          <text x="70" y="90" font-size="28" font-weight="900" fill="#ffffff" letter-spacing="1">CAREER <tspan fill="#6366f1">OS</tspan></text>
          <text x="70" y="120" font-size="14" font-weight="600" fill="#64748b" letter-spacing="2">AI PATHWAY PROTOCOL</text>
          <circle cx="710" cy="95" r="8" fill="#10b981" />
          <text x="690" y="100" font-size="12" font-weight="bold" fill="#64748b" text-anchor="end">SYS_ACTIVE</text>

          <!-- DNA Matching Hexagon Badge -->
          <g transform="translate(400, 260)">
            <!-- Outer Glow ring -->
            <circle cx="0" cy="0" r="95" fill="none" stroke="url(#accent-grad)" stroke-width="3" stroke-opacity="0.3" stroke-dasharray="10 5" />
            <circle cx="0" cy="0" r="85" fill="none" stroke="#6366f1" stroke-width="1.5" stroke-opacity="0.5" />
            
            <!-- DNA helix graphic -->
            <path d="M-40,-30 C-20,-10 20,-10 40,-30 M-40,30 C-20,10 20,10 40,30 M-40,0 C-20,-20 20,20 40,0" fill="none" stroke="#a855f7" stroke-width="3" stroke-opacity="0.6" />
            <circle cx="-40" cy="-30" r="4" fill="#6366f1" />
            <circle cx="40" cy="-30" r="4" fill="#a855f7" />
            <circle cx="-40" cy="30" r="4" fill="#a855f7" />
            <circle cx="40" cy="30" r="4" fill="#6366f1" />
            <line x1="-20" y1="-20" x2="-20" y2="20" stroke="#475569" stroke-width="2" />
            <line x1="0" y1="-10" x2="0" y2="10" stroke="#475569" stroke-width="2" />
            <line x1="20" y1="-20" x2="20" y2="20" stroke="#475569" stroke-width="2" />
            
            <rect x="-80" y="55" width="160" height="28" rx="14" fill="#1e1b4b" stroke="#312e81" stroke-width="1" />
            <text x="0" y="73" font-size="11" font-weight="bold" fill="#a855f7" text-anchor="middle" letter-spacing="1.5">GENETIC_ALIGN</text>
          </g>

          <!-- Match Percentage -->
          <text x="400" y="440" font-size="90" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="-2">${matchPercentage}%</text>
          <text x="400" y="475" font-size="18" font-weight="800" fill="url(#accent-grad)" text-anchor="middle" letter-spacing="4">COMPATIBILITY MATCH</text>

          <!-- Divider -->
          <line x1="150" y1="520" x2="650" y2="520" stroke="#334155" stroke-width="1.5" stroke-dasharray="5 5" />

          <!-- Target Career Details -->
          <text x="400" y="580" font-size="14" font-weight="bold" fill="#64748b" text-anchor="middle" letter-spacing="3">SELECTED OCCUPATIONAL TARGET</text>
          <text x="400" y="625" font-size="34" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="-0.5">${careerName.toUpperCase()}</text>

          <!-- Streak Info Badge -->
          <g transform="translate(180, 680)">
            <rect x="0" y="0" width="440" height="60" rx="18" fill="#111827" fill-opacity="0.6" stroke="#1f2937" stroke-width="1.5" />
            
            <circle cx="40" cy="30" r="16" fill="#10b981" fill-opacity="0.2" />
            <path d="M36,30 L39,33 L45,27" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" />
            
            <text x="75" y="28" font-size="13" font-weight="bold" fill="#f8fafc">CONSISTENCY SCORE</text>
            <text x="75" y="46" font-size="11" font-weight="600" fill="#64748b">Verified login pattern metrics</text>
            
            <text x="410" y="36" font-size="20" font-weight="800" fill="#10b981" text-anchor="end">${streakCount} DAY STREAK</text>
          </g>

          <!-- Bottom block: QR code and Referral -->
          <g transform="translate(80, 780)">
            <!-- QR code container mockup -->
            <rect x="0" y="0" width="120" height="120" rx="15" fill="#1e293b" fill-opacity="0.5" stroke="#334155" stroke-width="1.5" />
            
            <!-- Mock QR code pattern -->
            <g transform="translate(15, 15)" fill="#6366f1">
              <rect x="0" y="0" width="25" height="25" rx="3" />
              <rect x="5" y="5" width="15" height="15" fill="#0f172a" />
              <rect x="10" y="10" width="5" height="5" />
              
              <rect x="65" y="0" width="25" height="25" rx="3" />
              <rect x="70" y="5" width="15" height="15" fill="#0f172a" />
              <rect x="75" y="10" width="5" height="5" />
              
              <rect x="0" y="65" width="25" height="25" rx="3" />
              <rect x="5" y="70" width="15" height="15" fill="#0f172a" />
              <rect x="10" y="75" width="5" height="5" />
              
              <rect x="35" y="10" width="15" height="10" />
              <rect x="40" y="30" width="20" height="15" />
              <rect x="15" y="40" width="10" height="10" />
              <rect x="30" y="60" width="15" height="25" />
              <rect x="60" y="45" width="20" height="10" />
              <rect x="75" y="65" width="15" height="15" />
              <rect x="55" y="75" width="15" height="10" />
              <rect x="45" y="45" width="5" height="5" />
            </g>

            <!-- Text referral details -->
            <text x="150" y="35" font-size="13" font-weight="bold" fill="#64748b" letter-spacing="1.5">INVITATION REFERRAL CODE</text>
            <text x="150" y="65" font-size="24" font-weight="800" fill="#ffffff" letter-spacing="1">${referralCode}</text>
            <text x="150" y="90" font-size="11" font-weight="600" fill="#a855f7">Scan QR or use code to unlock premium modules +100XP</text>
          </g>

          <!-- Footer brand validation -->
          <text x="400" y="960" font-size="11" font-weight="600" fill="#475569" text-anchor="middle" letter-spacing="1.5">CAREER-OS.COM V1.4 © ALL RIGHTS RESERVED</text>
        </svg>
      `;

      const blob = new Blob([svgContent], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `career_os_match_${careerName.replace(/\s+/g, "_").toLowerCase()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Match card downloaded successfully!");
    } catch (err) {
      toast.error("Failed to generate download");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          {/* Backdrop click close */}
          <motion.div 
            className="absolute inset-0" 
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl z-10"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:bg-muted/10 hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Share2 className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-lg font-bold">Share Compatibility DNA</h2>
            </div>

            {/* Visual Card Card Preview */}
            <div className="relative overflow-hidden rounded-2xl border border-border bg-slate-950 p-5 text-white flex flex-col justify-between aspect-[4/5] shadow-inner mb-6">
              {/* Grid pattern overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
              
              {/* Glowing gradients */}
              <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-indigo-500/10 blur-[80px]" />
              <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-purple-500/10 blur-[80px]" />

              {/* Branding / Top row */}
              <div className="relative flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-extrabold tracking-wider text-slate-100 flex items-center gap-1">
                    CAREER <span className="text-primary">OS</span>
                  </h3>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">AI PATHWAY PROTOCOL</span>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[8px] font-extrabold text-emerald-400">ACTIVE</span>
                </div>
              </div>

              {/* Central DNA compatibility visual */}
              <div className="relative flex flex-col items-center py-4">
                <div className="relative h-20 w-20 flex items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-950/20 mb-3">
                  <Sparkles className="h-8 w-8 text-purple-400 animate-pulse" />
                  {/* Decorative circles */}
                  <div className="absolute inset-0 border border-dashed border-purple-500/20 rounded-full animate-spin [animation-duration:10s]" />
                </div>
                
                <h4 className="text-5xl font-black tracking-tight text-white">{matchPercentage}%</h4>
                <p className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest mt-1">Compatibility DNA</p>
              </div>

              {/* Career details */}
              <div className="relative border-t border-dashed border-slate-800 pt-3 text-center">
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Selected Target</span>
                <p className="text-lg font-black text-white">{careerName}</p>
              </div>

              {/* Streak Badge */}
              <div className="relative bg-slate-900/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[8px] font-bold text-slate-500 block">VERIFIED METRIC</span>
                  <span className="font-bold text-slate-200">Daily Login Consistency</span>
                </div>
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wide bg-emerald-500/10 px-2 py-1 rounded-lg">
                  {streakCount} DAY STREAK
                </span>
              </div>

              {/* QR Code and Referral footer */}
              <div className="relative flex items-center justify-between gap-4 border-t border-slate-800 pt-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700">
                    <QrCode className="h-6 w-6 text-slate-400" />
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-slate-500 block">REFERRAL CODE</span>
                    <span className="text-xs font-extrabold text-white tracking-wider">{referralCode}</span>
                  </div>
                </div>
                <span className="text-[8px] text-slate-500 font-semibold text-right leading-tight max-w-[140px]">
                  Scan or sign up via code to earn points +100XP
                </span>
              </div>
            </div>

            {/* Referral URL row */}
            <div className="mb-6">
              <span className="text-xs font-bold text-muted-foreground block mb-2">Referral Invite Link</span>
              <div className="flex items-center gap-2 bg-muted/30 border rounded-xl p-2 pl-3">
                <input 
                  type="text" 
                  readOnly 
                  value={shareUrl}
                  className="flex-1 bg-transparent text-xs text-muted-foreground focus:outline-none select-all font-mono"
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCopyLink}
                  className="h-8 w-8 p-0 rounded-lg"
                >
                  {isCopied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex gap-3">
              <Button 
                variant="gradient" 
                fullWidth 
                leftIcon={<Download className="h-4 w-4" />}
                onClick={handleDownloadSVG}
              >
                Download Match Card
              </Button>
              <Button 
                variant="outline" 
                onClick={onClose}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
