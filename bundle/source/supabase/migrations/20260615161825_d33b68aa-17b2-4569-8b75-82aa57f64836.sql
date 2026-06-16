
-- REFERRALS: tighten SELECT
DROP POLICY IF EXISTS "Anyone can validate codes" ON public.referrals;
DROP POLICY IF EXISTS "Users view own referrals" ON public.referrals;
CREATE POLICY "Referrer or redeemer can view own referral rows"
ON public.referrals FOR SELECT TO authenticated
USING (auth.uid() = referrer_id OR auth.uid() = redeemed_by);

-- Safe code validation function (no PII exposure)
CREATE OR REPLACE FUNCTION public.validate_referral_code(_code text)
RETURNS TABLE(is_valid boolean, credit_inr integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (r.id IS NOT NULL AND r.status = 'pending' AND r.redeemed_by IS NULL) AS is_valid,
    COALESCE(r.credit_inr, 0) AS credit_inr
  FROM public.referrals r
  WHERE r.code = _code
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.validate_referral_code(text) TO anon, authenticated;

-- REFERRALS: tighten UPDATE — only the referrer may modify; redemption stays server-side
DROP POLICY IF EXISTS "Users update redeemed referrals" ON public.referrals;
DROP POLICY IF EXISTS "Redeemers update referrals" ON public.referrals;
DROP POLICY IF EXISTS "Users update own referrals" ON public.referrals;
CREATE POLICY "Referrer can update own referral"
ON public.referrals FOR UPDATE TO authenticated
USING (auth.uid() = referrer_id)
WITH CHECK (auth.uid() = referrer_id);

-- ORDERS: restrict UPDATE to pending status only
DROP POLICY IF EXISTS "Users update own pending orders" ON public.orders;
CREATE POLICY "Users update own pending orders"
ON public.orders FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- UPGRADE_EVENTS: remove anon insert path
DROP POLICY IF EXISTS "Users log own events" ON public.upgrade_events;
CREATE POLICY "Authenticated users log own events"
ON public.upgrade_events FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);
