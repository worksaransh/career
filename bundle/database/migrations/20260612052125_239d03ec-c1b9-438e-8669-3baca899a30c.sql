
-- =========================================================
-- PLANS catalog (public read)
-- =========================================================
CREATE TABLE public.plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  tier int NOT NULL,
  price_inr int NOT NULL,
  tagline text,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plans TO anon, authenticated;
GRANT ALL ON public.plans TO service_role;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans are public" ON public.plans FOR SELECT USING (true);
CREATE POLICY "Admins manage plans" ON public.plans FOR ALL
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

INSERT INTO public.plans (id, name, tier, price_inr, tagline, features) VALUES
  ('free',     'Free',              0,   0,   'Try Disha with no commitment',          '["15-min AI assessment","Top 5 career matches","Basic overview"]'::jsonb),
  ('snapshot', 'Career Report',     1,   99,  'Full report of your best-fit career',   '["PDF report","Salary & demand","AI risk score","Top companies"]'::jsonb),
  ('roadmap',  'Career Roadmap',    2,   299, '5-year step-by-step plan',              '["Personalised 5-year roadmap","College shortlist","Milestones","Progress tracker","Share with parents"]'::jsonb),
  ('premium',  'Premium Guidance',  3,   999, 'Full intelligence for families',        '["Parent ROI dashboard","Scenario modeling","College comparison","1-on-1 counsellor chat","Lifetime updates"]'::jsonb);

-- =========================================================
-- ORDERS (mock checkout)
-- =========================================================
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id text NOT NULL REFERENCES public.plans(id),
  amount_inr int NOT NULL,
  discount_inr int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending', -- pending | paid | failed | refunded
  trigger_source text,                     -- post_assessment | locked_roadmap | parent_share | exit_intent | pricing_page
  idempotency_key text UNIQUE,
  referral_code text,
  mock_payment_method text DEFAULT 'mock_upi',
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Users create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own pending orders" ON public.orders FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage all orders" ON public.orders FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX orders_user_idx ON public.orders(user_id, created_at DESC);

-- =========================================================
-- ENTITLEMENTS (what the user has unlocked)
-- =========================================================
CREATE TABLE public.entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id text NOT NULL REFERENCES public.plans(id) DEFAULT 'free',
  tier int NOT NULL DEFAULT 0,
  source_order_id uuid REFERENCES public.orders(id),
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.entitlements TO authenticated;
GRANT ALL ON public.entitlements TO service_role;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own entitlement" ON public.entitlements FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Admins manage entitlements" ON public.entitlements FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- =========================================================
-- UPGRADE EVENTS (conversion funnel)
-- =========================================================
CREATE TABLE public.upgrade_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  trigger_source text NOT NULL,  -- post_assessment | locked_roadmap | parent_share | exit_intent | pricing_page
  plan_id text REFERENCES public.plans(id),
  event_type text NOT NULL,      -- view | click | checkout_started | paid | dismissed
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.upgrade_events TO authenticated;
GRANT ALL ON public.upgrade_events TO service_role;
ALTER TABLE public.upgrade_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users log own events" ON public.upgrade_events FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Admins read all events" ON public.upgrade_events FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Users read own events" ON public.upgrade_events FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX upgrade_events_trigger_idx ON public.upgrade_events(trigger_source, created_at DESC);

-- =========================================================
-- REFERRALS
-- =========================================================
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  redeemed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  redeemed_at timestamptz,
  credit_inr int NOT NULL DEFAULT 100,
  status text NOT NULL DEFAULT 'active', -- active | redeemed | expired
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = redeemed_by OR public.is_admin(auth.uid()));
CREATE POLICY "Users create own referrals" ON public.referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);
CREATE POLICY "Anyone can validate codes" ON public.referrals FOR SELECT USING (true);
CREATE POLICY "Users redeem referrals" ON public.referrals FOR UPDATE USING (auth.uid() = redeemed_by OR auth.uid() = referrer_id);

-- =========================================================
-- STREAKS
-- =========================================================
CREATE TABLE public.streaks (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak int NOT NULL DEFAULT 0,
  longest_streak int NOT NULL DEFAULT 0,
  last_active_date date,
  total_xp int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.streaks TO authenticated;
GRANT ALL ON public.streaks TO service_role;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own streak" ON public.streaks FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Users update own streak" ON public.streaks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========================================================
-- COUNSELLOR SESSIONS (premium)
-- =========================================================
CREATE TABLE public.counsellor_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_for timestamptz NOT NULL,
  topic text,
  status text NOT NULL DEFAULT 'scheduled', -- scheduled | completed | cancelled
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.counsellor_sessions TO authenticated;
GRANT ALL ON public.counsellor_sessions TO service_role;
ALTER TABLE public.counsellor_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sessions" ON public.counsellor_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins see all sessions" ON public.counsellor_sessions FOR SELECT USING (public.is_admin(auth.uid()));

-- =========================================================
-- EMAIL DRIPS (abandoned cart / re-engagement)
-- =========================================================
CREATE TABLE public.email_drips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  drip_type text NOT NULL,           -- abandoned_cart | monthly_rescan | re_engagement
  step int NOT NULL DEFAULT 0,
  send_at timestamptz NOT NULL,
  sent_at timestamptz,
  status text NOT NULL DEFAULT 'queued',  -- queued | sent | cancelled
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.email_drips TO authenticated;
GRANT ALL ON public.email_drips TO service_role;
ALTER TABLE public.email_drips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own drips" ON public.email_drips FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Admins manage drips" ON public.email_drips FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- =========================================================
-- updated_at triggers
-- =========================================================
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER entitlements_updated_at BEFORE UPDATE ON public.entitlements FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER counsellor_sessions_updated_at BEFORE UPDATE ON public.counsellor_sessions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER streaks_updated_at BEFORE UPDATE ON public.streaks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- Helper: mock-pay an order + grant entitlement atomically
-- =========================================================
CREATE OR REPLACE FUNCTION public.mock_complete_order(_order_id uuid)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  o public.orders;
  p public.plans;
BEGIN
  SELECT * INTO o FROM public.orders WHERE id = _order_id AND user_id = auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;
  IF o.status = 'paid' THEN RETURN o; END IF;

  SELECT * INTO p FROM public.plans WHERE id = o.plan_id;

  UPDATE public.orders SET status='paid', paid_at=now() WHERE id=_order_id RETURNING * INTO o;

  INSERT INTO public.entitlements (user_id, plan_id, tier, source_order_id)
  VALUES (o.user_id, p.id, p.tier, o.id)
  ON CONFLICT (user_id) DO UPDATE
    SET plan_id = EXCLUDED.plan_id,
        tier = GREATEST(public.entitlements.tier, EXCLUDED.tier),
        source_order_id = EXCLUDED.source_order_id,
        updated_at = now();

  INSERT INTO public.upgrade_events (user_id, trigger_source, plan_id, event_type, metadata)
  VALUES (o.user_id, COALESCE(o.trigger_source, 'pricing_page'), p.id, 'paid',
          jsonb_build_object('amount_inr', o.amount_inr, 'order_id', o.id));

  -- cancel any queued abandoned-cart drips for this plan
  UPDATE public.email_drips SET status='cancelled'
    WHERE user_id = o.user_id AND drip_type='abandoned_cart' AND status='queued';

  RETURN o;
END;
$$;
GRANT EXECUTE ON FUNCTION public.mock_complete_order(uuid) TO authenticated;
