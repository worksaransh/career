"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, X, Tag, CreditCard, Sparkles, Loader2, ArrowRight, ShieldCheck, Gift } from "lucide-react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { cn } from "@/lib/utils/cn";
import { subscribeToPremium, validateCoupon } from "@/lib/actions/subscription-actions";
import toast from "react-hot-toast";

const subscriptionPlans = [
  {
    name: "Free Plan",
    price: "₹0",
    description: "Get started with basic career insights",
    features: [
      "Interest assessment questionnaire",
      "Basic career recommendations list",
      "3 college ROI comparisons",
      "Basic profile dashboard & streaking",
    ],
    cta: "Get Started Free",
    href: "/register",
    featured: false,
  },
  {
    name: "Premium Monthly",
    price: "₹499",
    period: "/month",
    description: "Unlock the full career operating system",
    features: [
      "All Free features included",
      "Career GPS roadmap & future simulator",
      "Lifetime Earnings Monte Carlo Simulator",
      "Secure document Vault & AI scoring metrics",
      "Weekly Challenges and Reflections sync",
      "Priority customer support",
    ],
    cta: "Start Premium Monthly",
    href: "/register?plan=premium",
    featured: true,
  },
  {
    name: "Premium Annual",
    price: "₹2,999",
    period: "/year",
    description: "Best value for long-term career planning",
    features: [
      "Everything in Premium Monthly",
      "Save 50% vs monthly payments",
      "AI Career Counselor chat unlock",
      "Priority roadmap feature updates",
      "LinkedIn & GitHub profile optimization check",
    ],
    cta: "Start Premium Annual",
    href: "/register?plan=premium-annual",
    featured: false,
  },
  {
    name: "Family Plan",
    price: "₹5,999",
    period: "/year",
    description: "Collaborative plan for parents and students",
    features: [
      "Everything in Premium Annual",
      "Up to 4 family member profiles",
      "Shared progress dashboard comparison",
      "Parent ROI & Intelligence dashboard",
      "Personalized family career workshops",
    ],
    cta: "Start Family Plan",
    href: "/register?plan=family",
    featured: false,
  },
];

const singleUnlocks = [
  {
    name: "₹99 Quick Unlock Report",
    price: 99,
    description: "Single PDF report download containing full interest analysis and matching colleges.",
  },
  {
    name: "₹299 Career Roadmap",
    price: 299,
    description: "One-time dynamic step-by-step pathway mapping milestones for your selected target occupation.",
  },
  {
    name: "₹499 Skill Roadmap",
    price: 499,
    description: "Complete technical roadmap detailing required frameworks, certifications, and project templates.",
  },
  {
    name: "₹999 Career Transition Plan",
    price: 999,
    description: "Full pivot guide comparing skills transferability, bridge courses, and salary changes side-by-side.",
  },
];

