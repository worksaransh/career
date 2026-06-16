CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.mock_complete_order_internal(_order_id uuid, _user_id uuid)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  o public.orders;
  p public.plans;
BEGIN
  IF _user_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  SELECT * INTO o FROM public.orders WHERE id = _order_id AND user_id = _user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;
  IF o.status = 'paid' THEN RETURN o; END IF;
  SELECT * INTO p FROM public.plans WHERE id = o.plan_id;
  UPDATE public.orders SET status='paid', paid_at=now() WHERE id=_order_id RETURNING * INTO o;
  INSERT INTO public.entitlements (user_id, plan_id, tier, source_order_id)
  VALUES (o.user_id, p.id, p.tier, o.id)
  ON CONFLICT (user_id) DO UPDATE SET
    plan_id = EXCLUDED.plan_id,
    tier = GREATEST(public.entitlements.tier, EXCLUDED.tier),
    source_order_id = EXCLUDED.source_order_id,
    updated_at = now();
  INSERT INTO public.upgrade_events (user_id, trigger_source, plan_id, event_type, metadata)
  VALUES (o.user_id, COALESCE(o.trigger_source, 'pricing_page'), p.id, 'paid', jsonb_build_object('amount_inr', o.amount_inr, 'order_id', o.id));
  UPDATE public.email_drips SET status='cancelled' WHERE user_id=o.user_id AND drip_type='abandoned_cart' AND status='queued';
  RETURN o;
END;
$$;
REVOKE ALL ON FUNCTION private.mock_complete_order_internal(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.mock_complete_order_internal(uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.mock_complete_order(_order_id uuid)
RETURNS public.orders
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, private
AS $$ SELECT private.mock_complete_order_internal(_order_id, auth.uid()) $$;
REVOKE ALL ON FUNCTION public.mock_complete_order(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mock_complete_order(uuid) TO authenticated;