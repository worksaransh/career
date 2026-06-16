import * as React from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Lock, CheckCircle2, Smartphone, CreditCard, Building2, Tag } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { startCheckout, completeMockPayment, cancelOrder, logUpgradeEvent } from "@/lib/billing.functions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type PlanId = "snapshot" | "roadmap" | "premium";
const PLAN_META: Record<PlanId, { name: string; price: number; tagline: string }> = {
  snapshot: { name: "Career Report", price: 99, tagline: "Full personalised PDF report" },
  roadmap: { name: "Career Roadmap", price: 299, tagline: "5-year step-by-step plan" },
  premium: { name: "Premium Guidance", price: 999, tagline: "Family + 1-on-1 counsellor" },
};

export function CheckoutModal({
  open, onOpenChange, planId, triggerSource = "pricing_page", onPaid,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  planId: PlanId;
  triggerSource?: string;
  onPaid?: () => void;
}) {
  const qc = useQueryClient();
  const start = useServerFn(startCheckout);
  const complete = useServerFn(completeMockPayment);
  const cancel = useServerFn(cancelOrder);
  const logEvent = useServerFn(logUpgradeEvent);

  const [step, setStep] = React.useState<"method" | "paying" | "done">("method");
  const [method, setMethod] = React.useState<"upi" | "card" | "netbank">("upi");
  const [referral, setReferral] = React.useState("");
  const [orderId, setOrderId] = React.useState<string | null>(null);
  const [amount, setAmount] = React.useState(PLAN_META[planId].price);

  React.useEffect(() => {
    if (open) {
      setStep("method"); setOrderId(null); setAmount(PLAN_META[planId].price);
      logEvent({ data: { triggerSource, planId, eventType: "view" } }).catch(() => {});
    }
  }, [open, planId, triggerSource, logEvent]);

  const payMut = useMutation({
    mutationFn: async () => {
      const order = await start({ data: { planId, triggerSource, referralCode: referral || undefined } });
      setOrderId(order.id); setAmount(order.amount_inr); setStep("paying");
      // simulate gateway latency
      await new Promise((r) => setTimeout(r, 1500));
      return complete({ data: { orderId: order.id } });
    },
    onSuccess: () => {
      setStep("done");
      qc.invalidateQueries({ queryKey: ["entitlement"] });
      toast.success("Payment successful — your plan is unlocked!");
      onPaid?.();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Payment failed"),
  });

  async function handleClose(o: boolean) {
    if (!o && step === "method" && orderId) {
      await cancel({ data: { orderId, reason: "modal_closed" } }).catch(() => {});
    }
    onOpenChange(o);
  }

  const meta = PLAN_META[planId];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {step === "done" ? (
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-mint/15">
              <CheckCircle2 className="h-8 w-8 text-mint" />
            </div>
            <DialogTitle className="text-xl">Welcome to {meta.name}!</DialogTitle>
            <p className="mt-2 text-sm text-muted-foreground">Your plan is now active. Let's get started.</p>
            <Button className="mt-6 w-full bg-gradient-hero text-white" onClick={() => onOpenChange(false)}>
              Continue
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-gradient-hero p-5 text-white">
              <div className="text-xs uppercase tracking-wider opacity-80">Unlock</div>
              <DialogTitle className="text-xl">{meta.name}</DialogTitle>
              <div className="mt-1 text-sm opacity-90">{meta.tagline}</div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold">₹{amount}</span>
                {amount < meta.price && <span className="text-sm line-through opacity-70">₹{meta.price}</span>}
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment method</div>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: "upi", label: "UPI", icon: Smartphone },
                    { id: "card", label: "Card", icon: CreditCard },
                    { id: "netbank", label: "Net", icon: Building2 },
                  ] as const).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-medium transition",
                        method === m.id ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"
                      )}
                    >
                      <m.icon className="h-4 w-4" /> {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Tag className="h-3 w-3" /> Referral code (optional)
                </label>
                <Input value={referral} onChange={(e) => setReferral(e.target.value.toUpperCase())} placeholder="DISHA…" />
              </div>

              <Button
                onClick={() => payMut.mutate()}
                disabled={payMut.isPending || step === "paying"}
                className="h-12 w-full bg-gradient-hero text-base font-semibold text-white shadow-glow"
              >
                {payMut.isPending || step === "paying" ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing payment…</>
                ) : (
                  <><Lock className="mr-2 h-4 w-4" /> Pay ₹{amount} securely</>
                )}
              </Button>
              <p className="text-center text-[11px] text-muted-foreground">
                🔒 Mock payment for demo. No real money is charged. 7-day refund.
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
