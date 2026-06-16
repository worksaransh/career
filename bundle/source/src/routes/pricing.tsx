import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles, ArrowRight, Star, Zap, Crown, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckoutModal } from "@/components/paywall/checkout-modal";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Disha" },
      { name: "description", content: "Simple, transparent pricing for students and parents. Start free, upgrade when you're ready." },
      { property: "og:title", content: "Pricing — Disha" },
      { property: "og:description", content: "Simple, transparent pricing for students and parents." },
    ],
  }),
  component: Pricing,
});

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "forever",
    icon: <Sparkles className="h-5 w-5" />,
    tone: "muted" as const,
    description: "Try Disha with no commitment.",
    features: [
      "15-minute AI assessment",
      "Top 5 career matches",
      "Basic career overview",
      "English, Hindi & Hinglish",
    ],
    cta: "Start free",
    href: "/language",
  },
  {
    id: "snapshot",
    name: "Career Snapshot",
    price: "₹99",
    period: "one-time",
    icon: <Zap className="h-5 w-5" />,
    tone: "saffron" as const,
    description: "Get the full picture of your best-fit career.",
    features: [
      "Everything in Free",
      "Detailed career report (PDF)",
      "Salary & demand analysis",
      "AI risk score",
      "Top companies & degrees",
    ],
    cta: "Get snapshot",
    href: "/language",
  },
  {
    id: "roadmap",
    name: "Career Roadmap",
    price: "₹299",
    period: "one-time",
    icon: <Star className="h-5 w-5" />,
    tone: "primary" as const,
    popular: true,
    description: "Your complete step-by-step career plan.",
    features: [
      "Everything in Snapshot",
      "Personalised 5-year roadmap",
      "Degree & college shortlist",
      "Internship & skill milestones",
      "Progress tracker",
      "Share with parents",
    ],
    cta: "Get roadmap",
    href: "/language",
  },
  {
    id: "premium",
    name: "Parent Premium",
    price: "₹999",
    period: "one-time",
    icon: <Crown className="h-5 w-5" />,
    tone: "mint" as const,
    description: "Full intelligence for parents & families.",
    features: [
      "Everything in Roadmap",
      "Parent ROI Dashboard",
      "Scenario modeling tool",
      "College comparison engine",
      "1-on-1 counsellor chat",
      "Lifetime access to updates",
    ],
    cta: "Go premium",
    href: "/language",
  },
];

const FEATURES = [
  { label: "AI Career Assessment", free: true, snapshot: true, roadmap: true, premium: true },
  { label: "Top 5 Career Matches", free: true, snapshot: true, roadmap: true, premium: true },
  { label: "PDF Report", free: false, snapshot: true, roadmap: true, premium: true },
  { label: "Salary & Demand Analysis", free: false, snapshot: true, roadmap: true, premium: true },
  { label: "AI Automation Risk Score", free: false, snapshot: true, roadmap: true, premium: true },
  { label: "Top Companies & Degrees", free: false, snapshot: true, roadmap: true, premium: true },
  { label: "5-Year Career Roadmap", free: false, snapshot: false, roadmap: true, premium: true },
  { label: "College Shortlist", free: false, snapshot: false, roadmap: true, premium: true },
  { label: "Skill & Internship Milestones", free: false, snapshot: false, roadmap: true, premium: true },
  { label: "Progress Tracker", free: false, snapshot: false, roadmap: true, premium: true },
  { label: "Share with Parents", free: false, snapshot: false, roadmap: true, premium: true },
  { label: "Parent ROI Dashboard", free: false, snapshot: false, roadmap: false, premium: true },
  { label: "Scenario Modeling", free: false, snapshot: false, roadmap: false, premium: true },
  { label: "College Comparison Engine", free: false, snapshot: false, roadmap: false, premium: true },
  { label: "1-on-1 Counsellor Chat", free: false, snapshot: false, roadmap: false, premium: true },
  { label: "Lifetime Updates", free: false, snapshot: false, roadmap: false, premium: true },
];

