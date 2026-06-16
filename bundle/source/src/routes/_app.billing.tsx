import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Flame, Trophy, Gift, Copy, MessageCircle, Calendar, Sparkles, Crown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getMyEntitlement, getStreak, pingStreak, getOrCreateReferral,
  listCounsellorSessions, scheduleCounsellor,
} from "@/lib/billing.functions";
import { CheckoutModal } from "@/components/paywall/checkout-modal";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/billing")({
  head: () => ({ meta: [{ title: "My Plan & Rewards — Disha" }] }),
  component: BillingHub,
});

function BillingHub() {
  const ent = useServerFn(getMyEntitlement);
  const streak = useServerFn(getStreak);
  const ping = useServerFn(pingStreak);
  const ref = useServerFn(getOrCreateReferral);
  const listSess = useServerFn(listCounsellorSessions);
  const schedSess = useServerFn(scheduleCounsellor);

  const entQ = useQuery({ queryKey: ["entitlement"], queryFn: () => ent() });
  const streakQ = useQuery({ queryKey: ["streak"], queryFn: () => streak() });
  const refQ = useQuery({ queryKey: ["referral"], queryFn: () => ref() });
  const sessQ = useQuery({ queryKey: ["counsellor"], queryFn: () => listSess() });

  // ping streak on mount
  React.useEffect(() => { ping().catch(() => {}); }, [ping]);

  const tier = entQ.data?.tier ?? 0;
  const planName = (entQ.data as { plan?: { name?: string } } | undefined)?.plan?.name ?? "Free";

  const [upgradeOpen, setUpgradeOpen] = React.useState(false);
  const [upgradePlan, setUpgradePlan] = React.useState<"snapshot" | "roadmap" | "premium">("roadmap");
  function openUpgrade(p: "snapshot" | "roadmap" | "premium") { setUpgradePlan(p); setUpgradeOpen(true); }

  const [topic, setTopic] = React.useState("");
  const [when, setWhen] = React.useState("");
  const sched = useMutation({
    mutationFn: () => schedSess({ data: { scheduledFor: new Date(when).toISOString(), topic } }),
    onSuccess: () => { toast.success("Session booked!"); setTopic(""); setWhen(""); sessQ.refetch(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not book"),
  });

  function copyRef() {
    const code = refQ.data?.code;
    if (!code) return;
    const url = `${window.location.origin}/pricing?ref=${code}`;
    navigator.clipboard.writeText(url);
    toast.success("Referral link copied!");
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">My Plan</div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Plan & rewards</h1>
      </div>

      {/* Current plan */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="bg-gradient-hero p-5 text-white">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-90">
            <Crown className="h-3.5 w-3.5" /> Current plan
          </div>
          <div className="mt-1 text-2xl font-bold">{planName}</div>
          <div className="text-sm opacity-90">Tier {tier} of 3</div>
        </div>
        {tier < 3 && (
          <div className="space-y-2 p-4">
            {tier < 1 && (
              <UpgradeRow price={99} title="Career Report" sub="Full PDF + salary, demand, AI risk" onClick={() => openUpgrade("snapshot")} />
            )}
            {tier < 2 && (
              <UpgradeRow price={299} title="Career Roadmap" sub="5-year plan + colleges + milestones" highlight onClick={() => openUpgrade("roadmap")} />
            )}
            {tier < 3 && (
              <UpgradeRow price={999} title="Premium Guidance" sub="Parent dashboard + 1-on-1 counsellor" onClick={() => openUpgrade("premium")} />
            )}
          </div>
        )}
      </section>

      {/* Streak */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Daily streak</div>
            <div className="mt-1 flex items-center gap-2">
              <Flame className="h-6 w-6 text-saffron" />
              <span className="text-3xl font-bold">{streakQ.data?.current_streak ?? 0}</span>
              <span className="text-sm text-muted-foreground">days</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
              <Trophy className="h-3 w-3" /> Best {streakQ.data?.longest_streak ?? 0}
            </div>
            <div className="mt-1 rounded-full bg-mint/15 px-2 py-0.5 text-xs font-bold text-mint-foreground">
              {streakQ.data?.total_xp ?? 0} XP
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Open Disha every day to keep your streak alive and earn bonus XP.
        </p>
      </section>

      {/* Referrals */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-primary" />
          <div className="text-sm font-bold">Refer a friend, get ₹100</div>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Your friend gets ₹100 off any paid plan. You earn ₹100 credit toward your next upgrade.
        </p>
        <div className="mt-3 flex gap-2">
          <Input readOnly value={refQ.data?.code ?? "Loading…"} className="font-mono text-sm" />
          <Button onClick={copyRef} className="bg-gradient-hero text-white">
            <Copy className="mr-1 h-4 w-4" /> Copy
          </Button>
        </div>
      </section>

      {/* Monthly re-scan */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-mint-foreground" />
          <div className="text-sm font-bold">Monthly career re-scan</div>
          {tier < 3 && <span className="ml-auto rounded-full bg-saffron/15 px-2 py-0.5 text-[10px] font-bold text-saffron-foreground">PREMIUM</span>}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          We refresh your report monthly with updated salary, demand and AI-risk data — so your plan stays current.
        </p>
        {tier < 3 && (
          <Button variant="outline" className="mt-3 w-full" onClick={() => openUpgrade("premium")}>
            Unlock with Premium
          </Button>
        )}
      </section>

      {/* Counsellor */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" />
          <div className="text-sm font-bold">1-on-1 counsellor sessions</div>
          {tier < 3 && <span className="ml-auto rounded-full bg-saffron/15 px-2 py-0.5 text-[10px] font-bold text-saffron-foreground">PREMIUM</span>}
        </div>
        {tier >= 3 ? (
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
              <Input placeholder="Topic (optional)" value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>
            <Button onClick={() => sched.mutate()} disabled={!when || sched.isPending} className="w-full bg-gradient-hero text-white">
              <Calendar className="mr-1 h-4 w-4" /> Book session
            </Button>
            {sessQ.data && sessQ.data.length > 0 && (
              <ul className="space-y-1.5 text-xs">
                {sessQ.data.map((s) => (
                  <li key={s.id} className="flex items-center justify-between rounded-lg border border-border p-2">
                    <span>{new Date(s.scheduled_for).toLocaleString()}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase">{s.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <>
            <p className="mt-1 text-xs text-muted-foreground">Book 30-min chats with certified career counsellors.</p>
            <Button variant="outline" className="mt-3 w-full" onClick={() => openUpgrade("premium")}>
              <Sparkles className="mr-1 h-4 w-4" /> Unlock with Premium
            </Button>
          </>
        )}
      </section>

      <CheckoutModal open={upgradeOpen} onOpenChange={setUpgradeOpen} planId={upgradePlan} triggerSource="billing_hub" />
    </div>
  );
}

function UpgradeRow({ price, title, sub, highlight, onClick }: { price: number; title: string; sub: string; highlight?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition hover:bg-muted/50 ${
        highlight ? "border-primary/40 bg-primary/5" : "border-border"
      }`}
    >
      <div>
        <div className="text-sm font-bold">{title}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
      <div className="rounded-full bg-gradient-hero px-3 py-1.5 text-xs font-bold text-white">₹{price}</div>
    </button>
  );
}
