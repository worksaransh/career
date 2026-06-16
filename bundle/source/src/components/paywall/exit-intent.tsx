import * as React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";
import { CheckoutModal } from "./checkout-modal";

const DISMISS_KEY = "exit_intent_dismissed_at";

export function ExitIntentModal() {
  const [open, setOpen] = React.useState(false);
  const [checkout, setCheckout] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const last = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (Date.now() - last < 1000 * 60 * 60 * 24) return; // 24h cooldown

    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setOpen(true);
        localStorage.setItem(DISMISS_KEY, String(Date.now()));
        document.removeEventListener("mouseleave", onLeave);
      }
    };
    const t = setTimeout(() => document.addEventListener("mouseleave", onLeave), 10_000);
    return () => { clearTimeout(t); document.removeEventListener("mouseleave", onLeave); };
  }, []);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm p-0 overflow-hidden">
          <button onClick={() => setOpen(false)} className="absolute right-3 top-3 z-10 rounded-full bg-background/80 p-1.5 text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
          <div className="bg-gradient-hero p-6 text-center text-white">
            <Sparkles className="mx-auto h-8 w-8" />
            <DialogTitle className="mt-2 text-xl">Wait — ₹100 off!</DialogTitle>
            <p className="mt-1 text-sm opacity-90">Use code <b>DISHA100</b> on any plan today.</p>
          </div>
          <div className="p-5">
            <Button
              className="h-11 w-full bg-gradient-hero text-white shadow-glow"
              onClick={() => { setOpen(false); setCheckout(true); }}
            >
              Claim my discount
            </Button>
            <button onClick={() => setOpen(false)} className="mt-2 w-full text-xs text-muted-foreground">
              No thanks
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <CheckoutModal open={checkout} onOpenChange={setCheckout} planId="roadmap" triggerSource="exit_intent" />
    </>
  );
}
