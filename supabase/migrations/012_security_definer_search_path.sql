-- ============================================================
-- Migration 012: Pin search_path on SECURITY DEFINER functions
-- ============================================================
-- validate_coupon, redeem_coupon (009) and create_order (010) are all
-- SECURITY DEFINER functions that referenced `orders`/`coupons`
-- unqualified, relying on the calling session's search_path to
-- resolve them to `public`. SECURITY DEFINER functions run with the
-- owner's privileges but do NOT get a fixed search_path unless one is
-- set explicitly — they inherit whatever the caller's session
-- search_path is at execution time. That's exactly what caused
-- `relation "orders" does not exist` when create_order() ran via
-- rpc(): the function itself was found and invoked fine, but the
-- unqualified `orders` inside its body couldn't be resolved. This is
-- also Postgres's own documented best practice for SECURITY DEFINER
-- functions (pin search_path to avoid both this failure mode and
-- search-path-hijacking attacks).
--
-- Fix: add `SET search_path = public` to all three functions and
-- schema-qualify every table reference inside them, as belt-and-
-- suspenders. Redefines only these three — is_admin()/handle_new_user()
-- aren't reported broken and are out of scope.

CREATE OR REPLACE FUNCTION validate_coupon(p_code text)
RETURNS TABLE(valid boolean, discount_type text, discount_value numeric, error text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  c public.coupons%ROWTYPE;
BEGIN
  SELECT * INTO c FROM public.coupons WHERE code = upper(trim(p_code));

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::text, NULL::numeric, 'not_found'; RETURN;
  END IF;
  IF NOT c.active THEN
    RETURN QUERY SELECT false, NULL::text, NULL::numeric, 'inactive'; RETURN;
  END IF;
  IF c.valid_from IS NOT NULL AND now() < c.valid_from THEN
    RETURN QUERY SELECT false, NULL::text, NULL::numeric, 'not_yet_valid'; RETURN;
  END IF;
  IF c.valid_until IS NOT NULL AND now() > c.valid_until THEN
    RETURN QUERY SELECT false, NULL::text, NULL::numeric, 'expired'; RETURN;
  END IF;
  IF c.max_uses IS NOT NULL AND c.times_used >= c.max_uses THEN
    RETURN QUERY SELECT false, NULL::text, NULL::numeric, 'max_uses_reached'; RETURN;
  END IF;

  RETURN QUERY SELECT true, c.discount_type, c.discount_value, NULL::text;
END;
$$;

CREATE OR REPLACE FUNCTION redeem_coupon(p_code text)
RETURNS TABLE(success boolean, discount_type text, discount_value numeric, error text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  c public.coupons%ROWTYPE;
BEGIN
  SELECT * INTO c FROM public.coupons WHERE code = upper(trim(p_code)) FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::text, NULL::numeric, 'not_found'; RETURN;
  END IF;
  IF NOT c.active
     OR (c.valid_from  IS NOT NULL AND now() < c.valid_from)
     OR (c.valid_until IS NOT NULL AND now() > c.valid_until)
     OR (c.max_uses    IS NOT NULL AND c.times_used >= c.max_uses)
  THEN
    RETURN QUERY SELECT false, NULL::text, NULL::numeric, 'invalid'; RETURN;
  END IF;

  UPDATE public.coupons SET times_used = times_used + 1 WHERE id = c.id;

  RETURN QUERY SELECT true, c.discount_type, c.discount_value, NULL::text;
END;
$$;

CREATE OR REPLACE FUNCTION create_order(
  p_customer_name    text,
  p_customer_phone   text,
  p_customer_email   text,
  p_delivery_method  text,
  p_delivery_address text,
  p_delivery_notes   text,
  p_logo_url         text,
  p_special_requests text,
  p_items            jsonb,
  p_total_amount     numeric,
  p_coupon_code      text,
  p_discount_amount  numeric
)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_order_number text;
BEGIN
  INSERT INTO public.orders (
    order_number, customer_name, customer_phone, customer_email,
    delivery_method, delivery_address, delivery_notes, logo_url,
    special_requests, items, total_amount, coupon_code, discount_amount,
    status
  ) VALUES (
    '', p_customer_name, p_customer_phone, p_customer_email,
    p_delivery_method, p_delivery_address, p_delivery_notes, p_logo_url,
    p_special_requests, p_items, p_total_amount, p_coupon_code, p_discount_amount,
    'pending'
  )
  RETURNING order_number INTO v_order_number;

  RETURN v_order_number;
END;
$$;

GRANT EXECUTE ON FUNCTION validate_coupon(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION redeem_coupon(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_order(
  text, text, text, text, text, text, text, text, jsonb, numeric, text, numeric
) TO anon, authenticated;