function Pricing() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-hero text-white shadow-glow">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-base font-semibold tracking-tight">Disha</span>
          </Link>
          <Link to="/login" className="text-sm font-medium text-primary hover:underline">
            Log in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 pt-10 pb-8">
        <div className="mx-auto max-w-md text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-mint" />
            100% secure payment
          </div>
          <h1 className="mt-4 text-balance text-3xl font-bold leading-tight tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="mt-3 text-balance text-base text-muted-foreground">
            Start free. Upgrade once you see the value. No subscriptions, no hidden fees.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="px-4 pb-6">
        <div className="mx-auto max-w-md space-y-4">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="bg-muted/40 px-4 py-10">
        <div className="mx-auto max-w-md">
          <h2 className="text-center text-lg font-bold tracking-tight">Feature comparison</h2>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Everything you get, plan by plan.
          </p>

          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            {/* Table header */}
            <div className="grid grid-cols-5 gap-1 border-b border-border bg-muted px-3 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <div className="text-left">Feature</div>
              <div>Free</div>
              <div>₹99</div>
              <div className="text-primary">₹299</div>
              <div>₹999</div>
            </div>

            {/* Rows */}
            {FEATURES.map((f, i) => (
              <div
                key={f.label}
                className={`grid grid-cols-5 gap-1 px-3 py-2.5 text-xs ${
                  i < FEATURES.length - 1 ? "border-b border-border/60" : ""
                }`}
              >
                <div className="flex items-center text-[11px] font-medium leading-tight text-foreground">
                  {f.label}
                </div>
                <Cell val={f.free} />
                <Cell val={f.snapshot} />
                <Cell val={f.roadmap} highlight />
                <Cell val={f.premium} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="px-4 py-10">
        <div className="mx-auto max-w-md text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Star className="h-3.5 w-3.5 text-saffron" />
            Trusted by 1,00,000+ families
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            All plans include UPI, card & net banking. 7-day money-back guarantee.
          </p>
          <Button asChild variant="outline" className="mt-4 rounded-full px-6">
            <Link to="/">
              Back to home <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

function PlanCard({ plan }: { plan: (typeof PLANS)[number] }) {
  const isPopular = plan.popular;

  const iconBg =
    plan.tone === "primary"
      ? "bg-gradient-primary text-white"
      : plan.tone === "saffron"
      ? "bg-gradient-saffron text-white"
      : plan.tone === "mint"
      ? "bg-gradient-mint text-mint-foreground"
      : "bg-muted text-muted-foreground";

  const borderClass = isPopular
    ? "border-primary/40 shadow-glow"
    : "border-border shadow-card";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-card p-5 ${borderClass} ${
        isPopular ? "ring-1 ring-primary/20" : ""
      }`}
    >
      {isPopular && (
        <div className="absolute right-0 top-0 rounded-bl-xl bg-gradient-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          Most Popular
        </div>
      )}

      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
        >
          {plan.icon}
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold">{plan.name}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{plan.description}</div>
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
        <span className="text-xs text-muted-foreground">{plan.period}</span>
      </div>

      <ul className="mt-4 space-y-2">
        {plan.features.map((feat) => (
          <li key={feat} className="flex items-start gap-2 text-xs text-foreground">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mint" />
            {feat}
          </li>
        ))}
      </ul>

      {plan.id === "free" ? (
        <Button asChild className="mt-5 h-10 w-full text-sm font-semibold" variant="outline">
          <Link to={plan.href}>{plan.cta} <ArrowRight className="ml-1 h-4 w-4" /></Link>
        </Button>
      ) : (
        <PaidPlanCta planId={plan.id as "snapshot" | "roadmap" | "premium"} label={plan.cta} popular={!!isPopular} tone={plan.tone} />
      )}
    </div>
  );
}

function Cell({ val, highlight }: { val: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-center">
      {val ? (
        <div
          className={`flex h-5 w-5 items-center justify-center rounded-full ${
            highlight ? "bg-primary/15" : "bg-mint/15"
          }`}
        >
          <Check className={`h-3 w-3 ${highlight ? "text-primary" : "text-mint"}`} />
        </div>
      ) : (
        <span className="text-muted-foreground/30 text-lg leading-none">—</span>
      )}
    </div>
  );
}

function PaidPlanCta({ planId, label, popular, tone }: { planId: "snapshot" | "roadmap" | "premium"; label: string; popular: boolean; tone: string }) {
  const [open, setOpen] = React.useState(false);
  const cls = popular
    ? "bg-gradient-hero text-white shadow-glow hover:opacity-95"
    : tone === "saffron"
    ? "bg-gradient-saffron text-white hover:opacity-95"
    : tone === "mint"
    ? "bg-gradient-mint text-mint-foreground hover:opacity-95"
    : "";
  return (
    <>
      <Button onClick={() => setOpen(true)} className={`mt-5 h-10 w-full text-sm font-semibold ${cls}`}>
        {label} <ArrowRight className="ml-1 h-4 w-4" />
      </Button>
      <CheckoutModal open={open} onOpenChange={setOpen} planId={planId} triggerSource="pricing_page" />
    </>
  );
}
