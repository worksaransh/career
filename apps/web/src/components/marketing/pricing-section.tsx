"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, X, Tag, CreditCard, Sparkles, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { cn } from "@/lib/utils/cn";
import { subscribeToPremium, validateCoupon } from "@/lib/actions/subscription-actions";
import toast from "react-hot-toast";

const plans = [
  {
    name: "Free",
    price: "₹0",
    description: "Get started with basic career insights",
    features: [
      "Interest assessment",
      "Basic career matches",
      "3 college comparisons",
      "Profile dashboard",
      "Email support",
    ],
    cta: "Get Started Free",
    href: "/register",
    featured: false,
  },
  {
    name: "Premium",
    price: "₹499",
    period: "/month",
    description: "Unlock the full career operating system",
    features: [
      "All Free features",
      "Complete assessment suite",
      "Unlimited career matches",
      "Unlimited college comparisons",
      "Career GPS roadmap",
      "Future simulator",
      "Parent dashboard",
      "Premium PDF reports",
      "AI salary forecasting",
      "Priority support",
    ],
    cta: "Start Premium",
    href: "/register?plan=premium",
    featured: true,
  },
  {
    name: "School",
    price: "Custom",
    description: "For schools and educational institutions",
    features: [
      "Everything in Premium",
      "Bulk student accounts",
      "Admin dashboard",
      "Analytics & reporting",
      "White-label option",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    href: "/contact",
    featured: false,
  },
];

export function PricingSection() {
  const { data: session } = useSession();
  const router = useRouter();

  // Checkout modal states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const handlePlanClick = (e: React.MouseEvent, plan: typeof plans[0]) => {
    // If selecting premium and user is authenticated, open local modal checkout
    if (plan.name === "Premium" && session?.user) {
      e.preventDefault();
      setIsCheckoutOpen(true);
    }
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
      const result = await subscribeToPremium(appliedCoupon || undefined);
      if (result.success) {
        setCheckoutSuccess(true);
        toast.success("Subscription updated successfully!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to process premium upgrade.");
    } finally {
      setIsSubmittingCheckout(false);
    }
  };

  const basePrice = 499;
  const discountAmount = Math.round((basePrice * discountPercent) / 100);
  const finalPrice = Math.max(0, basePrice - discountAmount);

  return (
    <section id="pricing" className="relative border-t border-border py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedContainer animation="fadeUp">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="glass" size="lg" className="mb-4">
              Simple Pricing
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Start Free, Upgrade When You&apos;re{" "}
              <span className="gradient-text">Ready</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              No hidden fees. No credit card required. Cancel anytime.
            </p>
          </div>
        </AnimatedContainer>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <AnimatedContainer
              key={plan.name}
              animation="fadeUp"
              delay={index * 0.1}
            >
              <GlassCard
                variant={plan.featured ? "strong" : "light"}
                className={cn(
                  "relative flex flex-col h-full",
                  plan.featured && "animated-border scale-105 lg:scale-110",
                )}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="premium" size="lg">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-sm text-muted-foreground">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>
                <ul className="mb-8 flex-1 space-y-3" role="list">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} onClick={(e) => handlePlanClick(e, plan)}>
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
      </div>

      {/* Premium Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-border/80 bg-background/95 p-6 shadow-2xl backdrop-blur-lg flex flex-col text-foreground">
            
            {/* Close Button */}
            {!checkoutSuccess && (
              <button
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setCouponCode("");
                  setAppliedCoupon(null);
                  setDiscountPercent(0);
                }}
                className="absolute top-4 right-4 rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {/* Modal Body */}
            {!checkoutSuccess ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">Upgrade to Premium</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Get lifetime simulation, complete assessments, roadmaps, and prioritised support.
                  </p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Premium Plan (1 Month)</span>
                    <span className="font-semibold text-foreground">₹499.00</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex items-center justify-between text-sm text-emerald-500 font-medium">
                      <span>Discount ({discountPercent}%)</span>
                      <span>-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t border-border/60 pt-3 flex items-center justify-between font-bold text-base">
                    <span>Total Amount</span>
                    <span>₹{finalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Promo Code Fields */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Have a promo code?</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. FREE"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={isSubmittingCheckout || appliedCoupon !== null}
                      className="flex-1 h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground uppercase font-semibold"
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
                  <p className="text-[10px] text-muted-foreground font-medium">
                    Tip: Enter coupon code <span className="font-bold text-primary font-mono">FREE</span> to upgrade for ₹0!
                  </p>
                </div>

                <Button
                  variant="gradient"
                  fullWidth
                  size="lg"
                  onClick={handleCheckoutSubmit}
                  loading={isSubmittingCheckout}
                >
                  <CreditCard className="h-4 w-4 mr-2" /> Pay & Activate Premium
                </Button>
              </div>
            ) : (
              // Success Screen
              <div className="text-center py-6 space-y-5">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <Check className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">Upgrade Complete!</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    You are now a Career OS Premium member. Access to all assessments, simulators, and roadmap GPS is now unlocked.
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

