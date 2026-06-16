import * as React from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckoutModal } from "./checkout-modal";

type PlanId = "snapshot" | "roadmap" | "premium";

export function PaywallLock({
  children, requiredPlan, triggerSource, title = "Premium feature", subtitle,
}: {
  children: React.ReactNode;
  requiredPlan: PlanId;
  triggerSource: string;
  title?: string;
  subtitle?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const price = requiredPlan === "snapshot" ? 99 : requiredPlan === "roadmap" ? 299 : 999;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border">
      <div className="pointer-events-none select-none blur-[3px] opacity-40">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-background/40 to-background/95 p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-hero text-white shadow-glow">
          <Lock className="h-5 w-5" />
        </div>
        <h3 className="mt-3 text-base font-bold">{title}</h3>
        {subtitle && <p className="mt-1 max-w-xs text-xs text-muted-foreground">{subtitle}</p>}
        <Button
          className="mt-4 h-10 bg-gradient-hero px-5 text-sm font-semibold text-white shadow-glow"
          onClick={() => setOpen(true)}
        >
          Unlock for ₹{price}
        </Button>
      </div>
      <CheckoutModal open={open} onOpenChange={setOpen} planId={requiredPlan} triggerSource={triggerSource} />
    </div>
  );
}
