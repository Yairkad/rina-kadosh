-- ============================================================
-- Migration 008: Coupon codes
-- ============================================================
-- Admin-managed discount codes applied at checkout. The `coupons` table
-- stays admin-only (RLS + no anon grant, matching products/bundles/
-- materials) — customers never query it directly. Instead two
-- SECURITY DEFINER functions (same pattern as is_admin()) are the only
-- anon-facing surface: validate_coupon() for a checkout-time preview,
-- redeem_coupon() to atomically consume a use at order submission.
-- This avoids ever exposing the coupons table (codes/values/usage
-- counts) to anon via the REST API.

CREATE TABLE IF NOT EXISTS coupons (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code           text NOT NULL UNIQUE,
  discount_type  text NOT NULL CHECK (discount_type IN ('percent', 'amount')),
  discount_value numeric(10,2) NOT NULL CHECK (discount_value > 0),
  max_uses       integer CHECK (max_uses > 0),
  times_used     integer NOT NULL DEFAULT 0,
  valid_from     timestamptz,
  valid_until    timestamptz,
  active         boolean NOT NULL DEFAULT true,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_coupons_updated_at ON coupons;
CREATE TRIGGER trg_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount numeric(10,2) NOT NULL DEFAULT 0;

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "coupons: admin all" ON coupons;
CREATE POLICY "coupons: admin all" ON coupons
  FOR ALL TO authenticated USING (is_admin());

-- ============================================================
-- validate_coupon: read-only checkout-time preview, no side effects
-- ============================================================
CREATE OR REPLACE FUNCTION validate_coupon(p_code text)
RETURNS TABLE(valid boolean, discount_type text, discount_value numeric, error text)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  c coupons%ROWTYPE;
BEGIN
  SELECT * INTO c FROM coupons WHERE code = upper(trim(p_code));

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

GRANT EXECUTE ON FUNCTION validate_coupon(text) TO anon, authenticated;

-- ============================================================
-- redeem_coupon: re-validates and atomically consumes one use.
-- Only ever called server-side from submitOrder at final submission.
-- ============================================================
CREATE OR REPLACE FUNCTION redeem_coupon(p_code text)
RETURNS TABLE(success boolean, discount_type text, discount_value numeric, error text)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  c coupons%ROWTYPE;
BEGIN
  SELECT * INTO c FROM coupons WHERE code = upper(trim(p_code)) FOR UPDATE;

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

  UPDATE coupons SET times_used = times_used + 1 WHERE id = c.id;

  RETURN QUERY SELECT true, c.discount_type, c.discount_value, NULL::text;
END;
$$;

GRANT EXECUTE ON FUNCTION redeem_coupon(text) TO anon, authenticated;
