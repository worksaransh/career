import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type PlanId = "free" | "snapshot" | "roadmap" | "premium";

// ---------- Plans + Entitlement ----------
export const getPlans = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("plans").select("*").eq("is_active", true).order("tier");
  if (error) throw error;
  return data ?? [];
});

export const getMyEntitlement = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("entitlements")
      .select("*, plan:plans(*)")
      .eq("user_id", context.userId)
      .maybeSingle();
    return data ?? { user_id: context.userId, plan_id: "free", tier: 0, plan: null };
  });

// ---------- Mock checkout ----------
export const startCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { planId: PlanId; triggerSource?: string; referralCode?: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: plan, error: pErr } = await context.supabase
      .from("plans").select("*").eq("id", data.planId).single();
    if (pErr || !plan) throw new Error("Plan not found");

    let discount = 0;
    if (data.referralCode) {
      const { data: ref } = await context.supabase
        .from("referrals").select("*").eq("code", data.referralCode).eq("status", "active").maybeSingle();
      if (ref && ref.referrer_id !== context.userId) discount = Math.min(ref.credit_inr, plan.price_inr);
    }

    const idempotencyKey = `${context.userId}-${data.planId}-${Date.now()}`;
    const { data: order, error } = await context.supabase.from("orders").insert({
      user_id: context.userId,
      plan_id: data.planId,
      amount_inr: plan.price_inr - discount,
      discount_inr: discount,
      status: "pending",
      trigger_source: data.triggerSource ?? "pricing_page",
      referral_code: data.referralCode ?? null,
      idempotency_key: idempotencyKey,
    }).select().single();
    if (error) throw error;

    await context.supabase.from("upgrade_events").insert({
      user_id: context.userId, trigger_source: data.triggerSource ?? "pricing_page",
      plan_id: data.planId, event_type: "checkout_started",
      metadata: { order_id: order.id, amount_inr: order.amount_inr },
    });

    // queue abandoned-cart drip for 1h later
    await context.supabase.from("email_drips").insert({
      user_id: context.userId, drip_type: "abandoned_cart", step: 1,
      send_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      payload: { plan_id: data.planId, order_id: order.id },
    });

    return order;
  });

export const completeMockPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { orderId: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: order, error } = await context.supabase.rpc("mock_complete_order", { _order_id: data.orderId });
    if (error) throw error;

    // redeem referral if any
    const orderRow = Array.isArray(order) ? order[0] : order;
    if (orderRow?.referral_code) {
      await context.supabase.from("referrals")
        .update({ status: "redeemed", redeemed_by: context.userId, redeemed_at: new Date().toISOString() })
        .eq("code", orderRow.referral_code).eq("status", "active");
    }
    return orderRow;
  });

export const cancelOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { orderId: string; reason?: string }) => d)
  .handler(async ({ data, context }) => {
    await context.supabase.from("orders").update({ status: "failed" })
      .eq("id", data.orderId).eq("user_id", context.userId).eq("status", "pending");
    await context.supabase.from("upgrade_events").insert({
      user_id: context.userId, trigger_source: "checkout", plan_id: null,
      event_type: "dismissed", metadata: { order_id: data.orderId, reason: data.reason ?? "user_cancelled" },
    });
    return { ok: true };
  });

// ---------- Funnel ----------
export const logUpgradeEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { triggerSource: string; planId?: PlanId; eventType: string; metadata?: Record<string, string | number | boolean | null> }) => d)
  .handler(async ({ data, context }) => {
    await context.supabase.from("upgrade_events").insert({
      user_id: context.userId,
      trigger_source: data.triggerSource,
      plan_id: data.planId ?? null,
      event_type: data.eventType,
      metadata: (data.metadata ?? {}) as never,
    });
    return { ok: true };
  });

// ---------- Streaks ----------
export const pingStreak = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const today = new Date().toISOString().slice(0, 10);
    const { data: existing } = await context.supabase
      .from("streaks").select("*").eq("user_id", context.userId).maybeSingle();

    if (!existing) {
      const { data } = await context.supabase.from("streaks").insert({
        user_id: context.userId, current_streak: 1, longest_streak: 1,
        last_active_date: today, total_xp: 10,
      }).select().single();
      return data;
    }

    if (existing.last_active_date === today) return existing;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const newStreak = existing.last_active_date === yesterday ? existing.current_streak + 1 : 1;
    const { data } = await context.supabase.from("streaks").update({
      current_streak: newStreak,
      longest_streak: Math.max(newStreak, existing.longest_streak),
      last_active_date: today,
      total_xp: existing.total_xp + 10 + newStreak,
    }).eq("user_id", context.userId).select().single();
    return data;
  });

export const getStreak = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("streaks").select("*").eq("user_id", context.userId).maybeSingle();
    return data ?? { current_streak: 0, longest_streak: 0, total_xp: 0, last_active_date: null };
  });

// ---------- Referrals ----------
export const getOrCreateReferral = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: existing } = await context.supabase
      .from("referrals").select("*").eq("referrer_id", context.userId).eq("status", "active").maybeSingle();
    if (existing) return existing;
    const code = `DISHA${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const { data } = await context.supabase.from("referrals")
      .insert({ referrer_id: context.userId, code, credit_inr: 100 }).select().single();
    return data;
  });

// ---------- Counsellor ----------
export const scheduleCounsellor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { scheduledFor: string; topic?: string }) => d)
  .handler(async ({ data, context }) => {
    // gate to premium
    const { data: ent } = await context.supabase.from("entitlements").select("tier").eq("user_id", context.userId).maybeSingle();
    if (!ent || ent.tier < 3) throw new Error("Premium plan required");
    const { data: row, error } = await context.supabase.from("counsellor_sessions").insert({
      user_id: context.userId, scheduled_for: data.scheduledFor, topic: data.topic ?? null,
    }).select().single();
    if (error) throw error;
    return row;
  });

export const listCounsellorSessions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("counsellor_sessions").select("*").eq("user_id", context.userId)
      .order("scheduled_for", { ascending: true });
    return data ?? [];
  });