export function PricingSection() {
  const { data: session } = useSession();
  const router = useRouter();

  // Checkout modal states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState({ name: "Premium Monthly", price: 499 });
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const handleSubscriptionClick = (e: React.MouseEvent, plan: typeof subscriptionPlans[0]) => {
    if (plan.price === "₹0") return; // Let default router handle signup
    
    if (session?.user) {
      e.preventDefault();
      const rawPrice = plan.price.replace("₹", "").replace(",", "");
      setCheckoutItem({ name: plan.name, price: parseInt(rawPrice) });
      setIsCheckoutOpen(true);
    }
  };

  const handleUnlockClick = (item: typeof singleUnlocks[0]) => {
    if (!session?.user) {
      toast.error("Please sign in or register to buy single report unlocks.");
      router.push("/register");
      return;
    }
    setCheckoutItem({ name: item.name, price: item.price });
    setIsCheckoutOpen(true);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsCheckingCoupon(true);
    try {
      const result = await validateCoupon(couponCode);
      setAppliedCoupon(result.code);
      setDiscountPercent(result.discountPercentage);
      toast.success(`Coupon code ${result.code} applied! ${result.discountPercentage}% OFF`);
    } catch (err: any) {
      toast.error(err.message || "Invalid coupon code.");
    } finally {
      setIsCheckingCoupon(false);
    }
  };

  const handleCheckoutSubmit = async () => {
    setIsSubmittingCheckout(true);
    try {
      // Complete premium/D2C checkout sync
      const result = await subscribeToPremium(appliedCoupon || undefined);
      if (result.success) {
        setCheckoutSuccess(true);
        toast.success(`Purchase of ${checkoutItem.name} complete!`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to process payment upgrade.");
    } finally {
      setIsSubmittingCheckout(false);
    }
  };

  const discountAmount = Math.round((checkoutItem.price * discountPercent) / 100);
  const finalPrice = Math.max(0, checkoutItem.price - discountAmount);

  return (
    <section id="pricing" className="relative border-t border-border py-20 sm:py-28 text-foreground bg-background">
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title */}
        <AnimatedContainer animation="fadeUp">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="glass" size="lg" className="mb-4">
              Simple D2C Pricing
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Pay As You Go, Unlock When You&apos;re{" "}
              <span className="gradient-text">Ready</span>
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Activate flexible subscriptions or buy one-time specific report unlocks directly with transparent Indian pricing.
            </p>
          </div>
        </AnimatedContainer>

        {/* Subscription Plans Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {subscriptionPlans.map((plan, index) => (
            <AnimatedContainer
              key={plan.name}
              animation="fadeUp"
              delay={index * 0.05}
            >
              <GlassCard
                variant={plan.featured ? "strong" : "light"}
                className={cn(
                  "relative flex flex-col h-full border hover:border-primary/20 transition-all duration-300",
                  plan.featured && "animated-border shadow-indigo-500/10 shadow-lg"
                )}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="premium" size="lg" className="font-bold uppercase tracking-wider scale-90">
                      Popular Upgrade
                    </Badge>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-base font-extrabold">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">{plan.price}</span>
                    {plan.period && (
                      <span className="text-xs text-muted-foreground font-semibold">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {plan.description}
                  </p>
                </div>
                
                <ul className="mb-8 flex-1 space-y-3" role="list">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-xs leading-normal">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link href={plan.href} onClick={(e) => handleSubscriptionClick(e, plan)}>
                  <Button
                    variant={plan.featured ? "gradient" : "outline"}
                    fullWidth
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </GlassCard>
            </AnimatedContainer>
          ))}
        </div>

        {/* Single Add-on Report Unlocks Section */}
        <AnimatedContainer animation="fadeUp" delay={0.25} className="mt-20">
          <div className="text-center mb-8 max-w-xl mx-auto">
            <h3 className="text-2xl font-bold">One-Time Micro-Report Unlocks</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Don&apos;t want a subscription? Unlock individual files and reports instantly for a small single transaction fee.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {singleUnlocks.map((item, idx) => (
              <GlassCard
                key={idx}
                className="border border-border/80 p-5 bg-card/25 hover:border-primary/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    {item.name.split(" ").slice(1).join(" ")}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-border/60 flex items-center justify-between">
                  <span className="text-lg font-black text-white">₹{item.price}</span>
                  <Button
                    onClick={() => handleUnlockClick(item)}
                    size="sm"
                    variant="outline"
                  >
                    Unlock Report
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        </AnimatedContainer>

      </div>

      {/* D2C Local Checkout Simulator Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl backdrop-blur-lg flex flex-col text-foreground">
            
            {/* Close Button */}
            {!checkoutSuccess && (
              <button
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setCouponCode("");
                  setAppliedCoupon(null);
                  setDiscountPercent(0);
                }}
                className="absolute top-4 right-4 rounded-xl p-1.5 text-muted-foreground hover:bg-muted/10 hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {/* Modal Body */}
            {!checkoutSuccess ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">Checkout Secure Unlock</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Complete your purchase of <span className="font-bold text-primary">{checkoutItem.name}</span>.
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">{checkoutItem.name}</span>
                    <span>₹{checkoutItem.price}.00</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
                      <span>Discount ({discountPercent}%)</span>
                      <span>-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t border-border/60 pt-3 flex items-center justify-between font-extrabold text-sm">
                    <span>Total Amount due</span>
                    <span>₹{finalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Promo Code Fields */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Promo / Coupon Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="E.g. FREE"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={isSubmittingCheckout || appliedCoupon !== null}
                      className="flex-1 h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground uppercase font-bold"
                    />
                    {appliedCoupon ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAppliedCoupon(null);
                          setDiscountPercent(0);
                          setCouponCode("");
                        }}
                      >
                        Reset
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleApplyCoupon}
                        loading={isCheckingCoupon}
                      >
                        Apply
                      </Button>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground/80 leading-normal">
                    Tip: Enter coupon code <span className="font-bold text-primary font-mono">FREE</span> to discount this purchase by 100%!
                  </p>
                </div>

                <Button
                  variant="gradient"
                  fullWidth
                  size="lg"
                  onClick={handleCheckoutSubmit}
                  loading={isSubmittingCheckout}
                >
                  <CreditCard className="h-4 w-4 mr-2" /> Pay ₹{finalPrice.toFixed(2)} & Activate
                </Button>
              </div>
            ) : (
              // Success Screen
              <div className="text-center py-6 space-y-5">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <ShieldCheck className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">Purchase Confirmed!</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                    You have successfully unlocked <span className="font-bold text-white">{checkoutItem.name}</span>. Features and documents are now accessible in your dashboards.
                  </p>
                </div>
                <Button
                  variant="gradient"
                  fullWidth
                  size="lg"
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setCheckoutSuccess(false);
                    router.push("/dashboard");
                    router.refresh();
                  }}
                >
                  Go to Dashboard
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
